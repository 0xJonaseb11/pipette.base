import React from "react";
import Link from "next/link";
import { DonateWallet } from "~~/components/DonateWallet";

const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";
const REPO_URL = "https://github.com/0xjonaseb11/pipette.base";
const BUILDER_GITHUB_URL = "https://github.com/0xJonaseb11";
const TELEGRAM_URL = "https://t.me/OxJonaseb11";
const STATUS_PAGE_URL = process.env.NEXT_PUBLIC_STATUS_PAGE_URL;

export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div className="w-full flex flex-col items-center gap-4">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full flex-wrap">
            <Link href="/faucet" className="link">
              Faucet
            </Link>
            <span className="text-base-content/40" aria-hidden>
              ·
            </span>
            <a href={BASE_SEPOLIA_EXPLORER} target="_blank" rel="noreferrer" className="link">
              Base Sepolia Explorer
            </a>
            <span className="text-base-content/40" aria-hidden>
              ·
            </span>
            <Link href="/policy" className="link">
              Policy
            </Link>
            <span className="text-base-content/40" aria-hidden>
              ·
            </span>
            <Link href="/privacy" className="link">
              Privacy
            </Link>
            <span className="text-base-content/40" aria-hidden>
              ·
            </span>
            <Link href="/support" className="link">
              Support
            </Link>
            {STATUS_PAGE_URL && (
              <>
                <span className="text-base-content/40" aria-hidden>
                  ·
                </span>
                <Link href="/status" className="link">
                  Status
                </Link>
              </>
            )}
          </div>
        </ul>

        <div className="flex justify-center items-center gap-2 text-sm w-full flex-wrap pt-4 mt-2 border-t border-base-300/60">
          <Link href={TELEGRAM_URL} target="_blank" rel="noreferrer" className="link">
            Need quick support?
          </Link>
          <span className="text-base-content/40" aria-hidden>
            ·
          </span>
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="link">
            Star on GitHub
          </a>
          <span className="text-base-content/40" aria-hidden>
            ·
          </span>
          <span className="text-base-content/80">
            Built with 💙 by {" "} 
            <a href={BUILDER_GITHUB_URL} target="_blank" rel="noreferrer" className="link">
              Jonas Sebera
            </a>
          </span>
        </div>

        <DonateWallet />
      </div>
    </div>
  );
};
