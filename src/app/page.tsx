"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell, AvatarStack, BrandMark } from "@/components/app-shell";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const { ready, player, activeGroup, groups, ensureDemoGroup } = useRonda();

  useEffect(() => {
    if (!ready || !player || !activeGroup) return;
    router.replace(`/group/${activeGroup.code}`);
  }, [ready, player, activeGroup, router]);

  // Avoid infinite "Cargando…" if hydration is slow/blocked over a tunnel.
  if (!ready || !player) {
    return (
      <AppShell>
        <BrandMark className="animate-pop" />
        <p className="animate-pop-delay mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-[color:var(--muted)]">
          Daily group challenge
        </p>
        <h1 className="animate-pop-delay mt-3 max-w-[12ch] font-[family-name:var(--font-display)] text-5xl font-bold leading-[0.95] text-[color:var(--ink)]">
          Juega tonterías.
        </h1>
        <p className="bubble-title animate-pop-delay mt-2 text-5xl sm:text-6xl">
          Gana gloria.
        </p>
        <p className="animate-pop-delay-2 mt-5 max-w-[32ch] text-base font-semibold text-[color:var(--muted)]">
          Un minijuego de 1 minuto cada día con tu crew. Temporada, ranking y
          corona.
        </p>

        <div className="animate-floaty mt-8 flex justify-center gap-3">
          <AvatarStack names={["A", "N", "T", "E"]} size={52} />
        </div>

        <div className="animate-pop-delay-2 mt-10 space-y-3">
          <Link href="/onboarding" className="cta-primary">
            Empezar
          </Link>
          <Link
            href="/estilos"
            className="block text-center text-sm font-bold text-[color:var(--muted)] underline underline-offset-4"
          >
            Ver 3 estilos visuales
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <BrandMark />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--ink)]">
        Hola, {player.name}
      </h1>
      <p className="mt-2 font-semibold text-[color:var(--muted)]">
        Invita amigos y abre tu arena.
      </p>

      <div className="mt-8 space-y-3">
        <Link href="/group/new" className="cta-primary">
          + Nuevo grupo
        </Link>
        <Link
          href="/group/join"
          className="block text-center text-sm font-bold text-[color:var(--ink)] underline underline-offset-4"
        >
          o unirme a un grupo
        </Link>
        <Button
          className="cta-brand h-12 border-0"
          onClick={() => {
            ensureDemoGroup();
            router.push("/group/RONDA1");
          }}
        >
          Probar crew demo
        </Button>
      </div>

      {groups.length > 0 && (
        <div className="mt-10 space-y-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[color:var(--muted)]">
            Tus arenas
          </p>
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/group/${group.code}`}
              className="soft-card block p-4 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold text-[#1a1a1f]">{group.name}</p>
                  <p className="text-xs font-bold text-black/40">
                    Código {group.code}
                  </p>
                </div>
                <AvatarStack
                  names={group.memberIds.map((id) => id.slice(0, 1))}
                  size={34}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
