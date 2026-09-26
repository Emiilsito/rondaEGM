"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell, BrandMark } from "@/components/app-shell";
import { useRonda } from "@/components/ronda-provider";
import { Button } from "@/components/ui/button";

export default function InvitePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { ready, player, joinGroup, ensureDemoGroup } = useRonda();
  const code = String(params.code || "").toUpperCase();

  useEffect(() => {
    async function handleInvite() {
      if (!ready) return;
      if (!player) {
        router.replace(`/onboarding`);
        return;
      }
      if (code === "RONDA1") {
        ensureDemoGroup();
        router.replace("/group/RONDA1");
        return;
      }
      const result = await joinGroup(code);
      if (result.ok && result.group) {
        router.replace(`/group/${result.group.code}`);
      }
    }
    handleInvite();
  }, [ready, player, code, joinGroup, ensureDemoGroup, router]);

  return (
    <AppShell>
      <BrandMark />
      <h1 className="mt-8 font-[family-name:var(--font-display)] text-3xl font-semibold">
        Invitación {code}
      </h1>
      <p className="mt-2 text-white/65">
        {player
          ? "Intentando unirte al grupo…"
          : "Primero elige un nombre para continuar."}
      </p>
      {!player && (
        <Button
          className="mt-8 h-12 w-full rounded-2xl bg-[#C8F542] font-semibold text-[#071018]"
          onClick={() => router.push("/onboarding")}
        >
          Crear perfil
        </Button>
      )}
    </AppShell>
  );
}
