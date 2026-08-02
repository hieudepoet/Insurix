"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  apiClient,
  type AdminStats,
  type AdminClaim,
  type AttestationProgress,
} from "@/lib/api-client";

type StatusFilter = "all" | "pending" | "settled" | "rejected";

/** Map the backend's raw status string into one of the three filter buckets. */
function normalizeStatus(status: string): "pending" | "settled" | "rejected" {
  const s = status.toLowerCase();
  if (s === "settled") return "settled";
  if (s === "rejected" || s === "failed") return "rejected";
  return "pending"; // pending | attesting | anything else
}

function statusBg(status: string): string {
  const n = normalizeStatus(status);
  if (n === "settled") return "bg-green-500/10 border-green-500/20 text-green-400";
  if (n === "rejected") return "bg-red-500/10 border-red-500/20 text-red-400";
  return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
}

function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Compact attestation progress indicator: three pills. */
function ProgressPills({ progress }: { progress: AttestationProgress }) {
  const items = [
    { key: "identity", label: "ID", ok: progress.identity },
    { key: "externalData", label: "Data", ok: progress.externalData },
    { key: "fraudCheck", label: "Fraud", ok: progress.fraudCheck },
  ];
  const done = items.filter((i) => i.ok).length;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 mr-1">
        {done}/{items.length}
      </span>
      <div className="flex gap-1">
        {items.map((i) => (
          <span
            key={i.key}
            title={i.label}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
              i.ok
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-white/5 border-white/10 text-gray-500"
            }`}
          >
            {i.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const STAT_CARDS = [
  {
    key: "totalClaims",
    label: "Total Claims",
    accent: "from-blue-500 to-cyan-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    key: "pendingClaims",
    label: "Pending",
    accent: "from-yellow-500 to-amber-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
  {
    key: "settledClaims",
    label: "Settled",
    accent: "from-green-500 to-emerald-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
  {
    key: "rejectedClaims",
    label: "Rejected",
    accent: "from-red-500 to-rose-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  },
] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [claimsError, setClaimsError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const isUnauthorized = (msg: string) =>
    msg.toLowerCase().includes("unauthorized") ||
    msg.includes("401");

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      setStats(await apiClient.getAdminStats());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load stats";
      if (isUnauthorized(msg)) setUnauthorized(true);
      setStatsError(msg);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadClaims = useCallback(async () => {
    try {
      setClaimsLoading(true);
      setClaimsError(null);
      setClaims(await apiClient.getAdminClaims());
    } catch (e) {
      setClaimsError(e instanceof Error ? e.message : "Failed to load claims");
    } finally {
      setClaimsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadClaims();
  }, [loadStats, loadClaims]);

  const handleReLogin = () => {
    localStorage.removeItem("insurix_admin_key");
    setUnauthorized(false);
    // Force the layout gate to re-render by reloading the route
    router.push("/admin");
    window.location.reload();
  };

  const filteredClaims = useMemo(() => {
    let list = claims;
    if (statusFilter !== "all") {
      list = list.filter((c) => normalizeStatus(c.status) === statusFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.claimId.toLowerCase().includes(q));
    }
    return list;
  }, [claims, statusFilter, search]);

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "settled", label: "Settled" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Monitor and manage all insurance claims across the platform.
          </p>
        </div>
        <button
          onClick={() => {
            loadStats();
            loadClaims();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Unauthorized banner */}
      {unauthorized && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-red-400 font-semibold">Invalid or expired API key</h3>
            <p className="text-sm text-gray-400 mt-1">
              Your admin session is no longer valid. Please re-authenticate.
            </p>
          </div>
          <button
            onClick={handleReLogin}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:opacity-90 transition"
          >
            Re-login
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${card.accent} flex items-center justify-center`}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {card.icon}
                </svg>
              </div>
            </div>
            <div className="mt-4">
              {statsLoading ? (
                <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
              ) : statsError ? (
                <span className="text-gray-500 text-sm">—</span>
              ) : (
                <span className="text-2xl font-bold text-white">
                  {(stats as AdminStats)[card.key].toLocaleString()}
                </span>
              )}
              <p className="text-xs text-gray-400 mt-1">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total amount highlight card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center justify-between"
      >
        <div>
          <p className="text-sm text-gray-400">Total Claimed Amount</p>
          <div className="mt-2 flex items-baseline gap-2">
            {statsLoading ? (
              <div className="h-10 w-32 rounded bg-white/10 animate-pulse" />
            ) : (
              <>
                <span className="text-3xl font-bold text-gradient">
                  {statsError ? "—" : formatAmount(stats?.totalAmount ?? 0)}
                </span>
                <span className="text-sm text-gray-400">SUI</span>
              </>
            )}
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500/80 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
      </motion.div>

      {/* Claims table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">All Claims</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search claim ID…"
                className="pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition w-full sm:w-56"
              />
            </div>
            {/* Status filter */}
            <div className="flex gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    statusFilter === tab.key
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-white/10">
                <th className="px-4 py-3 font-medium">Claim ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Attestations</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claimsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 w-full max-w-[120px] rounded bg-white/5 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : claimsError ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-red-400">
                    {claimsError}
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                    No claims match your filters.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim, i) => (
                  <motion.tr
                    key={claim.claimId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => router.push(`/admin/${claim.claimId}`)}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition"
                  >
                    <td className="px-4 py-4 font-mono text-xs text-gray-300">
                      <span className="line-clamp-1">
                        {claim.claimId.length > 14
                          ? `${claim.claimId.slice(0, 8)}…${claim.claimId.slice(-4)}`
                          : claim.claimId}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-300 capitalize">
                      {claim.claimType.replace("-", " ")}
                    </td>
                    <td className="px-4 py-4 text-white">
                      {formatAmount(claim.amount)}{" "}
                      <span className="text-xs text-gray-500">SUI</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${statusBg(
                          claim.status
                        )}`}
                      >
                        <span className="capitalize">
                          {normalizeStatus(claim.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ProgressPills progress={claim.attestationProgress} />
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {formatDate(claim.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/${claim.claimId}`);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition"
                      >
                        View
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
