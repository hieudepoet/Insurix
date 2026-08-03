# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is the insured customer, on a phone, in the moment right after a covered event happens (a flight got delayed, a storm dumped rain on their trip) — they want to know "do I get paid, and how fast" without filing paperwork or calling anyone. Secondary audience for this specific build: hackathon judges/viewers watching a live demo, who need the trust mechanism to be legible in under a minute without any blockchain literacy.

## Product Purpose

Insurix is parametric insurance (flight delay, heavy rain) that settles claims automatically: three independent checks (identity, external data source, fraud screen) each produce a signed "attestation" instead of a human adjuster's judgment call, and a claim only pays out once all three attestations land. This app (`poc_mobile_app`) is a standalone, fully-mocked mobile-web demo of that customer experience — a phone-frame prototype for pitching the product, not the production client (that's `frontend/`, which is the wallet-connected Sui dapp).

## Positioning

Competing insurtech either hides claims processing behind a "we'll review and get back to you" black box, or (in the crypto-native version of this pitch) surfaces raw chain mechanics — wallet connects, gas, explorer links — that a mainstream insurance customer doesn't trust or want. Insurix's mechanism is instant, machine-verified settlement made *visible and inspectable* without requiring blockchain fluency: the trust artifact is a stamped "Attestation Passport," not a transaction hash.

## Operating Context

The customer already holds an active policy (Flight Delay Shield or Heavy Rain Cover) before a claim starts. Filing a claim is triggered by a real-world event the customer already knows happened (their flight was delayed, it rained heavily during their trip) — the flow is confirmation and evidence-gathering, not a cold form. Processing is meant to read as near-instant (seconds, not days) because the actual settlement engine only has to auto-check the 3 conditions, not review the whole case.

## Capabilities and Constraints

- This build is **explicitly non-functional**: no real backend calls, no wallet, no live data. Every screen is driven by static/mock data seeded to demonstrate scripted outcomes: full-approval flows and a single-checkpoint-rejection flow.
- **Never show Sui, blockchain, wallet, gas, or chain-explorer language anywhere in this app.** The underlying trust mechanism is real (see backend `orchestrator.ts` / attestation agents / Move contracts), but this surface must translate it entirely into insurance-native vocabulary: "attestation," "checkpoint," "verified by," "stamp," never "on-chain," "transaction," "signed by wallet."
- Three product types demonstrated: **Flight Delay** and **Heavy Rain** (delay-minutes / rainfall-mm thresholds, matching the real contract's supported types) plus **Health** (treatment-cost-vs-deductible, added at the user's request as "a very common case" — mock-only at this layer, not tied to a real Move contract product-type constant). New product lines are fine to add for this demo surface as long as they follow the same pattern: an owned `Policy`, a live-pickable `Claim` scenario, and a resolved history entry.
- Three verification checkpoints, matching the real agent pipeline: **Identity**, **External Data** (the oracle that confirms the triggering event — flight status or weather station reading), **Fraud Check**. A claim settles only once all three pass; if any one fails, the claim is rejected with that checkpoint named as the reason.
- This is a separate app from `frontend/` (the real Sui-connected client), free to run its own visual identity — it may draw on the same reference material as frontend without literally copying its palette.

## Brand Commitments

Product name: **Insurix**. Visual identity for this sub-app: **"Midnight Gold"** (dark obsidian/navy world, brushed-gold reserved exclusively for attestation verification, violet as a quiet functional accent) — chosen by the user from `docs/marketing/ui-theme-prompts.md`'s documented palette options, specifically because gold's scarcity against a dark stage reinforces the attestation-stamp mechanism. See DESIGN.md for the full system. This supersedes the earlier light-lavender direction, which is retired.

## Evidence on Hand

No real customer data, testimonials, or benchmarks exist — this is a pre-launch hackathon PoC. Any names, policy numbers, flight numbers, amounts, or attestation hashes used in this app are synthetic demo content and must read as plausible sample data, not real claims.

## Product Principles

1. **Show the mechanism, not the marketing claim.** The core pitch — three independent checks replace a human adjuster — must be dramatized as a visible sequence the viewer watches happen, not asserted in a paragraph.
2. **Honesty in both outcomes.** The rejection flow is not a dead end or an apology screen; it demonstrates the same transparency (you can see exactly which checkpoint failed and why) that makes the approval flow trustworthy.
3. **Insurance-native language, always.** Every trust cue is expressed as an insurer would express it (verified, stamped, certified, checkpoint) — never as a crypto product would.
4. **Fast reads as designed, not accidental.** The demo's pacing (checkpoints landing in sequence, instant payout) is the product's actual value proposition, so motion timing carries real information, not just polish.

## Accessibility & Inclusion

No project-specific requirement beyond the standard bar (contrast, focus states, readable type) — this is a demo surface, not a shipped production client.
