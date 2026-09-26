import { cn } from "@/lib/utils";
import { StyleSwitcher } from "@/components/style-switcher";

export function AppShell({
  children,
  className,
  showStyleLink = true,
}: {
  children: React.ReactNode;
  className?: string;
  showStyleLink?: boolean;
}) {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--page-wash)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: "var(--pattern)",
          backgroundSize: "var(--pattern-size)",
        }}
      />
      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col px-4 pb-10 pt-5 sm:px-5",
          className,
        )}
      >
        {showStyleLink && (
          <div className="mb-3 flex justify-end">
            <StyleSwitcher compact />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function BrandMark({
  className,
  light,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className="grid size-9 place-items-center rounded-2xl text-lg shadow-[var(--soft-shadow)]"
        style={{
          background: "var(--accent)",
          color: "var(--accent-ink)",
        }}
        aria-hidden
      >
        ✦
      </span>
      <span
        className={cn(
          "font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight",
          light ? "text-white" : "text-[color:var(--ink)]",
        )}
      >
        ronda
      </span>
    </div>
  );
}

export function AvatarStack({
  names,
  size = 40,
}: {
  names: string[];
  size?: number;
}) {
  return (
    <div className="flex -space-x-3">
      {names.slice(0, 4).map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="avatar-ring"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.34,
            zIndex: 10 - i,
            background: [
              "linear-gradient(145deg,#ffd6ea,#c9b8ff)",
              "linear-gradient(145deg,#c8f7d4,#7ed6ff)",
              "linear-gradient(145deg,#ffe8a3,#ffb4a2)",
              "linear-gradient(145deg,#d7c6ff,#9ad7ff)",
            ][i % 4],
          }}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
