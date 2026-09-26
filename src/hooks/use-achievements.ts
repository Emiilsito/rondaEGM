"use client";

import { useMemo } from "react";
import { ACHIEVEMENTS, checkAchievements } from "@/lib/achievements";
import type { Attempt } from "@/lib/types";

export function useAchievements(
  attempts: Attempt[],
  playerId: string | undefined,
  groupId: string | undefined,
) {
  const unlockedIds = useMemo(() => {
    if (!playerId || !groupId) return new Set<string>();
    const unlocked = checkAchievements(attempts, playerId, groupId);
    return new Set(unlocked.map((a) => a.id));
  }, [attempts, playerId, groupId]);

  const unlockedCount = unlockedIds.size;
  const totalCount = ACHIEVEMENTS.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return {
    unlockedIds,
    unlockedCount,
    totalCount,
    progress,
    achievements: ACHIEVEMENTS,
  };
}
