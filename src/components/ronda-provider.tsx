"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Attempt, AttemptKind, Group, Player } from "@/lib/types";
import {
  createGroup,
  createPlayer,
  emptyState,
  joinGroupByCode,
  loadState,
  saveState,
  upsertDemoGroup,
} from "@/lib/store";
import { dayKeyFromDate } from "@/lib/games";

type RondaContextValue = {
  ready: boolean;
  player: Player | null;
  groups: Group[];
  activeGroup: Group | null;
  attempts: Attempt[];
  setPlayerName: (name: string) => void;
  createNewGroup: (name: string) => Group | null;
  joinGroup: (code: string) => { ok: boolean; error?: string; group?: Group };
  setActiveGroup: (groupId: string) => void;
  ensureDemoGroup: () => void;
  recordAttempt: (input: {
    groupId: string;
    gameId: string;
    kind: AttemptKind;
    score: number;
  }) => Attempt | null;
  resolveName: (playerId: string) => string;
};

const RondaContext = createContext<RondaContextValue | null>(null);

export function RondaProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [knownNames, setKnownNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = loadState();
    setPlayer(state.player);
    setGroups(state.groups);
    setActiveGroupId(state.activeGroupId);
    setAttempts(state.attempts);
    const names: Record<string, string> = {
      "bot-alex": "Alex",
      "bot-nora": "Nora",
      "bot-teo": "Teo",
    };
    if (state.player) names[state.player.id] = state.player.name;
    setKnownNames(names);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveState({
      player,
      groups,
      activeGroupId,
      attempts,
    });
  }, [ready, player, groups, activeGroupId, attempts]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const setPlayerName = useCallback((name: string) => {
    const next = createPlayer(name);
    setPlayer(next);
    setKnownNames((prev) => ({ ...prev, [next.id]: next.name }));
  }, []);

  const createNewGroup = useCallback(
    (name: string) => {
      if (!player) return null;
      const group = createGroup(name, player.id);
      setGroups((prev) => [...prev, group]);
      setActiveGroupId(group.id);
      return group;
    },
    [player],
  );

  const joinGroup = useCallback(
    (code: string) => {
      if (!player) return { ok: false, error: "Crea tu perfil primero." };
      const result = joinGroupByCode(
        { player, groups, activeGroupId, attempts },
        code,
        player.id,
      );
      if (!result.group) {
        return { ok: false, error: result.error };
      }
      setGroups(result.state.groups);
      setActiveGroupId(result.state.activeGroupId);
      return { ok: true, group: result.group };
    },
    [player, groups, activeGroupId, attempts],
  );

  const ensureDemoGroup = useCallback(() => {
    if (!player) return;
    const next = upsertDemoGroup(
      { player, groups, activeGroupId, attempts },
      player.id,
    );
    setGroups(next.groups);
    setAttempts(next.attempts);
    setActiveGroupId(next.activeGroupId);
  }, [player, groups, activeGroupId, attempts]);

  const recordAttempt = useCallback(
    (input: {
      groupId: string;
      gameId: string;
      kind: AttemptKind;
      score: number;
    }) => {
      if (!player) return null;
      const attempt: Attempt = {
        id: crypto.randomUUID(),
        groupId: input.groupId,
        playerId: player.id,
        dayKey: dayKeyFromDate(),
        gameId: input.gameId,
        kind: input.kind,
        score: input.score,
        createdAt: new Date().toISOString(),
      };
      setAttempts((prev) => [...prev, attempt]);
      return attempt;
    },
    [player],
  );

  const resolveName = useCallback(
    (playerId: string) => {
      if (player?.id === playerId) return player.name;
      return knownNames[playerId] ?? "Jugador";
    },
    [player, knownNames],
  );

  const value: RondaContextValue = {
    ready,
    player,
    groups,
    activeGroup,
    attempts,
    setPlayerName,
    createNewGroup,
    joinGroup,
    setActiveGroup: setActiveGroupId,
    ensureDemoGroup,
    recordAttempt,
    resolveName,
  };

  return (
    <RondaContext.Provider value={value}>{children}</RondaContext.Provider>
  );
}

export function useRonda() {
  const ctx = useContext(RondaContext);
  if (!ctx) throw new Error("useRonda must be used within RondaProvider");
  return ctx;
}

export function useRondaOptional() {
  return useContext(RondaContext);
}
