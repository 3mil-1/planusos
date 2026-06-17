import { NextResponse } from "next/server";
import { getAllUserSummaries, isPersistentStorage } from "@/lib/statsStore";

export async function GET() {
  const users = await getAllUserSummaries();

  const list = Object.entries(users)
    .map(([username, data]) => ({
      username,
      totalAnswered: data.totalAnswered,
      correctAnswers: data.correctAnswers,
      accuracy:
        data.totalAnswered > 0
          ? Math.round((data.correctAnswers / data.totalAnswered) * 100)
          : 0,
      lastActive: data.lastActive,
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.totalAnswered - a.totalAnswered);

  return NextResponse.json({
    users: list,
    persistent: isPersistentStorage(),
  });
}
