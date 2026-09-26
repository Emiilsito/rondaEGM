"use client";

import Link from "next/link";
import { THEMES, type ThemeId } from "@/lib/themes";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const SWATCHES: Record<ThemeId, [string, string, string]> = {
  arena: ["#F7F4EE", "#6B5CFF", "#FFE14A"],
  candy: ["#FFF5F0", "#FF6B6B", "#3DDC97"],
  club: ["#5B4BDB", "#FFFFFF", "#FFE14A"],
};

export function StyleSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    return (
      <Link
        href="/estilos"
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--stroke)] bg-[color:var(--surface)] px-3 py-1.5 text-xs font-bold text-[color:var(--ink)] shadow-[var(--soft-shadow)]"
      >
        <span className="flex -space-x-1">
          {SWATCHES[theme].map((c) => (
            <span
              key={c}
              className="size-3 rounded-full border border-white/80"
              style={{ background: c }}
            />
          ))}
        </span>
        Estilos
      </Link>
    );
  }

  return (
    <div className="grid gap-3">
      {THEMES.map((item) => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            className={cn(
              "rounded-[28px] border-2 p-4 text-left transition",
              active
                ? "border-[color:var(--brand)] bg-[color:var(--surface)] shadow-[var(--pop-shadow)]"
                : "border-transparent bg-[color:var(--surface-muted)] hover:border-[color:var(--stroke)]",
            )}
          >
            <div className="mb-3 flex gap-2">
              {SWATCHES[item.id].map((c) => (
                <span
                  key={c}
                  className="h-8 flex-1 rounded-2xl"
                  style={{ background: c }}
                />
              ))}
            </div>
            <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[color:var(--ink)]">
              {item.name}
            </p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--brand)]">
              {item.tagline}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{item.blurb}</p>
          </button>
        );
      })}
    </div>
  );
}
