import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import type { ClaimEvent, GitHubProfile, TreasurySnapshot, User, UserStatus } from "~~/types";

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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
    if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

export async function getUserByWallet(address: string): Promise<User | null> {
  const supabase = getServiceClient();
  const walletAddress = address.toLowerCase();

  const { data, error } = await supabase.from("users").select("*").eq("wallet_address", walletAddress).maybeSingle();

  if (error) {
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

export async function createSupportMessage(email: string, body: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase.from("support_messages").insert({
    email: email.trim().toLowerCase(),
    body: body.trim(),
  });
  if (error) throw error;
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

export type ListUsersOptions = {
  status?: UserStatus | "all";
  page?: number;
  limit?: number;
  search?: string;
};

export type ListUsersResult = {
  users: User[];
  total: number;
  page: number;
  limit: number;
};

export async function listUsers(options: ListUsersOptions = {}): Promise<ListUsersResult> {
  const supabase = getServiceClient();
  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(100, Math.max(1, options.limit ?? 25));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }

  if (options.search?.trim()) {
    const term = options.search.trim().toLowerCase();
    query = query.or(`wallet_address.ilike.%${term}%,github_login.ilike.%${term}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    users: (data as DatabaseUserRow[] | null)?.map(mapUserRow) ?? [],
    total: count ?? 0,
    page,
    limit,
  };
}

export async function getUserStatusCounts(): Promise<Record<UserStatus, number>> {
  const supabase = getServiceClient();
  const statuses: UserStatus[] = ["active", "pending", "blocked"];
  const counts: Record<UserStatus, number> = { active: 0, pending: 0, blocked: 0 };

  await Promise.all(
    statuses.map(async status => {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("status", status);
      if (error) throw error;
      counts[status] = count ?? 0;
    }),
  );

  return counts;
}

export async function bulkApprovePending(): Promise<number> {
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("users").update({ status: "active" }).eq("status", "pending").select("id");

  if (error) {
    throw error;
  }

  return data?.length ?? 0;
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
