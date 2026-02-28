import React from "react";
import Link from "next/link";
import { SwitchTheme } from "~~/components/SwitchTheme";

const BASE_SEPOLIA_EXPLORER = "https://sepolia.basescan.org";
const STATUS_PAGE_URL = process.env.NEXT_PUBLIC_STATUS_PAGE_URL;

export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div>
        <div className="fixed flex justify-end items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <SwitchTheme className="pointer-events-auto" />
        </div>
      </div>
      <div className="w-full">
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
      </div>
    </div>
  );
};
