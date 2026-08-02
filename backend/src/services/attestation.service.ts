import { bcs } from '@mysten/sui/bcs';
import { fromHex, toHex } from '@mysten/sui/utils';
import { sha3_256 } from '@noble/hashes/sha3';
import { suiClient, CONTRACTS } from '../config/sui-client.js';
import { AppError } from '../middleware/error-handler.js';

/**
 * The three Insurix attestation schema types, matching the Move struct
 * fully-qualified names published under the schemas package.
 */
export const ATTESTATION_TYPES = {
  IdentityVerified: 'IdentityVerified',
  ExternalDataVerified: 'ExternalDataVerified',
  FraudCheckPassed: 'FraudCheckPassed',
} as const;

export type AttestationTypeName =
  | 'IdentityVerified'
  | 'ExternalDataVerified'
  | 'FraudCheckPassed';

export interface AttestationStatus {
  IdentityVerified: boolean;
  ExternalDataVerified: boolean;
  FraudCheckPassed: boolean;
}

interface OwnedObject {
  id: string;
  type?: string;
  [key: string]: unknown;
}

/**
 * Compute the derived box address deterministically from the registry ID,
 * subject ID, and revoked flag.
 *
 * Mirrors Move's `derived_object::derive_address(registry, BoxKey { subject, revoked })`.
 * Sui derived addresses = SHA3-256(parent_bytes ++ key_bcs_bytes ++ 0x40) where
 * 0x40 is the '@' separator used for derived object addresses.
 */
export function deriveBoxAddress(
  registryId: string,
  subjectId: string,
  revoked: boolean,
): string {
  const registryBytes = fromHex(registryId.replace(/^0x/, ''));

  // BCS-serialize BoxKey { subject: ID (Address), revoked: bool }
  const BoxKey = bcs.struct('BoxKey', {
    subject: bcs.Address,
    revoked: bcs.bool(),
  });
  const keyBytes = BoxKey.serialize({ subject: subjectId, revoked }).toBytes();

  // parent_bytes ++ key_bytes ++ DERIVED_ADDRESS_TAG (0x40)
  const DERIVED_ADDRESS_TAG = 0x40;
  const payload = new Uint8Array(
    registryBytes.length + keyBytes.length + 1,
  );
  payload.set(registryBytes, 0);
  payload.set(keyBytes, registryBytes.length);
  payload[registryBytes.length + keyBytes.length] = DERIVED_ADDRESS_TAG;

  const hash = sha3_256(payload);
  return '0x' + toHex(hash);
}

/**
 * Query all attestation objects currently owned by a subject's active box
 * address. Returns the raw owned-object records with their Move struct types.
 */
export async function getActiveAttestations(
  subjectId: string,
): Promise<OwnedObject[]> {
  const registryId = CONTRACTS.REGISTRY_ID;
  if (!registryId) {
    throw new AppError(500, 'REGISTRY_ID not configured');
  }

  const boxAddress = deriveBoxAddress(registryId, subjectId, false);

  const result = await suiClient.core.getOwnedObjects({
    address: boxAddress,
    type: `${CONTRACTS.ATTESTATIONS_PKG_ID}::attestations::Attestation`,
  });

  return (result.objects ?? []) as unknown as OwnedObject[];
}

/**
 * Returns a boolean map of which attestation types are currently active
 * (present in the active box) for a given subject.
 */
export async function getAttestationStatus(
  subjectId: string,
): Promise<AttestationStatus> {
  const attestations = await getActiveAttestations(subjectId);

  const status: AttestationStatus = {
    IdentityVerified: false,
    ExternalDataVerified: false,
    FraudCheckPassed: false,
  };

  const schemasPkgId = CONTRACTS.SCHEMAS_PKG_ID;

  for (const att of attestations) {
    const type = att.type ?? '';
    if (type.includes(`${schemasPkgId}::schemas::IdentityVerified`)) {
      status.IdentityVerified = true;
    } else if (type.includes(`${schemasPkgId}::schemas::ExternalDataVerified`)) {
      status.ExternalDataVerified = true;
    } else if (type.includes(`${schemasPkgId}::schemas::FraudCheckPassed`)) {
      status.FraudCheckPassed = true;
    }
  }

  return status;
}
