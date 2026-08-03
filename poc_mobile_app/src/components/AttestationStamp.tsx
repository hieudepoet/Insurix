"use client";

import { motion } from "framer-motion";
import type { CheckpointState } from "@/data/mock";

// A wax-seal / rubber-stamp silhouette: alternating outer/inner radius points
// around the circle, rendered as a smooth closed path. This scalloped edge is
// the one shape in the whole system that departs from plain circles/pills —
// reserved for the attestation stamp per DESIGN.md.
function scallopedPath(r: number, bumps: number, depth: number): string {
  const points: [number, number][] = [];
  const steps = bumps * 2;
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r - depth;
    points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
  }
  const [first, ...rest] = points;
  let d = `M ${first[0]} ${first[1]} `;
  for (const [x, y] of rest) {
    d += `L ${x} ${y} `;
  }
  return d + "Z";
}

const SIZE_MAP = { sm: 36, md: 48, lg: 64 } as const;

export function AttestationStamp({
  state,
  size = "md",
}: {
  state: CheckpointState;
  size?: keyof typeof SIZE_MAP;
}) {
  const px = SIZE_MAP[size];
  const r = px / 2;
  const path = scallopedPath(r - 2, 14, 3.2);

  const fill =
    state === "verified"
      ? "var(--color-gold)"
      : state === "failed"
        ? "var(--color-rose)"
        : "rgba(0,0,0,0)";

  const stroke =
    state === "verified"
      ? "var(--color-gold)"
      : state === "failed"
        ? "var(--color-rose)"
        : "var(--color-hairline)";

  return (
    <div className="relative shrink-0" style={{ width: px, height: px }}>
      {(state === "verified" || state === "failed") && (
        <motion.div
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              state === "verified"
                ? "rgba(212,175,55,0.4)"
                : "rgba(242,97,122,0.35)",
          }}
        />
      )}

      <svg
        width={px}
        height={px}
        viewBox={`${-r} ${-r} ${px} ${px}`}
        className="relative"
      >
        <motion.path
          d={path}
          initial={false}
          animate={{
            fill,
            stroke,
          }}
          transition={{ duration: 0.35 }}
          strokeWidth={state === "pending" || state === "checking" ? 1.5 : 0}
          strokeDasharray={state === "pending" ? "3 3" : undefined}
        />
        {state === "checking" && (
          <motion.circle
            cx={0}
            cy={0}
            r={r - 2}
            fill="none"
            stroke="var(--color-gold-soft)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${(r - 2) * 1.4} ${(r - 2) * 5}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        <g fill="none" stroke={state === "pending" ? "var(--color-slate)" : "white"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          {state === "pending" && (
            <>
              <circle cx={0} cy={0} r={r * 0.36} strokeWidth={1.6} />
              <path d={`M0 ${-r * 0.18} L0 0 L${r * 0.16} ${r * 0.1}`} strokeWidth={1.6} />
            </>
          )}
          {state === "verified" && (
            <path d={`M${-r * 0.32} 0 L${-r * 0.08} ${r * 0.28} L${r * 0.34} ${-r * 0.26}`} />
          )}
          {state === "failed" && (
            <path d={`M${-r * 0.26} ${-r * 0.26} L${r * 0.26} ${r * 0.26} M${r * 0.26} ${-r * 0.26} L${-r * 0.26} ${r * 0.26}`} />
          )}
        </g>
      </svg>
    </div>
  );
}
