import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("mode") ?? "PRACTICE";
  const difficulty = params.get("difficulty") ?? "INTERMEDIATE";
  const count = Math.min(Number(params.get("count") ?? "5"), 20);
  const systems = params.get("systems")?.split(",").filter(Boolean) ?? [];

  const systemContext = systems.length > 0
    ? `Sistemas: ${systems.map((s) => s.replace(/_/g, " ")).join(", ")}`
    : "Todos os sistemas anatômicos";

  const difficultyMap: Record<string, string> = {
    BASIC: "básico (graduação 1-2 ano)",
    INTERMEDIATE: "intermediário (graduação 3-4 ano)",
    ADVANCED: "avançado (internato)",
    EXPERT: "especialista (residência médica, estilo ENEM/REVALIDA)",
  };

  const prompt = `Você é um professor de anatomia humana. Gere ${count} questões de múltipla escolha sobre anatomia humana.

Nível de dificuldade: ${difficultyMap[difficulty] ?? difficulty}
${systemContext}
Tipo: ${mode === "CLINICAL" ? "Casos clínicos com correlação anatômica" : "Questões diretas de anatomia"}

Para cada questão, retorne um objeto JSON com exatamente esta estrutura:
{
  "id": "uuid único",
  "type": "MULTIPLE_CHOICE",
  "difficulty": "${difficulty}",
  "stem": "texto da pergunta",
  "context": "contexto clínico (se aplicável, senão null)",
  "options": [
    {"id": "a", "text": "texto", "isCorrect": false, "explanation": ""},
    {"id": "b", "text": "texto", "isCorrect": false, "explanation": ""},
    {"id": "c", "text": "texto", "isCorrect": true, "explanation": "explicação detalhada do porquê é correta"},
    {"id": "d", "text": "texto", "isCorrect": false, "explanation": ""},
    {"id": "e", "text": "texto", "isCorrect": false, "explanation": ""}
  ]
}

IMPORTANTE:
- Exatamente UMA opção deve ter isCorrect: true
- A explicação da opção correta deve ser educativa e detalhada
- Use nomenclatura anatômica correta (TA2)
- Retorne APENAS um array JSON válido, sem texto extra`;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Geração de quiz por IA não configurada (falta OPENAI_API_KEY)." },
      { status: 503 }
    );
  }
  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em anatomia humana e educação médica. Responda APENAS com JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    // Handle both {questions: [...]} and [...] formats
    const questions = Array.isArray(parsed) ? parsed : parsed.questions ?? [];

    // Ensure IDs are unique
    const withIds = questions.map((q: any, i: number) => ({
      ...q,
      id: q.id ?? crypto.randomUUID(),
    }));

    return NextResponse.json(withIds);
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
