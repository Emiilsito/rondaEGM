"use client";

import Link from "next/link";
import { AppShell, BrandMark } from "@/components/app-shell";
import { StyleSwitcher } from "@/components/style-switcher";

export default function EstilosPage() {
  return (
    <AppShell showStyleLink={false}>
      <BrandMark />
      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold text-[color:var(--ink)]">
        Elige estilo
      </h1>
      <p className="mt-2 font-semibold text-[color:var(--muted)]">
        Tres lecturas del look PlayUs. Cambia y recorre la app: el tema se
        guarda en este navegador.
      </p>

      <div className="mt-6">
        <StyleSwitcher />
      </div>

      <Link href="/" className="cta-primary mt-8">
        Volver a Ronda
      </Link>
    </AppShell>
  );
}
