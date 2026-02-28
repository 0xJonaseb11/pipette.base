export function parseSupabaseHash(hash: string): {
  provider_token: string | null;
  state: string | null;
} {
  if (!hash || !hash.startsWith("#")) return { provider_token: null, state: null };
  const params = new URLSearchParams(hash.slice(1));
  return {
    provider_token: params.get("provider_token"),
    state: params.get("state"),
  };
}
