"use client";

import { AlertTriangle } from "lucide-react";

interface SyntheticBadgeProps {
  visible: boolean;
}

export function SyntheticBadge({ visible }: SyntheticBadgeProps) {
  if (!visible) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      Przykład syntetyczny — brak w oryginalnych arkuszach
    </span>
  );
}
