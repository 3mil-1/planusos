import { NextResponse } from "next/server";
import {
  isValidUsername,
  normalizeUsername,
  readGlobalStats,
  writeGlobalStats,
} from "@/lib/globalStats";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string };
  const username = normalizeUsername(body.username ?? "");

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Nieprawidłowy login" }, { status: 400 });
  }

  const stats = await readGlobalStats();

  if (!stats.users[username]) {
    stats.users[username] = {
      totalAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      history: [],
      questionStats: {},
      lastActive: new Date().toISOString(),
    };
    await writeGlobalStats(stats);
  } else {
    stats.users[username].lastActive = new Date().toISOString();
    await writeGlobalStats(stats);
  }

  return NextResponse.json({ ok: true, username });
}
