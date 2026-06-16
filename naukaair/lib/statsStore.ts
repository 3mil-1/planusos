import { neon } from "@neondatabase/serverless";
import {
  GlobalStatsFile,
  readGlobalStats,
  StoredUserStats,
  writeGlobalStats,
} from "@/lib/globalStats";

function usePostgres(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

async function ensureTable(): Promise<void> {
  if (!usePostgres()) return;
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    CREATE TABLE IF NOT EXISTS naukaair_user_stats (
      username TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getUserStats(username: string): Promise<StoredUserStats | null> {
  if (usePostgres()) {
    await ensureTable();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`
      SELECT data FROM naukaair_user_stats WHERE username = ${username} LIMIT 1
    `;
    if (!rows.length) return null;
    return rows[0].data as StoredUserStats;
  }

  const file = await readGlobalStats();
  return file.users[username] ?? null;
}

export async function saveUserStats(
  username: string,
  stats: StoredUserStats,
): Promise<void> {
  const payload: StoredUserStats = {
    ...stats,
    lastActive: new Date().toISOString(),
  };

  if (usePostgres()) {
    await ensureTable();
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      INSERT INTO naukaair_user_stats (username, data, updated_at)
      VALUES (${username}, ${JSON.stringify(payload)}::jsonb, NOW())
      ON CONFLICT (username) DO UPDATE SET
        data = EXCLUDED.data,
        updated_at = NOW()
    `;
    return;
  }

  const file = await readGlobalStats();
  file.users[username] = payload;
  await writeGlobalStats(file);
}

export async function getAllUserSummaries(): Promise<GlobalStatsFile["users"]> {
  if (usePostgres()) {
    await ensureTable();
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT username, data FROM naukaair_user_stats`;
    const users: GlobalStatsFile["users"] = {};
    for (const row of rows) {
      users[row.username as string] = row.data as StoredUserStats;
    }
    return users;
  }

  const file = await readGlobalStats();
  return file.users;
}

export function isPersistentStorage(): boolean {
  return usePostgres();
}
