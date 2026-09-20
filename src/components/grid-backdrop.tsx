import { cn } from "@/lib/utils";

export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("zen-grid pointer-events-none absolute inset-0", className)}
    />
  );
}

export function LimeGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute size-[28rem] rounded-full bg-[radial-gradient(circle,var(--lime)_0%,transparent_68%)] opacity-50 blur-3xl",
        className
      )}
    />
  );
}
