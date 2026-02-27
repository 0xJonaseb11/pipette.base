"use client";

export function ScoreSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
      <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
      <div className="h-10 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 animate-pulse mx-auto" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
