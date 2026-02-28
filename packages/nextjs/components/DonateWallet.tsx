"use client";

import { Check, Copy } from "lucide-react";
import { useCopyToClipboard } from "~~/hooks/scaffold-eth";

const DONATE_ADDRESS = "0x0dfDb5bBaEeCE3871f826DF1C6Fe24a2772f5d38";
const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";

export function DonateWallet() {
  const { copyToClipboard, isCopiedToClipboard } = useCopyToClipboard();

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <p className="text-xs text-base-content/60 text-center max-w-sm">
        If you can spare some testnet ETH, a small donation helps keep the faucet running.
      </p>
      <div className="flex items-center gap-2">
        <a
          href={`${BASE_SEPOLIA_EXPLORER}/address/${DONATE_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-base-content/80 hover:text-primary link"
        >
          {DONATE_ADDRESS.slice(0, 6)}…{DONATE_ADDRESS.slice(-4)}
        </a>
        <button
          type="button"
          onClick={() => copyToClipboard(DONATE_ADDRESS)}
          className="btn btn-ghost btn-xs p-1 min-h-0 h-auto"
          aria-label="Copy address"
        >
          {isCopiedToClipboard ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-base-content/60" />
          )}
        </button>
      </div>
    </div>
  );
}
