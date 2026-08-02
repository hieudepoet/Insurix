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

// ─── Small presentational helpers ────────────────────────────────────────

function StatusBadge({ status }: { status: ClaimListItem['status'] }) {
  const map = {
    pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    settled: 'text-green-400 bg-green-400/10 border-green-400/30',
    rejected: 'text-red-400 bg-red-400/10 border-red-400/30',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${map[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span className="capitalize">{status}</span>
    </span>
  );
}

function TypeIcon({ type }: { type: ClaimType }) {
  return (
    <span className="text-xl">
      {type === 'flight-delay' ? '✈️' : '🌧️'}
    </span>
  );
}

function AttestationDots({ progress }: { progress: ClaimListItem['attestationProgress'] }) {
  const dots = [progress.identity, progress.externalData, progress.fraudCheck];
  return (
    <div className="flex items-center gap-1.5">
      {dots.map((on, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${on ? 'bg-green-400' : 'bg-white/15'}`}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3 shimmer">
      <div className="flex items-center justify-between">
        <div className="h-6 w-8 rounded bg-white/10" />
        <div className="h-6 w-16 rounded-full bg-white/10" />
      </div>
      <div className="h-7 w-24 rounded bg-white/10" />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
          <div className="h-2 w-2 rounded-full bg-white/10" />
        </div>
        <div className="h-4 w-24 rounded bg-white/10" />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────

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
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Your Claims</h1>
          {claims && claims.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-white/10 text-white/60 text-xs font-medium">
              {claims.length}
            </span>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
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
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="rounded-2xl bg-red-500/5 backdrop-blur-xl border border-red-500/20 p-6 text-red-300">
          <p className="font-medium">Failed to load claims</p>
          <p className="text-sm text-red-400/70 mt-1">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
      ) : !claims || claims.length === 0 ? (
        // Empty state
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center py-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 text-3xl">
            📋
          </div>
          <h2 className="text-lg font-semibold mb-2">No claims yet</h2>
          <p className="text-white/50 text-sm mb-6 px-6">
            Create your first parametric claim to get started.
          </p>
          <button
            onClick={() => router.push('/claims/new')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Create your first claim
          </button>
        </motion.div>
      ) : (
        // Claims list — mobile card stack
        <AnimatePresence>
          <div className="space-y-3">
            {claims.map((claim, i) => (
              <motion.button
                key={claim.claimId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => router.push(`/claims/${claim.claimId}`)}
                className="w-full text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] active:scale-[0.98] transition-all"
              >
                {/* Top row: type icon + label (left) + status badge (right) */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TypeIcon type={claim.claimType} />
                    <span className="text-sm text-white/70">{claimTypeLabel(claim.claimType)}</span>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                {/* Middle: large amount */}
                <div className="text-2xl font-bold text-white tabular-nums mb-3">
                  {formatUsd(claim.amount)}
                </div>

                {/* Bottom: attestation dots + date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AttestationDots progress={claim.attestationProgress} />
                    <span className="text-xs text-white/40 tabular-nums">
                      {truncateId(claim.claimId)}
                    </span>
                  </div>
                  <span className="text-xs text-white/40 tabular-nums">
                    {formatDate(claim.createdAt)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
