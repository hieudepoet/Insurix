'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { claimsApi, type ClaimType } from '@/lib/api-client';
import { WalletConnect } from '@/components/WalletConnect';

interface FormState {
  claimType: ClaimType;
  description: string;
  amount: string;
  flightNumber: string;
  date: string;
  location: string;
  rainThreshold: string;
}

const INITIAL: FormState = {
  claimType: 'flight-delay',
  description: '',
  amount: '',
  flightNumber: '',
  date: '',
  location: '',
  rainThreshold: '',
};

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 transition';
const labelClass = 'block text-sm font-medium text-gray-300 mb-2';

export default function NewClaimPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);

  const mutation = useMutation({
    mutationFn: async (state: FormState) => {
      if (!account) throw new Error('Wallet not connected');
      const amount = Number(state.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Please enter a valid claim amount in SUI.');
      }
      const params: Record<string, string | number> = {};
      if (state.claimType === 'flight-delay') {
        if (!state.flightNumber.trim()) throw new Error('Flight number is required.');
        if (!state.date) throw new Error('Flight date is required.');
        params.flightNumber = state.flightNumber.trim();
        params.date = state.date;
      } else {
        if (!state.location.trim()) throw new Error('Location is required.');
        const threshold = Number(state.rainThreshold);
        if (!Number.isFinite(threshold) || threshold < 0) {
          throw new Error('Please enter a valid rain threshold in mm.');
        }
        params.location = state.location.trim();
        params.rainThreshold = threshold;
      }
      if (!state.description.trim()) throw new Error('A short description is required.');

      return claimsApi.createClaim({
        walletAddress: account.address,
        claimType: state.claimType,
        description: state.description.trim(),
        amount,
        params,
      });
    },
    onSuccess: (data) => {
      router.push(`/claims/${data.claimId}`);
    },
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  // Not connected → prompt.
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
          You need to connect a Sui wallet before submitting a claim on-chain.
        </p>
        <div className="[&_button]:!bg-white/5 [&_button]:!border-white/10">
          <WalletConnect />
        </div>
      </motion.div>
    );
  }

  const isFlight = form.claimType === 'flight-delay';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link href="/claims" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to claims
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8"
      >
        <h1 className="text-2xl font-bold mb-1">Submit a Claim</h1>
        <p className="text-gray-400 text-sm mb-8">
          File a parametric insurance claim. AI agents will verify it on-chain via Sui attestations.
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Claim type */}
          <div>
            <label className={labelClass}>Claim type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['flight-delay', 'weather'] as ClaimType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update('claimType', t)}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    form.claimType === t
                      ? 'border-cyan-400/50 bg-cyan-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {t === 'flight-delay' ? (
                    <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.5 13.5 3 17v-2.2l7.5-3.8V5a1.5 1.5 0 1 1 3 0v6l7.5 3.8V17l-7.5-3.5" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 14a4 4 0 0 0 .5-7.97 6 6 0 0 0-11.32 1.2A4.5 4.5 0 0 0 6 14" />
                      <path d="M8 19v2M12 17v4M16 19v2" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">
                    {t === 'flight-delay' ? 'Flight Delay' : 'Weather (Rainfall)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional fields */}
          {isFlight ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="flightNumber" className={labelClass}>Flight number</label>
                <input
                  id="flightNumber"
                  className={inputClass}
                  placeholder="e.g. UA 250"
                  value={form.flightNumber}
                  onChange={(e) => update('flightNumber', e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <div>
                <label htmlFor="date" className={labelClass}>Flight date</label>
                <input
                  id="date"
                  type="date"
                  className={`${inputClass} [color-scheme:dark]`}
                  value={form.date}
                  onChange={(e) => update('date', e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className={labelClass}>Location</label>
                <input
                  id="location"
                  className={inputClass}
                  placeholder="e.g. Singapore"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
              <div>
                <label htmlFor="rainThreshold" className={labelClass}>Rain threshold (mm)</label>
                <input
                  id="rainThreshold"
                  type="number"
                  min="0"
                  step="0.1"
                  className={inputClass}
                  placeholder="e.g. 50"
                  value={form.rainThreshold}
                  onChange={(e) => update('rainThreshold', e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label htmlFor="amount" className={labelClass}>Claim amount (SUI)</label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.0001"
              className={inputClass}
              placeholder="e.g. 5"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>Description</label>
            <textarea
              id="description"
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Describe what happened and why this claim applies…"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              disabled={mutation.isPending}
            />
          </div>

          {/* Error */}
          {mutation.isError && (
            <div className="rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3 text-sm text-red-300">
              {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong.'}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <Link
              href="/claims"
              className="px-5 py-3 rounded-full border border-white/15 text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity glow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating claim on-chain…
                </>
              ) : (
                'Submit Claim'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
