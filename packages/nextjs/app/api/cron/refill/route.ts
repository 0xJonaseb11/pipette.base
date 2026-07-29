import { NextRequest, NextResponse } from "next/server";
import { requestFaucetFunds } from "~~/services/refillService";

/** Allow long runs so a daily cron can drain CDP's 24h ETH faucet allowance. */
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    return NextResponse.json({ error: "TREASURY_ADDRESS not configured" }, { status: 500 });
  }

  const result = await requestFaucetFunds(treasuryAddress);

  if (result.ok) {
    return NextResponse.json({
      ok: true,
      claims: result.claims,
      limitReached: result.limitReached,
      transactionHashes: result.transactionHashes,
      /** First hash kept for backwards-compatible clients/logs */
      transactionHash: result.transactionHashes[0],
    });
  }

  const status =
    result.code === "faucet_limit_exceeded" || result.code === "rate_limit_exceeded"
      ? 429
      : result.code === "MISSING_CREDENTIALS"
        ? 500
        : 502;

  return NextResponse.json(
    {
      ok: false,
      error: result.error,
      code: result.code,
      claims: result.claims ?? 0,
      transactionHashes: result.transactionHashes ?? [],
    },
    { status },
  );
}
