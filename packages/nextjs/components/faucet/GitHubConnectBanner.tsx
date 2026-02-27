"use client";

import { Github } from "lucide-react";

type Props = {
  onConnect: () => void;
  loading?: boolean;
};

export function GitHubConnectBanner({ onConnect, loading }: Props) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
          <Github className="h-5 w-5 text-amber-700 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-medium text-zinc-900 dark:text-zinc-100">Connect GitHub to claim</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Link your GitHub account to verify identity and unlock claims.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onConnect}
        disabled={loading}
        className="shrink-0 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Connecting…" : "Connect GitHub"}
      </button>
    </div>
  );
}
