export const CLAIM_MESSAGE_PREFIX = "Pipette faucet claim\nNonce: ";
const MESSAGE_MAX_AGE_MS = 5 * 60 * 1000;

export function isClaimMessageValid(message: string): {
  valid: boolean;
  timestamp?: number;
} {
  const prefix = CLAIM_MESSAGE_PREFIX;
  if (!message.startsWith(prefix)) return { valid: false };
  const rest = message.slice(prefix.length);
  const tsMatch = rest.match(/^[a-f0-9]{32}\nTimestamp: (\d+)$/);
  if (!tsMatch) return { valid: false };
  const timestamp = parseInt(tsMatch[1], 10);
  if (Date.now() - timestamp > MESSAGE_MAX_AGE_MS) return { valid: false };
  return { valid: true, timestamp };
}

export function buildClaimMessage(nonce: string, timestamp: number): string {
  return `${CLAIM_MESSAGE_PREFIX}${nonce}\nTimestamp: ${timestamp}`;
}
