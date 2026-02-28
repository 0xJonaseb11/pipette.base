import { NextRequest, NextResponse } from "next/server";
import { isAddress, recoverMessageAddress } from "viem";
import { computeSybilScore, getStatusFromScore } from "~~/services/antiSybilService";
import { fetchGitHubProfile } from "~~/services/githubService";
import {
  createUserIfNotExists,
  getUserByWallet,
  linkGitHub,
  updateSybilScore,
  updateUserStatus,
} from "~~/services/supabaseService";
import { isLinkMessageValid } from "~~/utils/linkMessage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, signature, message, githubAccessToken } = body as {
      walletAddress?: string;
      signature?: string;
      message?: string;
      githubAccessToken?: string;
    };

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_ADDRESS" }, { status: 400 });
    }
    if (!isAddress(walletAddress)) {
      return NextResponse.json({ data: null, error: "INVALID_ADDRESS" }, { status: 400 });
    }
    if (!signature || typeof signature !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_SIGNATURE" }, { status: 400 });
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_MESSAGE" }, { status: 400 });
    }
    if (!githubAccessToken || typeof githubAccessToken !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_GITHUB_TOKEN" }, { status: 400 });
    }

    const msgCheck = isLinkMessageValid(message);
    if (!msgCheck.valid) {
      return NextResponse.json({ data: null, error: "INVALID_MESSAGE" }, { status: 400 });
    }

    let signer: string;
    try {
      signer = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
    } catch {
      return NextResponse.json({ data: null, error: "INVALID_SIGNATURE" }, { status: 400 });
    }

    if (signer.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json({ data: null, error: "INVALID_SIGNATURE" }, { status: 400 });
    }

    const profile = await fetchGitHubProfile(githubAccessToken);

    let user = await getUserByWallet(walletAddress);
    if (!user) {
      user = await createUserIfNotExists(walletAddress);
    }

    await linkGitHub(walletAddress, profile);

    const { score } = await computeSybilScore(profile, walletAddress as `0x${string}`);
    await updateSybilScore(walletAddress, score);
    const status = getStatusFromScore(score);
    await updateUserStatus(walletAddress, status);

    return NextResponse.json({
      data: { linked: true, sybil_score: score, status },
      error: null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ data: null, error: "LINK_FAILED", details: message }, { status: 500 });
  }
}
