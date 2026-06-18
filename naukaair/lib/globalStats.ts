import { promises as fs } from "fs";
import path from "path";

import type { UserEconomy } from "./economy";

export interface StoredUserStats {
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  history: Array<{
    date: string;
    score: number;
    totalQuestions: number;
    type: "nauka" | "egzamin";
  }>;
  questionStats: Record<string, { attempts: number; correct: number }>;
  lastActive: string;
  economy?: UserEconomy;
}

export interface GlobalStatsFile {
  users: Record<string, StoredUserStats>;
}

const STATS_PATH = path.join(process.cwd(), "data", "global-stats.json");

export async function readGlobalStats(): Promise<GlobalStatsFile> {
  try {
    const raw = await fs.readFile(STATS_PATH, "utf-8");
    return JSON.parse(raw) as GlobalStatsFile;
  } catch {
    return { users: {} };
  }
}

export async function writeGlobalStats(data: GlobalStatsFile): Promise<void> {
  await fs.mkdir(path.dirname(STATS_PATH), { recursive: true });
  await fs.writeFile(STATS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{2,32}$/.test(username);
}
