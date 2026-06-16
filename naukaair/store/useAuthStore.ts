"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  login: (username: string) => Promise<boolean>;
  logout: () => void;
  setHydrated: () => void;
  fetchGlobalStats: () => Promise<void>;
  syncStatsToServer: () => Promise<void>;
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
        await get().fetchGlobalStats();
        return true;
      },

      logout: () => {
        set({ username: null });
      },

      fetchGlobalStats: async () => {
        try {
          const response = await fetch("/api/stats/global", { cache: "no-store" });
          if (!response.ok) return;
          const data = (await response.json()) as { users: GlobalUserSummary[] };
          set({ globalUsers: data.users });
        } catch {
          /* offline — keep cached */
        }
      },

      syncStatsToServer: async () => {
        const { username } = get();
        if (!username) return;

        const storageKey = `naukaair-quiz-${username}`;
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;

        try {
          const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
          const stats = parsed.state;
          if (!stats) return;

          await fetch("/api/stats/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, stats }),
          });
          await get().fetchGlobalStats();
        } catch {
          /* ignore sync errors */
        }
      },
    }),
    {
      name: "naukaair-auth",
      partialize: (state) => ({ username: state.username }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
