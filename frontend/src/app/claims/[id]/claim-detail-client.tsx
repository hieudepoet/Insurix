'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  claimsApi,
  truncateId,
  formatUsd,
  formatDate,
  claimTypeLabel,
  type ClaimDetail,
  type ClaimType,
} from '@/lib/api-client';

// Attestation card metadata
const ATTESTATIONS = [
  {
    key: 'identity' as const,
    title: 'Identity',
    icon: '🪪',
    desc: 'Confirms the claimant wallet identity via on-chain attestation.',
  },
  {
    key: 'externalData' as const,
    title: 'External Data',
    icon: '📡',
    desc: 'Flight status or rainfall data cross-checked against trusted sources.',
  },
  {
    key: 'fraudCheck' as const,
    title: 'Fraud Check',
    icon: '🛡️',
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

// ─── Main component ──────────────────────────────────────────────────────

export function ClaimDetailClient({ claimId }: { claimId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: claim, isLoading, isError, error } = useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => claimsApi.getClaim(claimId),
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

  const isPolling = claim && claim.status !== 'settled' && claim.status !== 'rejected';

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/claims')}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-mono text-sm text-cyan-400 truncate flex-1">
          {truncateId(claimId)}
        </span>
        {claim && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${statusClasses(normalizeStatus(claim.status))}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="capitalize">{normalizeStatus(claim.status)}</span>
          </span>
        )}
        {isPolling && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-xs font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live
          </span>
        )}
      </div>

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
    <div className="flex flex-col gap-3 pb-20">
      {/* Amount card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center"
      >
        <span className="text-xl mb-1 block">
          {claim.claimType === 'flight-delay' ? '✈️' : '🌧️'}
        </span>
        <div className="text-3xl font-bold text-white tabular-nums mb-1">
          {formatUsd(claim.amount)}
        </div>
        <div className="text-sm text-white/50">{claimTypeLabel(claim.claimType)}</div>
        <div className="text-xs text-white/30 mt-1">{formatDate(claim.createdAt)}</div>
      </motion.div>

      {/* Settlement result banner */}
      {(display === 'settled' || display === 'rejected') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 ${
            display === 'settled'
              ? 'bg-green-400/10 border-green-400/30'
              : 'bg-red-400/10 border-red-400/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{display === 'settled' ? '✅' : '❌'}</span>
            <div className="flex-1">
              <div className={`font-semibold text-sm ${display === 'settled' ? 'text-green-400' : 'text-red-400'}`}>
                {display === 'settled' ? 'Claim Settled' : 'Claim Rejected'}
              </div>
              {display === 'settled' && (
                <p className="text-xs text-white/50 mt-0.5">
                  Funds released — {formatUsd(claim.amount)}
                  {claim.settledAt ? ` on ${formatDate(claim.settledAt)}` : ''}
                </p>
              )}
              {display === 'rejected' && claim.rejectionReason && (
                <p className="text-xs text-white/50 mt-0.5">{claim.rejectionReason}</p>
              )}
            </div>
          </div>
          {settleResult && (
            <div className="mt-2 text-xs text-white/30 break-all">
              Tx: <span className="font-mono text-cyan-400">{truncateId(settleResult.txDigest, 8, 6)}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Attestation cards */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/60 px-1">Attestations</h2>
        {ATTESTATIONS.map((a, i) => {
          const verified = claim.attestationProgress[a.key];
          return (
            <motion.div
              key={a.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <span className="text-2xl shrink-0">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{a.title}</div>
                <div className="text-xs text-white/40 truncate">{a.desc}</div>
              </div>
              {verified ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  Pending
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Timeline */}
      <Timeline claim={claim} display={display} />

      {/* Settle error */}
      {settleError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          {settleError.message}
        </div>
      )}

      {/* Sticky settle button */}
      {canSettle && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2">
          <div className="max-w-md mx-auto">
            <button
              onClick={onSettle}
              disabled={settling}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20"
            >
              {settling ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Settling…
                </>
              ) : (
                'Settle Claim'
              )}
            </button>
          </div>
        </div>
      )}
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-white/60 mb-4">Timeline</h2>
      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-white/10">
        {nodes.map((n, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative pl-7"
          >
            <span
              className={`absolute left-0 top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border ${
                n.done
                  ? 'bg-green-400/15 border-green-400/50'
                  : n.muted
                    ? 'bg-white/5 border-white/15'
                    : 'bg-yellow-400/15 border-yellow-400/50'
              }`}
            >
              {n.done ? (
                <svg className="w-2.5 h-2.5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              )}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm ${n.done ? 'text-white' : n.muted ? 'text-white/30' : 'text-white/60'}`}>
                {n.title}
              </span>
              <span className="text-xs text-white/30 tabular-nums shrink-0">{formatDate(n.time)}</span>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center shimmer">
        <div className="h-6 w-8 rounded bg-white/10 mx-auto mb-3" />
        <div className="h-8 w-24 rounded bg-white/10 mx-auto mb-2" />
        <div className="h-4 w-32 rounded bg-white/10 mx-auto" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3 shimmer">
          <div className="w-8 h-8 rounded bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-20 rounded bg-white/10" />
            <div className="h-3 w-32 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
