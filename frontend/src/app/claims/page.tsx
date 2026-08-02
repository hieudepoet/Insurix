'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  claimsApi,
  truncateId,
  formatUsd,
  formatDate,
  claimTypeLabel,
  type ClaimListItem,
  type ClaimType,
} from '@/lib/api-client';
import { useSession } from '@/lib/session';

// ─── Spring transition presets ──────────────────────────────────────────

const springSoft = { type: 'spring' as const, damping: 20, stiffness: 300 };
const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: springSoft,
  },
};

// ─── Status badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClaimListItem['status'] }) {
  const map = {
    pending: {
      text: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
    },
    settled: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
    },
    rejected: {
      text: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/30',
    },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.bg} ${s.border} ${s.text}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

// ─── Type icon circle ───────────────────────────────────────────────────

function TypeIconCircle({ type, size = 'md' }: { type: ClaimType; size?: 'md' | 'lg' }) {
  const isFlight = type === 'flight-delay';
  const dim = size === 'lg' ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl';
  return (
    <div
      className={`${dim} rounded-full flex items-center justify-center shrink-0 ${
        isFlight
          ? 'bg-emerald-400/10 border border-emerald-400/20'
          : 'bg-blue-400/10 border border-blue-400/20'
      }`}
    >
      <span>{isFlight ? '✈️' : '🌧️'}</span>
    </div>
  );
}

// ─── Attestation progress bars ──────────────────────────────────────────

function AttestationBars({ progress }: { progress: ClaimListItem['attestationProgress'] }) {
  const bars = [progress.identity, progress.externalData, progress.fraudCheck];
  return (
    <div className="flex items-center gap-1.5">
      {bars.map((on, i) => (
        <div key={i} className="h-1.5 w-8 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${on ? 'bg-emerald-400' : 'bg-amber-400/60'}`}
            initial={{ width: on ? '0%' : '35%' }}
            animate={{ width: on ? '100%' : '35%' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Compact claim card ─────────────────────────────────────────────────

function CompactClaimCard({ claim, index }: { claim: ClaimListItem; index: number }) {
  const router = useRouter();
  return (
    <motion.button
      initial={stagger.item.initial}
      animate={stagger.item.animate}
      exit={stagger.item.exit}
      transition={{ ...springSoft, delay: index * 0.07 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(`/claims/${claim.claimId}`)}
      className="w-full text-left bg-[#0d1126] border border-white/[0.06] rounded-2xl p-4 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] transition-shadow"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <TypeIconCircle type={claim.claimType} />
          <span className="text-sm font-medium text-slate-300">{claimTypeLabel(claim.claimType)}</span>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      {/* Amount */}
      <div className="text-3xl font-bold tracking-tight text-slate-50 tabular-nums mb-3">
        {formatUsd(claim.amount)}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AttestationBars progress={claim.attestationProgress} />
          <span className="font-mono text-xs text-slate-500">{truncateId(claim.claimId)}</span>
        </div>
        <span className="text-xs text-slate-500 tabular-nums">{formatDate(claim.createdAt)}</span>
      </div>
    </motion.button>
  );
}

// ─── Featured pending card ──────────────────────────────────────────────

function FeaturedPendingCard({ claim, index }: { claim: ClaimListItem; index: number }) {
  const router = useRouter();
  return (
    <motion.button
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260, delay: index * 0.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(`/claims/${claim.claimId}`)}
      className="w-full text-left bg-[#0d1126] border border-amber-400/15 rounded-2xl p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_0_40px_-12px_rgba(245,158,11,0.15)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),0_0_60px_-12px_rgba(245,158,11,0.2)] transition-shadow"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TypeIconCircle type={claim.claimType} size="lg" />
          <div>
            <div className="text-sm font-medium text-slate-300">{claimTypeLabel(claim.claimType)}</div>
            <div className="text-xs text-slate-500">Pending review</div>
          </div>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      {/* Amount — big */}
      <div className="text-4xl font-bold tracking-tight text-slate-50 tabular-nums mb-4">
        {formatUsd(claim.amount)}
      </div>

      {/* Progress label + bars */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400">Attestation Progress</span>
        <span className="font-mono text-xs text-slate-500">{truncateId(claim.claimId)}</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <AttestationBars progress={claim.attestationProgress} />
      </div>

      {/* Date */}
      <div className="text-xs text-slate-500 tabular-nums">{formatDate(claim.createdAt)}</div>
    </motion.button>
  );
}

// ─── Skeleton cards ─────────────────────────────────────────────────────

function SkeletonCard({ large }: { large?: boolean }) {
  return (
    <div
      className={`bg-[#0d1126] border border-white/[0.06] rounded-2xl p-${large ? '5' : '4'} space-y-3 shimmer shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`${large ? 'w-12 h-12' : 'w-10 h-10'} rounded-full bg-white/5`} />
          <div className="space-y-1.5">
            <div className="h-3 w-20 rounded bg-white/5" />
            {large && <div className="h-2 w-14 rounded bg-white/5" />}
          </div>
        </div>
        <div className="h-6 w-16 rounded-full bg-white/5" />
      </div>
      <div className={`h-${large ? '9' : '7'} w-28 rounded bg-white/5`} />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-1.5 w-8 rounded-full bg-white/5" />
          <div className="h-1.5 w-8 rounded-full bg-white/5" />
          <div className="h-1.5 w-8 rounded-full bg-white/5" />
        </div>
        <div className="h-3 w-24 rounded bg-white/5" />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const { address } = useSession();
  const router = useRouter();

  const {
    data: claims,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['claims', address],
    queryFn: () => claimsApi.getClaims(),
    refetchInterval: 2000, // poll every 2 seconds for status updates
  });

  // Sort: pending first, then by date desc
  const sortedClaims = claims
    ? [...claims].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return b.createdAt - a.createdAt;
      })
    : [];

  const hasPending = sortedClaims.some((c) => c.status === 'pending');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">Your Claims</h1>
          {claims && claims.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.75rem] h-6 px-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs font-semibold">
              {claims.length}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-9 h-9 rounded-full bg-[#0d1126] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-[#131833] transition disabled:opacity-40"
          aria-label="Refresh"
        >
          <svg
            className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1.06 6.62 2.84L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {hasPending ? <SkeletonCard large /> : null}
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-6 text-red-300 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
          <p className="font-medium">Failed to load claims</p>
          <p className="text-sm text-red-400/70 mt-1">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
      ) : !claims || claims.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="flex flex-col items-center justify-center text-center py-20 rounded-2xl bg-[#0d1126] border border-white/[0.06] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
        >
          <div className="w-20 h-20 rounded-2xl bg-emerald-400/5 border border-emerald-400/10 flex items-center justify-center mb-6 text-4xl">
            📋
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 mb-2">No claims yet</h2>
          <p className="text-slate-400 text-sm mb-8 px-6 max-w-xs">
            Create your first parametric insurance claim to get started with automated payouts.
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/claims/new')}
            className="px-6 py-3 rounded-2xl bg-emerald-500 text-[#052e1b] font-semibold text-sm hover:opacity-90 transition flex items-center gap-2"
          >
            Create your first claim
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>
      ) : (
        /* Claims list */
        <AnimatePresence>
          <div className="space-y-3">
            {sortedClaims.map((claim, i) =>
              claim.status === 'pending' && hasPending && i === 0 ? (
                <FeaturedPendingCard key={claim.claimId} claim={claim} index={i} />
              ) : (
                <CompactClaimCard key={claim.claimId} claim={claim} index={i} />
              ),
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
