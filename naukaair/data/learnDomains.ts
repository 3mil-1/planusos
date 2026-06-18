/** Działy fizyki — jedna wspólna baza pytań (baza 2025 + egzaminy), bez osobnych „extra” */
export type LearnDomainId =
  | "mechanika"
  | "elektrostatyka"
  | "magnetizm"
  | "obwody"
  | "optyka"
  | "termodynamika"
  | "fale"
  | "wspolczesna";

export const DOMAIN_LABELS: Record<LearnDomainId, string> = {
  mechanika: "Mechanika",
  elektrostatyka: "Elektrostatyka",
  magnetizm: "Magnetyzm",
  obwody: "Obwody i prąd",
  optyka: "Optyka",
  termodynamika: "Termodynamika",
  fale: "Fale i drgania",
  wspolczesna: "Fizyka współczesna",
};

/** Mapowanie pkt bazy 2025 → dział */
const BASE_POINT_DOMAIN: Record<number, LearnDomainId> = {
  1: "elektrostatyka",
  2: "magnetizm",
  3: "fale",
  4: "elektrostatyka",
  5: "magnetizm",
  6: "optyka",
  7: "optyka",
  8: "elektrostatyka",
  9: "elektrostatyka",
  10: "mechanika",
  11: "mechanika",
  12: "termodynamika",
  13: "mechanika",
  14: "mechanika",
  15: "mechanika",
  16: "elektrostatyka",
  17: "termodynamika",
  18: "obwody",
  19: "termodynamika",
  20: "mechanika",
  21: "mechanika",
  22: "fale",
  23: "termodynamika",
  24: "obwody",
  25: "mechanika",
  26: "mechanika",
  27: "fale",
  28: "termodynamika",
  29: "termodynamika",
  30: "fale",
  31: "termodynamika",
  32: "fale",
  33: "wspolczesna",
  34: "elektrostatyka",
  35: "elektrostatyka",
  36: "mechanika",
  37: "magnetizm",
  38: "wspolczesna",
  39: "termodynamika",
  40: "elektrostatyka",
  41: "termodynamika",
  42: "termodynamika",
  43: "mechanika",
  44: "mechanika",
  45: "mechanika",
  46: "obwody",
  47: "obwody",
  48: "obwody",
  49: "obwody",
  50: "magnetizm",
  51: "magnetizm",
  52: "wspolczesna",
  53: "wspolczesna",
  54: "wspolczesna",
  55: "wspolczesna",
  56: "wspolczesna",
  57: "wspolczesna",
  58: "optyka",
  59: "optyka",
  60: "optyka",
  61: "fale",
  62: "wspolczesna",
  63: "obwody",
  64: "obwody",
  65: "fale",
  66: "magnetizm",
  67: "elektrostatyka",
  68: "elektrostatyka",
  69: "elektrostatyka",
  70: "optyka",
  71: "optyka",
  72: "optyka",
  73: "obwody",
  74: "magnetizm",
  75: "optyka",
  76: "magnetizm",
  77: "obwody",
  78: "magnetizm",
  79: "obwody",
  80: "elektrostatyka",
  81: "elektrostatyka",
  82: "obwody",
  83: "wspolczesna",
  84: "magnetizm",
  85: "obwody",
  86: "elektrostatyka",
  87: "fale",
  88: "elektrostatyka",
  89: "magnetizm",
  90: "fale",
  91: "optyka",
  92: "elektrostatyka",
  93: "fale",
  94: "termodynamika",
  95: "obwody",
  96: "mechanika",
  97: "mechanika",
  98: "elektrostatyka",
  99: "elektrostatyka",
};

/** Pytania spoza pkt 1–99 — przypisane do działów */
const QUESTION_DOMAIN: Record<string, LearnDomainId> = {
  "q-ex-001": "mechanika",
  "q-ex-002": "mechanika",
  "q-ex-003": "termodynamika",
  "q-ex-004": "mechanika",
  "q-ex-005": "mechanika",
  "q-ex-006": "fale",
  "q-ex-007": "elektrostatyka",
  "q-ex-008": "obwody",
  "q-ex-009": "mechanika",
  "q-ex-010": "mechanika",
  "q-ex-011": "wspolczesna",
  "q-ex-012": "elektrostatyka",
  "q-ex-013": "mechanika",
  "q-ex-014": "termodynamika",
  "q-ex-015": "termodynamika",
  "q-ex-016": "elektrostatyka",
  "q-ex-017": "elektrostatyka",
  "q-ex-018": "mechanika",
  "q-ex-019": "mechanika",
  "q-ex-020": "fale",
  "q-ex-021": "mechanika",
  "q-ex-022": "mechanika",
  "q-ex-023": "mechanika",
  "q-ex-024": "mechanika",
  "q-ex-i01": "mechanika",
  "q-ex-i02": "elektrostatyka",
  "q-ex-i03": "fale",
  "q-ex-i04": "mechanika",
  "q-ex-i05": "mechanika",
  "q-ex-i06": "magnetizm",
  "q-ex-i07": "mechanika",
  "q-ex-i08": "mechanika",
  "q-ex-i09": "mechanika",
  "q-ex-i10": "mechanika",
  "q-ex-i11": "elektrostatyka",
  "q-ex-i12": "obwody",
};

export function getQuestionDomain(questionId: string, basePointId: number): LearnDomainId {
  if (QUESTION_DOMAIN[questionId]) return QUESTION_DOMAIN[questionId];
  if (basePointId >= 1 && basePointId <= 99 && BASE_POINT_DOMAIN[basePointId]) {
    return BASE_POINT_DOMAIN[basePointId];
  }
  return "mechanika";
}

export type LearnSectionId = LearnDomainId | "all" | "random";

export const LEARN_SECTIONS: { id: LearnSectionId; label: string; description: string }[] = [
  {
    id: "random",
    label: "Losowo — cała baza",
    description: "Pytania w losowej kolejności ze wszystkich działów",
  },
  {
    id: "all",
    label: "Cała baza (po kolei)",
    description: "Wszystkie pytania, bez losowania",
  },
  ...(
    [
      "mechanika",
      "elektrostatyka",
      "magnetizm",
      "obwody",
      "optyka",
      "termodynamika",
      "fale",
      "wspolczesna",
    ] as LearnDomainId[]
  ).map((id) => ({
    id,
    label: DOMAIN_LABELS[id],
    description: `Pytania z działu: ${DOMAIN_LABELS[id]}`,
  })),
];

export function shuffleQuestions<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
