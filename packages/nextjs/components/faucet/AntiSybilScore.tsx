"use client";

import { ScoreSkeleton } from "~~/components/skeletons/ScoreSkeleton";
import type { SybilScoreBreakdown } from "~~/types";

type Props = {
  breakdown: SybilScoreBreakdown | null;
  loading: boolean;
};

const LABELS: Record<keyof Omit<SybilScoreBreakdown, "total">, string> = {
  accountAge: "Account age",
  publicRepos: "Public repos",
  followers: "Followers",
  verifiedEmail: "Verified email",
  onchainHistory: "On-chain history",
  walletAge: "Wallet age",
};

function scoreColor(score: number): string {
  if (score >= 41) return "text-emerald-600";
  if (score >= 16) return "text-amber-600";
  return "text-base-content/70";
}

export function AntiSybilScore({ breakdown, loading }: Props) {
  if (loading) {
    return <ScoreSkeleton />;
  }

  if (!breakdown) {
    return null;
  }

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-6">
      <p className="text-sm font-medium text-base-content/80 mb-3">Eligibility score</p>
      <div className="flex flex-col items-center mb-4">
        <div className={`text-3xl font-semibold tabular-nums ${scoreColor(breakdown.total)}`}>{breakdown.total}</div>
        <p className="text-xs text-base-content/60 mt-1">out of 100</p>
      </div>
      <div className="space-y-2">
        {(Object.keys(LABELS) as (keyof Omit<SybilScoreBreakdown, "total">)[]).map(key => (
          <div key={key} className="flex items-center justify-between text-sm">
            <span className="text-base-content/80">{LABELS[key]}</span>
            <span className="font-medium text-base-content tabular-nums">+{breakdown[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
