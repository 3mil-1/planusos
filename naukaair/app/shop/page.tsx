"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ShoppingBag, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CoinDisplay } from "@/components/economy/CoinDisplay";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { NavAnchor } from "@/components/ui/NavAnchor";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuizStore } from "@/store/useQuizStore";
import {
  SHOP_ITEMS,
  normalizeEconomy,
  type ShopItem,
  type CosmeticSlot,
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

const SLOT_LABEL: Record<CosmeticSlot, string> = {
  prefix: "Prefix rankingu",
  nameStyle: "Styl nicku",
  border: "Obwódka profilu",
};

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

  useEffect(() => {
    if (username) {
      void loadAndMergeFromServer(username);
    }
  }, [username, loadAndMergeFromServer]);

  const grouped = useMemo(() => {
    const map: Record<CosmeticSlot, ShopItem[]> = {
      prefix: [],
      nameStyle: [],
      border: [],
    };
    for (const item of SHOP_ITEMS) {
      map[item.slot].push(item);
    }
    return map;
  }, []);

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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400/80">Ranking loadout</p>
          <h1 className="text-2xl font-bold text-white">Sklep AGH</h1>
          <p className="mt-2 max-w-xl text-slate-400">
            Kosmetyki fizyczne — prefix, styl nicku i obwódka widoczne globalnie w rankingu.
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
            żeby kupować i zapisywać kosmetyki.
          </p>
        </Card>
      )}

      {username && (
        <Card className="border-sky-500/25 bg-gradient-to-br from-sky-950/40 to-slate-900/60">
          <p className="text-sm text-slate-400">Podgląd w rankingu</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <ProfileBadge username={username} equipped={equipped} highlight />
            <span className="text-xs text-slate-500">
              {ownedItems.length} / {SHOP_ITEMS.length} odblokowanych
            </span>
          </div>
        </Card>
      )}

      {message && (
        <p className="animate-fade-in rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          {message}
        </p>
      )}

      {(Object.keys(grouped) as CosmeticSlot[]).map((slot) => (
        <section key={slot}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
            <Zap className="h-5 w-5 text-amber-400" />
            {SLOT_LABEL[slot]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[slot].map((item) => {
              const owned = ownedItems.includes(item.id);
              const equippedNow = isEquipped(item);
              const canAfford = coins >= item.price;

              return (
                <Card
                  key={item.id}
                  className={cn("relative transition-transform hover:scale-[1.02]", RARITY_STYLE[item.rarity])}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-4xl drop-shadow-lg">{item.emoji}</span>
                    <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-slate-300">
                      {RARITY_LABEL[item.rarity]}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.description}</p>

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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={!username || (!owned && !canAfford)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold transition-all",
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
      ))}

      <NavAnchor href="/casino" className="inline-flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300">
        <Sparkles className="h-4 w-4" />
        Wróć do kasyna
      </NavAnchor>
    </div>
  );
}
