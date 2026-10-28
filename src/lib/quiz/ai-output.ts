import { z } from "zod";

/**
 * Validação das questões devolvidas pela IA. Cada questão é validada sozinha:
 * as inválidas são descartadas e o quiz usa as que passaram.
 */
const OPTION_IDS = ["a", "b", "c", "d", "e"] as const;

const GeneratedOptionSchema = z.object({
  text: z.string().trim().min(1).max(300),
  isCorrect: z.boolean(),
  explanation: z.string().trim().max(600).optional().default(""),
});

export const GeneratedQuestionSchema = z
  .object({
    stem: z.string().trim().min(15).max(800),
    context: z.string().trim().max(1200).nullish(),
    structureSlug: z.string().trim().max(80).nullish(),
    explanation: z.string().trim().min(20).max(1500),
    options: z.array(GeneratedOptionSchema).length(5),
  })
  .refine((q) => q.options.filter((o) => o.isCorrect).length === 1, "exatamente uma alternativa correta")
  .refine(
    (q) => new Set(q.options.map((o) => o.text.toLowerCase())).size === q.options.length,
    "alternativas repetidas"
  );

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;

export interface NormalizedQuestion {
  stem: string;
  context: string | null;
  structureSlug: string | null;
  explanation: string;
  options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  correctAnswer: string;
}

/**
 * Extrai e normaliza. `allowedSlugs` restringe o vínculo com estruturas ao
 * que existe no banco; `random` permite teste determinístico do embaralhamento.
 */
export function parseGeneratedQuestions(
  raw: string,
  allowedSlugs: Set<string>,
  random: () => number = Math.random
): { valid: NormalizedQuestion[]; rejected: number } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { valid: [], rejected: 0 };
  }
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : [];

  const valid: NormalizedQuestion[] = [];
  let rejected = 0;
  const seenStems = new Set<string>();

  for (const item of list.slice(0, 20)) {
    const result = GeneratedQuestionSchema.safeParse(item);
    if (!result.success) {
      rejected++;
      continue;
    }
    const q = result.data;
    const stemKey = q.stem.toLowerCase();
    if (seenStems.has(stemKey)) {
      rejected++;
      continue;
    }
    seenStems.add(stemKey);

    // A IA tende a pôr a correta sempre na mesma letra: embaralha e reatribui a–e
    const shuffled = [...q.options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    const options = shuffled.map((o, i) => ({ id: OPTION_IDS[i]!, text: o.text, isCorrect: o.isCorrect, explanation: o.explanation }));

    valid.push({
      stem: q.stem,
      context: q.context || null,
      structureSlug: q.structureSlug && allowedSlugs.has(q.structureSlug) ? q.structureSlug : null,
      explanation: q.explanation,
      options,
      correctAnswer: options.find((o) => o.isCorrect)!.id,
    });
  }
  return { valid, rejected };
}
