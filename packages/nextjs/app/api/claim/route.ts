import { NextRequest, NextResponse } from "next/server";
import { type Address, isAddress, recoverMessageAddress } from "viem";
import { FaucetError, executeClaim } from "~~/services/faucetService";
import { createUserIfNotExists, getUserByWallet } from "~~/services/supabaseService";
import { isClaimMessageValid } from "~~/utils/claimMessage";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const store: { key: string; timestamps: number[] }[] = [];

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cut = now - RATE_LIMIT_WINDOW_MS;
  let entry = store.find(e => e.key === ip);
  if (!entry) {
    entry = { key: ip, timestamps: [] };
    store.push(entry);
  }
  entry.timestamps = entry.timestamps.filter(t => t > cut);
  if (entry.timestamps.length >= RATE_LIMIT_MAX) return true;
  entry.timestamps.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.TREASURY_PRIVATE_KEY) {
      return NextResponse.json({ data: null, error: "TREASURY_NOT_CONFIGURED" }, { status: 503 });
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ data: null, error: "RATE_LIMIT" }, { status: 429 });
    }

    const body = await req.json();
    const { walletAddress, signature, message } = body as {
      walletAddress?: string;
      signature?: string;
      message?: string;
    };

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_ADDRESS" }, { status: 400 });
    }
    if (!signature || typeof signature !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_SIGNATURE" }, { status: 400 });
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ data: null, error: "INVALID_MESSAGE" }, { status: 400 });
    }

    if (!isAddress(walletAddress)) {
      return NextResponse.json({ data: null, error: "INVALID_ADDRESS" }, { status: 400 });
    }

    const msgCheck = isClaimMessageValid(message);
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

    let user = await getUserByWallet(walletAddress);
    if (!user) {
      user = await createUserIfNotExists(walletAddress);
      return NextResponse.json({ data: null, error: "GITHUB_NOT_LINKED" }, { status: 403 });
    }

    if (!user.github_id) {
      return NextResponse.json({ data: null, error: "GITHUB_NOT_LINKED" }, { status: 403 });
    }

    if (user.status === "pending" || user.status === "blocked") {
      return NextResponse.json(
        { data: null, error: user.status === "blocked" ? "BLOCKED" : "PENDING_REVIEW" },
        { status: 403 },
      );
    }

    const result = await executeClaim(user, walletAddress as Address);
    return NextResponse.json({ data: result, error: null });
  } catch (err) {
    if (err instanceof FaucetError) {
      const code = err.code;
      const status = code === "COOLDOWN" ? 429 : 403;
      return NextResponse.json({ data: null, error: code }, { status });
    }
    return NextResponse.json({ data: null, error: "CLAIM_FAILED" }, { status: 500 });
  }
}
