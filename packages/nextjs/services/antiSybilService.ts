import { type Address, createPublicClient, http } from "viem";
import { parseEther } from "viem";
import { mainnet } from "viem/chains";
import type { GitHubProfile } from "~~/types";
import type { SybilScoreBreakdown } from "~~/types";

const SCORE_THRESHOLDS = {
  BLOCKED: 15,
  PENDING_REVIEW: 40,
  ELIGIBLE: 41,
} as const;

/** Max points per signal from spec. */
const MAX_ACCOUNT_AGE_POINTS = 25;
const MAX_PUBLIC_REPOS_POINTS = 20;
const MAX_FOLLOWERS_POINTS = 15;
const VERIFIED_EMAIL_POINTS = 10;
const MAINNET_TX_POINTS = 15;
const WALLET_AGE_POINTS = 15;

const DAYS_PER_POINT_ACCOUNT_AGE = 30;
const POINTS_PER_REPO = 2;
const POINTS_PER_FOLLOWER = 1;

/** Mainnet client for on-chain checks only. */
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function getScoreThresholds(): typeof SCORE_THRESHOLDS {
  return SCORE_THRESHOLDS;
}

/**
 * Claim amount in ETH (as wei) by score tier.
 * Beginners get the same base eligibility; higher score = slightly more to reduce barrier.
 */
export function getClaimAmount(score: number): bigint {
  if (score >= 80) return parseEther("0.01");
  if (score >= 60) return parseEther("0.007");
  if (score >= 41) return parseEther("0.005");
  return 0n;
}

/**
 * Derives status from score: blocked, pending (needs admin approval), or active.
 */
export function getStatusFromScore(score: number): "active" | "pending" | "blocked" {
  if (score <= SCORE_THRESHOLDS.BLOCKED) return "blocked";
  if (score <= SCORE_THRESHOLDS.PENDING_REVIEW) return "pending";
  return "active";
}

/**
 * Computes anti-sybil score (0–100) from GitHub profile and optional on-chain data.
 * Safe to call from server; on-chain lookups are best-effort (failures = 0 for those components).
 */
export async function computeSybilScore(
  profile: GitHubProfile,
  walletAddress?: Address | null,
): Promise<{ score: number; breakdown: SybilScoreBreakdown }> {
  const breakdown: SybilScoreBreakdown = {
    total: 0,
    accountAge: 0,
    publicRepos: 0,
    followers: 0,
    verifiedEmail: 0,
    onchainHistory: 0,
    walletAge: 0,
  };

  // GitHub account age: 1 point per 30 days, capped at 25 (~2 years)
  breakdown.accountAge = Math.min(
    MAX_ACCOUNT_AGE_POINTS,
    Math.floor(profile.account_age_days / DAYS_PER_POINT_ACCOUNT_AGE),
  );

  // Public repos: 2 pts each, capped at 20
  breakdown.publicRepos = Math.min(MAX_PUBLIC_REPOS_POINTS, profile.public_repos * POINTS_PER_REPO);

  // Followers: 1 pt each, capped at 15
  breakdown.followers = Math.min(MAX_FOLLOWERS_POINTS, profile.followers * POINTS_PER_FOLLOWER);

  // Verified email: 10 or 0
  breakdown.verifiedEmail = profile.has_email ? VERIFIED_EMAIL_POINTS : 0;

  if (walletAddress) {
    try {
      const txCount = await mainnetClient.getTransactionCount({ address: walletAddress });

      // Prior mainnet txs: up to 15 points (1 per tx, capped)
      breakdown.onchainHistory = Math.min(MAINNET_TX_POINTS, txCount);

      // Wallet age: use mainnet tx count as proxy for "has been around" (no historical index).
      // 1 point per 2 txs, capped at 15 — new devs with 0 mainnet txs get 0, which is fine.
      if (txCount > 0) {
        breakdown.walletAge = Math.min(WALLET_AGE_POINTS, Math.floor(txCount / 2));
      }
    } catch {
      // RPC or network failure: leave onchain/walletAge at 0 so we don't block beginners
    }
  }

  breakdown.total =
    breakdown.accountAge +
    breakdown.publicRepos +
    breakdown.followers +
    breakdown.verifiedEmail +
    breakdown.onchainHistory +
    breakdown.walletAge;

  return { score: Math.min(100, breakdown.total), breakdown };
}
