import { cn } from "@/lib/utils";

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--page-wash)" }}
      />

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-12 pt-6 sm:px-5",
          className,
        )}
      >
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
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className="grid size-10 place-items-center rounded-2xl text-xl shadow-[var(--soft-shadow)] transition-transform duration-300 hover:scale-110 hover:rotate-12"
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
          className="avatar-ring animate-pop"
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
            animationDelay: `${i * 0.08}s`,
          }}
        >
          {name.slice(0, 1).toUpperCase()}
        </span>
      ))}
    </div>
  );
}
