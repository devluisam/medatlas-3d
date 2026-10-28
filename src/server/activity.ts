import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import { studyDate } from "@/lib/gamification";

type Tx = Prisma.TransactionClient | typeof prisma;

/**
 * Marca o dia de hoje (fuso do app) como dia de estudo. Toda ação de estudo
 * passa por aqui — é a única fonte da sequência de dias.
 */
export async function recordStudyActivity(
  userId: string,
  { seconds = 0, activities = 1 }: { seconds?: number; activities?: number } = {},
  db: Tx = prisma
) {
  const date = studyDate(new Date(), config.timeZone);
  await db.studyStreak.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, seconds, activities },
    update: { seconds: { increment: seconds }, activities: { increment: activities } },
  });
}
