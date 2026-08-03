# Insurix Demo Walkthrough

> Step-by-step guide for hackathon judges and developers.

---

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) installed and on your `PATH`
- [Node.js](https://nodejs.org/) v20+ installed
- [pnpm](https://pnpm.io/) v9+ installed (`npm install -g pnpm`)
- API keys for external data (optional — the system has fallback/mock modes):
  - [OpenWeatherMap](https://openweathermap.org/api) (weather claims)
  - [AviationStack](https://aviationstack.com/) (flight claims)
- Environment configured: copy `.env.example` to `.env` and fill in contract IDs, agent keypairs, and API keys

---

## 1. Start the Platform

Open a PowerShell terminal in the project root and run:

```powershell
.\scripts\dev.ps1
```

This starts three services:

| Service   | URL / Location                | Description                          |
|-----------|-------------------------------|--------------------------------------|
| Localnet  | `sui start` (background)     | Local Sui blockchain                  |
| Backend   | http://localhost:3001        | Express API server + AI agents       |
| Frontend  | http://localhost:3000        | Next.js web app                       |

Wait until you see the message `Backend is ready!` in the terminal before proceeding.

> **Tip:** If any service fails to start, see [Troubleshooting](#troubleshooting) at the bottom.

---

## 2. Open the Landing Page

Navigate to **http://localhost:3000** in your browser.

![Landing Page](screenshots/landing.png)

The landing page showcases:

- Insurix brand identity and value proposition
- Animated 3D hero scene (Three.js + `@react-three/fiber`)
- Smooth scroll animations powered by Lenis + GSAP ScrollTrigger
- Feature cards, How-It-Works workflow visualization, live stats, FAQ, and CTA sections

Scroll through the page to see each section animate into view.

---

## 3. Open the App — No Wallet Needed

Navigate to **http://localhost:3000/claims**.

The app automatically creates a session for you — no wallet needed. In PoC mode, blockchain attestation and smart contract execution happen **under the hood**, so you can focus on the user experience.

![Claims List](screenshots/claims-list-mobile.png)

> **How it works:** The backend manages the on-chain identity and keypairs. Users interact with a clean, mobile-first interface while the Sui blockchain runs transparently in the background.

---

## 4. Create a Claim (Flight Delay)

Click **New Claim** in the bottom navigation bar, or seed a demo claim via API:

```powershell
.\scripts\seed-demo.ps1
```

This creates a flight-delay claim with demo parameters:

| Field      | Value                        |
|------------|------------------------------|
| Flight     | VN123                        |
| Delay      | 3 hours                      |
| Amount     | $500 USD                     |

![Claim Created](screenshots/claim-created-mobile.png)

You should see the claim appear in the list with status **"pending"** and an attestation progress indicator showing **0/3**.

---

## 5. Watch AI Agents Verify

After creating a claim, the backend orchestrator launches three AI agents in parallel via `Promise.allSettled`:

| Agent          | Schema                  | What it does                                            |
|----------------|-------------------------|---------------------------------------------------------|
| Identity       | `IdentityVerified`      | Verifies the claimant's identity (mock KYC)             |
| External Data  | `ExternalDataVerified`   | Checks flight status via AviationStack API              |
| Fraud Check    | `FraudCheckPassed`       | Runs rule-based anomaly detection on claim parameters   |

Each agent holds a typed `Permit<T>` that authorizes it to issue exactly one attestation type. On success, the agent calls `attest()` on-chain, issuing a typed `Attestation<T>` into the Claim's active box.

![Attestations Progress](screenshots/attestations-progress-mobile.png)

The claim detail page auto-polls and attestation cards light up as each agent finishes:

- Identity Verified -> checkmark
- External Data Verified -> checkmark
- Fraud Check Passed -> checkmark

Each attestation is recorded on-chain as a verifiable, revocable credential — queryable via Sui Explorer.

> **If an agent fails:** The claim will remain in "pending" state with that attestation missing. You can check the backend logs for details. See [Troubleshooting](#troubleshooting).

---

## 6. Settle the Claim

Once all three attestations are verified, the **Settle Claim** button becomes enabled on the claim detail page. Click it, or settle via API:

```powershell
$claimId = "<CLAIM_ID_FROM_STEP_4>"
Invoke-RestMethod -Uri "http://localhost:3001/api/claims/$claimId/settle" -Method Post
```

![Settle Claim](screenshots/settle-claim-mobile.png)

The settlement smart contract (`try_settle`) reads the Claim's active box, verifies all 3 required attestations are present and none revoked, then calls `release_funds` on the linked Escrow. All of this happens under the hood — the user simply sees their claim status change to "settled" with the payout amount displayed.

---

## 7. View the Settlement Result

After settlement, the claim status updates to **"settled"**:

![Settlement Result](screenshots/settlement-result-mobile.png)

- The escrowed funds are released to the claimant
- A transaction digest is recorded on-chain (viewable on Sui Explorer)
- The claim detail page shows the settlement confirmation with payout amount and tx link

---

## 8. Admin Panel Demo

Navigate to **http://localhost:3000/admin**.

![Admin Panel](screenshots/admin-panel-mobile.png)

Enter the admin API key (from your `.env` file's `ADMIN_API_KEY`) to access:

- **Dashboard**: Total claims, pending, settled, rejected counts and total payout amount
- **Claims list**: All claims with attestation progress, sortable and filterable
- **Claim detail**: Full on-chain data with attestation management
- **Revoke attestation**: Admins can revoke any attestation if fraud is detected

### Try revoking an attestation

```powershell
$claimId = "<CLAIM_ID>"
$headers = @{ "x-api-key" = "<YOUR_ADMIN_API_KEY>" }
$body = '{"attestationType": "fraud-check"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/claims/$claimId/revoke" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

After revocation, re-attempting `try_settle` on that claim will fail with a rejection reason (revoked attestation detected).

---

## Architecture Overview

```
+-------------+     +--------------+     +-----------------+
|   Frontend  |---->|   Backend    |---->|  Sui Blockchain |
|  (Next.js)  |<----|  (Express)   |<----|  (Move contracts)|
+-------------+     +------+-------+     +-----------------+
                           |
                    +------+-------+
                    |  AI Agents   |
                    |  - Identity  |
                    |  - Ext Data  |
                    |  - Fraud     |
                    +--------------+
```

**Data flow:**

1. Frontend sends claim data to backend API
2. Backend creates on-chain `Claim` object + locks `Escrow`
3. Backend orchestrator launches 3 AI agents in parallel
4. Each agent calls `attest()` on-chain with its `Permit<T>`
5. Frontend polls attestation status until all 3 are present
6. User clicks "Settle" -> backend calls `try_settle()` -> escrow releases funds
7. Frontend displays settlement result with Sui Explorer tx link

> **Note:** Blockchain attestation and settlement run under the hood in PoC mode. Users never need to manage a wallet or sign transactions directly.

---

## Technical Highlights

### What Runs Behind the Scenes

1. **3 AI Agents** — Identity verification (mock KYC), external data validation (real weather/flight APIs), and fraud detection (rule-based anomaly detection) run in parallel via `Promise.allSettled`, with per-agent timeouts and error isolation.

2. **Typed Attestation Framework** — Each agent issues a typed `Attestation<T>` via [`MystenLabs/attestations`](https://github.com/MystenLabs/attestations), with `Permit<T>` binding "who can attest what" at compile time. This is a Move-level capability, not a generic data field.

3. **Smart Contract Settlement** — The `try_settle` Move function reads the Claim's active box on-chain, verifies 3-of-3 attestations with no revocations, and releases escrowed funds automatically. No off-chain oracle or centralized server makes the payout decision.

4. **Revocable Credentials** — Admins can revoke attestations on-chain via `revoke()`, and `try_settle` correctly rejects claims with revoked attestations — demonstrating the full lifecycle: attest → revoke → reject.

5. **End-to-End Auditability** — Every attestation, revocation, and settlement is visible on Sui Explorer. No black boxes.

---

## Stopping the Demo

Press **Ctrl+C** in the terminal running `dev.ps1`. All services will shut down automatically.

To manually stop individual services:

```powershell
# Stop backend
Stop-Process -Name node -ErrorAction SilentlyContinue

# Stop localnet
Get-Process sui -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

## Troubleshooting

### Backend won't start / `ECONNREFUSED`

- Check that port 3001 is not already in use: `Get-NetTCPConnection -LocalPort 3001`
- Ensure `.env` exists and has all required variables (see `.env.example`)
- Check backend logs: `.backend-stderr.log` and `.backend-stdout.log` in the project root
- Verify Sui localnet is running: `sui client active-address` should return an address

### Frontend won't load / blank page

- Ensure the backend is running and healthy: visit http://localhost:3001/api/health
- Check that `NEXT_PUBLIC_BACKEND_URL` in `.env` matches your backend URL
- Clear `.next` cache and restart: `Remove-Item -Recurse frontend\.next; pnpm --filter frontend dev`

### Agents not issuing attestations

- **Identity Agent**: Check `IDENTITY_AGENT_KEY` is set in `.env` — it must be a valid Ed25519 keypair funded with SUI for gas
- **External-Data Agent**: Check `AVIATIONSTACK_API_KEY` or `OPENWEATHERMAP_API_KEY` — if missing, the agent enters circuit-breaker fallback mode
- **Fraud-Check Agent**: Verify `FRAUD_AGENT_KEY` is set and the keypair is funded
- Check backend console output for agent error logs
- Ensure the agent keypairs match the `Permit<T>` holders published on-chain during contract deployment

### Claim stays in "pending" forever

- Verify all 3 agents ran successfully (check backend logs)
- Ensure the Claim's active box has 3 attestations (query via Sui Explorer or the backend API)
- If an attestation is missing, the agent may have failed silently — check the orchestrator logs

### `try_settle` fails with rejection

- Check which attestation is missing or revoked via the claim detail page or `GET /api/claims/:id`
- If an attestation was revoked (by admin), the settlement correctly rejects — this is expected behavior
- If all 3 are present and none revoked, check the Sui Explorer for the rejection event with the reason

### Sui localnet issues

- If localnet won't start, ensure no other process is using port 9000: `Get-NetTCPConnection -LocalPort 9000`
- Reset localnet state: `sui genesis` to regenerate the genesis configuration
- Ensure Sui CLI is up to date: `sui --version`

---

## What to Show Judges

### Key Technical Achievements

1. **Typed on-chain attestations** — Three independent AI agents each issue a typed `Attestation<T>` via `MystenLabs/attestations`, with `Permit<T>` binding "who can attest what" at compile time. This is not a generic data field — it's a Move-level capability.

2. **Parallel agent orchestration** — Agents run concurrently via `Promise.allSettled`, with per-agent timeouts and error isolation. One agent failing does not block the others.

3. **Trustless settlement** — The `try_settle` Move function reads the Claim's active box on-chain, verifies 3-of-3 attestations with no revocations, and releases escrowed funds automatically. No off-chain oracle or centralized server makes the payout decision.

4. **Real external data integration** — The External-Data Agent calls real APIs (OpenWeatherMap for weather, AviationStack for flights) with a circuit-breaker fallback pattern for resilience.

5. **Revocable attestations** — Admins can revoke attestations on-chain via `revoke()`, and `try_settle` correctly rejects claims with revoked attestations. This demonstrates the full lifecycle: attest -> revoke -> reject.

6. **End-to-end auditability** — Every attestation, revocation, and settlement is visible on Sui Explorer. No black boxes.

### Suggested Demo Script (3 minutes)

1. **30s** — Show the landing page, scroll through sections, mention the architecture (3 agents + attestation + settlement)
2. **30s** — Navigate to /claims, create a flight-delay claim (or use seed script) — note that no wallet is needed
3. **60s** — Show the claim detail page, watch attestation cards light up as agents verify in real-time. Click through to Sui Explorer for one attestation.
4. **30s** — Click "Settle", show the settlement result with tx digest and released funds
5. **30s** — Visit /admin, show dashboard stats, optionally revoke an attestation and re-attempt settlement to show the rejection flow

### What to Emphasize

- The settlement is **automatic** — once attestations exist, anyone can call `try_settle` and the contract enforces the rules
- The agents are **independent** — each has its own keypair and Permit, so compromising one agent doesn't compromise the system
- **No wallet required** — blockchain runs under the hood; users interact with a clean mobile-first interface
- The model is **extensible** — Phase 2 adds a Cash-out Agent that bridges crypto settlement to fiat (VND) without touching the on-chain settlement logic (adapter pattern, per design doc section 4.5)
