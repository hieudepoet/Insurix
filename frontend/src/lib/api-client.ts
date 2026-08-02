const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface Claim {
  id: string;
  owner: string;
  amount: number;
  productType: number;
  createdAt: number;
  status: 'pending' | 'settled' | 'rejected';
}

export interface AttestationStatus {
  type: 'IdentityVerified' | 'ExternalDataVerified' | 'FraudCheckPassed';
  status: 'pending' | 'verified' | 'failed' | 'revoked';
  data?: Record<string, unknown>;
  txDigest?: string;
}

export interface ClaimDetail extends Claim {
  attestations: AttestationStatus[];
  escrowStatus: 'locked' | 'released' | 'reclaimed';
  settleTxDigest?: string;
}

export const apiClient = {
  async createClaim(params: { customerId: string; amount: number; productType: number; externalId: string }): Promise<{ claimId: string; txDigest: string }> {
    const res = await fetch(`${BACKEND_URL}/api/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getClaims(): Promise<{ claims: Claim[] }> {
    const res = await fetch(`${BACKEND_URL}/api/claims`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getClaim(id: string): Promise<{ claim: ClaimDetail }> {
    const res = await fetch(`${BACKEND_URL}/api/claims/${id}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async settleClaim(id: string): Promise<{ settled: boolean; txDigest?: string; reason?: string }> {
    const res = await fetch(`${BACKEND_URL}/api/claims/${id}/settle`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async revokeAttestation(claimId: string, attestationType: string, adminKey: string): Promise<{ revoked: boolean; txDigest: string }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/${claimId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': adminKey },
      body: JSON.stringify({ attestationType }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getAdminStats(): Promise<{ pending: number; settled: number; rejected: number; total: number }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/stats`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
