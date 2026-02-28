#!/usr/bin/env npx tsx
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
