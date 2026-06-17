import { questionsDb } from "./questions";
import { isExtraPointId } from "./extraQuestions";
import { formatQuestionSource } from "./questionTypes";

export function getQuestionAuditSummary() {
  const exam = questionsDb.filter((q) => !q.isSynthetic);
  const synthetic = questionsDb.filter((q) => q.isSynthetic);
  const extra = questionsDb.filter((q) => isExtraPointId(q.basePointId));
  const baza = questionsDb.filter((q) => q.basePointId >= 1 && q.basePointId <= 99);

  const byPdf = new Map<string, number>();
  for (const q of exam) {
    if (q.source.type === "exam") {
      byPdf.set(q.source.pdf, (byPdf.get(q.source.pdf) ?? 0) + 1);
    }
  }

  return {
    total: questionsDb.length,
    bazaCount: baza.length,
    extraCount: extra.length,
    examCount: exam.length,
    syntheticCount: synthetic.length,
    byPdf: Object.fromEntries(byPdf),
    examQuestions: exam.map((q) => ({
      id: q.id,
      point: q.basePointId,
      ref: q.source.type === "exam" ? q.source.ref : "",
      source: formatQuestionSource(q.source),
    })),
  };
}
