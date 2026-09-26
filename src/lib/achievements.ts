import type { Attempt } from "@/lib/types";

export type AchievementId =
  | "first_attempt"
  | "first_win"
  | "streak_3"
  | "streak_5"
  | "score_100"
  | "score_500"
  | "games_10"
  | "games_50"
  | "perfect_day"
  | "comeback"
  | "social_butterfly"
  | "night_owl";

export type Achievement = {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  condition: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_attempt",
    name: "Primera vez",
    description: "Completa tu primer intento oficial",
    icon: "🎯",
    condition: "1 intento oficial",
  },
  {
    id: "first_win",
    name: "Victoria",
    description: "Gana un día de la temporada",
    icon: "🏆",
    condition: "1 día ganado",
  },
  {
    id: "streak_3",
    name: "Racha x3",
    description: "Gana 3 días seguidos",
    icon: "🔥",
    condition: "3 victorias seguidas",
  },
  {
    id: "streak_5",
    name: "Imparable",
    description: "Gana 5 días seguidos",
    icon: "⚡",
    condition: "5 victorias seguidas",
  },
  {
    id: "score_100",
    name: "Centenar",
    description: "Consigue 100+ puntos en un día",
    icon: "💯",
    condition: "100+ puntos",
  },
  {
    id: "score_500",
    name: "Medio millar",
    description: "Consigue 500+ puntos en un día",
    icon: "🚀",
    condition: "500+ puntos",
  },
  {
    id: "games_10",
    name: "Veterano",
    description: "Juega 10 partidas oficiales",
    icon: "🎮",
    condition: "10 partidas",
  },
  {
    id: "games_50",
    name: "Adicto",
    description: "Juega 50 partidas oficiales",
    icon: "🕹️",
    condition: "50 partidas",
  },
  {
    id: "perfect_day",
    name: "Día perfecto",
    description: "Usa todos tus intentos oficiales",
    icon: "✨",
    condition: "Todos los intentos",
  },
  {
    id: "comeback",
    name: "Remontada",
    description: "Gana después de ir perdiendo",
    icon: "🔄",
    condition: "Remontada épica",
  },
  {
    id: "social_butterfly",
    name: "Mariposa social",
    description: "Únete a 3 grupos diferentes",
    icon: "🦋",
    condition: "3 grupos",
  },
  {
    id: "night_owl",
    name: "Búho nocturno",
    description: "Juega después de las 12 de la noche",
    icon: "🦉",
    condition: "Jugar de noche",
  },
];

export function checkAchievements(
  attempts: Attempt[],
  playerId: string,
  groupId: string,
): Achievement[] {
  const unlocked: Achievement[] = [];
  const playerAttempts = attempts.filter(
    (a) => a.playerId === playerId && a.groupId === groupId && a.kind === "official",
  );

  // First attempt
  if (playerAttempts.length >= 1) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "first_attempt")!);
  }

  // Games count
  if (playerAttempts.length >= 10) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "games_10")!);
  }
  if (playerAttempts.length >= 50) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "games_50")!);
  }

  // Score achievements
  const highScore = playerAttempts.reduce((max, a) => Math.max(max, a.score), 0);
  if (highScore >= 100) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "score_100")!);
  }
  if (highScore >= 500) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "score_500")!);
  }

  // Night owl
  const playedAtNight = playerAttempts.some((a) => {
    const hour = new Date(a.createdAt).getHours();
    return hour >= 0 && hour < 5;
  });
  if (playedAtNight) {
    unlocked.push(ACHIEVEMENTS.find((a) => a.id === "night_owl")!);
  }

  return unlocked;
}

export function getAchievementProgress(
  achievementId: AchievementId,
  attempts: Attempt[],
  playerId: string,
  groupId: string,
): { current: number; target: number } {
  const playerAttempts = attempts.filter(
    (a) => a.playerId === playerId && a.groupId === groupId && a.kind === "official",
  );

  switch (achievementId) {
    case "first_attempt":
      return { current: Math.min(playerAttempts.length, 1), target: 1 };
    case "games_10":
      return { current: Math.min(playerAttempts.length, 10), target: 10 };
    case "games_50":
      return { current: Math.min(playerAttempts.length, 50), target: 50 };
    case "score_100":
      return {
        current: Math.min(
          playerAttempts.reduce((max, a) => Math.max(max, a.score), 0),
          100,
        ),
        target: 100,
      };
    case "score_500":
      return {
        current: Math.min(
          playerAttempts.reduce((max, a) => Math.max(max, a.score), 0),
          500,
        ),
        target: 500,
      };
    default:
      return { current: 0, target: 1 };
  }
}
