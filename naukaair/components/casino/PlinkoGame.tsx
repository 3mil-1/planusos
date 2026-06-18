"use client";

import { useCallback, useState } from "react";
import {
  CASINO_BET_STEP,
  CASINO_MAX_BET,
  CASINO_MIN_BET,
  PLINKO_SLOTS,
  normalizeEconomy,
} from "@/lib/economy";
import { useQuizStore } from "@/store/useQuizStore";
import { cn } from "@/lib/utils";

const ROWS = 8;
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

export function PlinkoGame() {
  const playCasino = useQuizStore((s) => s.playCasino);
  const coins = useQuizStore((s) => normalizeEconomy(s.economy).coins);
  const [bet, setBet] = useState(CASINO_MIN_BET);
  const [dropping, setDropping] = useState(false);
  const [ballCol, setBallCol] = useState<number | null>(null);
  const [ballRow, setBallRow] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const canPlay = coins >= CASINO_MIN_BET && bet >= CASINO_MIN_BET && bet <= coins && !dropping;

  const drop = useCallback(() => {
    if (!canPlay) return;
    setDropping(true);
    setLastResult(null);

    const result = playCasino("plinko", bet);
    if (!result) {
      setDropping(false);
      return;
    }

    const path = buildPath(result.slotIndex);
    setBallCol(path[0]);
    setBallRow(0);

    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      if (step <= ROWS) {
        setBallRow(step);
        setBallCol(path[step]);
      } else {
        window.clearInterval(interval);
        setDropping(false);
        const sign = result.net >= 0 ? "+" : "";
        setLastResult(`${result.label} → ${sign}${result.net} pkt (wygrana ${result.payout})`);
        window.setTimeout(() => {
          setBallCol(null);
          setBallRow(0);
        }, 1200);
      }
    }, 180);
  }, [bet, canPlay, playCasino]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Puść kulkę — odbija się między kołkami i ląduje w slocie z mnożnikiem. Ta sama ekonomia
        co ruletka: szansa na ×5, ale statystycznie wygrywa dom.
      </p>

      <div className="mx-auto max-w-md">
        <div className="relative rounded-xl border border-slate-700 bg-slate-950/80 p-4">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-xs">
            {Array.from({ length: ROWS }).map((_, row) => (
              <div
                key={row}
                className="absolute flex w-full justify-center gap-3"
                style={{ top: `${(row / (ROWS + 1)) * 100}%`, transform: "translateY(-50%)" }}
              >
                {Array.from({ length: row + 3 }).map((__, peg) => (
                  <div
                    key={peg}
                    className="h-2 w-2 shrink-0 rounded-full bg-slate-600"
                  />
                ))}
              </div>
            ))}

            {ballCol !== null && (
              <div
                className="absolute h-4 w-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50 transition-all duration-150"
                style={{
                  left: `${((ballCol + 0.5) / COLS) * 100}%`,
                  top: `${(ballRow / (ROWS + 1)) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}

            <div
              className="absolute bottom-0 flex w-full gap-1"
              style={{ transform: "translateY(50%)" }}
            >
              {PLINKO_SLOTS.map((slot) => (
                <div
                  key={slot.label}
                  className="flex flex-1 flex-col items-center rounded-md py-1 text-[10px] font-bold text-white"
                  style={{ backgroundColor: slot.color }}
                >
                  {slot.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm text-slate-400">Stawka</label>
            <input
              type="range"
              min={CASINO_MIN_BET}
              max={Math.min(CASINO_MAX_BET, coins)}
              step={CASINO_BET_STEP}
              value={Math.min(bet, coins)}
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
              "w-full rounded-xl py-3 font-semibold text-white transition-all",
              canPlay
                ? "bg-violet-500 hover:bg-violet-400 focus:ring-2 focus:ring-violet-500/50"
                : "cursor-not-allowed bg-slate-700 text-slate-500",
            )}
          >
            {dropping ? "Spada…" : "Puść kulkę!"}
          </button>

          {lastResult && (
            <p className="animate-fade-in rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-center text-sm text-slate-200">
              {lastResult}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
