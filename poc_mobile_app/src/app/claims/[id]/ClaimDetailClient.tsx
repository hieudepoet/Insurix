"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { findAnyClaim, formatUsd, formatDate, type Claim } from "@/data/mock";
import { loadResolvedClaim } from "@/lib/claimStore";
import { PrimaryButton, GhostButton, ScreenHeader, GLASS } from "@/components/ui";
import { CheckpointStrip } from "@/components/CheckpointStrip";
import { GoldBurst } from "@/components/GoldBurst";
import { playSettleFlourish, playRejectTone } from "@/lib/sound";

export function ClaimDetailClient({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [claim, setClaim] = useState<Claim | null | undefined>(undefined);

  useEffect(() => {
    const resolved = loadResolvedClaim(claimId) ?? findAnyClaim(claimId) ?? null;
    setClaim(resolved);
    if (resolved?.status === "pending") {
      router.replace(`/claims/${claimId}/processing`);
    }
  }, [claimId, router]);

  if (claim === undefined) {
    return <div className="px-5 pt-16 text-center text-[var(--color-slate)] text-[13px]">Loading…</div>;
  }
  if (claim === null || claim.status === "pending") {
    return null;
  }

  return claim.status === "settled" ? (
    <SettledView claim={claim} />
  ) : (
    <RejectedView claim={claim} />
  );
}

function SettledView({ claim }: { claim: Claim }) {
  const router = useRouter();
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playSettleFlourish();
  }, []);
  return (
    <div className="px-4 pt-2 pb-4 flex flex-col gap-3">
      <ScreenHeader title="Attestation Passport" onBack={() => router.push("/")} />

      <div className="flex flex-col items-center text-center gap-2 pt-1">
        <div className="relative w-14 h-14">
          <GoldBurst />
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "rgba(52,211,153,0.14)" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 9.5 17 19 7" stroke="var(--color-green)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </div>
        <div>
          <p className="text-[11px] font-bold text-[var(--color-green)] tracking-wide uppercase">
            Claim settled
          </p>
          <p className="text-[24px] font-extrabold text-[var(--color-ink)] mt-0.5">
            {formatUsd(claim.amountUsd)}
          </p>
          <p className="text-[11px] text-[var(--color-slate)] mt-0.5">Paid instantly to your account</p>
        </div>
      </div>

      <div
        className={`rounded-[16px] ${GLASS} p-3.5 flex flex-col gap-3`}
        style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-[var(--color-ink)]">Attestation stamps</p>
          <span className="text-[11px] font-mono text-[var(--color-slate)]">{claim.id}</span>
        </div>
        <CheckpointStrip checkpoints={claim.checkpoints} />
        <div className="h-px bg-[var(--color-hairline)]" />
        <div className="flex flex-col gap-2">
          {claim.eventSummary.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11.5px] text-[var(--color-slate)] font-medium">{row.label}</span>
              <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">{row.value}</span>
            </div>
          ))}
          {claim.settledAt && (
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-[var(--color-slate)] font-medium">Settled</span>
              <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">
                {formatDate(claim.settledAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <PrimaryButton onClick={() => router.push("/")}>Back to Home</PrimaryButton>
        <GhostButton onClick={() => router.push("/claims")}>View All Claims</GhostButton>
      </div>
    </div>
  );
}

function RejectedView({ claim }: { claim: Claim }) {
  const router = useRouter();
  const [appealed, setAppealed] = useState(false);
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playRejectTone();
  }, []);

  return (
    <div className="px-4 pt-2 pb-4 flex flex-col gap-2.5">
      <ScreenHeader title="Attestation Passport" onBack={() => router.push("/")} />

      <div className="flex flex-col items-center text-center gap-1.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(242,97,122,0.14)" }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v5M12 16.2v.2" stroke="var(--color-rose)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" stroke="var(--color-rose)" strokeWidth="1.8" />
          </svg>
        </div>
        <div>
          <p className="text-[10.5px] font-bold text-[var(--color-rose)] tracking-wide uppercase">
            Claim rejected
          </p>
          <p className="text-[13px] font-bold text-[var(--color-ink)] mt-1 leading-snug px-2">
            {claim.rejectionReason}
          </p>
        </div>
      </div>

      <div
        className={`rounded-[16px] ${GLASS} p-3 flex flex-col gap-2.5`}
        style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11.5px] font-bold text-[var(--color-ink)]">Attestation stamps</p>
          <span className="text-[11px] font-mono text-[var(--color-slate)]">{claim.id}</span>
        </div>
        <CheckpointStrip checkpoints={claim.checkpoints} />
        <p className="text-[10px] text-[var(--color-slate)] leading-snug">
          Two checkpoints verified independently — the fraud checkpoint alone stopped
          settlement, nothing was hidden.
        </p>
        <div className="h-px bg-[var(--color-hairline)]" />
        <div className="flex flex-col gap-1.5">
          {claim.eventSummary.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-[11.5px] text-[var(--color-slate)] font-medium">{row.label}</span>
              <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {appealed ? (
        <div
          className="rounded-[16px] px-4 py-3.5 text-[13px] font-semibold text-center"
          style={{ background: "rgba(212,175,55,0.1)", color: "var(--color-gold)" }}
        >
          Appeal submitted — our team will review within 24 hours.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <GhostButton tone="rose" onClick={() => setAppealed(true)}>
            File an Appeal
          </GhostButton>
          <PrimaryButton onClick={() => router.push("/")}>Back to Home</PrimaryButton>
        </div>
      )}
    </div>
  );
}
