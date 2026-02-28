"use client";

import { Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { useSignMessage } from "wagmi";

type Props = {
  walletAddress: string;
  githubAccessToken: string;
  onSuccess: () => void;
  onCancel: () => void;
};

/**
 * Shown after GitHub OAuth redirect when hash contains provider_token and state.
 * User signs a message (Ethereum sign-in) to prove wallet ownership; we then link GitHub to that wallet.
 */
export function GitHubLinkSignCard({ walletAddress, githubAccessToken, onSuccess, onCancel }: Props) {
  const { signMessageAsync } = useSignMessage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    setLoading(true);
    setError(null);
    try {
      const nonceRes = await fetch("/api/nonce?type=link");
      const { data: nonceData } = await nonceRes.json();
      if (!nonceData?.message) throw new Error("Failed to get nonce");
      const message = nonceData.message as string;

      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/user/link-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
          githubAccessToken,
        }),
      });
      const json = await res.json();

      if (json.error) {
        setError(json.error === "INVALID_SIGNATURE" ? "Signature failed. Please try again." : json.error);
        return;
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Linking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-6 space-y-4">
      <div className="flex items-center gap-2 text-base-content/80">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">Prove wallet ownership</span>
      </div>
      <p className="text-sm text-base-content/80">
        You returned from GitHub. Sign the message below to link your GitHub account to this wallet. No gas required.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSign}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Linking…" : "Sign to link GitHub"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-base-200 hover:bg-base-300 text-base-content font-medium text-sm disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
