/**
 * Regras de XP, nível, sequência e conquistas, num lugar só.
 *
 * O XP total não é um contador incrementado a cada evento (que diverge com
 * reenvios e falhas parciais): é recalculado a partir dos dados de origem.
 * Ver docs/ARCHITECTURE.md, "Progresso e gamificação".
 */

export const XP_RULES = {
  /** Primeira vez que o estudante abre uma estrutura */
  structureFirstView: 10,
  /** Cada acerto num quiz finalizado */
  quizCorrectAnswer: 10,
  /** Quiz finalizado com 100% e pelo menos `perfectQuizMinQuestions` questões */
  perfectQuizBonus: 25,
  perfectQuizMinQuestions: 5,
  /** Cada revisão de flashcard */
  flashcardReview: 2,
} as const;

export interface XpSources {
  structuresViewed: number;
  quizXp: number; // soma de QuizAttempt.xpEarned (já calculado por quizXp())
  flashcardReviews: number;
  achievementXp: number;
}

export function quizXp(correct: number, total: number): number {
  const base = correct * XP_RULES.quizCorrectAnswer;
  const perfect = total >= XP_RULES.perfectQuizMinQuestions && correct === total;
  return base + (perfect ? XP_RULES.perfectQuizBonus : 0);
}

export function totalXp(s: XpSources): number {
  return (
    s.structuresViewed * XP_RULES.structureFirstView +
    s.quizXp +
    s.flashcardReviews * XP_RULES.flashcardReview +
    s.achievementXp
  );
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number; // Infinity no último nível
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Calouro", minXp: 0, maxXp: 500 },
  { level: 2, title: "Estudante", minXp: 500, maxXp: 1500 },
  { level: 3, title: "Acadêmico", minXp: 1500, maxXp: 3500 },
  { level: 4, title: "Monitor", minXp: 3500, maxXp: 7000 },
  { level: 5, title: "Anatomista", minXp: 7000, maxXp: 15000 },
  { level: 6, title: "Anatomista sênior", minXp: 15000, maxXp: Infinity },
];

export function levelFor(xp: number): LevelInfo & { progress: number; xpInLevel: number; xpForNext: number | null } {
  const info = LEVELS.findLast((l) => xp >= l.minXp) ?? LEVELS[0];
  const isLast = !Number.isFinite(info.maxXp);
  const span = isLast ? 1 : info.maxXp - info.minXp;
  const xpInLevel = xp - info.minXp;
  return {
    ...info,
    xpInLevel,
    xpForNext: isLast ? null : info.maxXp - xp,
    progress: isLast ? 100 : Math.min(100, Math.round((xpInLevel / span) * 100)),
  };
}

// ── Sequência de estudo ───────────────────────────────────────────

/** Data local (fuso do app) como meia-noite UTC — o formato de colunas @db.Date. */
export function studyDate(now: Date, timeZone: string): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return new Date(`${ymd}T00:00:00.000Z`);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Sequência atual e recorde a partir dos dias com atividade.
 * A sequência atual continua valendo se o último dia estudado foi ontem
 * (o estudante ainda pode estudar hoje sem perdê-la).
 */
export function computeStreaks(days: Date[], today: Date): { current: number; longest: number } {
  const sorted = [...new Set(days.map((d) => d.getTime()))].sort((a, b) => a - b);
  if (sorted.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = sorted[i] - sorted[i - 1] === DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const last = sorted[sorted.length - 1];
  const gap = (today.getTime() - last) / DAY_MS;
  // `run` termina no último dia estudado; só conta se esse dia é hoje ou ontem
  const current = gap <= 1 ? run : 0;
  return { current, longest };
}

// ── Conquistas ────────────────────────────────────────────────────

export type AchievementCondition =
  | { type: "structure_viewed"; count: number }
  | { type: "system_complete"; system: string }
  | { type: "streak"; days: number }
  | { type: "questions_answered"; count: number }
  | { type: "quiz_perfect" }
  | { type: "flashcards_reviewed"; count: number };

export interface AchievementFacts {
  structuresViewed: number;
  /** sistema → [vistas, total publicadas] */
  systemCoverage: Record<string, { viewed: number; total: number }>;
  longestStreak: number;
  questionsAnswered: number;
  perfectQuizzes: number;
  flashcardReviews: number;
}

export function isAchievementMet(condition: AchievementCondition, f: AchievementFacts): boolean {
  switch (condition.type) {
    case "structure_viewed":
      return f.structuresViewed >= condition.count;
    case "system_complete": {
      const c = f.systemCoverage[condition.system];
      return !!c && c.total > 0 && c.viewed >= c.total;
    }
    case "streak":
      return f.longestStreak >= condition.days;
    case "questions_answered":
      return f.questionsAnswered >= condition.count;
    case "quiz_perfect":
      return f.perfectQuizzes > 0;
    case "flashcards_reviewed":
      return f.flashcardReviews >= condition.count;
  }
}

/** Progresso 0–100 de uma conquista ainda bloqueada (para a barra no painel). */
export function achievementProgress(condition: AchievementCondition, f: AchievementFacts): number {
  const pct = (value: number, goal: number) => Math.min(100, Math.round((value / Math.max(goal, 1)) * 100));
  switch (condition.type) {
    case "structure_viewed":
      return pct(f.structuresViewed, condition.count);
    case "system_complete": {
      const c = f.systemCoverage[condition.system];
      return c ? pct(c.viewed, c.total) : 0;
    }
    case "streak":
      return pct(f.longestStreak, condition.days);
    case "questions_answered":
      return pct(f.questionsAnswered, condition.count);
    case "quiz_perfect":
      return f.perfectQuizzes > 0 ? 100 : 0;
    case "flashcards_reviewed":
      return pct(f.flashcardReviews, condition.count);
  }
}
