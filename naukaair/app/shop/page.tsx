"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
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
  common: "border-slate-700",
  rare: "border-sky-500/40",
  epic: "border-violet-500/50",
  legendary: "border-amber-500/60 shadow-amber-500/10",
};

const RARITY_LABEL: Record<ShopItem["rarity"], string> = {
  common: "Zwykły",
  rare: "Rzadki",
  epic: "Epicki",
  legendary: "Legendarny",
};

const SLOT_LABEL: Record<CosmeticSlot, string> = {
  prefix: "Prefix",
  nameStyle: "Styl nicku",
  border: "Obwódka",
};

export default function ShopPage() {
  const username = useAuthStore((s) => s.username);
  const economy = useQuizStore((s) => normalizeEconomy(s.economy));
  const buyItem = useQuizStore((s) => s.buyItem);
  const equipItem = useQuizStore((s) => s.equipItem);
  const unequipSlot = useQuizStore((s) => s.unequipSlot);
  const [message, setMessage] = useState<string | null>(null);

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
    if (economy.ownedItems.includes(item.id)) {
      equipItem(item.id);
      setMessage(`Założono: ${item.name}`);
      return;
    }
    if (economy.coins < item.price) {
      setMessage(`Za mało punktów — potrzebujesz ${item.price}, masz ${economy.coins}. Ucz się lub spróbuj szczęścia w kasynie!`);
      return;
    }
    if (buyItem(item.id)) {
      setMessage(`Kupiono i założono: ${item.name}`);
    }
  };

  const isEquipped = (item: ShopItem) => economy.equipped[item.slot] === item.id;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sklepik</h1>
          <p className="mt-2 max-w-xl text-slate-400">
            Kosmetyki widoczne w rankingu globalnym — prefix, styl nicku i obwódka profilu.
          </p>
        </div>
        <CoinDisplay />
      </div>

      {username && (
        <Card className="border-sky-500/20">
          <p className="text-sm text-slate-400">Podgląd w rankingu</p>
          <div className="mt-3">
            <ProfileBadge username={username} equipped={economy.equipped} highlight />
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
            <Sparkles className="h-5 w-5 text-sky-400" />
            {SLOT_LABEL[slot]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[slot].map((item) => {
              const owned = economy.ownedItems.includes(item.id);
              const equipped = isEquipped(item);
              const canAfford = economy.coins >= item.price;

              return (
                <Card
                  key={item.id}
                  className={cn("relative", RARITY_STYLE[item.rarity])}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                      {RARITY_LABEL[item.rarity]}
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  <p className="mt-3 font-mono text-amber-300">{item.price} pkt</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleBuy(item)}
                      disabled={!owned && !canAfford}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all",
                        owned
                          ? equipped
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-sky-500 text-white hover:bg-sky-400"
                          : canAfford
                            ? "bg-amber-500 text-white hover:bg-amber-400"
                            : "cursor-not-allowed bg-slate-800 text-slate-500",
                      )}
                    >
                      {owned ? (
                        equipped ? (
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
                    {owned && equipped && (
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

      <NavAnchor href="/casino" className="inline-block text-sm text-violet-400 hover:text-violet-300">
        ← Wróć do kasyna
      </NavAnchor>
    </div>
  );
}
