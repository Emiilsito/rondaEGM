import { describe, it, expect } from "vitest";
import { hashSeed, createSeededRandom, buildAttemptSeed } from "@/lib/seed";

describe("hashSeed", () => {
  it("retorna un número entero no negativo", () => {
    const result = hashSeed("test");
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("es determinista", () => {
    expect(hashSeed("hello")).toBe(hashSeed("hello"));
  });

  it("retorna valores diferentes para inputs diferentes", () => {
    expect(hashSeed("hello")).not.toBe(hashSeed("world"));
  });

  it("maneja strings vacíos", () => {
    const result = hashSeed("");
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("retorna un valor de 32 bits", () => {
    const result = hashSeed("some long string to test 32-bit output");
    expect(result).toBeLessThanOrEqual(0xffffffff);
  });
});

describe("createSeededRandom", () => {
  it("es determinista con la misma seed", () => {
    const rng1 = createSeededRandom(12345);
    const rng2 = createSeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("produce valores entre 0 y 1", () => {
    const rng = createSeededRandom(42);
    for (let i = 0; i < 1000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("diferentes seeds producen diferentes secuencias", () => {
    const rng1 = createSeededRandom(1);
    const rng2 = createSeededRandom(2);

    const seq1 = Array.from({ length: 10 }, () => rng1());
    const seq2 = Array.from({ length: 10 }, () => rng2());

    expect(seq1).not.toEqual(seq2);
  });

  it("maneja seed de 0", () => {
    const rng = createSeededRandom(0);
    const value = rng();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });
});

describe("buildAttemptSeed", () => {
  it("es determinista", () => {
    const parts = {
      dayKey: "2026-09-26",
      groupId: "group-123",
      gameId: "tap-rush",
      attemptIndex: 0,
    };
    expect(buildAttemptSeed(parts)).toBe(buildAttemptSeed(parts));
  });

  it("cambia con diferentes parámetros", () => {
    const base = {
      dayKey: "2026-09-26",
      groupId: "group-123",
      gameId: "tap-rush",
      attemptIndex: 0,
    };

    expect(buildAttemptSeed(base)).not.toBe(
      buildAttemptSeed({ ...base, dayKey: "2026-09-27" }),
    );
    expect(buildAttemptSeed(base)).not.toBe(
      buildAttemptSeed({ ...base, groupId: "group-456" }),
    );
    expect(buildAttemptSeed(base)).not.toBe(
      buildAttemptSeed({ ...base, gameId: "quick-sum" }),
    );
    expect(buildAttemptSeed(base)).not.toBe(
      buildAttemptSeed({ ...base, attemptIndex: 1 }),
    );
  });
});
