import { supabase } from "@/lib/supabase";
import type { Attempt, AttemptKind, Group, Player } from "@/lib/types";
import { dayKeyFromDate, GAMES, isBetterScore } from "@/lib/games";

// ============ TIPOS DE BASE DE DATOS ============

export type DbPlayer = {
  id: string;
  name: string;
  created_at: string;
};

export type DbGroup = {
  id: string;
  code: string;
  name: string;
  created_by: string;
  created_at: string;
  season_start: string;
};

export type DbGroupMember = {
  group_id: string;
  player_id: string;
  joined_at: string;
};

export type DbAttempt = {
  id: string;
  group_id: string;
  player_id: string;
  day_key: string;
  game_id: string;
  kind: AttemptKind;
  score: number;
  created_at: string;
};

// ============ MIGRACIÓN DE TIPOS ============

function dbPlayerToPlayer(db: DbPlayer): Player {
  return { id: db.id, name: db.name, createdAt: db.created_at };
}

function dbGroupToGroup(db: DbGroup, members: string[]): Group {
  return {
    id: db.id,
    code: db.code,
    name: db.name,
    createdAt: db.created_at,
    seasonStart: db.season_start,
    memberIds: members,
  };
}

function dbAttemptToAttempt(db: DbAttempt): Attempt {
  return {
    id: db.id,
    groupId: db.group_id,
    playerId: db.player_id,
    dayKey: db.day_key,
    gameId: db.game_id,
    kind: db.kind,
    score: db.score,
    createdAt: db.created_at,
  };
}

// ============ FUNCIONES DE ACCESO A DATOS ============

export async function fetchPlayer(playerId: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .single();

  if (error || !data) return null;
  return dbPlayerToPlayer(data);
}

export async function createPlayer(name: string): Promise<Player> {
  const { data, error } = await supabase
    .from("players")
    .insert({ name: name.trim().slice(0, 24) })
    .select()
    .single();

  if (error) throw new Error(`Error creando jugador: ${error.message}`);
  return dbPlayerToPlayer(data);
}

export async function fetchGroupByCode(code: string): Promise<Group | null> {
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (groupError || !group) return null;

  const { data: members } = await supabase
    .from("group_members")
    .select("player_id")
    .eq("group_id", group.id);

  return dbGroupToGroup(group, members?.map((m) => m.player_id) ?? []);
}

export async function fetchGroupById(groupId: string): Promise<Group | null> {
  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (groupError || !group) return null;

  const { data: members } = await supabase
    .from("group_members")
    .select("player_id")
    .eq("group_id", group.id);

  return dbGroupToGroup(group, members?.map((m) => m.player_id) ?? []);
}

export async function createGroup(
  name: string,
  ownerId: string,
): Promise<Group> {
  const code = generateGroupCode();

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .insert({
      code,
      name: name.trim().slice(0, 32) || "Mi grupo",
      created_by: ownerId,
      season_start: dayKeyFromDate(),
    })
    .select()
    .single();

  if (groupError) throw new Error(`Error creando grupo: ${groupError.message}`);

  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ group_id: group.id, player_id: ownerId });

  if (memberError)
    throw new Error(`Error añadiendo miembro: ${memberError.message}`);

  return dbGroupToGroup(group, [ownerId]);
}

export async function joinGroup(
  groupId: string,
  playerId: string,
): Promise<void> {
  const { error } = await supabase
    .from("group_members")
    .insert({ group_id: groupId, player_id: playerId });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (ya es miembro)
    throw new Error(`Error uniendo al grupo: ${error.message}`);
  }
}

export async function fetchGroupMembers(groupId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("group_members")
    .select("player_id")
    .eq("group_id", groupId);

  if (error) throw new Error(`Error obteniendo miembros: ${error.message}`);
  return data?.map((m) => m.player_id) ?? [];
}

export async function fetchAttempts(
  groupId: string,
  dayKey: string,
): Promise<Attempt[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .eq("group_id", groupId)
    .eq("day_key", dayKey);

  if (error) throw new Error(`Error obteniendo intentos: ${error.message}`);
  return (data ?? []).map(dbAttemptToAttempt);
}

export async function fetchAllGroupAttempts(groupId: string): Promise<Attempt[]> {
  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .eq("group_id", groupId);

  if (error) throw new Error(`Error obteniendo intentos: ${error.message}`);
  return (data ?? []).map(dbAttemptToAttempt);
}

export async function insertAttempt(
  attempt: Omit<Attempt, "id" | "createdAt">,
): Promise<Attempt> {
  const { data, error } = await supabase
    .from("attempts")
    .insert({
      group_id: attempt.groupId,
      player_id: attempt.playerId,
      day_key: attempt.dayKey,
      game_id: attempt.gameId,
      kind: attempt.kind,
      score: attempt.score,
    })
    .select()
    .single();

  if (error) throw new Error(`Error guardando intento: ${error.message}`);
  return dbAttemptToAttempt(data);
}

export async function fetchPlayerGroups(playerId: string): Promise<Group[]> {
  const { data: memberships, error: memError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("player_id", playerId);

  if (memError || !memberships?.length) return [];

  const groupIds = memberships.map((m) => m.group_id);

  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("*")
    .in("id", groupIds);

  if (groupsError) throw new Error(`Error obteniendo grupos: ${groupsError.message}`);

  const result: Group[] = [];
  for (const g of groups ?? []) {
    const members = await fetchGroupMembers(g.id);
    result.push(dbGroupToGroup(g, members));
  }

  return result;
}

// ============ FUNCIONES DE RANKING ============

export function countAttempts(
  attempts: Attempt[],
  groupId: string,
  playerId: string,
  dayKey: string,
  kind: AttemptKind,
): number {
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
): number | null {
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

// ============ UTILIDADES ============

function generateGroupCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export { GAMES, dayKeyFromDate };
