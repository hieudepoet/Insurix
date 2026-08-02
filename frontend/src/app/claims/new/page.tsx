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
  'w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400/40 transition';
const labelClass = 'block text-sm font-medium text-white/60 mb-2';

export default function NewClaimPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);

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

  const isFlight = form.claimType === 'flight-delay';

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/claims')}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">New Claim</h1>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
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
              <button
                key={t.value}
                type="button"
                onClick={() => update('claimType', t.value)}
                className={`flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-medium transition-all ${
                  form.claimType === t.value
                    ? 'border-cyan-400/60 bg-cyan-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            rows={3}
            className={`${inputClass} h-auto py-3 resize-none`}
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-base font-semibold">$</span>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              className={`${inputClass} pl-8 text-2xl font-bold`}
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
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
            className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300"
          >
            {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong.'}
          </motion.div>
        )}

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* Submit button — sticky at bottom */}
        <div className="sticky bottom-4 pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Processing…
              </>
            ) : (
              'Submit Claim'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
