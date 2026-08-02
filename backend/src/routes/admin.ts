import { Router, Request, Response, NextFunction } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/error-handler.js';
import { claimIndex } from './claims.js';
import { Transaction } from '@mysten/sui/transactions';
import { suiClient, CONTRACTS } from '../config/sui-client.js';

const router: Router = Router();

// POST /claims/:id/revoke - Revoke an attestation (admin only)
router.post('/claims/:id/revoke', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { attestationType } = req.body;

    if (!attestationType) {
      throw new AppError(400, 'Missing required field: attestationType');
    }

    const validTypes = ['identity', 'external-data', 'fraud-check'];
    if (!validTypes.includes(attestationType)) {
      throw new AppError(400, `Invalid attestationType. Must be one of: ${validTypes.join(', ')}`);
    }

    const localClaim = claimIndex.get(id);
    if (!localClaim) {
      throw new AppError(404, 'Claim not found');
    }

    // Map attestationType to contract verifier cap
    const verifierCapMap: Record<string, string> = {
      'identity': CONTRACTS.IDENTITY_VERIFIER_CAP_ID,
      'external-data': CONTRACTS.EXTERNAL_DATA_VERIFIER_CAP_ID,
      'fraud-check': CONTRACTS.FRAUD_CHECKER_CAP_ID,
    };

    const verifierCapId = verifierCapMap[attestationType];
    const { ATTESTATIONS_PKG_ID, REGISTRY_ID } = CONTRACTS;

    if (verifierCapId && ATTESTATIONS_PKG_ID && REGISTRY_ID) {
      // Build revoke transaction (only when contracts are deployed)
      const tx = new Transaction();
      tx.moveCall({
        target: `${ATTESTATIONS_PKG_ID}::attestations::revoke`,
        arguments: [
          tx.pure.id(REGISTRY_ID),
          tx.pure.id(verifierCapId),
          tx.pure.id(id),
        ],
      });
      // TODO: sign with admin keypair and execute
    } else {
      console.log(`[Admin] Revoke: contracts not configured — PoC mode (no on-chain tx)`);
    }

    console.log(`[Admin] Revoked ${attestationType} attestation for claim ${id}`);

    res.json({
      status: 'revoked',
      attestationType,
    });
  } catch (err) {
    next(err);
  }
});

// GET /stats - Admin statistics
router.get('/stats', requireAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = Array.from(claimIndex.values());

    const stats = {
      totalClaims: claims.length,
      pendingClaims: claims.filter(c => c.status === 'pending' || c.status === 'attesting').length,
      settledClaims: claims.filter(c => c.status === 'settled').length,
      rejectedClaims: claims.filter(c => c.status === 'rejected' || c.status === 'failed').length,
      totalAmount: claims.reduce((sum, c) => sum + (c.amountUsd ?? c.amount), 0),
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
});

export default router;
