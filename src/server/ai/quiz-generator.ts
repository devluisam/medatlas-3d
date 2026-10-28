import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { difficultyLabel, systemLabel } from "@/lib/labels";
import { parseGeneratedQuestions } from "@/lib/quiz/ai-output";
import { ApiError } from "../http";
import type { CreateAttemptInput } from "../quiz";
import { aiSignal, getOpenAI, toAiError } from "./client";
import { reserveAiUsage } from "./quota";

const MAX_REFERENCE_CHARS = 6000;

/** Estruturas do atlas usadas como base da geração (e únicos vínculos aceitos). */
async function referenceStructures(input: CreateAttemptInput) {
  const where: Prisma.AnatomicalStructureWhereInput = { isPublished: true };
  if (input.structureSlug) where.slug = input.structureSlug;
  else if (input.systems.length) where.system = { in: input.systems };
  const rows = await prisma.anatomicalStructure.findMany({
    where,
    select: { id: true, slug: true, name: true, system: true, summary: true },
    orderBy: { name: "asc" },
    take: 40,
  });
  let text = "";
  for (const r of rows) {
    const line = `- [${r.slug}] ${r.name} (${systemLabel(r.system)}): ${r.summary.replace(/\s+/g, " ").slice(0, 220)}\n`;
    if (text.length + line.length > MAX_REFERENCE_CHARS) break;
    text += line;
  }
  return { rows, text };
}

/**
 * Gera questões com IA, valida uma a uma e grava as válidas como
 * AI_GENERATED do próprio usuário (não entram no banco comum).
 * Devolve os IDs na ordem de apresentação.
 */
export async function generateQuizQuestions(userId: string, input: CreateAttemptInput): Promise<string[]> {
  const openai = getOpenAI();
  const usage = await reserveAiUsage(userId, "QUIZ_GENERATION");
  const { rows, text } = await referenceStructures(input);
  if (rows.length === 0) {
    await usage.release();
    throw new ApiError("BAD_REQUEST", "Não há estruturas no atlas para os filtros escolhidos.");
  }

  const clinical = input.mode === "CLINICAL";
  const prompt = `Gere ${input.count} questões de múltipla escolha de anatomia humana, em português brasileiro.

Dificuldade: ${input.difficulty ? difficultyLabel(input.difficulty) : "variada"}
Tipo: ${clinical ? "caso clínico curto no campo \"context\" + pergunta anatômica no \"stem\"" : "questões diretas de anatomia (context = null)"}

Baseie-se nas estruturas do atlas abaixo. Em "structureSlug" use exatamente o slug entre colchetes da estrutura principal da questão.
${text}
Formato: um objeto JSON {"questions": [...]}, cada item com:
{"stem": "...", "context": "..." ou null, "structureSlug": "...", "explanation": "por que a correta está certa",
 "options": [{"text": "...", "isCorrect": true|false, "explanation": "por que esta alternativa está certa ou errada"}]} — exatamente 5 alternativas e exatamente 1 correta.

Regras: nomenclatura anatômica correta; alternativas plausíveis e distintas; sem "todas/nenhuma das anteriores"; não cite livros, provas ou anos.`;

  try {
    const response = await openai.chat.completions.create(
      {
        model: config.ai.model,
        messages: [
          { role: "system", content: "Você elabora questões de anatomia para estudantes da área da saúde. Responda apenas com JSON válido." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
        max_tokens: Math.min(4000, 450 * input.count),
        response_format: { type: "json_object" },
      },
      { signal: aiSignal() }
    );

    const content = response.choices[0]?.message?.content ?? "";
    const slugs = new Set(rows.map((r) => r.slug));
    const { valid } = parseGeneratedQuestions(content, slugs);
    if (valid.length === 0) {
      await usage.release();
      throw new ApiError("AI_FAILED", "A IA não gerou questões válidas desta vez. Tente novamente ou use o banco de questões.");
    }
    await usage.complete(response.usage?.total_tokens);

    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    const created = await prisma.$transaction(
      valid.slice(0, input.count).map((q) => {
        const structure = q.structureSlug ? bySlug.get(q.structureSlug) : undefined;
        return prisma.question.create({
          data: {
            origin: "AI_GENERATED",
            createdById: userId,
            type: clinical ? "CLINICAL_CASE" : "MULTIPLE_CHOICE",
            difficulty: input.difficulty ?? "INTERMEDIATE",
            stem: q.stem,
            context: q.context,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            tags: ["gerada-por-ia"],
            system: structure?.system ?? (input.systems.length === 1 ? input.systems[0] : null),
            structureId: structure?.id ?? null,
          },
          select: { id: true },
        });
      })
    );
    return created.map((c) => c.id);
  } catch (error) {
    if (!(error instanceof ApiError)) await usage.release();
    throw toAiError(error);
  }
}
