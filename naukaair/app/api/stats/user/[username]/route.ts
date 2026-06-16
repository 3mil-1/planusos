import { NextResponse } from "next/server";
import {
  isValidUsername,
  normalizeUsername,
} from "@/lib/globalStats";
import { getUserStats } from "@/lib/statsStore";
import { emptyUserStats } from "@/lib/statsMerge";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> },
) {
  const { username: raw } = await context.params;
  const username = normalizeUsername(decodeURIComponent(raw));

  if (!isValidUsername(username)) {
    return NextResponse.json({ error: "Nieprawidłowy login" }, { status: 400 });
  }

  const stats = (await getUserStats(username)) ?? emptyUserStats();
  return NextResponse.json({ username, stats });
}
