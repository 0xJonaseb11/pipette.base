"use client";

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 h-64 flex items-end gap-1">
      {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t bg-zinc-200 dark:bg-zinc-700 animate-pulse"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
