'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  claimsApi,
  truncateId,
  formatSui,
  formatDate,
  claimTypeLabel,
  type ClaimDetail,
  type ClaimType,
} from '@/lib/api-client';

// Attestation card metadata (maps to the boolean flags from the API).
const ATTESTATIONS = [
  {
    key: 'identity' as const,
    title: 'Identity Verified',
    desc: 'Confirms the claimant wallet identity via on-chain attestation.',
  },
  {
    key: 'externalData' as const,
    title: 'External Data Verified',
    desc: 'Flight status or rainfall data cross-checked against trusted sources.',
  },
  {
    key: 'fraudCheck' as const,
    title: 'Fraud Check Passed',
    desc: 'AI fraud-detection agent flagged no anomalies for this claim.',
  },
];

type DisplayStatus = 'pending' | 'settled' | 'rejected';

function normalizeStatus(s: string): DisplayStatus {
  if (s === 'settled') return 'settled';
  if (s === 'rejected' || s === 'failed') return 'rejected';
  return 'pending';
}

function statusClasses(s: DisplayStatus) {
  switch (s) {
    case 'settled':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'rejected':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
  }
}

function TypeIcon({ type }: { type: ClaimType }) {
  if (type === 'flight-delay') {
    return (
      <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 13.5 3 17v-2.2l7.5-3.8V5a1.5 1.5 0 1 1 3 0v6l7.5 3.8V17l-7.5-3.5" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 14a4 4 0 0 0 .5-7.97 6 6 0 0 0-11.32 1.2A4.5 4.5 0 0 0 6 14" />
      <path d="M8 19v2M12 17v4M16 19v2" />
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export function ClaimDetailClient({ claimId }: { claimId: string }) {
  const queryClient = useQueryClient();

  const { data: claim, isLoading, isError, error } = useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => claimsApi.getClaim(claimId),
    // Poll every 5s while the claim is still in progress.
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s && s !== 'settled' && s !== 'rejected' ? 5000 : false;
    },
  });

  const settleMutation = useMutation({
    mutationFn: () => claimsApi.settleClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim', claimId] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/claims" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to claims
      </Link>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !claim ? (
        <div className="rounded-2xl bg-red-500/5 backdrop-blur-xl border border-red-500/20 p-6 text-red-300">
          <p className="font-medium">Failed to load claim</p>
          <p className="text-sm text-red-400/70 mt-1">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
      ) : (
        <ClaimBody
          claim={claim}
          onSettle={() => settleMutation.mutate()}
          settling={settleMutation.isPending}
          settleError={settleMutation.isError ? settleMutation.error : null}
          settleResult={settleMutation.data ?? null}
        />
      )}
    </div>
  );
}

// ─── Detail body ──────────────────────────────────────────────────────────

function ClaimBody({
  claim,
  onSettle,
  settling,
  settleError,
  settleResult,
}: {
  claim: ClaimDetail;
  onSettle: () => void;
  settling: boolean;
  settleError: Error | null;
  settleResult: { status: string; reason?: string; txDigest: string } | null;
}) {
  const display = normalizeStatus(claim.status);
  const allVerified =
    claim.attestationProgress.identity &&
    claim.attestationProgress.externalData &&
    claim.attestationProgress.fraudCheck;
  const canSettle = allVerified && display === 'pending';

  return (
    <div className="space-y-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <TypeIcon type={claim.claimType} />
              <span className="text-sm text-gray-300">{claimTypeLabel(claim.claimType)}</span>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Claim ID</div>
              <div className="font-mono text-cyan-400 break-all">{claim.claimId}</div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusClasses(display)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span className="capitalize">{display}</span>
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">Amount</div>
              <div className="text-2xl font-bold">{formatSui(claim.amount)}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-sm text-gray-400">
          Submitted {formatDate(claim.createdAt)}
        </div>
      </motion.div>

      {/* Attestation cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Attestation Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ATTESTATIONS.map((a, i) => {
            const verified = claim.attestationProgress[a.key];
            return (
              <motion.div
                key={a.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <StatusGlyph verified={verified} />
                  <span className={`text-xs font-medium ${verified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-sm">{a.title}</div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{a.desc}</p>
                </div>
                <div className="text-xs text-gray-500 mt-auto pt-2 border-t border-white/5">
                  Submitted {formatDate(claim.createdAt)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Timeline + settlement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Timeline claim={claim} display={display} />

        {/* Settlement panel */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Settlement</h2>

          <AnimatePresence mode="wait">
            {display === 'settled' ? (
              <motion.div
                key="settled"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex items-start gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <div className="font-semibold text-green-400">Claim Settled</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Funds released from escrow{claim.settledAt ? ` on ${formatDate(claim.settledAt)}` : ''}.
                  </p>
                </div>
              </motion.div>
            ) : display === 'rejected' ? (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="flex items-start gap-3"
              >
                <XCircle className="w-6 h-6 text-red-400" />
                <div>
                  <div className="font-semibold text-red-400">Claim Rejected</div>
                  {claim.rejectionReason ? (
                    <p className="text-sm text-gray-400 mt-1">{claim.rejectionReason}</p>
                  ) : null}
                </div>
              </motion.div>
            ) : canSettle ? (
              <motion.div key="can-settle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-sm text-gray-300 mb-4">
                  All three attestations are verified. You can trigger settlement now.
                </p>
                <button
                  onClick={onSettle}
                  disabled={settling}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity glow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {settling ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Settling…
                    </>
                  ) : (
                    'Settle Claim'
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <div>
                  <div className="font-semibold text-yellow-400">Awaiting attestations</div>
                  <p className="text-sm text-gray-400 mt-1">
                    AI agents are verifying your claim. Settlement unlocks once all 3 attestations complete.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settle errors */}
          {settleError ? (
            <div className="mt-4 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3 text-sm text-red-300">
              {settleError.message}
            </div>
          ) : null}

          {/* Settle transaction digest */}
          {settleResult ? (
            <div className="mt-4 text-xs text-gray-400 break-all">
              <span className="text-gray-500">Tx digest: </span>
              <span className="font-mono text-cyan-400">{truncateId(settleResult.txDigest, 10, 8)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────

function Timeline({ claim, display }: { claim: ClaimDetail; display: DisplayStatus }) {
  type Node = { title: string; time?: number; done: boolean; muted?: boolean };
  const nodes: Node[] = [
    { title: 'Claim created', time: claim.createdAt, done: true },
    { title: 'Identity attestation', done: claim.attestationProgress.identity },
    { title: 'External data attestation', done: claim.attestationProgress.externalData },
    { title: 'Fraud check attestation', done: claim.attestationProgress.fraudCheck },
  ];
  if (display === 'settled') {
    nodes.push({ title: 'Claim settled', time: claim.settledAt, done: true });
  } else if (display === 'rejected') {
    nodes.push({ title: 'Claim rejected', time: claim.settledAt, done: true });
  } else {
    nodes.push({ title: 'Settlement', done: false, muted: true });
  }

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
      <h2 className="text-lg font-semibold mb-5">Timeline</h2>
      <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-white/10">
        {nodes.map((n, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="relative pl-8"
          >
            <span
              className={`absolute left-0 top-0.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border ${
                n.done
                  ? 'bg-green-400/15 border-green-400/50'
                  : n.muted
                    ? 'bg-white/5 border-white/15'
                    : 'bg-yellow-400/15 border-yellow-400/50'
              }`}
            >
              {n.done ? (
                <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              )}
            </span>
            <div className="flex items-center justify-between gap-3">
              <span className={`text-sm ${n.done ? 'text-white' : 'text-gray-400'}`}>{n.title}</span>
              <span className="text-xs text-gray-500 tabular-nums">{formatDate(n.time)}</span>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

// ─── Small shared glyphs / skeleton ───────────────────────────────────────

function StatusGlyph({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="w-9 h-9 rounded-full bg-green-400/15 border border-green-400/40 flex items-center justify-center">
        <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-11" />
        </svg>
      </span>
    );
  }
  return (
    <span className="w-9 h-9 rounded-full bg-yellow-400/10 border border-yellow-400/40 flex items-center justify-center">
      <svg className="w-5 h-5 text-yellow-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </span>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 animate-pulse">
        <div className="h-5 w-32 rounded bg-white/10 mb-6" />
        <div className="flex justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="h-4 w-48 rounded bg-white/10" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-20 rounded-full bg-white/10" />
            <div className="h-8 w-24 rounded bg-white/10" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-5 h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
