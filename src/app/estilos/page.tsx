"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";

export default function EstilosPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <AppShell>
      <BrandMark />
      <p className="mt-8 text-sm font-semibold text-[color:var(--muted)]">
        Cargando…
      </p>
    </AppShell>
  );
}
