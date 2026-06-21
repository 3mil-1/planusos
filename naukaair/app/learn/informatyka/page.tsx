"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Coins, Eye, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
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
import { getCsGeminiExplanation } from "@/data/csGeminiExplanations";
import { COINS_CS_LEARN_CORRECT } from "@/lib/economy";
import { useQuizStore } from "@/store/useQuizStore";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/quiz/ProgressBar";

interface MasterySession {
  sectionId: CsSectionId;
  totalCount: number;
  queue: CsCard[];
  index: number;
  round: number;
  retryPool: CsCard[];
  masteredIds: string[];
}

export default function InformatykaLearnPage() {
  const recordAnswer = useQuizStore((s) => s.recordAnswer);
  const lastCoinToast = useQuizStore((s) => s.lastCoinToast);
  const clearCoinToast = useQuizStore((s) => s.clearCoinToast);

  const [session, setSession] = useState<MasterySession | null>(null);
  const [complete, setComplete] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState("");

  const section = useMemo(
    () => CS_LEARN_SECTIONS.find((s) => s.id === session?.sectionId),
    [session?.sectionId],
  );

  const current = session?.queue[session.index];
  const geminiExplanation =
    current?.kind === "definition" ? getCsGeminiExplanation(current.id) : undefined;

  const startSection = (id: CsSectionId) => {
    const cards = getCsCardsForSection(id);
    setSession({
      sectionId: id,
      totalCount: cards.length,
      queue: cards,
      index: 0,
      round: 1,
      retryPool: [],
      masteredIds: [],
    });
    setComplete(false);
    setRevealed(false);
    setDraftAnswer("");
  };

  const exitSession = () => {
    setSession(null);
    setComplete(false);
    setRevealed(false);
    setDraftAnswer("");
  };

  const handleReveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const handleRate = useCallback(
    (known: boolean) => {
      if (!revealed || !current || !session) return;

      recordAnswer(current.id, known, "informatyka");

      const retryPool = known ? session.retryPool : [...session.retryPool, current];
      const masteredIds = known
        ? session.masteredIds.includes(current.id)
          ? session.masteredIds
          : [...session.masteredIds, current.id]
        : session.masteredIds;

      const isLastInRound = session.index + 1 >= session.queue.length;

      if (isLastInRound) {
        if (retryPool.length === 0) {
          setSession({ ...session, retryPool, masteredIds });
          setComplete(true);
        } else {
          setSession({
            ...session,
            queue: retryPool,
            index: 0,
            round: session.round + 1,
            retryPool: [],
            masteredIds,
          });
        }
      } else {
        setSession({
          ...session,
          index: session.index + 1,
          retryPool,
          masteredIds,
        });
      }

      setRevealed(false);
      setDraftAnswer("");
    },
    [revealed, current, session, recordAnswer],
  );

  useEffect(() => {
    if (!lastCoinToast) return;
    const t = window.setTimeout(() => clearCoinToast(), 2500);
    return () => window.clearTimeout(t);
  }, [lastCoinToast, clearCoinToast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!current || complete) return;
      const target = e.target;
      const isTyping =
        target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement;

      if (isTyping) {
        if (e.key === "Enter" && e.ctrlKey && !revealed) {
          e.preventDefault();
          handleReveal();
        }
        return;
      }

      if (e.key === " " && !revealed) {
        e.preventDefault();
        handleReveal();
      }
      if (revealed && e.key === "1") handleRate(true);
      if (revealed && e.key === "2") handleRate(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, complete, revealed, handleReveal, handleRate]);

  const globalSections = CS_LEARN_SECTIONS.filter(
    (s) => s.id === "random-all" || s.id === "random-definitions" || s.id === "definitions",
  );
  const openSections = CS_LEARN_SECTIONS.filter(
    (s) => s.id === "all-open" || s.id.startsWith("termin-"),
  );

  const masteredCount = session?.masteredIds.length ?? 0;
  const totalCount = session?.totalCount ?? 0;

  const progressLabel = useMemo(() => {
    if (!session || !section) return "";
    const roundInfo =
      session.round > 1 ? ` · runda ${session.round}` : "";
    return `Opanowane ${masteredCount}/${totalCount}${roundInfo} · karta ${session.index + 1}/${session.queue.length}`;
  }, [session, section, masteredCount, totalCount]);

  if (!session || !section) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="mb-3">
            <Link
              href="/learn"
              className="inline-flex rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-sky-500/40 hover:text-white"
            >
              ← Nauka
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-white">Tryb Nauki — Informatyka</h1>
          <p className="mt-2 text-slate-400">
            Wpisz odpowiedź, porównaj z bazą i oceń się. Karty z „nie umiem” wracają w kolejnej
            rundzie, aż opanujesz całą sekcję. +{COINS_CS_LEARN_CORRECT} pkt za każde „umiem”.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className="rounded-xl border border-slate-800 bg-slate-900/70 px-6 py-5 text-left transition-all hover:border-sky-500/40 hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
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

  if (complete) {
    return (
      <div className="mx-auto max-w-lg space-y-6 animate-fade-in py-8 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
        <h1 className="text-2xl font-bold text-white">Sekcja opanowana!</h1>
        <p className="text-slate-400">
          Wszystkie {totalCount} kart z „{section.label}” masz za sobą — każda dostała „umiem”.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => startSection(session.sectionId)}
            className="rounded-xl bg-sky-500 px-6 py-3 font-medium text-white transition-all hover:bg-sky-400"
          >
            Powtórz sekcję
          </button>
          <button
            type="button"
            onClick={exitSession}
            className="rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 transition-all hover:bg-slate-800"
          >
            Wybierz inną sekcję
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{section.label}</h1>
          <p className="text-sm text-slate-400">
            Opanowane {masteredCount}/{totalCount}
            {session.round > 1 ? ` · runda ${session.round}` : ""}
            {session.retryPool.length > 0
              ? ` · czeka na powtórkę: ${session.retryPool.length}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={exitSession}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-all hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" />
          Zmień sekcję
        </button>
      </div>

      <ProgressBar current={masteredCount} total={totalCount} label={progressLabel} />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              current.kind === "definition"
                ? "bg-sky-500/15 text-sky-300"
                : "bg-violet-500/15 text-violet-300"
            }`}
          >
            {current.kind === "definition" ? "Definicja" : "Pytanie otwarte"}
          </span>
          <span className="text-xs text-slate-500">{getCsCardLabel(current)}</span>
          {session.round > 1 && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300">
              Powtórka
            </span>
          )}
        </div>

        <div className="min-h-[120px] rounded-xl border border-slate-700/80 bg-slate-800/40 px-5 py-6">
          <p className="text-lg font-medium leading-relaxed text-white">
            {getCsCardPrompt(current)}
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="cs-draft-answer" className="mb-2 block text-sm font-medium text-slate-400">
            Twoja odpowiedź
            <span className="ml-2 font-normal text-slate-600">— tylko na tej karcie, bez zapisu</span>
          </label>
          <textarea
            id="cs-draft-answer"
            value={draftAnswer}
            onChange={(e) => setDraftAnswer(e.target.value)}
            readOnly={revealed}
            placeholder="Wpisz definicję albo odpowiedź własnymi słowami…"
            rows={5}
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/30 read-only:opacity-80"
          />
          {!revealed && (
            <p className="mt-2 text-xs text-slate-600">Ctrl+Enter — pokaż odpowiedź z bazy</p>
          )}
        </div>

        {!revealed ? (
          <button
            type="button"
            onClick={handleReveal}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 font-medium text-white transition-all hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <Eye className="h-5 w-5" />
            Pokaż odpowiedź z bazy
            <span className="text-sm font-normal text-sky-100/80">(Spacja)</span>
          </button>
        ) : (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
              <div className="border-b border-slate-700 px-4 py-3 text-sm font-medium text-sky-400">
                Odpowiedź z bazy:
              </div>
              <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-slate-300">
                {getCsCardAnswer(current)}
              </p>
            </div>

            {geminiExplanation && (
              <div className="overflow-hidden rounded-xl border border-violet-500/30 bg-violet-500/5">
                <div className="border-b border-violet-500/20 px-4 py-3 text-sm font-medium text-violet-300">
                  Wytłumaczenie Gemini
                </div>
                <p className="whitespace-pre-wrap px-4 py-4 text-sm leading-relaxed text-slate-300">
                  {geminiExplanation}
                </p>
              </div>
            )}

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
                Nie umiem
              </button>
            </div>

            {lastCoinToast && (
              <p className="flex animate-fade-in items-center justify-center gap-2 text-sm font-semibold text-amber-300">
                <Coins className="h-4 w-4" />
                +{lastCoinToast.amount} pkt!
              </p>
            )}

            <p className="text-center text-xs text-slate-600">
              „Nie umiem” wraca w następnej rundzie · „Umiem” +{COINS_CS_LEARN_CORRECT} pkt
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
