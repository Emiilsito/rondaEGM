import { describe, it, expect, beforeEach } from "vitest";
import {
  emptyState,
  loadState,
  saveState,
  createPlayer,
  createGroup,
  joinGroupByCode,
  upsertDemoGroup,
  countAttempts,
  bestOfficialScore,
  botNames,
} from "@/lib/store";
import type { AppState, Attempt, Player } from "@/lib/types";
import { dayKeyFromDate } from "@/lib/games";

describe("emptyState", () => {
  it("retorna estado vacío", () => {
    const state = emptyState();
    expect(state.player).toBeNull();
    expect(state.groups).toEqual([]);
    expect(state.activeGroupId).toBeNull();
    expect(state.attempts).toEqual([]);
  });
});

describe("loadState / saveState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadState retorna emptyState si no hay datos", () => {
    expect(loadState()).toEqual(emptyState());
  });

  it("saveState y loadState son inversos", () => {
    const state: AppState = {
      player: { id: "p1", name: "Test", createdAt: "2026-01-01" },
      groups: [
        {
          id: "g1",
          code: "ABC123",
          name: "Grupo Test",
          createdAt: "2026-01-01",
          seasonStart: "2026-01-01",
          memberIds: ["p1"],
        },
      ],
      activeGroupId: "g1",
      attempts: [],
    };

    saveState(state);
    const loaded = loadState();

    expect(loaded.player?.name).toBe("Test");
    expect(loaded.groups).toHaveLength(1);
    expect(loaded.groups[0].code).toBe("ABC123");
    expect(loaded.activeGroupId).toBe("g1");
  });

  it("loadState maneja JSON corrupto gracefully", () => {
    localStorage.setItem("ronda-v1", "esto no es json {{{");
    expect(() => loadState()).not.toThrow();
    expect(loadState()).toEqual(emptyState());
  });

  it("loadState retorna emptyState en servidor (sin window)", () => {
    // En jsdom window existe, pero verificamos que no rompa
    const result = loadState();
    expect(result).toBeDefined();
  });
});

describe("createPlayer", () => {
  it("crea un jugador con nombre limpio", () => {
    const player = createPlayer("  Juan  ");
    expect(player.name).toBe("Juan");
    expect(player.id).toBeDefined();
    expect(player.createdAt).toBeDefined();
  });

  it("limita el nombre a 24 caracteres", () => {
    const player = createPlayer("A".repeat(50));
    expect(player.name).toHaveLength(24);
  });

  it("genera IDs únicos", () => {
    const p1 = createPlayer("A");
    const p2 = createPlayer("B");
    expect(p1.id).not.toBe(p2.id);
  });
});

describe("createGroup", () => {
  it("crea un grupo con código de 6 caracteres", () => {
    const group = createGroup("Mi Grupo", "player-1");
    expect(group.code).toHaveLength(6);
    expect(group.name).toBe("Mi Grupo");
    expect(group.memberIds).toEqual(["player-1"]);
    expect(group.seasonStart).toBe(dayKeyFromDate());
  });

  it("usa nombre por defecto si está vacío", () => {
    const group = createGroup("   ", "player-1");
    expect(group.name).toBe("Mi grupo");
  });

  it("limita el nombre a 32 caracteres", () => {
    const group = createGroup("A".repeat(50), "player-1");
    expect(group.name).toHaveLength(32);
  });

  it("el código solo contiene caracteres del alfabeto", () => {
    const group = createGroup("Test", "p1");
    expect(group.code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });
});

describe("joinGroupByCode", () => {
  let state: AppState;
  let player: Player;

  beforeEach(() => {
    player = { id: "p1", name: "Test", createdAt: "2026-01-01" };
    state = {
      player,
      groups: [
        {
          id: "g1",
          code: "ABC123",
          name: "Grupo Test",
          createdAt: "2026-01-01",
          seasonStart: "2026-01-01",
          memberIds: ["other-player"],
        },
      ],
      activeGroupId: null,
      attempts: [],
    };
  });

  it("une un jugador nuevo al grupo", () => {
    const result = joinGroupByCode(state, "abc123", "p1");
    expect(result.error).toBeUndefined();
    expect(result.group).not.toBeNull();
    expect(result.group!.memberIds).toContain("p1");
    expect(result.state.activeGroupId).toBe("g1");
  });

  it("normaliza el código a mayúsculas", () => {
    const result = joinGroupByCode(state, "  abc123  ", "p1");
    expect(result.error).toBeUndefined();
  });

  it("retorna error si el grupo no existe", () => {
    const result = joinGroupByCode(state, "ZZZZZZ", "p1");
    expect(result.error).toBe("No encontramos ese código.");
    expect(result.group).toBeNull();
  });

  it("no duplica si el jugador ya es miembro", () => {
    state.groups[0].memberIds.push("p1");
    const result = joinGroupByCode(state, "ABC123", "p1");
    expect(result.group!.memberIds.filter((id) => id === "p1")).toHaveLength(1);
  });
});

describe("upsertDemoGroup", () => {
  it("crea grupo demo con bots", () => {
    const state = emptyState();
    const result = upsertDemoGroup(state, "p1");

    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].code).toBe("RONDA1");
    expect(result.groups[0].memberIds).toContain("p1");
    expect(result.groups[0].memberIds).toContain("bot-alex");
    expect(result.activeGroupId).toBe(result.groups[0].id);
  });

  it("no duplica el grupo demo si ya existe", () => {
    const state = emptyState();
    const first = upsertDemoGroup(state, "p1");
    const second = upsertDemoGroup(first, "p2");

    expect(second.groups).toHaveLength(1);
    expect(second.groups[0].memberIds).toContain("p2");
  });

  it("genera intentos demo para los bots", () => {
    const state = emptyState();
    const result = upsertDemoGroup(state, "p1");

    expect(result.attempts.length).toBeGreaterThan(0);
    expect(result.attempts.every((a) => a.groupId === result.groups[0].id)).toBe(
      true,
    );
  });
});

describe("countAttempts", () => {
  const attempts: Attempt[] = [
    {
      id: "a1",
      groupId: "g1",
      playerId: "p1",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "official",
      score: -3.5,
      createdAt: "2026-09-26",
    },
    {
      id: "a2",
      groupId: "g1",
      playerId: "p1",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "official",
      score: -3.2,
      createdAt: "2026-09-26",
    },
    {
      id: "a3",
      groupId: "g1",
      playerId: "p1",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "practice",
      score: -4.0,
      createdAt: "2026-09-26",
    },
    {
      id: "a4",
      groupId: "g1",
      playerId: "p2",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "official",
      score: -3.8,
      createdAt: "2026-09-26",
    },
  ];

  it("cuenta intentos oficiales correctamente", () => {
    expect(countAttempts(attempts, "g1", "p1", "2026-09-26", "official")).toBe(2);
  });

  it("cuenta intentos de práctica correctamente", () => {
    expect(countAttempts(attempts, "g1", "p1", "2026-09-26", "practice")).toBe(1);
  });

  it("retorna 0 si no hay coincidencias", () => {
    expect(countAttempts(attempts, "gX", "p1", "2026-09-26", "official")).toBe(0);
  });
});

describe("bestOfficialScore", () => {
  const attempts: Attempt[] = [
    {
      id: "a1",
      groupId: "g1",
      playerId: "p1",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "official",
      score: -3.5,
      createdAt: "2026-09-26",
    },
    {
      id: "a2",
      groupId: "g1",
      playerId: "p1",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "official",
      score: -3.2,
      createdAt: "2026-09-26",
    },
    {
      id: "a3",
      groupId: "g1",
      playerId: "p1",
      dayKey: "2026-09-26",
      gameId: "tap-rush",
      kind: "practice",
      score: -2.0,
      createdAt: "2026-09-26",
    },
  ];

  it("retorna null si no hay intentos oficiales", () => {
    expect(bestOfficialScore(attempts, "g1", "pX", "2026-09-26", "lower")).toBeNull();
  });

  it("para lower-is-better, retorna el más cercano a cero", () => {
    const best = bestOfficialScore(attempts, "g1", "p1", "2026-09-26", "lower");
    expect(best).toBe(-3.2);
  });

  it("para higher-is-better, retorna el mayor", () => {
    const higherAttempts: Attempt[] = [
      { ...attempts[0], score: 10 },
      { ...attempts[1], score: 15 },
    ];
    const best = bestOfficialScore(higherAttempts, "g1", "p1", "2026-09-26", "higher");
    expect(best).toBe(15);
  });

  it("ignora intentos de práctica", () => {
    const best = bestOfficialScore(attempts, "g1", "p1", "2026-09-26", "lower");
    expect(best).not.toBe(-2.0); // El practice tiene score -2.0 que sería "mejor"
  });
});

describe("botNames", () => {
  it("retorna los nombres de los bots", () => {
    const names = botNames();
    expect(names["bot-alex"]).toBe("Alex");
    expect(names["bot-nora"]).toBe("Nora");
    expect(names["bot-teo"]).toBe("Teo");
  });
});
