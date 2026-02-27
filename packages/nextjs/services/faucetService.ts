"use server";

import type { Address } from "viem";
import { formatEther, parseEther } from "viem";
import { getClaimAmount } from "~~/services/antiSybilService";
import { getDailyClaimTotal, recordClaim } from "~~/services/supabaseService";
import { getTreasuryBalance, sendFromTreasury } from "~~/services/treasuryService";
import type { User } from "~~/types";

const DAILY_DISTRIBUTION_CAP_ETH = Number(process.env.DAILY_DISTRIBUTION_CAP_ETH ?? "1.0");
const TREASURY_RESERVE_BUFFER = Number(process.env.TREASURY_RESERVE_BUFFER ?? "10");
const CLAIM_COOLDOWN_HOURS = Number(process.env.CLAIM_COOLDOWN_HOURS ?? "24");

export class FaucetError extends Error {
  constructor(
    message: string,
    public readonly code: "PENDING_REVIEW" | "BLOCKED" | "COOLDOWN" | "INSUFFICIENT_TREASURY" | "DAILY_CAP_REACHED",
  ) {
    super(message);
    this.name = "FaucetError";
  }
}

export type ClaimEvaluation =
  | {
      ok: true;
      amountWei: bigint;
      nextEligibleAt: Date;
    }
  | {
      ok: false;
      reason: FaucetError;
      nextEligibleAt?: Date;
    };

function getNextEligibleAt(lastClaimAt: string | null): Date {
  const base = lastClaimAt ? new Date(lastClaimAt) : new Date();
  const next = new Date(base);
  next.setHours(next.getHours() + CLAIM_COOLDOWN_HOURS);
  return next;
}

export async function evaluateClaim(user: User): Promise<ClaimEvaluation> {
  if (user.status === "blocked") {
    return {
      ok: false,
      reason: new FaucetError("User is blocked", "BLOCKED"),
    };
  }

  if (user.status === "pending") {
    return {
      ok: false,
      reason: new FaucetError("User is pending admin review", "PENDING_REVIEW"),
    };
  }

  const claimAmountWei = getClaimAmount(user.sybil_score);
  if (claimAmountWei === 0n) {
    return {
      ok: false,
      reason: new FaucetError("User is not eligible for a claim at this time", "PENDING_REVIEW"),
    };
  }

  const now = new Date();
  if (user.last_claim_at) {
    const nextEligibleAt = getNextEligibleAt(user.last_claim_at);
    if (now < nextEligibleAt) {
      return {
        ok: false,
        reason: new FaucetError("User is still in cooldown period", "COOLDOWN"),
        nextEligibleAt,
      };
    }
  }

  const [treasuryBalanceWei, dailyTotalEth] = await Promise.all([getTreasuryBalance(), getDailyClaimTotal()]);

  const claimAmountEth = Number(formatEther(claimAmountWei));
  const treasuryBalanceEth = Number(formatEther(treasuryBalanceWei));

  if (treasuryBalanceEth < claimAmountEth * TREASURY_RESERVE_BUFFER) {
    return {
      ok: false,
      reason: new FaucetError("Treasury reserve buffer would be violated", "INSUFFICIENT_TREASURY"),
    };
  }

  if (dailyTotalEth + claimAmountEth > DAILY_DISTRIBUTION_CAP_ETH) {
    return {
      ok: false,
      reason: new FaucetError("Daily distribution cap reached", "DAILY_CAP_REACHED"),
    };
  }

  const nextEligibleAt = getNextEligibleAt(user.last_claim_at);

  return {
    ok: true,
    amountWei: claimAmountWei,
    nextEligibleAt,
  };
}

export async function executeClaim(
  user: User,
  walletAddress: Address,
): Promise<{
  txHash: string;
  amount: string;
  nextEligibleAt: string;
}> {
  const evaluation = await evaluateClaim(user);

  if (!evaluation.ok) {
    throw evaluation.reason;
  }

  const txHash = await sendFromTreasury(walletAddress, evaluation.amountWei);

  const amountEthString = formatEther(evaluation.amountWei);

  await recordClaim(walletAddress, amountEthString, txHash);

  return {
    txHash,
    amount: amountEthString,
    nextEligibleAt: evaluation.nextEligibleAt.toISOString(),
  };
}
