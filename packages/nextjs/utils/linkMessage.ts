/**
 * Message format for "link GitHub to wallet" – same structure as claim (nonce + timestamp)
 * so wallet signing is consistent across the app (Ethereum sign-in).
 */
export const LINK_MESSAGE_PREFIX = "Pipette link GitHub to wallet\nNonce: ";
const MESSAGE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes (user may be slow after OAuth redirect)

export function isLinkMessageValid(message: string): { valid: boolean; timestamp?: number } {
  const prefix = LINK_MESSAGE_PREFIX;
  if (!message.startsWith(prefix)) return { valid: false };
  const rest = message.slice(prefix.length);
  const tsMatch = rest.match(/^[a-f0-9]{32}\nTimestamp: (\d+)$/);
  if (!tsMatch) return { valid: false };
  const timestamp = parseInt(tsMatch[1], 10);
  if (Date.now() - timestamp > MESSAGE_MAX_AGE_MS) return { valid: false };
  return { valid: true, timestamp };
}

export function buildLinkMessage(nonce: string, timestamp: number): string {
  return `${LINK_MESSAGE_PREFIX}${nonce}\nTimestamp: ${timestamp}`;
}
