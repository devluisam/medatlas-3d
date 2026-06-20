import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { QuizSession, QuizConfig, QuizQuestion } from "@/types";

interface QuizStore {
  session: QuizSession | null;
  startSession: (config: QuizConfig, questions: QuizQuestion[]) => void;
  answerQuestion: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  flagQuestion: (questionId: string) => void;
  completeSession: () => void;
  resetSession: () => void;
  tick: () => void;
}

export const useQuizStore = create<QuizStore>()(
  immer((set) => ({
    session: null,

    startSession: (config, questions) =>
      set((state) => {
        state.session = {
          id: crypto.randomUUID(),
          config,
          questions,
          currentIndex: 0,
          answers: {},
          startedAt: new Date(),
          timeRemaining: config.timeLimitSeconds,
          isComplete: false,
        };
      }),

    answerQuestion: (questionId, answer) =>
      set((state) => {
        if (!state.session) return;
        state.session.answers[questionId] = answer;
      }),

    nextQuestion: () =>
      set((state) => {
        if (!state.session) return;
        if (state.session.currentIndex < state.session.questions.length - 1) {
          state.session.currentIndex++;
        }
      }),

    prevQuestion: () =>
      set((state) => {
        if (!state.session) return;
        if (state.session.currentIndex > 0) {
          state.session.currentIndex--;
        }
      }),

    flagQuestion: (_questionId) => {
      // toggle flag state in answers metadata
    },

    completeSession: () =>
      set((state) => {
        if (!state.session) return;
        state.session.isComplete = true;
      }),

    resetSession: () =>
      set((state) => {
        state.session = null;
      }),

    tick: () =>
      set((state) => {
        if (!state.session?.timeRemaining) return;
        if (state.session.timeRemaining > 0) {
          state.session.timeRemaining--;
        } else {
          state.session.isComplete = true;
        }
      }),
  }))
);
