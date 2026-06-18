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
  glow?: string;
}

export interface CasinoResult {
  game: "roulette" | "plinko";
  bet: number;
  multiplier: number;
  label: string;
  payout: number;
  net: number;
  slotIndex: number;
}

/** ~87% zwrotu — kasyno jest zabawą, nie głównym źródłem punktów */
export const ROULETTE_SEGMENTS: CasinoSegment[] = [
  { label: "0×", multiplier: 0, weight: 35, color: "#334155", glow: "#64748b" },
  { label: "0.5×", multiplier: 0.5, weight: 15, color: "#475569", glow: "#94a3b8" },
  { label: "1×", multiplier: 1, weight: 20, color: "#0369a1", glow: "#38bdf8" },
  { label: "1.5×", multiplier: 1.5, weight: 15, color: "#4338ca", glow: "#818cf8" },
  { label: "2×", multiplier: 2, weight: 10, color: "#7e22ce", glow: "#c084fc" },
  { label: "3×", multiplier: 3, weight: 4, color: "#be185d", glow: "#f472b6" },
  { label: "5×", multiplier: 5, weight: 1, color: "#ca8a04", glow: "#fde047" },
];

/** Plinko — 7 slotów, suma wag ≈ ta sama krzywa jak ruletka */
export const PLINKO_SLOTS: CasinoSegment[] = [
  { label: "0×", multiplier: 0, weight: 18, color: "#334155", glow: "#64748b" },
  { label: "0.5×", multiplier: 0.5, weight: 12, color: "#475569", glow: "#94a3b8" },
  { label: "1×", multiplier: 1, weight: 22, color: "#0369a1", glow: "#38bdf8" },
  { label: "1.5×", multiplier: 1.5, weight: 18, color: "#4338ca", glow: "#818cf8" },
  { label: "2×", multiplier: 2, weight: 14, color: "#7e22ce", glow: "#c084fc" },
  { label: "3×", multiplier: 3, weight: 10, color: "#be185d", glow: "#f472b6" },
  { label: "5×", multiplier: 5, weight: 6, color: "#ca8a04", glow: "#fde047" },
];

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "prefix-foton",
    name: "Foton",
    description: "Energia kwantowa obok nicku — widoczny w rankingu",
    price: 100,
    slot: "prefix",
    emoji: "⚡",
    rarity: "common",
  },
  {
    id: "prefix-maxwell",
    name: "Maxwell",
    description: "Demon termodynamiki pilnuje twojego miejsca w tabeli",
    price: 140,
    slot: "prefix",
    emoji: "🔥",
    rarity: "rare",
  },
  {
    id: "prefix-schrodinger",
    name: "Schrödinger",
    description: "Jednocześnie pierwszy i ostatni — dopóki nie otworzysz rankingu",
    price: 200,
    slot: "prefix",
    emoji: "🐈",
    rarity: "epic",
  },
  {
    id: "prefix-singular",
    name: "Singularność",
    description: "Grawitacyjny flex dla kumatych z AGH",
    price: 320,
    slot: "prefix",
    emoji: "🕳️",
    rarity: "epic",
  },
  {
    id: "prefix-nobel",
    name: "Laureat",
    description: "Noblowski blask — rzadki status w rankingu",
    price: 480,
    slot: "prefix",
    emoji: "🏆",
    rarity: "legendary",
  },
  {
    id: "name-kwant",
    name: "Kwantowy nick",
    description: "Superpozycja kolorów na loginie",
    price: 130,
    slot: "nameStyle",
    emoji: "🌀",
    rarity: "common",
  },
  {
    id: "name-plazma",
    name: "Plazmowy nick",
    description: "Jonizowany gradient — gorący wygląd",
    price: 180,
    slot: "nameStyle",
    emoji: "💫",
    rarity: "rare",
  },
  {
    id: "name-anty",
    name: "Antymateria",
    description: "Energia E=mc² w każdej literze nicku",
    price: 260,
    slot: "nameStyle",
    emoji: "☄️",
    rarity: "epic",
  },
  {
    id: "border-em",
    name: "Pole EM",
    description: "Elektromagnetyczna poświata wokół profilu",
    price: 90,
    slot: "border",
    emoji: "🧲",
    rarity: "common",
  },
  {
    id: "border-horizon",
    name: "Horyzont zdarzeń",
    description: "Ciemna obwódka z fioletowym światłem",
    price: 170,
    slot: "border",
    emoji: "🌑",
    rarity: "rare",
  },
  {
    id: "border-supernova",
    name: "Supernova",
    description: "Wybuchająca tęcza — animowana ramka",
    price: 340,
    slot: "border",
    emoji: "💥",
    rarity: "epic",
  },
  {
    id: "border-entropia",
    name: "Entropia",
    description: "Kosmiczna mgławica — top tier w rankingu",
    price: 520,
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

export function rollCasino(
  game: "roulette" | "plinko",
  rawBet: number,
  balance: number,
): CasinoResult | null {
  const bet = clampBet(rawBet, balance);
  if (bet < CASINO_MIN_BET || bet > CASINO_MAX_BET || bet > balance) {
    return null;
  }

  const segments = game === "roulette" ? ROULETTE_SEGMENTS : PLINKO_SLOTS;
  const segment = pickWeightedSegment(segments);
  const slotIndex = segments.indexOf(segment);
  const payout = calcCasinoPayout(bet, segment.multiplier);
  const net = payout - bet;

  return {
    game,
    bet,
    multiplier: segment.multiplier,
    label: segment.label,
    payout,
    net,
    slotIndex,
  };
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
  "name-kwant": "cosmetic-name-quantum",
  "name-plazma": "cosmetic-name-plasma",
  "name-anty": "cosmetic-name-antimatter",
  "name-neon": "cosmetic-name-quantum",
  "name-ogien": "cosmetic-name-plasma",
  "name-zloto": "cosmetic-name-antimatter",
};

export const BORDER_STYLE_CLASS: Record<string, string> = {
  "border-em": "cosmetic-border-em",
  "border-horizon": "cosmetic-border-horizon",
  "border-supernova": "cosmetic-border-supernova",
  "border-entropia": "cosmetic-border-entropia",
  "border-sky": "cosmetic-border-em",
  "border-fire": "cosmetic-border-horizon",
  "border-rainbow": "cosmetic-border-supernova",
  "border-galaxy": "cosmetic-border-entropia",
};
