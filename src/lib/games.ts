import type { GameDefinition } from "@/lib/types";

export const SEASON_DAYS = 21;
export const OFFICIAL_ATTEMPTS = 2;
export const PRACTICE_ATTEMPTS = 1;

export const GAMES: GameDefinition[] = [
  {
    id: "tap-rush",
    name: "Tap Rush",
    blurb: "Toca 12 objetivos lo más rápido posible.",
    path: "/games/tap-rush/index.html",
    direction: "lower",
    unit: "seconds",
    tip: "Apunta al centro: taps fallidos no suman y te hacen perder ritmo.",
  },
  {
    id: "memory-flash",
    name: "Memory Flash",
    blurb: "Memoriza la secuencia y repítela sin fallar.",
    path: "/games/memory-flash/index.html",
    direction: "higher",
    unit: "level",
    tip: "Di la secuencia en voz baja: anclar sonido ayuda a retener.",
  },
  {
    id: "quick-sum",
    name: "Quick Sum",
    blurb: "Resuelve sumas rápidas durante 30 segundos.",
    path: "/games/quick-sum/index.html",
    direction: "higher",
    unit: "points",
    tip: "No te atasques: un fallo duele menos que 4 segundos pensando.",
  },
];

export function dayKeyFromDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDayKey(dayKey: string) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function seasonDayIndex(seasonStart: string, dayKey = dayKeyFromDate()) {
  const start = parseDayKey(seasonStart.slice(0, 10));
  const current = parseDayKey(dayKey);
  const diff = Math.floor(
    (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return Math.max(0, Math.min(SEASON_DAYS - 1, diff));
}

export function gameForSeasonDay(seasonStart: string, dayKey = dayKeyFromDate()) {
  const index = seasonDayIndex(seasonStart, dayKey);
  return GAMES[index % GAMES.length];
}

export function formatScore(score: number, game: GameDefinition) {
  if (game.unit === "seconds") {
    return `${Math.abs(score).toFixed(2)}s`;
  }
  if (game.unit === "level") {
    return `Nivel ${Math.round(score)}`;
  }
  return `${Math.round(score)} pts`;
}

/** Bridge scores: lower-is-better games send negative values. */
export function displayScore(raw: number, game: GameDefinition) {
  const value = game.direction === "lower" ? Math.abs(raw) : raw;
  return formatScore(value, game);
}

export function compareScores(
  a: number,
  b: number,
  direction: GameDefinition["direction"],
) {
  if (direction === "lower") {
    // more negative (or smaller abs if both positive) is better — we store negative
    return a - b; // higher raw (less negative) is worse when negative; wait
  }
  return b - a;
}

/**
 * Returns true if `candidate` is better than `current`.
 * For lower-is-better games, scores are stored as negative seconds.
 */
export function isBetterScore(
  candidate: number,
  current: number | null,
  direction: GameDefinition["direction"],
) {
  if (current === null) return true;
  if (direction === "lower") {
    // both negative: -3.1 is better than -4.2 (closer to zero / higher algebraically)
    // Actually for time: lower time is better. If we store as negative: -3.1 > -4.2
    // so higher algebraic value wins for lower-is-better when stored negative.
    return candidate > current;
  }
  return candidate > current;
}
