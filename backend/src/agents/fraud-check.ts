/**
 * Fraud-Check Agent — rule-based fraud detection.
 * Issues Attestation<FraudCheckPassed> if all rules pass.
 */

import { Transaction } from '@mysten/sui/transactions';
import { suiClient, CONTRACTS } from '../config/sui-client.js';
import { getFraudAgentKeypair } from '../config/keypairs.js';

interface VerifyResult {
  success: boolean;
  txDigest?: string;
  error?: string;
}

// ─── Configuration ────────────────────────────────────────────────

const POLICY_LIMIT_SUI = 10;         // max claim in SUI for strict mode
const HIGH_AMOUNT_THRESHOLD_SUI = 5; // above this, deduct confidence points
const PASS_THRESHOLD = 50;           // score must be > 50 to pass
const DEDUCTION_HIGH_AMOUNT = 20;

// When FRAUD_CHECK_STRICT is not explicitly 'true', the policy-limit rule is
// skipped so that demo/PoC claims of any amount pass fraud detection.
const FRAUD_CHECK_STRICT = process.env.FRAUD_CHECK_STRICT === 'true';

// Hardcoded blocklist (empty for PoC)
const BLOCKLIST: Set<string> = new Set();

// In-memory duplicate tracker: address → timestamp of last claim
const recentClaims = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

// ─── Rule Engine ──────────────────────────────────────────────────

interface RuleResult {
  passed: boolean;
  score: number;
  log: string[];
}

function evaluateRules(
  claimAmount: number,
  customerAddress: string,
): RuleResult {
  const log: string[] = [];
  let score = 100;
  let allPassed = true;

  // Rule 1: Claim amount within policy limit (≤ 10 SUI) — only enforced in strict mode
  if (FRAUD_CHECK_STRICT && claimAmount > POLICY_LIMIT_SUI) {
    log.push(`[FAIL] Claim amount ${claimAmount} SUI exceeds policy limit of ${POLICY_LIMIT_SUI} SUI`);
    allPassed = false;
    score = 0;
  } else if (!FRAUD_CHECK_STRICT) {
    log.push(`[SKIP] Policy limit check disabled (FRAUD_CHECK_STRICT != true) — amount ${claimAmount} SUI auto-passed`);
  } else {
    log.push(`[PASS] Claim amount ${claimAmount} SUI within policy limit`);
  }

  // Rule 1b: High amount confidence deduction
  if (claimAmount > HIGH_AMOUNT_THRESHOLD_SUI) {
    score -= DEDUCTION_HIGH_AMOUNT;
    log.push(`[DEDUCT] Claim amount > ${HIGH_AMOUNT_THRESHOLD_SUI} SUI: -${DEDUCTION_HIGH_AMOUNT} points (score=${score})`);
  }

  // Rule 2: Customer address not on blocklist
  if (BLOCKLIST.has(customerAddress.toLowerCase())) {
    log.push(`[FAIL] Address ${customerAddress} is on the blocklist`);
    allPassed = false;
    score = 0;
  } else {
    log.push(`[PASS] Address not on blocklist`);
  }

  // Rule 3: No duplicate claim from same address in last 24h
  const lastClaimTime = recentClaims.get(customerAddress.toLowerCase());
  if (lastClaimTime !== undefined) {
    const elapsed = Date.now() - lastClaimTime;
    if (elapsed < DUPLICATE_WINDOW_MS) {
      log.push(
        `[FAIL] Duplicate claim: address ${customerAddress} submitted a claim ${Math.round(elapsed / 60000)}min ago (window=24h)`,
      );
      allPassed = false;
      score = 0;
    } else {
      log.push(`[PASS] No duplicate claim within 24h window`);
    }
  } else {
    log.push(`[PASS] No prior claims from this address`);
  }

  // If any rule failed, score is forced to 0
  if (!allPassed) {
    score = 0;
  }

  // Record this claim for future duplicate detection
  recentClaims.set(customerAddress.toLowerCase(), Date.now());

  return { passed: score > PASS_THRESHOLD, score, log };
}

// ─── Transaction Execution ────────────────────────────────────────

async function executeTransaction(
  tx: Transaction,
  label: string,
): Promise<{ digest: string }> {
  const keypair = getFraudAgentKeypair();

  // Build the transaction to raw bytes
  const bytes = await tx.build({ client: suiClient });

  // Sign the transaction bytes
  const { signature } = await keypair.signTransaction(bytes);

  // Execute the signed transaction
  const result = await suiClient.core.executeTransaction({
    transaction: bytes,
    signatures: [signature],
  });

  console.log(`[${label}] Transaction executed. digest: ${result.transaction.digest}`);
  return { digest: result.transaction.digest };
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Run fraud checks on a claim and issue an on-chain attestation.
 *
 * @param subjectId       - The on-chain subject object ID
 * @param claimAmount     - Claim amount in SUI
 * @param customerAddress - The Sui address of the claimant
 */
export async function checkFraud(
  subjectId: string,
  claimAmount: number,
  customerAddress: string,
): Promise<VerifyResult> {
  const label = 'FraudCheckAgent';

  try {
    // --- Evaluate rules ---
    const ruleResult = evaluateRules(claimAmount, customerAddress);

    // Audit trail: log every rule evaluation
    console.log(`[${label}] === Fraud evaluation for subject ${subjectId} ===`);
    for (const line of ruleResult.log) {
      console.log(`[${label}] ${line}`);
    }
    console.log(`[${label}] Final score: ${ruleResult.score}/100, passed: ${ruleResult.passed}`);
    console.log(`[${label}] ===================================================`);

    if (!ruleResult.passed) {
      return {
        success: false,
        error: `Fraud check failed with score ${ruleResult.score}/100`,
      };
    }

    // --- Validate config ---
    const { SCHEMAS_PKG_ID, REGISTRY_ID, FRAUD_CHECKER_CAP_ID } = CONTRACTS;
    if (!SCHEMAS_PKG_ID || !REGISTRY_ID || !FRAUD_CHECKER_CAP_ID) {
      return { success: false, error: 'Contract configuration incomplete' };
    }

    // --- Build transaction ---
    const tx = new Transaction();
    tx.moveCall({
      target: `${SCHEMAS_PKG_ID}::fraud::attest_fraud_check_passed`,
      arguments: [
        tx.object(FRAUD_CHECKER_CAP_ID),          // admin_cap: &FraudCheckerCap
        tx.pure.id(REGISTRY_ID),                  // registry: ID
        tx.pure.id(subjectId),                    // subject: ID
        tx.pure.string('rule_based'),             // check_type: String
        tx.pure.u8(ruleResult.score),             // confidence_score: u8
        tx.pure.u64(Date.now()),                  // checked_at_ms: u64
      ],
    });

    // --- Execute ---
    const result = await executeTransaction(tx, label);
    console.log(`[${label}] Attestation issued (score=${ruleResult.score}). txDigest: ${result.digest}`);

    return { success: true, txDigest: result.digest };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${label}] Error: ${msg}`);
    return { success: false, error: msg };
  }
}
