"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CoinDisplay } from "@/components/economy/CoinDisplay";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { NavAnchor } from "@/components/ui/NavAnchor";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuizStore } from "@/store/useQuizStore";
import {
  SHOP_CATEGORIES,
  SHOP_ITEMS,
  itemsByCategory,
  type ShopCategory,
  type ShopItem,
} from "@/lib/economy";
import { cn } from "@/lib/utils";

const RARITY_STYLE: Record<ShopItem["rarity"], string> = {
  common: "border-slate-600/80 bg-slate-900/60",
  rare: "border-sky-500/50 bg-sky-950/30 shadow-[0_0_20px_rgba(56,189,248,0.12)]",
  epic: "border-violet-500/55 bg-violet-950/35 shadow-[0_0_24px_rgba(139,92,246,0.18)]",
  legendary: "border-amber-400/60 bg-amber-950/25 shadow-[0_0_28px_rgba(251,191,36,0.2)]",
};

const RARITY_LABEL: Record<ShopItem["rarity"], string> = {
  common: "Standard",
  rare: "Rzadki",
  epic: "Epicki",
  legendary: "Legendarny",
};

const CATEGORY_ORDER: ShopCategory[] = [
  "runy",
  "tytuly",
  "kometki",
  "energia",
  "ramki",
  "emanacje",
  "medale",
];

export default function ShopPage() {
  const username = useAuthStore((s) => s.username);
  const coins = useQuizStore((s) => s.economy?.coins ?? 0);
  const ownedItems = useQuizStore((s) => s.economy?.ownedItems ?? []);
  const equipped = useQuizStore((s) => s.economy?.equipped ?? {});
  const isStatsReady = useQuizStore((s) => s.isStatsReady);
  const loadAndMergeFromServer = useQuizStore((s) => s.loadAndMergeFromServer);
  const buyItem = useQuizStore((s) => s.buyItem);
  const equipItem = useQuizStore((s) => s.equipItem);
  const unequipSlot = useQuizStore((s) => s.unequipSlot);
  const [message, setMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ShopCategory | "all">("all");

  useEffect(() => {
    if (username) {
      void loadAndMergeFromServer(username);
    }
  }, [username, loadAndMergeFromServer]);

  const byCategory = useMemo(() => itemsByCategory(), []);

  const visibleCategories = useMemo(() => {
    if (activeCategory === "all") return CATEGORY_ORDER;
    return [activeCategory];
  }, [activeCategory]);

  const handleBuy = (item: ShopItem) => {
    if (!username) {
      setMessage("Musisz być zalogowany — wejdź przez /login.");
      return;
    }
    if (!isStatsReady) {
      setMessage("Ładuję twój profil… spróbuj za sekundę.");
      return;
    }

    if (ownedItems.includes(item.id)) {
      if (equipItem(item.id)) {
        setMessage(`Założono: ${item.name}`);
      } else {
        setMessage("Nie udało się założyć — odśwież stronę.");
      }
      return;
    }

    if (coins < item.price) {
      setMessage(
        `Za mało punktów — potrzebujesz ${item.price}, masz ${coins}. Ucz się albo zagraj w kasynie.`,
      );
      return;
    }

    if (buyItem(item.id)) {
      setMessage(`Kupiono i założono: ${item.name}!`);
    } else {
      setMessage("Zakup nie przeszedł — odśwież stronę i spróbuj ponownie.");
    }
  };

  const isEquipped = (item: ShopItem) => equipped[item.slot] === item.id;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400/80">Loadout rankingu</p>
          <h1 className="text-2xl font-bold text-white">Sklep AGH</h1>
          <p className="mt-2 max-w-xl text-slate-400">
            {SHOP_ITEMS.length} kosmetyków w {CATEGORY_ORDER.length} kategoriach — składaj swój profil jak
            loadout w grze.
          </p>
        </div>
        <CoinDisplay />
      </div>

      {!username && (
        <Card className="border-red-500/30 bg-red-500/10">
          <p className="text-sm text-red-200">
            Nie jesteś zalogowany.{" "}
            <NavAnchor href="/login" className="underline">
              Zaloguj się
            </NavAnchor>{" "}
            żeby kupować.
          </p>
        </Card>
      )}

      {username && (
        <Card className="border-sky-500/25 bg-gradient-to-br from-sky-950/40 to-slate-900/60">
          <p className="text-sm text-slate-400">Podgląd w rankingu</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <ProfileBadge username={username} equipped={equipped} highlight />
            <span className="text-xs text-slate-500">
              {ownedItems.length} / {SHOP_ITEMS.length} odblokowanych
            </span>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
            activeCategory === "all"
              ? "bg-sky-500 text-white"
              : "border border-slate-700 text-slate-400 hover:bg-slate-800",
          )}
        >
          Wszystko
        </button>
        {CATEGORY_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              activeCategory === cat
                ? "bg-sky-500 text-white"
                : "border border-slate-700 text-slate-400 hover:bg-slate-800",
            )}
          >
            {SHOP_CATEGORIES[cat].icon} {SHOP_CATEGORIES[cat].label}
          </button>
        ))}
      </div>

      {message && (
        <p className="animate-fade-in rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          {message}
        </p>
      )}

      {visibleCategories.map((cat) => {
        const meta = SHOP_CATEGORIES[cat];
        const items = byCategory[cat];
        if (items.length === 0) return null;

        return (
          <section key={cat}>
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                <span>{meta.icon}</span>
                {meta.label}
                <span className="text-sm font-normal text-slate-500">({items.length})</span>
              </h2>
              <p className="text-sm text-slate-500">{meta.blurb}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const owned = ownedItems.includes(item.id);
                const equippedNow = isEquipped(item);
                const canAfford = coins >= item.price;

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "relative transition-transform hover:scale-[1.02]",
                      RARITY_STYLE[item.rarity],
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-3xl drop-shadow-lg">{item.emoji}</span>
                      <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs text-slate-300">
                        {RARITY_LABEL[item.rarity]}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-white">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">{item.description}</p>
                    {item.tag && (
                      <p className="mt-2 font-mono text-xs text-sky-300">{item.tag}</p>
                    )}

                    {username && (
                      <div className="mt-3 rounded-lg bg-black/30 px-2 py-1.5">
                        <ProfileBadge
                          username={username}
                          equipped={{ ...equipped, [item.slot]: item.id }}
                          size="sm"
                        />
                      </div>
                    )}

                    <p className="mt-3 font-mono text-lg font-bold text-amber-300">{item.price} pkt</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleBuy(item)}
                        disabled={!username || (!owned && !canAfford)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all",
                          owned
                            ? equippedNow
                              ? "bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/40"
                              : "bg-sky-500 text-white hover:bg-sky-400"
                            : canAfford
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110"
                              : "cursor-not-allowed bg-slate-800 text-slate-500",
                        )}
                      >
                        {owned ? (
                          equippedNow ? (
                            <>
                              <Check className="h-4 w-4" />
                              Założone
                            </>
                          ) : (
                            "Załóż"
                          )
                        ) : (
                          <>
                            <ShoppingBag className="h-4 w-4" />
                            Kup
                          </>
                        )}
                      </button>
                      {owned && equippedNow && (
                        <button
                          type="button"
                          onClick={() => {
                            unequipSlot(item.slot);
                            setMessage(`Zdjęto: ${item.name}`);
                          }}
                          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 hover:bg-slate-800"
                        >
                          Zdejmij
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      <NavAnchor href="/casino" className="inline-block text-sm text-violet-400 hover:text-violet-300">
        ← Kasyno (zdobywaj punkty)
      </NavAnchor>
    </div>
  );
}
