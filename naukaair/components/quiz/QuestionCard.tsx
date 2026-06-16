"use client";

import { cn } from "@/lib/utils";
import type { Question } from "@/data/questions";

const LABELS = ["A", "B", "C", "D"];

interface QuestionCardProps {
  question: Question;
  mode: "learn" | "exam";
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  showResult?: boolean;
}

export function QuestionCard({
  question,
  mode,
  selectedIndex,
  onSelect,
  showResult = false,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-400">
            #{question.basePointId}
          </span>
          <span className="text-sm text-sky-400">{question.topic}</span>
        </div>
        <h2 className="text-lg font-medium leading-relaxed text-white md:text-xl">
          {question.question}
        </h2>
      </div>

      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctAnswerIndex;
          const isWrong = showResult && isSelected && !isCorrect;

          let style =
            "border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-800";

          if (mode === "exam" && isSelected) {
            style = "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/40";
          }

          if (mode === "learn" && showResult) {
            if (isCorrect) {
              style = "border-emerald-500 bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/40";
            } else if (isWrong) {
              style = "border-red-500 bg-red-500/15 text-red-100 ring-1 ring-red-500/40";
            }
          }

          return (
            <button
              key={option}
              type="button"
              disabled={mode === "learn" && showResult}
              onClick={() => onSelect(index)}
              className={cn(
                "flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-default",
                style,
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/80 text-sm font-semibold">
                {LABELS[index]}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed md:text-base">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { LABELS };
