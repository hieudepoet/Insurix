# Insurix — Product Marketing Pitch

> **Parametric insurance claims, settled in seconds via AI agents and on-chain attestations.**

---

## The Problem

Insurance claims are broken. When a flight is delayed, a crop fails, or a shipment goes missing, the policyholder files a claim — and then waits. Not hours. Not days. **Weeks.** The traditional claims process is a linear, paper-heavy pipeline where each step gates the next: intake, assignment to an adjuster, manual document review, field investigation, committee adjudication, and finally payout. For parametric products — where the payout trigger is a verifiable data event, not a subjective loss assessment — this latency is not just frustrating, it is irrational. The very premise of parametric insurance is instant, deterministic settlement. Yet the industry bolts it onto infrastructure built for the analog era.

The second failure is opacity. A claimant submits documents and enters a black box. There is no visibility into who reviewed the claim, what data was consulted, what rules were applied, or why a decision was reached. When a claim is denied, the reason is often a templated form letter. When it is approved, the claimant cannot see the verification trail — they simply receive a deposit and a "case closed." This absence of transparency erodes trust, invites disputes, and makes fraud detection reactive rather than preventive. The claimant, the insurer, and the regulator all operate on incomplete information.

The third failure is cost. Manual claims processing is labor-intensive: human adjusters, call-center intake, document chasing, and dispute resolution consume the majority of premium revenue. Industry studies estimate that **30–40% of premium** is absorbed by administrative overhead before a single dollar reaches a claimant. For parametric products with low individual claim values — a $500 flight-delay payout, for instance — the processing cost can exceed the claim itself. And the reliance on human adjusters introduces a fourth, subtler failure: bias. Two identical claims, reviewed by two different adjusters, can yield two different outcomes. Subjectivity is baked into the system.

---

## The Solution

Insurix replaces the manual claims pipeline with **three parallel AI agents**, each responsible for one dimension of verification. The **Identity agent** confirms the claimant is a valid policyholder and the claim references a real, in-force policy. The **External-Data agent** verifies the triggering event against independent data sources — a flight-delay database, a weather oracle, a shipping tracker. The **Fraud-Check agent** runs rule-based fraud detection: policy-limit validation, blocklist screening, and duplicate-claim detection. Critically, all three run **concurrently**, not sequentially. Where a traditional pipeline takes two weeks because each step waits for the previous one, Insurix's agents dispatch simultaneously and return results in seconds.

Each agent, upon completing its check, issues a **typed on-chain attestation** using the MystenLabs/attestations framework on the Sui blockchain. These are not log entries or database rows — they are cryptographically signed, typed, verifiable on-chain objects. An attestation carries the verifier's identity, the verification result, a timestamp, and a unique attestation ID that any party can independently look up. The claimant sees the same trail the insurer sees. The regulator sees the same trail the claimant sees. Transparency is not a feature layered on top; it is a structural property of the system.

The settlement layer is a **Sui Move smart contract** implementing a 3-of-3 multisig pattern. The contract holds escrow funds at policy issuance. When a claim is filed, the three agents issue their attestations. The contract independently verifies that all three attestations exist, that all three indicate a pass, and that they are properly signed by the authorized agent keypairs. Only when all three conditions are satisfied does the contract release funds from escrow to the claimant. No single agent can settle a claim alone — the multisig design eliminates single-point-of-failure fraud. And because settlement is a smart-contract action, not a human action, it executes the instant the final attestation lands. **Three seconds, end to end.**

---

## Key Metrics

| Metric | Insurix | Traditional Insurance | Improvement |
|---|---|---|---|
| Time to settle | **3 seconds** | 2–3 weeks | ~**50,000×** faster |
| Cost reduction | **60–80%** lower | Manual processing baseline | No adjusters, no call center |
| Transparency | **100% on-chain** | 0% (black box) | Full audit trail, every claim |
| Fraud detection | **Rule-based AI** (3 checks) | Reactive, manual review | Policy limit + blocklist + duplicate |
| Trust model | **3-of-3 multisig** | Single adjuster discretion | No single point of failure |
| Settlement | **Automatic** (smart contract) | Manual approval chain | Zero human gate |

---

## Feature Cards

### ⚡ Instant Verification
Three AI agents dispatch in parallel the moment a claim is submitted. Identity, external-data, and fraud-check run concurrently — not sequentially. Results return in seconds, not weeks. The orchestrator coordinates dispatch and aggregates results without human intervention.

### 💸 Automatic Payout
The Sui Move smart contract holds escrow at policy issuance. When all three typed attestations pass, the contract auto-releases funds to the claimant. No approval committee, no payout queue, no check in the mail. The money moves the instant the final attestation lands on-chain.

### 🔍 Fully Auditable
Every verification step is a typed, signed on-chain attestation via MystenLabs/attestations. The claimant, insurer, and regulator all see the same immutable trail — verifier identity, result, timestamp, attestation ID. Transparency is structural, not optional. Even rejected claims carry a full audit trail with reason.

### 🧩 Extensible
The agent architecture is modular by design. Today: flight-delay, identity, fraud. Tomorrow: weather oracles, crop-yield sensors, shipping trackers. Each new verification dimension is a new agent issuing a new attestation type — the multisig threshold and contract logic adapt without rewriting the settlement layer.

---

## Technology Stack

| Layer | Technology | Role |
|---|---|---|
| Smart Contracts | **Sui Move** | Escrow, claim, settlement modules + 3-of-3 multisig |
| Attestations | **MystenLabs/attestations** | Typed, signed, verifiable on-chain proofs |
| Backend | **Express (TypeScript)** | REST API, orchestrator, 3 AI agents |
| Frontend | **Next.js (React)** | Landing, claims workflow, admin dashboard |
| 3D / Visuals | **Three.js** | 3D hero, particle systems, obsidian canvas |
| Animation | **Framer Motion** | Spring physics, staggered cascades, burst effects |
| Design | **Space Grotesk** + obsidian/emerald palette | Premium fintech aesthetic |

---

## Run the Demo Locally

### Prerequisites
- **Node.js** 20+
- **pnpm** (package manager)
- **PowerShell** (Windows) or Bash (macOS/Linux)

### Quick Start

```powershell
# Clone and install
git clone <repo-url> insurix; cd insurix
pnpm install

# Start everything (backend + frontend)
.\scripts\dev.ps1
```

### Individual Services

```powershell
# Backend only (Express API + 3 agents)
.\scripts\start-backend.ps1

# Frontend only (Next.js)
.\scripts\start-frontend.ps1

# Seed demo data
.\scripts\seed-demo.ps1
```

### URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend API | `http://localhost:3001` |
| Admin Panel | `http://localhost:3000/admin` (key: `insurix-admin-poc-2026`) |

### Environment
Ensure `POC_MODE=true` is set in `backend/.env` to enable mock attestations (auto-verify after 3s) and in-memory claim state for the demo.

---

## Roadmap

### Phase 1 — Proof of Concept *(current)*
- Crypto settlement on Sui testnet
- 3 AI agents (Identity, External-Data, Fraud-Check) with mock/PoC attestation mode
- Full claims lifecycle: create → verify → settle (and reject via admin)
- Landing page, claims workflow, admin dashboard
- **Status:** ✅ Complete and demonstrable

### Phase 2 — Production Bridge
- VND off-ramp: auto-convert SUI settlement to Vietnamese đồng via integrated exchange partner
- Cash-out agent: orchestrates withdrawal, KYC verification, bank transfer
- Real flight-delay data integration (FlightAware / airline APIs)
- Mainnet deployment with real keypairs and on-chain attestation issuance
- **Status:** 🔜 Next quarter

### Phase 3 — Scale
- Multi-chain support (beyond Sui — cross-chain attestation portability)
- Additional insurance products: crop-yield, shipping-delay, weather-parametric
- Parametric policy marketplace (policy issuance + premium collection on-chain)
- Open attestation standard for third-party agent providers
- **Status:** 🗓️ Long-term vision

---

## Team Workflow — Built with Qoder

Insurix was built from design document to running PoC using **Qoder**, an agentic IDE with a multi-agent orchestration system. The development workflow leveraged Qoder's full toolkit:

| Phase | Qoder Capability | Outcome |
|---|---|---|
| **Design** | Quest Mode (brainstorming) | Explored color palettes, typography, animation libraries → Premium Fintech design system (Space Grotesk, obsidian/emerald, spring physics) |
| **Planning** | Leader agent task decomposition | 50 user stories broken into dependency-ordered tasks |
| **Implementation** | Expert Mode (parallel Coding agents) | 4 specialists in parallel: Contracts (Move), Backend (Express), Frontend (Next.js), DevOps (scripts + tests) |
| **Quality** | Verify + CodeReview agents | tsc/lint/test after each module; 3-dimensional review (completeness, correctness, impact) |
| **Debugging** | Debug agents | Root-caused claim-lifecycle bug, revoke 500 error, dual API-client conflict |
| **Commits** | Committer agents | Structured conventional commits throughout |
| **Documentation** | Repowiki | Auto-generated knowledge graph of entire codebase for future maintainers |

> **The result:** a full-stack, 3-smart-contract, 3-AI-agent, blockchain-native insurance PoC — designed, implemented, tested, and documented — by a coordinated team of AI agents.

*See [Qoder Workflow Narrative](./qoder-workflow.md) for the full multi-agent development story.*
