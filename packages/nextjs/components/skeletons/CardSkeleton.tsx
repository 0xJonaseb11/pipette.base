"use client";

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-base-300 bg-white dark:bg-base-100 p-6 space-y-3">
      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
      <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
      <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
    </div>
  );
}
