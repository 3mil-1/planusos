"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuizStore } from "./useQuizStore";

import type { EquippedCosmetics } from "@/lib/economy";

export interface GlobalUserSummary {
  username: string;
  totalAnswered: number;
  correctAnswers: number;
  accuracy: number;
  lastActive: string;
  coins: number;
  equipped: EquippedCosmetics;
}

interface AuthState {
  username: string | null;
  isHydrated: boolean;
  globalUsers: GlobalUserSummary[];
  globalStatsLoading: boolean;
  storagePersistent: boolean;
  login: (username: string) => Promise<boolean>;
  logout: () => void;
  setHydrated: () => void;
  fetchGlobalStats: () => Promise<void>;
}

function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      username: null,
      isHydrated: false,
      globalUsers: [],
      globalStatsLoading: false,
      storagePersistent: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (rawUsername: string) => {
        const username = normalizeUsername(rawUsername);
        if (username.length < 2 || username.length > 32) {
          return false;
        }

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        if (!response.ok) {
          return false;
        }

        set({ username });
        await useQuizStore.getState().loadAndMergeFromServer(username);
        await get().fetchGlobalStats();
        return true;
      },

      logout: () => {
        set({ username: null, globalUsers: [], globalStatsLoading: false });
        useQuizStore.setState({
          activeUsername: null,
          isStatsReady: false,
          totalAnswered: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          history: [],
          questionStats: {},
          economy: undefined,
        });
      },

      fetchGlobalStats: async () => {
        set({ globalStatsLoading: true });

        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            const response = await fetch("/api/stats/global", { cache: "no-store" });
            if (!response.ok) {
              await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
              continue;
            }

            const data = (await response.json()) as {
              users: GlobalUserSummary[];
              persistent?: boolean;
            };
            set({
              globalUsers: data.users,
              storagePersistent: Boolean(data.persistent),
              globalStatsLoading: false,
            });
            return;
          } catch {
            await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          }
        }

        set({ globalStatsLoading: false });
      },
    }),
    {
      name: "naukaair-auth",
      partialize: (state) => ({
        username: state.username,
        globalUsers: state.globalUsers,
        storagePersistent: state.storagePersistent,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
        import("@/lib/initStats").then(({ maybeLoadStatsFromServer }) => {
          maybeLoadStatsFromServer();
        });
        void state?.fetchGlobalStats();
      },
    },
  ),
);
