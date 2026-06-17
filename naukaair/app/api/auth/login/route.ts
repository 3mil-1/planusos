import { NextResponse } from "next/server";
import {
  isValidUsername,
  normalizeUsername,
} from "@/lib/globalStats";
import { getUserStats, saveUserStats } from "@/lib/statsStore";
import { emptyUserStats } from "@/lib/statsMerge";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string };
  const username = normalizeUsername(body.username ?? "");

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Nieprawidłowy login" }, { status: 400 });
  }

  const existing = await getUserStats(username);
  if (!existing) {
    await saveUserStats(username, emptyUserStats());
  } else {
    await saveUserStats(username, existing);
  }

  return NextResponse.json({ ok: true, username });
}
