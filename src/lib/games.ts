import type { GameDefinition } from "@/lib/types";

export const SEASON_DAYS = 21;
export const OFFICIAL_ATTEMPTS = 2;
export const PRACTICE_ATTEMPTS = 1;
export const MAX_GROUP_SIZE = 15;

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
  {
    id: "reaction-test",
    name: "Reaction Test",
    blurb: "Reacciona cuando aparezca el color verde.",
    path: "/games/reaction-test/index.html",
    direction: "lower",
    unit: "seconds",
    tip: "Concéntrate en el centro: reaccionar más rápido de 300ms es casi imposible.",
  },
  {
    id: "color-match",
    name: "Color Match",
    blurb: "Encuentra el color diferente entre todos.",
    path: "/games/color-match/index.html",
    direction: "higher",
    unit: "points",
    tip: "Mira en zigzag: el diferente suele estar en los bordes.",
  },
  {
    id: "swipe-direction",
    name: "Swipe Direction",
    blurb: "Desliza en la dirección correcta.",
    path: "/games/swipe-direction/index.html",
    direction: "higher",
    unit: "points",
    tip: "Lee la dirección antes de deslizar: la velocidad importa más que la precisión.",
  },
  {
    id: "number-tap",
    name: "Number Tap",
    blurb: "Toca los números en orden del 1 al 25.",
    path: "/games/number-tap/index.html",
    direction: "higher",
    unit: "points",
    tip: "Escanea en S: recorre la cuadrícula en patrones predecibles.",
  },
  {
    id: "odd-one-out",
    name: "Odd One Out",
    blurb: "Encuentra el elemento diferente.",
    path: "/games/odd-one-out/index.html",
    direction: "higher",
    unit: "points",
    tip: "Busca patrones: el diferente suele romper la simetría.",
  },
  {
    id: "speed-tap",
    name: "Speed Tap",
    blurb: "Toca lo más rápido que puedas en 10 segundos.",
    path: "/games/speed-tap/index.html",
    direction: "higher",
    unit: "points",
    tip: "Alterna dedos: usar ambos pulgares duplica tu velocidad.",
  },
  {
    id: "find-difference",
    name: "Find Difference",
    blurb: "Encuentra la forma diferente.",
    path: "/games/find-difference/index.html",
    direction: "higher",
    unit: "points",
    tip: "Compara por secciones: divide la cuadrícula en 4 cuadrantes.",
  },
  {
    id: "rotation-match",
    name: "Rotation Match",
    blurb: "Toca cuando la flecha apunte arriba.",
    path: "/games/rotation-match/index.html",
    direction: "higher",
    unit: "points",
    tip: "Anticípa el giro: la velocidad de rotación es constante.",
  },
  {
    id: "catch-game",
    name: "Catch Game",
    blurb: "Atrapa los objetos que caen.",
    path: "/games/catch-game/index.html",
    direction: "higher",
    unit: "points",
    tip: "Mueve la cesta con anticipación: no persigas, predice.",
  },
  {
    id: "aim-game",
    name: "Aim Game",
    blurb: "Apunta a los objetivos que aparecen.",
    path: "/games/aim-game/index.html",
    direction: "higher",
    unit: "points",
    tip: "Prioriza los cercanos: dan más puntos y son más fáciles.",
  },
  {
    id: "color-sequence",
    name: "Color Sequence",
    blurb: "Memoriza la secuencia de colores.",
    path: "/games/color-sequence/index.html",
    direction: "higher",
    unit: "level",
    tip: "Asocia colores a palabras: rojo=parar, verde=avanzar.",
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    blurb: "Descifra las palabras desordenadas.",
    path: "/games/word-scramble/index.html",
    direction: "higher",
    unit: "points",
    tip: "Busca vocales primero: las consonantes son más fáciles de colocar.",
  },
  {
    id: "timing-game",
    name: "Timing Game",
    blurb: "Para el círculo en el momento exacto.",
    path: "/games/timing-game/index.html",
    direction: "higher",
    unit: "points",
    tip: "Cuenta el ritmo: el círculo crece a velocidad constante.",
  },
  {
    id: "memory-card",
    name: "Memory Card",
    blurb: "Encuentra las parejas de cartas.",
    path: "/games/memory-card/index.html",
    direction: "higher",
    unit: "points",
    tip: "Memoriza posiciones: cierra los ojos y repite la ubicación.",
  },
  {
    id: "dodge-game",
    name: "Dodge Game",
    blurb: "Esquiva los obstáculos que caen.",
    path: "/games/dodge-game/index.html",
    direction: "higher",
    unit: "points",
    tip: "Mueve poco: los obstáculos son más rápidos que tú.",
  },
  {
    id: "pattern-trace",
    name: "Pattern Trace",
    blurb: "Repite el patrón de luces.",
    path: "/games/pattern-trace/index.html",
    direction: "higher",
    unit: "level",
    tip: "Divide en grupos de 3: es más fácil recordar secuencias cortas.",
  },
  {
    id: "rhythm-game",
    name: "Rhythm Game",
    blurb: "Toca los círculos cuando lleguen abajo.",
    path: "/games/rhythm-game/index.html",
    direction: "higher",
    unit: "points",
    tip: "Mantén el ritmo: los círculos llegan a intervalos regulares.",
  },
  {
    id: "number-memory",
    name: "Number Memory",
    blurb: "Memoriza el número y repítelo.",
    path: "/games/number-memory/index.html",
    direction: "higher",
    unit: "level",
    tip: "Agrupa en pares: 1234-5678 es más fácil que 12345678.",
  },
  {
    id: "color-mix",
    name: "Color Mix",
    blurb: "Mezcla el color correcto con RGB.",
    path: "/games/color-mix/index.html",
    direction: "higher",
    unit: "points",
    tip: "Empieza por el rojo: es el color más fácil de ajustar.",
  },
  {
    id: "sequence-memory",
    name: "Sequence Memory",
    blurb: "Memoriza y repite la secuencia.",
    path: "/games/sequence-memory/index.html",
    direction: "higher",
    unit: "level",
    tip: "Canta la secuencia: el ritmo ayuda a memorizar.",
  },
  {
    id: "ball-bounce",
    name: "Ball Bounce",
    blurb: "Rebota la pelota con la pala.",
    path: "/games/ball-bounce/index.html",
    direction: "higher",
    unit: "points",
    tip: "Muévete poco: la pelota rebota donde tú estés.",
  },
  {
    id: "hole-rush",
    name: "Hole Rush",
    blurb: "Haz caer la pelota en los agujeros.",
    path: "/games/hole-rush/index.html",
    direction: "higher",
    unit: "points",
    tip: "Prioriza los agujeros grandes: son más fáciles de alcanzar.",
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
    return a - b;
  }
  return b - a;
}

export function isBetterScore(
  candidate: number,
  current: number | null,
  direction: GameDefinition["direction"],
) {
  if (current === null) return true;
  return candidate > current;
}
