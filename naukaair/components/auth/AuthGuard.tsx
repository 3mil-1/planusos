"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PUBLIC_PATHS = ["/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { username, isHydrated, fetchGlobalStats } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!username && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
      return;
    }

    if (username && pathname === "/login") {
      router.replace("/");
      return;
    }

    if (username) {
      void fetchGlobalStats();
    }
  }, [username, isHydrated, pathname, router, fetchGlobalStats]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
        <div className="animate-pulse text-sm tracking-wide">Ładowanie naukaair…</div>
      </div>
    );
  }

  if (!username && !PUBLIC_PATHS.includes(pathname)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
        <div className="animate-pulse text-sm tracking-wide">Przekierowanie…</div>
      </div>
    );
  }

  return <>{children}</>;
}
