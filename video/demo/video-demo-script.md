# Insurix Video Demo Script
## Duration: ~3 minutes

> **Format legend**
> - **NARRATION** — exact words the presenter speaks
> - **VISUAL** — what appears on screen (URL, action, animation)
> - **TIMING** — timecode for each beat
> - **B-ROLL** — supplementary footage suggestions

---

### Scene 1: Hook (0:00–0:15)

**TIMING:** 0:00–0:15 (15s)

**NARRATION:**
> "Insurance claims take weeks. They're a black box. They're expensive to process. And when money finally arrives — if it arrives — nobody can explain why it took so long. What if a claim could be verified, attested, and settled in three seconds?"

**VISUAL:**
- Cold open on black.
- Stark white typography types out: `14 days. 21 days. Opaque. Costly. Slow.`
- Each word dissolves as the next appears.
- Hard cut to Insurix logo (emerald `#10b981` on obsidian `#060818`).

**B-ROLL:** Slow-motion shot of a stack of paper claim forms being stamped "PENDING"; a frustrated traveler staring at a flight-delay board; a wall clock ticking.

---

### Scene 2: Landing Page (0:15–0:35)

**TIMING:** 0:15–0:35 (20s)

**NARRATION:**
> "Welcome to Insurix — parametric insurance built on the Sui blockchain. Three AI agents verify every claim in parallel and issue typed on-chain attestations. When all three pass, the smart contract auto-settles. No adjusters. No waiting. Let's see it."

**VISUAL:**
- Browser opens to `http://localhost:3000`.
- 3D hero renders: obsidian canvas, emerald particle field, Space Grotesk headline animates in with spring physics.
- Slow scroll reveals feature sections, animated stat counters (`3s` settle time, `3-of-3` attestations, `100%` on-chain).
- "Get Started" CTA pulses emerald.

**B-ROLL:** Screen recording at 60fps; subtle zoom on stat counters as they count up; cursor glides toward CTA.

---

### Scene 3: Create Claim (0:35–1:05)

**TIMING:** 0:35–1:05 (30s)

**NARRATION:**
> "Filing a claim takes seconds. We'll simulate a flight delay — policy type, flight number VN123, claim amount five hundred dollars. Hit submit. The orchestrator dispatches three agents immediately."

**VISUAL:**
- Click CTA → navigate to `/claims/new`.
- Form fields fill (typed in with spring-eased focus rings):
  - Policy Type: `Flight Delay`
  - Flight Number: `VN123`
  - Claim Amount: `$500`
- Click "Submit Claim".
- Emerald success burst animation plays (particle explosion).
- Toast: `Claim created — 3 agents dispatched`.

**B-ROLL:** Close-up on the submit button press; particle burst replayed at 0.5× speed to emphasize the physics.

---

### Scene 4: Attestation Verification (1:05–1:35)

**TIMING:** 1:05–1:35 (30s)

**NARRATION:**
> "Back on the claims list, three progress bars begin filling in real time. The Identity agent checks who you are. The External-Data agent verifies the flight actually was delayed. The Fraud-Check agent scans for policy limits, blocklists, and duplicates. Each agent issues a typed attestation on-chain. Watch them hit one hundred percent — emerald, all three, in three seconds."

**VISUAL:**
- Navigate to `/claims`.
- Three progress bars animate left-to-right, filling emerald simultaneously (~3s).
- Labels appear as each completes:
  - `Identity ✓ — attestation issued`
  - `External-Data ✓ — attestation issued`
  - `Fraud-Check ✓ — attestation issued`
- Claim card border pulses emerald; status badge flips `pending → verified`.

**B-ROLL:** Side-by-side inset of the terminal showing backend logs streaming agent dispatch + attestation issuance.

---

### Scene 5: Claim Detail (1:35–1:55)

**TIMING:** 1:35–1:55 (20s)

**NARRATION:**
> "Click into the claim. Three attestation cards — one per agent — each showing the verifier, the timestamp, and the on-chain attestation ID. Everything is auditable. And because all three passed, the 'Settle Claim' button is live."

**VISUAL:**
- Click claim card → `/claims/[id]`.
- Three attestation cards render in a staggered spring cascade:
  - Card 1: Identity — `✓ Verified` — attestation ID hash
  - Card 2: External-Data — `✓ Verified` — attestation ID hash
  - Card 3: Fraud-Check — `✓ Verified` — attestation ID hash
- "Settle Claim" button glows emerald at the bottom.

**B-ROLL:** Hover the attestation IDs to reveal "view on explorer" tooltips (mock for PoC).

---

### Scene 6: Settlement (1:55–2:10)

**TIMING:** 1:55–2:10 (15s)

**NARRATION:**
> "Settle. The smart contract fires. Particle burst. Status flips to settled. Five hundred dollars, in emerald, on-chain. Three seconds end to end."

**VISUAL:**
- Click "Settle Claim".
- Full-screen particle burst (emerald confetti physics).
- Status badge animates: `verified → settled`.
- Amount `$500` appears in large emerald numerals with spring pop.
- Toast: `Claim settled — funds released`.

**B-ROLL:** Replay the particle burst in slow-mo; cut to a clean shot of the final "settled" state holding for 2s.

---

### Scene 7: Admin Panel (2:10–2:35)

**TIMING:** 2:10–2:35 (25s)

**NARRATION:**
> "Now the admin side. We authenticate with the admin key — insurix-admin-poc-twenty-twenty-six. The dashboard shows live stats: total claims, settled, pending, rejected. We can filter by status. Let's find a pending claim and reject it — because not every claim should pass."

**VISUAL:**
- Navigate to `/admin`.
- Admin key prompt → type `insurix-admin-poc-2026` → Enter.
- Dashboard loads: stat cards (`Total`, `Settled`, `Pending`, `Rejected`), recent-claims table.
- Click status filter → select `pending`.
- Select a claim → click "Reject" → enter reason (`Flight not on blocklist — manual review required`).

**B-ROLL:** Screen recording with keystroke-overlay graphics on the admin key entry.

---

### Scene 8: Failure Case (2:35–2:50)

**TIMING:** 2:35–2:50 (15s)

**NARRATION:**
> "Here's the rejected claim. Red banner, clear reason, full audit trail preserved. Transparency isn't just for approvals — it's for denials too."

**VISUAL:**
- Navigate to `/claims/[rejected-id]`.
- Red banner across the top: `Claim Rejected — Flight not on blocklist`.
- Status badge: `rejected` (red).
- Attestation cards show partial state (e.g., Fraud-Check `✗ Failed`).
- Rejection reason card visible with timestamp.

**B-ROLL:** Quick pan across the rejection reason and timestamp to emphasize auditability.

---

### Scene 9: Technical Depth (2:50–3:05)

**TIMING:** 2:50–3:05 (15s)

**NARRATION:**
> "Under the hood: Sui blockchain for fast, cheap finality. MystenLabs attestations framework for typed, verifiable on-chain proofs. Three-of-three multisig smart contract — no single agent can settle alone. Permit-T for typed token transfers. This is real infrastructure, not a mockup."

**VISUAL:**
- Animated architecture diagram slides in:
  - `Frontend (Next.js + Three.js)` → `Backend (Express + Orchestrator)` → `3 AI Agents` → `MystenLabs Attestations` → `Sui Smart Contract (3-of-3 multisig)`.
- Each node lights up emerald in sequence.
- Tech logos fade in along the bottom: Sui, MystenLabs, Next.js, Express, Three.js.

**B-ROLL:** Quick cuts to the Move source files (`claim.move`, `escrow.move`, `settlement.move`) and the orchestrator service.

---

### Scene 10: Call to Action (3:05–3:10)

**TIMING:** 3:05–3:10 (5s)

**NARRATION:**
> "Built with Qoder. Deploy on Sui. Settle in seconds."

**VISUAL:**
- Full-screen emerald particle field settles into the Insurix wordmark.
- Tagline types out: `Parametric insurance. Settled in seconds.`
- Footer line: `Built with Qoder · Deploy on Sui · Settle in seconds`
- Qoder logo (small) bottom-right.

**B-ROLL:** Hold final frame for 2s; subtle particle drift continues.

---

## Production Notes

| Element | Spec |
|---|---|
| Resolution | 1920×1080 (60fps capture) |
| Font | Space Grotesk (on-screen text) |
| Palette | Obsidian `#060818` · Emerald `#10b981` · White `#ffffff` |
| Animation | Spring physics, Framer Motion easing |
| Music | Ambient electronic, low pulse, swells at settlement |
| Voice | Confident, measured pace (~130 wpm) |
| Total runtime | ~3:10 |

### Capture Checklist
- [ ] Backend running on `http://localhost:3001` (POC_MODE=true)
- [ ] Frontend running on `http://localhost:3000`
- [ ] Seed data loaded (at least one pending + one settled claim)
- [ ] Admin key ready: `insurix-admin-poc-2026`
- [ ] Screen recording at 60fps, 1080p
- [ ] Browser cache cleared for clean animations
