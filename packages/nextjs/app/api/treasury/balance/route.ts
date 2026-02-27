import { NextResponse } from "next/server";
import { formatEther } from "viem";
import { getTreasuryBalance } from "~~/services/treasuryService";

export async function GET() {
  try {
    const balanceWei = await getTreasuryBalance();
    const balanceEth = formatEther(balanceWei);
    return NextResponse.json({ data: { balanceEth }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "FETCH_FAILED" }, { status: 500 });
  }
}
