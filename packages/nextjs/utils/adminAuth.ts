import { type Address, isAddress, recoverMessageAddress } from "viem";

const ADMIN_MESSAGE_PREFIX = "Pipette admin\n";
const MESSAGE_MAX_AGE_MS = 10 * 60 * 1000;

export function getAdminWallet(): string | null {
  const wallet = process.env.ADMIN_WALLET?.trim() || process.env.NEXT_PUBLIC_ADMIN_WALLET?.trim();
  if (!wallet || !isAddress(wallet)) return null;
  return wallet.toLowerCase();
}

export function getPublicAdminWallet(): string | null {
  const wallet = process.env.NEXT_PUBLIC_ADMIN_WALLET?.trim();
  if (!wallet || !isAddress(wallet)) return null;
  return wallet.toLowerCase();
}

export function buildAdminListMessage(timestamp: number): string {
  return `${ADMIN_MESSAGE_PREFIX}Action: list-users\nTimestamp: ${timestamp}`;
}

export function buildAdminStatusMessage(target: string, status: string, timestamp: number): string {
  return `${ADMIN_MESSAGE_PREFIX}Action: set-status\nTarget: ${target.toLowerCase()}\nStatus: ${status}\nTimestamp: ${timestamp}`;
}

export function buildAdminBulkApproveMessage(timestamp: number): string {
  return `${ADMIN_MESSAGE_PREFIX}Action: bulk-approve-pending\nTimestamp: ${timestamp}`;
}

function parseTimestamp(message: string, actionLine: string): number | null {
  if (!message.startsWith(ADMIN_MESSAGE_PREFIX)) return null;
  if (!message.includes(actionLine)) return null;
  const match = message.match(/\nTimestamp: (\d+)$/);
  if (!match) return null;
  const timestamp = Number.parseInt(match[1], 10);
  if (!Number.isFinite(timestamp) || Date.now() - timestamp > MESSAGE_MAX_AGE_MS) return null;
  return timestamp;
}

export function isAdminListMessageValid(message: string): boolean {
  return parseTimestamp(message, "Action: list-users\n") != null;
}

export function isAdminStatusMessageValid(message: string, target: string, status: string): boolean {
  const expected = `Action: set-status\nTarget: ${target.toLowerCase()}\nStatus: ${status}\n`;
  return parseTimestamp(message, expected) != null;
}

export function isAdminBulkApproveMessageValid(message: string): boolean {
  return parseTimestamp(message, "Action: bulk-approve-pending\n") != null;
}

export async function verifyAdminSignature(params: {
  adminWallet: string;
  signature: string;
  message: string;
}): Promise<{ ok: true; address: Address } | { ok: false; error: string }> {
  const configured = getAdminWallet();
  if (!configured) {
    return { ok: false, error: "ADMIN_NOT_CONFIGURED" };
  }

  if (!isAddress(params.adminWallet)) {
    return { ok: false, error: "INVALID_ADMIN_ADDRESS" };
  }

  if (params.adminWallet.toLowerCase() !== configured) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  try {
    const recovered = await recoverMessageAddress({
      message: params.message,
      signature: params.signature as `0x${string}`,
    });
    if (recovered.toLowerCase() !== configured) {
      return { ok: false, error: "UNAUTHORIZED" };
    }
    return { ok: true, address: recovered };
  } catch {
    return { ok: false, error: "INVALID_SIGNATURE" };
  }
}
