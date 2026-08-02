'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { claimsApi, type ClaimType } from '@/lib/api-client';

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
  'w-full h-14 rounded-2xl bg-[#0d1126] border border-white/5 px-4 text-base text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/30 focus:ring-2 focus:ring-emerald-500/10 transition';
const labelClass = 'block text-sm font-medium text-slate-400 mb-2';

const springSoft = { type: 'spring' as const, damping: 20, stiffness: 300 };

export default function NewClaimPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: async (state: FormState) => {
      const amount = Number(state.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Please enter a valid claim amount in USD.');
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
        claimType: state.claimType,
        description: state.description.trim(),
        amount,
        params,
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/claims');
      }, 1200);
    },
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const isFlight = form.claimType === 'flight-delay';

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem-4rem)]">
      {/* Success burst overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#060818]/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mb-4">
                <motion.svg
                  className="w-10 h-10 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <path d="M5 12l5 5 9-11" />
                </motion.svg>
              </div>
              <p className="text-lg font-semibold text-slate-100">Claim Submitted!</p>
              <p className="text-sm text-slate-400 mt-1">Redirecting…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/claims')}
          className="w-10 h-10 rounded-full bg-[#0d1126] border border-white/[0.06] flex items-center justify-center text-slate-400 hover:text-slate-100 transition"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </motion.button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">New Claim</h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 280 }}
        onSubmit={onSubmit}
        className="flex flex-col gap-5 flex-1"
      >
        {/* Type segmented control */}
        <div>
          <label className={labelClass}>Claim type</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: 'flight-delay' as ClaimType, icon: '✈️', label: 'Flight Delay' },
              { value: 'weather' as ClaimType, icon: '🌧️', label: 'Weather' },
            ]).map((t) => (
              <motion.button
                key={t.value}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => update('claimType', t.value)}
                className={`flex items-center justify-center gap-2 h-14 rounded-2xl border text-sm font-medium transition-all ${
                  form.claimType === t.value
                    ? 'border-emerald-500/40 bg-[#0d1126] text-slate-50 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]'
                    : 'border-white/5 bg-[#0d1126]/50 text-slate-500 hover:bg-[#0d1126] hover:text-slate-300'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span>{t.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            rows={3}
            className={`${inputClass} h-auto py-3.5 resize-none`}
            placeholder="Describe what happened and why this claim applies…"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            disabled={mutation.isPending}
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className={labelClass}>Claim amount (USD)</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-2xl font-bold">$</span>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass} pl-10 text-4xl font-bold tracking-tight h-16`}
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              disabled={mutation.isPending}
            />
          </div>
        </div>

        {/* Conditional fields */}
        <AnimatePresence mode="wait">
          {isFlight ? (
            <motion.div
              key="flight"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={springSoft}
              className="overflow-hidden space-y-4"
            >
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
            </motion.div>
          ) : (
            <motion.div
              key="weather"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={springSoft}
              className="overflow-hidden space-y-4"
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        {mutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300"
          >
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong.'}
          </motion.div>
        )}

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* Submit button — sticky at bottom */}
        <div className="sticky bottom-4 pt-4">
          <motion.button
            type="submit"
            disabled={mutation.isPending}
            whileTap={{ scale: 0.98 }}
            className="w-full h-14 rounded-2xl bg-emerald-500 text-[#052e1b] font-semibold text-base hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_24px_-4px_rgba(16,185,129,0.3)]"
          >
            {mutation.isPending ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Processing claim…
              </>
            ) : (
              'Submit Claim'
            )}
          </motion.button>
        </div>
      </motion.form>
    </div>
  );
}
