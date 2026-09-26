export type AttemptKind = "practice" | "official";

export type ScoreDirection = "higher" | "lower";

export type GameDefinition = {
  id: string;
  name: string;
  blurb: string;
  path: string;
  direction: ScoreDirection;
  unit: "points" | "seconds" | "level";
  tip: string;
};

export type Player = {
  id: string;
  name: string;
  createdAt: string;
};

export type Group = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  seasonStart: string;
  memberIds: string[];
};

export type Attempt = {
  id: string;
  groupId: string;
  playerId: string;
  dayKey: string;
  gameId: string;
  kind: AttemptKind;
  score: number;
  createdAt: string;
};

export type AppState = {
  player: Player | null;
  groups: Group[];
  activeGroupId: string | null;
  attempts: Attempt[];
};
