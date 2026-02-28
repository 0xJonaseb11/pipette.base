import { type Address, createPublicClient, http } from "viem";
import { parseEther } from "viem";
import { base, mainnet } from "viem/chains";
import type { GitHubProfile } from "~~/types";
import type { SybilScoreBreakdown } from "~~/types";

const SCORE_THRESHOLDS = {
  BLOCKED: 15,
  PENDING_REVIEW: 40,
  ELIGIBLE: 41,
} as const;

const MAX_ACCOUNT_AGE_POINTS = 25;
const MAX_PUBLIC_REPOS_POINTS = 20;
const MAX_FOLLOWERS_POINTS = 15;
const VERIFIED_EMAIL_POINTS = 10;
const MAINNET_TX_POINTS = 15;
const WALLET_AGE_POINTS = 15;

const DAYS_PER_POINT_ACCOUNT_AGE = 30;
const DAYS_PER_POINT_WALLET_AGE = 25;
const POINTS_PER_REPO = 2;
const POINTS_PER_FOLLOWER = 1;

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const baseMainnetClient = createPublicClient({
  chain: base,
  transport: http(),
});

const BASESCAN_API = "https://api.basescan.org/api";
const ETHERSCAN_API = "https://api.etherscan.org/api";

async function getFirstTxTimestamp(address: string, api: string, apiKey?: string): Promise<number | null> {
  try {
    const params = new URLSearchParams({
      module: "account",
      action: "txlist",
      address,
      startblock: "0",
      endblock: "99999999",
      page: "1",
      offset: "1",
      sort: "asc",
    });
    if (apiKey) params.set("apikey", apiKey);
    const res = await fetch(`${api}?${params}`);
    const data = (await res.json()) as { status: string; result?: Array<{ timeStamp: string }> };
    const first = Array.isArray(data.result) && data.result[0];
    return first ? parseInt(first.timeStamp, 10) : null;
  } catch {
    return null;
  }
}

export function getScoreThresholds(): typeof SCORE_THRESHOLDS {
  return SCORE_THRESHOLDS;
}

export function getClaimAmount(score: number): bigint {
  if (score >= 80) return parseEther("0.01");
  if (score >= 60) return parseEther("0.007");
  if (score >= 41) return parseEther("0.005");
  return 0n;
}

export function getStatusFromScore(score: number): "active" | "pending" | "blocked" {
  if (score <= SCORE_THRESHOLDS.BLOCKED) return "blocked";
  if (score <= SCORE_THRESHOLDS.PENDING_REVIEW) return "pending";
  return "active";
}

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

  breakdown.accountAge = Math.min(
    MAX_ACCOUNT_AGE_POINTS,
    Math.floor(profile.account_age_days / DAYS_PER_POINT_ACCOUNT_AGE),
  );

  breakdown.publicRepos = Math.min(MAX_PUBLIC_REPOS_POINTS, profile.public_repos * POINTS_PER_REPO);

  breakdown.followers = Math.min(MAX_FOLLOWERS_POINTS, profile.followers * POINTS_PER_FOLLOWER);

  breakdown.verifiedEmail = profile.has_email ? VERIFIED_EMAIL_POINTS : 0;

  if (walletAddress) {
    const ethKey = process.env.ETHERSCAN_API_KEY;
    const baseKey = process.env.BASESCAN_API_KEY;

    let txCountEth = 0;
    let txCountBase = 0;
    try {
      const [eth, base] = await Promise.all([
        mainnetClient.getTransactionCount({ address: walletAddress }).catch(() => 0),
        baseMainnetClient.getTransactionCount({ address: walletAddress }).catch(() => 0),
      ]);
      txCountEth = eth;
      txCountBase = base;
    } catch {}

    const totalTxCount = Math.max(txCountEth, txCountBase);
    breakdown.onchainHistory = Math.min(MAINNET_TX_POINTS, totalTxCount);

    const [firstEth, firstBase] = await Promise.all([
      getFirstTxTimestamp(walletAddress, ETHERSCAN_API, ethKey),
      getFirstTxTimestamp(walletAddress, BASESCAN_API, baseKey),
    ]);
    const firstTxTs = [firstEth, firstBase].filter((t): t is number => t != null);
    const earliestTs = firstTxTs.length ? Math.min(...firstTxTs) : null;

    if (earliestTs) {
      const walletAgeDays = Math.max(0, Math.floor((Date.now() / 1000 - earliestTs) / (24 * 60 * 60)));
      breakdown.walletAge = Math.min(WALLET_AGE_POINTS, Math.floor(walletAgeDays / DAYS_PER_POINT_WALLET_AGE));
    } else if (totalTxCount > 0) {
      breakdown.walletAge = Math.min(WALLET_AGE_POINTS, Math.floor(totalTxCount / 2));
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
