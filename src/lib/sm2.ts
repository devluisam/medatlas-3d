/**
 * SM-2 (SuperMemo 2, Wozniak 1987) aplicado a um cartão de um usuário.
 *
 * Diferenças deliberadas em relação ao texto original, todas documentadas aqui:
 * - O intervalo é arredondado para dias inteiros (o agendamento é diário).
 * - Errar (nota < 3) zera as repetições e mantém o fator de facilidade, como no
 *   original, e conta um lapso para as estatísticas.
 */

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface Sm2State {
  easeFactor: number;
  interval: number; // dias
  repetitions: number;
  lapses: number;
}

export interface Sm2Result extends Sm2State {
  dueAt: Date;
}

export const SM2_INITIAL: Sm2State = { easeFactor: 2.5, interval: 0, repetitions: 0, lapses: 0 };
export const MIN_EASE_FACTOR = 1.3;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Botões da interface → nota SM-2. */
export const GRADE_BUTTONS = [
  { grade: 1, label: "Errei", hint: "Revê amanhã" },
  { grade: 3, label: "Difícil", hint: "Lembrei com esforço" },
  { grade: 4, label: "Bom", hint: "Lembrei" },
  { grade: 5, label: "Fácil", hint: "Lembrei na hora" },
] as const satisfies readonly { grade: ReviewGrade; label: string; hint: string }[];

export function nextEaseFactor(easeFactor: number, grade: ReviewGrade): number {
  const q = grade;
  const next = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  return Math.max(MIN_EASE_FACTOR, Math.round(next * 100) / 100);
}

export function applySm2(state: Sm2State, grade: ReviewGrade, now: Date = new Date()): Sm2Result {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
    throw new RangeError(`Nota SM-2 inválida: ${grade}`);
  }

  if (grade < 3) {
    return {
      easeFactor: state.easeFactor,
      interval: 1,
      repetitions: 0,
      lapses: state.lapses + 1,
      dueAt: new Date(now.getTime() + DAY_MS),
    };
  }

  const repetitions = state.repetitions + 1;
  let interval: number;
  if (repetitions === 1) interval = 1;
  else if (repetitions === 2) interval = 6;
  else interval = Math.max(1, Math.round(state.interval * state.easeFactor));

  return {
    easeFactor: nextEaseFactor(state.easeFactor, grade),
    interval,
    repetitions,
    lapses: state.lapses,
    dueAt: new Date(now.getTime() + interval * DAY_MS),
  };
}
