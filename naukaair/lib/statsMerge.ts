import type { StoredUserStats } from "@/lib/globalStats";
import { mergeEconomy, normalizeEconomy, emptyEconomy } from "@/lib/economy";

export function mergeUserStats(
  local: StoredUserStats,
  remote: StoredUserStats,
): StoredUserStats {
  const pick = local.totalAnswered >= remote.totalAnswered ? local : remote;
  const other = local.totalAnswered >= remote.totalAnswered ? remote : local;

  const questionStats = { ...pick.questionStats };
  for (const [id, stat] of Object.entries(other.questionStats)) {
    const current = questionStats[id];
    if (!current || stat.attempts > current.attempts) {
      questionStats[id] = stat;
    }
  }

  const historyMap = new Map<string, StoredUserStats["history"][number]>();
  for (const entry of [...pick.history, ...other.history]) {
    historyMap.set(`${entry.date}-${entry.type}-${entry.score}`, entry);
  }
  const history = [...historyMap.values()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  return {
    totalAnswered: Math.max(local.totalAnswered, remote.totalAnswered),
    correctAnswers: Math.max(local.correctAnswers, remote.correctAnswers),
    wrongAnswers: Math.max(local.wrongAnswers, remote.wrongAnswers),
    history,
    questionStats,
    economy: mergeEconomy(
      normalizeEconomy(local.economy),
      normalizeEconomy(remote.economy),
    ),
    lastActive: new Date().toISOString(),
  };
}

export function emptyUserStats(): StoredUserStats {
  return {
    totalAnswered: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    history: [],
    questionStats: {},
    economy: emptyEconomy(),
    lastActive: new Date().toISOString(),
  };
}
