"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import { GameHost } from "@/components/game-host";
import { NavPills } from "@/components/leaderboard";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";
import { buildAttemptSeed } from "@/lib/seed";
import { countAttempts } from "@/lib/store";
import {
  dayKeyFromDate,
  displayScore,
  gameForSeasonDay,
  OFFICIAL_ATTEMPTS,
  PRACTICE_ATTEMPTS,
} from "@/lib/games";
import type { AttemptKind } from "@/lib/types";

export default function PlayPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { ready, player, groups, attempts, recordAttempt, bonusAttempts } = useRonda();
  const code = String(params.code || "").toUpperCase();
  const group = groups.find((g) => g.code === code) ?? null;
  const dayKey = dayKeyFromDate();
  const game = group ? gameForSeasonDay(group.seasonStart, dayKey) : null;

  const [kind, setKind] = useState<AttemptKind | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const practiceUsed =
    player && group
      ? countAttempts(attempts, group.id, player.id, dayKey, "practice")
      : 0;
  const officialUsed =
    player && group
      ? countAttempts(attempts, group.id, player.id, dayKey, "official")
      : 0;

  const myBonus = player ? bonusAttempts[player.id] ?? 0 : 0;
  const practiceLeft = Math.max(0, PRACTICE_ATTEMPTS - practiceUsed);
  const officialLeft = Math.max(0, OFFICIAL_ATTEMPTS + myBonus - officialUsed);

  const attemptIndex = useMemo(() => {
    if (!kind) return 0;
    return kind === "practice" ? practiceUsed : officialUsed;
  }, [kind, practiceUsed, officialUsed]);

  const seed = useMemo(() => {
    if (!group || !game || !kind) return 1;
    return buildAttemptSeed({
      dayKey,
      groupId: group.id,
      gameId: game.id,
      attemptIndex,
    });
  }, [group, game, kind, dayKey, attemptIndex]);

  const onFinished = useCallback(
    (score: number) => {
      if (!group || !game || !kind) return;
      setLastScore(score);
      recordAttempt({
        groupId: group.id,
        gameId: game.id,
        kind,
        score,
      });
      setKind(null);
    },
    [group, game, kind, recordAttempt, setLastScore, setKind],
  );

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

  return (
    <AppShell>
      <BrandMark />
      <NavPills groupCode={group.code} active="play" />

      <div className="animate-pop mt-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Challenge del día
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold text-[color:var(--ink)] leading-tight">
          {game.name}
        </h1>
        <p className="mt-2 text-base font-semibold text-[color:var(--muted)]">
          {game.blurb}
        </p>
      </div>

      {!kind && (
        <div className="animate-pop-delay mt-8 space-y-4">
          {myBonus > 0 && (
            <div className="animate-scale-in rounded-2xl bg-[color:var(--accent)] p-3 text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1a1a1f]">
                Bonus de remontada
              </p>
              <p className="text-sm font-bold text-[#1a1a1f]">
                Tienes +1 intento oficial hoy
              </p>
            </div>
          )}

          {lastScore !== null && (
            <div className="soft-card animate-scale-in p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/40">
                Último intento
              </p>
              <p className="bubble-title mt-2 text-5xl">
                {displayScore(lastScore, game)}
              </p>
            </div>
          )}

          <Button
            disabled={practiceLeft <= 0}
            className="cta-brand h-14 border-0 disabled:opacity-40"
            onClick={() => {
              setLastScore(null);
              setSessionKey((k) => k + 1);
              setKind("practice");
            }}
          >
            Práctica · {practiceLeft} restante{practiceLeft !== 1 ? "s" : ""}
          </Button>
          <Button
            disabled={officialLeft <= 0}
            className="cta-primary h-14 border-0 disabled:opacity-40"
            onClick={() => {
              setLastScore(null);
              setSessionKey((k) => k + 1);
              setKind("official");
            }}
          >
            Intento oficial · {officialLeft} restante{officialLeft !== 1 ? "s" : ""}
          </Button>

          {officialLeft <= 0 && (
            <p className="text-center text-sm font-bold text-[color:var(--muted)]">
              Sin oficiales.{" "}
              <Link
                href={`/group/${group.code}/rank`}
                className="underline underline-offset-4"
              >
                Ver ranking
              </Link>
            </p>
          )}
        </div>
      )}

      {kind && (
        <div className="animate-pop mt-6">
          <p className="mb-4 text-center text-xs font-extrabold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            {kind === "practice" ? "Práctica · no suma" : "Oficial · cuenta"}
          </p>
          <GameHost
            key={`${game.id}-${seed}-${sessionKey}`}
            game={game}
            seed={seed}
            onFinished={onFinished}
          />
          <Button
            variant="ghost"
            className="mt-4 w-full font-bold text-[color:var(--muted)]"
            onClick={() => setKind(null)}
          >
            Cancelar
          </Button>
        </div>
      )}
    </AppShell>
  );
}
