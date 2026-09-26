import { describe, it, expect } from "vitest";
import {
  GAMES,
  dayKeyFromDate,
  parseDayKey,
  seasonDayIndex,
  gameForSeasonDay,
  formatScore,
  displayScore,
  compareScores,
  isBetterScore,
  SEASON_DAYS,
  OFFICIAL_ATTEMPTS,
  PRACTICE_ATTEMPTS,
} from "@/lib/games";

describe("GAMES", () => {
  it("tiene 3 juegos definidos", () => {
    expect(GAMES).toHaveLength(3);
  });

  it("cada juego tiene las propiedades requeridas", () => {
    for (const game of GAMES) {
      expect(game).toHaveProperty("id");
      expect(game).toHaveProperty("name");
      expect(game).toHaveProperty("blurb");
      expect(game).toHaveProperty("path");
      expect(game).toHaveProperty("direction");
      expect(game).toHaveProperty("unit");
      expect(game).toHaveProperty("tip");
    }
  });

  it("los IDs son únicos", () => {
    const ids = GAMES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("las direcciones son válidas", () => {
    for (const game of GAMES) {
      expect(["higher", "lower"]).toContain(game.direction);
    }
  });

  it("las unidades son válidas", () => {
    for (const game of GAMES) {
      expect(["points", "seconds", "level"]).toContain(game.unit);
    }
  });
});

describe("constantes de temporada", () => {
  it("SEASON_DAYS es 21", () => {
    expect(SEASON_DAYS).toBe(21);
  });

  it("OFFICIAL_ATTEMPTS es 2", () => {
    expect(OFFICIAL_ATTEMPTS).toBe(2);
  });

  it("PRACTICE_ATTEMPTS es 1", () => {
    expect(PRACTICE_ATTEMPTS).toBe(1);
  });
});

describe("dayKeyFromDate", () => {
  it("genera formato YYYY-MM-DD", () => {
    const date = new Date(2026, 8, 26); // 26 de septiembre de 2026
    expect(dayKeyFromDate(date)).toBe("2026-09-26");
  });

  it("maneja meses de un dígito", () => {
    const date = new Date(2026, 0, 5); // 5 de enero de 2026
    expect(dayKeyFromDate(date)).toBe("2026-01-05");
  });

  it("usa la fecha actual por defecto", () => {
    const result = dayKeyFromDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("parseDayKey", () => {
  it("parsea correctamente una fecha", () => {
    const date = parseDayKey("2026-09-26");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8); // Septiembre es mes 8 (0-indexed)
    expect(date.getDate()).toBe(26);
  });

  it("es la inversa de dayKeyFromDate", () => {
    const original = new Date(2026, 5, 15);
    const key = dayKeyFromDate(original);
    const parsed = parseDayKey(key);
    expect(parsed.getDate()).toBe(original.getDate());
    expect(parsed.getMonth()).toBe(original.getMonth());
    expect(parsed.getFullYear()).toBe(original.getFullYear());
  });
});

describe("seasonDayIndex", () => {
  it("retorna 0 en el primer día", () => {
    expect(seasonDayIndex("2026-09-26", "2026-09-26")).toBe(0);
  });

  it("retorna el índice correcto para días subsiguientes", () => {
    expect(seasonDayIndex("2026-09-26", "2026-09-27")).toBe(1);
    expect(seasonDayIndex("2026-09-26", "2026-09-30")).toBe(4);
  });

  it("clamp a 0 para días antes del inicio", () => {
    expect(seasonDayIndex("2026-09-26", "2026-09-25")).toBe(0);
  });

  it("clamp a SEASON_DAYS - 1 para días muy lejanos", () => {
    expect(seasonDayIndex("2026-09-26", "2026-12-31")).toBe(SEASON_DAYS - 1);
  });
});

describe("gameForSeasonDay", () => {
  it("retorna el primer juego en el día 0", () => {
    const game = gameForSeasonDay("2026-09-26", "2026-09-26");
    expect(game.id).toBe(GAMES[0].id);
  });

  it("rota correctamente entre juegos", () => {
    const game0 = gameForSeasonDay("2026-09-26", "2026-09-26");
    const game1 = gameForSeasonDay("2026-09-26", "2026-09-27");
    const game2 = gameForSeasonDay("2026-09-26", "2026-09-28");
    const game3 = gameForSeasonDay("2026-09-26", "2026-09-29");

    expect(game0.id).toBe(GAMES[0].id);
    expect(game1.id).toBe(GAMES[1].id);
    expect(game2.id).toBe(GAMES[2].id);
    expect(game3.id).toBe(GAMES[0].id); // Vuelve al primero
  });
});

describe("formatScore", () => {
  const secondsGame = GAMES.find((g) => g.unit === "seconds")!;
  const levelGame = GAMES.find((g) => g.unit === "level")!;
  const pointsGame = GAMES.find((g) => g.unit === "points")!;

  it("formatea segundos correctamente", () => {
    expect(formatScore(3.456, secondsGame)).toBe("3.46s");
  });

  it("formatea nivel correctamente", () => {
    expect(formatScore(5.7, levelGame)).toBe("Nivel 6");
  });

  it("formatea puntos correctamente", () => {
    expect(formatScore(42.3, pointsGame)).toBe("42 pts");
  });
});

describe("displayScore", () => {
  const lowerGame = GAMES.find((g) => g.direction === "lower")!;

  it("muestra valor absoluto para juegos lower-is-better", () => {
    expect(displayScore(-3.5, lowerGame)).toBe("3.50s");
  });

  it("muestra valor directo para juegos higher-is-better", () => {
    const pointsGame = GAMES.find((g) => g.direction === "higher" && g.unit === "points")!;
    expect(displayScore(15, pointsGame)).toBe("15 pts");
  });
});

describe("compareScores", () => {
  it("para higher-is-better, ordena descendente", () => {
    expect(compareScores(10, 5, "higher")).toBeLessThan(0);
    expect(compareScores(5, 10, "higher")).toBeGreaterThan(0);
    expect(compareScores(5, 5, "higher")).toBe(0);
  });

  it("para lower-is-better, ordena ascendente (más negativo primero)", () => {
    expect(compareScores(-5, -3, "lower")).toBeLessThan(0);
    expect(compareScores(-3, -5, "lower")).toBeGreaterThan(0);
    expect(compareScores(-3, -3, "lower")).toBe(0);
  });
});

describe("isBetterScore", () => {
  it("retorna true cuando current es null", () => {
    expect(isBetterScore(10, null, "higher")).toBe(true);
    expect(isBetterScore(-5, null, "lower")).toBe(true);
  });

  it("para higher-is-better, mayor es mejor", () => {
    expect(isBetterScore(10, 5, "higher")).toBe(true);
    expect(isBetterScore(5, 10, "higher")).toBe(false);
  });

  it("para lower-is-better (almacenado como negativo), más cercano a cero es mejor", () => {
    expect(isBetterScore(-3.1, -4.2, "lower")).toBe(true);
    expect(isBetterScore(-4.2, -3.1, "lower")).toBe(false);
  });
});
