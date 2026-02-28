/**
 * Parse Supabase Auth redirect hash (implicit flow) to get provider_token and state.
 * Used after GitHub OAuth redirect to complete "link GitHub to wallet" with Ethereum sign-in.
 */
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
