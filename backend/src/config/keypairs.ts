import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import dotenv from 'dotenv';
dotenv.config();

// Each agent has its own keypair, loaded from environment
export function getIdentityAgentKeypair(): Ed25519Keypair {
  const key = process.env.IDENTITY_AGENT_KEY;
  if (!key) throw new Error('IDENTITY_AGENT_KEY not set in environment');
  return Ed25519Keypair.fromSecretKey(key);
}

export function getExternalDataAgentKeypair(): Ed25519Keypair {
  const key = process.env.EXTERNAL_DATA_AGENT_KEY;
  if (!key) throw new Error('EXTERNAL_DATA_AGENT_KEY not set in environment');
  return Ed25519Keypair.fromSecretKey(key);
}

export function getFraudAgentKeypair(): Ed25519Keypair {
  const key = process.env.FRAUD_AGENT_KEY;
  if (!key) throw new Error('FRAUD_AGENT_KEY not set in environment');
  return Ed25519Keypair.fromSecretKey(key);
}
