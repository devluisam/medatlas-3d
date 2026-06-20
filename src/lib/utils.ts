import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatStudyTime(seconds: number): string {
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  let required = 0;
  while (required + calculateXpForLevel(level) <= xp) {
    required += calculateXpForLevel(level);
    level++;
    if (level > 10) break;
  }
  return level;
}

export function getXpProgress(xp: number): {
  level: number;
  currentXp: number;
  requiredXp: number;
  percent: number;
} {
  const level = getLevelFromXp(xp);
  const levelXp = calculateXpForLevel(level);
  let accumulated = 0;
  for (let l = 1; l < level; l++) {
    accumulated += calculateXpForLevel(l);
  }
  const currentXp = xp - accumulated;
  return {
    level,
    currentXp,
    requiredXp: levelXp,
    percent: Math.min(100, Math.round((currentXp / levelXp) * 100)),
  };
}
