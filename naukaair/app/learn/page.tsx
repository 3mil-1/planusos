"use client";

import { useCallback, useMemo, useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { getQuestionsByRange, type Question } from "@/data/questions";
import { LEARN_RANGES } from "@/lib/utils";
import { shuffleQuestionOptions } from "@/lib/shuffleOptions";
import { useQuizStore } from "@/store/useQuizStore";
import { Card } from "@/components/ui/Card";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { SyntheticBadge } from "@/components/quiz/SyntheticBadge";
import { ProgressBar } from "@/components/quiz/ProgressBar";

export default function LearnPage() {
  const recordAnswer = useQuizStore((s) => s.recordAnswer);
  const [range, setRange] = useState<(typeof LEARN_RANGES)[number] | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const current = useMemo(
    () => (questions[index] ? shuffleQuestionOptions(questions[index]) : undefined),
    [questions, index],
  );

  const startRange = (r: (typeof LEARN_RANGES)[number]) => {
    const qs = getQuestionsByRange(r.start, r.end);
    setRange(r);
    setQuestions(qs);
    setIndex(0);
    setSelected(null);
    setShowResult(false);
    setSessionCorrect(0);
  };

  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (!current || showResult) return;
      setSelected(optionIndex);
      setShowResult(true);
      const isCorrect = optionIndex === current.correctAnswerIndex;
      recordAnswer(current.id, isCorrect);
      if (isCorrect) setSessionCorrect((c) => c + 1);
    },
    [current, showResult, recordAnswer],
  );

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setRange(null);
      setQuestions([]);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  };

  const progressLabel = useMemo(() => {
    if (!range) return "";
    return `Pytanie ${index + 1} z ${questions.length} (${range.label})`;
  }, [range, index, questions.length]);

  if (!range || !current) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Tryb Nauki</h1>
          <p className="mt-2 text-slate-400">Wybierz zakres pytań z bazy 2025 (1–99).</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => startRange(r)}
              className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-left transition-all hover:border-sky-500/40 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <span className="text-lg font-semibold text-white">Zagadnienia {r.label}</span>
              <p className="mt-1 text-sm text-slate-400">
                {getQuestionsByRange(r.start, r.end).length} pytań
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tryb Nauki — {range.label}</h1>
          <p className="text-sm text-slate-400">
            Sesja: {sessionCorrect}/{index + (showResult ? 1 : 0)} poprawnych
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRange(null);
            setQuestions([]);
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Zmień zakres
        </button>
      </div>

      <ProgressBar current={index + 1} total={questions.length} label={progressLabel} />

      <Card>
        <div className="mb-4">
          <SyntheticBadge visible={current.isSynthetic} />
        </div>

        <QuestionCard
          question={current}
          mode="learn"
          selectedIndex={selected}
          onSelect={handleSelect}
          showResult={showResult}
        />

        {showResult && (
          <div className="mt-6 animate-fade-in overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
            <div className="border-b border-slate-700 px-4 py-3 text-sm font-medium text-sky-400">
              Wyjaśnienie:
            </div>
            <p className="px-4 py-4 text-sm leading-relaxed text-slate-300">
              {current.explanation}
            </p>
          </div>
        )}

        {showResult && (
          <button
            type="button"
            onClick={handleNext}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 font-medium text-white transition-all hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            {index + 1 >= questions.length ? "Zakończ sesję" : "Następne"}
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </Card>
    </div>
  );
}
