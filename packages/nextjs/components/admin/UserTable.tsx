"use client";

import { ExternalLink, Loader2 } from "lucide-react";
import type { User, UserStatus } from "~~/types";

const EXPLORER = "https://sepolia.basescan.org/address";

type Props = {
  users: User[];
  loading: boolean;
  busyWallet: string | null;
  onSetStatus: (wallet: string, status: UserStatus) => void;
};

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function statusBadge(status: UserStatus) {
  const className =
    status === "active"
      ? "badge badge-success badge-sm"
      : status === "pending"
        ? "badge badge-warning badge-sm"
        : "badge badge-error badge-sm";
  return <span className={className}>{status}</span>;
}

export function UserTable({ users, loading, busyWallet, onSetStatus }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-base-content/60">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading users…
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="py-12 text-center text-sm text-base-content/60">No users match this filter.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Wallet</th>
            <th>GitHub</th>
            <th>Score</th>
            <th>Status</th>
            <th>Claimed</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => {
            const busy = busyWallet?.toLowerCase() === user.wallet_address.toLowerCase();
            return (
              <tr key={user.id}>
                <td>
                  <a
                    href={`${EXPLORER}/${user.wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-hover inline-flex items-center gap-1 font-mono text-xs"
                  >
                    {shortAddress(user.wallet_address)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
                <td className="text-sm">
                  {user.github_login ? (
                    <a
                      href={`https://github.com/${user.github_login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-hover"
                    >
                      @{user.github_login}
                    </a>
                  ) : (
                    <span className="text-base-content/40">—</span>
                  )}
                </td>
                <td className="font-mono text-sm">{user.sybil_score}</td>
                <td>{statusBadge(user.status)}</td>
                <td className="font-mono text-sm">{Number(user.total_claimed).toFixed(4)} ETH</td>
                <td className="text-xs text-base-content/70">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {user.status !== "active" && (
                      <button
                        type="button"
                        className="btn btn-success btn-xs"
                        disabled={busy}
                        onClick={() => onSetStatus(user.wallet_address, "active")}
                      >
                        Approve
                      </button>
                    )}
                    {user.status !== "blocked" && (
                      <button
                        type="button"
                        className="btn btn-error btn-xs"
                        disabled={busy}
                        onClick={() => onSetStatus(user.wallet_address, "blocked")}
                      >
                        Block
                      </button>
                    )}
                    {user.status === "blocked" && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        disabled={busy}
                        onClick={() => onSetStatus(user.wallet_address, "pending")}
                      >
                        Unblock
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
