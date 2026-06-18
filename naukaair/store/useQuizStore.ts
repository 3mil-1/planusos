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
  PLINKO_SLOTS,
  ROULETTE_SEGMENTS,
  SHOP_ITEMS,
  calcCasinoPayout,
  clampBet,
  emptyEconomy,
  examBonusCoins,
  getShopItem,
  normalizeEconomy,
  pickWeightedSegment,
  type UserEconomy,
} from "@/lib/economy";

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

export interface CasinoResult {
  game: "roulette" | "plinko";
  bet: number;
  multiplier: number;
  label: string;
  payout: number;
  net: number;
  slotIndex: number;
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

function updateUser(
  get: () => QuizState,
  set: (partial: Partial<QuizState> | ((state: QuizState) => Partial<QuizState>)) => void,
  updater: (data: UserQuizData) => UserQuizData,
): UserQuizData | null {
  const username = get().activeUsername;
  if (!username) return null;

  let next: UserQuizData | null = null;
  set((state) => {
    const current = withEconomy(state.byUser[username] ?? emptyQuiz);
    next = withEconomy(updater(current));
    return {
      ...next,
      byUser: { ...state.byUser, [username]: next },
    };
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
            const { useAuthStore } = await import("./useAuthStore");
            void useAuthStore.getState().fetchGlobalStats();
            return;
          }
        } catch {
          /* offline */
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
        const username = get().activeUsername;
        if (!username) return null;

        const economy = normalizeEconomy(get().economy);
        const bet = clampBet(rawBet, economy.coins);
        if (bet < CASINO_MIN_BET || bet > CASINO_MAX_BET || bet > economy.coins) {
          return null;
        }

        const segments = game === "roulette" ? ROULETTE_SEGMENTS : PLINKO_SLOTS;
        const segment = pickWeightedSegment(segments);
        const slotIndex = segments.indexOf(segment);
        const payout = calcCasinoPayout(bet, segment.multiplier);
        const net = payout - bet;

        updateUser(get, set, (data) => {
          const eco = normalizeEconomy(data.economy);
          return {
            ...data,
            economy: {
              ...eco,
              coins: eco.coins - bet + payout,
              totalSpentCasino: eco.totalSpentCasino + bet,
              totalEarned: net > 0 ? eco.totalEarned + net : eco.totalEarned,
            },
          };
        });

        return {
          game,
          bet,
          multiplier: segment.multiplier,
          label: segment.label,
          payout,
          net,
          slotIndex,
        };
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
