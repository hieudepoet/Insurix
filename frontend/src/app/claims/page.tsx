'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  claimsApi,
  truncateId,
  formatSui,
  formatDate,
  claimTypeLabel,
  attestationCount,
  type ClaimListItem,
  type ClaimType,
} from '@/lib/api-client';
import { WalletConnect } from '@/components/WalletConnect';

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

function AttestationProgress({ claim }: { claim: ClaimListItem }) {
  const count = attestationCount(claim.attestationProgress);
  const dots = [
    claim.attestationProgress.identity,
    claim.attestationProgress.externalData,
    claim.attestationProgress.fraudCheck,
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {dots.map((on, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${on ? 'bg-green-400' : 'bg-white/15'}`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 tabular-nums">{count}/3 verified</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 animate-pulse">
      <div className="h-5 w-24 rounded bg-white/10" />
      <div className="h-5 w-28 rounded bg-white/10" />
      <div className="h-5 w-20 rounded bg-white/10" />
      <div className="h-5 w-16 rounded bg-white/10" />
      <div className="h-5 w-24 rounded bg-white/10" />
      <div className="ml-auto h-5 w-28 rounded bg-white/10" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const address = account?.address ?? '';

  const { data: claims, isLoading, isError, error } = useQuery({
    queryKey: ['claims', address],
    queryFn: () => claimsApi.getClaims(address),
    enabled: !!address,
  });

  // Not connected → prompt to connect wallet.
  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center py-24"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Connect your wallet</h2>
        <p className="text-gray-400 mb-8 max-w-sm">
          Connect a Sui wallet to view and manage your parametric insurance claims.
        </p>
        <div className="[&_button]:!bg-white/5 [&_button]:!border-white/10">
          <WalletConnect />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
          <p className="text-gray-400 mt-1">
            Track the attestation and settlement status of your claims.
          </p>
        </div>
        <Link
          href="/claims/new"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity glow"
        >
          + New Claim
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
          {[0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)}
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
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center py-24 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">No claims yet</h2>
          <p className="text-gray-400 mb-8 max-w-sm">
            You haven&apos;t submitted any insurance claims. File your first parametric claim to get started.
          </p>
          <Link
            href="/claims/new"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold hover:opacity-90 transition-opacity glow"
          >
            Submit a Claim
          </Link>
        </motion.div>
      ) : (
        // Claims list
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
          {/* Column header (desktop) */}
          <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_0.8fr] gap-4 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-white/5">
            <span>Claim ID</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Attestations</span>
            <span className="text-right">Created</span>
          </div>

          <div className="divide-y divide-white/5">
            {claims.map((claim, i) => (
              <motion.button
                key={claim.claimId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                onClick={() => router.push(`/claims/${claim.claimId}`)}
                className="w-full text-left grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_0.8fr] gap-4 px-5 py-4 hover:bg-white/5 transition-colors group"
              >
                {/* Claim ID */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm text-cyan-400 truncate">
                    {truncateId(claim.claimId)}
                  </span>
                </div>

                {/* Type */}
                <div className="flex items-center gap-2">
                  <TypeIcon type={claim.claimType} />
                  <span className="text-sm text-gray-200">{claimTypeLabel(claim.claimType)}</span>
                </div>

                {/* Amount */}
                <div className="text-sm font-medium text-white tabular-nums">
                  {formatSui(claim.amount)}
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={claim.status} />
                </div>

                {/* Attestation progress */}
                <div>
                  <AttestationProgress claim={claim} />
                </div>

                {/* Created date */}
                <div className="text-sm text-gray-400 md:text-right tabular-nums">
                  {formatDate(claim.createdAt)}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
