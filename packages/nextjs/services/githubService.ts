import type { GitHubProfile } from "~~/types";

const GITHUB_API_USER = "https://api.github.com/user";

/**
 * Fetches GitHub profile using the OAuth access token.
 * Only use the returned profile fields; never store the token in the database.
 */
export async function fetchGitHubProfile(accessToken: string): Promise<GitHubProfile> {
  const res = await fetch(GITHUB_API_USER, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    id: number;
    login: string;
    created_at: string;
    public_repos: number;
    followers: number;
    following: number;
    email?: string | null;
  };

  const createdAt = data.created_at ? new Date(data.created_at) : new Date();
  const accountAgeDays = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000)));

  return {
    github_id: String(data.id),
    login: data.login ?? "",
    account_age_days: accountAgeDays,
    public_repos: data.public_repos ?? 0,
    followers: data.followers ?? 0,
    following: data.following ?? 0,
    has_email: Boolean(data.email),
  };
}
