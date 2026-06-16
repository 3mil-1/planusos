"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoredUserStats } from "@/lib/globalStats";
import { mergeUserStats, emptyUserStats } from "@/lib/statsMerge";

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

export interface ExamSessionState {
  questionIds: string[];
  answers: Record<string, number>;
  startedAt: string;
  finished: boolean;
}

type UserQuizData = Omit<StoredUserStats, "lastActive">;

interface QuizPersisted {
  byUser: Record<string, UserQuizData>;
}

interface QuizState extends UserQuizData {
  byUser: Record<string, UserQuizData>;
  activeExam: ExamSessionState | null;
  activeUsername: string | null;
  isStatsReady: boolean;
  isQuizHydrated: boolean;

  setQuizHydrated: () => void;
  loadAndMergeFromServer: (username: string) => Promise<void>;
  recordAnswer: (questionId: string, isCorrect: boolean) => void;
  saveSession: (score: number, totalQuestions: number, type: SessionType) => void;
  resetStats: () => void;
  startExam: (questionIds: string[]) => void;
  recordExamAnswer: (questionId: string, selectedIndex: number) => void;
  finishExam: () => ExamSessionState | null;
  clearExam: () => void;
}

const emptyQuiz: UserQuizData = {
  totalAnswered: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  history: [],
  questionStats: {},
};

function applyUserData(
  set: (partial: Partial<QuizState>) => void,
  get: () => QuizState,
  username: string,
  data: UserQuizData,
) {
  set({
    ...data,
    activeUsername: username,
    byUser: { ...get().byUser, [username]: data },
  });
}

async function pushToServer(username: string, data: UserQuizData): Promise<void> {
  await fetch("/api/stats/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      stats: { ...data, lastActive: new Date().toISOString() },
    }),
  });
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...emptyQuiz,
      byUser: {},
      activeExam: null,
      activeUsername: null,
      isStatsReady: false,
      isQuizHydrated: false,

      setQuizHydrated: () => set({ isQuizHydrated: true }),

      loadAndMergeFromServer: async (username) => {
        const local: StoredUserStats = {
          ...(get().byUser[username] ?? emptyQuiz),
          lastActive: new Date().toISOString(),
        };

        set({ isStatsReady: false, activeUsername: username, ...local });

        try {
          const response = await fetch(
            `/api/stats/user/${encodeURIComponent(username)}`,
            { cache: "no-store" },
          );
          if (response.ok) {
            const payload = (await response.json()) as { stats: StoredUserStats };
            const merged = mergeUserStats(local, payload.stats);
            const quizData: UserQuizData = {
              totalAnswered: merged.totalAnswered,
              correctAnswers: merged.correctAnswers,
              wrongAnswers: merged.wrongAnswers,
              history: merged.history,
              questionStats: merged.questionStats,
            };
            applyUserData(set, get, username, quizData);
            set({ isStatsReady: true });
            await pushToServer(username, quizData);
            return;
          }
        } catch {
          /* offline */
        }

        set({ isStatsReady: true });
      },

      recordAnswer: (questionId, isCorrect) => {
        const username = get().activeUsername;
        if (!username) return;

        set((state) => {
          const prev = state.questionStats[questionId] ?? { attempts: 0, correct: 0 };
          const next: UserQuizData = {
            totalAnswered: state.totalAnswered + 1,
            correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: state.wrongAnswers + (isCorrect ? 0 : 1),
            history: state.history,
            questionStats: {
              ...state.questionStats,
              [questionId]: {
                attempts: prev.attempts + 1,
                correct: prev.correct + (isCorrect ? 1 : 0),
              },
            },
          };
          return {
            ...next,
            byUser: { ...state.byUser, [username]: next },
          };
        });

        const data = get().byUser[username];
        if (data) void pushToServer(username, data);
      },

      saveSession: (score, totalQuestions, type) => {
        const username = get().activeUsername;
        if (!username) return;

        set((state) => {
          const next: UserQuizData = {
            totalAnswered: state.totalAnswered,
            correctAnswers: state.correctAnswers,
            wrongAnswers: state.wrongAnswers,
            questionStats: state.questionStats,
            history: [
              { date: new Date().toISOString(), score, totalQuestions, type },
              ...state.history,
            ].slice(0, 50),
          };
          return {
            history: next.history,
            byUser: { ...state.byUser, [username]: next },
          };
        });

        const data = get().byUser[username];
        if (data) void pushToServer(username, data);
      },

      resetStats: () => {
        const username = get().activeUsername;
        if (!username) return;
        applyUserData(set, get, username, emptyQuiz);
        void pushToServer(username, emptyQuiz);
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
              answers: { ...state.activeExam.answers, [questionId]: selectedIndex },
            },
          };
        });
      },

      finishExam: () => {
        const exam = get().activeExam;
        if (!exam) return null;
        set({ activeExam: { ...exam, finished: true } });
        return { ...exam, finished: true };
      },

      clearExam: () => set({ activeExam: null }),
    }),
    {
      name: "naukaair-quiz-v2",
      partialize: (state) => ({ byUser: state.byUser }),
      merge: (persisted, current) => {
        const saved = persisted as QuizPersisted | undefined;
        const byUser = saved?.byUser ?? {};
        const username = current.activeUsername;
        const userData = username ? (byUser[username] ?? emptyQuiz) : emptyQuiz;
        return {
          ...current,
          byUser,
          ...userData,
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setQuizHydrated();
        import("@/lib/initStats").then(({ maybeLoadStatsFromServer }) => {
          maybeLoadStatsFromServer();
        });
      },
    },
  ),
);

export { emptyUserStats };
