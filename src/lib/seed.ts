/** Deterministic string hash → 32-bit seed for fair shared rounds. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return function next() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function buildAttemptSeed(parts: {
  dayKey: string;
  groupId: string;
  gameId: string;
  attemptIndex: number;
}) {
  return hashSeed(
    `${parts.dayKey}|${parts.groupId}|${parts.gameId}|${parts.attemptIndex}`,
  );
}
