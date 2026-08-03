import type { CheckpointRecord } from "@/data/mock";
import { AttestationStamp } from "@/components/AttestationStamp";

const STAMP_PX = 36;

// The checkpoint strip is the same signature component used on the
// processing screen, compacted for reuse on outcome and passport-detail
// screens — the product's proof, shown again at rest.
//
// The connector is one continuous absolutely-positioned line, top-aligned to
// the exact stamp center (STAMP_PX / 2) and inset by half a column width on
// each side (100 / (count * 2))%, so it always meets the first and last
// stamp's centers exactly regardless of container width or label length —
// no per-size negative-margin guesswork.
export function CheckpointStrip({ checkpoints }: { checkpoints: CheckpointRecord[] }) {
  const inset = 100 / (checkpoints.length * 2);
  return (
    <div className="relative flex items-start">
      <div
        className="absolute h-px bg-[var(--color-hairline)]"
        style={{ top: STAMP_PX / 2, left: `${inset}%`, right: `${inset}%` }}
      />
      {checkpoints.map((cp) => (
        <div key={cp.id} className="relative z-10 flex-1 flex flex-col items-center gap-1 min-w-0">
          <AttestationStamp state={cp.state} size="sm" />
          <span className="text-[9.5px] font-bold text-[var(--color-ink)] text-center leading-tight">
            {cp.title}
          </span>
          <span
            className="text-[8.5px] font-bold tracking-wide"
            style={{
              color:
                cp.state === "verified"
                  ? "var(--color-gold)"
                  : cp.state === "failed"
                    ? "var(--color-rose)"
                    : "var(--color-slate)",
            }}
          >
            {cp.state === "verified" ? "VERIFIED" : cp.state === "failed" ? "FAILED" : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}
