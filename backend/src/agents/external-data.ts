/**
 * External-Data Agent — queries real weather/flight APIs.
 * Issues Attestation<ExternalDataVerified> if threshold is met.
 */

import { Transaction } from '@mysten/sui/transactions';
import axios, { AxiosError } from 'axios';
import { sha256 } from '@noble/hashes/sha256';
import dotenv from 'dotenv';
import { suiClient, CONTRACTS } from '../config/sui-client.js';
import { getExternalDataAgentKeypair } from '../config/keypairs.js';

dotenv.config();

interface VerifyResult {
  success: boolean;
  txDigest?: string;
  error?: string;
}

// ─── Circuit Breaker ──────────────────────────────────────────────

interface CircuitBreakerState {
  consecutiveFailures: number;
  openUntil: number | null; // timestamp ms when circuit re-closes
}

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 60_000; // 60 seconds

const circuitStates = new Map<string, CircuitBreakerState>();

function getCircuitState(apiName: string): CircuitBreakerState {
  if (!circuitStates.has(apiName)) {
    circuitStates.set(apiName, { consecutiveFailures: 0, openUntil: null });
  }
  return circuitStates.get(apiName)!;
}

/**
 * Returns true if the circuit is open (should NOT call the API).
 */
function isCircuitOpen(apiName: string): boolean {
  const state = getCircuitState(apiName);
  if (state.openUntil === null) return false;

  if (Date.now() >= state.openUntil) {
    // Cooldown elapsed — half-open → reset to closed
    state.consecutiveFailures = 0;
    state.openUntil = null;
    console.log(`[ExternalDataAgent] Circuit for ${apiName} re-closed after cooldown`);
    return false;
  }
  return true;
}

function recordSuccess(apiName: string): void {
  const state = getCircuitState(apiName);
  state.consecutiveFailures = 0;
  state.openUntil = null;
}

function recordFailure(apiName: string): void {
  const state = getCircuitState(apiName);
  state.consecutiveFailures += 1;
  if (state.consecutiveFailures >= FAILURE_THRESHOLD) {
    state.openUntil = Date.now() + COOLDOWN_MS;
    console.warn(
      `[ExternalDataAgent] Circuit OPEN for ${apiName} (${FAILURE_THRESHOLD} consecutive failures). Cooldown until ${new Date(state.openUntil).toISOString()}`,
    );
  }
}

// ─── API Queries ──────────────────────────────────────────────────

const HTTP_TIMEOUT_MS = 30_000;

interface ApiQueryResult {
  dataSource: string;
  dataHash: Uint8Array;
  thresholdMet: boolean;
}

/**
 * Query AviationStack for a flight number and check if delay > 120 minutes.
 */
async function queryFlightDelay(flightNumber: string): Promise<ApiQueryResult> {
  const apiName = 'aviationstack';
  const apiKey = process.env.AVIATIONSTACK_API_KEY;

  if (!apiKey) {
    throw new Error('AVIATIONSTACK_API_KEY not configured');
  }
  if (isCircuitOpen(apiName)) {
    throw new Error(`Circuit breaker open for ${apiName}`);
  }

  try {
    const response = await axios.get('http://api.aviationstack.com/v1/flights', {
      params: { access_key: apiKey, flight_iata: flightNumber },
      timeout: HTTP_TIMEOUT_MS,
    });

    const flights = response.data?.data ?? [];
    let delayMinutes = 0;

    if (flights.length > 0) {
      const flight = flights[0];
      const depDelay = flight?.departure?.delay ?? 0;
      const arrDelay = flight?.arrival?.delay ?? 0;
      delayMinutes = Math.max(depDelay, arrDelay);
    }

    const payload = JSON.stringify(response.data);
    const dataHash = sha256(new TextEncoder().encode(payload));
    const thresholdMet = delayMinutes > 120;

    console.log(
      `[ExternalDataAgent] Flight ${flightNumber}: delay=${delayMinutes}min, threshold met=${thresholdMet}`,
    );

    recordSuccess(apiName);
    return { dataSource: apiName, dataHash, thresholdMet };
  } catch (err) {
    recordFailure(apiName);
    if (err instanceof AxiosError) {
      throw new Error(`AviationStack API error: ${err.message}`);
    }
    throw err;
  }
}

/**
 * Query OpenWeatherMap for a location and check if rainfall > 50mm.
 */
async function queryRainfall(location: string): Promise<ApiQueryResult> {
  const apiName = 'openweathermap';
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    throw new Error('OPENWEATHERMAP_API_KEY not configured');
  }
  if (isCircuitOpen(apiName)) {
    throw new Error(`Circuit breaker open for ${apiName}`);
  }

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: { q: location, appid: apiKey, units: 'metric' },
        timeout: HTTP_TIMEOUT_MS,
      },
    );

    const rain = response.data?.rain ?? {};
    // OpenWeatherMap reports rain in mm for the last 1 hour (rain.1h) or 3 hours (rain.3h)
    const rainfall1h = rain['1h'] ?? 0;
    const rainfall3h = rain['3h'] ?? 0;
    const totalRainfall = Math.max(rainfall1h, rainfall3h);
    const thresholdMet = totalRainfall > 50;

    const payload = JSON.stringify(response.data);
    const dataHash = sha256(new TextEncoder().encode(payload));

    console.log(
      `[ExternalDataAgent] Location ${location}: rainfall=${totalRainfall}mm, threshold met=${thresholdMet}`,
    );

    recordSuccess(apiName);
    return { dataSource: apiName, dataHash, thresholdMet };
  } catch (err) {
    recordFailure(apiName);
    if (err instanceof AxiosError) {
      throw new Error(`OpenWeatherMap API error: ${err.message}`);
    }
    throw err;
  }
}

// ─── Transaction Builder ──────────────────────────────────────────

async function executeTransaction(
  tx: Transaction,
  label: string,
): Promise<{ digest: string }> {
  const keypair = getExternalDataAgentKeypair();

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
 * Verify external data for a subject and issue an on-chain attestation.
 *
 * @param subjectId   - The on-chain subject object ID
 * @param productType - 0 = flight delay, 1 = heavy rain
 * @param externalId  - Flight number (productType=0) or location string (productType=1)
 */
export async function verifyExternalData(
  subjectId: string,
  productType: number,
  externalId: string,
): Promise<VerifyResult> {
  const label = 'ExternalDataAgent';

  try {
    // --- Query the appropriate API ---
    let apiResult: ApiQueryResult;

    if (productType === 0) {
      console.log(`[${label}] Querying flight delay for: ${externalId}`);
      apiResult = await queryFlightDelay(externalId);
    } else if (productType === 1) {
      console.log(`[${label}] Querying rainfall for: ${externalId}`);
      apiResult = await queryRainfall(externalId);
    } else {
      return { success: false, error: `Unknown productType: ${productType}` };
    }

    // --- Validate config ---
    const { SCHEMAS_PKG_ID, REGISTRY_ID, EXTERNAL_DATA_VERIFIER_CAP_ID } = CONTRACTS;
    if (!SCHEMAS_PKG_ID || !REGISTRY_ID || !EXTERNAL_DATA_VERIFIER_CAP_ID) {
      return { success: false, error: 'Contract configuration incomplete' };
    }

    // --- Build transaction ---
    const tx = new Transaction();
    tx.moveCall({
      target: `${SCHEMAS_PKG_ID}::external_data::attest_external_data_verified`,
      arguments: [
        tx.object(EXTERNAL_DATA_VERIFIER_CAP_ID),               // admin_cap
        tx.pure.id(REGISTRY_ID),                               // registry: ID
        tx.pure.id(subjectId),                                 // subject: ID
        tx.pure.string(apiResult.dataSource),                  // data_source: String
        tx.pure.vector('u8', Array.from(apiResult.dataHash)),  // data_hash: vector<u8>
        tx.pure.bool(apiResult.thresholdMet),                  // threshold_met: bool
        tx.pure.u64(Date.now()),                               // verified_at_ms: u64
      ],
    });

    // --- Execute ---
    const result = await executeTransaction(tx, label);
    console.log(
      `[${label}] Attestation issued (source=${apiResult.dataSource}, threshold=${apiResult.thresholdMet}). txDigest: ${result.digest}`,
    );

    return { success: true, txDigest: result.digest };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[${label}] Error: ${msg}`);
    return { success: false, error: msg };
  }
}
