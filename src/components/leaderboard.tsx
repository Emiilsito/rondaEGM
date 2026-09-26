"use client";

import Link from "next/link";
import { displayScore } from "@/lib/games";
import type { GameDefinition } from "@/lib/types";
import { cn } from "@/lib/utils";

export type RankRow = {
  playerId: string;
  name: string;
  score: number | null;
  isYou?: boolean;
};

const BAR_COLORS = ["#ff7a8a", "#2ec4a0", "#b39cff"];

export function Podium({
  rows,
  game,
}: {
  rows: RankRow[];
  game: GameDefinition;
}) {
  const top = [...rows].slice(0, 3);
  while (top.length < 3) {
    top.push({
      playerId: `empty-${top.length}`,
      name: "—",
      score: null,
    });
  }
  const visual = [top[2], top[0], top[1]];
  const heights = [90, 140, 110];
  const colors = [BAR_COLORS[2], BAR_COLORS[0], BAR_COLORS[1]];
  const ranks = [3, 1, 2];

  return (
    <div className="soft-card animate-scale-in px-4 pb-5 pt-7">
      <div className="mb-6 flex items-end justify-center gap-4">
        {visual.map((row, i) => (
          <div
            key={row.playerId}
            className="animate-pop flex w-24 flex-col items-center"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="relative mb-3">
              <span
                className="avatar-ring"
                style={{
                  width: ranks[i] === 1 ? 64 : 52,
                  height: ranks[i] === 1 ? 64 : 52,
                  fontSize: ranks[i] === 1 ? 20 : 16,
                  background: [
                    "linear-gradient(145deg,#d7c6ff,#9ad7ff)",
                    "linear-gradient(145deg,#ffd6ea,#c9b8ff)",
                    "linear-gradient(145deg,#c8f7d4,#7ed6ff)",
                  ][i],
                  boxShadow: ranks[i] === 1
                    ? "0 8px 24px rgba(0,0,0,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {row.name === "—" ? "?" : row.name.slice(0, 1).toUpperCase()}
              </span>
              {ranks[i] === 1 && (
                <span className="animate-crown absolute -top-5 left-1/2 -translate-x-1/2 text-2xl">
                  👑
                </span>
              )}
              {row.score !== null && (
                <span className="animate-bounce-in absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#2a2a32] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                  {displayScore(row.score, game)}
                </span>
              )}
            </div>
            <div
              className="podium-bar w-full"
              style={{
                height: heights[i],
                background: `linear-gradient(180deg, ${colors[i]} 0%, ${colors[i]}dd 100%)`,
              }}
            />
            <p className="mt-3 truncate text-center text-xs font-extrabold text-[#1a1a1f]">
              {row.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Leaderboard({
  rows,
  game,
  emptyLabel = "Aún no hay puntuaciones hoy.",
  dark,
}: {
  rows: RankRow[];
  game: GameDefinition;
  emptyLabel?: string;
  dark?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p
        className={cn(
          "animate-pop rounded-[24px] px-4 py-8 text-center text-sm font-semibold",
          dark
            ? "bg-[color:var(--sheet)] text-white/70"
            : "soft-card text-[color:var(--muted)]",
        )}
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol
      className={cn(
        "overflow-hidden rounded-[24px]",
        dark ? "bg-[color:var(--sheet)] text-[color:var(--sheet-ink)]" : "soft-card",
      )}
    >
      {rows.map((row, index) => (
        <li
          key={row.playerId}
          className={cn(
            "animate-slide-up flex items-center gap-3 px-4 py-3.5 transition-colors",
            index < rows.length - 1 &&
              (dark ? "border-b border-white/8" : "border-b border-black/4"),
            row.isYou && (dark ? "bg-white/8" : "bg-[color:var(--brand)]/6"),
          )}
          style={{ animationDelay: `${index * 0.06}s` }}
        >
          <span
            className={cn(
              "w-7 text-sm font-extrabold tabular-nums",
              dark ? "text-white/40" : "text-black/30",
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="avatar-ring size-10 text-sm"
            style={{
              background: [
                "linear-gradient(145deg,#ffd6ea,#c9b8ff)",
                "linear-gradient(145deg,#c8f7d4,#7ed6ff)",
                "linear-gradient(145deg,#ffe8a3,#ffb4a2)",
              ][index % 3],
            }}
          >
            {row.name.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm font-extrabold",
                dark ? "text-white" : "text-[#1a1a1f]",
              )}
            >
              {row.name}
            </p>
            {row.isYou && (
              <span className="mt-0.5 inline-flex rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--brand-ink)]">
                Tú
              </span>
            )}
          </div>
          <p
            className={cn(
              "font-[family-name:var(--font-display)] text-sm font-bold tabular-nums",
              dark ? "text-[#3ddc97]" : "text-[color:var(--good)]",
            )}
          >
            {row.score === null ? "—" : displayScore(row.score, game)}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function NavPills({
  groupCode,
  active,
}: {
  groupCode: string;
  active: "home" | "play" | "rank" | "chat" | "logros";
}) {
  const items = [
    { id: "home" as const, href: `/group/${groupCode}`, label: "Hoy" },
    { id: "play" as const, href: `/group/${groupCode}/play`, label: "Jugar" },
    { id: "rank" as const, href: `/group/${groupCode}/rank`, label: "Ranking" },
    { id: "chat" as const, href: `/group/${groupCode}/chat`, label: "Chat" },
    { id: "logros" as const, href: `/group/${groupCode}/logros`, label: "Logros" },
  ];

  return (
    <nav className="nav-dock mt-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          data-active={active === item.id}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
