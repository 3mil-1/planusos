"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CASINO_BET_STEP,
  CASINO_MAX_BET,
  CASINO_MIN_BET,
  ROULETTE_SEGMENTS,
  rollCasino,
  type CasinoResult,
} from "@/lib/economy";
import { useQuizStore } from "@/store/useQuizStore";
import { cn } from "@/lib/utils";
import { WinBurst } from "./WinBurst";

const SEGMENT_ANGLE = 360 / ROULETTE_SEGMENTS.length;
const SPIN_MS = 4800;

function segmentPath(index: number, innerR: number, outerR: number): string {
  const start = (index * SEGMENT_ANGLE - 90) * (Math.PI / 180);
  const end = ((index + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180);
  const x1 = 50 + outerR * Math.cos(start);
  const y1 = 50 + outerR * Math.sin(start);
  const x2 = 50 + outerR * Math.cos(end);
  const y2 = 50 + outerR * Math.sin(end);
  const x3 = 50 + innerR * Math.cos(end);
  const y3 = 50 + innerR * Math.sin(end);
  const x4 = 50 + innerR * Math.cos(start);
  const y4 = 50 + innerR * Math.sin(start);
  const large = SEGMENT_ANGLE > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${large} 0 ${x4} ${y4} Z`;
}

function labelPos(index: number): { x: number; y: number; rotate: number } {
  const mid = (index + 0.5) * SEGMENT_ANGLE - 90;
  const rad = mid * (Math.PI / 180);
  return {
    x: 50 + 34 * Math.cos(rad),
    y: 50 + 34 * Math.sin(rad),
    rotate: mid + 90,
  };
}

/** Koło zatrzymuje się tak, że środek segmentu `slotIndex` jest pod wskaźnikiem u góry. */
function spinDelta(slotIndex: number): number {
  const fullSpins = 5 + Math.floor(Math.random() * 3);
  return fullSpins * 360 + (360 - (slotIndex + 0.5) * SEGMENT_ANGLE);
}

function easeOutQuint(t: number): number {
  return 1 - (1 - t) ** 5;
}

export function RouletteGame() {
  const coins = useQuizStore((s) => s.economy?.coins ?? 0);
  const holdCasinoBet = useQuizStore((s) => s.holdCasinoBet);
  const settleCasinoResult = useQuizStore((s) => s.settleCasinoResult);

  const wheelRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [bet, setBet] = useState(CASINO_MIN_BET);
  const [spinning, setSpinning] = useState(false);
  const [wheelBlur, setWheelBlur] = useState(false);
  const [pointerBounce, setPointerBounce] = useState(false);
  const [tickFlash, setTickFlash] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<CasinoResult | null>(null);
  const pendingRef = useRef<CasinoResult | null>(null);
  const lastTickSegRef = useRef(-1);

  const canPlay = coins >= CASINO_MIN_BET && bet >= CASINO_MIN_BET && bet <= coins && !spinning;

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const applyWheelRotation = useCallback((deg: number) => {
    rotationRef.current = deg;
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${deg}deg)`;
    }
  }, []);

  const spin = useCallback(() => {
    if (!canPlay) return;

    const preview = rollCasino("roulette", bet, coins);
    if (!preview || !holdCasinoBet(preview.bet)) return;

    pendingRef.current = preview;
    setSpinning(true);
    setShowResult(false);
    setLastResult(null);
    setActiveSlot(null);
    setWheelBlur(true);
    lastTickSegRef.current = -1;

    const startRot = rotationRef.current;
    const delta = spinDelta(preview.slotIndex);
    const endRot = startRot + delta;
    const t0 = performance.now();

    const animate = (now: number) => {
      const raw = Math.min(1, (now - t0) / SPIN_MS);
      const eased = easeOutQuint(raw);
      const current = startRot + delta * eased;
      applyWheelRotation(current);

      const norm = ((current % 360) + 360) % 360;
      const segUnderPointer = Math.floor(((360 - norm + SEGMENT_ANGLE / 2) % 360) / SEGMENT_ANGLE) % ROULETTE_SEGMENTS.length;
      if (segUnderPointer !== lastTickSegRef.current && raw < 0.92) {
        lastTickSegRef.current = segUnderPointer;
        setTickFlash(true);
        window.setTimeout(() => setTickFlash(false), 60);
      }

      if (raw < 0.35) setWheelBlur(true);
      else setWheelBlur(false);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        applyWheelRotation(endRot);
        setWheelBlur(false);
        setPointerBounce(true);
        window.setTimeout(() => setPointerBounce(false), 500);

        const result = pendingRef.current;
        if (result) {
          settleCasinoResult(result);
          setActiveSlot(result.slotIndex);
          setLastResult(result);
          setShowResult(true);
        }
        setSpinning(false);
        pendingRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [applyWheelRotation, bet, canPlay, coins, holdCasinoBet, settleCasinoResult]);

  return (
    <div className="casino-panel-roulette space-y-6">
      <p className="text-sm text-amber-100/70">
        Stawka schodzi od razu — wypłata dopiero po zatrzymaniu. Koło ma prawdziwe hamowanie, nie
        sztywny CSS.
      </p>

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
        <div className="relative">
          <div
            className={cn(
              "casino-wheel-glow absolute inset-0 rounded-full transition-opacity duration-300",
              spinning && "opacity-100",
              !spinning && "opacity-70",
            )}
          />
          <div
            className={cn(
              "absolute -top-5 left-1/2 z-20 -translate-x-1/2 transition-transform",
              pointerBounce && "casino-pointer-bounce",
            )}
          >
            <div className="casino-pointer relative h-0 w-0 border-x-[14px] border-b-[26px] border-x-transparent border-b-amber-300 drop-shadow-[0_0_16px_rgba(252,211,77,1)]" />
            <div className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-200 shadow-[0_0_10px_#fde047]" />
          </div>

          <div
            className={cn(
              "relative rounded-full border-4 border-amber-500/40 p-1 shadow-[0_0_40px_rgba(251,191,36,0.25)]",
              tickFlash && "casino-rim-flash",
            )}
          >
            <div
              ref={wheelRef}
              className={cn(
                "relative h-64 w-64 will-change-transform md:h-80 md:w-80",
                wheelBlur && "casino-wheel-blur",
              )}
              style={{ transform: `rotate(${rotationRef.current}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-2xl">
                <defs>
                  <radialGradient id="wheelHub" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#020617" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="49" fill="#0f172a" stroke="#fbbf24" strokeWidth="0.8" />
                {ROULETTE_SEGMENTS.map((seg, i) => (
                  <path
                    key={seg.label}
                    d={segmentPath(i, 15, 48)}
                    fill={seg.color}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="0.2"
                    className={cn(activeSlot === i && "casino-segment-win")}
                    style={
                      activeSlot === i
                        ? { filter: `drop-shadow(0 0 10px ${seg.glow ?? seg.color})` }
                        : undefined
                    }
                  />
                ))}
                {ROULETTE_SEGMENTS.map((seg, i) => {
                  const pos = labelPos(i);
                  return (
                    <text
                      key={`lbl-${seg.label}`}
                      x={pos.x}
                      y={pos.y}
                      fill="white"
                      fontSize="4.5"
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${pos.rotate}, ${pos.x}, ${pos.y})`}
                    >
                      {seg.label}
                    </text>
                  );
                })}
                <circle cx="50" cy="50" r="14" fill="url(#wheelHub)" stroke="#fbbf24" strokeWidth="0.6" />
                <text x="50" y="51" fill="#fde68a" fontSize="3" fontWeight="800" textAnchor="middle">
                  SPIN
                </text>
              </svg>
            </div>
          </div>

          <WinBurst
            show={showResult && lastResult !== null}
            multiplier={lastResult?.multiplier ?? 0}
            net={lastResult?.net ?? 0}
            label={lastResult?.label ?? ""}
          />
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div className="rounded-xl border border-amber-500/20 bg-black/30 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-amber-200/60">Saldo</p>
            <p className="text-2xl font-black tabular-nums text-amber-100">
              {coins.toLocaleString("pl-PL")} pkt
            </p>
            {spinning && (
              <p className="mt-1 animate-pulse text-xs text-amber-300/80">Hamowanie koła…</p>
            )}
          </div>

          <div>
            <label className="text-sm text-amber-100/70">
              Stawka ({CASINO_MIN_BET}–{CASINO_MAX_BET})
            </label>
            <input
              type="range"
              min={CASINO_MIN_BET}
              max={Math.min(CASINO_MAX_BET, Math.max(coins, CASINO_MIN_BET))}
              step={CASINO_BET_STEP}
              value={Math.min(bet, Math.max(coins, CASINO_MIN_BET))}
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
              "casino-spin-btn w-full rounded-xl py-3.5 text-lg font-black uppercase tracking-wide text-amber-950 transition-all",
              canPlay
                ? "bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:brightness-110"
                : "cursor-not-allowed bg-slate-700 text-slate-500",
              spinning && "scale-[0.98] opacity-80",
            )}
          >
            {spinning ? "Kręci się…" : "Zakręć!"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {ROULETTE_SEGMENTS.map((seg) => (
          <span
            key={seg.label}
            className="rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: seg.color, boxShadow: `0 0 12px ${seg.glow ?? seg.color}55` }}
          >
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
