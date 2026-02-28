export type UserStatus = "active" | "pending" | "blocked";

export interface User {
  id: string;
  wallet_address: string;
  github_id: string | null;
  github_login: string | null;
  github_account_age_days?: number;
  github_public_repos?: number;
  github_followers?: number;
  sybil_score: number;
  status: UserStatus;
  last_claim_at: string | null;
  total_claimed: number;
  created_at: string;
}

export interface ClaimEvent {
  id: string;
  wallet_address: string;
  amount: number;
  tx_hash: string;
  claimed_at: string;
}

export interface TreasurySnapshot {
  balance_eth: number;
  recorded_at: string;
}

export interface ClaimResult {
  txHash: string;
  amount: string;
  nextEligibleAt: string;
}

export interface SybilScoreBreakdown {
  total: number;
  accountAge: number;
  publicRepos: number;
  followers: number;
  verifiedEmail: number;
  onchainHistory: number;
  walletAge: number;
}

export interface GitHubProfile {
  github_id: string;
  login: string;
  account_age_days: number;
  public_repos: number;
  followers: number;
  following: number;
  has_email: boolean;
}
