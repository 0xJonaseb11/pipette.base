#!/usr/bin/env npx tsx

/**
 * Treasury refill script – requests Base Sepolia ETH from CDP Faucet to TREASURY_ADDRESS.
 * Safe to run via cron every 24 hours (CDP rate limit: 0.1 ETH per 24h per address).
 *
 * Required env: CDP_API_KEY_ID, CDP_API_KEY_SECRET, TREASURY_ADDRESS
 * Optional: load from .env.local with `dotenv -e .env.local -- npx tsx scripts/refillTreasury.ts`
 *
 * Usage:
 *   cd packages/nextjs && npx tsx scripts/refillTreasury.ts
 */
import { requestFaucetFunds } from "../services/refillService";

async function main() {
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    console.error("TREASURY_ADDRESS is not set");
    process.exit(1);
  }

  console.log("[refill] Requesting faucet funds for", treasuryAddress);

  const result = await requestFaucetFunds(treasuryAddress);

  if (result.ok) {
    console.log("[refill] Success. Transaction hash:", result.transactionHash);
    process.exit(0);
  }

  console.error("[refill] Failed:", result.error, result.code ? `(${result.code})` : "");
  process.exit(1);
}

main();
