"use client";

import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements";

export function AchievementBadge({
  achievement,
  unlocked,
  size = "md",
}: {
  achievement: Achievement;
  unlocked: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "size-10 text-lg",
    md: "size-14 text-2xl",
    lg: "size-20 text-4xl",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition-all",
        unlocked
          ? "bg-[color:var(--surface)] shadow-[var(--soft-shadow)]"
          : "bg-[color:var(--surface-muted)] opacity-50 grayscale",
      )}
    >
      <div
        className={cn(
          "grid place-items-center rounded-full",
          sizes[size],
          unlocked
            ? "bg-gradient-to-br from-[#ffd6ea] to-[#c9b8ff] shadow-lg"
            : "bg-gray-300",
        )}
      >
        {achievement.icon}
      </div>
      <p className="text-xs font-extrabold text-[#1a1a1f]">{achievement.name}</p>
      <p className="text-[10px] font-semibold text-[#6b6b76] leading-tight">
        {achievement.condition}
      </p>
      {unlocked && (
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[#2ec4a0] text-xs text-white shadow">
          ✓
        </span>
      )}
    </div>
  );
}

export function AchievementGrid({
  achievements,
  unlockedIds,
}: {
  achievements: Achievement[];
  unlockedIds: Set<string>;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {achievements.map((a) => (
        <AchievementBadge
          key={a.id}
          achievement={a}
          unlocked={unlockedIds.has(a.id)}
          size="md"
        />
      ))}
    </div>
  );
}
