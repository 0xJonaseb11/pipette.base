import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getUserByWallet } from "~~/services/supabaseService";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ data: null, error: "INVALID_ADDRESS" }, { status: 400 });
  }

  try {
    const user = await getUserByWallet(address);
    return NextResponse.json({ data: user, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "FETCH_FAILED" }, { status: 500 });
  }
}
