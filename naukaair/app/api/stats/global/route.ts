import { NextResponse } from "next/server";
import { getAllUserSummaries, isPersistentStorage } from "@/lib/statsStore";
import { normalizeEconomy } from "@/lib/economy";

export async function GET() {
  const users = await getAllUserSummaries();

  const list = Object.entries(users)
    .map(([username, data]) => {
      const economy = normalizeEconomy(data.economy);
      return {
        username,
        totalAnswered: data.totalAnswered,
        correctAnswers: data.correctAnswers,
        accuracy:
          data.totalAnswered > 0
            ? Math.round((data.correctAnswers / data.totalAnswered) * 100)
            : 0,
        lastActive: data.lastActive,
        coins: economy.coins,
        equipped: economy.equipped,
      };
    })
    .sort((a, b) => b.coins - a.coins || b.accuracy - a.accuracy || b.totalAnswered - a.totalAnswered);

  return NextResponse.json({
    users: list,
    persistent: isPersistentStorage(),
  });
}
