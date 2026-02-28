"use client";

import { CheckCircle, Clock } from "lucide-react";
import { CardSkeleton } from "~~/components/skeletons/CardSkeleton";
import type { User } from "~~/types";

type Props = {
  user: User | null;
  loading: boolean;
};

function formatRelative(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = d.getTime() - now.getTime();
  const diffM = Math.round(diffMs / 60000);
  const diffH = Math.round(diffMs / 3600000);
  if (diffM <= 0) return "now";
  if (diffM < 60) return `in ${diffM}m`;
  if (diffH < 24) return `in ${diffH}h`;
  return `in ${Math.round(diffH / 24)}d`;
}

function formatPast(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffM = Math.round((now.getTime() - d.getTime()) / 60000);
  const diffH = Math.round((now.getTime() - d.getTime()) / 3600000);
  if (diffM < 1) return "just now";
  if (diffM < 60) return `${diffM}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
}

function formatNextEligible(lastClaimAt: string | null): string {
  if (!lastClaimAt) return "Now";
  const next = new Date(lastClaimAt);
  next.setHours(next.getHours() + 24);
  if (next <= new Date()) return "Now";
  return formatRelative(next);
}

export function StatusCard({ user, loading }: Props) {
  if (loading) {
    return <CardSkeleton />;
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-base-300 bg-base-100 p-6">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-base-content/80 mb-3">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Status</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-base-content/80">
          Connect your wallet and link GitHub to see your status.
        </p>
      </div>
    );
  }

  const statusLabel =
    user.status === "active" ? "Eligible" : user.status === "pending" ? "Pending approval" : "Restricted";

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-base-300 bg-base-100 p-6 space-y-4">
      <div className="flex items-center gap-2 text-zinc-600 dark:text-base-content/80">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">Status</span>
      </div>
      <div className="flex items-center gap-2">
        {user.status === "active" ? (
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-amber-500" />
        )}
        <span className="font-medium text-zinc-900 dark:text-base-content capitalize">{statusLabel}</span>
      </div>
      {user.last_claim_at && (
        <p className="text-sm text-zinc-600 dark:text-base-content/80">
          Last claim: {formatPast(new Date(user.last_claim_at))}
        </p>
      )}
      {user.status === "active" && (
        <p className="text-sm text-zinc-600 dark:text-base-content/80">
          Next eligible: {formatNextEligible(user.last_claim_at)}
        </p>
      )}
      {user.total_claimed > 0 && (
        <p className="text-sm text-zinc-500 dark:text-base-content/60">
          Total claimed: {Number(user.total_claimed).toFixed(4)} ETH
        </p>
      )}
    </div>
  );
}
