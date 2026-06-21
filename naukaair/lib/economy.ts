/** Ekonomia punktów — zarabianie przez naukę, wydawanie w kasynie i sklepie */

export const STARTER_COINS = 50;
export const COINS_LEARN_CORRECT = 10;
export const COINS_CS_LEARN_CORRECT = 10;
export const COINS_EXAM_CORRECT = 15;
export const COINS_EXAM_PASS_BONUS = 60; // ≥70% poprawnych
export const COINS_EXAM_PERFECT_BONUS = 200; // 100% na egzaminie

export const CASINO_MIN_BET = 10;
export const CASINO_MAX_BET = 200;
export const CASINO_BET_STEP = 10;

export type CosmeticSlot =
  | "prefix"
  | "title"
  | "suffix"
  | "nameStyle"
  | "border"
  | "aura"
  | "badge";

export type ShopCategory =
  | "runy"
  | "tytuly"
  | "kometki"
  | "energia"
  | "ramki"
  | "emanacje"
  | "medale";

export interface EquippedCosmetics {
  prefix?: string;
  title?: string;
  suffix?: string;
  nameStyle?: string;
  border?: string;
  aura?: string;
  badge?: string;
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
  category: ShopCategory;
  emoji: string;
  /** Tekst odznaki dla slotu title, np. [ΔG<0] */
  tag?: string;
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

export const SHOP_CATEGORIES: Record<
  ShopCategory,
  { label: string; blurb: string; icon: string }
> = {
  runy: { label: "Runy laboratoryjne", blurb: "Ikona przed nickiem — twój znak rozpoznawczy", icon: "⚗️" },
  tytuly: { label: "Tytuły naukowe", blurb: "Odznaki tekstowe z fizyki i AGH", icon: "📜" },
  kometki: { label: "Smugi cząstek", blurb: "Efekt za nickiem — ślad po twojej partii", icon: "💨" },
  energia: { label: "Style energii", blurb: "Gradient i poświata na loginie", icon: "⚡" },
  ramki: { label: "Ramki pola", blurb: "Obwódka profilu w rankingu", icon: "🛡️" },
  emanacje: { label: "Emanacje", blurb: "Aura wokół całego profilu", icon: "🌟" },
  medale: { label: "Medale AGH", blurb: "Pin nad profilem — prestiż", icon: "🏅" },
};

export const SHOP_ITEMS: ShopItem[] = [
  // —— Runy (prefix) ——
  { id: "prefix-foton", name: "Foton", description: "Minimalna jednostka flexu", price: 80, slot: "prefix", category: "runy", emoji: "⚡", rarity: "common" },
  { id: "prefix-proton", name: "Proton", description: "Dodatni ładunek pewności siebie", price: 90, slot: "prefix", category: "runy", emoji: "🔴", rarity: "common" },
  { id: "prefix-neutron", name: "Neutron", description: "Neutralny, ale ciężki kaliber", price: 90, slot: "prefix", category: "runy", emoji: "⚪", rarity: "common" },
  { id: "prefix-electron", name: "Elektron", description: "Szybki jak poprawna odpowiedź", price: 100, slot: "prefix", category: "runy", emoji: "🔵", rarity: "common" },
  { id: "prefix-magnes", name: "Magnes", description: "Przyciągasz spojrzenia w rankingu", price: 120, slot: "prefix", category: "runy", emoji: "🧲", rarity: "rare" },
  { id: "prefix-maxwell", name: "Maxwell", description: "Demon pilnuje twoich punktów", price: 150, slot: "prefix", category: "runy", emoji: "👹", rarity: "rare" },
  { id: "prefix-laser", name: "Laser", description: "Skupiona wiązka precyzji", price: 180, slot: "prefix", category: "runy", emoji: "🔦", rarity: "rare" },
  { id: "prefix-schrodinger", name: "Schrödinger", description: "Jesteś i nie jesteś w top 10 naraz", price: 220, slot: "prefix", category: "runy", emoji: "🐈", rarity: "epic" },
  { id: "prefix-singular", name: "Singularność", description: "Grawitacja twojego ELO", price: 340, slot: "prefix", category: "runy", emoji: "🕳️", rarity: "epic" },
  { id: "prefix-nobel", name: "Laureat", description: "Nagrooda Nobla za poprawne ABC", price: 500, slot: "prefix", category: "runy", emoji: "🏆", rarity: "legendary" },

  // —— Tytuły ——
  { id: "title-student", name: "Student AGH", description: "Oficjalny vibe pierwszego roku", price: 70, slot: "title", category: "tytuly", emoji: "🎓", tag: "[STUD]", rarity: "common" },
  { id: "title-inz", name: "Inżynier", description: "Już prawie ogarniasz całą bazę", price: 110, slot: "title", category: "tytuly", emoji: "📐", tag: "[INŻ.]", rarity: "common" },
  { id: "title-delta", name: "Delta G", description: "Spontanicznie idziesz na egzamin", price: 130, slot: "title", category: "tytuly", emoji: "📉", tag: "[ΔG<0]", rarity: "rare" },
  { id: "title-qed", name: "QED", description: "Problem rozwiązany elegancko", price: 160, slot: "title", category: "tytuly", emoji: "✅", tag: "[QED]", rarity: "rare" },
  { id: "title-101", name: "101%", description: "Więcej niż wymagane minimum", price: 200, slot: "title", category: "tytuly", emoji: "💯", tag: "[101%]", rarity: "epic" },
  { id: "title-phd", name: "PhD", description: "Doktor od egzaminów", price: 280, slot: "title", category: "tytuly", emoji: "🔬", tag: "[PhD]", rarity: "epic" },
  { id: "title-heisenberg", name: "Heisenberg", description: "Pozycja w rankingu nieoznaczona", price: 400, slot: "title", category: "tytuly", emoji: "❓", tag: "[ΔxΔp]", rarity: "legendary" },

  // —— Smugi (suffix) ——
  { id: "suffix-spark", name: "Iskra", description: "Mała iskra za nickiem", price: 60, slot: "suffix", category: "kometki", emoji: "✨", rarity: "common" },
  { id: "suffix-trail", name: "Smuga", description: "Kometowy ogon poprawnych odpowiedzi", price: 100, slot: "suffix", category: "kometki", emoji: "☄️", rarity: "common" },
  { id: "suffix-wave", name: "Fala", description: "Rozchodzisz się jak front EM", price: 120, slot: "suffix", category: "kometki", emoji: "〰️", rarity: "rare" },
  { id: "suffix-decay", name: "Rozpad β", description: "Radioaktywny flex za loginem", price: 160, slot: "suffix", category: "kometki", emoji: "☢️", rarity: "rare" },
  { id: "suffix-photon", name: "Emisja fotonu", description: "Promieniujesz po dobrym egzaminie", price: 210, slot: "suffix", category: "kometki", emoji: "💡", rarity: "epic" },
  { id: "suffix-blackhole", name: "Horyzont", description: "Po twoim nicku nic już nie ma", price: 350, slot: "suffix", category: "kometki", emoji: "🌌", rarity: "legendary" },

  // —— Style energii ——
  { id: "name-kwant", name: "Kwantowy", description: "Superpozycja kolorów", price: 120, slot: "nameStyle", category: "energia", emoji: "🌀", rarity: "common" },
  { id: "name-plazma", name: "Plazmowy", description: "Gorący jonizowany gradient", price: 170, slot: "nameStyle", category: "energia", emoji: "💫", rarity: "rare" },
  { id: "name-anty", name: "Antymateria", description: "E=mc² w każdej literze", price: 250, slot: "nameStyle", category: "energia", emoji: "☄️", rarity: "epic" },
  { id: "name-supercon", name: "Supracon", description: "Zero oporu — płynie jak złoto", price: 320, slot: "nameStyle", category: "energia", emoji: "🥇", rarity: "epic" },
  { id: "name-cherenkov", name: "Cerenkov", description: "Niebieski blask przekraczania prędkości", price: 420, slot: "nameStyle", category: "energia", emoji: "🔷", rarity: "legendary" },

  // —— Ramki ——
  { id: "border-em", name: "Pole EM", description: "Elektromagnetyczna obwódka", price: 85, slot: "border", category: "ramki", emoji: "🧲", rarity: "common" },
  { id: "border-crystal", name: "Krystalograf", description: "Struktura krystaliczna ramki", price: 130, slot: "border", category: "ramki", emoji: "💎", rarity: "common" },
  { id: "border-horizon", name: "Horyzont zdarzeń", description: "Fioletowe światło z ciemności", price: 175, slot: "border", category: "ramki", emoji: "🌑", rarity: "rare" },
  { id: "border-fusion", name: "Fuzja", description: "Plazmowa ramka jądrowa", price: 240, slot: "border", category: "ramki", emoji: "🔥", rarity: "epic" },
  { id: "border-supernova", name: "Supernova", description: "Animowana tęcza wokół profilu", price: 360, slot: "border", category: "ramki", emoji: "💥", rarity: "epic" },
  { id: "border-entropia", name: "Entropia max", description: "Kosmiczna mgławica — top tier", price: 550, slot: "border", category: "ramki", emoji: "🌌", rarity: "legendary" },

  // —— Emanacje (aura) ——
  { id: "aura-static", name: "Ładunek statyczny", description: "Delikatna poświata wokół profilu", price: 140, slot: "aura", category: "emanacje", emoji: "⚡", rarity: "common" },
  { id: "aura-heat", name: "Ciepło", description: "Termiczna aura po sesji nauki", price: 190, slot: "aura", category: "emanacje", emoji: "🌡️", rarity: "rare" },
  { id: "aura-magnetic", name: "Magnetyczna", description: "Pole wokół ciebie w rankingu", price: 260, slot: "aura", category: "emanacje", emoji: "🧭", rarity: "epic" },
  { id: "aura-quantum", name: "Kwantowa", description: "Fluktuująca poświata prawdopodobieństwa", price: 380, slot: "aura", category: "emanacje", emoji: "🔮", rarity: "legendary" },

  // —— Medale ——
  { id: "badge-bronze", name: "Brąz AGH", description: "Pierwszy krok w rankingu", price: 75, slot: "badge", category: "medale", emoji: "🥉", rarity: "common" },
  { id: "badge-silver", name: "Srebro AGH", description: "Solidny wynik — widać w tabeli", price: 150, slot: "badge", category: "medale", emoji: "🥈", rarity: "rare" },
  { id: "badge-gold", name: "Złoto AGH", description: "Elitarny pin nad profilem", price: 280, slot: "badge", category: "medale", emoji: "🥇", rarity: "epic" },
  { id: "badge-reactor", name: "Reaktor", description: "Jądrowy medal za wytrwałość", price: 450, slot: "badge", category: "medale", emoji: "☢️", rarity: "legendary" },
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
  const item = SHOP_BY_ID[itemId];
  if (!item || item.slot !== "prefix") return null;
  return item.emoji;
}

export function suffixEmoji(itemId?: string): string | null {
  if (!itemId) return null;
  const item = SHOP_BY_ID[itemId];
  return item?.slot === "suffix" ? item.emoji : null;
}

export function titleTag(itemId?: string): string | null {
  if (!itemId) return null;
  const item = SHOP_BY_ID[itemId];
  return item?.slot === "title" ? (item.tag ?? item.name) : null;
}

export function badgeEmoji(itemId?: string): string | null {
  if (!itemId) return null;
  const item = SHOP_BY_ID[itemId];
  return item?.slot === "badge" ? item.emoji : null;
}

export const NAME_STYLE_CLASS: Record<string, string> = {
  "name-kwant": "cosmetic-name-quantum",
  "name-plazma": "cosmetic-name-plasma",
  "name-anty": "cosmetic-name-antimatter",
  "name-supercon": "cosmetic-name-supercon",
  "name-cherenkov": "cosmetic-name-cherenkov",
  "name-neon": "cosmetic-name-quantum",
  "name-ogien": "cosmetic-name-plasma",
  "name-zloto": "cosmetic-name-antimatter",
};

export const BORDER_STYLE_CLASS: Record<string, string> = {
  "border-em": "cosmetic-border-em",
  "border-crystal": "cosmetic-border-crystal",
  "border-horizon": "cosmetic-border-horizon",
  "border-fusion": "cosmetic-border-fusion",
  "border-supernova": "cosmetic-border-supernova",
  "border-entropia": "cosmetic-border-entropia",
  "border-sky": "cosmetic-border-em",
  "border-fire": "cosmetic-border-horizon",
  "border-rainbow": "cosmetic-border-supernova",
  "border-galaxy": "cosmetic-border-entropia",
};

export const AURA_STYLE_CLASS: Record<string, string> = {
  "aura-static": "cosmetic-aura-static",
  "aura-heat": "cosmetic-aura-heat",
  "aura-magnetic": "cosmetic-aura-magnetic",
  "aura-quantum": "cosmetic-aura-quantum",
};

export const TITLE_STYLE_CLASS: Record<string, string> = {
  "title-student": "cosmetic-title-student",
  "title-inz": "cosmetic-title-inz",
  "title-delta": "cosmetic-title-delta",
  "title-qed": "cosmetic-title-qed",
  "title-101": "cosmetic-title-101",
  "title-phd": "cosmetic-title-phd",
  "title-heisenberg": "cosmetic-title-heisenberg",
};

export function itemsByCategory(): Record<ShopCategory, ShopItem[]> {
  const map = Object.fromEntries(
    (Object.keys(SHOP_CATEGORIES) as ShopCategory[]).map((c) => [c, [] as ShopItem[]]),
  ) as Record<ShopCategory, ShopItem[]>;
  for (const item of SHOP_ITEMS) {
    map[item.category].push(item);
  }
  return map;
}
