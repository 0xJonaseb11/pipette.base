"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Shield, ShieldAlert, Users } from "lucide-react";
import { useAccount, useSignMessage } from "wagmi";
import { UserTable } from "~~/components/admin/UserTable";
import type { User, UserStatus } from "~~/types";
import {
  buildAdminBulkApproveMessage,
  buildAdminListMessage,
  buildAdminStatusMessage,
  getPublicAdminWallet,
} from "~~/utils/adminAuth";

type StatusFilter = UserStatus | "all";

type Counts = Record<UserStatus, number>;

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const adminWallet = useMemo(() => getPublicAdminWallet(), []);
  const isAdmin =
    !!address && !!adminWallet && address.toLowerCase() === adminWallet;

  const [status, setStatus] = useState<StatusFilter>("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Counts>({ active: 0, pending: 0, blocked: 0 });
  const [loading, setLoading] = useState(false);
  const [busyWallet, setBusyWallet] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const limit = 25;

  const signAdmin = useCallback(
    async (message: string) => {
      if (!address) throw new Error("Wallet not connected");
      const signature = await signMessageAsync({ message });
      return { adminWallet: address, signature, message };
    },
    [address, signMessageAsync],
  );

  const fetchUsers = useCallback(async () => {
    if (!isAdmin || !address) return;
    setLoading(true);
    setError(null);
    try {
      const message = buildAdminListMessage(Date.now());
      const auth = await signAdmin(message);
      const params = new URLSearchParams({
        status,
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: {
          "x-admin-wallet": auth.adminWallet,
          "x-admin-signature": auth.signature,
          "x-admin-message": auth.message,
        },
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Failed to load users");
        setUsers([]);
        return;
      }
      setUsers(json.data.users ?? []);
      setTotal(json.data.total ?? 0);
      setCounts(json.data.counts ?? { active: 0, pending: 0, blocked: 0 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load users";
      setError(msg.includes("rejected") || msg.includes("denied") ? "Signature rejected" : msg);
    } finally {
      setLoading(false);
    }
  }, [address, isAdmin, page, search, signAdmin, status]);

  useEffect(() => {
    if (isAdmin) {
      void fetchUsers();
    }
  }, [fetchUsers, isAdmin]);

  const onSetStatus = async (targetWallet: string, nextStatus: UserStatus) => {
    if (!address) return;
    setBusyWallet(targetWallet);
    setError(null);
    try {
      const message = buildAdminStatusMessage(targetWallet, nextStatus, Date.now());
      const auth = await signAdmin(message);
      const res = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...auth, targetWallet, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Update failed");
        return;
      }
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed";
      setError(msg.includes("rejected") || msg.includes("denied") ? "Signature rejected" : msg);
    } finally {
      setBusyWallet(null);
    }
  };

  const onBulkApprove = async () => {
    if (!address || counts.pending === 0) return;
    setBulkBusy(true);
    setError(null);
    try {
      const message = buildAdminBulkApproveMessage(Date.now());
      const auth = await signAdmin(message);
      const res = await fetch("/api/admin/users/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        setError(json.error ?? "Bulk approve failed");
        return;
      }
      setStatus("active");
      setPage(1);
      await fetchUsers();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bulk approve failed";
      setError(msg.includes("rejected") || msg.includes("denied") ? "Signature rejected" : msg);
    } finally {
      setBulkBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!adminWallet) {
    return (
      <div className="min-h-[70vh] max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-start gap-3 text-base-content/80">
          <ShieldAlert className="h-6 w-6 shrink-0 text-warning" />
          <div>
            <h1 className="text-xl font-semibold text-base-content mb-2">Admin not configured</h1>
            <p className="text-sm">
              Set <code className="text-xs">NEXT_PUBLIC_ADMIN_WALLET</code> and{" "}
              <code className="text-xs">ADMIN_WALLET</code> to enable the portal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected || !isAdmin) {
    return (
      <div className="min-h-[70vh] max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-start gap-3 text-base-content/80">
          <Shield className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <h1 className="text-xl font-semibold text-base-content mb-2">Admin portal</h1>
            <p className="text-sm mb-4">
              Connect the admin wallet to review users, approve claims eligibility, and block abuse.
            </p>
            {!isConnected ? (
              <p className="text-sm text-base-content/60">Connect your wallet to continue.</p>
            ) : (
              <p className="text-sm text-error">Connected wallet is not authorized.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold text-base-content">Admin</h1>
          </div>
          <p className="text-sm text-base-content/70">Review users and manage faucet access.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="badge badge-success badge-outline">active {counts.active}</span>
          <span className="badge badge-warning badge-outline">pending {counts.pending}</span>
          <span className="badge badge-error badge-outline">blocked {counts.blocked}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="join">
          {(["all", "pending", "active", "blocked"] as StatusFilter[]).map(value => (
            <button
              key={value}
              type="button"
              className={`btn btn-sm join-item ${status === value ? "btn-primary" : "btn-ghost"}`}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {value}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search wallet or GitHub"
          className="input input-bordered input-sm w-full lg:max-w-xs"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              setSearch(searchInput.trim());
              setPage(1);
            }
          }}
        />
        <button
          type="button"
          className="btn btn-sm btn-ghost"
          onClick={() => {
            const next = searchInput.trim();
            if (next !== search || page !== 1) {
              setSearch(next);
              setPage(1);
            } else {
              void fetchUsers();
            }
          }}
          disabled={loading}
        >
          Refresh
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          disabled={bulkBusy || counts.pending === 0}
          onClick={() => void onBulkApprove()}
        >
          {bulkBusy ? "Approving…" : `Approve all pending (${counts.pending})`}
        </button>
      </div>

      {error && (
        <div className="alert alert-error text-sm mb-4 py-2">
          <span>{error}</span>
        </div>
      )}

      <UserTable users={users} loading={loading} busyWallet={busyWallet} onSetStatus={onSetStatus} />

      <div className="flex items-center justify-between mt-6 text-sm">
        <span className="text-base-content/60">
          {total} user{total === 1 ? "" : "s"} · page {page} / {totalPages}
        </span>
        <div className="join">
          <button
            type="button"
            className="btn btn-sm join-item"
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            className="btn btn-sm join-item"
            disabled={page >= totalPages || loading}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
