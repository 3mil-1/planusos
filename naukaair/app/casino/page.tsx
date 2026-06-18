"use client";

import { useState } from "react";
import { Dices, CircleDot } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mini kasyno</h1>
          <p className="mt-2 max-w-xl text-slate-400">
            Wydaj punkty zdobyte za naukę. Ruletka i plinko mają dom (~13% przewagi) — to
            dodatek, nie sposób na szybki zarobek.
          </p>
        </div>
        <CoinDisplay />
      </div>

      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-violet-500/5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          Jak zdobywać punkty
        </h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <li>• Nauka — +{COINS_LEARN_CORRECT} pkt za poprawną odpowiedź</li>
          <li>• Egzamin — +{COINS_EXAM_CORRECT} pkt za poprawną</li>
          <li>• Egzamin ≥70% — bonus +{COINS_EXAM_PASS_BONUS} pkt</li>
          <li>• Egzamin 100% — dodatkowo +{COINS_EXAM_PERFECT_BONUS} pkt</li>
        </ul>
        <NavAnchor
          href="/shop"
          className="mt-4 inline-block text-sm text-sky-400 hover:text-sky-300"
        >
          → Sklep z kosmetykami do rankingu
        </NavAnchor>
      </Card>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("roulette")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
            tab === "roulette"
              ? "bg-amber-500 text-white"
              : "border border-slate-700 text-slate-300 hover:bg-slate-800",
          )}
        >
          <CircleDot className="h-4 w-4" />
          Ruletka
        </button>
        <button
          type="button"
          onClick={() => setTab("plinko")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
            tab === "plinko"
              ? "bg-violet-500 text-white"
              : "border border-slate-700 text-slate-300 hover:bg-slate-800",
          )}
        >
          <Dices className="h-4 w-4" />
          Plinko (kulka)
        </button>
      </div>

      <Card>{tab === "roulette" ? <RouletteGame /> : <PlinkoGame />}</Card>
    </div>
  );
}
