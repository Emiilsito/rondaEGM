import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[color:var(--surface-muted)]",
        className,
      )}
    />
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-[color:var(--muted)] border-t-transparent",
        className,
      )}
    />
  );
}

export function FullPageLoader({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <LoadingSpinner className="size-8" />
      <p className="text-sm font-semibold text-[color:var(--muted)]">{message}</p>
    </div>
  );
}
