#!/usr/bin/env npx tsx
import { requestFaucetFunds } from "../services/refillService";

async function main() {
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    console.error("TREASURY_ADDRESS is not set");
    process.exit(1);
  }

  console.log("[refill] Requesting CDP faucet funds for", treasuryAddress);

  const result = await requestFaucetFunds(treasuryAddress);

  if (result.ok) {
    console.log(
      `[refill] Success. Claims: ${result.claims}${result.limitReached ? " (CDP 24h limit reached)" : ""}`,
    );
    for (const hash of result.transactionHashes) {
      console.log("[refill] tx:", `https://sepolia.basescan.org/tx/${hash}`);
    }
    process.exit(0);
  }

  console.error("[refill] Failed:", result.error, result.code ? `(${result.code})` : "");
  if (result.claims && result.claims > 0) {
    console.error("[refill] Partial claims before failure:", result.claims);
  }
  process.exit(1);
}

main();
