const CDP_FAUCET_URL = "https://api.cdp.coinbase.com/platform/v2/evm/faucet";
const REQUEST_HOST = "api.cdp.coinbase.com";
const REQUEST_PATH = "/platform/v2/evm/faucet";
const REQUEST_METHOD = "POST";
const DEFAULT_MAX_CLAIMS_PER_RUN = 1000;
const JWT_EXPIRES_IN_S = 120;
const JWT_REFRESH_AFTER_MS = 90_000;
const CLAIM_TIMEOUT_MS = 30_000;

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

function isAuthFailure(code?: string): boolean {
  if (!code) return false;
  const normalized = code.toLowerCase();
  return (
    normalized === "jwt_error" ||
    normalized === "unauthorized" ||
    normalized === "unauthenticated" ||
    normalized === "invalid_token" ||
    normalized === "authentication_error"
  );
}

function successResult(hashes: string[], limitReached: boolean): RefillResult {
  return { ok: true, transactionHashes: hashes, claims: hashes.length, limitReached };
}

function failureResult(
  error: string,
  code: string | undefined,
  hashes: string[],
): RefillResult {
  return {
    ok: false,
    error,
    code,
    transactionHashes: hashes,
    claims: hashes.length,
  };
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
    expiresIn: JWT_EXPIRES_IN_S,
  });
}

async function claimOnce(
  jwt: string,
  address: string,
): Promise<{ ok: true; transactionHash: string } | { ok: false; error: string; code?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLAIM_TIMEOUT_MS);

  try {
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
      signal: controller.signal,
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
        code:
          data.errorType ??
          (res.status === 401 || res.status === 403
            ? "unauthorized"
            : res.status === 429
              ? "faucet_limit_exceeded"
              : "FAUCET_ERROR"),
      };
    }

    if (!data.transactionHash || typeof data.transactionHash !== "string") {
      return { ok: false, error: "No transaction hash in response", code: "INVALID_RESPONSE" };
    }

    return { ok: true, transactionHash: data.transactionHash };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Faucet request timed out", code: "TIMEOUT" };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message, code: "FAUCET_ERROR" };
  } finally {
    clearTimeout(timer);
  }
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
  let jwtIssuedAt = 0;
  try {
    jwt = await createJwt(apiKeyId, apiKeySecret);
    jwtIssuedAt = Date.now();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Failed to generate CDP JWT: ${message}`, code: "JWT_ERROR" };
  }

  const transactionHashes: string[] = [];
  const maxClaims = resolveMaxClaims();

  for (let i = 0; i < maxClaims; i++) {
    if (Date.now() - jwtIssuedAt >= JWT_REFRESH_AFTER_MS) {
      try {
        jwt = await createJwt(apiKeyId, apiKeySecret);
        jwtIssuedAt = Date.now();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return failureResult(`Failed to refresh CDP JWT: ${message}`, "JWT_ERROR", transactionHashes);
      }
    }

    let result: Awaited<ReturnType<typeof claimOnce>>;
    try {
      result = await claimOnce(jwt, address);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return failureResult(message, "FAUCET_ERROR", transactionHashes);
    }

    if (result.ok) {
      transactionHashes.push(result.transactionHash);
      continue;
    }

    if (isAuthFailure(result.code) || result.code === "JWT_ERROR") {
      return failureResult(result.error, result.code ?? "unauthorized", transactionHashes);
    }

    if (transactionHashes.length > 0) {
      return successResult(transactionHashes, isLimitCode(result.code));
    }

    return failureResult(result.error, result.code ?? "FAUCET_ERROR", []);
  }

  return successResult(transactionHashes, false);
}
