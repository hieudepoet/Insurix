"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiClient,
  type AdminClaimDetail,
  type AttestationType,
} from "@/lib/api-client";

type ToastState = { type: "success" | "error"; message: string } | null;

interface AttestationMeta {
  type: AttestationType;
  label: string;
  progressKey: keyof AdminClaimDetail["attestationProgress"];
  description: string;
  accent: string;
  icon: React.ReactNode;
}

const ATTESTATION_META: AttestationMeta[] = [
  {
    type: "identity",
    label: "Identity Verification",
    progressKey: "identity",
    description:
      "Confirms the claimant identity has been verified by the identity verifier.",
    accent: "from-blue-500 to-cyan-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
  },
  {
    type: "external-data",
    label: "External Data Verification",
    progressKey: "externalData",
    description:
      "Cross-checks claim against off-chain data sources (flights, weather, etc.).",
    accent: "from-indigo-500 to-purple-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    type: "fraud-check",
    label: "Fraud Check",
    progressKey: "fraudCheck",
    description:
      "AI fraud-detection agents assess the claim for suspicious patterns.",
    accent: "from-orange-500 to-red-500",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  },
];

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === "settled") return "text-green-400";
  if (s === "rejected" || s === "failed") return "text-red-400";
  return "text-yellow-400";
}

function statusBg(status: string): string {
  const s = status.toLowerCase();
  if (s === "settled")
    return "bg-green-500/10 border-green-500/20 text-green-400";
  if (s === "rejected" || s === "failed")
    return "bg-red-500/10 border-red-500/20 text-red-400";
  return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
}

function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [claim, setClaim] = useState<AdminClaimDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<AttestationType | null>(null);
  const [revoking, setRevoking] = useState<AttestationType | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadClaim = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setClaim(await apiClient.getAdminClaim(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load claim");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 4000);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [toast]);

  const handleRevoke = async (type: AttestationType) => {
    setRevoking(type);
    try {
      const res = await apiClient.revokeAttestation(id, type);
      // Refresh claim to reflect updated state
      await loadClaim();
      setToast({
        type: "success",
        message: `${res.attestationType} attestation revoked successfully.`,
      });
    } catch (e) {
      setToast({
        type: "error",
        message:
          e instanceof Error ? e.message : "Failed to revoke attestation.",
      });
    } finally {
      setRevoking(null);
      setConfirmType(null);
    }
  };

  const confirmMeta =
    confirmType != null
      ? ATTESTATION_META.find((m) => m.type === confirmType)
      : null;

  // ---- Loading ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  // ---- Error ----
  if (error || !claim) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-red-400">
            {error ? "Error" : "Claim not found"}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {error || "The claim you are looking for does not exist."}
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="mt-6 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const doneCount = ATTESTATION_META.filter(
    (m) => claim.attestationProgress[m.progressKey]
  ).length;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin")}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Claim Detail</h1>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusBg(
                  claim.status
                )}`}
              >
                {claim.status}
              </span>
            </div>
            <p className="font-mono text-xs text-gray-400 mt-2 break-all">
              {claim.claimId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gradient">
              {formatAmount(claim.amount)}{" "}
              <span className="text-sm text-gray-400">SUI</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Claim Amount</p>
          </div>
        </div>
      </motion.div>

      {/* Claim metadata grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <MetaCard label="Claim Type" value={claim.claimType.replace("-", " ")} capitalize />
        <MetaCard label="Status" value={claim.status} valueClass={statusColor(claim.status)} capitalize />
        <MetaCard label="Created" value={formatDate(claim.createdAt)} />
        <MetaCard
          label="Settled At"
          value={claim.settledAt ? formatDate(claim.settledAt) : "—"}
        />
      </motion.div>

      {/* Attestation summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            Attestation Management
          </h2>
          <span className="text-sm text-gray-400">
            {doneCount}/{ATTESTATION_META.length} verified
          </span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / ATTESTATION_META.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>
      </motion.div>

      {/* Attestation cards */}
      <div className="flex flex-col gap-3">
        {ATTESTATION_META.map((meta, i) => {
          const verified = claim.attestationProgress[meta.progressKey];
          const isRevoking = revoking === meta.type;
          return (
            <motion.div
              key={meta.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.06, duration: 0.4 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center`}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {meta.icon}
                  </svg>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    verified
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-white/5 border-white/10 text-gray-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      verified ? "bg-green-400" : "bg-gray-600"
                    }`}
                  />
                  {verified ? "Verified" : "Pending"}
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-white">{meta.label}</h3>
              <p className="text-xs text-gray-400 mt-1 flex-1">
                {meta.description}
              </p>

              <button
                onClick={() => setConfirmType(meta.type)}
                disabled={!verified || isRevoking}
                className={`mt-4 w-full h-10 rounded-xl text-sm font-medium transition ${
                  verified
                    ? "bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500/20"
                    : "bg-white/5 border border-white/10 text-gray-600 cursor-not-allowed"
                }`}
              >
                {isRevoking ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-red-400/30 border-t-red-400 animate-spin" />
                    Revoking…
                  </span>
                ) : verified ? (
                  "Revoke Attestation"
                ) : (
                  "Not Verified"
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Settlement info */}
      {(claim.settledAt || claim.rejectionReason) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`backdrop-blur-xl border rounded-2xl p-6 ${
            claim.rejectionReason
              ? "bg-red-500/5 border-red-500/20"
              : "bg-green-500/5 border-green-500/20"
          }`}
        >
          <h2 className="text-lg font-semibold text-white">Settlement</h2>
          {claim.settledAt && !claim.rejectionReason ? (
            <div className="mt-3 flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm">
                Claim settled on {formatDate(claim.settledAt)}
              </span>
            </div>
          ) : claim.rejectionReason ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">Claim rejected</span>
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-gray-500">Reason: </span>
                {claim.rejectionReason}
              </p>
            </div>
          ) : null}
        </motion.div>
      )}

      {/* Confirmation dialog */}
      <AnimatePresence>
        {confirmMeta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !revoking && setConfirmType(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Revoke Attestation?
                </h3>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                You are about to revoke the{" "}
                <span className="text-white font-medium">
                  {confirmMeta.label}
                </span>{" "}
                attestation for this claim. This will invalidate the verification
                on-chain. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmType(null)}
                  disabled={!!revoking}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevoke(confirmMeta.type)}
                  disabled={!!revoking}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  {revoking ? "Revoking…" : "Confirm Revoke"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${
                toast.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer link */}
      <div className="pt-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

function MetaCard({
  label,
  value,
  valueClass,
  capitalize,
}: {
  label: string;
  value: string;
  valueClass?: string;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-1 font-medium text-white ${valueClass ?? ""} ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
