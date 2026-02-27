"use server";

import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import type { ClaimEvent, GitHubProfile, TreasurySnapshot, User, UserStatus } from "~~/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

type DatabaseUserRow = {
  id: string;
  wallet_address: string;
  github_id: string | null;
  github_login: string | null;
  github_account_age_days: number;
  github_public_repos: number;
  github_followers: number;
  sybil_score: number;
  status: UserStatus;
  last_claim_at: string | null;
  total_claimed: number;
  created_at: string;
};

type DatabaseClaimHistoryRow = {
  id: string;
  wallet_address: string;
  amount: number;
  tx_hash: string;
  claimed_at: string;
};

type DatabaseTreasurySnapshotRow = {
  id: string;
  balance_eth: number;
  recorded_at: string;
};

let supabaseClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: {
        persistSession: false,
      },
    });
  }

  return supabaseClient;
}

export async function getUserByWallet(address: string): Promise<User | null> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const { data, error } = await supabase.from("users").select("*").eq("wallet_address", walletAddress).maybeSingle();

  if (error) {
    // PGRST116 is \"No rows found for single()\" – treat as null user.
    if ((error as { code?: string }).code === "PGRST116") {
      return null;
    }

    throw error;
  }

  if (!data) {
    return null;
  }

  return mapUserRow(data as DatabaseUserRow);
}

export async function createUserIfNotExists(address: string): Promise<User> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const existing = await getUserByWallet(walletAddress);
  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      wallet_address: walletAddress,
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapUserRow(data as DatabaseUserRow);
}

export async function linkGitHub(address: string, profile: GitHubProfile): Promise<void> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const { error } = await supabase
    .from("users")
    .update({
      github_id: profile.github_id,
      github_login: profile.login,
      github_account_age_days: profile.account_age_days,
      github_public_repos: profile.public_repos,
      github_followers: profile.followers,
    })
    .eq("wallet_address", walletAddress);

  if (error) {
    throw error;
  }
}

export async function updateSybilScore(address: string, score: number): Promise<void> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const { error } = await supabase.from("users").update({ sybil_score: score }).eq("wallet_address", walletAddress);

  if (error) {
    throw error;
  }
}

export async function updateUserStatus(address: string, status: UserStatus): Promise<void> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const { error } = await supabase.from("users").update({ status }).eq("wallet_address", walletAddress);

  if (error) {
    throw error;
  }
}

export async function recordClaim(address: string, amountEth: string, txHash: string): Promise<void> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const numericAmount = Number(amountEth);

  const { error: insertError } = await supabase.from("claim_history").insert({
    wallet_address: walletAddress,
    amount: numericAmount,
    tx_hash: txHash,
  });

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await supabase.rpc("increment_total_claimed", {
    p_wallet_address: walletAddress,
    p_amount: numericAmount,
  });

  if (updateError && (updateError as { code?: string }).code !== "PGRST116") {
    throw updateError;
  }
}

export async function getDailyClaimTotal(): Promise<number> {
  const supabase = getServiceClient();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("claim_history")
    .select("amount")
    .gte("claimed_at", startOfDay.toISOString());

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return 0;
  }

  type AmountRow = { amount: number };

  return (data as AmountRow[]).reduce((sum: number, row: AmountRow) => sum + Number(row.amount), 0);
}

export async function getClaimHistory(limit?: number): Promise<ClaimEvent[]> {
  const supabase = getServiceClient();

  let query = supabase.from("claim_history").select("*").order("claimed_at", { ascending: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return (data as DatabaseClaimHistoryRow[]).map(mapClaimHistoryRow);
}

export async function getTreasurySnapshots(days?: number): Promise<TreasurySnapshot[]> {
  const supabase = getServiceClient();

  let query = supabase.from("treasury_snapshots").select("*").order("recorded_at", { ascending: false });

  if (typeof days === "number") {
    const since = new Date();
    since.setDate(since.getDate() - days);
    query = query.gte("recorded_at", since.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (!data) {
    return [];
  }

  return (data as DatabaseTreasurySnapshotRow[]).map(mapTreasurySnapshotRow);
}

function mapUserRow(row: DatabaseUserRow): User {
  return {
    id: row.id,
    wallet_address: row.wallet_address,
    github_id: row.github_id,
    github_login: row.github_login,
    github_account_age_days: row.github_account_age_days,
    github_public_repos: row.github_public_repos,
    github_followers: row.github_followers,
    sybil_score: row.sybil_score,
    status: row.status,
    last_claim_at: row.last_claim_at,
    total_claimed: Number(row.total_claimed),
    created_at: row.created_at,
  };
}

function mapClaimHistoryRow(row: DatabaseClaimHistoryRow): ClaimEvent {
  return {
    id: row.id,
    wallet_address: row.wallet_address,
    amount: row.amount,
    tx_hash: row.tx_hash,
    claimed_at: row.claimed_at,
  };
}

function mapTreasurySnapshotRow(row: DatabaseTreasurySnapshotRow): TreasurySnapshot {
  return {
    balance_eth: row.balance_eth,
    recorded_at: row.recorded_at,
  };
}
