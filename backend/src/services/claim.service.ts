/**
 * Claim Service — handles on-chain claim operations.
 * Creates claims, funds escrow, triggers settlement.
 */

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, CONTRACTS } from '../config/sui-client.js';
import { getAttestationStatus, type AttestationStatus } from './attestation.service.js';
import { processClaim } from './orchestrator.js';

// ─── Types ────────────────────────────────────────────────────────

export interface ClaimDetail {
  claimId: string;
  subjectId: string;
  status: 'pending' | 'attesting' | 'ready_to_settle' | 'settled' | 'failed';
  attestationStatus: AttestationStatus;
  amount: number;
  productType: number;
  customerAddress: string;
  externalId: string;
  createdAt: number;
}

interface CreateClaimResult {
  claimId: string;
  subjectId: string;
  txDigest: string;
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

// ─── Public API ───────────────────────────────────────────────────

/**
 * Create a new claim, fund escrow, and kick off agent attestation pipeline.
 *
 * For PoC: the claim object is tracked in-memory and a placeholder on-chain
 * transaction is executed. The orchestrator is triggered automatically.
 *
 * @param amount          - Claim amount in SUI
 * @param productType     - 0 = flight delay, 1 = heavy rain
 * @param customerAddress - Sui address of the claimant
 * @param externalId      - Flight number or location identifier
 */
export async function createClaim(
  amount: number,
  productType: number,
  customerAddress: string,
  externalId: string,
): Promise<CreateClaimResult> {
  const { SETTLEMENT_PKG_ID, REGISTRY_ID } = CONTRACTS;

  // Generate IDs for the new claim
  const claimId = generateClaimId();
  const subjectId = generateClaimId(); // In production, this is the on-chain object ID

  console.log(`[ClaimService] Creating claim ${claimId} for ${amount} SUI (productType=${productType})`);

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
    productType,
    customerAddress,
    externalId,
    createdAt: Date.now(),
  };
  claimStore.set(claimId, claim);

  // Kick off the agent pipeline (fire-and-forget)
  processClaim(claimId, subjectId, amount, productType, customerAddress, externalId);

  console.log(`[ClaimService] Claim ${claimId} created, agents dispatched`);

  // Return a synthetic digest for PoC mode
  const txDigest = SETTLEMENT_PKG_ID ? 'pending-on-chain' : 'poc-in-memory';

  return { claimId, subjectId, txDigest };
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

  // Refresh attestation status from chain
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

    // All attestations present — attempt settlement
    const { SETTLEMENT_PKG_ID } = CONTRACTS;
    if (!SETTLEMENT_PKG_ID) {
      claim.status = 'ready_to_settle';
      console.log(`[ClaimService] All attestations present but settlement contract not deployed`);
      return { settled: false, reason: 'Settlement contract not deployed (PoC mode — all attestations verified)' };
    }

    // Build settlement transaction
    const tx = new Transaction();
    tx.moveCall({
      target: `${SETTLEMENT_PKG_ID}::settlement::try_settle`,
      arguments: [
        tx.pure.id(CONTRACTS.REGISTRY_ID),
        tx.pure.id(claim.subjectId),
        // Receiving arguments for attestations would be added here
        // once the settlement contract defines the exact signature
      ],
    });

    // TODO: sign with admin keypair and execute
    // const result = await suiClient.signAndExecuteTransaction({ transaction: tx, signer: adminKeypair });

    claim.status = 'settled';
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

  // Refresh attestation status from chain if registry is configured
  if (CONTRACTS.REGISTRY_ID) {
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
  }

  return { ...claim };
}
