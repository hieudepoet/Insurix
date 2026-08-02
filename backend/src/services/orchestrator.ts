/**
 * Orchestrator — runs all 3 agents in parallel for a given claim.
 * Fire-and-forget: returns immediately, agents run asynchronously.
 */

import { verifyIdentity } from '../agents/identity.js';
import { verifyExternalData } from '../agents/external-data.js';
import { checkFraud } from '../agents/fraud-check.js';

const AGENT_TIMEOUT_MS = 30_000;

/**
 * Wrap a promise with a timeout guard.
 * If the promise does not settle within `ms` milliseconds, it rejects
 * with a timeout error instead of hanging indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Agent timed out after ${ms}ms`)),
      ms,
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Kick off all 3 verification agents in parallel for a given claim.
 * This function does NOT await the results — it fires and forgets.
 * All agent outcomes are logged asynchronously.
 *
 * @param claimId         - Unique identifier for the claim (for logging)
 * @param subjectId       - On-chain subject object ID
 * @param claimAmount     - Claim amount in SUI
 * @param productType     - 0 = flight delay, 1 = heavy rain
 * @param customerAddress - Sui address of the claimant
 * @param externalId      - Flight number or location identifier
 */
export function processClaim(
  claimId: string,
  subjectId: string,
  claimAmount: number,
  productType: number,
  customerAddress: string,
  externalId: string,
): void {
  const startTime = Date.now();
  console.log(
    `[Orchestrator] Starting parallel agents for claim ${claimId} (subject=${subjectId}, amount=${claimAmount} SUI, productType=${productType})`,
  );

  const agentNames = ['Identity', 'ExternalData', 'FraudCheck'] as const;

  // Fire-and-forget: don't await, just log outcomes
  Promise.allSettled([
    withTimeout(verifyIdentity(subjectId, customerAddress), AGENT_TIMEOUT_MS),
    withTimeout(verifyExternalData(subjectId, productType, externalId), AGENT_TIMEOUT_MS),
    withTimeout(checkFraud(subjectId, claimAmount, customerAddress), AGENT_TIMEOUT_MS),
  ]).then((results) => {
    const elapsed = Date.now() - startTime;

    console.log(`[Orchestrator] All agents settled for claim ${claimId} in ${elapsed}ms`);

    results.forEach((result, index) => {
      const agentName = agentNames[index];

      if (result.status === 'fulfilled') {
        const value = result.value;
        if (value.success) {
          console.log(`[${agentName}] PASSED — txDigest: ${value.txDigest}`);
        } else {
          console.log(`[${agentName}] FAILED — ${value.error}`);
        }
      } else {
        // rejected (timeout or unexpected error)
        console.error(`[${agentName}] ERROR — ${result.reason}`);
      }
    });

    console.log(`[Orchestrator] Orchestration complete for claim ${claimId}`);
  });
}
