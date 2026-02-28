import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildClaimMessage } from "~~/utils/claimMessage";
import { buildLinkMessage } from "~~/utils/linkMessage";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "claim";
  const nonce = randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const message = type === "link" ? buildLinkMessage(nonce, timestamp) : buildClaimMessage(nonce, timestamp);
  return NextResponse.json({ data: { nonce, message }, error: null });
}
