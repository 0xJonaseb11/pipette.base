"use client";

import { useState } from "react";
import { AlertCircle, ArrowDownToLine, CheckCircle, Clock, Github, Loader2, ShieldOff, Wallet } from "lucide-react";
import { useAccount, useSignMessage } from "wagmi";
import type { User } from "~~/types";

type ClaimState =
  | "idle"
  | "loading"
  | "not_connected"
  | "github_not_linked"
  | "pending"
  | "blocked"
  | "cooldown"
  | "ready"
  | "submitting"
  | "success"
  | "error";

type Props = {
  user: User | null;
  userLoading: boolean;
  nextEligibleAt?: string | null;
  claimAmount?: string | null;
  onClaimSuccess?: () => void;
  onConnectGitHub?: () => void;
};

export function ClaimButton({
  user,
  userLoading,
  nextEligibleAt,
  claimAmount,
  onClaimSuccess,
  onConnectGitHub,
}: Props) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [state, setState] = useState<ClaimState>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const loading = userLoading || state === "loading";
  const isPending = user?.status === "pending";
  const isBlocked = user?.status === "blocked";
  const hasCooldown = user?.last_claim_at && nextEligibleAt && new Date(nextEligibleAt) > new Date();
  const canClaim =
    isConnected && address && user?.github_id && user?.status === "active" && !hasCooldown && claimAmount;

  const derivedState: ClaimState = (() => {
    if (loading) return "loading";
    if (state === "submitting" || state === "success" || state === "error") return state;
    if (!isConnected || !address) return "not_connected";
    if (!user?.github_id) return "github_not_linked";
    if (isBlocked) return "blocked";
    if (isPending) return "pending";
    if (hasCooldown) return "cooldown";
    if (canClaim) return "ready";
    return "idle";
  })();

  const handleClaim = async () => {
    if (!address || derivedState !== "ready") return;
    setState("submitting");
    setErrorCode(null);
    try {
      const nonceRes = await fetch("/api/nonce");
      const { data: nonceData } = await nonceRes.json();
      if (!nonceData?.message) throw new Error("Failed to get nonce");
      const message = nonceData.message as string;

      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
        }),
      });
      const json = await res.json();

      if (json.error) {
        setErrorCode(json.error);
        setState("error");
        return;
      }
      setTxHash(json.data?.txHash ?? null);
      setState("success");
      onClaimSuccess?.();
    } catch {
      setErrorCode("CLAIM_FAILED");
      setState("error");
    }
  };

  if (derivedState === "loading") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-48 rounded-xl bg-zinc-200 dark:bg-base-300 animate-pulse" />
      </div>
    );
  }

  const buttonConfig: Record<
    Exclude<ClaimState, "loading">,
    { label: string; icon: React.ReactNode; disabled: boolean }
  > = {
    not_connected: {
      label: "Connect Wallet",
      icon: <Wallet className="h-4 w-4" />,
      disabled: true,
    },
    github_not_linked: {
      label: "Connect GitHub First",
      icon: <Github className="h-4 w-4" />,
      disabled: !onConnectGitHub,
    },
    pending: {
      label: "Awaiting Approval",
      icon: <Clock className="h-4 w-4" />,
      disabled: true,
    },
    blocked: {
      label: "Account Restricted",
      icon: <ShieldOff className="h-4 w-4" />,
      disabled: true,
    },
    cooldown: {
      label: `Claim in ${nextEligibleAt ? new Date(nextEligibleAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "…"}`,
      icon: <Clock className="h-4 w-4" />,
      disabled: true,
    },
    ready: {
      label: `Claim ${claimAmount ?? "0"} ETH`,
      icon: <ArrowDownToLine className="h-4 w-4" />,
      disabled: false,
    },
    submitting: {
      label: "Sending…",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      disabled: true,
    },
    success: {
      label: "Claimed, view tx",
      icon: <CheckCircle className="h-4 w-4" />,
      disabled: false,
    },
    error: {
      label: "Retry",
      icon: <AlertCircle className="h-4 w-4" />,
      disabled: false,
    },
    idle: {
      label: "Claim",
      icon: <ArrowDownToLine className="h-4 w-4" />,
      disabled: true,
    },
  };

  const config = buttonConfig[derivedState];
  const isSuccess = derivedState === "success";
  const isError = derivedState === "error";

  return (
    <div className="flex flex-col items-center gap-3">
      {isSuccess && txHash ? (
        <a
          href={`https://sepolia.basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-emerald-500 hover:bg-emerald-600 text-white min-w-[200px] transition-colors"
        >
          {config.icon}
          {config.label}
        </a>
      ) : (
        <button
          type="button"
          onClick={
            derivedState === "ready" || derivedState === "error"
              ? handleClaim
              : derivedState === "github_not_linked" && onConnectGitHub
                ? onConnectGitHub
                : undefined
          }
          disabled={config.disabled}
          className={`
            inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm
            transition-colors min-w-[200px]
            ${isError ? "bg-zinc-200 dark:bg-base-300 text-zinc-900 dark:text-base-content hover:bg-zinc-300 dark:hover:bg-base-300/90" : ""}
            ${derivedState === "ready" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
            ${!isError && derivedState !== "ready" && derivedState !== "github_not_linked"
              ? "bg-zinc-200 dark:bg-base-300 text-zinc-500 dark:text-base-content/70 cursor-not-allowed"
              : ""}
            ${derivedState === "github_not_linked" && onConnectGitHub
              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              : ""}
          `}
        >
          {config.icon}
          {config.label}
        </button>
      )}
      {errorCode && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errorCode === "GITHUB_NOT_LINKED" && "Link your GitHub account first."}
          {errorCode === "PENDING_REVIEW" && "Your account is pending admin approval."}
          {errorCode === "BLOCKED" && "Your account is restricted."}
          {errorCode === "COOLDOWN" && "Wait until your next eligible time."}
          {errorCode === "RATE_LIMIT" && "Too many requests. Try again in a minute."}
          {errorCode === "TREASURY_NOT_CONFIGURED" &&
            "Treasury is not configured. The deploy needs TREASURY_PRIVATE_KEY (and TREASURY_ADDRESS) set."}
          {errorCode === "INSUFFICIENT_TREASURY" &&
            "Treasury is low. Please wait for our next refill or consider donating testnet ETH to help."}
          {errorCode === "DAILY_CAP_REACHED" && "Daily distribution cap reached. Try again tomorrow."}
          {errorCode === "CLAIM_FAILED" && "Claim failed. Please try again."}
          {!["GITHUB_NOT_LINKED", "PENDING_REVIEW", "BLOCKED", "COOLDOWN", "RATE_LIMIT", "TREASURY_NOT_CONFIGURED", "INSUFFICIENT_TREASURY", "DAILY_CAP_REACHED", "CLAIM_FAILED"].includes(
            errorCode,
          ) && `Error: ${errorCode}`}
        </p>
      )}
    </div>
  );
}
