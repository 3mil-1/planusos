"use client";

import { Coins } from "lucide-react";
import { useQuizStore } from "@/store/useQuizStore";
import { cn } from "@/lib/utils";

interface CoinDisplayProps {
  className?: string;
  showLabel?: boolean;
}

export function CoinDisplay({ className, showLabel = true }: CoinDisplayProps) {
  const coins = useQuizStore((s) => s.economy?.coins ?? 0);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-200",
        className,
      )}
      title="Punkty — zdobywaj za poprawne odpowiedzi, wydawaj w kasynie i sklepie"
    >
      <Coins className="h-4 w-4 shrink-0 text-amber-400" />
      <span>{coins.toLocaleString("pl-PL")}</span>
      {showLabel && <span className="hidden font-normal text-amber-300/80 sm:inline">pkt</span>}
    </div>
  );
}
