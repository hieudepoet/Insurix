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
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'rejected':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    default:
      return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  }
}

// ─── Emerald particle burst ─────────────────────────────────────────────

function ParticleBurst() {
  const particles = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      size: 4 + Math.random() * 6,
      delay: i * 0.03,
    };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-400"
          style={{ width: p.size, height: p.size }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Attestation card with animated progress bar ────────────────────────

function AttestationCard({
  att,
  verified,
  index,
}: {
  att: (typeof ATTESTATIONS)[number];
  verified: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', damping: 20, stiffness: 300 }}
      className="bg-[#0d1126] border border-white/[0.06] rounded-2xl p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 border ${
            verified
              ? 'bg-emerald-400/10 border-emerald-400/20'
              : 'bg-amber-400/10 border-amber-400/20'
          }`}
        >
          {att.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-100">{att.title}</div>
          <div className="text-xs text-slate-500 truncate">{att.desc}</div>
        </div>
        {verified ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-11" />
            </svg>
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 pulse-soft" />
            Pending
          </span>
        )}
      </div>

      {/* Animated progress bar */}
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${verified ? 'bg-emerald-400' : 'bg-amber-400/60'}`}
          initial={{ width: verified ? '0%' : '35%' }}
          animate={{ width: verified ? '100%' : '35%' }}
          transition={{ duration: 0.6, delay: index * 0.08 + 0.2, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

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
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/claims')}
          className="w-10 h-10 rounded-full bg-[#0d1126] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-100 transition shrink-0"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </motion.button>
        <span className="font-mono text-xs text-slate-500 truncate flex-1">
          {truncateId(claimId)}
        </span>
        {claim && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${statusClasses(normalizeStatus(claim.status))}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="capitalize">{normalizeStatus(claim.status)}</span>
          </span>
        )}
        {isPolling && (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 text-xs font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft" />
            Live
          </span>
        )}
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !claim ? (
        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-6 text-red-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
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

// ─── Detail body ────────────────────────────────────────────────────────

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
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        className="bg-[#0d1126] border border-white/[0.06] rounded-2xl p-6 text-center shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.04),_transparent_60%)]" />
        <div className="relative">
          <span className="text-2xl mb-2 block">
            {claim.claimType === 'flight-delay' ? '✈️' : '🌧️'}
          </span>
          <div className="text-5xl font-bold tracking-tight text-slate-50 tabular-nums mb-2">
            {formatUsd(claim.amount)}
          </div>
          <div className="text-sm font-medium text-slate-400">{claimTypeLabel(claim.claimType)}</div>
          <div className="text-xs text-slate-600 mt-1 tabular-nums">{formatDate(claim.createdAt)}</div>
        </div>
      </motion.div>

      {/* Settlement / Rejection banner — the authored delight moment */}
      <AnimatePresence mode="wait">
        {display === 'settled' && (
          <motion.div
            key="settled"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', damping: 16, stiffness: 250 }}
            className="relative bg-emerald-500/10 border border-emerald-400/30 rounded-2xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_40px_-8px_rgba(16,185,129,0.15)] overflow-hidden"
          >
            {/* Particle burst */}
            <ParticleBurst />
            <div className="relative flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-3">
                <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11" />
                </svg>
              </div>
              <div className="text-3xl font-bold tracking-tight text-emerald-400 mb-1">
                Claim Settled
              </div>
              <div className="text-4xl font-bold tracking-tight text-emerald-400 tabular-nums mb-2">
                {formatUsd(claim.amount)}
              </div>
              <p className="text-sm text-slate-400">
                Funds released{claim.settledAt ? ` on ${formatDate(claim.settledAt)}` : ''}
              </p>
              {settleResult && (
                <div className="mt-3 text-xs text-slate-500 break-all">
                  Tx: <span className="font-mono text-emerald-400/80">{truncateId(settleResult.txDigest, 8, 6)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {display === 'rejected' && (
          <motion.div
            key="rejected"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="bg-red-500/10 border border-red-400/30 rounded-2xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-400/30 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold tracking-tight text-red-400">
                  Claim Rejected
                </div>
                {claim.rejectionReason && (
                  <p className="text-sm text-slate-400 mt-1">{claim.rejectionReason}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attestation cards */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-semibold text-slate-400 px-1 mt-1">Attestations</h2>
        {ATTESTATIONS.map((a, i) => {
          const verified = claim.attestationProgress[a.key];
          return (
            <AttestationCard key={a.key} att={a} verified={verified} index={i} />
          );
        })}
      </div>

      {/* Timeline */}
      <Timeline claim={claim} display={display} />

      {/* Settle error */}
      {settleError && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          {settleError.message}
        </div>
      )}

      {/* Sticky settle button */}
      <AnimatePresence>
        {canSettle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2"
          >
            <div className="max-w-md mx-auto">
              <motion.button
                onClick={onSettle}
                disabled={settling}
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 rounded-2xl bg-emerald-500 text-[#052e1b] font-semibold text-base hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_32px_-8px_rgba(16,185,129,0.4)]"
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
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────

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
    <div className="bg-[#0d1126] border border-white/[0.06] rounded-2xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
      <h2 className="text-sm font-semibold text-slate-400 mb-4">Timeline</h2>
      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-px before:bg-white/10">
        {nodes.map((n, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="relative pl-7"
          >
            <span
              className={`absolute left-0 top-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border ${
                n.done
                  ? 'bg-emerald-400/15 border-emerald-400/50'
                  : n.muted
                    ? 'bg-white/5 border-white/15'
                    : 'bg-amber-400/15 border-amber-400/50'
              }`}
            >
              {n.done ? (
                <svg className="w-2.5 h-2.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5 9-11" />
                </svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-soft" />
              )}
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm ${n.done ? 'text-slate-200' : n.muted ? 'text-slate-600' : 'text-slate-400'}`}>
                {n.title}
              </span>
              <span className="text-xs text-slate-600 tabular-nums shrink-0">{formatDate(n.time)}</span>
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
      <div className="bg-[#0d1126] border border-white/[0.06] rounded-2xl p-6 text-center shimmer shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
        <div className="h-7 w-8 rounded bg-white/5 mx-auto mb-4" />
        <div className="h-12 w-32 rounded bg-white/5 mx-auto mb-3" />
        <div className="h-4 w-28 rounded bg-white/5 mx-auto" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-[#0d1126] border border-white/[0.06] rounded-2xl p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] shimmer">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/5" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 rounded bg-white/5" />
              <div className="h-3 w-32 rounded bg-white/5" />
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5" />
        </div>
      ))}
    </div>
  );
}
