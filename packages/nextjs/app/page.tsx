"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ArrowRight, Droplets } from "lucide-react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <>
      {/* Hero: full-bleed block with clear hierarchy and one primary CTA */}
      <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center px-5 py-16 overflow-hidden">
        {/* Hero background: soft gradient so the block feels distinct in both themes */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, var(--color-base-200) 0%, var(--color-base-300) 100%)",
          }}
        />
        {/* Optional: very subtle droplet shape for depth (theme-aware) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] -z-10"
          style={{ background: "var(--color-primary)" }}
        />

        <div className="text-center max-w-2xl mx-auto">
          {/* Small tagline above headline */}
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-base-content/60 mb-4 font-medium">
            <Droplets className="h-3.5 w-3.5" />
            Base Sepolia developer faucet
          </p>

          {/* Main headline with accent on key word */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-base-content mb-5 leading-[1.1]">
            Testnet ETH for{" "}
            <span className="text-primary">Builders</span>
          </h1>

          {/* Single descriptive line */}
          <p className="text-lg text-base-content/80 max-w-xl mx-auto leading-relaxed mb-10">
            Request Base Sepolia ETH in one flow. Connect your wallet, link GitHub, and claim — no mainnet gas required.
          </p>

          {/* Primary CTA: one clear action */}
          <Link
            href="/faucet"
            className="btn btn-primary btn-lg rounded-2xl gap-2 shadow-lg hover:shadow-xl transition-all duration-200 normal-case font-semibold text-base"
          >
            Get testnet ETH
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Connected address: subtle, below CTA */}
          {connectedAddress && (
            <div className="mt-8 pt-8 border-t border-base-content/10">
              <p className="text-xs uppercase tracking-wider text-base-content/50 mb-2">
                Connected
              </p>
              <Address
                address={connectedAddress}
                chain={targetNetwork}
                blockExplorerAddressLink={
                  targetNetwork.id === hardhat.id
                    ? `/blockexplorer/address/${connectedAddress}`
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* Secondary links: minimal strip so Debug / Explorer stay available */}
      <section className="w-full px-5 py-8 bg-base-300/50">
        <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-base-content/70">
          <Link href="/debug" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <BugAntIcon className="h-4 w-4" />
            Debug Contracts
          </Link>
          <span className="text-base-content/30" aria-hidden>
            ·
          </span>
          <Link href="/blockexplorer" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Block Explorer
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
