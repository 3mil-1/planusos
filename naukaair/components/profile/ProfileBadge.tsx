"use client";

import type { EquippedCosmetics } from "@/lib/economy";
import {
  AURA_STYLE_CLASS,
  BORDER_STYLE_CLASS,
  NAME_STYLE_CLASS,
  TITLE_STYLE_CLASS,
  badgeEmoji,
  prefixEmoji,
  suffixEmoji,
  titleTag,
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
  const suffix = suffixEmoji(equipped?.suffix);
  const title = titleTag(equipped?.title);
  const medal = badgeEmoji(equipped?.badge);
  const nameClass = equipped?.nameStyle ? NAME_STYLE_CLASS[equipped.nameStyle] : undefined;
  const borderClass = equipped?.border ? BORDER_STYLE_CLASS[equipped.border] : undefined;
  const auraClass = equipped?.aura ? AURA_STYLE_CLASS[equipped.aura] : undefined;
  const titleClass = equipped?.title ? TITLE_STYLE_CLASS[equipped.title] : "cosmetic-title-default";

  return (
    <span className={cn("relative inline-flex items-center", auraClass)}>
      {medal && (
        <span
          className={cn(
            "absolute -top-3 -right-2 select-none drop-shadow-md",
            size === "sm" ? "text-xs" : "text-sm",
          )}
          title="Medal"
        >
          {medal}
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-1.5 font-medium",
          size === "sm" ? "text-sm" : "text-base",
          borderClass,
          highlight && !borderClass && "rounded-md px-1",
        )}
      >
        {prefix && <span className="select-none">{prefix}</span>}
        {title && (
          <span className={cn("rounded px-1 py-0.5 text-[10px] font-bold uppercase tracking-wide", titleClass, size === "md" && "text-xs")}>
            {title}
          </span>
        )}
        <span className={cn(nameClass ?? (highlight ? "text-sky-400" : "text-slate-200"))}>
          {username}
        </span>
        {suffix && <span className="select-none opacity-90">{suffix}</span>}
      </span>
    </span>
  );
}
