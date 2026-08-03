"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLAIM_HISTORY, POLICIES, formatUsd, formatDate } from "@/data/mock";
import { Card, StatusPill, GLASS } from "@/components/ui";
import { ProductIcon } from "@/components/ProductIcon";

const TOTAL_COVERAGE = POLICIES.reduce((s, p) => s + p.payoutUsd, 0);

const SERVICES: { label: string; href: string | null; icon: (p: { className?: string }) => React.ReactElement }[] = [
  { label: "File a Claim", href: "/claims/new", icon: ClaimIcon },
  { label: "My Policies", href: "/policies", icon: ShieldIcon },
  { label: "Bills", href: "/policies", icon: ReceiptIcon },
  { label: "Vouchers", href: "/policies", icon: TicketIcon },
  { label: "Explore", href: "/policies", icon: GridIcon },
  { label: "History", href: "/claims", icon: ClockIcon },
  { label: "Support", href: null, icon: HeadsetIcon },
  { label: "Refer & Earn", href: null, icon: GiftIcon },
];

const BANNERS = [
  { title: "Refer a friend, get $20", subtitle: "Share your code — you both earn credit", icon: GiftIcon },
  { title: "New: Pet Insurance", subtitle: "Now available, from $7/mo", icon: PawIcon },
];

export default function HomePage() {
  const router = useRouter();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="px-4 pt-1.5 pb-4 flex flex-col gap-3.5">
      <header className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[11.5px] text-[var(--color-slate)] font-semibold">Good afternoon</p>
          <h1 className="text-[18px] font-extrabold text-[var(--color-ink)]">Hi, Alex</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Notifications"
            className={`relative w-9 h-9 rounded-full ${GLASS} flex items-center justify-center active:scale-95 transition-transform`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"
                stroke="var(--color-ink)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span
              className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--color-gold)" }}
            />
          </button>
          <div className="w-9 h-9 rounded-full bg-[rgba(212,175,55,0.16)] flex items-center justify-center text-[var(--color-gold)] font-bold text-[13px]">
            A
          </div>
        </div>
      </header>

      <button
        className={`h-9 rounded-full ${GLASS} px-3.5 flex items-center gap-2 text-left active:scale-[0.99] transition-transform`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <circle cx="11" cy="11" r="6.5" stroke="var(--color-slate)" strokeWidth="1.8" />
          <path d="m20 20-4.3-4.3" stroke="var(--color-slate)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="text-[12px] text-[var(--color-slate)] font-medium">
          Search claims, policies…
        </span>
      </button>

      <section>
        <button
          onClick={() => router.push("/policies")}
          className={`w-full text-left rounded-[18px] p-4 relative overflow-hidden ${GLASS} active:scale-[0.99] transition-transform`}
          style={{
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            borderColor: "rgba(212,175,55,0.25)",
          }}
        >
          <div className="relative flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-wide uppercase text-[var(--color-gold)]">
              Total coverage
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setShowBalance((v) => !v);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.06)]"
            >
              <EyeIcon open={showBalance} />
            </span>
          </div>
          <p className="relative mt-1.5 text-[26px] font-extrabold text-[var(--color-ink)] tracking-tight">
            {showBalance ? formatUsd(TOTAL_COVERAGE) : "••••••"}
          </p>
          <div className="relative flex items-center justify-between mt-3">
            <span className="text-[11px] text-[var(--color-slate)] font-medium">
              {POLICIES.length} active policies
            </span>
            <span
              className="text-[9.5px] font-bold px-2 h-5 rounded-full inline-flex items-center"
              style={{ background: "rgba(212,175,55,0.14)", color: "var(--color-gold)" }}
            >
              Protection Score 92
            </span>
          </div>
        </button>
      </section>

      <section>
        <div className="grid grid-cols-4 gap-y-3">
          {SERVICES.map((s) => (
            <button
              key={s.label}
              onClick={() => s.href && router.push(s.href)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-[rgba(212,175,55,0.14)] flex items-center justify-center text-[var(--color-gold)]">
                <s.icon />
              </div>
              <span className="text-[9px] font-semibold text-[var(--color-ink)] text-center leading-tight px-0.5">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
        {BANNERS.map((b) => (
          <div
            key={b.title}
            className={`shrink-0 w-[250px] rounded-[16px] ${GLASS} p-3 flex items-center gap-2.5`}
          >
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[rgba(212,175,55,0.14)] text-[var(--color-gold)]">
              <b.icon />
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-[var(--color-ink)] leading-tight">{b.title}</p>
              <p className="text-[9.5px] text-[var(--color-slate)] leading-tight mt-0.5">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[var(--color-ink)]">Recent claims</h2>
          <Link href="/claims" className="text-[11.5px] font-semibold text-[var(--color-gold)]">
            See all
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {CLAIM_HISTORY.map((claim) => (
            <Link key={claim.id} href={`/claims/${claim.id}`}>
              <Card className="!p-2.5 flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      claim.status === "rejected"
                        ? "rgba(242,97,122,0.14)"
                        : "rgba(52,211,153,0.14)",
                    color:
                      claim.status === "rejected" ? "var(--color-rose)" : "var(--color-green)",
                  }}
                >
                  <ProductIcon product={claim.product} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-[var(--color-ink)] truncate">
                    {claim.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-slate)] font-medium">
                    {formatDate(claim.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11.5px] font-bold text-[var(--color-ink)]">
                    {formatUsd(claim.amountUsd)}
                  </span>
                  <StatusPill status={claim.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" stroke="var(--color-ink)" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18M9.9 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 6.5 10 6.5a15 15 0 0 1-3.2 4M6.6 6.6C4 8.3 2 11.5 2 11.5S5.5 18 12 18a9.8 9.8 0 0 0 3-.5M14.2 14.2a3 3 0 0 1-4.4-4.1" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClaimIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5 19 6v6c0 4.4-2.9 7.9-7 8.5-4.1-.6-7-4.1-7-8.5V6l7-2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3v-17Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function TicketIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M20 8H4a1 1 0 0 0-1 1v3a2 2 0 0 1 0 4v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-4V9a1 1 0 0 0-1-1ZM12 8v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function HeadsetIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M19 19.5a4 4 0 0 1-4 3.5h-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function GiftIcon({ className }: { className?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="4" y="9.5" width="16" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 13.5v7a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7M12 9.5v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 9.5c0-2.5-1.5-4.5-3.5-4.5S6 7 8 9.5M12 9.5c0-2.5 1.5-4.5 3.5-4.5S18 7 16 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PawIcon({ className }: { className?: string }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="8.2" cy="6.6" r="1.7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.8" cy="6.6" r="1.7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="11.4" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="19" cy="11.4" r="1.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12.2c2.6 0 4.6 1.8 4.6 3.9 0 1.6-1.4 2.4-2.9 2-1-.3-2.4-.3-3.4 0-1.5.4-2.9-.4-2.9-2 0-2.1 2-3.9 4.6-3.9Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
