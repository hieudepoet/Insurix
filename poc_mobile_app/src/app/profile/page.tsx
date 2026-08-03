import { Card } from "@/components/ui";

const ROWS = [
  { label: "Full name", value: "Alex Nguyen" },
  { label: "Email", value: "alex.nguyen@example.com" },
  { label: "Member since", value: "Mar 2026" },
];

const SETTINGS = [
  { label: "Payment Methods", icon: CardIcon },
  { label: "Notification Settings", icon: BellIcon },
  { label: "Security & Privacy", icon: LockIcon },
  { label: "Help & Support", icon: HelpIcon },
];

export default function ProfilePage() {
  return (
    <div className="px-4 pt-2 pb-4 flex flex-col gap-3">
      <h1 className="text-[18px] font-extrabold text-[var(--color-ink)]">Profile</h1>

      <div className="flex flex-col items-center gap-1 pt-0.5">
        <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.16)] flex items-center justify-center text-[var(--color-gold)] font-extrabold text-[21px]">
          A
        </div>
        <p className="text-[14.5px] font-bold text-[var(--color-ink)]">Alex Nguyen</p>
        <p className="text-[11px] text-[var(--color-slate)]">Verified policyholder</p>
      </div>

      <Card className="flex flex-col gap-2.5">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[11.5px] text-[var(--color-slate)] font-medium">{row.label}</span>
            <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">{row.value}</span>
          </div>
        ))}
      </Card>

      <Card className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(212,175,55,0.14)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3.5 19 6v6c0 4.4-2.9 7.9-7 8.5-4.1-.6-7-4.1-7-8.5V6l7-2.5Z" stroke="var(--color-gold)" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold text-[var(--color-ink)]">Identity attested</p>
          <p className="text-[10px] text-[var(--color-slate)]">Verified once, reused for every claim</p>
        </div>
      </Card>

      <Card className="!p-1.5 flex flex-col">
        {SETTINGS.map((row, i) => (
          <button
            key={row.label}
            className={`flex items-center gap-2.5 px-2.5 py-2.5 text-left active:bg-[rgba(255,255,255,0.04)] rounded-[12px] transition-colors ${
              i < SETTINGS.length - 1 ? "border-b border-[var(--color-hairline)]" : ""
            }`}
          >
            <row.icon />
            <span className="text-[11.5px] font-semibold text-[var(--color-ink)] flex-1">{row.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="m9 6 6 6-6 6" stroke="var(--color-slate)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </Card>
    </div>
  );
}

function CardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="var(--color-slate)" strokeWidth="1.6" />
      <path d="M3 9.5h18" stroke="var(--color-slate)" strokeWidth="1.6" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" stroke="var(--color-slate)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="var(--color-slate)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="var(--color-slate)" strokeWidth="1.6" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" stroke="var(--color-slate)" strokeWidth="1.6" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <circle cx="12" cy="12" r="9" stroke="var(--color-slate)" strokeWidth="1.6" />
      <path d="M9.8 9.5a2.3 2.3 0 1 1 3.3 2.1c-.9.5-1.1.9-1.1 1.7" stroke="var(--color-slate)" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.9" fill="var(--color-slate)" />
    </svg>
  );
}
