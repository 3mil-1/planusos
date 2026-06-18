"use client";

import { cn } from "@/lib/utils";

interface WinBurstProps {
  show: boolean;
  multiplier: number;
  net: number;
  label: string;
}

export function WinBurst({ show, multiplier, net, label }: WinBurstProps) {
  if (!show) return null;

  const bigWin = multiplier >= 3;
  const win = net > 0;

  return (
    <div
      className={cn(
        "casino-win-burst pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
        bigWin && "casino-win-burst-big",
      )}
    >
      <div
        className={cn(
          "casino-win-flash rounded-2xl border px-6 py-4 text-center shadow-2xl backdrop-blur-sm",
          win
            ? bigWin
              ? "border-amber-300/60 bg-amber-500/20 text-amber-100"
              : "border-emerald-400/50 bg-emerald-500/15 text-emerald-100"
            : "border-slate-500/40 bg-slate-900/80 text-slate-300",
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          {win ? (bigWin ? "Jackpot!" : "Wygrana!") : "Pech…"}
        </p>
        <p className="mt-1 text-4xl font-black tabular-nums">{label}</p>
        <p
          className={cn(
            "mt-2 text-xl font-bold tabular-nums",
            win ? "text-emerald-300" : "text-red-300",
          )}
        >
          {net >= 0 ? "+" : ""}
          {net} pkt
        </p>
      </div>
      {bigWin && (
        <div className="casino-confetti" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
      )}
    </div>
  );
}
