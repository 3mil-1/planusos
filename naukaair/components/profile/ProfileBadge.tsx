"use client";

import type { EquippedCosmetics } from "@/lib/economy";
import {
  BORDER_STYLE_CLASS,
  NAME_STYLE_CLASS,
  prefixEmoji,
} from "@/lib/economy";
import { cn } from "@/lib/utils";

interface ProfileBadgeProps {
  username: string;
  equipped?: EquippedCosmetics;
  highlight?: boolean;
  size?: "sm" | "md";
}

export function ProfileBadge({
  username,
  equipped,
  highlight = false,
  size = "md",
}: ProfileBadgeProps) {
  const prefix = prefixEmoji(equipped?.prefix);
  const nameClass = equipped?.nameStyle ? NAME_STYLE_CLASS[equipped.nameStyle] : undefined;
  const borderClass = equipped?.border ? BORDER_STYLE_CLASS[equipped.border] : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        size === "sm" ? "text-sm" : "text-base",
        borderClass,
        highlight && !borderClass && "rounded-md px-1",
      )}
    >
      {prefix && <span className="select-none">{prefix}</span>}
      <span className={cn(nameClass ?? (highlight ? "text-sky-400" : "text-slate-200"))}>
        {username}
      </span>
    </span>
  );
}
