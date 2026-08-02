import { SuiGrpcClient } from '@mysten/sui/grpc';
import dotenv from 'dotenv';
dotenv.config();

const NETWORK = process.env.SUI_NETWORK || 'testnet';
const RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443';

export const suiClient = new SuiGrpcClient({
  network: NETWORK as 'testnet' | 'mainnet' | 'devnet',
  baseUrl: RPC_URL,
});

// Contract IDs from deployment
export const CONTRACTS = {
  ATTESTATIONS_PKG_ID: process.env.ATTESTATIONS_PKG_ID || '',
  SCHEMAS_PKG_ID: process.env.SCHEMAS_PKG_ID || '',
  SETTLEMENT_PKG_ID: process.env.SETTLEMENT_PKG_ID || '',
  REGISTRY_ID: process.env.REGISTRY_ID || '',
  // Admin capability object IDs — each agent owns its own verifier cap
  IDENTITY_VERIFIER_CAP_ID: process.env.IDENTITY_VERIFIER_CAP_ID || '',
  EXTERNAL_DATA_VERIFIER_CAP_ID: process.env.EXTERNAL_DATA_VERIFIER_CAP_ID || '',
  FRAUD_CHECKER_CAP_ID: process.env.FRAUD_CHECKER_CAP_ID || '',
};
