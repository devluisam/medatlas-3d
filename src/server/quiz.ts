import "server-only";
import { z } from "zod";
import type { Prisma, QuizMode } from "@prisma/client";
import { prisma } from "@/lib/db";
import { quizXp } from "@/lib/gamification";
import { SYSTEM_KEYS } from "@/lib/labels";
import {
  gradeAnswer,
  parseOptions,
  toPublicQuestion,
  type AnswerFeedback,
  type PublicQuestion,
} from "@/lib/quiz/questions";
import { ApiError, notFound } from "./http";
import { recordStudyActivity } from "./activity";
import { unlockAchievements } from "./progress";
import { generateQuizQuestions } from "./ai/quiz-generator";

export const MAX_QUIZ_QUESTIONS = 30;
export const MAX_AI_QUIZ_QUESTIONS = 10;
const SECONDS_PER_TIMED_QUESTION = 60;
/** Tolerância para latência de rede no fim do tempo */
const DEADLINE_GRACE_MS = 5_000;

export const CreateAttemptSchema = z
  .object({
    mode: z.enum(["PRACTICE", "TIMED", "EXAM", "CLINICAL"]),
    source: z.enum(["BANK", "AI"]).default("BANK"),
    difficulty: z.enum(["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT"]).nullable().optional(),
    systems: z.array(z.enum(SYSTEM_KEYS)).max(SYSTEM_KEYS.length).default([]),
    structureSlug: z.string().regex(/^[a-z0-9-]+$/).max(80).optional(),
    count: z.number().int().min(1).max(MAX_QUIZ_QUESTIONS),
  })
  .refine((v) => v.source === "BANK" || v.count <= MAX_AI_QUIZ_QUESTIONS, {
    message: `Com IA, o máximo é ${MAX_AI_QUIZ_QUESTIONS} questões por quiz`,
    path: ["count"],
  });
export type CreateAttemptInput = z.infer<typeof CreateAttemptSchema>;

/** Prática e Casos clínicos corrigem na hora; Simulado e Cronometrado só no fim. */
export const revealsImmediately = (mode: QuizMode) => mode === "PRACTICE" || mode === "CLINICAL";

const QUESTION_SELECT = {
  id: true,
  type: true,
  difficulty: true,
  stem: true,
  context: true,
  options: true,
  explanation: true,
  origin: true,
  createdById: true,
  structure: { select: { slug: true, name: true } },
} satisfies Prisma.QuestionSelect;

function bankWhere(input: CreateAttemptInput): Prisma.QuestionWhereInput {
  const where: Prisma.QuestionWhereInput = { isActive: true, origin: "CURATED" };
  if (input.difficulty) where.difficulty = input.difficulty;
  if (input.mode === "CLINICAL") where.context = { not: null };
  const and: Prisma.QuestionWhereInput[] = [];
  if (input.systems.length > 0) {
    and.push({ OR: [{ system: { in: input.systems } }, { structure: { system: { in: input.systems } } }] });
  }
  if (input.structureSlug) and.push({ structure: { slug: input.structureSlug } });
  if (and.length) where.AND = and;
  return where;
}

/** Quantas questões do banco atendem aos filtros (para o formulário avisar antes). */
export async function countBankQuestions(input: Omit<CreateAttemptInput, "count" | "source">) {
  return prisma.question.count({ where: bankWhere({ ...input, count: 1, source: "BANK" }) });
}

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export async function createAttempt(userId: string, input: CreateAttemptInput) {
  let questionIds: string[];

  if (input.source === "BANK") {
    const available = await prisma.question.findMany({ where: bankWhere(input), select: { id: true } });
    if (available.length === 0) {
      throw new ApiError(
        "CONFLICT",
        "Não há questões no banco para esses filtros. Remova algum filtro ou gere questões com IA."
      );
    }
    questionIds = shuffle(available.map((q) => q.id)).slice(0, input.count);
  } else {
    questionIds = await generateQuizQuestions(userId, input);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      mode: input.mode,
      source: input.source,
      difficulty: input.difficulty ?? null,
      systems: input.systems,
      system: input.systems.length === 1 ? input.systems[0] : null,
      totalQ: questionIds.length,
      timeLimitSeconds: input.mode === "TIMED" ? questionIds.length * SECONDS_PER_TIMED_QUESTION : null,
      questions: { create: questionIds.map((questionId, position) => ({ questionId, position })) },
    },
    select: { id: true },
  });
  return { id: attempt.id, requested: input.count, served: questionIds.length };
}

// ── Leitura ───────────────────────────────────────────────────────

async function loadOwnedAttempt(userId: string, attemptId: string) {
  // Filtra por dono na própria consulta: tentativa alheia é indistinguível de inexistente
  const attempt = await prisma.quizAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      questions: { orderBy: { position: "asc" }, include: { question: { select: QUESTION_SELECT } } },
    },
  });
  if (!attempt) throw notFound("Quiz");
  return attempt;
}

type OwnedAttempt = Awaited<ReturnType<typeof loadOwnedAttempt>>;

function deadlineOf(a: { startedAt: Date; timeLimitSeconds: number | null }): Date | null {
  return a.timeLimitSeconds ? new Date(a.startedAt.getTime() + a.timeLimitSeconds * 1000) : null;
}

export interface AttemptItemView {
  position: number;
  question: PublicQuestion;
  selectedOptionId: string | null;
  flagged: boolean;
  feedback: AnswerFeedback | null;
}

export interface AttemptView {
  id: string;
  mode: QuizMode;
  source: "BANK" | "AI";
  startedAt: string;
  deadline: string | null;
  completedAt: string | null;
  revealsImmediately: boolean;
  items: AttemptItemView[];
  result: AttemptResult | null;
}

export interface AttemptResult {
  total: number;
  correct: number;
  answered: number;
  score: number;
  xpEarned: number;
  timeSeconds: number;
}

function toView(a: OwnedAttempt): AttemptView {
  const completed = a.completedAt !== null;
  const immediate = revealsImmediately(a.mode);
  const deadline = deadlineOf(a);
  return {
    id: a.id,
    mode: a.mode,
    source: a.source,
    startedAt: a.startedAt.toISOString(),
    deadline: deadline?.toISOString() ?? null,
    completedAt: a.completedAt?.toISOString() ?? null,
    revealsImmediately: immediate,
    items: a.questions.map((item) => {
      const canReveal = completed || (immediate && item.answeredAt !== null);
      return {
        position: item.position,
        question: toPublicQuestion(item.question),
        selectedOptionId: item.userAnswer,
        flagged: item.flagged,
        feedback: canReveal ? gradeAnswer(item.question, item.userAnswer) : null,
      };
    }),
    result: completed
      ? {
          total: a.totalQ,
          correct: a.correctQ,
          answered: a.questions.filter((q) => q.answeredAt !== null).length,
          score: a.score,
          xpEarned: a.xpEarned,
          timeSeconds: a.timeSeconds,
        }
      : null,
  };
}

export async function getAttemptView(userId: string, attemptId: string): Promise<AttemptView> {
  const attempt = await loadOwnedAttempt(userId, attemptId);
  // Prazo vencido sem finalizar (aba fechada): fecha agora, com o que foi respondido
  const deadline = deadlineOf(attempt);
  if (!attempt.completedAt && deadline && Date.now() > deadline.getTime() + DEADLINE_GRACE_MS) {
    await finalize(attempt);
    return toView(await loadOwnedAttempt(userId, attemptId));
  }
  return toView(attempt);
}

export async function listAttempts(userId: string, take = 20) {
  return prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take,
    select: {
      id: true,
      mode: true,
      source: true,
      totalQ: true,
      correctQ: true,
      score: true,
      startedAt: true,
      completedAt: true,
    },
  });
}

// ── Escrita ───────────────────────────────────────────────────────

export const AnswerSchema = z.object({
  questionId: z.string().min(1).max(40),
  optionId: z.string().min(1).max(8),
  flagged: z.boolean().optional(),
});

export async function answerQuestion(userId: string, attemptId: string, input: z.infer<typeof AnswerSchema>) {
  const attempt = await loadOwnedAttempt(userId, attemptId);
  if (attempt.completedAt) throw new ApiError("CONFLICT", "Este quiz já foi finalizado.");

  const deadline = deadlineOf(attempt);
  if (deadline && Date.now() > deadline.getTime() + DEADLINE_GRACE_MS) {
    await finalize(attempt);
    throw new ApiError("CONFLICT", "O tempo deste quiz acabou. As respostas enviadas até o limite foram corrigidas.");
  }

  const item = attempt.questions.find((q) => q.questionId === input.questionId);
  if (!item) throw notFound("Questão neste quiz");

  const options = parseOptions(item.question.options);
  if (!options.some((o) => o.id === input.optionId)) throw new ApiError("BAD_REQUEST", "Alternativa inválida.");

  const immediate = revealsImmediately(attempt.mode);
  const feedback = gradeAnswer(item.question, input.optionId);

  if (immediate) {
    // Resposta travada: só a primeira conta. O updateMany condicional resolve corrida
    // entre dois envios simultâneos.
    const saved = await prisma.quizAttemptQuestion.updateMany({
      where: { id: item.id, answeredAt: null },
      data: { userAnswer: input.optionId, isCorrect: feedback.isCorrect, answeredAt: new Date() },
    });
    if (saved.count === 0) {
      const existing = await prisma.quizAttemptQuestion.findUniqueOrThrow({ where: { id: item.id } });
      return { saved: false, feedback: gradeAnswer(item.question, existing.userAnswer) };
    }
    await recordStudyActivity(userId);
    return { saved: true, feedback };
  }

  // Simulado/Cronometrado: pode trocar a resposta até finalizar; nada é revelado
  const firstAnswer = item.answeredAt === null;
  await prisma.quizAttemptQuestion.update({
    where: { id: item.id },
    data: {
      userAnswer: input.optionId,
      isCorrect: feedback.isCorrect,
      answeredAt: item.answeredAt ?? new Date(),
      ...(input.flagged !== undefined && { flagged: input.flagged }),
    },
  });
  if (firstAnswer) await recordStudyActivity(userId);
  return { saved: true, feedback: null };
}

export async function setFlag(userId: string, attemptId: string, questionId: string, flagged: boolean) {
  const updated = await prisma.quizAttemptQuestion.updateMany({
    where: { attemptId, questionId, attempt: { userId, completedAt: null } },
    data: { flagged },
  });
  if (updated.count === 0) throw notFound("Questão neste quiz");
}

async function finalize(attempt: OwnedAttempt) {
  const total = attempt.questions.length;
  const correct = attempt.questions.filter((q) => q.isCorrect === true).length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);
  const deadline = deadlineOf(attempt);
  const end = deadline && Date.now() > deadline.getTime() ? deadline : new Date();
  const timeSeconds = Math.max(0, Math.round((end.getTime() - attempt.startedAt.getTime()) / 1000));

  const finished = await prisma.$transaction(async (tx) => {
    // Condicional: dois "finalizar" simultâneos não pontuam duas vezes
    const done = await tx.quizAttempt.updateMany({
      where: { id: attempt.id, completedAt: null },
      data: { completedAt: new Date(), totalQ: total, correctQ: correct, score, xpEarned: quizXp(correct, total), timeSeconds },
    });
    if (done.count === 0) return false;
    for (const q of attempt.questions) {
      if (q.answeredAt === null) continue;
      await tx.question.update({
        where: { id: q.questionId },
        data: { timesAnswered: { increment: 1 }, ...(q.isCorrect && { timesCorrect: { increment: 1 } }) },
      });
    }
    return true;
  });
  if (finished) await unlockAchievements(attempt.userId);
}

export async function completeAttempt(userId: string, attemptId: string): Promise<AttemptView> {
  const attempt = await loadOwnedAttempt(userId, attemptId);
  if (!attempt.completedAt) await finalize(attempt);
  return toView(await loadOwnedAttempt(userId, attemptId));
}

// ── Questão avulsa (aba de questões do painel de estudo) ──────────

export async function checkStandaloneAnswer(questionId: string, optionId: string, userId: string | null) {
  const question = await prisma.question.findFirst({
    where: {
      id: questionId,
      isActive: true,
      OR: [{ origin: "CURATED" }, ...(userId ? [{ origin: "AI_GENERATED" as const, createdById: userId }] : [])],
    },
    select: QUESTION_SELECT,
  });
  if (!question) throw notFound("Questão");
  const options = parseOptions(question.options);
  if (!options.some((o) => o.id === optionId)) throw new ApiError("BAD_REQUEST", "Alternativa inválida.");
  if (userId) await recordStudyActivity(userId);
  return gradeAnswer(question, optionId);
}

export async function listStructureQuestions(slug: string, take = 10): Promise<PublicQuestion[]> {
  const rows = await prisma.question.findMany({
    where: { isActive: true, origin: "CURATED", structure: { slug } },
    orderBy: { createdAt: "asc" },
    take,
    select: QUESTION_SELECT,
  });
  return rows.map(toPublicQuestion);
}
