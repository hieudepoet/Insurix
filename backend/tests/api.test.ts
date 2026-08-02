/**
 * Insurix API Integration Tests
 *
 * Tests the Express API endpoints with mocked Sui service layer.
 */

import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import type { Express } from "express";

let app: Express;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  // Dynamic import after mocks are set up in setup.ts
  const mod = await import("../src/index.js");
  app = mod.default;
  request = supertest(app);
});

// ─── Health Check ─────────────────────────────────────────────────────

describe("GET /api/health", () => {
  it("should return 200 with status ok", async () => {
    const res = await request.get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("network");
    expect(res.body).toHaveProperty("timestamp");
  });
});

// ─── Claims CRUD ──────────────────────────────────────────────────────

describe("POST /api/claims", () => {
  it("should create a claim and return 201 with claimId", async () => {
    const res = await request
      .post("/api/claims")
      .send({
        walletAddress: "0xTEST",
        claimType: "flight-delay",
        description: "Test flight delay claim",
        amount: 500000000,
        params: { flightNumber: "TEST123", date: "2026-08-01" },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("claimId");
    expect(res.body).toHaveProperty("txDigest");
    expect(res.body).toHaveProperty("status", "pending");
    expect(res.body).toHaveProperty("walletAddress", "0xTEST");
    expect(res.body).toHaveProperty("amountUsd", 500000000);
    expect(typeof res.body.claimId).toBe("string");
  });

  it("should return 400 when required fields are missing", async () => {
    const res = await request
      .post("/api/claims")
      .send({ description: "Missing fields" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should create a claim without walletAddress (mobile PoC) and generate one", async () => {
    const res = await request
      .post("/api/claims")
      .send({
        claimType: "flight-delay",
        amount: 100,
        params: { flightNumber: "MOB01" },
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("claimId");
    expect(res.body).toHaveProperty("walletAddress");
    expect(res.body).toHaveProperty("amountUsd", 100);
    // Generated address should be a valid Sui address (0x + 64 hex chars)
    expect(res.body.walletAddress).toMatch(/^0x[0-9a-f]{64}$/);
  });
});

describe("GET /api/claims", () => {
  it("should return an array of claims", async () => {
    const res = await request.get("/api/claims");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const claim = res.body[0];
      expect(claim).toHaveProperty("claimId");
      expect(claim).toHaveProperty("claimType");
      expect(claim).toHaveProperty("amount");
      expect(claim).toHaveProperty("amountUsd");
      expect(claim).toHaveProperty("status");
      expect(claim).toHaveProperty("attestationProgress");
    }
  });

  it("should filter claims by wallet address", async () => {
    const res = await request.get("/api/claims?wallet=0xTEST");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    for (const claim of res.body) {
      expect(claim).toHaveProperty("claimId");
    }
  });
});

describe("GET /api/claims/:id", () => {
  it("should return claim details for a valid ID", async () => {
    // First create a claim
    const createRes = await request
      .post("/api/claims")
      .send({
        walletAddress: "0xDETAIL",
        claimType: "weather",
        amount: 200000000,
        params: { location: "Tokyo" },
      });

    const claimId = createRes.body.claimId;

    // Then fetch its details
    const res = await request.get(`/api/claims/${claimId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("claimId", claimId);
    expect(res.body).toHaveProperty("claimType", "weather");
    expect(res.body).toHaveProperty("amount", 200000000);
    expect(res.body).toHaveProperty("amountUsd", 200000000);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("attestationProgress");
    expect(res.body.attestationProgress).toHaveProperty("identity");
    expect(res.body.attestationProgress).toHaveProperty("externalData");
    expect(res.body.attestationProgress).toHaveProperty("fraudCheck");
  });

  it("should return 404 for a non-existent claim", async () => {
    const res = await request.get("/api/claims/0xnonexistent");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Claim not found");
  });
});

describe("POST /api/claims/:id/settle", () => {
  it("should settle a valid claim", async () => {
    // Create a claim first
    const createRes = await request
      .post("/api/claims")
      .send({
        walletAddress: "0xSETTLE",
        claimType: "flight-delay",
        amount: 750000000,
        params: { flightNumber: "SETTLE01", date: "2026-08-02" },
      });

    const claimId = createRes.body.claimId;

    // Settle the claim
    const res = await request.post(`/api/claims/${claimId}/settle`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("reason");
    expect(res.body).toHaveProperty("txDigest");
    // Status should be either 'settled' or 'rejected' depending on mock attestation state
    expect(["settled", "rejected", "ready_to_settle"]).toContain(res.body.status);
  });

  it("should return 404 when settling a non-existent claim", async () => {
    const res = await request.post("/api/claims/0xnonexistent/settle");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Claim not found");
  });
});

// ─── Admin Endpoints ──────────────────────────────────────────────────

describe("GET /api/admin/stats", () => {
  it("should return 401 without API key", async () => {
    const res = await request.get("/api/admin/stats");

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });

  it("should return stats with valid API key", async () => {
    const res = await request
      .get("/api/admin/stats")
      .set("x-api-key", "test-admin-api-key");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalClaims");
    expect(res.body).toHaveProperty("pendingClaims");
    expect(res.body).toHaveProperty("settledClaims");
    expect(res.body).toHaveProperty("rejectedClaims");
    expect(res.body).toHaveProperty("totalAmount");
    expect(typeof res.body.totalClaims).toBe("number");
  });
});

describe("POST /api/admin/claims/:id/revoke", () => {
  it("should return 401 without API key", async () => {
    const res = await request
      .post("/api/admin/claims/0xtest/revoke")
      .send({ attestationType: "identity" });

    expect(res.status).toBe(401);
  });

  it("should revoke an attestation with valid API key", async () => {
    // Create a claim first
    const createRes = await request
      .post("/api/claims")
      .send({
        walletAddress: "0xREVOKE",
        claimType: "flight-delay",
        amount: 300000000,
        params: { flightNumber: "REV01", date: "2026-08-03" },
      });

    const claimId = createRes.body.claimId;

    const res = await request
      .post(`/api/admin/claims/${claimId}/revoke`)
      .set("x-api-key", "test-admin-api-key")
      .send({ attestationType: "identity" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "revoked");
    expect(res.body).toHaveProperty("attestationType", "identity");
  });

  it("should return 400 for missing attestationType", async () => {
    const createRes = await request
      .post("/api/claims")
      .send({
        walletAddress: "0xREVOKE2",
        claimType: "weather",
        amount: 100000000,
        params: { location: "Osaka" },
      });

    const claimId = createRes.body.claimId;

    const res = await request
      .post(`/api/admin/claims/${claimId}/revoke`)
      .set("x-api-key", "test-admin-api-key")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 for invalid attestationType", async () => {
    const createRes = await request
      .post("/api/claims")
      .send({
        walletAddress: "0xREVOKE3",
        claimType: "flight-delay",
        amount: 100000000,
        params: { flightNumber: "REV03" },
      });

    const claimId = createRes.body.claimId;

    const res = await request
      .post(`/api/admin/claims/${claimId}/revoke`)
      .set("x-api-key", "test-admin-api-key")
      .send({ attestationType: "invalid-type" });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 404 for non-existent claim", async () => {
    const res = await request
      .post("/api/admin/claims/0xnonexistent/revoke")
      .set("x-api-key", "test-admin-api-key")
      .send({ attestationType: "identity" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Claim not found");
  });
});
