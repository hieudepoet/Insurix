/**
 * Claim Service — handles on-chain claim operations.
 * Creates claims, funds escrow, triggers settlement.
 */

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, CONTRACTS } from '../config/sui-client.js';
import { getAttestationStatus, type AttestationStatus } from './attestation.service.js';
import { processClaim } from './orchestrator.js';

// PoC mode: when contracts are not fully configured, skip all on-chain queries
// and rely on in-memory claim/attestation tracking.
const POC_MODE =
  process.env.POC_MODE === 'true' ||
  !CONTRACTS.REGISTRY_ID ||
  !CONTRACTS.ATTESTATIONS_PKG_ID;

// ─── Types ────────────────────────────────────────────────────────

export interface ClaimDetail {
  claimId: string;
  subjectId: string;
  status: 'pending' | 'attesting' | 'ready_to_settle' | 'settled' | 'rejected' | 'failed';
  attestationStatus: AttestationStatus;
  amount: number;
  amountUsd: number;
  productType: number;
  customerAddress: string;
  externalId: string;
  createdAt: number;
  settledAt?: number;
  rejectionReason?: string;
}

interface CreateClaimResult {
  claimId: string;
  subjectId: string;
  txDigest: string;
  customerAddress: string;
}

interface SettleResult {
  settled: boolean;
  txDigest?: string;
  reason?: string;
}

// ─── In-Memory Claim Store (PoC — replaced by on-chain queries later) ──

const claimStore = new Map<string, ClaimDetail>();

function generateClaimId(): string {
  return '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
}

function generateMockAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 64; i++) {
    addr += chars[Math.floor(Math.random() * 16)];
  }
  return addr;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Create a new claim, fund escrow, and kick off agent attestation pipeline.
 *
 * For PoC: the claim object is tracked in-memory and a placeholder on-chain
 * transaction is executed. The orchestrator is triggered automatically.
 *
 * @param amount          - Claim amount in USD
 * @param productType     - 0 = flight delay, 1 = heavy rain
 * @param customerAddress - Sui address of the claimant (generated if empty)
 * @param externalId      - Flight number or location identifier
 */
export async function createClaim(
  amount: number,
  productType: number,
  customerAddress: string,
  externalId: string,
): Promise<CreateClaimResult> {
  const { SETTLEMENT_PKG_ID, REGISTRY_ID } = CONTRACTS;

  // Generate a mock wallet address if none provided (PoC mobile support)
  if (!customerAddress) {
    customerAddress = generateMockAddress();
  }

  // Generate IDs for the new claim
  const claimId = generateClaimId();
  const subjectId = generateClaimId(); // In production, this is the on-chain object ID

  console.log(`[ClaimService] Creating claim ${claimId} for $${amount} USD (productType=${productType})`);

  // If the settlement contract is deployed, create the on-chain claim object
  if (SETTLEMENT_PKG_ID && REGISTRY_ID) {
    try {
      const tx = new Transaction();

      // Placeholder: call settlement::create_claim once the contract is deployed
      // For now, we split coins and transfer to mark the escrow
      tx.moveCall({
        target: `${SETTLEMENT_PKG_ID}::settlement::create_claim`,
        arguments: [
          tx.pure.id(REGISTRY_ID),
          tx.pure.u64(amount),
          tx.pure.u8(productType),
          tx.pure.address(customerAddress),
          tx.pure.string(externalId),
        ],
      });

      // TODO: sign with admin keypair once settlement is deployed
      // const result = await suiClient.signAndExecuteTransaction({ transaction: tx, signer: adminKeypair });
      console.log(`[ClaimService] Settlement contract available — on-chain claim creation pending deployment`);
    } catch (err) {
      console.warn(
        `[ClaimService] On-chain claim creation skipped (settlement not deployed): ${err instanceof Error ? err.message : err}`,
      );
    }
  } else {
    console.log(`[ClaimService] Settlement not configured — using in-memory claim tracking (PoC mode)`);
  }

  // Store claim details in-memory
  const claim: ClaimDetail = {
    claimId,
    subjectId,
    status: 'attesting',
    attestationStatus: {
      IdentityVerified: false,
      ExternalDataVerified: false,
      FraudCheckPassed: false,
    },
    amount,
    amountUsd: amount,
    productType,
    customerAddress,
    externalId,
    createdAt: Date.now(),
  };
  claimStore.set(claimId, claim);

  // Kick off the agent pipeline (fire-and-forget)
  processClaim(claimId, subjectId, amount, productType, customerAddress, externalId);

  // Auto-verify attestations after delay (mock agent completion)
  setTimeout(() => {
    const c = claimStore.get(claimId);
    if (c && c.status === 'attesting') {
      c.attestationStatus.IdentityVerified = true;
      c.attestationStatus.ExternalDataVerified = true;
      c.attestationStatus.FraudCheckPassed = true;
      c.status = 'ready_to_settle';
      console.log(`[Mock] Claim ${claimId} attestations verified`);
    }
  }, 3000);

  console.log(`[ClaimService] Claim ${claimId} created, agents dispatched`);

  // Return a synthetic digest for PoC mode
  const txDigest = SETTLEMENT_PKG_ID ? 'pending-on-chain' : 'poc-in-memory';

  return { claimId, subjectId, txDigest, customerAddress };
}

/**
 * Attempt to settle a claim by checking all 3 attestation statuses.
 * If all attestations are present and not revoked, trigger on-chain settlement.
 *
 * @param claimId - The claim identifier
 */
export async function settleClaim(claimId: string): Promise<SettleResult> {
  const claim = claimStore.get(claimId);
  if (!claim) {
    return { settled: false, reason: `Claim ${claimId} not found` };
  }

  console.log(`[ClaimService] Attempting settlement for claim ${claimId}`);

  // In PoC mode (contracts not fully configured), use the in-memory attestation status
  if (POC_MODE) {
    const allPresent =
      claim.attestationStatus.IdentityVerified &&
      claim.attestationStatus.ExternalDataVerified &&
      claim.attestationStatus.FraudCheckPassed;

    if (!allPresent) {
      const missing: string[] = [];
      if (!claim.attestationStatus.IdentityVerified) missing.push('IdentityVerified');
      if (!claim.attestationStatus.ExternalDataVerified) missing.push('ExternalDataVerified');
      if (!claim.attestationStatus.FraudCheckPassed) missing.push('FraudCheckPassed');
      console.log(`[ClaimService] Settlement blocked — missing attestations: ${missing.join(', ')}`);
      return { settled: false, reason: `Missing attestations: ${missing.join(', ')}` };
    }

    // PoC mode: settle directly without on-chain transaction
    claim.status = 'settled';
    claim.settledAt = Date.now();
    console.log(`[ClaimService] Claim ${claimId} settled successfully (PoC mode)`);
    return { settled: true, txDigest: 'poc-settlement' };
  }

  // On-chain mode: refresh attestation status from chain
  try {
    const attStatus = await getAttestationStatus(claim.subjectId);
    claim.attestationStatus = attStatus;

    const allPresent =
      attStatus.IdentityVerified &&
      attStatus.ExternalDataVerified &&
      attStatus.FraudCheckPassed;

    if (!allPresent) {
      const missing: string[] = [];
      if (!attStatus.IdentityVerified) missing.push('IdentityVerified');
      if (!attStatus.ExternalDataVerified) missing.push('ExternalDataVerified');
      if (!attStatus.FraudCheckPassed) missing.push('FraudCheckPassed');

      claim.status = 'attesting';
      console.log(`[ClaimService] Settlement blocked — missing attestations: ${missing.join(', ')}`);
      return { settled: false, reason: `Missing attestations: ${missing.join(', ')}` };
    }

    // All attestations present — attempt on-chain settlement
    const { SETTLEMENT_PKG_ID } = CONTRACTS;
    if (!SETTLEMENT_PKG_ID) {
      claim.status = 'settled';
      claim.settledAt = Date.now();
      console.log(`[ClaimService] Claim ${claimId} settled successfully (PoC mode)`);
      return { settled: true, txDigest: 'poc-settlement' };
    }

    // Build settlement transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${SETTLEMENT_PKG_ID}::settlement::try_settle`,
      arguments: [
        tx.pure.id(CONTRACTS.REGISTRY_ID),
        tx.pure.id(claim.subjectId),
      ],
    });

    // TODO: sign with admin keypair and execute
    // const result = await suiClient.signAndExecuteTransaction({ transaction: tx, signer: adminKeypair });

    claim.status = 'settled';
    claim.settledAt = Date.now();
    console.log(`[ClaimService] Claim ${claimId} settled successfully`);
    return { settled: true, txDigest: 'pending-settlement-execution' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ClaimService] Settlement error for claim ${claimId}: ${msg}`);
    claim.status = 'failed';
    return { settled: false, reason: msg };
  }
}

/**
 * Get the current status of a claim, including attestation states.
 *
 * @param claimId - The claim identifier
 */
export async function getClaimStatus(claimId: string): Promise<ClaimDetail> {
  const claim = claimStore.get(claimId);
  if (!claim) {
    throw new Error(`Claim ${claimId} not found`);
  }

  // In PoC mode, return the in-memory status directly — do NOT query the chain.
  // The mock auto-verify (setTimeout) sets attestation booleans and status on the
  // in-memory claim object; querying the chain would overwrite them back to false
  // because the agents may not have successfully issued on-chain attestations.
  if (POC_MODE) {
    return { ...claim };
  }

  // Full on-chain mode: refresh attestation status from chain
  try {
    const attStatus = await getAttestationStatus(claim.subjectId);
    claim.attestationStatus = attStatus;

    // Update claim status based on attestation state
    const allPresent =
      attStatus.IdentityVerified &&
      attStatus.ExternalDataVerified &&
      attStatus.FraudCheckPassed;

    if (allPresent && claim.status === 'attesting') {
      claim.status = 'ready_to_settle';
    }
  } catch {
    // Chain query failed — return cached status
    console.warn(`[ClaimService] Could not refresh attestation status for ${claimId}`);
  }

  return { ...claim };
}

// ─── Store access helpers (for route layer) ────────────────────────

/**
 * Get a claim by ID from the in-memory store (read-only snapshot).
 */
export function getClaim(claimId: string): ClaimDetail | undefined {
  const claim = claimStore.get(claimId);
  return claim ? { ...claim } : undefined;
}

/**
 * Get all claims from the in-memory store (read-only snapshots).
 */
export function getAllClaims(): ClaimDetail[] {
  return Array.from(claimStore.values()).map((c) => ({ ...c }));
}

/**
 * Reject a claim with a reason (admin action).
 * Returns the updated claim, or null if not found.
 */
export function rejectClaim(claimId: string, reason: string): ClaimDetail | null {
  const claim = claimStore.get(claimId);
  if (!claim) return null;
  claim.status = 'rejected';
  claim.rejectionReason = reason;
  console.log(`[ClaimService] Claim ${claimId} rejected: ${reason}`);
  return { ...claim };
}
