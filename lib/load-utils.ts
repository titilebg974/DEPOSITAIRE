import type { LoadEntry, Player } from "./types";

const MS_PER_DAY = 86_400_000;

export function parseEntries(raw: string | null): LoadEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter(isValidEntry);
  } catch {
    return [];
  }
}

function isValidEntry(x: unknown): x is LoadEntry {
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.playerId === "string" &&
    typeof e.date === "string" &&
    typeof e.rpe === "number" &&
    typeof e.minutes === "number" &&
    typeof e.sessionLabel === "string"
  );
}

export function lastEntryForPlayer(
  entries: LoadEntry[],
  playerId: string,
): LoadEntry | undefined {
  const playerEntries = entries.filter((e) => e.playerId === playerId);
  if (playerEntries.length === 0) return undefined;
  return playerEntries.reduce((a, b) => (a.date >= b.date ? a : b));
}

export function averageRpeLastDays(
  entries: LoadEntry[],
  playerId: string,
  days: number,
): number | null {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setTime(cutoff.getTime() - (days - 1) * MS_PER_DAY);
  const isoCutoff = cutoff.toISOString().slice(0, 10);
  const subset = entries.filter(
    (e) => e.playerId === playerId && e.date >= isoCutoff,
  );
  if (subset.length === 0) return null;
  const sum = subset.reduce((acc, e) => acc + e.rpe, 0);
  return Math.round((sum / subset.length) * 10) / 10;
}

export function loadZone(rpe: number): "basse" | "modérée" | "élevée" {
  if (rpe <= 4) return "basse";
  if (rpe <= 7) return "modérée";
  return "élevée";
}

export function playerById(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id);
}
