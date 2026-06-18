/** Username z quiz store albo localStorage (gdy activeUsername jeszcze nie zsynchronizowany). */

export function readStoredAuthUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("naukaair-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { username?: string | null } };
    return parsed.state?.username ?? null;
  } catch {
    return null;
  }
}

export function resolveUsername(activeUsername: string | null): string | null {
  return activeUsername ?? readStoredAuthUsername();
}
