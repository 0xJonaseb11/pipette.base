"use client";

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-6 space-y-3">
      <div className="h-4 w-32 rounded bg-base-300 animate-pulse" />
      <div className="h-6 w-48 rounded bg-base-300 animate-pulse" />
      <div className="h-4 w-24 rounded bg-base-300 animate-pulse" />
    </div>
  );
}
