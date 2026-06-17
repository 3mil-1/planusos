export type ExamSource = {
  type: "exam";
  pdf: string;
  ref: string;
  note?: string;
};

export type Baza2025Source = {
  type: "baza2025";
  point: number;
  title: string;
};

export type QuestionSource = ExamSource | Baza2025Source;

export function isSyntheticSource(source: QuestionSource): boolean {
  return source.type === "baza2025";
}

export function formatQuestionSource(source: QuestionSource): string {
  if (source.type === "exam") {
    return `${source.pdf} (${source.ref})`;
  }
  return `Baza AGH 2025 — pkt ${source.point}`;
}
