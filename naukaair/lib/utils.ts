export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const EXAM_DURATION_SECONDS = 60 * 60;
export const EXAM_QUESTION_COUNT = 40;

export const LEARN_RANGES = [
  { label: "1–20", start: 1, end: 20 },
  { label: "21–40", start: 21, end: 40 },
  { label: "41–60", start: 41, end: 60 },
  { label: "61–80", start: 61, end: 80 },
  { label: "81–99", start: 81, end: 99 },
  { label: "Wszystkie (1–99)", start: 1, end: 99 },
  { label: "Extra z egzaminów", start: 100, end: 129 },
  { label: "Z obrazkami (skany PDF)", start: 130, end: 199 },
  { label: "Pełna baza (1–99 + extra)", start: 1, end: 199 },
] as const;
