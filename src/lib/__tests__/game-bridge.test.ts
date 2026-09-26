import { describe, it, expect } from "vitest";
import { isGameToHostMessage } from "@/lib/game-bridge";

describe("isGameToHostMessage", () => {
  it("retorna true para mensajes válidos", () => {
    expect(
      isGameToHostMessage({ type: "ready", gameId: "tap-rush", version: "1.0" }),
    ).toBe(true);
    expect(isGameToHostMessage({ type: "started", gameId: "tap-rush" })).toBe(
      true,
    );
    expect(
      isGameToHostMessage({ type: "score", gameId: "tap-rush", score: 10 }),
    ).toBe(true);
    expect(
      isGameToHostMessage({ type: "finished", gameId: "tap-rush", score: 15 }),
    ).toBe(true);
    expect(
      isGameToHostMessage({ type: "error", gameId: "tap-rush", message: "err" }),
    ).toBe(true);
  });

  it("retorna false para tipos inválidos", () => {
    expect(isGameToHostMessage({ type: "invalid", gameId: "tap-rush" })).toBe(
      false,
    );
    expect(isGameToHostMessage({ type: "hostReady", gameId: "tap-rush" })).toBe(
      false,
    );
  });

  it("retorna false si falta gameId", () => {
    expect(isGameToHostMessage({ type: "ready" })).toBe(false);
    expect(isGameToHostMessage({ type: "ready", gameId: 123 })).toBe(false);
  });

  it("retorna false para valores nulos o no-objetos", () => {
    expect(isGameToHostMessage(null)).toBe(false);
    expect(isGameToHostMessage(undefined)).toBe(false);
    expect(isGameToHostMessage("string")).toBe(false);
    expect(isGameToHostMessage(42)).toBe(false);
    expect(isGameToHostMessage([])).toBe(false);
  });

  it("retorna false si type no es string", () => {
    expect(isGameToHostMessage({ type: 123, gameId: "tap-rush" })).toBe(false);
  });
});
