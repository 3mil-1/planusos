"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { NavAnchor } from "@/components/ui/NavAnchor";
import type { ExamResultPayload } from "@/app/exam/page";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/quiz/ScoreRing";
import { SourceBadge } from "@/components/quiz/SourceBadge";
import { getQuestionById } from "@/data/questions";
import { formatPercent } from "@/lib/utils";

export default function ResultsPage() {
  const [result, setResult] = useState<ExamResultPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("naukaair-last-exam");
    if (raw) {
      setResult(JSON.parse(raw) as ExamResultPayload);
    }
  }, []);

  if (!result) {
    return (
      <Card className="text-center">
        <p className="text-slate-400">Brak wyników egzaminu. Rozpocznij nowy test.</p>
        <NavAnchor
          href="/exam"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm text-white hover:bg-violet-400"
        >
          <RotateCcw className="h-4 w-4" />
          Nowy egzamin
        </NavAnchor>
      </Card>
    );
  }

  const percent = formatPercent(result.score, result.total);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Podsumowanie egzaminu</h1>
        <p className="mt-2 text-slate-400">
          {result.score} / {result.total} poprawnych —{" "}
          {new Date(result.finishedAt).toLocaleString("pl-PL")}
        </p>
      </div>

      <Card className="flex flex-col items-center py-10">
        <ScoreRing percent={percent} size={180} />
        <p className="mt-6 text-lg text-slate-300">
          {percent >= 72 ? "Wynik na poziomie zdawalności (~72%)!" : "Powtórz trudne tematy."}
        </p>
      </Card>

      {result.wrongItems.length > 0 ? (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Błędne odpowiedzi ({result.wrongItems.length})
          </h2>

          {result.wrongItems.map((item) => (
            <Card key={item.questionId} className="border-red-500/20">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-sky-400">{item.topic}</span>
                {(() => {
                  const q = getQuestionById(item.questionId);
                  if (!q) return null;
                  return <SourceBadge source={q.source} isSynthetic={q.isSynthetic} />;
                })()}
              </div>
              <p className="font-medium text-white">{item.question}</p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-red-500/10 px-3 py-2 text-red-300">
                  Twoja odpowiedź: <strong>{item.selectedLabel}</strong>
                </div>
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-300">
                  Poprawna: <strong>{item.correctLabel}</strong>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3">
                <p className="text-xs font-medium text-sky-400">Wyjaśnienie</p>
                <p className="mt-1 text-sm text-slate-300">{item.explanation}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center text-emerald-400">
          Perfekcyjny wynik — zero błędów!
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <NavAnchor
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-5 py-2.5 text-sm text-slate-300 transition-all hover:bg-slate-800"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </NavAnchor>
        <NavAnchor
          href="/exam"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm text-white transition-all hover:bg-violet-400"
        >
          <RotateCcw className="h-4 w-4" />
          Powtórz egzamin
        </NavAnchor>
        <NavAnchor
          href="/learn"
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm text-white transition-all hover:bg-sky-400"
        >
          Tryb nauki
        </NavAnchor>
      </div>
    </div>
  );
}
