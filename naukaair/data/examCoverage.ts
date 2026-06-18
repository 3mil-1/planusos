import { questionsDb } from "./questions";
import { DOMAIN_LABELS, type LearnDomainId } from "./learnDomains";
import { formatQuestionSource } from "./questionTypes";

export function getQuestionAuditSummary() {
  const exam = questionsDb.filter((q) => !q.isSynthetic);
  const synthetic = questionsDb.filter((q) => q.isSynthetic);

  const byDomain = Object.fromEntries(
    (Object.keys(DOMAIN_LABELS) as LearnDomainId[]).map((id) => [
      id,
      questionsDb.filter((q) => q.domain === id).length,
    ]),
  );

  const byPdf = new Map<string, number>();
  for (const q of exam) {
    if (q.source.type === "exam") {
      byPdf.set(q.source.pdf, (byPdf.get(q.source.pdf) ?? 0) + 1);
    }
  }

  return {
    total: questionsDb.length,
    byDomain,
    examCount: exam.length,
    syntheticCount: synthetic.length,
    byPdf: Object.fromEntries(byPdf),
    examQuestions: exam.map((q) => ({
      id: q.id,
      point: q.basePointId,
      domain: q.domain,
      ref: q.source.type === "exam" ? q.source.ref : "",
      source: formatQuestionSource(q.source),
    })),
  };
}
