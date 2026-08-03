import { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`h-[52px] rounded-full bg-[var(--color-violet)] text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:translate-y-px transition-all disabled:opacity-40 disabled:shadow-none ${className}`}
      style={{ boxShadow: "0 12px 28px rgba(108,76,241,0.28)" }}
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
      className={`h-[52px] rounded-full border-[1.5px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors ${
        tone === "rose"
          ? "border-[var(--color-hairline)] text-[var(--color-rose)]"
          : "border-[var(--color-hairline)] text-[var(--color-ink)]"
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
      className={`h-9 px-4 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors ${
        selected
          ? "bg-[color-mix(in_oklab,var(--color-violet)_12%,white)] border-[var(--color-violet)] text-[var(--color-violet)]"
          : "bg-[var(--color-canvas)] border-[var(--color-hairline)] text-[var(--color-slate)]"
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
      className={`rounded-[22px] bg-[var(--color-card)] p-5 ${className}`}
      style={{
        boxShadow: raised
          ? "0 12px 32px rgba(108,76,241,0.18)"
          : "0 4px 16px rgba(108,76,241,0.10)",
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
    <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="w-9 h-9 shrink-0 rounded-full bg-[var(--color-canvas)] flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
        <h1 className="text-[17px] font-bold text-[var(--color-ink)] truncate">{title}</h1>
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
    pending: { bg: "rgba(108,76,241,0.12)", fg: "var(--color-violet)", label: "Processing" },
    settled: { bg: "rgba(30,158,107,0.12)", fg: "var(--color-green)", label: "Settled" },
    rejected: { bg: "rgba(226,76,107,0.12)", fg: "var(--color-rose)", label: "Rejected" },
  }[status];
  return (
    <span
      className="px-3 h-7 rounded-full text-[11px] font-bold tracking-wide inline-flex items-center"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.label.toUpperCase()}
    </span>
  );
}
