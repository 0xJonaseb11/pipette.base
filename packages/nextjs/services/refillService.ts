import { CdpClient } from "@coinbase/cdp-sdk";

/** CDP ETH faucet: 0.0001 ETH per claim, up to 1000 claims / 0.1 ETH per 24h (Base network faucets). */
const DEFAULT_MAX_CLAIMS_PER_RUN = 1000;

export type RefillResult =
  | {
      ok: true;
      transactionHashes: string[];
      claims: number;
      /** True when CDP returned faucet_limit_exceeded after at least one success. */
      limitReached: boolean;
    }
  | { ok: false; error: string; code?: string; transactionHashes?: string[]; claims?: number };

function getErrorType(err: unknown): string | undefined {
  if (err && typeof err === "object" && "errorType" in err) {
    const type = (err as { errorType?: unknown }).errorType;
    return typeof type === "string" ? type : undefined;
  }
  return undefined;
}

function isLimitExceeded(err: unknown): boolean {
  const type = getErrorType(err);
  return type === "faucet_limit_exceeded" || type === "rate_limit_exceeded";
}

function errorDetails(err: unknown): { message: string; code?: string } {
  const code = getErrorType(err);
  if (err && typeof err === "object" && "errorMessage" in err) {
    const msg = (err as { errorMessage?: unknown }).errorMessage;
    if (typeof msg === "string" && msg.length > 0) {
      return { message: msg, code };
    }
  }
  if (err instanceof Error) {
    return { message: err.message, code };
  }
  return { message: String(err), code };
}

/**
 * Request Base Sepolia ETH from the Coinbase Developer Platform faucet into the treasury.
 * Uses the official CDP SDK (`cdp.evm.requestFaucet`) — same source as
 * https://docs.base.org/base-chain/network-information/network-faucets
 *
 * Loops until the rolling 24h CDP limit is hit or `maxClaims` is reached so a single
 * daily cron can accumulate up to ~0.1 ETH.
 */
export async function requestFaucetFunds(treasuryAddress: string): Promise<RefillResult> {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyId || !apiKeySecret) {
    return {
      ok: false,
      error: "CDP_API_KEY_ID and CDP_API_KEY_SECRET must be set",
      code: "MISSING_CREDENTIALS",
    };
  }

  const address = treasuryAddress.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return { ok: false, error: "Invalid treasury address", code: "INVALID_ADDRESS" };
  }

  const maxClaimsRaw = process.env.REFILL_MAX_CLAIMS_PER_RUN;
  const maxClaims = Math.min(
    Math.max(1, maxClaimsRaw ? Number.parseInt(maxClaimsRaw, 10) || DEFAULT_MAX_CLAIMS_PER_RUN : DEFAULT_MAX_CLAIMS_PER_RUN),
    1000,
  );

  const cdp = new CdpClient({ apiKeyId, apiKeySecret });
  const transactionHashes: string[] = [];

  for (let i = 0; i < maxClaims; i++) {
    try {
      const { transactionHash } = await cdp.evm.requestFaucet({
        address,
        network: "base-sepolia",
        token: "eth",
      });
      transactionHashes.push(transactionHash);
    } catch (err) {
      if (isLimitExceeded(err)) {
        if (transactionHashes.length > 0) {
          return {
            ok: true,
            transactionHashes,
            claims: transactionHashes.length,
            limitReached: true,
          };
        }
        const { message, code } = errorDetails(err);
        return {
          ok: false,
          error: message,
          code: code ?? "faucet_limit_exceeded",
          transactionHashes,
          claims: 0,
        };
      }

      const { message, code } = errorDetails(err);
      if (transactionHashes.length > 0) {
        return {
          ok: true,
          transactionHashes,
          claims: transactionHashes.length,
          limitReached: false,
        };
      }
      return {
        ok: false,
        error: message,
        code: code ?? "FAUCET_ERROR",
        transactionHashes,
        claims: 0,
      };
    }
  }

  return {
    ok: true,
    transactionHashes,
    claims: transactionHashes.length,
    limitReached: false,
  };
}
