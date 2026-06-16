"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQuizStore } from "./useQuizStore";

export interface GlobalUserSummary {
  username: string;
  totalAnswered: number;
  correctAnswers: number;
  accuracy: number;
  lastActive: string;
}

interface AuthState {
  username: string | null;
  isHydrated: boolean;
  globalUsers: GlobalUserSummary[];
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
        set({ username: null });
        useQuizStore.setState({
          activeUsername: null,
          isStatsReady: false,
          totalAnswered: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
          history: [],
          questionStats: {},
        });
      },

      fetchGlobalStats: async () => {
        try {
          const response = await fetch("/api/stats/global", { cache: "no-store" });
          if (!response.ok) return;
          const data = (await response.json()) as {
            users: GlobalUserSummary[];
            persistent?: boolean;
          };
          set({
            globalUsers: data.users,
            storagePersistent: Boolean(data.persistent),
          });
        } catch {
          /* offline */
        }
      },
    }),
    {
      name: "naukaair-auth",
      partialize: (state) => ({ username: state.username }),
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
