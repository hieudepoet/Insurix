const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// ─── Shared types ────────────────────────────────────────────────────────

export type ClaimType = 'flight-delay' | 'weather';
export type ClaimStatus = 'pending' | 'settled' | 'rejected';

export interface AttestationProgress {
  identity: boolean;
  externalData: boolean;
  fraudCheck: boolean;
}

export interface ClaimListItem {
  claimId: string;
  claimType: ClaimType;
  amount: number;
  status: ClaimStatus;
  attestationProgress: AttestationProgress;
  createdAt: number;
}

export interface ClaimDetail {
  claimId: string;
  claimType: ClaimType;
  amount: number;
  status: ClaimStatus;
  attestationProgress: AttestationProgress;
  createdAt: number;
  settledAt?: number;
  rejectionReason?: string;
}

export interface CreateClaimParams {
  walletAddress: string;
  claimType: ClaimType;
  description: string;
  amount: number;
  params: {
    flightNumber?: string;
    date?: string;
    location?: string;
    rainThreshold?: number;
  };
}

export interface CreateClaimResponse {
  claimId: string;
  txDigest: string;
  status: string;
}

export interface SettleResponse {
  status: ClaimStatus;
  reason?: string;
  txDigest: string;
}

// ─── Admin types ─────────────────────────────────────────────────────────

export interface AdminStats {
  totalClaims: number;
  pendingClaims: number;
  settledClaims: number;
  rejectedClaims: number;
  totalAmount: number;
}

export type AttestationType = 'identity' | 'external-data' | 'fraud-check';

export interface RevokeResponse {
  status: 'revoked';
  attestationType: string;
}

export interface AdminClaim {
  claimId: string;
  claimType: 'flight-delay' | 'weather';
  amount: number;
  status: string;
  attestationProgress: AttestationProgress;
  createdAt: number;
}

export interface AdminClaimDetail {
  claimId: string;
  claimType: 'flight-delay' | 'weather';
  amount: number;
  status: string;
  attestationProgress: AttestationProgress;
  createdAt: number;
  settledAt?: number;
  rejectionReason?: string;
}

// ─── Claims API (matches backend contract) ──────────────────────────────

export const claimsApi = {
  async getClaims(walletAddress: string): Promise<ClaimListItem[]> {
    const res = await fetch(
      `${BACKEND_URL}/api/claims?wallet=${encodeURIComponent(walletAddress)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error(`Failed to load claims (${res.status})`);
    return (await res.json()) as ClaimListItem[];
  },

  async getClaim(id: string): Promise<ClaimDetail> {
    const res = await fetch(
      `${BACKEND_URL}/api/claims/${encodeURIComponent(id)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) throw new Error(`Failed to load claim (${res.status})`);
    return (await res.json()) as ClaimDetail;
  },

  async createClaim(params: CreateClaimParams): Promise<CreateClaimResponse> {
    const res = await fetch(`${BACKEND_URL}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to create claim (${res.status})`);
    }
    return (await res.json()) as CreateClaimResponse;
  },

  async settleClaim(id: string): Promise<SettleResponse> {
    const res = await fetch(
      `${BACKEND_URL}/api/claims/${encodeURIComponent(id)}/settle`,
      { method: 'POST' },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to settle claim (${res.status})`);
    }
    return (await res.json()) as SettleResponse;
  },
};

// ─── Admin API ───────────────────────────────────────────────────────────

export const apiClient = {
  async getAdminStats(): Promise<AdminStats> {
    const adminKey = typeof window !== 'undefined' ? localStorage.getItem('insurix_admin_key') || '' : '';
    const res = await fetch(`${BACKEND_URL}/api/admin/stats`, {
      headers: { 'x-api-key': adminKey },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAdminClaims(): Promise<AdminClaim[]> {
    const res = await fetch(`${BACKEND_URL}/api/claims`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAdminClaim(id: string): Promise<AdminClaimDetail> {
    const res = await fetch(`${BACKEND_URL}/api/claims/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async revokeAttestation(claimId: string, attestationType: AttestationType): Promise<RevokeResponse> {
    const adminKey = typeof window !== 'undefined' ? localStorage.getItem('insurix_admin_key') || '' : '';
    const res = await fetch(`${BACKEND_URL}/api/admin/claims/${claimId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': adminKey },
      body: JSON.stringify({ attestationType }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

// ─── Formatting helpers ─────────────────────────────────────────────────

export function truncateId(id: string, head = 6, tail = 4): string {
  if (!id) return '';
  if (id.length <= head + tail + 1) return id;
  return `${id.slice(0, head)}…${id.slice(-tail)}`;
}

export function formatSui(amount: number): string {
  const n = Number(amount) || 0;
  return `${n.toLocaleString(undefined, { maximumFractionDigits: 4 })} SUI`;
}

export function formatDate(ts?: number): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function claimTypeLabel(t: ClaimType): string {
  return t === 'flight-delay' ? 'Flight Delay' : 'Weather (Rainfall)';
}

export function attestationCount(p: AttestationProgress): number {
  return (p.identity ? 1 : 0) + (p.externalData ? 1 : 0) + (p.fraudCheck ? 1 : 0);
}
