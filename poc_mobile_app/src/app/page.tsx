import Link from "next/link";
import { CLAIM_HISTORY, POLICIES, formatUsd, formatDate } from "@/data/mock";
import { Card, StatusPill, GLASS } from "@/components/ui";
import { ProductIcon } from "@/components/ProductIcon";

const STATS = [
  { label: "Protection Score", value: "92", suffix: "/100" },
  { label: "Active Coverage", value: formatUsd(POLICIES.reduce((s, p) => s + p.payoutUsd, 0)) },
  { label: "Claims Filed", value: String(CLAIM_HISTORY.length) },
];

export default function HomePage() {
  const heroPolicy = POLICIES[0];

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

      <section className="grid grid-cols-3 gap-2">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-[14px] ${GLASS} px-2.5 py-2 flex flex-col gap-0.5`}
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}
          >
            <p className="text-[13.5px] font-extrabold text-[var(--color-gold)] leading-none">
              {stat.value}
              {stat.suffix && (
                <span className="text-[9px] font-semibold text-[var(--color-slate)]">
                  {stat.suffix}
                </span>
              )}
            </p>
            <p className="text-[8.5px] text-[var(--color-slate)] font-semibold leading-tight">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section>
        <div
          className={`rounded-[18px] p-4 relative overflow-hidden ${GLASS}`}
          style={{
            boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
            borderColor: "rgba(212,175,55,0.25)",
          }}
        >
          <div className="relative flex items-center justify-between">
            <span className="text-[10.5px] font-bold tracking-wide uppercase text-[var(--color-gold)]">
              Active policy
            </span>
            <ShieldIcon />
          </div>
          <p className="relative mt-2 text-[16px] font-bold text-[var(--color-ink)]">{heroPolicy.name}</p>
          <p className="relative text-[11.5px] text-[var(--color-slate)] mt-0.5">{heroPolicy.coverageLabel}</p>

          <div className="relative flex items-end justify-between mt-3">
            <div>
              <p className="text-[10px] text-[var(--color-slate)] font-semibold">Policy number</p>
              <p className="text-[12.5px] font-semibold tracking-wide text-[var(--color-ink)]">{heroPolicy.policyNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[var(--color-slate)] font-semibold">Payout</p>
              <p className="text-[15px] font-extrabold text-[var(--color-gold)]">{formatUsd(heroPolicy.payoutUsd)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[var(--color-ink)]">Your policies</h2>
          <Link href="/policies" className="text-[11.5px] font-semibold text-[var(--color-gold)]">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {POLICIES.map((policy) => (
            <div
              key={policy.id}
              className={`rounded-[16px] ${GLASS} p-3 flex flex-col gap-1.5`}
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.45)" }}
            >
              <div className="w-7 h-7 rounded-full bg-[rgba(212,175,55,0.14)] flex items-center justify-center text-[var(--color-gold)]">
                <ProductIcon product={policy.product} />
              </div>
              <p className="text-[11.5px] font-bold text-[var(--color-ink)] leading-tight">
                {policy.name}
              </p>
              <p className="text-[9.5px] text-[var(--color-slate)] font-medium leading-tight">{policy.meta}</p>
            </div>
          ))}
        </div>
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

function ShieldIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5 19 6v6c0 4.4-2.9 7.9-7 8.5-4.1-.6-7-4.1-7-8.5V6l7-2.5Z"
        stroke="var(--color-gold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
