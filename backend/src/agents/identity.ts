/**
 * Identity Agent — performs mock KYC verification.
 * In PoC: validates address format + checks against allowlist.
 * Issues Attestation<IdentityVerified> on-chain via Sui SDK.
 */

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, CONTRACTS } from '../config/sui-client.js';
import { getIdentityAgentKeypair } from '../config/keypairs.js';

interface VerifyResult {
  success: boolean;
  txDigest?: string;
  error?: string;
}

/**
 * Validates that a string is a well-formed Sui address:
 * starts with 0x followed by exactly 64 hex characters.
 */
function isValidSuiAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(address);
}

/**
 * Execute a transaction with retry + exponential backoff.
 * Attempts: 3, delays: 1s, 2s, 4s.
 */
async function executeWithRetry(
  tx: Transaction,
  label: string,
  maxAttempts = 3,
): Promise<{ digest: string }> {
  const keypair = getIdentityAgentKeypair();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Build the transaction to raw bytes
      const bytes = await tx.build({ client: suiClient });

      // Sign the transaction bytes
      const { signature } = await keypair.signTransaction(bytes);

      // Execute the signed transaction
      const result = await suiClient.core.executeTransaction({
        transaction: bytes,
        signatures: [signature],
      });

      return { digest: result.transaction.digest };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[${label}] Attempt ${attempt}/${maxAttempts} failed: ${msg}`);

      if (attempt === maxAttempts) {
        throw new Error(`All ${maxAttempts} attempts failed. Last error: ${msg}`);
      }

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = Math.pow(2, attempt - 1) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Unreachable: retry loop exited unexpectedly');
}

/**
 * Verify identity for a subject and issue an on-chain attestation.
 *
 * @param subjectId  - The on-chain subject object ID (the claim/policy being attested about)
 * @param customerAddress - The Sui address of the customer to verify
 * @returns Result with txDigest on success or error message on failure
 */
export async function verifyIdentity(
  subjectId: string,
  customerAddress: string,
): Promise<VerifyResult> {
  const label = 'IdentityAgent';

  try {
    // --- Validate inputs ---
    if (!isValidSuiAddress(customerAddress)) {
      console.log(`[${label}] Invalid Sui address format: ${customerAddress}`);
      return { success: false, error: 'Invalid Sui address format' };
    }

    // --- Mock KYC logic (PoC: always pass) ---
    console.log(`[${label}] Performing mock KYC for address: ${customerAddress}`);
    console.log(`[${label}] KYC decision: APPROVED (mock — PoC always passes)`);

    // --- Validate config ---
    const { SCHEMAS_PKG_ID, REGISTRY_ID, IDENTITY_VERIFIER_CAP_ID } = CONTRACTS;
    if (!SCHEMAS_PKG_ID || !REGISTRY_ID || !IDENTITY_VERIFIER_CAP_ID) {
      return { success: false, error: 'Contract configuration incomplete' };
    }

    // --- Build transaction ---
    const tx = new Transaction();
    tx.moveCall({
      target: `${SCHEMAS_PKG_ID}::identity::attest_identity_verified`,
      arguments: [
        tx.object(IDENTITY_VERIFIER_CAP_ID),   // admin_cap: &IdentityVerifierCap
        tx.pure.id(REGISTRY_ID),               // registry: ID
        tx.pure.id(subjectId),                 // subject: ID
        tx.pure.u8(1),                         // verification_level: intermediate
        tx.pure.u64(Date.now()),               // verified_at_ms: u64
      ],
    });

    // --- Execute with retry ---
    const result = await executeWithRetry(tx, label);
    console.log(`[${label}] Attestation issued. txDigest: ${result.digest}`);

    return { success: true, txDigest: result.digest };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${label}] Fatal error: ${msg}`);
    return { success: false, error: msg };
  }
}
