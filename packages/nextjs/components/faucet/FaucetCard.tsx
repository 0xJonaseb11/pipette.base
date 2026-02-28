"use client";

import { Address } from "@scaffold-ui/components";
import { Wallet } from "lucide-react";
import { baseSepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { CardSkeleton } from "~~/components/skeletons/CardSkeleton";

export function FaucetCard() {
  const { address, isConnected } = useAccount();

  if (isConnected === undefined) {
    return <CardSkeleton />;
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-base-300 bg-base-100 p-6">
      <div className="flex items-center gap-2 text-zinc-600 dark:text-base-content/80 mb-3">
        <Wallet className="h-4 w-4" />
        <span className="text-sm font-medium">Wallet</span>
      </div>
      {isConnected && address ? (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 dark:text-base-content/60 uppercase tracking-wider">Connected</p>
          <Address
            address={address}
            chain={baseSepolia}
            blockExplorerAddressLink={`https://sepolia.basescan.org/address/${address}`}
          />
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-zinc-600 dark:text-base-content/80">Connect your wallet to request testnet ETH.</p>
          <RainbowKitCustomConnectButton />
        </div>
      )}
    </div>
  );
}
