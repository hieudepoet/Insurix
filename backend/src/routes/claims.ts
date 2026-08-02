import { Router, Request, Response, NextFunction } from 'express';
import {
  createClaim,
  getClaimStatus,
  settleClaim,
  getClaim,
  getAllClaims,
  type ClaimDetail,
} from '../services/claim.service.js';
import { AppError } from '../middleware/error-handler.js';

const router: Router = Router();

// Helper to map productType to claimType
function productTypeToClaimType(productType: number): 'flight-delay' | 'weather' {
  return productType === 0 ? 'flight-delay' : 'weather';
}

// Helper to map claimType to productType
function claimTypeToProductType(claimType: 'flight-delay' | 'weather'): number {
  return claimType === 'flight-delay' ? 0 : 1;
}

// Normalize service status to API status (pending | settled | rejected)
function normalizeStatus(status: string): 'pending' | 'settled' | 'rejected' {
  if (status === 'settled') return 'settled';
  if (status === 'rejected' || status === 'failed') return 'rejected';
  return 'pending';
}

// Map a ClaimDetail from the service to the API list/detail response shape
function toApiShape(c: ClaimDetail) {
  return {
    claimId: c.claimId,
    claimType: productTypeToClaimType(c.productType),
    amount: c.amount,
    amountUsd: c.amountUsd,
    status: normalizeStatus(c.status),
    attestationProgress: {
      identity: c.attestationStatus.IdentityVerified,
      externalData: c.attestationStatus.ExternalDataVerified,
      fraudCheck: c.attestationStatus.FraudCheckPassed,
    },
    createdAt: c.createdAt,
    settledAt: c.settledAt,
    rejectionReason: c.rejectionReason,
  };
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

    const claims = getAllClaims()
      .filter((c) => !wallet || c.customerAddress === wallet)
      .map(toApiShape);

    res.json(claims);
  } catch (err) {
    next(err);
  }
});

// GET /claims/:id - Get claim details
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check existence first (sync, from unified store)
    if (!getClaim(id)) {
      throw new AppError(404, 'Claim not found');
    }

    // Get fresh status (may refresh attestation from chain if configured)
    const claim = await getClaimStatus(id);

    res.json(toApiShape(claim));
  } catch (err) {
    next(err);
  }
});

// POST /claims/:id/settle - Settle a claim
router.post('/:id/settle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!getClaim(id)) {
      throw new AppError(404, 'Claim not found');
    }

    const result = await settleClaim(id);

    res.json({
      status: result.settled ? 'settled' : 'rejected',
      reason: result.reason,
      txDigest: result.txDigest || '',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
