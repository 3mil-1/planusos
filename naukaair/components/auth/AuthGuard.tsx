"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const PUBLIC_PATHS = ["/login"];
const HYDRATION_TIMEOUT_MS = 2500;

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const username = useAuthStore((s) => s.username);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false);

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const ready = isHydrated || hydrationTimedOut;

  useEffect(() => {
    const finish = () => useAuthStore.getState().setHydrated();
    const unsub = useAuthStore.persist.onFinishHydration(finish);
    const timeout = window.setTimeout(() => {
      finish();
      setHydrationTimedOut(true);
    }, HYDRATION_TIMEOUT_MS);

    return () => {
      unsub();
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!username && !isPublic) {
      router.replace("/login");
      return;
    }

    if (username && pathname === "/login") {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- router stabilny; bez fetchGlobalStats (powodowało pętlę #185)
  }, [username, ready, pathname, isPublic]);

  if (!ready && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
        <div className="animate-pulse text-sm tracking-wide">Ładowanie naukaair…</div>
      </div>
    );
  }

  if (ready && !username && !isPublic) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-300">
        <div className="animate-pulse text-sm tracking-wide">Przekierowanie…</div>
      </div>
    );
  }

  return <>{children}</>;
}
