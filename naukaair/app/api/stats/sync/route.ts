import { NextResponse } from "next/server";
import {
  isValidUsername,
  normalizeUsername,
  readGlobalStats,
  StoredUserStats,
  writeGlobalStats,
} from "@/lib/globalStats";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    stats?: Partial<StoredUserStats>;
  };

  const username = normalizeUsername(body.username ?? "");
  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Nieprawidłowy login" }, { status: 400 });
  }

  const incoming = body.stats;
  if (!incoming) {
    return NextResponse.json({ error: "Brak danych statystyk" }, { status: 400 });
  }

  const file = await readGlobalStats();
  const existing = file.users[username] ?? {
    totalAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    history: [],
    questionStats: {},
    lastActive: new Date().toISOString(),
  };

  file.users[username] = {
    totalAnswered: incoming.totalAnswered ?? existing.totalAnswered,
    correctAnswers: incoming.correctAnswers ?? existing.correctAnswers,
    wrongAnswers: incoming.wrongAnswers ?? existing.wrongAnswers,
    history: incoming.history ?? existing.history,
    questionStats: incoming.questionStats ?? existing.questionStats,
    lastActive: new Date().toISOString(),
  };

  await writeGlobalStats(file);
  return NextResponse.json({ ok: true });
}
