"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

function readUsernameFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("naukaair-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { username?: string | null } };
    return parsed.state?.username ?? null;
  } catch {
    return null;
  }
}

function getEffectiveUsername(storeUsername: string | null): string | null {
  return storeUsername ?? readUsernameFromStorage();
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const storeUsername = useAuthStore((s) => s.username);

  useEffect(() => {
    void useAuthStore.persist.rehydrate();

    const stored = readUsernameFromStorage();
    if (stored && !useAuthStore.getState().username) {
      useAuthStore.setState({ username: stored });
    }
  }, []);

  useEffect(() => {
    const username = getEffectiveUsername(useAuthStore.getState().username);

    if (!username && pathname !== "/login") {
      window.location.replace("/login");
      return;
    }

    if (username && pathname === "/login") {
      window.location.replace("/");
    }
  }, [pathname, storeUsername]);

  return <>{children}</>;
}
