import "server-only";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import {
  achievementProgress,
  computeStreaks,
  isAchievementMet,
  levelFor,
  studyDate,
  totalXp,
  type AchievementCondition,
  type AchievementFacts,
} from "@/lib/gamification";
import { systemLabel } from "@/lib/labels";
import { recordStudyActivity } from "./activity";
import { structureIdBySlug } from "./structures";

/** Tempo máximo creditado por pulso de estudo; o cliente pulsa a cada 30 s. */
export const HEARTBEAT_SECONDS = 30;
const MIN_HEARTBEAT_GAP_MS = 25_000;

/** Abertura de uma estrutura no painel de estudo. */
export async function recordStructureView(userId: string, slug: string) {
  const structureId = await structureIdBySlug(slug);
  await prisma.$transaction(async (tx) => {
    await tx.userProgress.upsert({
      where: { userId_structureId: { userId, structureId } },
      create: { userId, structureId, viewCount: 1 },
      update: { viewCount: { increment: 1 }, lastViewed: new Date() },
    });
    await recordStudyActivity(userId, { activities: 1 }, tx);
  });
  await unlockAchievements(userId);
}

/**
 * Pulso de tempo de estudo enquanto o painel está aberto e visível.
 * O servidor só credita se o último pulso tem pelo menos 25 s — repetir a
 * requisição não infla o tempo.
 */
export async function recordStudyHeartbeat(userId: string, slug: string): Promise<{ credited: number }> {
  const structureId = await structureIdBySlug(slug);
  const threshold = new Date(Date.now() - MIN_HEARTBEAT_GAP_MS);
  const updated = await prisma.userProgress.updateMany({
    where: { userId, structureId, lastViewed: { lte: threshold } },
    data: { studyTimeSeconds: { increment: HEARTBEAT_SECONDS }, lastViewed: new Date() },
  });
  if (updated.count === 0) return { credited: 0 };
  await recordStudyActivity(userId, { seconds: HEARTBEAT_SECONDS, activities: 0 });
  return { credited: HEARTBEAT_SECONDS };
}

// ── Fatos e conquistas ────────────────────────────────────────────

async function collectFacts(userId: string) {
  const today = studyDate(new Date(), config.timeZone);
  const [viewed, perSystemTotals, streakDays, answered, perfect, reviews, quizXp] = await Promise.all([
    prisma.userProgress.findMany({ where: { userId }, select: { structure: { select: { system: true } } } }),
    prisma.anatomicalStructure.groupBy({ by: ["system"], where: { isPublished: true }, _count: true }),
    prisma.studyStreak.findMany({ where: { userId }, select: { date: true }, orderBy: { date: "asc" } }),
    prisma.quizAttemptQuestion.count({ where: { attempt: { userId }, answeredAt: { not: null } } }),
    prisma.quizAttempt.count({
      where: { userId, completedAt: { not: null }, totalQ: { gte: 5 }, score: 100 },
    }),
    prisma.flashcardReview.aggregate({ where: { userId }, _sum: { totalReviews: true } }),
    prisma.quizAttempt.aggregate({ where: { userId, completedAt: { not: null } }, _sum: { xpEarned: true } }),
  ]);

  const systemCoverage: AchievementFacts["systemCoverage"] = {};
  for (const row of perSystemTotals) systemCoverage[row.system] = { viewed: 0, total: row._count };
  for (const v of viewed) {
    const c = systemCoverage[v.structure.system];
    if (c) c.viewed++;
  }

  const streaks = computeStreaks(
    streakDays.map((d) => d.date),
    today
  );

  const facts: AchievementFacts = {
    structuresViewed: viewed.length,
    systemCoverage,
    longestStreak: streaks.longest,
    questionsAnswered: answered,
    perfectQuizzes: perfect,
    flashcardReviews: reviews._sum.totalReviews ?? 0,
  };
  return { facts, streaks, quizXp: quizXp._sum.xpEarned ?? 0, today };
}

/** Desbloqueia o que a pessoa já cumpriu. Idempotente (unique userId+achievementId). */
export async function unlockAchievements(userId: string) {
  const [{ facts }, achievements, unlocked] = await Promise.all([
    collectFacts(userId),
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const have = new Set(unlocked.map((u) => u.achievementId));
  const toUnlock = achievements.filter(
    (a) => !have.has(a.id) && isAchievementMet(a.condition as AchievementCondition, facts)
  );
  if (toUnlock.length === 0) return [];
  await prisma.userAchievement.createMany({
    data: toUnlock.map((a) => ({ userId, achievementId: a.id })),
    skipDuplicates: true,
  });
  return toUnlock.map((a) => a.name);
}

// ── Painel ────────────────────────────────────────────────────────

export async function getDashboard(userId: string) {
  await unlockAchievements(userId);
  const { facts, streaks, quizXp, today } = await collectFacts(userId);

  const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const [achievements, unlocked, week, recent, totalSeconds, attempts, dueCount, favorites] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { xpReward: "asc" } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true, unlockedAt: true } }),
    prisma.studyStreak.findMany({ where: { userId, date: { gte: weekStart } }, orderBy: { date: "asc" } }),
    prisma.userProgress.findMany({
      where: { userId },
      orderBy: { lastViewed: "desc" },
      take: 6,
      select: {
        viewCount: true,
        studyTimeSeconds: true,
        lastViewed: true,
        structure: { select: { slug: true, name: true, system: true } },
      },
    }),
    prisma.studyStreak.aggregate({ where: { userId }, _sum: { seconds: true } }),
    prisma.quizAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: { id: true, mode: true, score: true, totalQ: true, correctQ: true, completedAt: true, source: true },
    }),
    prisma.flashcardReview.count({ where: { userId, dueAt: { lte: new Date() } } }),
    prisma.favoriteStructure.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { structure: { select: { slug: true, name: true, system: true } } },
    }),
  ]);

  const unlockedMap = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));
  const achievementXp = achievements
    .filter((a) => unlockedMap.has(a.id))
    .reduce((sum, a) => sum + a.xpReward, 0);

  const xp = totalXp({
    structuresViewed: facts.structuresViewed,
    quizXp,
    flashcardReviews: facts.flashcardReviews,
    achievementXp,
  });

  // Últimos 7 dias, inclusive os sem estudo
  const byDay = new Map(week.map((d) => [d.date.getTime(), d]));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.getTime() + i * 24 * 60 * 60 * 1000);
    const row = byDay.get(date.getTime());
    return {
      date: date.toISOString().slice(0, 10),
      minutes: Math.round((row?.seconds ?? 0) / 60),
      activities: row?.activities ?? 0,
    };
  });

  const completedAttempts = await prisma.quizAttempt.aggregate({
    where: { userId, completedAt: { not: null } },
    _avg: { score: true },
    _count: true,
  });

  return {
    xp,
    level: levelFor(xp),
    streak: streaks,
    studiedToday: days[6]!.activities > 0 || days[6]!.minutes > 0,
    totals: {
      studySeconds: totalSeconds._sum.seconds ?? 0,
      structuresViewed: facts.structuresViewed,
      questionsAnswered: facts.questionsAnswered,
      quizzesCompleted: completedAttempts._count,
      averageScore: completedAttempts._avg.score === null ? null : Math.round(completedAttempts._avg.score),
      flashcardReviews: facts.flashcardReviews,
      flashcardsDue: dueCount,
    },
    week: days,
    recent: recent.map((r) => ({
      slug: r.structure.slug,
      name: r.structure.name,
      system: systemLabel(r.structure.system),
      viewCount: r.viewCount,
      studySeconds: r.studyTimeSeconds,
      lastViewed: r.lastViewed.toISOString(),
    })),
    favorites: favorites.map((f) => ({ slug: f.structure.slug, name: f.structure.name, system: systemLabel(f.structure.system) })),
    attempts: attempts.map((a) => ({ ...a, completedAt: a.completedAt!.toISOString() })),
    achievements: achievements.map((a) => ({
      slug: a.slug,
      name: a.name,
      description: a.description,
      xpReward: a.xpReward,
      unlockedAt: unlockedMap.get(a.id)?.toISOString() ?? null,
      progress: unlockedMap.has(a.id) ? 100 : achievementProgress(a.condition as AchievementCondition, facts),
    })),
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
