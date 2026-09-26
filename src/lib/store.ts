import { customAlphabet } from "nanoid";
import type { AppState, Attempt, AttemptKind, Group, Player } from "@/lib/types";
import { dayKeyFromDate, GAMES, isBetterScore } from "@/lib/games";

const STORAGE_KEY = "ronda-v1";
const codeAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export function emptyState(): AppState {
  return {
    player: null,
    groups: [],
    activeGroupId: null,
    attempts: [],
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) } as AppState;
  } catch {
    return emptyState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createPlayer(name: string): Player {
  return {
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 24),
    createdAt: new Date().toISOString(),
  };
}

export function createGroup(name: string, ownerId: string): Group {
  const today = dayKeyFromDate();
  return {
    id: crypto.randomUUID(),
    code: codeAlphabet(),
    name: name.trim().slice(0, 32) || "Mi grupo",
    createdAt: new Date().toISOString(),
    seasonStart: today,
    memberIds: [ownerId],
  };
}

export function joinGroupByCode(
  state: AppState,
  code: string,
  playerId: string,
): { state: AppState; group: Group | null; error?: string } {
  const normalized = code.trim().toUpperCase();
  const group = state.groups.find((g) => g.code === normalized);
  if (!group) {
    return { state, group: null, error: "No encontramos ese código." };
  }
  if (group.memberIds.includes(playerId)) {
    return {
      state: { ...state, activeGroupId: group.id },
      group,
    };
  }
  const updated: Group = {
    ...group,
    memberIds: [...group.memberIds, playerId],
  };
  return {
    state: {
      ...state,
      groups: state.groups.map((g) => (g.id === group.id ? updated : g)),
      activeGroupId: group.id,
    },
    group: updated,
  };
}

export function upsertDemoGroup(state: AppState, playerId: string): AppState {
  const existing = state.groups.find((g) => g.code === "RONDA1");
  if (existing) {
    if (!existing.memberIds.includes(playerId)) {
      const updated = {
        ...existing,
        memberIds: [...existing.memberIds, playerId],
      };
      return {
        ...state,
        groups: state.groups.map((g) => (g.id === existing.id ? updated : g)),
        activeGroupId: existing.id,
      };
    }
    return { ...state, activeGroupId: existing.id };
  }

  const bots: Player[] = [
    { id: "bot-alex", name: "Alex", createdAt: new Date().toISOString() },
    { id: "bot-nora", name: "Nora", createdAt: new Date().toISOString() },
    { id: "bot-teo", name: "Teo", createdAt: new Date().toISOString() },
  ];

  const group: Group = {
    id: crypto.randomUUID(),
    code: "RONDA1",
    name: "Crew demo",
    createdAt: new Date().toISOString(),
    seasonStart: dayKeyFromDate(),
    memberIds: [playerId, ...bots.map((b) => b.id)],
  };

  const day = dayKeyFromDate();
  const game = GAMES[0];
  const demoAttempts: Attempt[] = [
    {
      id: crypto.randomUUID(),
      groupId: group.id,
      playerId: "bot-alex",
      dayKey: day,
      gameId: game.id,
      kind: "official",
      score: game.direction === "lower" ? -4.82 : 14,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      groupId: group.id,
      playerId: "bot-nora",
      dayKey: day,
      gameId: game.id,
      kind: "official",
      score: game.direction === "lower" ? -5.41 : 11,
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      groupId: group.id,
      playerId: "bot-teo",
      dayKey: day,
      gameId: game.id,
      kind: "official",
      score: game.direction === "lower" ? -6.05 : 9,
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    ...state,
    groups: [...state.groups, group],
    attempts: [...state.attempts, ...demoAttempts],
    activeGroupId: group.id,
  };
}

export function countAttempts(
  attempts: Attempt[],
  groupId: string,
  playerId: string,
  dayKey: string,
  kind: AttemptKind,
) {
  return attempts.filter(
    (a) =>
      a.groupId === groupId &&
      a.playerId === playerId &&
      a.dayKey === dayKey &&
      a.kind === kind,
  ).length;
}

export function bestOfficialScore(
  attempts: Attempt[],
  groupId: string,
  playerId: string,
  dayKey: string,
  direction: "higher" | "lower",
) {
  const scores = attempts
    .filter(
      (a) =>
        a.groupId === groupId &&
        a.playerId === playerId &&
        a.dayKey === dayKey &&
        a.kind === "official",
    )
    .map((a) => a.score);

  if (scores.length === 0) return null;
  return scores.reduce((best, score) =>
    isBetterScore(score, best, direction) ? score : best,
  );
}

export function botNames(): Record<string, string> {
  return {
    "bot-alex": "Alex",
    "bot-nora": "Nora",
    "bot-teo": "Teo",
  };
}
