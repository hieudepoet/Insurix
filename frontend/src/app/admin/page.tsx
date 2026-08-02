"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  apiClient,
  formatUsd,
  truncateId,
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
  return "pending";
}

function statusBadge(status: string): string {
  const n = normalizeStatus(status);
  if (n === "settled") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  if (n === "rejected") return "bg-red-500/10 border-red-500/20 text-red-400";
  return "bg-amber-500/10 border-amber-500/20 text-amber-400";
}

function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Attestation progress as 3 small bars. */
function AttestationBars({ progress }: { progress: AttestationProgress }) {
  const items = [
    { key: "identity", ok: progress.identity },
    { key: "externalData", ok: progress.externalData },
    { key: "fraudCheck", ok: progress.fraudCheck },
  ];
  const done = items.filter((i) => i.ok).length;
  return (
    <div className="flex items-center gap-1">
      {items.map((i) => (
        <span
          key={i.key}
          className={`w-6 h-1 rounded-full ${i.ok ? "bg-emerald-400" : "bg-slate-700"}`}
        />
      ))}
      <span className="text-xs text-slate-500 ml-1.5">{done}/3</span>
    </div>
  );
}

/** Claim type icon */
function TypeIcon({ type }: { type: string }) {
  if (type.includes("flight")) {
    return (
      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

const STAT_CARDS = [
  {
    key: "totalClaims" as keyof AdminStats,
    label: "Total",
    circle: "bg-violet-500/10 text-violet-400",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    key: "pendingClaims" as keyof AdminStats,
    label: "Pending",
    circle: "bg-amber-500/10 text-amber-400",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    key: "settledClaims" as keyof AdminStats,
    label: "Settled",
    circle: "bg-emerald-500/10 text-emerald-400",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    key: "rejectedClaims" as keyof AdminStats,
    label: "Rejected",
    circle: "bg-red-500/10 text-red-400",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

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
    msg.toLowerCase().includes("unauthorized") || msg.includes("401");

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#f8fafc]">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage all claims</p>
        </div>
        <button
          onClick={() => { loadStats(); loadClaims(); }}
          className="p-2.5 rounded-xl bg-[#0d1126] border border-white/5 text-slate-400 hover:text-[#f8fafc] hover:border-white/10 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Unauthorized banner */}
      {unauthorized && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
          <p className="text-sm text-red-400 font-medium">Invalid or expired API key</p>
          <button
            onClick={handleReLogin}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition"
          >
            Re-login
          </button>
        </div>
      )}

      {/* Hero stat — Total Amount */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-5 flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total Amount</p>
          {statsLoading ? (
            <div className="h-10 w-36 rounded shimmer mt-1.5" />
          ) : (
            <p className="text-4xl font-bold text-emerald-400 mt-1.5">
              {statsError ? "—" : formatUsd(stats?.totalAmount ?? 0)}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </motion.div>

      {/* Stat cards — 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-full ${card.circle} flex items-center justify-center shrink-0`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {card.icon}
              </svg>
            </div>
            <div>
              {statsLoading ? (
                <div className="h-7 w-12 rounded shimmer" />
              ) : statsError ? (
                <span className="text-slate-500 text-sm">—</span>
              ) : (
                <span className="text-2xl font-bold text-[#f8fafc]">
                  {((stats as AdminStats)[card.key] as number).toLocaleString()}
                </span>
              )}
              <p className="text-xs text-slate-400 uppercase tracking-wide">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search claim ID…"
          className="w-full pl-11 pr-4 h-12 rounded-2xl bg-[#0d1126] border border-white/5 text-sm text-[#f8fafc] placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 transition"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
              statusFilter === tab.key
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "border-transparent text-slate-400 hover:text-[#f8fafc]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Claims list */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#f8fafc]">
          Claims {filteredClaims.length > 0 && <span className="text-slate-500 font-normal">({filteredClaims.length})</span>}
        </h2>

        {claimsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded shimmer" />
                  <div className="h-3 w-16 rounded shimmer" />
                </div>
              </div>
            </div>
          ))
        ) : claimsError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-sm text-red-400">
            {claimsError}
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bg-[#0d1126] border border-white/5 rounded-2xl p-8 text-center text-sm text-slate-500">
            No claims match your filters.
          </div>
        ) : (
          filteredClaims.map((claim, i) => (
            <motion.button
              key={claim.claimId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/admin/${claim.claimId}`)}
              className="w-full text-left bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-4 hover:bg-[#0f1530] transition-colors"
            >
              {/* Top row: type icon + status badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
                  <TypeIcon type={claim.claimType} />
                </div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge(claim.status)}`}>
                  <span className="capitalize">{normalizeStatus(claim.status)}</span>
                </span>
              </div>

              {/* Amount */}
              <p className="text-xl font-bold text-[#f8fafc]">
                {formatUsd(claim.amount)}
              </p>

              {/* ID + date */}
              <div className="flex items-center justify-between mt-2">
                <p className="font-mono text-xs text-slate-400">
                  {truncateId(claim.claimId)}
                </p>
                <p className="text-xs text-slate-500">{formatDate(claim.createdAt)}</p>
              </div>

              {/* Attestation bars */}
              <div className="mt-3 pt-3 border-t border-white/5">
                <AttestationBars progress={claim.attestationProgress} />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
