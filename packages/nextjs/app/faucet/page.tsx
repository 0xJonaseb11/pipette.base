"use client";

import { useCallback, useEffect, useState } from "react";
import { Droplets } from "lucide-react";
import { useAccount } from "wagmi";
import { AntiSybilScore } from "~~/components/faucet/AntiSybilScore";
import { ClaimButton } from "~~/components/faucet/ClaimButton";
import { FaucetCard } from "~~/components/faucet/FaucetCard";
import { FaucetSteps } from "~~/components/faucet/FaucetSteps";
import { GitHubConnectBanner } from "~~/components/faucet/GitHubConnectBanner";
import { GitHubLinkSignCard } from "~~/components/faucet/GitHubLinkSignCard";
import { StatusCard } from "~~/components/faucet/StatusCard";
import type { User } from "~~/types";
import type { SybilScoreBreakdown } from "~~/types";
import { parseSupabaseHash } from "~~/utils/parseSupabaseHash";

const TREASURY_POLL_MS = 30_000;

function getClaimAmountEth(score: number): string {
  if (score >= 80) return "0.01";
  if (score >= 60) return "0.007";
  if (score >= 41) return "0.005";
  return "0";
}

function getNextEligibleAt(lastClaimAt: string | null): string | null {
  if (!lastClaimAt) return null;
  const next = new Date(lastClaimAt);
  next.setHours(next.getHours() + 24);
  return next.toISOString();
}

export default function FaucetPage() {
  const { address, isConnected } = useAccount();
  const [treasuryBalance, setTreasuryBalance] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [scoreBreakdown, setScoreBreakdown] = useState<SybilScoreBreakdown | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [pendingLink, setPendingLink] = useState<{ providerToken: string } | null>(null);

  const fetchTreasury = useCallback(async () => {
    try {
      const res = await fetch("/api/treasury/balance");
      const json = await res.json();
      if (json.data?.balanceEth != null) setTreasuryBalance(json.data.balanceEth);
    } catch {
      setTreasuryBalance(null);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!address) {
      setUser(null);
      return;
    }
    setUserLoading(true);
    try {
      const res = await fetch(`/api/user?address=${encodeURIComponent(address)}`);
      const json = await res.json();
      setUser(json.data ?? null);
    } catch {
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  }, [address]);

  const fetchScore = useCallback(async () => {
    if (!address) {
      setScoreBreakdown(null);
      return;
    }
    setScoreLoading(true);
    try {
      const res = await fetch(`/api/user/score?address=${encodeURIComponent(address)}`);
      const json = await res.json();
      if (json.data?.breakdown) setScoreBreakdown(json.data.breakdown);
      else setScoreBreakdown(null);
    } catch {
      setScoreBreakdown(null);
    } finally {
      setScoreLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTreasury();
    const t = setInterval(fetchTreasury, TREASURY_POLL_MS);
    return () => clearInterval(t);
  }, [fetchTreasury]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Handle GitHub OAuth callback: hash contains provider_token (Supabase reserves state)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const { provider_token } = parseSupabaseHash(hash);
    if (provider_token) setPendingLink({ providerToken: provider_token });
  }, []);

  useEffect(() => {
    if (user?.github_id) fetchScore();
    else setScoreBreakdown(null);
  }, [user?.github_id, fetchScore]);

  const showGitHubBanner = Boolean(isConnected && address && !user?.github_id);
  const nextEligibleAt = user ? getNextEligibleAt(user.last_claim_at) : null;
  const claimAmount = user?.status === "active" ? getClaimAmountEth(user.sybil_score) : null;
  const hasCooldown = Boolean(user?.last_claim_at && nextEligibleAt && new Date(nextEligibleAt) > new Date());
  const canClaim = Boolean(
    isConnected && address && user?.github_id && user?.status === "active" && !hasCooldown && claimAmount,
  );

  const handleGitHubConnect = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    const redirectTo = `${baseUrl.replace(/\/$/, "")}/faucet`;
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=github&redirect_to=${encodeURIComponent(
            redirectTo,
          )}`
        : null;
    if (url) window.location.href = url;
    else if (typeof window !== "undefined") window.alert("GitHub OAuth is not configured.");
  };

  const clearHashAndPendingLink = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    setPendingLink(null);
  }, []);

  const handleLinkSuccess = useCallback(() => {
    clearHashAndPendingLink();
    fetchUser();
  }, [clearHashAndPendingLink, fetchUser]);

  const handleClaimSuccess = () => {
    fetchUser();
  };

  return (
    <div className="min-h-[80vh] bg-base-200">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-base-100 border border-zinc-200 dark:border-base-300">
              <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-base-content">Pipette</h1>
              <p className="text-sm text-zinc-500 dark:text-base-content/70">Base Sepolia developer faucet</p>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-base-300 bg-base-100 px-4 py-2.5">
            <p className="text-xs text-zinc-500 dark:text-base-content/70 uppercase tracking-wider">Treasury</p>
            <p className="text-lg font-semibold text-zinc-900 dark:text-base-content tabular-nums">
              {treasuryBalance != null ? `${Number(treasuryBalance).toFixed(4)} ETH` : "—"}
            </p>
          </div>
        </header>

        <FaucetSteps
          walletConnected={Boolean(isConnected && address)}
          githubLinked={Boolean(user?.github_id)}
          canClaim={Boolean(canClaim)}
        />

        {/* GitHub OAuth callback: sign to complete linking (Ethereum sign-in); uses currently connected wallet */}
        {pendingLink && address && (
          <div className="mb-6">
            <GitHubLinkSignCard
              walletAddress={address}
              githubAccessToken={pendingLink.providerToken}
              onSuccess={handleLinkSuccess}
              onCancel={clearHashAndPendingLink}
            />
          </div>
        )}

        {/* GitHub banner: show when wallet connected but GitHub not linked and no pending callback */}
        {showGitHubBanner && !pendingLink && (
          <div className="mb-6">
            <GitHubConnectBanner onConnect={handleGitHubConnect} loading={false} />
          </div>
        )}

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          <FaucetCard />
          <StatusCard user={user} loading={userLoading && !user} />
        </div>

        {/* Score (after GitHub linked) */}
        {(user?.github_id || scoreBreakdown) && (
          <div className="mt-6">
            <AntiSybilScore breakdown={scoreBreakdown} loading={user?.github_id ? scoreLoading : false} />
          </div>
        )}

        {/* Claim section */}
        <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-base-300">
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-sm text-zinc-600 dark:text-base-content/80 text-center max-w-md">
              Ethereum sign-in: sign a message to prove wallet ownership. No gas, no transaction. Secure and free.
            </p>
            <ClaimButton
              user={user ?? null}
              userLoading={userLoading}
              nextEligibleAt={nextEligibleAt}
              claimAmount={claimAmount}
              onClaimSuccess={handleClaimSuccess}
              onConnectGitHub={handleGitHubConnect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
