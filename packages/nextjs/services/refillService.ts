const CDP_FAUCET_URL = "https://api.cdp.coinbase.com/platform/v2/evm/faucet";
const REQUEST_HOST = "api.cdp.coinbase.com";
const REQUEST_PATH = "/platform/v2/evm/faucet";
const REQUEST_METHOD = "POST";

export type RefillResult = { ok: true; transactionHash: string } | { ok: false; error: string; code?: string };

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
    const { generateJwt } = await import("@coinbase/cdp-sdk/auth");
    jwt = await generateJwt({
      apiKeyId,
      apiKeySecret,
      requestMethod: REQUEST_METHOD,
      requestHost: REQUEST_HOST,
      requestPath: REQUEST_PATH,
      expiresIn: 120,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: `Failed to generate CDP JWT: ${message}`,
      code: "JWT_ERROR",
    };
  }

  const body = {
    network: "base-sepolia",
    address,
    token: "eth",
  };

  const res = await fetch(CDP_FAUCET_URL, {
    method: REQUEST_METHOD,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as {
    transactionHash?: string;
    errorType?: string;
    errorMessage?: string;
  };

  if (!res.ok) {
    const errorMessage = data.errorMessage ?? data.errorType ?? `HTTP ${res.status}`;
    return {
      ok: false,
      error: errorMessage,
      code: data.errorType ?? (res.status === 429 ? "faucet_limit_exceeded" : "FAUCET_ERROR"),
    };
  }

  const txHash = data.transactionHash;
  if (!txHash || typeof txHash !== "string") {
    return { ok: false, error: "No transaction hash in response", code: "INVALID_RESPONSE" };
  }

  return { ok: true, transactionHash: txHash };
}
