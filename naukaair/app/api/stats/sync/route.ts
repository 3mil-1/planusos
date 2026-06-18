import { NextResponse } from "next/server";
import {
  isValidUsername,
  normalizeUsername,
} from "@/lib/globalStats";
import { getUserStats, saveUserStats } from "@/lib/statsStore";
import { emptyUserStats, mergeUserStats } from "@/lib/statsMerge";
import { normalizeEconomy } from "@/lib/economy";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    stats?: Partial<ReturnType<typeof emptyUserStats>>;
  };

  const username = normalizeUsername(body.username ?? "");
  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Nieprawidłowy login" }, { status: 400 });
  }

  const incoming = body.stats;
  if (!incoming) {
    return NextResponse.json({ error: "Brak danych statystyk" }, { status: 400 });
  }

  const existing = (await getUserStats(username)) ?? emptyUserStats();
  const merged = mergeUserStats(existing, {
    totalAnswered: incoming.totalAnswered ?? 0,
    correctAnswers: incoming.correctAnswers ?? 0,
    wrongAnswers: incoming.wrongAnswers ?? 0,
    history: incoming.history ?? [],
    questionStats: incoming.questionStats ?? {},
    economy: normalizeEconomy(incoming.economy ?? existing.economy),
    lastActive: new Date().toISOString(),
  });

  await saveUserStats(username, merged);

  return NextResponse.json({ ok: true });
}
