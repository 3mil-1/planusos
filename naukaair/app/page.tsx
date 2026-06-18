"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, Coins, GraduationCap, ShoppingBag, TrendingDown, Users } from "lucide-react";
import { NavAnchor } from "@/components/ui/NavAnchor";
import { TOTAL_QUESTIONS } from "@/data/questionBankMeta";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/Card";
import { CoinDisplay } from "@/components/economy/CoinDisplay";
import { ProfileBadge } from "@/components/profile/ProfileBadge";
import { formatPercent } from "@/lib/utils";
import {
  COINS_EXAM_CORRECT,
  COINS_LEARN_CORRECT,
  normalizeEconomy,
} from "@/lib/economy";

export default function DashboardPage() {
  const totalAnswered = useQuizStore((s) => s.totalAnswered);
  const correctAnswers = useQuizStore((s) => s.correctAnswers);
  const wrongAnswers = useQuizStore((s) => s.wrongAnswers);
  const questionStats = useQuizStore((s) => s.questionStats);
  const history = useQuizStore((s) => s.history);
  const economy = useQuizStore((s) => normalizeEconomy(s.economy));
  const username = useAuthStore((s) => s.username);
  const globalUsers = useAuthStore((s) => s.globalUsers);
  const storagePersistent = useAuthStore((s) => s.storagePersistent);
  const globalStatsLoading = useAuthStore((s) => s.globalStatsLoading);
  const [hardTopics, setHardTopics] = useState<
    Array<{ topic: string; accuracy: number; attempts: number }>
  >([]);

  useEffect(() => {
    void useAuthStore.getState().fetchGlobalStats();

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void useAuthStore.getState().fetchGlobalStats();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void import("@/data/questions").then(({ questionsDb }) => {
      if (cancelled) return;
      const topicMap: Record<string, { attempts: number; correct: number }> = {};
      for (const q of questionsDb) {
        const stat = questionStats[q.id];
        if (!stat || stat.attempts === 0) continue;
        if (!topicMap[q.topic]) {
          topicMap[q.topic] = { attempts: 0, correct: 0 };
        }
        topicMap[q.topic].attempts += stat.attempts;
        topicMap[q.topic].correct += stat.correct;
      }
      setHardTopics(
        Object.entries(topicMap)
          .map(([topic, data]) => ({
            topic,
            accuracy: formatPercent(data.correct, data.attempts),
            attempts: data.attempts,
          }))
          .filter((t) => t.attempts >= 2)
          .sort((a, b) => a.accuracy - b.accuracy)
          .slice(0, 3),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [questionStats]);

  const accuracy = formatPercent(correctAnswers, totalAnswered);

  const recentSessions = history.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          naukaair — Baza Egzaminacyjna Fizyka 2025
        </h1>
        <p className="mt-2 text-slate-400">
          Witaj,{" "}
          <ProfileBadge username={username ?? ""} equipped={economy.equipped} highlight />. Baza:{" "}
          <span className="text-white">{TOTAL_QUESTIONS}</span> pytań — zdobywaj punkty za
          poprawne odpowiedzi (+{COINS_LEARN_CORRECT} nauka, +{COINS_EXAM_CORRECT} egzamin).
        </p>
        <div className="mt-3">
          <CoinDisplay />
        </div>
      </div>

      {!storagePersistent && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p>
            Statystyki na serwerze nie są trwałe — brak{" "}
            <code className="rounded bg-slate-800 px-1">DATABASE_URL</code> na Renderze.
            Po restarcie/uspieniu serwisu ranking i postęp znikają. Dodaj darmową bazę Neon
            Postgres i ustaw zmienną środowiskową, potem zrób redeploy.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-400">Skuteczność</p>
          <p className="mt-2 text-3xl font-bold text-white">{accuracy}%</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Odpowiedzi łącznie</p>
          <p className="mt-2 text-3xl font-bold text-white">{totalAnswered}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Poprawne</p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">{correctAnswers}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Błędne</p>
          <p className="mt-2 text-3xl font-bold text-red-400">{wrongAnswers}</p>
        </Card>
      </div>

      {hardTopics.length > 0 && (
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Trudne tematy</h2>
          </div>
          <ul className="space-y-3">
            {hardTopics.map((t) => (
              <li
                key={t.topic}
                className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3"
              >
                <span className="text-slate-200">{t.topic}</span>
                <span className="font-mono text-sm text-amber-300">{t.accuracy}%</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NavAnchor
          href="/learn"
          className="group block rounded-2xl border border-slate-800 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-8 transition-all hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/10 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        >
          <BookOpen className="mb-4 h-10 w-10 text-sky-400 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-semibold text-white">Tryb Nauki</h3>
          <p className="mt-2 text-sm text-slate-400">
            Fiszki z natychmiastową oceną. +{COINS_LEARN_CORRECT} pkt za poprawną odpowiedź.
          </p>
        </NavAnchor>

        <NavAnchor
          href="/exam"
          className="group block rounded-2xl border border-slate-800 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-8 transition-all hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        >
          <GraduationCap className="mb-4 h-10 w-10 text-violet-400 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-semibold text-white">Symulacja Egzaminu</h3>
          <p className="mt-2 text-sm text-slate-400">
            40 losowych pytań, 60 minut. +{COINS_EXAM_CORRECT} pkt za poprawną + bonusy.
          </p>
        </NavAnchor>

        <NavAnchor
          href="/casino"
          className="group block rounded-2xl border border-slate-800 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          <Coins className="mb-4 h-10 w-10 text-amber-400 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-semibold text-white">Mini kasyno</h3>
          <p className="mt-2 text-sm text-slate-400">
            Ruletka i plinko — ryzykuj punkty, wygraj mnożnik do ×5.
          </p>
        </NavAnchor>

        <NavAnchor
          href="/shop"
          className="group block rounded-2xl border border-slate-800 bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-8 transition-all hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/10 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
        >
          <ShoppingBag className="mb-4 h-10 w-10 text-pink-400 transition-transform group-hover:scale-110" />
          <h3 className="text-xl font-semibold text-white">Sklepik</h3>
          <p className="mt-2 text-sm text-slate-400">
            Ognisty nick, obwódka, kotek — kosmetyki w rankingu.
          </p>
        </NavAnchor>
      </div>

      <Card>
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-sky-400" />
            <h2 className="text-lg font-semibold text-white">Ranking globalny</h2>
            {globalStatsLoading && (
              <span className="text-xs text-slate-500">Odświeżanie…</span>
            )}
          </div>
          {globalUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-400">
                  <th className="pb-3 pr-4">#</th>
                  <th className="pb-3 pr-4">Gracz</th>
                  <th className="pb-3 pr-4">Skuteczność</th>
                  <th className="pb-3 pr-4">Odpowiedzi</th>
                  <th className="pb-3">Punkty</th>
                </tr>
              </thead>
              <tbody>
                {globalUsers.slice(0, 10).map((u, i) => (
                  <tr
                    key={u.username}
                    className={`border-b border-slate-800/60 ${
                      u.username === username ? "bg-sky-500/5" : ""
                    }`}
                  >
                    <td className="py-3 pr-4 text-slate-500">{i + 1}</td>
                    <td className="py-3 pr-4 font-medium">
                      <ProfileBadge
                        username={u.username}
                        equipped={u.equipped}
                        highlight={u.username === username}
                        size="sm"
                      />
                      {u.username === username && (
                        <span className="ml-2 text-xs text-sky-400">(Ty)</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-emerald-400">{u.accuracy}%</td>
                    <td className="py-3 pr-4 text-slate-400">{u.totalAnswered}</td>
                    <td className="py-3 font-mono text-amber-300/90">{u.coins ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          ) : (
            <p className="text-sm text-slate-500">
              {globalStatsLoading
                ? "Pobieranie rankingu z serwera…"
                : "Brak danych rankingu — serwer może się budzić (Render Free). Odśwież za chwilę."}
            </p>
          )}
        </Card>

      {recentSessions.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-white">Ostatnie sesje</h2>
          <ul className="space-y-2 text-sm">
            {recentSessions.map((s, i) => (
              <li key={`${s.date}-${i}`} className="flex justify-between text-slate-300">
                <span>
                  {s.type === "egzamin" ? "Egzamin" : "Nauka"} —{" "}
                  {new Date(s.date).toLocaleString("pl-PL")}
                </span>
                <span>
                  {s.score}/{s.totalQuestions}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
