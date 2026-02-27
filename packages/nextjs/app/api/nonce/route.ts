import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const CLAIM_MESSAGE_PREFIX = "Pipette faucet claim\nNonce: ";
const MESSAGE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const nonce = randomBytes(16).toString("hex");
  const timestamp = Date.now();
  const message = `${CLAIM_MESSAGE_PREFIX}${nonce}\nTimestamp: ${timestamp}`;
  return NextResponse.json({ data: { nonce, message }, error: null });
}

export function getClaimMessagePrefix(): string {
  return CLAIM_MESSAGE_PREFIX;
}

export function isClaimMessageValid(message: string): { valid: boolean; timestamp?: number } {
  const prefix = CLAIM_MESSAGE_PREFIX;
  if (!message.startsWith(prefix)) return { valid: false };
  const rest = message.slice(prefix.length);
  const tsMatch = rest.match(/^[a-f0-9]{32}\nTimestamp: (\d+)$/);
  if (!tsMatch) return { valid: false };
  const timestamp = parseInt(tsMatch[1], 10);
  if (Date.now() - timestamp > MESSAGE_MAX_AGE_MS) return { valid: false };
  return { valid: true, timestamp };
}
