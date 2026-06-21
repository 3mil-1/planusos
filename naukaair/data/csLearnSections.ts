import {
  CS_DEFINITIONS,
  CS_EXAM_SECTIONS,
  CS_OPEN_QUESTIONS,
  type CsCard,
  type CsSectionId,
} from "./csBaza2024";

export type { CsSectionId };

export const CS_LEARN_SECTIONS: {
  id: CsSectionId;
  label: string;
  description: string;
}[] = [
  {
    id: "random-all",
    label: "Losowo — cała baza",
    description: "Definicje i pytania otwarte w losowej kolejności",
  },
  {
    id: "random-definitions",
    label: "Losowo — definicje",
    description: "92 haseł z bazy (C++ / Python)",
  },
  {
    id: "definitions",
    label: "Definicje (po kolei)",
    description: "Wszystkie definicje 1–92 w kolejności z PDF",
  },
  {
    id: "all-open",
    label: "Pytania otwarte (wszystkie)",
    description: "Pytania egzaminacyjne ze wszystkich terminów",
  },
  ...CS_EXAM_SECTIONS.map((s) => ({
    id: s.id as CsSectionId,
    label: s.label,
    description: `Pytania otwarte — ${s.label}`,
  })),
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function getCsCardsForSection(sectionId: CsSectionId): CsCard[] {
  switch (sectionId) {
    case "definitions":
      return [...CS_DEFINITIONS];
    case "random-definitions":
      return shuffle(CS_DEFINITIONS);
    case "all-open":
      return [...CS_OPEN_QUESTIONS];
    case "random-all":
      return shuffle([...CS_DEFINITIONS, ...CS_OPEN_QUESTIONS]);
    default:
      return CS_OPEN_QUESTIONS.filter((q) => q.sectionId === sectionId);
  }
}

export function countCsCardsForSection(sectionId: CsSectionId): number {
  return getCsCardsForSection(sectionId).length;
}

export function getCsCardPrompt(card: CsCard): string {
  return card.kind === "definition" ? card.title : card.prompt;
}

export function getCsCardAnswer(card: CsCard): string {
  return card.answer;
}

export function getCsCardLabel(card: CsCard): string {
  if (card.kind === "definition") {
    return `Definicja ${card.num}`;
  }
  const section = CS_EXAM_SECTIONS.find((s) => s.id === card.sectionId);
  return `${section?.label ?? card.sectionId} · pyt. ${card.num}`;
}
