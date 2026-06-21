"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Coins, Cpu, RotateCcw } from "lucide-react";
import {
  countQuestionsForLearnSection,
  getQuestionsForLearnSection,
  type Question,
} from "@/data/questions";
import { LEARN_SECTIONS, type LearnSectionId } from "@/data/learnDomains";
import { shuffleQuestionOptions } from "@/lib/shuffleOptions";
import { useQuizStore } from "@/store/useQuizStore";
import { Card } from "@/components/ui/Card";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { SourceBadge } from "@/components/quiz/SourceBadge";
import { ProgressBar } from "@/components/quiz/ProgressBar";

export default function LearnPage() {
  const recordAnswer = useQuizStore((s) => s.recordAnswer);
  const lastCoinToast = useQuizStore((s) => s.lastCoinToast);
  const clearCoinToast = useQuizStore((s) => s.clearCoinToast);
  const [sectionId, setSectionId] = useState<LearnSectionId | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);

  const section = useMemo(
    () => LEARN_SECTIONS.find((s) => s.id === sectionId),
    [sectionId],
  );

  const current = useMemo(
    () => (questions[index] ? shuffleQuestionOptions(questions[index]) : undefined),
    [questions, index],
  );

  const startSection = (id: LearnSectionId) => {
    const qs = getQuestionsForLearnSection(id);
    setSectionId(id);
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
      recordAnswer(current.id, isCorrect, "nauka");
      if (isCorrect) setSessionCorrect((c) => c + 1);
    },
    [current, showResult, recordAnswer],
  );

  useEffect(() => {
    if (!lastCoinToast) return;
    const t = window.setTimeout(() => clearCoinToast(), 2500);
    return () => window.clearTimeout(t);
  }, [lastCoinToast, clearCoinToast]);

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setSectionId(null);
      setQuestions([]);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setShowResult(false);
  };

  const progressLabel = useMemo(() => {
    if (!section) return "";
    return `Pytanie ${index + 1} z ${questions.length} (${section.label})`;
  }, [section, index, questions.length]);

  const globalSections = LEARN_SECTIONS.filter((s) => s.id === "random" || s.id === "all");
  const domainSections = LEARN_SECTIONS.filter(
    (s) => s.id !== "random" && s.id !== "all",
  );

  if (!sectionId || !section || !current) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white">Tryb Nauki</h1>
          <p className="mt-2 text-slate-400">
            Wybierz przedmiot i dział. Fizyka: MCQ z natychmiastową oceną. Informatyka: fiszki z
            bazy baza2k24 (definicje + pytania otwarte).
          </p>
        </div>

        <Link
          href="/learn/informatyka"
          className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 px-6 py-5 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <Cpu className="h-10 w-10 shrink-0 text-emerald-400" />
          <div>
            <span className="text-lg font-semibold text-white">Informatyka (C++ / Python)</span>
            <p className="mt-1 text-sm text-slate-400">
              92 definicje + 32 pytania otwarte z terminów 0–1 — baza2k24
            </p>
          </div>
          <ChevronRight className="ml-auto h-5 w-5 text-emerald-400" />
        </Link>

        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Fizyka</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {globalSections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => startSection(s.id)}
              className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-6 py-5 text-left transition-all hover:border-sky-500/50 hover:bg-sky-500/15 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <span className="text-lg font-semibold text-white">{s.label}</span>
              <p className="mt-1 text-sm text-slate-400">{s.description}</p>
              <p className="mt-2 text-sm font-medium text-sky-300">
                {countQuestionsForLearnSection(s.id)} pytań
              </p>
            </button>
          ))}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            Działy fizyki
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {domainSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => startSection(s.id)}
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-left transition-all hover:border-sky-500/40 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              >
                <span className="text-lg font-semibold text-white">{s.label}</span>
                <p className="mt-2 text-sm text-slate-400">
                  {countQuestionsForLearnSection(s.id)} pytań
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tryb Nauki — {section.label}</h1>
          <p className="text-sm text-slate-400">
            Sesja: {sessionCorrect}/{index + (showResult ? 1 : 0)} poprawnych
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSectionId(null);
            setQuestions([]);
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Zmień dział
        </button>
      </div>

      <ProgressBar current={index + 1} total={questions.length} label={progressLabel} />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <SourceBadge source={current.source} isSynthetic={current.isSynthetic} />
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

        {showResult && lastCoinToast && (
          <p className="mt-4 flex animate-fade-in items-center justify-center gap-2 text-sm font-semibold text-amber-300">
            <Coins className="h-4 w-4" />
            +{lastCoinToast.amount} pkt!
          </p>
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
