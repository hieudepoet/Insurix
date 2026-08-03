"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SCENARIO_SUCCESS, SCENARIO_HEALTH, SCENARIO_FAILURE, formatUsd, findPolicy, type Claim } from "@/data/mock";
import { PrimaryButton, GhostButton, GLASS } from "@/components/ui";

const EVENTS = [SCENARIO_SUCCESS, SCENARIO_HEALTH, SCENARIO_FAILURE];

export default function NewClaimPage() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [selected, setSelected] = useState<Claim | null>(null);

  return (
    <div className="px-4 pt-3 pb-4 flex flex-col gap-4 min-h-full">
      <div className="flex items-center justify-between">
        <button
          onClick={() => (step === 0 ? router.back() : setStep(0))}
          aria-label="Back"
          className="w-8 h-8 rounded-full bg-[var(--color-canvas)] flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 5 8 12l7 7" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex gap-1.5">
          <span className={`h-1.5 w-6 rounded-full ${step >= 0 ? "bg-[var(--color-gold)]" : "bg-[var(--color-hairline)]"}`} />
          <span className={`h-1.5 w-6 rounded-full ${step >= 1 ? "bg-[var(--color-gold)]" : "bg-[var(--color-hairline)]"}`} />
        </div>
        <div className="w-9" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="pick"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3.5"
          >
            <div>
              <h1 className="text-[17px] font-extrabold text-[var(--color-ink)]">
                We noticed something
              </h1>
              <p className="text-[11.5px] text-[var(--color-slate)] mt-1 leading-relaxed">
                These events were detected against your active policies. Pick the one you&rsquo;d
                like to file a claim for.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {EVENTS.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => {
                    setSelected(claim);
                    setStep(1);
                  }}
                  className={`text-left rounded-[16px] ${GLASS} p-3 flex flex-col gap-1.5`}
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.45)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold tracking-wide text-[var(--color-gold)] uppercase">
                      {findPolicy(claim.policyId)?.name}
                    </span>
                    <span
                      className="text-[9px] font-bold px-2 h-5 rounded-full inline-flex items-center"
                      style={{ background: "rgba(52,211,153,0.14)", color: "var(--color-green)" }}
                    >
                      THRESHOLD MET
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-[var(--color-ink)]">{claim.title}</p>
                  <p className="text-[11px] text-[var(--color-slate)]">{claim.subtitle}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[11px] font-semibold text-[var(--color-ink)]">
                      Est. payout {formatUsd(claim.amountUsd)}
                    </span>
                    <span className="text-[11px] font-bold text-[var(--color-gold)]">File claim →</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          selected && <ReviewStep key="review" claim={selected} onBack={() => setStep(0)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewStep({ claim, onBack }: { claim: Claim; onBack: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-3.5"
    >
      <div>
        <h1 className="text-[17px] font-extrabold text-[var(--color-ink)]">Review your claim</h1>
        <p className="text-[11.5px] text-[var(--color-slate)] mt-1 leading-relaxed">
          Confirm the details below. We&rsquo;ll run three independent checkpoints before settling.
        </p>
      </div>

      <div className={`rounded-[16px] ${GLASS} p-3.5 flex flex-col gap-3`} style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.45)" }}>
        <div>
          <p className="text-[13px] font-bold text-[var(--color-ink)]">{claim.title}</p>
          <p className="text-[11px] text-[var(--color-slate)]">{claim.subtitle}</p>
        </div>
        <div className="h-px bg-[var(--color-hairline)]" />
        <div className="flex flex-col gap-2">
          {claim.eventSummary.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11.5px] text-[var(--color-slate)] font-medium">{row.label}</span>
              <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-[var(--color-hairline)]" />
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-bold text-[var(--color-ink)]">Estimated payout</span>
          <span className="text-[15px] font-extrabold text-[var(--color-gold)]">
            {formatUsd(claim.amountUsd)}
          </span>
        </div>
      </div>

      <p className="text-[10.5px] text-[var(--color-slate)] leading-relaxed px-1">
        By filing, you confirm this claim is accurate to the best of your knowledge. Identity,
        external data, and fraud checkpoints run automatically — most claims settle in under a
        minute.
      </p>

      <div className="flex flex-col gap-2.5 mt-1">
        <PrimaryButton onClick={() => router.push(`/claims/${claim.id}/processing`)}>
          File Claim &amp; Verify
        </PrimaryButton>
        <GhostButton onClick={onBack}>Choose a different event</GhostButton>
      </div>
    </motion.div>
  );
}
