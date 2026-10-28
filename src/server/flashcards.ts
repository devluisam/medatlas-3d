import "server-only";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { applySm2, SM2_INITIAL, type ReviewGrade } from "@/lib/sm2";
import { notFound } from "./http";
import { recordStudyActivity } from "./activity";
import { unlockAchievements } from "./progress";

/** Cartões novos apresentados por sessão de revisão */
export const NEW_CARDS_PER_SESSION = 15;

/** Cartões que o usuário pode ver: os do atlas e os dos próprios conjuntos. */
function visibleTo(userId: string | null): Prisma.FlashcardWhereInput {
  return {
    OR: [
      { origin: "CURATED", setId: null },
      ...(userId ? [{ set: { userId } }] : []),
    ],
  };
}

const CARD_SELECT = {
  id: true,
  front: true,
  back: true,
  hint: true,
  origin: true,
  structure: { select: { slug: true, name: true, system: true } },
} satisfies Prisma.FlashcardSelect;

type CardRow = Prisma.FlashcardGetPayload<{ select: typeof CARD_SELECT }>;

export interface CardView extends CardRow {
  review: { dueAt: string; interval: number; repetitions: number; totalReviews: number } | null;
}

function withReview(card: CardRow, r?: { dueAt: Date; interval: number; repetitions: number; totalReviews: number } | null): CardView {
  return {
    ...card,
    review: r ? { dueAt: r.dueAt.toISOString(), interval: r.interval, repetitions: r.repetitions, totalReviews: r.totalReviews } : null,
  };
}

/** Cartões de uma estrutura, com o agendamento do usuário quando logado. */
export async function listStructureCards(slug: string, userId: string | null): Promise<CardView[]> {
  const cards = await prisma.flashcard.findMany({
    where: { AND: [visibleTo(userId), { structure: { slug } }] },
    orderBy: { createdAt: "asc" },
    select: {
      ...CARD_SELECT,
      reviews: userId ? { where: { userId }, select: { dueAt: true, interval: true, repetitions: true, totalReviews: true } } : false,
    },
  });
  return cards.map(({ reviews, ...c }) => withReview(c, (reviews as CardReviewRow[] | undefined)?.[0]));
}

type CardReviewRow = { dueAt: Date; interval: number; repetitions: number; totalReviews: number };

export const QueueQuerySchema = z.object({
  structure: z.string().regex(/^[a-z0-9-]+$/).max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * Fila de revisão: primeiro os vencidos (mais atrasados antes), depois cartões
 * nunca vistos, até o limite. Retorna também os totais para a interface.
 */
export async function reviewQueue(userId: string, { structure, limit }: z.infer<typeof QueueQuerySchema>) {
  const now = new Date();
  const scope: Prisma.FlashcardWhereInput = structure ? { structure: { slug: structure } } : {};

  const [due, dueTotal, newTotal, nextDue] = await Promise.all([
    prisma.flashcardReview.findMany({
      where: { userId, dueAt: { lte: now }, flashcard: { AND: [visibleTo(userId), scope] } },
      orderBy: { dueAt: "asc" },
      take: limit,
      select: { dueAt: true, interval: true, repetitions: true, totalReviews: true, flashcard: { select: CARD_SELECT } },
    }),
    prisma.flashcardReview.count({ where: { userId, dueAt: { lte: now }, flashcard: { AND: [visibleTo(userId), scope] } } }),
    prisma.flashcard.count({ where: { AND: [visibleTo(userId), scope, { reviews: { none: { userId } } }] } }),
    prisma.flashcardReview.findFirst({
      where: { userId, dueAt: { gt: now }, flashcard: { AND: [visibleTo(userId), scope] } },
      orderBy: { dueAt: "asc" },
      select: { dueAt: true },
    }),
  ]);

  const room = Math.max(0, Math.min(NEW_CARDS_PER_SESSION, limit - due.length));
  const fresh = room
    ? await prisma.flashcard.findMany({
        where: { AND: [visibleTo(userId), scope, { reviews: { none: { userId } } }] },
        orderBy: [{ structureId: "asc" }, { createdAt: "asc" }],
        take: room,
        select: CARD_SELECT,
      })
    : [];

  return {
    cards: [...due.map(({ flashcard, ...r }) => withReview(flashcard, r)), ...fresh.map((c) => withReview(c, null))],
    dueTotal,
    newTotal,
    nextDueAt: nextDue?.dueAt.toISOString() ?? null,
  };
}

export const ReviewSchema = z.object({
  grade: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
});

/** Aplica SM-2 ao agendamento *deste usuário* para o cartão. */
export async function reviewCard(userId: string, flashcardId: string, grade: ReviewGrade) {
  const card = await prisma.flashcard.findFirst({ where: { AND: [{ id: flashcardId }, visibleTo(userId)] }, select: { id: true } });
  if (!card) throw notFound("Cartão");

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.flashcardReview.findUnique({ where: { userId_flashcardId: { userId, flashcardId } } });
    const next = applySm2(current ?? SM2_INITIAL, grade);
    const data = {
      easeFactor: next.easeFactor,
      interval: next.interval,
      repetitions: next.repetitions,
      lapses: next.lapses,
      dueAt: next.dueAt,
      lastGrade: grade,
      lastReviewedAt: new Date(),
    };
    const saved = await tx.flashcardReview.upsert({
      where: { userId_flashcardId: { userId, flashcardId } },
      create: { userId, flashcardId, ...data, totalReviews: 1 },
      update: { ...data, totalReviews: { increment: 1 } },
    });
    await recordStudyActivity(userId, { activities: 1 }, tx);
    return saved;
  });
  await unlockAchievements(userId);
  return { dueAt: result.dueAt.toISOString(), interval: result.interval, repetitions: result.repetitions, totalReviews: result.totalReviews };
}
