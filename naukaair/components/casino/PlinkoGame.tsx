"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CASINO_BET_STEP,
  CASINO_MAX_BET,
  CASINO_MIN_BET,
  PLINKO_SLOTS,
  rollCasino,
  type CasinoResult,
} from "@/lib/economy";
import { useQuizStore } from "@/store/useQuizStore";
import { cn } from "@/lib/utils";
import { WinBurst } from "./WinBurst";

const ROWS = 9;
const COLS = PLINKO_SLOTS.length;

function buildPath(slotIndex: number): number[] {
  const path: number[] = [Math.floor(COLS / 2)];
  let col = path[0];
  for (let row = 1; row <= ROWS; row += 1) {
    const remaining = ROWS - row + 1;
    const needRight = slotIndex - col;
    let goRight: boolean;
    if (needRight <= 0) goRight = false;
    else if (needRight >= remaining) goRight = true;
    else goRight = Math.random() < 0.5;
    if (goRight && col < COLS - 1) col += 1;
    else if (!goRight && col > 0) col -= 1;
    path.push(col);
  }
  path[path.length - 1] = slotIndex;
  return path;
}

function colToPercent(col: number): number {
  return ((col + 0.5) / COLS) * 100;
}

function rowToPercent(row: number): number {
  return ((row + 0.5) / (ROWS + 1.6)) * 100;
}

export function PlinkoGame() {
  const coins = useQuizStore((s) => s.economy?.coins ?? 0);
  const holdCasinoBet = useQuizStore((s) => s.holdCasinoBet);
  const settleCasinoResult = useQuizStore((s) => s.settleCasinoResult);
  const rafRef = useRef<number | null>(null);

  const [bet, setBet] = useState(CASINO_MIN_BET);
  const [dropping, setDropping] = useState(false);
  const [ball, setBall] = useState<{ x: number; y: number; scale: number } | null>(null);
  const [flashRow, setFlashRow] = useState<number | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<CasinoResult | null>(null);
  const pendingRef = useRef<CasinoResult | null>(null);

  const canPlay = coins >= CASINO_MIN_BET && bet >= CASINO_MIN_BET && bet <= coins && !dropping;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const drop = useCallback(() => {
    if (!canPlay) return;

    const preview = rollCasino("plinko", bet, coins);
    if (!preview || !holdCasinoBet(preview.bet)) return;

    pendingRef.current = preview;
    setDropping(true);
    setShowResult(false);
    setLastResult(null);
    setActiveSlot(null);

    const path = buildPath(preview.slotIndex);
    const waypoints = path.map((col, row) => ({
      x: colToPercent(col),
      y: row === 0 ? 3 : rowToPercent(row - 1),
    }));
    waypoints.push({ x: colToPercent(preview.slotIndex), y: 88 });

    const start = performance.now();
    const duration = 3000;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 2.4;
      const totalSeg = waypoints.length - 1;
      const pos = eased * totalSeg;
      const seg = Math.min(Math.floor(pos), totalSeg - 1);
      const local = pos - seg;
      const a = waypoints[seg];
      const b = waypoints[seg + 1];
      const bounce = Math.sin(local * Math.PI) * 4;
      const x = a.x + (b.x - a.x) * local;
      const y = a.y + (b.y - a.y) * local - bounce;
      const scale = 1 + Math.sin(local * Math.PI) * 0.4;

      setBall({ x, y, scale });
      setFlashRow(seg);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        const result = pendingRef.current;
        if (result) {
          settleCasinoResult(result);
          setActiveSlot(result.slotIndex);
          setLastResult(result);
          setShowResult(true);
        }
        setDropping(false);
        pendingRef.current = null;
        window.setTimeout(() => {
          setBall(null);
          setFlashRow(null);
        }, 1500);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [bet, canPlay, coins, holdCasinoBet, settleCasinoResult]);

  return (
    <div className="casino-panel-plinko space-y-6">
      <p className="text-sm text-violet-100/70">
        Kulka spada przez labirynt kołków — wypłata dopiero po wylądowaniu w slocie. Im bardziej na
        skraj, tym wyższy mnożnik (i mniejsze szanse).
      </p>

      <div className="mx-auto max-w-lg">
        <div className="casino-plinko-board relative overflow-hidden rounded-2xl border border-violet-400/30 p-1">
          <div className="relative aspect-[4/5] w-full">
            {Array.from({ length: ROWS }).map((_, row) => (
              <div
                key={row}
                className="absolute flex w-full justify-center gap-[6%]"
                style={{ top: `${rowToPercent(row)}%`, transform: "translateY(-50%)" }}
              >
                {Array.from({ length: row + 3 }).map((__, peg) => (
                  <div
                    key={peg}
                    className={cn(
                      "h-2.5 w-2.5 shrink-0 rounded-full bg-violet-300/90 shadow-[0_0_10px_rgba(167,139,250,0.9)] transition-all duration-100",
                      flashRow === row + 1 && "scale-150 bg-white shadow-[0_0_16px_#fff]",
                    )}
                  />
                ))}
              </div>
            ))}

            {ball && (
              <div
                className="absolute z-10 h-5 w-5 rounded-full bg-gradient-to-br from-amber-200 to-orange-500 shadow-[0_0_20px_rgba(251,191,36,0.9)]"
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  transform: `translate(-50%, -50%) scale(${ball.scale})`,
                }}
              />
            )}

            <div className="absolute bottom-[4%] flex w-full gap-1 px-[4%]">
              {PLINKO_SLOTS.map((slot, i) => (
                <div
                  key={slot.label}
                  className={cn(
                    "flex flex-1 flex-col items-center rounded-lg py-2 text-[10px] font-black text-white transition-all duration-300 md:text-xs",
                    activeSlot === i && "casino-slot-win z-10 scale-110",
                  )}
                  style={{
                    backgroundColor: slot.color,
                    boxShadow:
                      activeSlot === i
                        ? `0 0 24px ${slot.glow ?? slot.color}`
                        : `0 0 8px ${slot.glow ?? slot.color}44`,
                  }}
                >
                  {slot.label}
                </div>
              ))}
            </div>

            <WinBurst
              show={showResult && lastResult !== null}
              multiplier={lastResult?.multiplier ?? 0}
              net={lastResult?.net ?? 0}
              label={lastResult?.label ?? ""}
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-violet-500/25 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-violet-200/60">Saldo</p>
            <p className="text-2xl font-black tabular-nums text-violet-100">
              {coins.toLocaleString("pl-PL")} pkt
            </p>
            {dropping && (
              <p className="mt-1 animate-pulse text-xs text-violet-300/80">Kulka w locie…</p>
            )}
          </div>

          <div>
            <label className="text-sm text-violet-100/70">Stawka</label>
            <input
              type="range"
              min={CASINO_MIN_BET}
              max={Math.min(CASINO_MAX_BET, Math.max(coins, CASINO_MIN_BET))}
              step={CASINO_BET_STEP}
              value={Math.min(bet, Math.max(coins, CASINO_MIN_BET))}
              disabled={coins < CASINO_MIN_BET || dropping}
              onChange={(e) => setBet(Number(e.target.value))}
              className="mt-2 w-full accent-violet-400"
            />
            <p className="mt-1 text-center text-lg font-bold text-violet-200">{bet} pkt</p>
          </div>

          <button
            type="button"
            disabled={!canPlay}
            onClick={drop}
            className={cn(
              "w-full rounded-xl py-3.5 text-lg font-black uppercase tracking-wide transition-all",
              canPlay
                ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600 text-white hover:brightness-110"
                : "cursor-not-allowed bg-slate-700 text-slate-500",
            )}
          >
            {dropping ? "Spada…" : "Puść kulkę!"}
          </button>
        </div>
      </div>
    </div>
  );
}
