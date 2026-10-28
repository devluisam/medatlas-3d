import { z } from "zod";

/**
 * Formato das alternativas guardadas em `Question.options` (JSON).
 * Toda leitura passa por aqui: um registro malformado vira erro explícito
 * em vez de uma questão sem gabarito na tela.
 */
export const QuestionOptionSchema = z.object({
  id: z.string().min(1).max(8),
  text: z.string().min(1).max(600),
  isCorrect: z.boolean(),
  explanation: z.string().max(1500).optional().default(""),
});

export const QuestionOptionsSchema = z
  .array(QuestionOptionSchema)
  .min(2)
  .max(6)
  .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
    message: "A questão precisa de exatamente uma alternativa correta",
  })
  .refine((opts) => new Set(opts.map((o) => o.id)).size === opts.length, {
    message: "IDs de alternativas repetidos",
  });

export type QuestionOption = z.infer<typeof QuestionOptionSchema>;

/** Aceita o JSON como veio do Prisma (objeto) ou como string (seed antigo). */
export function parseOptions(raw: unknown): QuestionOption[] {
  const value = typeof raw === "string" ? JSON.parse(raw) : raw;
  return QuestionOptionsSchema.parse(value);
}

export function correctOptionId(options: QuestionOption[]): string {
  const correct = options.find((o) => o.isCorrect);
  if (!correct) throw new Error("Questão sem alternativa correta");
  return correct.id;
}

/** Questão como pode ir ao navegador antes da resposta: sem gabarito. */
export interface PublicQuestion {
  id: string;
  type: string;
  difficulty: string;
  stem: string;
  context: string | null;
  options: { id: string; text: string }[];
  origin: "CURATED" | "AI_GENERATED";
  structure: { slug: string; name: string } | null;
}

export interface QuestionRecord {
  id: string;
  type: string;
  difficulty: string;
  stem: string;
  context: string | null;
  options: unknown;
  explanation: string;
  origin: "CURATED" | "AI_GENERATED";
  structure?: { slug: string; name: string } | null;
}

export function toPublicQuestion(q: QuestionRecord): PublicQuestion {
  return {
    id: q.id,
    type: q.type,
    difficulty: q.difficulty,
    stem: q.stem,
    context: q.context,
    options: parseOptions(q.options).map(({ id, text }) => ({ id, text })),
    origin: q.origin,
    structure: q.structure ?? null,
  };
}

/** Correção de uma resposta: só é enviada depois que a resposta existe. */
export interface AnswerFeedback {
  questionId: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
  optionExplanations: Record<string, string>;
}

export function gradeAnswer(q: QuestionRecord, selectedOptionId: string | null): AnswerFeedback {
  const options = parseOptions(q.options);
  const correct = correctOptionId(options);
  const correctOption = options.find((o) => o.id === correct);
  return {
    questionId: q.id,
    selectedOptionId,
    correctOptionId: correct,
    isCorrect: selectedOptionId === correct,
    // A explicação geral é a referência; a da alternativa correta complementa
    explanation: q.explanation || correctOption?.explanation || "",
    optionExplanations: Object.fromEntries(
      options.filter((o) => o.explanation).map((o) => [o.id, o.explanation])
    ),
  };
}
