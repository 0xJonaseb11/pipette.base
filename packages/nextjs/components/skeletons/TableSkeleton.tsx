"use client";

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-base-300 bg-base-100 overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-base-300">
        <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
      </div>
      <div className="divide-y divide-zinc-200 dark:divide-base-300">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 flex gap-4">
            <div className="h-4 flex-1 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
            <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
            <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-base-300 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
