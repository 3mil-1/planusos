"use client";

import { usePathname } from "next/navigation";
import { BookOpen, Coins, GraduationCap, Home, LogOut, ShoppingBag, User } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { NavAnchor, navLinkClass } from "@/components/ui/NavAnchor";
import { CoinDisplay } from "@/components/economy/CoinDisplay";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/learn", label: "Nauka", icon: BookOpen },
  { href: "/exam", label: "Egzamin", icon: GraduationCap },
  { href: "/casino", label: "Kasyno", icon: Coins },
  { href: "/shop", label: "Sklep", icon: ShoppingBag },
];

export function Navbar() {
  const pathname = usePathname();
  const { username, logout } = useAuthStore();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <NavAnchor href="/" className="text-lg font-semibold tracking-tight text-white">
          nauka<span className="text-sky-400">air</span>
        </NavAnchor>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <NavAnchor key={href} href={href} className={navLinkClass(pathname === href)}>
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavAnchor>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CoinDisplay className="hidden sm:inline-flex" showLabel={false} />
          <div className="hidden items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-1.5 text-sm text-slate-300 md:flex">
            <User className="h-4 w-4 text-sky-400" />
            {username}
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
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
