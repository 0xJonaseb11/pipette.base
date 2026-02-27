import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildClaimMessage } from "~~/utils/claimMessage";

export async function GET() {
  const nonce = randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const message = buildClaimMessage(nonce, timestamp);
  return NextResponse.json({ data: { nonce, message }, error: null });
}
