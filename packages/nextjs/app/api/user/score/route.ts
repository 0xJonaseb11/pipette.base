import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { computeSybilScore } from "~~/services/antiSybilService";
import { getUserByWallet } from "~~/services/supabaseService";
import type { GitHubProfile } from "~~/types";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return NextResponse.json({ data: null, error: "INVALID_ADDRESS" }, { status: 400 });
  }

  try {
    const user = await getUserByWallet(address);
    if (!user?.github_id) {
      return NextResponse.json({ data: { score: 0, breakdown: null }, error: null });
    }

    const profile: GitHubProfile = {
      github_id: user.github_id,
      login: user.github_login ?? "",
      account_age_days: user.github_account_age_days ?? 0,
      public_repos: user.github_public_repos ?? 0,
      followers: user.github_followers ?? 0,
      following: 0,
      has_email: false,
    };

    const { score, breakdown } = await computeSybilScore(profile, address as `0x${string}`);
    return NextResponse.json({ data: { score, breakdown }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "FETCH_FAILED" }, { status: 500 });
  }
}
