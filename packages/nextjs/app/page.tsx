"use client";

import Link from "next/link";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Droplets } from "lucide-react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 text-center max-w-xl mx-auto">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Pipette</span>
          </h1>
          <p className="text-base-content/80 text-lg mt-2">
            Base Sepolia developer faucet. Get testnet ETH for building.
          </p>
          {connectedAddress && (
            <div className="flex justify-center items-center flex-col mt-6">
              <p className="text-sm font-medium opacity-80">Connected</p>
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

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-8 flex-col md:flex-row max-w-4xl mx-auto">
            <Link
              href="/faucet"
              className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-md hover:shadow-lg transition-shadow border border-base-200"
            >
              <Droplets className="h-10 w-10 text-primary mb-3" />
              <h2 className="font-semibold text-lg mb-1">Faucet</h2>
              <p className="text-sm opacity-80">
                Request Base Sepolia ETH. Connect your wallet and link GitHub to claim.
              </p>
            </Link>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-md border border-base-200">
              <BugAntIcon className="h-10 w-10 fill-secondary mb-3" />
              <h2 className="font-semibold text-lg mb-1">Debug Contracts</h2>
              <p className="text-sm opacity-80 mb-3">
                Tinker with your smart contract.
              </p>
              <Link href="/debug" className="link text-sm">
                Open Debug
              </Link>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl shadow-md border border-base-200">
              <MagnifyingGlassIcon className="h-10 w-10 fill-secondary mb-3" />
              <h2 className="font-semibold text-lg mb-1">Block Explorer</h2>
              <p className="text-sm opacity-80 mb-3">
                Explore local transactions.
              </p>
              <Link href="/blockexplorer" className="link text-sm">
                Open Explorer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
