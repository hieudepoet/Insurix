import { ButtonHTMLAttributes, ReactNode } from "react";

// Glass material shared by every surface: translucent dark fill + backdrop
// blur so the Lightfall glow reads through, plus a hairline border since
// shadows alone don't separate a card from a near-black canvas.
export const GLASS =
  "bg-[rgba(19,19,32,0.88)] backdrop-blur-2xl backdrop-saturate-150 border border-[var(--color-hairline)]";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`h-[44px] rounded-full bg-[var(--color-gold)] text-[#151020] font-bold text-[13.5px] flex items-center justify-center gap-2 active:translate-y-px transition-all disabled:opacity-30 disabled:shadow-none ${className}`}
      style={{ boxShadow: "0 8px 22px rgba(212,175,55,0.35)" }}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  tone = "default",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "default" | "rose";
}) {
  return (
    <button
      className={`h-[44px] rounded-full border-[1.5px] border-[var(--color-hairline)] font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-colors active:translate-y-px ${
        tone === "rose"
          ? "text-[var(--color-rose)] hover:bg-[rgba(242,97,122,0.08)] active:bg-[rgba(242,97,122,0.12)]"
          : "text-[var(--color-ink)] hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.09)]"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Chip({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-7 px-3 rounded-full text-[11.5px] font-semibold border-[1.5px] transition-colors active:translate-y-px whitespace-nowrap ${
        selected
          ? "bg-[rgba(212,175,55,0.16)] border-[var(--color-gold)] text-[var(--color-gold)]"
          : "bg-[rgba(255,255,255,0.04)] border-[var(--color-hairline)] text-[var(--color-slate)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
      }`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  raised = false,
}: {
  children: ReactNode;
  className?: string;
  raised?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] ${GLASS} p-3.5 ${className}`}
      style={{
        boxShadow: raised
          ? "0 16px 40px rgba(0,0,0,0.55)"
          : "0 4px 20px rgba(0,0,0,0.45)",
      }}
    >
      {children}
    </div>
  );
}

export function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 pt-2.5 pb-1.5 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-8 h-8 shrink-0 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 5 8 12l7 7"
                stroke="var(--color-ink)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h1 className="text-[15px] font-bold text-[var(--color-ink)] truncate">{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: "pending" | "settled" | "rejected";
}) {
  const cfg = {
    pending: { bg: "rgba(197,164,126,0.16)", fg: "var(--color-gold-soft)", label: "Processing" },
    settled: { bg: "rgba(52,211,153,0.14)", fg: "var(--color-green)", label: "Settled" },
    rejected: { bg: "rgba(242,97,122,0.14)", fg: "var(--color-rose)", label: "Rejected" },
  }[status];
  return (
    <span
      className="px-2.5 h-6 rounded-full text-[9.5px] font-bold tracking-wide inline-flex items-center"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.label.toUpperCase()}
    </span>
  );
}
