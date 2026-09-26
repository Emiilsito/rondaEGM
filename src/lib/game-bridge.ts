export type HostToGameMessage =
  | { type: "hostReady"; seed: number; lang: string; muted: boolean }
  | { type: "mute"; muted: boolean };

export type GameToHostMessage =
  | { type: "ready"; gameId: string; version: string }
  | { type: "started"; gameId: string }
  | { type: "score"; gameId: string; score: number }
  | { type: "finished"; gameId: string; score: number }
  | { type: "error"; gameId: string; message: string };

export function isGameToHostMessage(data: unknown): data is GameToHostMessage {
  if (!data || typeof data !== "object") return false;
  const msg = data as { type?: string; gameId?: string };
  return (
    typeof msg.type === "string" &&
    typeof msg.gameId === "string" &&
    ["ready", "started", "score", "finished", "error"].includes(msg.type)
  );
}
