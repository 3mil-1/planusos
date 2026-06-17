"use client";

import { BookOpen, FileText } from "lucide-react";
import type { QuestionSource } from "@/data/questionTypes";
import { formatQuestionSource } from "@/data/questionTypes";

interface SourceBadgeProps {
  source: QuestionSource;
  isSynthetic: boolean;
}

export function SourceBadge({ source, isSynthetic }: SourceBadgeProps) {
  if (isSynthetic) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-200"
        title={source.type === "baza2025" ? source.title : undefined}
      >
        <BookOpen className="h-3.5 w-3.5 shrink-0" />
        Baza 2025 — pkt {source.type === "baza2025" ? source.point : "?"}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200"
      title={source.type === "exam" ? source.note : formatQuestionSource(source)}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      Egzamin: {source.type === "exam" ? source.ref : "?"}
    </span>
  );
}
