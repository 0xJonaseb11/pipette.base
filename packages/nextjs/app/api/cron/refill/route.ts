import { NextRequest, NextResponse } from "next/server";
import { requestFaucetFunds } from "~~/services/refillService";

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
      transactionHash: result.transactionHash,
    });
  }

  const status = result.code === "faucet_limit_exceeded" ? 429 : result.code === "MISSING_CREDENTIALS" ? 500 : 502;
  return NextResponse.json({ ok: false, error: result.error, code: result.code }, { status });
}
