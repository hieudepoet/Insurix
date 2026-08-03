"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  findAnyClaim,
  randomAttestationId,
  type CheckpointRecord,
  type Claim,
} from "@/data/mock";
import { saveResolvedClaim } from "@/lib/claimStore";
import { AttestationStamp } from "@/components/AttestationStamp";
import { CheckpointStrip } from "@/components/CheckpointStrip";
import { TypewriterText } from "@/components/TypewriterText";
import { GLASS } from "@/components/ui";
import { playTick, playVerifiedChime, playFailedTone } from "@/lib/sound";

const STEP_MS = 2800;

export function ProcessingClient({ claimId }: { claimId: string }) {
  const router = useRouter();
  const base = useRef<Claim | undefined>(findAnyClaim(claimId));
  const [checkpoints, setCheckpoints] = useState<CheckpointRecord[]>(
    () => base.current?.checkpoints.map((c) => ({ ...c })) ?? [],
  );
  const trackRef = useRef<HTMLDivElement>(null);

  // The slide the auto-scroll should focus: whichever checkpoint is
  // currently checking, or the last one touched (verified/failed).
  const activeIndex = useMemo(() => {
    const checking = checkpoints.findIndex((c) => c.state === "checking");
    if (checking !== -1) return checking;
    const lastResolved = [...checkpoints].reverse().findIndex((c) => c.state !== "pending");
    if (lastResolved !== -1) return checkpoints.length - 1 - lastResolved;
    return 0;
  }, [checkpoints]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[activeIndex] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (!base.current) return;
    const claim = base.current;

    let cancelled = false;

    async function run() {
      let failedAt: CheckpointRecord["id"] | undefined;

      for (let i = 0; i < claim.checkpoints.length; i++) {
        if (cancelled) return;
        const cp = claim.checkpoints[i];

        setCheckpoints((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, state: "checking" } : p)),
        );
        playTick();
        await sleep(STEP_MS);
        if (cancelled) return;

        const willFail = cp.id === claim.failedCheckpoint;

        setCheckpoints((prev) =>
          prev.map((p, idx) =>
            idx === i
              ? {
                  ...p,
                  state: willFail ? "failed" : "verified",
                  verifiedAt: new Date().toISOString(),
                  attestationId: willFail ? undefined : randomAttestationId(cp.id),
                  detail: willFail ? claim.rejectionReason : p.detail,
                }
              : p,
          ),
        );
        if (willFail) {
          playFailedTone();
        } else {
          playVerifiedChime();
        }

        if (willFail) {
          failedAt = cp.id;
          break;
        }
        await sleep(650);
      }

      await sleep(2200);
      if (cancelled) return;

      setCheckpoints((current) => {
        const resolved: Claim = {
          ...claim,
          status: failedAt ? "rejected" : "settled",
          settledAt: failedAt ? undefined : new Date().toISOString(),
          failedCheckpoint: failedAt,
          checkpoints: current,
        };
        saveResolvedClaim(resolved);
        return current;
      });
      await sleep(500);
      if (!cancelled) router.replace(`/claims/${claimId}`);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [claimId, router]);

  if (!base.current) {
    return (
      <div className="px-5 pt-16 text-center text-[var(--color-slate)]">
        Claim not found.
      </div>
    );
  }

  return (
    <div className="pt-6 pb-4 flex flex-col gap-4 min-h-full">
      <div className="text-center px-4">
        <h1 className="text-[16.5px] font-extrabold text-[var(--color-ink)]">
          Verifying your claim
        </h1>
        <p className="text-[11px] text-[var(--color-slate)] mt-0.5 leading-relaxed">
          Swipe to read what each checkpoint is doing right now.
        </p>
      </div>

      <div className={`mx-4 rounded-[16px] ${GLASS} px-3 py-3`}>
        <CheckpointStrip checkpoints={checkpoints} />
      </div>

      <div className="flex gap-1.5 justify-center">
        {checkpoints.map((cp, i) => (
          <span
            key={cp.id}
            className="h-1.5 w-6 rounded-full transition-colors"
            style={{
              background: i === activeIndex ? "var(--color-gold)" : "var(--color-hairline)",
            }}
          />
        ))}
      </div>

      <div
        ref={trackRef}
        className="flex-1 min-h-0 flex overflow-x-auto hide-scrollbar snap-x snap-mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {checkpoints.map((cp) => (
          <div
            key={cp.id}
            className="w-full shrink-0 snap-start px-4 flex flex-col items-center text-center gap-2.5 pt-1"
          >
            <AttestationStamp state={cp.state} size="lg" />
            <div>
              <p className="text-[14.5px] font-bold text-[var(--color-ink)]">{cp.title}</p>
              <StateLabel state={cp.state} />
            </div>

            <div className={`w-full rounded-[16px] ${GLASS} p-3 text-left`}>
              <p className="text-[9.5px] font-bold text-[var(--color-gold-soft)] uppercase tracking-wide mb-1.5">
                How it&rsquo;s verified
              </p>
              <TypewriterText
                text={cp.narrative}
                className="text-[11.5px] text-[var(--color-slate)] leading-relaxed min-h-[4.5em]"
              />

              {cp.state === "verified" && cp.attestationId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2.5 pt-2.5 border-t border-[var(--color-hairline)] flex items-center justify-between"
                >
                  <span className="text-[9px] text-[var(--color-slate)] font-semibold uppercase tracking-wide">
                    Attestation
                  </span>
                  <span className="font-mono text-[10px] text-[var(--color-gold)]">
                    {cp.attestationId}
                  </span>
                </motion.div>
              )}

              {cp.state === "failed" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2.5 pt-2.5 border-t border-[rgba(242,97,122,0.2)] flex flex-col gap-1.5"
                >
                  <p className="text-[11px] font-bold text-[var(--color-rose)] leading-snug">
                    {cp.detail}
                  </p>
                  {base.current?.remediation && (
                    <p className="text-[10.5px] text-[var(--color-slate)] leading-relaxed">
                      <span className="font-bold text-[var(--color-ink)]">What to do next: </span>
                      {base.current.remediation}
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StateLabel({ state }: { state: CheckpointRecord["state"] }) {
  const cfg = {
    pending: { text: "Not reached yet", color: "var(--color-slate)" },
    checking: { text: "Running now…", color: "var(--color-gold-soft)" },
    verified: { text: "Verified", color: "var(--color-gold)" },
    failed: { text: "Failed", color: "var(--color-rose)" },
  }[state];
  return (
    <span
      className="text-[11px] font-bold tracking-wide mt-1 inline-block"
      style={{ color: cfg.color }}
    >
      {cfg.text.toUpperCase()}
    </span>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
