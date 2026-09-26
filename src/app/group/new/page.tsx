"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewGroupPage() {
  const router = useRouter();
  const { ready, player, createNewGroup } = useRonda();
  const [name, setName] = useState("");

  useEffect(() => {
    if (ready && !player) router.replace("/onboarding");
  }, [ready, player, router]);

  if (!ready || !player) {
    return (
      <AppShell>
        <p className="text-sm font-semibold text-[color:var(--muted)]">
          Cargando…
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <BrandMark />
      <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.16em] text-[color:var(--muted)]">
        Nueva arena
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--ink)]">
        Crea tu grupo
      </h1>
      <p className="mt-2 font-semibold text-[color:var(--muted)]">
        Temporada de 21 días. Comparte el código y que empiece el pique.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const group = createNewGroup(name || "Cool group");
          if (group) router.push(`/group/${group.code}`);
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Cool group 😎"
          maxLength={32}
          className="h-14 rounded-full border-0 bg-[color:var(--surface)] px-5 text-base font-bold text-[#1a1a1f] shadow-[var(--soft-shadow)] placeholder:text-black/30"
          autoFocus
        />
        <Button type="submit" className="cta-primary h-14 border-0">
          + Crear arena
        </Button>
      </form>
    </AppShell>
  );
}
