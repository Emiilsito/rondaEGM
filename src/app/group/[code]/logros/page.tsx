"use client";

import { useParams } from "next/navigation";
import { AppShell, BrandMark } from "@/components/app-shell";
import { AchievementGrid } from "@/components/achievement-badge";
import { NavPills } from "@/components/leaderboard";
import { useRonda } from "@/components/ronda-provider";
import { useAchievements } from "@/hooks/use-achievements";

export default function LogrosPage() {
  const params = useParams<{ code: string }>();
  const { player, groups, attempts } = useRonda();
  const code = String(params.code || "").toUpperCase();
  const group = groups.find((g) => g.code === code);

  const { unlockedIds, unlockedCount, totalCount, progress } = useAchievements(
    attempts,
    player?.id,
    group?.id,
  );

  return (
    <AppShell>
      <BrandMark />
      <NavPills groupCode={group?.code || code} active="home" />

      <section className="mt-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--ink)]">
            Logros
          </p>
          <p className="mt-1 text-sm font-bold text-[color:var(--muted)]">
            {unlockedCount} de {totalCount} desbloqueados
          </p>
          <div className="mx-auto mt-3 h-2 max-w-[200px] overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[color:var(--brand)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-6">
          <AchievementGrid achievements={ACHIEVEMENTS} unlockedIds={unlockedIds} />
        </div>
      </section>
    </AppShell>
  );
}

import { ACHIEVEMENTS } from "@/lib/achievements";
