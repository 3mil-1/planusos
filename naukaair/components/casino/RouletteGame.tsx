"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CASINO_BET_STEP,
  CASINO_MAX_BET,
  CASINO_MIN_BET,
  ROULETTE_SEGMENTS,
  normalizeEconomy,
} from "@/lib/economy";
import { useQuizStore } from "@/store/useQuizStore";
import { cn } from "@/lib/utils";

const SEGMENT_ANGLE = 360 / ROULETTE_SEGMENTS.length;

export function RouletteGame() {
  const playCasino = useQuizStore((s) => s.playCasino);
  const coins = useQuizStore((s) => normalizeEconomy(s.economy).coins);
  const [bet, setBet] = useState(CASINO_MIN_BET);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const canPlay = coins >= CASINO_MIN_BET && bet >= CASINO_MIN_BET && bet <= coins && !spinning;

  const wheelGradient = useMemo(() => {
    let from = 0;
    const stops: string[] = [];
    for (const seg of ROULETTE_SEGMENTS) {
      const to = from + SEGMENT_ANGLE;
      stops.push(`${seg.color} ${from}deg ${to}deg`);
      from = to;
    }
    return `conic-gradient(from -90deg, ${stops.join(", ")})`;
  }, []);

  const spin = useCallback(() => {
    if (!canPlay) return;
    setSpinning(true);
    setLastResult(null);

    const result = playCasino("roulette", bet);
    if (!result) {
      setSpinning(false);
      return;
    }

    const targetAngle =
      360 * 5 + (360 - result.slotIndex * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);

    setRotation((prev) => prev + targetAngle);

    window.setTimeout(() => {
      setSpinning(false);
      const sign = result.net >= 0 ? "+" : "";
      setLastResult(`${result.label} → ${sign}${result.net} pkt (wygrana ${result.payout})`);
    }, 3200);
  }, [bet, canPlay, playCasino]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Postaw punkty i zakręć kołem. Średni zwrot ~87% — długoterminowo opłaca się uczyć,
        ale szczęśliwy spin może pomnożyć stawkę ×5.
      </p>

      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
        <div className="relative">
          <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[10px] border-b-[16px] border-x-transparent border-b-amber-400" />
          </div>
          <div
            className="h-56 w-56 rounded-full border-4 border-slate-700 shadow-xl transition-transform duration-[3200ms] ease-out md:h-64 md:w-64"
            style={{
              background: wheelGradient,
              transform: `rotate(${rotation}deg)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-900 text-xs font-bold text-white">
              RULETKA
            </div>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div>
            <label className="text-sm text-slate-400">Stawka ({CASINO_MIN_BET}–{CASINO_MAX_BET})</label>
            <input
              type="range"
              min={CASINO_MIN_BET}
              max={Math.min(CASINO_MAX_BET, coins)}
              step={CASINO_BET_STEP}
              value={Math.min(bet, coins)}
              disabled={coins < CASINO_MIN_BET || spinning}
              onChange={(e) => setBet(Number(e.target.value))}
              className="mt-2 w-full accent-amber-400"
            />
            <p className="mt-1 text-center text-lg font-bold text-amber-200">{bet} pkt</p>
          </div>

          <button
            type="button"
            disabled={!canPlay}
            onClick={spin}
            className={cn(
              "w-full rounded-xl py-3 font-semibold text-white transition-all",
              canPlay
                ? "bg-amber-500 hover:bg-amber-400 focus:ring-2 focus:ring-amber-500/50"
                : "cursor-not-allowed bg-slate-700 text-slate-500",
            )}
          >
            {spinning ? "Kręci się…" : "Zakręć!"}
          </button>

          {lastResult && (
            <p className="animate-fade-in rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-center text-sm text-slate-200">
              {lastResult}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {ROULETTE_SEGMENTS.map((seg) => (
          <span
            key={seg.label}
            className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
            style={{ backgroundColor: seg.color }}
          >
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
