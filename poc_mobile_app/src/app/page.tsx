import Link from "next/link";
import { CLAIM_HISTORY, POLICIES, formatUsd, formatDate } from "@/data/mock";
import { Card, StatusPill } from "@/components/ui";

export default function HomePage() {
  const heroPolicy = POLICIES[0];

  return (
    <div className="px-5 pt-2 pb-8 flex flex-col gap-7">
      <header className="flex items-center justify-between pt-2">
        <div>
          <p className="text-[13px] text-[var(--color-slate)] font-semibold">Good afternoon</p>
          <h1 className="text-[21px] font-extrabold text-[var(--color-ink)]">Hi, Alex</h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-[color-mix(in_oklab,var(--color-violet)_14%,white)] flex items-center justify-center text-[var(--color-violet)] font-bold text-[15px]">
          A
        </div>
      </header>

      <section>
        <div
          className="rounded-[24px] p-6 text-white relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7C5CFF 0%, #6C4CF1 45%, #4A2FC7 100%)",
            boxShadow: "0 12px 32px rgba(108,76,241,0.32)",
          }}
        >
          <div
            className="absolute -right-10 -top-10 w-40 h-40 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="relative flex items-center justify-between">
            <span className="text-[12px] font-bold tracking-wide uppercase text-white/75">
              Active policy
            </span>
            <ShieldIcon />
          </div>
          <p className="relative mt-4 text-[19px] font-bold">{heroPolicy.name}</p>
          <p className="relative text-[13px] text-white/75 mt-0.5">{heroPolicy.coverageLabel}</p>

          <div className="relative flex items-end justify-between mt-6">
            <div>
              <p className="text-[11px] text-white/60 font-semibold">Policy number</p>
              <p className="text-[14px] font-semibold tracking-wide">{heroPolicy.policyNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/60 font-semibold">Payout</p>
              <p className="text-[18px] font-extrabold">{formatUsd(heroPolicy.payoutUsd)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[var(--color-ink)]">Your policies</h2>
          <Link href="/policies" className="text-[13px] font-semibold text-[var(--color-violet)]">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {POLICIES.map((policy) => (
            <div
              key={policy.id}
              className="rounded-[18px] bg-[var(--color-card)] p-4 flex flex-col gap-2"
              style={{ boxShadow: "0 4px 16px rgba(108,76,241,0.10)" }}
            >
              <div className="w-9 h-9 rounded-full bg-[color-mix(in_oklab,var(--color-violet)_10%,white)] flex items-center justify-center">
                {policy.product === "flight-delay" ? <PlaneIcon /> : <RainIcon />}
              </div>
              <p className="text-[13px] font-bold text-[var(--color-ink)] leading-tight">
                {policy.name}
              </p>
              <p className="text-[11px] text-[var(--color-slate)] font-medium">{policy.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[var(--color-ink)]">Recent claims</h2>
          <Link href="/claims" className="text-[13px] font-semibold text-[var(--color-violet)]">
            See all
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {CLAIM_HISTORY.map((claim) => (
            <Link key={claim.id} href={`/claims/${claim.id}`}>
              <Card className="!p-4 flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      claim.status === "rejected"
                        ? "rgba(226,76,107,0.12)"
                        : "rgba(30,158,107,0.12)",
                  }}
                >
                  {claim.product === "flight-delay" ? <PlaneIcon /> : <RainIcon />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-bold text-[var(--color-ink)] truncate">
                    {claim.title}
                  </p>
                  <p className="text-[11.5px] text-[var(--color-slate)] font-medium">
                    {formatDate(claim.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[13px] font-bold text-[var(--color-ink)]">
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

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5 19 6v6c0 4.4-2.9 7.9-7 8.5-4.1-.6-7-4.1-7-8.5V6l7-2.5Z"
        stroke="white"
        strokeOpacity="0.9"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="m3 12 7-2 4-7 2 1-2.5 6.5L21 9l1 2-7.5 3.5L13 21l-2-1 1-6-6 2-2-2 4-2.5L3 12Z"
        fill="var(--color-violet)"
      />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 13a4.5 4.5 0 0 1 .3-9c1-2.3 3.3-3.8 6-3.4 3 .4 5.2 3 5.2 6a4.8 4.8 0 0 1-1 9.4H7Z"
        fill="var(--color-violet)"
        opacity="0.85"
      />
      <path
        d="M8 17.5 6.5 20M12.5 17.5 11 20M17 17.5 15.5 20"
        stroke="var(--color-violet)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
