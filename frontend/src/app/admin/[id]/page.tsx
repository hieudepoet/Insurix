"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiClient,
  formatUsd,
  truncateId,
  type AdminClaimDetail,
  type AttestationType,
} from "@/lib/api-client";

type ToastState = { type: "success" | "error"; message: string } | null;

interface AttestationMeta {
  type: AttestationType;
  label: string;
  progressKey: keyof AdminClaimDetail["attestationProgress"];
  description: string;
  icon: React.ReactNode;
}

const ATTESTATION_META: AttestationMeta[] = [
  {
    type: "identity",
    label: "Identity Verification",
    progressKey: "identity",
    description:
      "Confirms the claimant identity has been verified by the identity verifier.",
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

function statusBg(status: string): string {
  const s = status.toLowerCase();
  if (s === "settled")
    return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
  if (s === "rejected" || s === "failed")
    return "bg-red-500/10 border-red-500/20 text-red-400";
  return "bg-amber-500/10 border-amber-500/20 text-amber-400";
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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
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

  const handleReject = async () => {
    setRejecting(true);
    try {
      await apiClient.rejectClaim(id, rejectReason.trim());
      await loadClaim();
      setToast({
        type: "success",
        message: "Claim rejected successfully.",
      });
    } catch (e) {
      setToast({
        type: "error",
        message: e instanceof Error ? e.message : "Failed to reject claim.",
      });
    } finally {
      setRejecting(false);
      setShowRejectModal(false);
      setRejectReason("");
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
        <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // ---- Error ----
  if (error || !claim) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-8">
          <h2 className="text-xl font-bold text-red-400">
            {error ? "Error" : "Claim not found"}
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            {error || "The claim you are looking for does not exist."}
          </p>
          <button
            onClick={() => router.push("/admin")}
            className="mt-6 px-4 py-2.5 rounded-xl bg-[#060818] border border-white/5 text-sm text-slate-300 hover:text-[#f8fafc] transition"
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
    <div className="space-y-5">
      {/* Claim header: back arrow + truncated ID + status badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin")}
          className="p-2 -ml-2 rounded-lg text-slate-400 hover:text-[#f8fafc] transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <p className="font-mono text-xs text-slate-400">{truncateId(claim.claimId)}</p>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusBg(
            claim.status
          )}`}
        >
          {claim.status}
        </span>
      </div>

      {/* Amount card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-6"
      >
        <p className="text-4xl font-bold text-[#f8fafc]">
          {formatUsd(claim.amount)}
        </p>
        <div className="mt-3 flex items-center gap-3 text-sm">
          <span className="text-slate-400 capitalize">{claim.claimType.replace("-", " ")}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">{formatDate(claim.createdAt)}</span>
        </div>
      </motion.div>

      {/* Attestation progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-[#f8fafc]">
            Attestation Management
          </h2>
          <span className="text-sm text-slate-400">
            {doneCount}/{ATTESTATION_META.length} verified
          </span>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(doneCount / ATTESTATION_META.length) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-emerald-500"
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
              className="bg-[#0d1126] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] rounded-2xl p-5 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    verified
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-amber-500/10 border-amber-500/20"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 ${verified ? "text-emerald-400" : "text-amber-400"}`}
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
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-white/5 border-white/5 text-slate-500"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      verified ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                  />
                  {verified ? "Verified" : "Pending"}
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-[#f8fafc]">{meta.label}</h3>
              <p className="text-xs text-slate-400 mt-1 flex-1">
                {meta.description}
              </p>

              <button
                onClick={() => setConfirmType(meta.type)}
                disabled={!verified || isRevoking}
                className={`mt-4 w-full h-10 rounded-xl text-sm font-medium transition ${
                  verified
                    ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    : "bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed"
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

      {/* Reject claim button */}
      {!claim.rejectionReason && !claim.settledAt && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <button
            onClick={() => setShowRejectModal(true)}
            className="w-full h-12 rounded-2xl border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition"
          >
            Reject Claim
          </button>
        </motion.div>
      )}

      {/* Settlement banner */}
      {(claim.settledAt || claim.rejectionReason) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className={`rounded-2xl p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] border ${
            claim.rejectionReason
              ? "bg-red-500/5 border-red-500/20"
              : "bg-emerald-500/5 border-emerald-500/20"
          }`}
        >
          <h2 className="text-lg font-bold tracking-tight text-[#f8fafc]">Settlement</h2>
          {claim.settledAt && !claim.rejectionReason ? (
            <div className="mt-3 flex items-center gap-2 text-emerald-400">
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
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">Reason: </span>
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
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
            onClick={() => !revoking && setConfirmType(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1126] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.6)] rounded-2xl p-6 w-full max-w-md border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
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
                <h3 className="text-lg font-bold tracking-tight text-[#f8fafc]">
                  Revoke Attestation?
                </h3>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                You are about to revoke the{" "}
                <span className="text-[#f8fafc] font-medium">
                  {confirmMeta.label}
                </span>{" "}
                attestation for this claim. This will invalidate the verification
                on-chain. This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmType(null)}
                  disabled={!!revoking}
                  className="px-4 py-2.5 rounded-xl bg-[#060818] border border-white/5 text-sm text-slate-300 hover:text-[#f8fafc] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevoke(confirmMeta.type)}
                  disabled={!!revoking}
                  className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  {revoking ? "Revoking…" : "Confirm Revoke"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject confirmation modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
            onClick={() => !rejecting && setShowRejectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1126] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.6)] rounded-2xl p-6 w-full max-w-md border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
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
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-[#f8fafc]">
                  Reject Claim?
                </h3>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Provide a reason for rejecting this claim. This action cannot be undone.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason…"
                rows={3}
                className="mt-4 w-full rounded-xl bg-[#060818] border border-white/5 px-4 py-3 text-sm text-[#f8fafc] placeholder-slate-500 focus:outline-none focus:border-red-500/30 transition resize-none"
              />
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={rejecting}
                  className="px-4 py-2.5 rounded-xl bg-[#060818] border border-white/5 text-sm text-slate-300 hover:text-[#f8fafc] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || rejecting}
                  className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
                >
                  {rejecting ? "Rejecting…" : "Confirm Reject"}
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
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] ${
                toast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
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
      <div className="pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#f8fafc] transition"
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
