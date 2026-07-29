const CDP_FAUCET_URL = "https://api.cdp.coinbase.com/platform/v2/evm/faucet";
const REQUEST_HOST = "api.cdp.coinbase.com";
const REQUEST_PATH = "/platform/v2/evm/faucet";
const REQUEST_METHOD = "POST";
const DEFAULT_MAX_CLAIMS_PER_RUN = 1000;

export type RefillResult =
  | {
      ok: true;
      transactionHashes: string[];
      claims: number;
      limitReached: boolean;
    }
  | { ok: false; error: string; code?: string; transactionHashes?: string[]; claims?: number };

function isLimitCode(code?: string): boolean {
  return code === "faucet_limit_exceeded" || code === "rate_limit_exceeded";
}

function successResult(hashes: string[], limitReached: boolean): RefillResult {
  return { ok: true, transactionHashes: hashes, claims: hashes.length, limitReached };
}

function resolveMaxClaims(): number {
  const raw = process.env.REFILL_MAX_CLAIMS_PER_RUN;
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_MAX_CLAIMS_PER_RUN;
  return Math.min(Math.max(1, Number.isFinite(parsed) ? parsed : DEFAULT_MAX_CLAIMS_PER_RUN), 1000);
}

async function createJwt(apiKeyId: string, apiKeySecret: string): Promise<string> {
  const { generateJwt } = await import("@coinbase/cdp-sdk/auth");
  return generateJwt({
    apiKeyId,
    apiKeySecret,
    requestMethod: REQUEST_METHOD,
    requestHost: REQUEST_HOST,
    requestPath: REQUEST_PATH,
    expiresIn: 120,
  });
}

async function claimOnce(
  jwt: string,
  address: string,
): Promise<{ ok: true; transactionHash: string } | { ok: false; error: string; code?: string }> {
  const res = await fetch(CDP_FAUCET_URL, {
    method: REQUEST_METHOD,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      network: "base-sepolia",
      address,
      token: "eth",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    transactionHash?: string;
    errorType?: string;
    errorMessage?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      error: data.errorMessage ?? data.errorType ?? `HTTP ${res.status}`,
      code: data.errorType ?? (res.status === 429 ? "faucet_limit_exceeded" : "FAUCET_ERROR"),
    };
  }

  if (!data.transactionHash || typeof data.transactionHash !== "string") {
    return { ok: false, error: "No transaction hash in response", code: "INVALID_RESPONSE" };
  }

  return { ok: true, transactionHash: data.transactionHash };
}

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

  let jwt: string;
  try {
    jwt = await createJwt(apiKeyId, apiKeySecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to generate CDP JWT: ${message}`, code: "JWT_ERROR" };
  }

  const transactionHashes: string[] = [];
  const maxClaims = resolveMaxClaims();

  for (let i = 0; i < maxClaims; i++) {
    if (i > 0 && i % 50 === 0) {
      try {
        jwt = await createJwt(apiKeyId, apiKeySecret);
      } catch (err) {
        if (transactionHashes.length > 0) {
          return successResult(transactionHashes, false);
        }
        const message = err instanceof Error ? err.message : String(err);
        return { ok: false, error: `Failed to refresh CDP JWT: ${message}`, code: "JWT_ERROR" };
      }
    }

    const result = await claimOnce(jwt, address);
    if (result.ok) {
      transactionHashes.push(result.transactionHash);
      continue;
    }

    if (transactionHashes.length > 0) {
      return successResult(transactionHashes, isLimitCode(result.code));
    }

    return {
      ok: false,
      error: result.error,
      code: result.code ?? "FAUCET_ERROR",
      transactionHashes,
      claims: 0,
    };
  }

  return successResult(transactionHashes, false);
}
