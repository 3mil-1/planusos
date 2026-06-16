"use client";

import { cn } from "@/lib/utils";

interface NavAnchorProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

/** Full page navigation — reliable on Render (avoids RSC prefetch 404). */
export function NavAnchor({ href, className, children }: NavAnchorProps) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function navLinkClass(active: boolean): string {
  return cn(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
    active
      ? "bg-slate-800 text-white ring-1 ring-slate-700"
      : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
  );
}

export function cardLinkClass(): string {
  return "group rounded-2xl border border-slate-800 p-8 transition-all hover:shadow-lg focus:outline-none focus:ring-2";
}
