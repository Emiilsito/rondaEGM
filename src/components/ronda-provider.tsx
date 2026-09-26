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
import { loadState, saveState } from "@/lib/store";

import {
  createPlayer as dbCreatePlayer,
  createGroup as dbCreateGroup,
  fetchGroupByCode,
  fetchGroupMembers,
  fetchAllGroupAttempts,
  insertAttempt,
  joinGroup as dbJoinGroup,
} from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { dayKeyFromDate, GAMES, isBetterScore } from "@/lib/games";
import { bestOfficialScore } from "@/lib/store";

type RondaContextValue = {
  ready: boolean;
  player: Player | null;
  groups: Group[];
  activeGroup: Group | null;
  attempts: Attempt[];
  setPlayerName: (name: string) => Promise<void>;
  createNewGroup: (name: string) => Promise<Group | null>;
  joinGroup: (code: string) => Promise<{ ok: boolean; error?: string; group?: Group }>;
  setActiveGroup: (groupId: string) => void;
  ensureDemoGroup: () => void;
  recordAttempt: (input: {
    groupId: string;
    gameId: string;
    kind: AttemptKind;
    score: number;
  }) => Promise<Attempt | null>;
  resolveName: (playerId: string) => string;
  syncing: boolean;
  bonusAttempts: Record<string, number>;
};

const RondaContext = createContext<RondaContextValue | null>(null);

const BOT_NAMES: Record<string, string> = {
  "bot-alex": "Alex",
  "bot-nora": "Nora",
  "bot-teo": "Teo",
};

function getInitialState() {
  if (typeof window === "undefined") {
    return {
      player: null as Player | null,
      groups: [] as Group[],
      activeGroupId: null as string | null,
      attempts: [] as Attempt[],
      knownNames: {} as Record<string, string>,
    };
  }
  const state = loadState();
  const names: Record<string, string> = { ...BOT_NAMES };
  if (state.player) names[state.player.id] = state.player.name;
  return {
    player: state.player,
    groups: state.groups,
    activeGroupId: state.activeGroupId,
    attempts: state.attempts,
    knownNames: names,
  };
}

export function RondaProvider({ children }: { children: ReactNode }) {
  const [initialState] = useState(getInitialState);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [player, setPlayer] = useState<Player | null>(initialState.player);
  const [groups, setGroups] = useState<Group[]>(initialState.groups);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    initialState.activeGroupId,
  );
  const [attempts, setAttempts] = useState<Attempt[]>(initialState.attempts);
  const [knownNames, setKnownNames] = useState<Record<string, string>>(
    initialState.knownNames,
  );
  const [bonusAttempts, setBonusAttempts] = useState<Record<string, number>>({});

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    let cancelled = false;

    async function syncFromDb() {
      setSyncing(true);
      try {
        const localState = loadState();
        const localPlayer = localState.player;
        if (!localPlayer) {
          setReady(true);
          return;
        }

        // Verificar que el jugador existe en DB
        const dbPlayer = await fetchPlayer(localPlayer.id);
        if (!dbPlayer) {
          // Migrar jugador local a DB
          await dbCreatePlayer(localPlayer.name);
        }

        // Migrar grupos locales que no existen en DB
        for (const localGroup of localState.groups) {
          const existingGroup = await fetchGroupByCode(localGroup.code);
          if (!existingGroup) {
            // Crear grupo en DB
            const { data: newGroup, error: groupError } = await supabase
              .from("groups")
              .insert({
                code: localGroup.code,
                name: localGroup.name,
                created_by: localPlayer.id,
                season_start: localGroup.seasonStart,
              })
              .select()
              .single();

            if (!groupError && newGroup) {
              // Añadir miembros
              for (const memberId of localGroup.memberIds) {
                await supabase
                  .from("group_members")
                  .insert({ group_id: newGroup.id, player_id: memberId });
              }

              // Migrar intentos del grupo
              const groupAttempts = localState.attempts.filter(
                (a) => a.groupId === localGroup.id,
              );
              for (const attempt of groupAttempts) {
                await supabase.from("attempts").insert({
                  group_id: newGroup.id,
                  player_id: attempt.playerId,
                  day_key: attempt.dayKey,
                  game_id: attempt.gameId,
                  kind: attempt.kind,
                  score: attempt.score,
                });
              }
            }
          }
        }

        // Cargar grupos del jugador desde DB
        const { data: memberships } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("player_id", localPlayer.id);

        if (memberships && memberships.length > 0) {
          const groupIds = memberships.map((m) => m.group_id);
          const { data: dbGroups } = await supabase
            .from("groups")
            .select("*")
            .in("id", groupIds);

          if (dbGroups) {
            const loadedGroups: Group[] = [];
            for (const g of dbGroups) {
              const members = await fetchGroupMembers(g.id);
              loadedGroups.push({
                id: g.id,
                code: g.code,
                name: g.name,
                createdAt: g.created_at,
                seasonStart: g.season_start,
                memberIds: members,
              });
            }
            if (!cancelled) setGroups(loadedGroups);

            // Cargar intentos del grupo activo
            const activeGroup =
              loadedGroups.find((g) => g.id === localPlayer.id) ??
              loadedGroups[0];
            if (activeGroup) {
              const allAttempts = await fetchAllGroupAttempts(activeGroup.id);
              if (!cancelled) {
                setAttempts(allAttempts);
                setActiveGroupId(activeGroup.id);
              }
            }
          }
        }

        if (!cancelled) setPlayer(localPlayer);
      } catch (err) {
        console.error("Error sincronizando con Supabase:", err);
      } finally {
        if (!cancelled) {
          setReady(true);
          setSyncing(false);
        }
      }
    }

    syncFromDb();
    return () => {
      cancelled = true;
    };
  }, []);

  // Guardar en localStorage como caché
  useEffect(() => {
    if (!ready) return;
    saveState({ player, groups, activeGroupId, attempts });
  }, [ready, player, groups, activeGroupId, attempts]);

  // Sincronización en tiempo real con Supabase
  useEffect(() => {
    if (!ready || !activeGroupId) return;

    const attemptsChannel = supabase
      .channel(`attempts:${activeGroupId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "attempts", filter: `group_id=eq.${activeGroupId}` },
        (payload) => {
          const newAttempt = payload.new as {
            id: string;
            group_id: string;
            player_id: string;
            day_key: string;
            game_id: string;
            kind: "practice" | "official";
            score: number;
            created_at: string;
          };
          const attempt: Attempt = {
            id: newAttempt.id,
            groupId: newAttempt.group_id,
            playerId: newAttempt.player_id,
            dayKey: newAttempt.day_key,
            gameId: newAttempt.game_id,
            kind: newAttempt.kind,
            score: newAttempt.score,
            createdAt: newAttempt.created_at,
          };
          setAttempts((prev) => {
            if (prev.some((a) => a.id === attempt.id)) return prev;
            return [...prev, attempt];
          });
        },
      )
      .subscribe();

    const membersChannel = supabase
      .channel(`members:${activeGroupId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_members", filter: `group_id=eq.${activeGroupId}` },
        async () => {
          const members = await fetchGroupMembers(activeGroupId);
          setGroups((prev) =>
            prev.map((g) => (g.id === activeGroupId ? { ...g, memberIds: members } : g)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(attemptsChannel);
      supabase.removeChannel(membersChannel);
    };
  }, [ready, activeGroupId]);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  // Calcular bonus: el que menos puntúó ayer tiene +1 intento oficial hoy
  useEffect(() => {
    if (!ready || !activeGroup || !player) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = dayKeyFromDate(yesterday);
    const yesterdayGame = GAMES[0]; // Usamos el primer juego como referencia

    let lowestScore: number | null = null;
    let lowestPlayerId: string | null = null;

    for (const memberId of activeGroup.memberIds) {
      const score = bestOfficialScore(
        attempts,
        activeGroup.id,
        memberId,
        yesterdayKey,
        yesterdayGame.direction,
      );
      if (score !== null) {
        if (lowestScore === null || !isBetterScore(score, lowestScore, yesterdayGame.direction)) {
          lowestScore = score;
          lowestPlayerId = memberId;
        }
      }
    }

    if (lowestPlayerId) {
      setBonusAttempts({ [lowestPlayerId]: 1 });
    }
  }, [ready, activeGroup, player, attempts]);

  const setPlayerName = useCallback(async (name: string) => {
    const newPlayer = await dbCreatePlayer(name);
    setPlayer(newPlayer);
    setKnownNames((prev) => ({ ...prev, [newPlayer.id]: newPlayer.name }));
  }, []);

  const createNewGroup = useCallback(
    async (name: string) => {
      if (!player) return null;
      const group = await dbCreateGroup(name, player.id);
      setGroups((prev) => [...prev, group]);
      setActiveGroupId(group.id);
      return group;
    },
    [player],
  );

  const joinGroup = useCallback(
    async (code: string) => {
      if (!player) return { ok: false, error: "Crea tu perfil primero." };
      try {
        const normalized = code.trim().toUpperCase();
        const group = await fetchGroupByCode(normalized);
        if (!group) {
          return { ok: false, error: "No encontramos ese código." };
        }

        if (group.memberIds.length >= 15 && !group.memberIds.includes(player.id)) {
          return { ok: false, error: "Este grupo está lleno (máx. 15 personas)." };
        }

        await dbJoinGroup(group.id, player.id);

        if (!group.memberIds.includes(player.id)) {
          group.memberIds.push(player.id);
        }

        setGroups((prev) => {
          const exists = prev.find((g) => g.id === group.id);
          if (exists) {
            return prev.map((g) => (g.id === group.id ? group : g));
          }
          return [...prev, group];
        });
        setActiveGroupId(group.id);

        // Cargar intentos del grupo
        const allAttempts = await fetchAllGroupAttempts(group.id);
        setAttempts(allAttempts);

        return { ok: true, group };
      } catch (err) {
        console.error("Error uniendo al grupo:", err);
        return { ok: false, error: "Error al unirse al grupo." };
      }
    },
    [player],
  );

  const ensureDemoGroup = useCallback(() => {
    // TODO: Implementar demo group con Supabase
  }, []);

  const recordAttempt = useCallback(
    async (input: {
      groupId: string;
      gameId: string;
      kind: AttemptKind;
      score: number;
    }) => {
      if (!player) return null;
      try {
        const attempt = await insertAttempt({
          groupId: input.groupId,
          playerId: player.id,
          dayKey: dayKeyFromDate(),
          gameId: input.gameId,
          kind: input.kind,
          score: input.score,
        });
        setAttempts((prev) => [...prev, attempt]);
        return attempt;
      } catch (err) {
        console.error("Error guardando intento:", err);
        return null;
      }
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
    syncing,
    bonusAttempts,
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

async function fetchPlayer(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (error || !data) return null;
  return { id: data.id, name: data.name, createdAt: data.created_at };
}
