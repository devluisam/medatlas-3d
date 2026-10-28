import "server-only";
import { z } from "zod";
import type OpenAI from "openai";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { notFound } from "../http";
import { recordStudyActivity } from "../activity";
import { aiSignal, getOpenAI, toAiError } from "./client";
import { reserveAiUsage } from "./quota";
import { contextMessage, structureContext, tutorSystemPrompt, STUDY_LEVELS, type StudyLevel } from "./prompts";

export const MAX_MESSAGE_CHARS = 2000;
const HISTORY_MESSAGES = 10;

export const ChatRequestSchema = z.object({
  message: z.string().trim().min(1, "Escreva uma pergunta.").max(MAX_MESSAGE_CHARS, `Máximo de ${MAX_MESSAGE_CHARS} caracteres.`),
  conversationId: z.string().min(10).max(40).optional(),
  structureSlug: z.string().regex(/^[a-z0-9-]+$/).max(80).optional(),
  level: z.enum(Object.keys(STUDY_LEVELS) as [StudyLevel, ...StudyLevel[]]).default("INTERMEDIATE"),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

const encoder = new TextEncoder();
const sse = (event: string, data: unknown) => encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

/**
 * Responde em Server-Sent Events:
 *   meta  {conversationId}   — antes do texto
 *   delta {text}             — pedaços da resposta
 *   done  {messageId}        — fim normal
 *   error {message}          — falha no meio do streaming
 * A pergunta é gravada antes de chamar a IA; a resposta (inteira ou parcial,
 * se o estudante cancelar) é gravada ao final.
 */
export async function streamTutorReply(userId: string, input: ChatRequest, requestSignal: AbortSignal): Promise<Response> {
  const openai = getOpenAI();

  let conversation = input.conversationId
    ? await prisma.aiConversation.findFirst({
        where: { id: input.conversationId, userId },
        select: { id: true, structureSlug: true },
      })
    : null;
  if (input.conversationId && !conversation) throw notFound("Conversa");

  const usage = await reserveAiUsage(userId, "CHAT");

  try {
    const ctx = await structureContext(conversation?.structureSlug ?? input.structureSlug);
    conversation ??= await prisma.aiConversation.create({
      data: { userId, structureSlug: ctx?.slug ?? null, title: input.message.slice(0, 80) },
      select: { id: true, structureSlug: true },
    });

    const history = await prisma.aiMessage.findMany({
      where: { conversationId: conversation.id, role: { in: ["USER", "ASSISTANT"] } },
      orderBy: { createdAt: "desc" },
      take: HISTORY_MESSAGES,
      select: { role: true, content: true },
    });
    await prisma.aiMessage.create({ data: { conversationId: conversation.id, role: "USER", content: input.message } });
    await recordStudyActivity(userId);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: tutorSystemPrompt(input.level) },
      ...(ctx ? [{ role: "system" as const, content: contextMessage(ctx.text) }] : []),
      ...history.reverse().map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
      { role: "user", content: input.message },
    ];

    const signal = aiSignal(requestSignal);
    const stream = await openai.chat.completions.create(
      {
        model: config.ai.model,
        messages,
        stream: true,
        stream_options: { include_usage: true },
        temperature: 0.4,
        max_tokens: config.ai.chatMaxTokens,
      },
      { signal }
    );

    const conversationId = conversation.id;
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let text = "";
        let tokens: number | undefined;
        let failed = false;
        controller.enqueue(sse("meta", { conversationId }));
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              text += delta;
              controller.enqueue(sse("delta", { text: delta }));
            }
            if (chunk.usage) tokens = chunk.usage.total_tokens;
          }
        } catch (error) {
          failed = true;
          if (!requestSignal.aborted) {
            controller.enqueue(sse("error", { message: toAiError(error).message }));
          }
        }
        if (text) {
          const content = failed ? `${text}\n\n_(resposta interrompida)_` : text;
          const saved = await prisma.aiMessage.create({
            data: { conversationId, role: "ASSISTANT", content, tokensUsed: tokens ?? null },
            select: { id: true },
          });
          await prisma.aiConversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
          if (!failed) controller.enqueue(sse("done", { messageId: saved.id }));
        } else if (!failed) {
          controller.enqueue(sse("error", { message: "A IA não devolveu resposta. Tente reformular a pergunta." }));
        }
        await usage.complete(tokens);
        try {
          controller.close();
        } catch {
          // o cliente já desconectou
        }
      },
      cancel() {
        // fecha a conexão com o provedor quando o navegador cancela
        stream.controller.abort();
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    await usage.release();
    throw toAiError(error);
  }
}

export async function listConversations(userId: string, structureSlug?: string) {
  return prisma.aiConversation.findMany({
    where: { userId, ...(structureSlug && { structureSlug }) },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { id: true, title: true, structureSlug: true, updatedAt: true },
  });
}

export async function getConversation(userId: string, id: string) {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      structureSlug: true,
      messages: {
        where: { role: { in: ["USER", "ASSISTANT"] } },
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });
  if (!conversation) throw notFound("Conversa");
  return conversation;
}

export async function deleteConversation(userId: string, id: string) {
  const deleted = await prisma.aiConversation.deleteMany({ where: { id, userId } });
  if (deleted.count === 0) throw notFound("Conversa");
}
