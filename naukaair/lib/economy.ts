/** Ekonomia punktów — zarabianie przez naukę, wydawanie w kasynie i sklepie */

export const STARTER_COINS = 50;
export const COINS_LEARN_CORRECT = 10;
export const COINS_EXAM_CORRECT = 15;
export const COINS_EXAM_PASS_BONUS = 60; // ≥70% poprawnych
export const COINS_EXAM_PERFECT_BONUS = 200; // 100% na egzaminie

export const CASINO_MIN_BET = 10;
export const CASINO_MAX_BET = 200;
export const CASINO_BET_STEP = 10;

export type CosmeticSlot = "prefix" | "nameStyle" | "border";

export interface EquippedCosmetics {
  prefix?: string;
  nameStyle?: string;
  border?: string;
}

export interface UserEconomy {
  coins: number;
  ownedItems: string[];
  equipped: EquippedCosmetics;
  totalEarned: number;
  totalSpentCasino: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  slot: CosmeticSlot;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface CasinoSegment {
  label: string;
  multiplier: number;
  weight: number;
  color: string;
}

/** ~87% zwrotu — kasyno jest zabawą, nie głównym źródłem punktów */
export const ROULETTE_SEGMENTS: CasinoSegment[] = [
  { label: "0×", multiplier: 0, weight: 35, color: "#475569" },
  { label: "0.5×", multiplier: 0.5, weight: 15, color: "#64748b" },
  { label: "1×", multiplier: 1, weight: 20, color: "#0ea5e9" },
  { label: "1.5×", multiplier: 1.5, weight: 15, color: "#6366f1" },
  { label: "2×", multiplier: 2, weight: 10, color: "#a855f7" },
  { label: "3×", multiplier: 3, weight: 4, color: "#ec4899" },
  { label: "5×", multiplier: 5, weight: 1, color: "#eab308" },
];

/** Plinko — 7 slotów, suma wag ≈ ta sama krzywa jak ruletka */
export const PLINKO_SLOTS: CasinoSegment[] = [
  { label: "0×", multiplier: 0, weight: 18, color: "#475569" },
  { label: "0.5×", multiplier: 0.5, weight: 12, color: "#64748b" },
  { label: "1×", multiplier: 1, weight: 22, color: "#0ea5e9" },
  { label: "1.5×", multiplier: 1.5, weight: 18, color: "#6366f1" },
  { label: "2×", multiplier: 2, weight: 14, color: "#a855f7" },
  { label: "3×", multiplier: 3, weight: 10, color: "#ec4899" },
  { label: "5×", multiplier: 5, weight: 6, color: "#eab308" },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "prefix-kotek",
    name: "Kotek",
    description: "Słodki kotek obok nicku w rankingu",
    price: 120,
    slot: "prefix",
    emoji: "🐱",
    rarity: "common",
  },
  {
    id: "prefix-fizyk",
    name: "Fizyk",
    description: "Ikona atomu — dla prawdziwych kumatych",
    price: 100,
    slot: "prefix",
    emoji: "⚛️",
    rarity: "common",
  },
  {
    id: "prefix-rocket",
    name: "Rakieta",
    description: "Startujesz w ranking szybciej niż inni",
    price: 160,
    slot: "prefix",
    emoji: "🚀",
    rarity: "rare",
  },
  {
    id: "prefix-korona",
    name: "Korona",
    description: "Król bazy pytań",
    price: 280,
    slot: "prefix",
    emoji: "👑",
    rarity: "epic",
  },
  {
    id: "prefix-diament",
    name: "Diament",
    description: "Legendarny blask w rankingu",
    price: 450,
    slot: "prefix",
    emoji: "💎",
    rarity: "legendary",
  },
  {
    id: "name-ogien",
    name: "Ognisty nick",
    description: "Płomienny gradient na loginie",
    price: 150,
    slot: "nameStyle",
    emoji: "🔥",
    rarity: "rare",
  },
  {
    id: "name-neon",
    name: "Neonowy nick",
    description: "Świecący cyfrowy napis",
    price: 120,
    slot: "nameStyle",
    emoji: "💜",
    rarity: "common",
  },
  {
    id: "name-zloto",
    name: "Złoty nick",
    description: "Złoty połysk — premium look",
    price: 220,
    slot: "nameStyle",
    emoji: "✨",
    rarity: "epic",
  },
  {
    id: "border-sky",
    name: "Błękitna obwódka",
    description: "Delikatna ramka wokół nicku",
    price: 80,
    slot: "border",
    emoji: "🔵",
    rarity: "common",
  },
  {
    id: "border-fire",
    name: "Ognista obwódka",
    description: "Płomienna ramka w rankingu",
    price: 180,
    slot: "border",
    emoji: "🌋",
    rarity: "rare",
  },
  {
    id: "border-rainbow",
    name: "Tęczowa obwódka",
    description: "Animowana tęcza wokół profilu",
    price: 350,
    slot: "border",
    emoji: "🌈",
    rarity: "epic",
  },
  {
    id: "border-galaxy",
    name: "Galaktyczna obwódka",
    description: "Kosmiczna poświata — top tier",
    price: 500,
    slot: "border",
    emoji: "🌌",
    rarity: "legendary",
  },
];

const SHOP_BY_ID = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));

export function emptyEconomy(): UserEconomy {
  return {
    coins: STARTER_COINS,
    ownedItems: [],
    equipped: {},
    totalEarned: STARTER_COINS,
    totalSpentCasino: 0,
  };
}

export function normalizeEconomy(raw?: Partial<UserEconomy> | null): UserEconomy {
  if (!raw) return emptyEconomy();
  return {
    coins: typeof raw.coins === "number" ? Math.max(0, raw.coins) : STARTER_COINS,
    ownedItems: Array.isArray(raw.ownedItems) ? [...new Set(raw.ownedItems)] : [],
    equipped: raw.equipped ?? {},
    totalEarned: typeof raw.totalEarned === "number" ? raw.totalEarned : 0,
    totalSpentCasino: typeof raw.totalSpentCasino === "number" ? raw.totalSpentCasino : 0,
  };
}

export function mergeEconomy(local: UserEconomy, remote: UserEconomy): UserEconomy {
  const coins = Math.max(local.coins, remote.coins);
  const ownedItems = [...new Set([...local.ownedItems, ...remote.ownedItems])];
  const pick = local.coins >= remote.coins ? local : remote;
  return {
    coins,
    ownedItems,
    equipped: { ...remote.equipped, ...pick.equipped },
    totalEarned: Math.max(local.totalEarned, remote.totalEarned),
    totalSpentCasino: Math.max(local.totalSpentCasino, remote.totalSpentCasino),
  };
}

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_BY_ID[id];
}

export function pickWeightedSegment(segments: CasinoSegment[]): CasinoSegment {
  const total = segments.reduce((s, seg) => s + seg.weight, 0);
  let roll = Math.random() * total;
  for (const seg of segments) {
    roll -= seg.weight;
    if (roll <= 0) return seg;
  }
  return segments[segments.length - 1];
}

export function calcCasinoPayout(bet: number, multiplier: number): number {
  return Math.floor(bet * multiplier);
}

export function clampBet(bet: number, balance: number): number {
  if (balance < CASINO_MIN_BET) return 0;
  const stepped = Math.round(bet / CASINO_BET_STEP) * CASINO_BET_STEP;
  return Math.min(CASINO_MAX_BET, balance, Math.max(CASINO_MIN_BET, stepped));
}

export function examBonusCoins(score: number, total: number): number {
  if (total === 0) return 0;
  let bonus = 0;
  const ratio = score / total;
  if (ratio >= 0.7) bonus += COINS_EXAM_PASS_BONUS;
  if (score === total && total >= 10) bonus += COINS_EXAM_PERFECT_BONUS;
  return bonus;
}

export function prefixEmoji(itemId?: string): string | null {
  if (!itemId) return null;
  return SHOP_BY_ID[itemId]?.emoji ?? null;
}

export const NAME_STYLE_CLASS: Record<string, string> = {
  "name-ogien": "cosmetic-name-fire",
  "name-neon": "cosmetic-name-neon",
  "name-zloto": "cosmetic-name-gold",
};

export const BORDER_STYLE_CLASS: Record<string, string> = {
  "border-sky": "cosmetic-border-sky",
  "border-fire": "cosmetic-border-fire",
  "border-rainbow": "cosmetic-border-rainbow",
  "border-galaxy": "cosmetic-border-galaxy",
};
