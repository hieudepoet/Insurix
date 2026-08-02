/**
 * Test setup — mocks Sui client and keypairs so tests never hit a real chain.
 */

import { vi } from "vitest";

// ── Mock environment variables ───────────────────────────────────────
process.env.SUI_NETWORK = "testnet";
process.env.SUI_RPC_URL = "https://fullnode.testnet.sui.io:443";
process.env.BACKEND_PORT = "3001";
process.env.ADMIN_API_KEY = "test-admin-api-key";

// Contract IDs — empty strings keep the service in PoC / in-memory mode
process.env.ATTESTATIONS_PKG_ID = "";
process.env.SCHEMAS_PKG_ID = "";
process.env.SETTLEMENT_PKG_ID = "";
process.env.REGISTRY_ID = "";
process.env.IDENTITY_VERIFIER_CAP_ID = "";
process.env.EXTERNAL_DATA_VERIFIER_CAP_ID = "";
process.env.FRAUD_CHECKER_CAP_ID = "";

// Agent keys — not needed in PoC mode
process.env.IDENTITY_AGENT_KEY = "";
process.env.EXTERNAL_DATA_AGENT_KEY = "";
process.env.FRAUD_AGENT_KEY = "";

// ── Mock @mysten/sui modules ─────────────────────────────────────────
vi.mock("@mysten/sui/grpc", () => ({
  SuiGrpcClient: vi.fn().mockImplementation(() => ({
    getObject: vi.fn().mockResolvedValue({ data: null }),
    queryEvents: vi.fn().mockResolvedValue({ data: [] }),
    executeTransactionBlock: vi.fn().mockResolvedValue({ digest: "mock-tx" }),
  })),
}));

vi.mock("@mysten/sui/transactions", () => ({
  Transaction: vi.fn().mockImplementation(() => ({
    moveCall: vi.fn(),
    pure: {
      id: vi.fn((v: string) => v),
      u64: vi.fn((v: number) => v),
      u8: vi.fn((v: number) => v),
      address: vi.fn((v: string) => v),
      string: vi.fn((v: string) => v),
    },
  })),
}));

// ── Mock the orchestrator to avoid real agent calls ──────────────────
vi.mock("../src/services/orchestrator.js", () => ({
  processClaim: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock attestation service to avoid chain queries ──────────────────
vi.mock("../src/services/attestation.service.js", () => ({
  getAttestationStatus: vi.fn().mockResolvedValue({
    IdentityVerified: true,
    ExternalDataVerified: true,
    FraudCheckPassed: true,
  }),
}));
