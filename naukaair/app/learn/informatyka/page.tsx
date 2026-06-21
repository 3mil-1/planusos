"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight, Eye, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import {
  CS_LEARN_SECTIONS,
  countCsCardsForSection,
  getCsCardAnswer,
  getCsCardLabel,
  getCsCardPrompt,
  getCsCardsForSection,
  type CsSectionId,
} from "@/data/csLearnSections";
import type { CsCard } from "@/data/csBaza2024";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/quiz/ProgressBar";

export default function InformatykaLearnPage() {
  const [sectionId, setSectionId] = useState<CsSectionId | null>(null);
  const [cards, setCards] = useState<CsCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionKnown, setSessionKnown] = useState(0);

  const section = useMemo(
    () => CS_LEARN_SECTIONS.find((s) => s.id === sectionId),
    [sectionId],
  );

  const current = cards[index];

  const startSection = (id: CsSectionId) => {
    setSectionId(id);
    setCards(getCsCardsForSection(id));
    setIndex(0);
    setRevealed(false);
    setSessionKnown(0);
  };

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleRate = useCallback(
    (known: boolean) => {
      if (!revealed) return;
      if (known) setSessionKnown((c) => c + 1);

      if (index + 1 >= cards.length) {
        setSectionId(null);
        setCards([]);
        return;
      }
      setIndex((i) => i + 1);
      setRevealed(false);
    },
    [revealed, index, cards.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!revealed) handleReveal();
      }
      if (revealed && e.key === "1") handleRate(true);
      if (revealed && e.key === "2") handleRate(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, revealed, handleReveal, handleRate]);

  const globalSections = CS_LEARN_SECTIONS.filter(
    (s) => s.id === "random-all" || s.id === "random-definitions" || s.id === "definitions",
  );
  const openSections = CS_LEARN_SECTIONS.filter(
    (s) => s.id === "all-open" || s.id.startsWith("termin-"),
  );

  const progressLabel = section
    ? `Karta ${index + 1} z ${cards.length} (${section.label})`
    : "";

  if (!sectionId || !section || !current) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href="/learn"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 transition-colors hover:border-sky-500/40 hover:text-white"
            >
              ← Fizyka
            </Link>
            <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 font-medium text-emerald-300">
              Informatyka (baza2k24)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Tryb Nauki — Informatyka</h1>
          <p className="mt-2 text-slate-400">
            Definicje C++/Python i pytania otwarte z terminów 0–1. Pokaż odpowiedź i oceń się
            samodzielnie.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {globalSections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => startSection(s.id)}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5 text-left transition-all hover:border-emerald-500/50 hover:bg-emerald-500/15 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              <span className="text-lg font-semibold text-white">{s.label}</span>
              <p className="mt-1 text-sm text-slate-400">{s.description}</p>
              <p className="mt-2 text-sm font-medium text-emerald-300">
                {countCsCardsForSection(s.id)} kart
              </p>
            </button>
          ))}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            Pytania otwarte (terminy)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {openSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => startSection(s.id)}
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-left transition-all hover:border-emerald-500/40 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                <span className="text-lg font-semibold text-white">{s.label}</span>
                <p className="mt-1 text-sm text-slate-400">{s.description}</p>
                <p className="mt-2 text-sm font-medium text-slate-300">
                  {countCsCardsForSection(s.id)} pytań
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
          <h1 className="text-xl font-bold text-white">Informatyka — {section.label}</h1>
          <p className="text-sm text-slate-400">
            Sesja: {sessionKnown}/{index + (revealed ? 1 : 0)} „umiem”
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSectionId(null);
            setCards([]);
          }}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Zmień sekcję
        </button>
      </div>

      <ProgressBar current={index + 1} total={cards.length} label={progressLabel} />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              current.kind === "definition"
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-violet-500/15 text-violet-300"
            }`}
          >
            {current.kind === "definition" ? "Definicja" : "Pytanie otwarte"}
          </span>
          <span className="text-xs text-slate-500">{getCsCardLabel(current)}</span>
        </div>

        <div className="min-h-[120px] rounded-xl border border-slate-700/80 bg-slate-800/40 px-5 py-6">
          <p className="text-lg font-medium leading-relaxed text-white">
            {getCsCardPrompt(current)}
          </p>
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={handleReveal}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-medium text-white transition-all hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <Eye className="h-5 w-5" />
            Pokaż odpowiedź
            <span className="text-sm font-normal text-emerald-100/80">(Spacja)</span>
          </button>
        ) : (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
              <div className="border-b border-slate-700 px-4 py-3 text-sm font-medium text-emerald-400">
                Odpowiedź:
              </div>
              <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-slate-300">
                {getCsCardAnswer(current)}
              </p>
            </div>

            <p className="text-center text-sm text-slate-500">Czy znałeś odpowiedź?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRate(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 font-medium text-emerald-200 transition-all hover:bg-emerald-500/20"
              >
                <ThumbsUp className="h-5 w-5" />
                Umiem
              </button>
              <button
                type="button"
                onClick={() => handleRate(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-3 font-medium text-red-200 transition-all hover:bg-red-500/20"
              >
                <ThumbsDown className="h-5 w-5" />
                Do powtórki
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleRate(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 py-2.5 text-sm text-slate-400 transition-all hover:bg-slate-800"
            >
              {index + 1 >= cards.length ? "Zakończ sesję" : "Następna karta"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
