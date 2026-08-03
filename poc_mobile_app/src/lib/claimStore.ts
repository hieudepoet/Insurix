"use client";

import type { Claim } from "@/data/mock";

// Session-only store for claims resolved live during this demo (the two
// scripted scenarios). Nothing here is a real backend — it exists purely so
// a claim filed during the demo shows up again in history/detail screens
// without a page reload losing it.
const KEY_PREFIX = "insurix.claim.";

export function saveResolvedClaim(claim: Claim) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(`${KEY_PREFIX}${claim.id}`, JSON.stringify(claim));
}

export function loadResolvedClaim(id: string): Claim | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = window.sessionStorage.getItem(`${KEY_PREFIX}${id}`);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Claim;
  } catch {
    return undefined;
  }
}

export function listResolvedClaims(): Claim[] {
  if (typeof window === "undefined") return [];
  const out: Claim[] = [];
  for (let i = 0; i < window.sessionStorage.length; i++) {
    const key = window.sessionStorage.key(i);
    if (!key?.startsWith(KEY_PREFIX)) continue;
    const raw = window.sessionStorage.getItem(key);
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw) as Claim);
    } catch {
      // ignore malformed entry
    }
  }
  return out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
