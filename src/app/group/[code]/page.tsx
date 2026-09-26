"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AppShell, AvatarStack, BrandMark } from "@/components/app-shell";
import { Leaderboard, NavPills } from "@/components/leaderboard";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";
import { bestOfficialScore, countAttempts } from "@/lib/store";
import {
  dayKeyFromDate,
  displayScore,
  gameForSeasonDay,
  isBetterScore,
  OFFICIAL_ATTEMPTS,
  PRACTICE_ATTEMPTS,
  SEASON_DAYS,
  seasonDayIndex,
} from "@/lib/games";

export default function GroupHomePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const {
    ready,
    player,
    groups,
    attempts,
    resolveName,
    setActiveGroup,
    ensureDemoGroup,
  } = useRonda();

  const code = String(params.code || "").toUpperCase();
  const group = groups.find((g) => g.code === code) ?? null;
  const dayKey = dayKeyFromDate();
  const game = group ? gameForSeasonDay(group.seasonStart, dayKey) : null;
  const dayIndex = group ? seasonDayIndex(group.seasonStart, dayKey) : 0;

  useEffect(() => {
    if (group) setActiveGroup(group.id);
  }, [group, setActiveGroup]);

  const practiceUsed =
    player && group
      ? countAttempts(attempts, group.id, player.id, dayKey, "practice")
      : 0;
  const officialUsed =
    player && group
      ? countAttempts(attempts, group.id, player.id, dayKey, "official")
      : 0;

  const rows = useMemo(() => {
    if (!group || !game || !player) return [];
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

  if (!group) {
    return (
      <AppShell>
        <BrandMark />
        <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-bold">
          {code === "RONDA1" ? "Crew demo" : "Grupo no encontrado"}
        </h1>
        <p className="mt-2 font-semibold text-[color:var(--muted)]">
          {code === "RONDA1"
            ? "Activa el grupo de prueba con rivales ficticios."
            : "Este código no está en este dispositivo."}
        </p>
        <Button
          className="cta-primary mt-8 h-14 border-0"
          onClick={() => {
            if (code === "RONDA1") {
              ensureDemoGroup();
              router.push("/group/RONDA1");
            } else router.push("/");
          }}
        >
          {code === "RONDA1" ? "Activar demo" : "Volver"}
        </Button>
      </AppShell>
    );
  }

  const yourBest =
    player && game
      ? bestOfficialScore(attempts, group.id, player.id, dayKey, game.direction)
      : null;

  const memberNames = group.memberIds.map((id) => resolveName(id));

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3">
        <BrandMark />
        <div className="pill font-[family-name:var(--font-display)] tracking-widest">
          {group.code}
        </div>
      </div>

      <NavPills groupCode={group.code} active="home" />

      <section className="animate-pop mt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[color:var(--muted)]">
              Today
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[color:var(--ink)]">
              {group.name}
            </h1>
          </div>
          <AvatarStack names={memberNames} size={36} />
        </div>

        <div className="hero-panel relative overflow-hidden p-5">
          <div className="absolute right-3 top-3 pill bg-black/80 text-white">
            ⏳ Día {dayIndex + 1}/{SEASON_DAYS}
          </div>

          <div className="mt-6 grid place-items-center">
            <div className="animate-floaty relative h-36 w-full max-w-[220px]">
              <div className="absolute inset-x-6 top-4 h-24 rounded-[28px] bg-[#ffe14a] opacity-90" />
              <div className="absolute left-1/2 top-10 size-14 -translate-x-1/2 rounded-full bg-[#ff5c6a] shadow-lg" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-extrabold text-[#1a1a1f]">
                {game?.name}
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-sm font-bold opacity-90">
            {game?.blurb}
          </p>
        </div>

        <div className="soft-card mt-4 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-black/40">
            Tip del día
          </p>
          <p className="mt-1 text-sm font-bold text-[#1a1a1f]">{game?.tip}</p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-[#f4f1ea] px-3 py-3">
              <p className="text-[11px] font-bold text-black/40">Práctica</p>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1a1a1f]">
                {Math.max(0, PRACTICE_ATTEMPTS - practiceUsed)}/
                {PRACTICE_ATTEMPTS}
              </p>
            </div>
            <div className="rounded-2xl bg-[#f4f1ea] px-3 py-3">
              <p className="text-[11px] font-bold text-black/40">Oficiales</p>
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[#1a1a1f]">
                {Math.max(0, OFFICIAL_ATTEMPTS - officialUsed)}/
                {OFFICIAL_ATTEMPTS}
              </p>
            </div>
          </div>

          {yourBest !== null && game && (
            <p className="mt-3 text-sm font-bold text-black/55">
              Tu mejor hoy:{" "}
              <span className="text-[#1a1a1f]">
                {displayScore(yourBest, game)}
              </span>
            </p>
          )}

          <Link href={`/group/${group.code}/play`} className="cta-primary mt-4">
            ¡Jugar ahora!
          </Link>
        </div>
      </section>

      <section className="animate-pop-delay mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[color:var(--ink)]">
            Best today
          </h2>
          <Link
            href={`/group/${group.code}/rank`}
            className="text-sm font-extrabold text-[color:var(--brand)]"
          >
            Temporada →
          </Link>
        </div>
        {game && <Leaderboard rows={rows.slice(0, 5)} game={game} dark />}
      </section>
    </AppShell>
  );
}
