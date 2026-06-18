"use client";

import { useState } from "react";
import { CircleDot, Dices, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CoinDisplay } from "@/components/economy/CoinDisplay";
import { RouletteGame } from "@/components/casino/RouletteGame";
import { PlinkoGame } from "@/components/casino/PlinkoGame";
import { NavAnchor } from "@/components/ui/NavAnchor";
import {
  COINS_EXAM_CORRECT,
  COINS_EXAM_PASS_BONUS,
  COINS_EXAM_PERFECT_BONUS,
  COINS_LEARN_CORRECT,
} from "@/lib/economy";
import { cn } from "@/lib/utils";

type GameTab = "roulette" | "plinko";

export default function CasinoPage() {
  const [tab, setTab] = useState<GameTab>("roulette");

  return (
    <div className="casino-hero -mx-4 space-y-8 rounded-3xl px-4 py-8 animate-fade-in md:-mx-0 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400/80">Jackpot zone</p>
          <h1 className="mt-1 text-3xl font-black text-white">
            Kasyno <span className="bg-gradient-to-r from-amber-300 to-fuchsia-400 bg-clip-text text-transparent">naukaair</span>
          </h1>
          <p className="mt-2 max-w-xl text-slate-300">
            Neon, dźwięk wyobraźni i adrenalinowy spin. Punkty z nauki — wypłata dopiero po wyniku.
          </p>
        </div>
        <CoinDisplay className="border-amber-400/40 bg-black/40 text-lg" />
      </div>

      <Card className="border-amber-500/25 bg-black/25 backdrop-blur-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-200/80">
          <Sparkles className="h-4 w-4" />
          Jak zdobywać punkty
        </h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <li>• Nauka — +{COINS_LEARN_CORRECT} pkt za poprawną</li>
          <li>• Egzamin — +{COINS_EXAM_CORRECT} pkt za poprawną</li>
          <li>• Egzamin ≥70% — bonus +{COINS_EXAM_PASS_BONUS} pkt</li>
          <li>• Egzamin 100% — dodatkowo +{COINS_EXAM_PERFECT_BONUS} pkt</li>
        </ul>
        <NavAnchor
          href="/shop"
          className="mt-4 inline-block text-sm font-medium text-fuchsia-300 hover:text-fuchsia-200"
        >
          → Sklep z kosmetykami AGH do rankingu
        </NavAnchor>
      </Card>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("roulette")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all",
            tab === "roulette"
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 shadow-[0_0_20px_rgba(251,191,36,0.4)]"
              : "border border-amber-500/30 text-amber-100/80 hover:bg-amber-500/10",
          )}
        >
          <CircleDot className="h-4 w-4" />
          Ruletka
        </button>
        <button
          type="button"
          onClick={() => setTab("plinko")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all",
            tab === "plinko"
              ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]"
              : "border border-violet-500/30 text-violet-100/80 hover:bg-violet-500/10",
          )}
        >
          <Dices className="h-4 w-4" />
          Plinko
        </button>
      </div>

      <Card className="overflow-hidden border-white/10 bg-black/35 backdrop-blur-md">
        {tab === "roulette" ? <RouletteGame /> : <PlinkoGame />}
      </Card>
    </div>
  );
}
