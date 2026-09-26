"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import {
  Leaderboard,
  NavPills,
  Podium,
  type RankRow,
} from "@/components/leaderboard";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";
import { bestOfficialScore } from "@/lib/store";
import {
  dayKeyFromDate,
  gameForSeasonDay,
  GAMES,
  isBetterScore,
  SEASON_DAYS,
  seasonDayIndex,
} from "@/lib/games";

export default function RankPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { ready, player, groups, attempts, resolveName } = useRonda();
  const code = String(params.code || "").toUpperCase();
  const group = groups.find((g) => g.code === code) ?? null;
  const dayKey = dayKeyFromDate();
  const game = group ? gameForSeasonDay(group.seasonStart, dayKey) : null;
  const dayIndex = group ? seasonDayIndex(group.seasonStart, dayKey) : 0;

  const todayRows = useMemo(() => {
    if (!group || !game || !player) return [] as RankRow[];
    return group.memberIds
      .map((id) => ({
        playerId: id,
        name: resolveName(id),
        score: bestOfficialScore(
          attempts,
          group.id,
          id,
          dayKey,
          game.direction,
        ),
        isYou: id === player.id,
      }))
      .sort((a, b) => {
        if (a.score === null && b.score === null) return 0;
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return isBetterScore(a.score, b.score, game.direction) ? -1 : 1;
      });
  }, [group, game, player, attempts, resolveName, dayKey]);

  const seasonRows = useMemo(() => {
    if (!group || !player) return [] as RankRow[];
    const points = new Map<string, number>();
    for (const memberId of group.memberIds) points.set(memberId, 0);

    for (let d = 0; d <= dayIndex; d++) {
      const date = new Date(`${group.seasonStart}T12:00:00`);
      date.setDate(date.getDate() + d);
      const key = dayKeyFromDate(date);
      const dayGame = GAMES[d % GAMES.length];
      const dayBest = group.memberIds
        .map((id) => ({
          id,
          score: bestOfficialScore(
            attempts,
            group.id,
            id,
            key,
            dayGame.direction,
          ),
        }))
        .filter((x) => x.score !== null)
        .sort((a, b) =>
          isBetterScore(a.score!, b.score!, dayGame.direction) ? -1 : 1,
        );

      dayBest.forEach((entry, index) => {
        const award = Math.max(0, group.memberIds.length - index);
        points.set(entry.id, (points.get(entry.id) ?? 0) + award);
      });
    }

    return group.memberIds
      .map((id) => ({
        playerId: id,
        name: resolveName(id),
        score: points.get(id) ?? 0,
        isYou: id === player.id,
      }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [group, player, attempts, resolveName, dayIndex]);

  if (!ready) {
    return (
      <AppShell>
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          Cargando…
        </p>
      </AppShell>
    );
  }

  if (!player) {
    router.replace("/onboarding");
    return null;
  }

  if (!group || !game) {
    return (
      <AppShell>
        <BrandMark />
        <p className="mt-8 font-semibold text-[color:var(--muted)]">
          Grupo no encontrado.
        </p>
        <Button className="cta-primary mt-6 border-0" onClick={() => router.push("/")}>
          Inicio
        </Button>
      </AppShell>
    );
  }

  const seasonGame = {
    ...game,
    unit: "points" as const,
    direction: "higher" as const,
  };

  return (
    <AppShell>
      <BrandMark />
      <NavPills groupCode={group.code} active="rank" />

      <section className="animate-pop mt-6">
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--ink)] tracking-tight">
            SEASON 1
          </p>
          <p className="mt-2 text-sm font-bold text-[color:var(--muted)]">
            Día {dayIndex + 1} / {SEASON_DAYS}
          </p>
          <p className="bubble-title mt-4 text-5xl">SKILLS</p>
        </div>

        <div className="animate-pop-delay mt-6">
          <Podium rows={seasonRows} game={seasonGame} />
        </div>
      </section>

      <section className="animate-pop-delay-2 mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--ink)]">
            Hoy · {game.name}
          </h2>
          <span className="text-xs font-bold text-[color:var(--muted)]">
            {todayRows.filter((r) => r.score != null).length} jugaron
          </span>
        </div>
        <Leaderboard rows={todayRows} game={game} dark />
      </section>

      <section className="animate-pop-delay-2 mt-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--ink)]">
            Clasificación
          </h2>
          <span className="text-xs font-bold text-[color:var(--muted)]">
            {seasonRows.filter((r) => (r.score ?? 0) > 0).length} con puntos
          </span>
        </div>
        <Leaderboard rows={seasonRows} game={seasonGame} dark />
      </section>
    </AppShell>
  );
}
