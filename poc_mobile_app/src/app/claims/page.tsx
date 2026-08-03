"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CLAIM_HISTORY, formatUsd, formatDate, type Claim } from "@/data/mock";
import { listResolvedClaims } from "@/lib/claimStore";
import { Card, StatusPill, Chip } from "@/components/ui";
import { ProductIcon } from "@/components/ProductIcon";

type Filter = "all" | "settled" | "rejected";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(CLAIM_HISTORY);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const live = listResolvedClaims();
    const liveIds = new Set(live.map((c) => c.id));
    setClaims([...live, ...CLAIM_HISTORY.filter((c) => !liveIds.has(c.id))]);
  }, []);

  const visible = useMemo(
    () => claims.filter((c) => filter === "all" || c.status === filter),
    [claims, filter],
  );

  return (
    <div className="px-4 pt-2 pb-4 flex flex-col gap-3">
      <h1 className="text-[18px] font-extrabold text-[var(--color-ink)]">Claims</h1>

      <div className="flex gap-1.5">
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>
          All
        </Chip>
        <Chip selected={filter === "settled"} onClick={() => setFilter("settled")}>
          Settled
        </Chip>
        <Chip selected={filter === "rejected"} onClick={() => setFilter("rejected")}>
          Rejected
        </Chip>
      </div>

      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <p className="text-[12px] text-[var(--color-slate)] text-center py-6">
            No {filter} claims yet.
          </p>
        )}
        {visible.map((claim) => (
          <Link key={claim.id} href={`/claims/${claim.id}`}>
            <Card className="!p-2.5 flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background:
                    claim.status === "rejected" ? "rgba(242,97,122,0.14)" : "rgba(52,211,153,0.14)",
                  color: claim.status === "rejected" ? "var(--color-rose)" : "var(--color-green)",
                }}
              >
                <ProductIcon product={claim.product} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[var(--color-ink)] truncate">{claim.title}</p>
                <p className="text-[10px] text-[var(--color-slate)] font-medium">
                  {formatDate(claim.createdAt)} · <span className="font-mono">{claim.id}</span>
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
    </div>
  );
}
