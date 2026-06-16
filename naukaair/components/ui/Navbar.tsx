"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Home, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/learn", label: "Nauka", icon: BookOpen },
  { href: "/exam", label: "Egzamin", icon: GraduationCap },
];

export function Navbar() {
  const pathname = usePathname();
  const { username, logout } = useAuthStore();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          nauka<span className="text-sky-400">air</span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                pathname === href
                  ? "bg-slate-800 text-white ring-1 ring-slate-700"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 text-sm text-slate-300 sm:flex">
            <User className="h-4 w-4 text-sky-400" />
            {username}
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/40"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Wyloguj</span>
          </button>
        </div>
      </div>
    </header>
  );
}
