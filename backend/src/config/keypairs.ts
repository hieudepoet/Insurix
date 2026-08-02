import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import dotenv from 'dotenv';
dotenv.config();

// Each agent has its own keypair, loaded from environment.
// Falls back to a generated keypair in PoC mode when env vars are not set.
function loadAgentKeypair(envKey: string, agentName: string): Ed25519Keypair {
  const key = process.env[envKey];
  if (!key) {
    console.warn(`[PoC] ${agentName} keypair not set — using generated keypair`);
    return Ed25519Keypair.generate();
  }
  return Ed25519Keypair.fromSecretKey(key);
}

export function getIdentityAgentKeypair(): Ed25519Keypair {
  return loadAgentKeypair('IDENTITY_AGENT_KEY', 'Identity Agent');
}

export function getExternalDataAgentKeypair(): Ed25519Keypair {
  return loadAgentKeypair('EXTERNAL_DATA_AGENT_KEY', 'External Data Agent');
}

export function getFraudAgentKeypair(): Ed25519Keypair {
  return loadAgentKeypair('FRAUD_AGENT_KEY', 'Fraud Agent');
}

// Holds SettlementAdminCap — signs try_settle / reject_claim transactions.
export function getSettlementAdminKeypair(): Ed25519Keypair {
  return loadAgentKeypair('SETTLEMENT_ADMIN_KEY', 'Settlement Admin');
}
