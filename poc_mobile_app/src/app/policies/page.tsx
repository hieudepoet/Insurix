"use client";

import { useState } from "react";
import { POLICIES, INSURANCE_CATEGORIES, BILLS, formatUsd } from "@/data/mock";
import { GLASS } from "@/components/ui";
import { CategoryIcon } from "@/components/CategoryIcon";

export default function PoliciesPage() {
  return (
    <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
      <h1 className="text-[18px] font-extrabold text-[var(--color-ink)]">Insurance</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-[12px] font-bold text-[var(--color-slate)] uppercase tracking-wide">
          Your policies
        </h2>
        <div className="flex flex-col gap-2">
          {POLICIES.map((policy) => (
            <div key={policy.id} className={`rounded-[16px] ${GLASS} p-3 flex flex-col gap-2`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wide text-[var(--color-gold)] font-mono">
                  {policy.policyNumber}
                </span>
                <span
                  className="text-[9px] font-bold px-2 h-5 rounded-full inline-flex items-center"
                  style={{ background: "rgba(52,211,153,0.14)", color: "var(--color-green)" }}
                >
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-bold text-[var(--color-ink)]">{policy.name}</p>
                  <p className="text-[11px] text-[var(--color-slate)]">{policy.coverageLabel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9.5px] text-[var(--color-slate)] font-semibold">Max payout</p>
                  <p className="text-[13px] font-bold text-[var(--color-gold)]">{formatUsd(policy.payoutUsd)}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-1 border-t border-[var(--color-hairline)]">
                <button className="text-[11px] font-semibold text-[var(--color-ink)] active:opacity-60">
                  Manage
                </button>
                <button className="text-[11px] font-semibold text-[var(--color-ink)] active:opacity-60">
                  Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[12px] font-bold text-[var(--color-slate)] uppercase tracking-wide">
          Explore more coverage
        </h2>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {INSURANCE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`shrink-0 w-[84px] rounded-[14px] ${GLASS} px-2.5 py-2.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform`}
            >
              <div className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.14)] flex items-center justify-center text-[var(--color-gold)]">
                <CategoryIcon id={cat.id} />
              </div>
              <p className="text-[10.5px] font-bold text-[var(--color-ink)]">{cat.name}</p>
              <p className="text-[8.5px] text-[var(--color-slate)]">{cat.from}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[12px] font-bold text-[var(--color-slate)] uppercase tracking-wide">
          Bills &amp; payments
        </h2>
        <div className={`rounded-[16px] ${GLASS} p-1`}>
          {BILLS.map((bill, i) => (
            <div
              key={bill.id}
              className={`flex items-center justify-between px-2.5 py-2.5 ${
                i < BILLS.length - 1 ? "border-b border-[var(--color-hairline)]" : ""
              }`}
            >
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold text-[var(--color-ink)] truncate">{bill.policyName}</p>
                <p className="text-[9.5px] text-[var(--color-slate)]">Due {bill.dueDate}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11.5px] font-bold text-[var(--color-ink)]">{formatUsd(bill.amountUsd)}</span>
                <button className="h-6 px-2.5 rounded-full bg-[var(--color-gold)] text-[#151020] text-[9.5px] font-bold active:opacity-80">
                  Pay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-[12px] font-bold text-[var(--color-slate)] uppercase tracking-wide">
          Gifts &amp; vouchers
        </h2>
        <VoucherCard />
      </section>
    </div>
  );
}

function VoucherCard() {
  const [copied, setCopied] = useState(false);
  const code = "INSURIX20";

  return (
    <div className={`rounded-[16px] ${GLASS} p-3 flex items-center gap-3`}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(212,175,55,0.14)" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M20 8H4a1 1 0 0 0-1 1v3a2 2 0 0 1 0 4v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 1 0-4V9a1 1 0 0 0-1-1ZM12 8v10" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-bold text-[var(--color-ink)]">Refer a friend, get $20</p>
        <p className="text-[9.5px] text-[var(--color-slate)]">Code: <span className="font-mono text-[var(--color-gold)]">{code}</span></p>
      </div>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="h-7 px-2.5 rounded-full border-[1.5px] border-[var(--color-hairline)] text-[10px] font-bold text-[var(--color-ink)] shrink-0 active:bg-[rgba(255,255,255,0.06)]"
      >
        {copied ? "Copied!" : "Copy code"}
      </button>
    </div>
  );
}
