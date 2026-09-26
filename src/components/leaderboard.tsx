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
  // visual order: 3rd, 1st, 2nd
  const visual = [top[2], top[0], top[1]];
  const heights = [88, 132, 108];
  const colors = [BAR_COLORS[2], BAR_COLORS[0], BAR_COLORS[1]];
  const ranks = [3, 1, 2];

  return (
    <div className="soft-card px-3 pb-4 pt-6">
      <div className="mb-5 flex items-end justify-center gap-3">
        {visual.map((row, i) => (
          <div key={row.playerId} className="flex w-24 flex-col items-center">
            <div className="relative mb-2">
              <span
                className="avatar-ring"
                style={{
                  width: ranks[i] === 1 ? 58 : 48,
                  height: ranks[i] === 1 ? 58 : 48,
                  fontSize: ranks[i] === 1 ? 18 : 15,
                  background: [
                    "linear-gradient(145deg,#d7c6ff,#9ad7ff)",
                    "linear-gradient(145deg,#ffd6ea,#c9b8ff)",
                    "linear-gradient(145deg,#c8f7d4,#7ed6ff)",
                  ][i],
                }}
              >
                {row.name === "—" ? "?" : row.name.slice(0, 1).toUpperCase()}
              </span>
              {ranks[i] === 1 && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl">
                  👑
                </span>
              )}
              {row.score !== null && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#2a2a32] px-2 py-0.5 text-[10px] font-bold text-white">
                  {displayScore(row.score, game)}
                </span>
              )}
            </div>
            <div
              className="podium-bar w-full"
              style={{ height: heights[i], background: colors[i] }}
            />
            <p className="mt-2 truncate text-center text-xs font-extrabold text-[#1a1a1f]">
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
          "rounded-[28px] px-4 py-6 text-center text-sm font-semibold",
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
        "overflow-hidden rounded-[28px]",
        dark ? "bg-[color:var(--sheet)] text-[color:var(--sheet-ink)]" : "soft-card",
      )}
    >
      {rows.map((row, index) => (
        <li
          key={row.playerId}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            index < rows.length - 1 &&
              (dark ? "border-b border-white/10" : "border-b border-black/5"),
            row.isYou && (dark ? "bg-white/8" : "bg-[color:var(--brand)]/8"),
          )}
        >
          <span
            className={cn(
              "w-7 text-sm font-extrabold",
              dark ? "text-white/50" : "text-black/35",
            )}
          >
            #{index + 1}
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
              "font-[family-name:var(--font-display)] text-sm font-bold",
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
  active: "home" | "play" | "rank";
}) {
  const items = [
    { id: "home" as const, href: `/group/${groupCode}`, label: "Hoy" },
    { id: "play" as const, href: `/group/${groupCode}/play`, label: "Jugar" },
    { id: "rank" as const, href: `/group/${groupCode}/rank`, label: "Ranking" },
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
