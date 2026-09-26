"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const { player, setPlayerName } = useRonda();
  const [name, setName] = useState(player?.name ?? "");

  return (
    <AppShell>
      <BrandMark />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--ink)]">
        ¿Cómo te llamamos?
      </h1>
      <p className="mt-2 font-semibold text-[color:var(--muted)]">
        Tu nombre sale en el ranking del grupo.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          setPlayerName(name);
          router.push("/");
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu apodo"
          maxLength={24}
          className="h-14 rounded-full border-0 bg-[color:var(--surface)] px-5 text-base font-bold text-[#1a1a1f] shadow-[var(--soft-shadow)] placeholder:text-black/30"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!name.trim()}
          className="cta-primary h-14 border-0 disabled:opacity-40"
        >
          Continuar
        </Button>
      </form>
    </AppShell>
  );
}
