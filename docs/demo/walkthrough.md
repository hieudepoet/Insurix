# Insurix Demo Walkthrough

> Step-by-step guide for hackathon judges.

## Prerequisites

- [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) installed
- [Node.js](https://nodejs.org/) v20+ installed
- [pnpm](https://pnpm.io/) v9+ installed

## 1. Start the Platform

Open a PowerShell terminal in the project root and run:

```powershell
.\scripts\dev.ps1
```

This starts three services:
| Service   | URL                          | Description           |
|-----------|------------------------------|-----------------------|
| Localnet  | sui start (background)       | Local Sui blockchain  |
| Backend   | http://localhost:3001        | Express API server    |
| Frontend  | http://localhost:3000        | Next.js web app       |

Wait until you see `Backend is ready!` before proceeding.

## 2. Open the Landing Page

Navigate to **http://localhost:3000** in your browser.

The landing page showcases:
- Insurix brand and value proposition
- Animated 3D visuals (Three.js)
- Smooth scroll animations

## 3. Connect Wallet

1. Click the **Connect Wallet** button in the header.
2. Select **Sui Wallet** from the dApp-kit modal.
3. Approve the connection request.

> For demo purposes, you can also interact without a wallet via the seed script.

## 4. Create a Claim (Flight Delay)

Navigate to **http://localhost:3000/claims** and click **New Claim**, or seed one via API:

```powershell
.\scripts\seed-demo.ps1
```

This creates a flight-delay claim:
- **Flight**: VN123
- **Delay**: 3 hours
- **Amount**: 1 SUI (1,000,000,000 MIST)

You should see the claim appear in the list with status **"pending"**.

## 5. Watch AI Agents Verify

After creating a claim, three AI agents run in parallel:

| Agent          | What it does                                        |
|----------------|-----------------------------------------------------|
| Identity       | Verifies the claimant's wallet identity             |
| External Data  | Checks flight status via AviationStack API          |
| Fraud Check    | Runs anomaly detection on the claim parameters      |

Refresh the claim detail page to see attestation badges light up:
- Identity Verified → ✓
- External Data Verified → ✓
- Fraud Check Passed → ✓

Each attestation is recorded on-chain as a verifiable credential.

## 6. Settle the Claim

Once all three attestations are verified, click **Settle Claim** on the claim detail page, or via API:

```powershell
$claimId = "<CLAIM_ID_FROM_STEP_4>"
Invoke-RestMethod -Uri "http://localhost:3001/api/claims/$claimId/settle" -Method Post
```

The settlement smart contract checks all attestations and releases escrowed funds to the claimant.

## 7. View the Settlement Result

After settlement, the claim status updates to **"settled"**:
- The escrowed SUI is released to the claimant's wallet
- A transaction digest is recorded on-chain
- The claim detail page shows the settlement confirmation

## 8. Admin Panel Demo

Navigate to **http://localhost:3000/admin**.

Enter the admin API key (from your `.env` file's `ADMIN_API_KEY`) to access:
- **Dashboard**: Total claims, pending, settled, rejected counts and total amount
- **Claims list**: All claims with attestation progress
- **Revoke attestation**: Admins can revoke any attestation if fraud is detected

### Try revoking an attestation:

```powershell
$claimId = "<CLAIM_ID>"
$headers = @{ "x-api-key" = "<YOUR_ADMIN_API_KEY>" }
$body = '{"attestationType": "fraud-check"}'
Invoke-RestMethod -Uri "http://localhost:3001/api/admin/claims/$claimId/revoke" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Frontend  │────▶│   Backend    │────▶│  Sui Blockchain │
│  (Next.js)  │◀────│  (Express)   │◀────│  (Move contracts)│
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────┴───────┐
                    │  AI Agents   │
                    │  • Identity  │
                    │  • Ext Data  │
                    │  • Fraud     │
                    └──────────────┘
```

## Stopping the Demo

Press **Ctrl+C** in the terminal running `dev.ps1`. All services will shut down automatically.
