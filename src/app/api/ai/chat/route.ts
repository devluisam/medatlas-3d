import { NextRequest } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

export const runtime = "edge";

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
  context: z
    .object({
      structureId: z.string().optional(),
      structureName: z.string().optional(),
      system: z.string().optional(),
      studyLevel: z
        .enum(["BASIC", "INTERMEDIATE", "ADVANCED", "RESIDENCY"])
        .optional(),
    })
    .optional(),
});

const LEVEL_INSTRUCTIONS: Record<string, string> = {
  BASIC:
    "Use linguagem simples, evite jargões. Ideal para estudantes do ensino médio ou primeiro ano de medicina.",
  INTERMEDIATE:
    "Nível universitário. Use terminologia médica com explicações. Adequado para graduação em medicina.",
  ADVANCED:
    "Linguagem técnica completa. Aborde detalhes clínicos, fisiopatológicos e cirúrgicos.",
  RESIDENCY:
    "Nível de residência médica. Aborde correlações clínicas, diagnóstico diferencial, condutas e questões de prova.",
};

function buildSystemPrompt(context?: z.infer<typeof RequestSchema>["context"]): string {
  const level = context?.studyLevel ?? "INTERMEDIATE";
  const levelInstr = LEVEL_INSTRUCTIONS[level];

  const structureCtx = context?.structureName
    ? `\n\nContexto atual: O estudante está explorando "${context.structureName}" (sistema ${context.system ?? "desconhecido"}).`
    : "";

  return `Você é ATLAS, um tutor de anatomia humana de nível mundial integrado à plataforma MEDATLAS 3D.

Suas capacidades:
- Explicar estruturas anatômicas com precisão científica
- Correlacionar anatomia com fisiologia, histologia e patologia
- Gerar questões no formato de provas (FUVEST, ENADE, Revalida, Residência)
- Criar resumos, flashcards e mapas mentais em Markdown
- Discutir casos clínicos com diagnóstico diferencial
- Citar artigos, nomenclatura anatômica internacional (TA2)

Nível de profundidade: ${levelInstr}${structureCtx}

Regras:
- Responda SEMPRE em português brasileiro
- Use Markdown para formatação (listas, negrito, tabelas)
- Para questões, use o formato: **Questão:** | **A)** | **B)** | **C)** | **D)** | **E)** | **Gabarito:** | **Justificativa:**
- Seja conciso mas completo
- Jamais invente informações médicas`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, context } = RequestSchema.parse(body);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "IA Tutor não configurada (falta a chave OPENAI_API_KEY)." },
        { status: 503 }
      );
    }
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        { role: "user", content: message },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("AI chat error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
