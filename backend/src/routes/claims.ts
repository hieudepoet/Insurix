import { Router, Request, Response, NextFunction } from 'express';
import { createClaim, getClaimStatus, settleClaim } from '../services/claim.service.js';
import { AppError } from '../middleware/error-handler.js';

const router: Router = Router();

// In-memory claim tracking (PoC - mirrors claim.service.ts claimStore)
export const claimIndex = new Map<string, {
  claimId: string;
  claimType: 'flight-delay' | 'weather';
  amount: number;
  amountUsd: number;
  status: string;
  walletAddress: string;
  createdAt: number;
  settledAt?: number;
  rejectionReason?: string;
}>();

// Helper to map productType to claimType
function productTypeToClaimType(productType: number): 'flight-delay' | 'weather' {
  return productType === 0 ? 'flight-delay' : 'weather';
}

// Helper to map claimType to productType
function claimTypeToProductType(claimType: 'flight-delay' | 'weather'): number {
  return claimType === 'flight-delay' ? 0 : 1;
}

// POST /claims - Create a new claim
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress, claimType, description, amount, params } = req.body;

    if (!claimType || !amount) {
      throw new AppError(400, 'Missing required fields: claimType, amount');
    }

    const productType = claimTypeToProductType(claimType);
    const externalId = params?.flightNumber || params?.location || 'unknown';

    // walletAddress is optional — service generates a mock address if empty
    const result = await createClaim(amount, productType, walletAddress || '', externalId);

    // Track in local index (use the address from service, which may be generated)
    claimIndex.set(result.claimId, {
      claimId: result.claimId,
      claimType,
      amount,
      amountUsd: amount,
      status: 'pending',
      walletAddress: result.customerAddress,
      createdAt: Date.now(),
    });

    res.status(201).json({
      claimId: result.claimId,
      txDigest: result.txDigest,
      status: 'pending',
      walletAddress: result.customerAddress,
      amountUsd: amount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /claims - List claims
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = req.query.wallet as string | undefined;

    const claims = Array.from(claimIndex.values())
      .filter(c => !wallet || c.walletAddress === wallet)
      .map(c => ({
        claimId: c.claimId,
        claimType: c.claimType,
        amount: c.amount,
        amountUsd: c.amountUsd,
        status: c.status,
        attestationProgress: {
          identity: false,
          externalData: false,
          fraudCheck: false,
        },
        createdAt: c.createdAt,
      }));

    res.json(claims);
  } catch (err) {
    next(err);
  }
});

// GET /claims/:id - Get claim details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const localClaim = claimIndex.get(id);

    if (!localClaim) {
      throw new AppError(404, 'Claim not found');
    }

    // Try to get fresh status from service
    let attestationProgress = { identity: false, externalData: false, fraudCheck: false };
    try {
      const status = await getClaimStatus(id);
      attestationProgress = {
        identity: status.attestationStatus.IdentityVerified,
        externalData: status.attestationStatus.ExternalDataVerified,
        fraudCheck: status.attestationStatus.FraudCheckPassed,
      };
      localClaim.status = status.status;
    } catch {
      // Use cached status if service call fails
    }

    res.json({
      claimId: localClaim.claimId,
      claimType: localClaim.claimType,
      amount: localClaim.amount,
      amountUsd: localClaim.amountUsd,
      status: localClaim.status,
      attestationProgress,
      createdAt: localClaim.createdAt,
      settledAt: localClaim.settledAt,
      rejectionReason: localClaim.rejectionReason,
    });
  } catch (err) {
    next(err);
  }
});

// POST /claims/:id/settle - Settle a claim
router.post('/:id/settle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const localClaim = claimIndex.get(id);

    if (!localClaim) {
      throw new AppError(404, 'Claim not found');
    }

    const result = await settleClaim(id);

    const status = result.settled ? 'settled' : 'rejected';
    localClaim.status = status;
    if (result.settled) {
      localClaim.settledAt = Date.now();
    } else {
      localClaim.rejectionReason = result.reason;
    }

    res.json({
      status,
      reason: result.reason,
      txDigest: result.txDigest || '',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
