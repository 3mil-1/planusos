"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoredUserStats } from "@/lib/globalStats";
import { mergeUserStats, emptyUserStats } from "@/lib/statsMerge";
import {
  CASINO_MAX_BET,
  CASINO_MIN_BET,
  COINS_EXAM_CORRECT,
  COINS_LEARN_CORRECT,
  SHOP_ITEMS,
  emptyEconomy,
  examBonusCoins,
  getShopItem,
  normalizeEconomy,
  rollCasino,
  type CasinoResult,
  type UserEconomy,
} from "@/lib/economy";
import { resolveUsername } from "@/lib/resolveUsername";

export type { CasinoResult } from "@/lib/economy";

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
  lastCoinToast: { amount: number; at: number } | null;

  setQuizHydrated: () => void;
  loadAndMergeFromServer: (username: string) => Promise<void>;
  recordAnswer: (questionId: string, isCorrect: boolean, mode?: SessionType) => number;
  saveSession: (score: number, totalQuestions: number, type: SessionType) => number;
  resetStats: () => void;
  startExam: (questionIds: string[]) => void;
  recordExamAnswer: (questionId: string, selectedIndex: number) => void;
  finishExam: () => ExamSessionState | null;
  clearExam: () => void;
  playCasino: (game: "roulette" | "plinko", bet: number) => CasinoResult | null;
  holdCasinoBet: (bet: number) => boolean;
  settleCasinoResult: (result: CasinoResult) => void;
  buyItem: (itemId: string) => boolean;
  equipItem: (itemId: string) => boolean;
  unequipSlot: (slot: keyof UserEconomy["equipped"]) => void;
  clearCoinToast: () => void;
}

const emptyQuiz: UserQuizData = {
  totalAnswered: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  history: [],
  questionStats: {},
  economy: emptyEconomy(),
};

function withEconomy(data: UserQuizData): UserQuizData {
  return { ...data, economy: normalizeEconomy(data.economy) };
}

function addCoins(data: UserQuizData, amount: number): UserQuizData {
  if (amount <= 0) return data;
  const economy = normalizeEconomy(data.economy);
  return {
    ...data,
    economy: {
      ...economy,
      coins: economy.coins + amount,
      totalEarned: economy.totalEarned + amount,
    },
  };
}

function applyUserData(
  set: (partial: Partial<QuizState>) => void,
  get: () => QuizState,
  username: string,
  data: UserQuizData,
) {
  const normalized = withEconomy(data);
  set({
    ...normalized,
    activeUsername: username,
    byUser: { ...get().byUser, [username]: normalized },
  });
}

async function pushToServer(username: string, data: UserQuizData): Promise<void> {
  try {
    const response = await fetch("/api/stats/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        stats: { ...withEconomy(data), lastActive: new Date().toISOString() },
      }),
    });
    if (response.ok) {
      const { useAuthStore } = await import("./useAuthStore");
      void useAuthStore.getState().fetchGlobalStats();
    }
  } catch {
    /* offline */
  }
}

let mergeInFlightFor: string | null = null;

function updateUser(
  get: () => QuizState,
  set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void,
  updater: (data: UserQuizData) => UserQuizData,
): UserQuizData | null {
  const username = resolveUsername(get().activeUsername);
  if (!username) return null;

  let next: UserQuizData | null = null;
  set((state) => {
    const current = withEconomy(state.byUser[username] ?? emptyQuiz);
    next = withEconomy(updater(current));
    const patch: Partial<QuizState> = {
      ...next,
      byUser: { ...state.byUser, [username]: next },
    };
    if (!state.activeUsername) {
      patch.activeUsername = username;
    }
    return { ...state, ...patch };
  });

  if (next) void pushToServer(username, next);
  return next;
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
      lastCoinToast: null,

      setQuizHydrated: () => set({ isQuizHydrated: true }),

      clearCoinToast: () => set({ lastCoinToast: null }),

      loadAndMergeFromServer: async (username) => {
        if (mergeInFlightFor === username) return;
        mergeInFlightFor = username;

        const local: StoredUserStats = {
          ...withEconomy(get().byUser[username] ?? emptyQuiz),
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
            const quizData: UserQuizData = withEconomy({
              totalAnswered: merged.totalAnswered,
              correctAnswers: merged.correctAnswers,
              wrongAnswers: merged.wrongAnswers,
              history: merged.history,
              questionStats: merged.questionStats,
              economy: merged.economy,
            });
            applyUserData(set, get, username, quizData);
            set({ isStatsReady: true });
            await pushToServer(username, quizData);
            return;
          }
        } catch {
          /* offline */
        } finally {
          mergeInFlightFor = null;
        }

        set({ isStatsReady: true });
      },

      recordAnswer: (questionId, isCorrect, mode = "nauka") => {
        const username = get().activeUsername;
        if (!username) return 0;

        const coinReward = isCorrect
          ? mode === "egzamin"
            ? COINS_EXAM_CORRECT
            : COINS_LEARN_CORRECT
          : 0;

        set((state) => {
          const prev = state.questionStats[questionId] ?? { attempts: 0, correct: 0 };
          let next: UserQuizData = {
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
            economy: normalizeEconomy(state.economy),
          };
          if (coinReward > 0) next = addCoins(next, coinReward);
          return {
            ...next,
            byUser: { ...state.byUser, [username]: next },
            lastCoinToast: coinReward > 0 ? { amount: coinReward, at: Date.now() } : state.lastCoinToast,
          };
        });

        const data = get().byUser[username];
        if (data) void pushToServer(username, data);
        return coinReward;
      },

      saveSession: (score, totalQuestions, type) => {
        const username = get().activeUsername;
        if (!username) return 0;

        const bonus =
          type === "egzamin" ? examBonusCoins(score, totalQuestions) : 0;

        set((state) => {
          let next: UserQuizData = {
            totalAnswered: state.totalAnswered,
            correctAnswers: state.correctAnswers,
            wrongAnswers: state.wrongAnswers,
            questionStats: state.questionStats,
            economy: normalizeEconomy(state.economy),
            history: [
              { date: new Date().toISOString(), score, totalQuestions, type },
              ...state.history,
            ].slice(0, 50),
          };
          if (bonus > 0) next = addCoins(next, bonus);
          return {
            history: next.history,
            economy: next.economy,
            byUser: { ...state.byUser, [username]: next },
            lastCoinToast: bonus > 0 ? { amount: bonus, at: Date.now() } : state.lastCoinToast,
          };
        });

        const data = get().byUser[username];
        if (data) void pushToServer(username, data);
        return bonus;
      },

      resetStats: () => {
        const username = get().activeUsername;
        if (!username) return;
        const keptEconomy = normalizeEconomy(get().byUser[username]?.economy);
        applyUserData(set, get, username, { ...emptyQuiz, economy: keptEconomy });
        void pushToServer(username, { ...emptyQuiz, economy: keptEconomy });
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

      playCasino: (game, rawBet) => {
        const economy = normalizeEconomy(get().economy);
        const result = rollCasino(game, rawBet, economy.coins);
        if (!result) return null;
        if (!get().holdCasinoBet(result.bet)) return null;
        get().settleCasinoResult(result);
        return result;
      },

      holdCasinoBet: (rawBet) => {
        const username = resolveUsername(get().activeUsername);
        if (!username) return false;

        let ok = false;
        set((state) => {
          const user = resolveUsername(state.activeUsername);
          if (!user) return state;
          const current = withEconomy(state.byUser[user] ?? emptyQuiz);
          const eco = normalizeEconomy(current.economy);
          if (rawBet < CASINO_MIN_BET || rawBet > CASINO_MAX_BET || rawBet > eco.coins) {
            return state;
          }
          ok = true;
          const next = withEconomy({
            ...current,
            economy: {
              ...eco,
              coins: eco.coins - rawBet,
              totalSpentCasino: eco.totalSpentCasino + rawBet,
            },
          });
          const patch: Partial<QuizState> = {
            ...next,
            byUser: { ...state.byUser, [user]: next },
          };
          if (!state.activeUsername) patch.activeUsername = user;
          return { ...state, ...patch };
        });

        if (ok) {
          const user = resolveUsername(get().activeUsername)!;
          const data = withEconomy(get().byUser[user] ?? emptyQuiz);
          void pushToServer(user, data);
        }
        return ok;
      },

      settleCasinoResult: (result) => {
        updateUser(get, set, (data) => {
          const eco = normalizeEconomy(data.economy);
          return {
            ...data,
            economy: {
              ...eco,
              coins: eco.coins + result.payout,
              totalEarned: result.net > 0 ? eco.totalEarned + result.net : eco.totalEarned,
            },
          };
        });
      },

      buyItem: (itemId) => {
        const item = getShopItem(itemId);
        if (!item) return false;

        const economy = normalizeEconomy(get().economy);
        if (economy.ownedItems.includes(itemId) || economy.coins < item.price) {
          return false;
        }

        updateUser(get, set, (data) => {
          const eco = normalizeEconomy(data.economy);
          return {
            ...data,
            economy: {
              ...eco,
              coins: eco.coins - item.price,
              ownedItems: [...eco.ownedItems, itemId],
              equipped: { ...eco.equipped, [item.slot]: itemId },
            },
          };
        });
        return true;
      },

      equipItem: (itemId) => {
        const item = SHOP_ITEMS.find((i) => i.id === itemId);
        if (!item) return false;
        const economy = normalizeEconomy(get().economy);
        if (!economy.ownedItems.includes(itemId)) return false;

        updateUser(get, set, (data) => ({
          ...data,
          economy: {
            ...normalizeEconomy(data.economy),
            equipped: {
              ...normalizeEconomy(data.economy).equipped,
              [item.slot]: itemId,
            },
          },
        }));
        return true;
      },

      unequipSlot: (slot) => {
        updateUser(get, set, (data) => {
          const eco = normalizeEconomy(data.economy);
          const equipped = { ...eco.equipped };
          delete equipped[slot];
          return { ...data, economy: { ...eco, equipped } };
        });
      },
    }),
    {
      name: "naukaair-quiz-v2",
      partialize: (state) => ({ byUser: state.byUser }),
      merge: (persisted, current) => {
        const saved = persisted as QuizPersisted | undefined;
        const byUser = saved?.byUser ?? {};
        const username = current.activeUsername;
        const userData = username
          ? withEconomy(byUser[username] ?? emptyQuiz)
          : emptyQuiz;
        return {
          ...current,
          byUser,
          ...userData,
        };
      },
      onRehydrateStorage: () => () => {
        useQuizStore.getState().setQuizHydrated();
        import("@/lib/initStats").then(({ maybeLoadStatsFromServer }) => {
          maybeLoadStatsFromServer();
        });
      },
    },
  ),
);

export { emptyUserStats };
