"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";

export type SessionType = "nauka" | "egzamin";

export interface SessionRecord {
  date: string;
  score: number;
  totalQuestions: number;
  type: SessionType;
}

export interface QuestionStat {
  attempts: number;
  correct: number;
}

export interface ExamAnswerRecord {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
}

export interface ExamSessionState {
  questionIds: string[];
  answers: Record<string, number>;
  startedAt: string;
  finished: boolean;
}

interface QuizState {
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  history: SessionRecord[];
  questionStats: Record<string, QuestionStat>;
  activeExam: ExamSessionState | null;

  recordAnswer: (questionId: string, isCorrect: boolean) => void;
  saveSession: (
    score: number,
    totalQuestions: number,
    type: SessionType,
  ) => void;
  resetStats: () => void;
  startExam: (questionIds: string[]) => void;
  recordExamAnswer: (questionId: string, selectedIndex: number) => void;
  finishExam: () => ExamSessionState | null;
  clearExam: () => void;
}

const defaultState = {
  totalAnswered: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  history: [] as SessionRecord[],
  questionStats: {} as Record<string, QuestionStat>,
  activeExam: null as ExamSessionState | null,
};

function getStorageKey(): string {
  const username = useAuthStore.getState().username;
  return username ? `naukaair-quiz-${username}` : "naukaair-quiz-guest";
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      recordAnswer: (questionId, isCorrect) => {
        set((state) => {
          const prev = state.questionStats[questionId] ?? {
            attempts: 0,
            correct: 0,
          };
          return {
            totalAnswered: state.totalAnswered + 1,
            correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: state.wrongAnswers + (isCorrect ? 0 : 1),
            questionStats: {
              ...state.questionStats,
              [questionId]: {
                attempts: prev.attempts + 1,
                correct: prev.correct + (isCorrect ? 1 : 0),
              },
            },
          };
        });

        void useAuthStore.getState().syncStatsToServer();
      },

      saveSession: (score, totalQuestions, type) => {
        set((state) => ({
          history: [
            {
              date: new Date().toISOString(),
              score,
              totalQuestions,
              type,
            },
            ...state.history,
          ].slice(0, 50),
        }));
        void useAuthStore.getState().syncStatsToServer();
      },

      resetStats: () => {
        set({ ...defaultState });
        void useAuthStore.getState().syncStatsToServer();
      },

      startExam: (questionIds) => {
        set({
          activeExam: {
            questionIds,
            answers: {},
            startedAt: new Date().toISOString(),
            finished: false,
          },
        });
      },

      recordExamAnswer: (questionId, selectedIndex) => {
        set((state) => {
          if (!state.activeExam) return state;
          return {
            activeExam: {
              ...state.activeExam,
              answers: {
                ...state.activeExam.answers,
                [questionId]: selectedIndex,
              },
            },
          };
        });
      },

      finishExam: () => {
        const exam = get().activeExam;
        if (!exam) return null;
        set({
          activeExam: { ...exam, finished: true },
        });
        return { ...exam, finished: true };
      },

      clearExam: () => set({ activeExam: null }),
    }),
    {
      name: "naukaair-quiz",
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(getStorageKey()) ?? localStorage.getItem(name),
        setItem: (_name, value) => localStorage.setItem(getStorageKey(), value),
        removeItem: (_name) => localStorage.removeItem(getStorageKey()),
      })),
      partialize: (state) => ({
        totalAnswered: state.totalAnswered,
        correctAnswers: state.correctAnswers,
        wrongAnswers: state.wrongAnswers,
        history: state.history,
        questionStats: state.questionStats,
      }),
    },
  ),
);
