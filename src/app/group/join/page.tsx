"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinGroupPage() {
  const router = useRouter();
  const { ready, player, joinGroup } = useRonda();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

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
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--ink)]">
        Únete
      </h1>
      <p className="mt-2 font-semibold text-[color:var(--muted)]">
        Código de 6 caracteres. En demo local el grupo debe existir aquí (o usa
        RONDA1).
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const result = joinGroup(code);
          if (!result.ok) {
            setError(result.error ?? "No se pudo unir.");
            return;
          }
          router.push(`/group/${result.group!.code}`);
        }}
      >
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="ABC123"
          maxLength={8}
          className="h-14 rounded-full border-0 bg-[color:var(--surface)] text-center font-[family-name:var(--font-display)] text-2xl tracking-[0.35em] text-[#1a1a1f] shadow-[var(--soft-shadow)] placeholder:tracking-[0.2em] placeholder:text-black/25"
          autoFocus
        />
        {error && (
          <p className="text-sm font-bold text-[color:var(--warn)]">{error}</p>
        )}
        <Button
          type="submit"
          disabled={code.trim().length < 4}
          className="cta-primary h-14 border-0 disabled:opacity-40"
        >
          Entrar
        </Button>
      </form>
    </AppShell>
  );
}
