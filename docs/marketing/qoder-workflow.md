# How Insurix Was Built with Qoder: A Multi-Agent Development Story

> From design document to running proof-of-concept — a full-stack, blockchain-native insurance platform built by a coordinated team of AI agents.

---

## Overview

Qoder is an agentic IDE built around a **Leader agent** that orchestrates specialized subagents — Research, Coding, Verify, CodeReview, Debug, and Committer agents — each with a narrow, well-defined scope. Rather than a single model attempting to write, review, and ship an entire codebase in one context window, Qoder decomposes the work the way an engineering manager would: into dependency-ordered tasks assigned to the right specialist, executed in parallel where possible, and validated at every boundary.

Insurix was the test case. The project demanded three Move smart contracts, an Express backend with three AI agents and an orchestrator, a Next.js frontend with 3D visuals and spring-physics animations, PowerShell dev scripts, and a full test suite — spanning four distinct technology domains. This document traces how Qoder's multi-agent system took Insurix from a design brief to a demonstrable PoC, phase by phase. It is simultaneously the Insurix build log and a showcase of what the Qoder agentic pipeline can do.

---

## Phase 0 — Quest Mode: Brainstorming the Design System

Before a single line of code was written, the design system had to be chosen. Qoder's **Quest Mode** was used to explore design directions in an open, conversational brainstorm — a low-stakes ideation space where options could be generated, compared, and discarded rapidly.

The Leader agent used Quest Mode to explore:
- **Color palettes** — from corporate blue (rejected as generic) to neon cyberpunk (rejected as unserious) to the final obsidian (`#060818`) + emerald (`#10b981`) pairing, chosen for its premium-fintech gravity.
- **Typography** — Inter (too ubiquitous), Geist (too Vercel), Space Grotesk (selected — geometric, distinctive, strong at display sizes).
- **Animation libraries** — CSS transitions (too rigid), GSAP (overkill for React), Framer Motion (selected — spring physics, declarative API, React-native).

**Output:** The Premium Fintech design system — Space Grotesk type, obsidian/emerald palette, spring-physics motion, particle-burst settlement animation.

> **Key insight:** Quest Mode allowed rapid ideation *before* committing to implementation. By the time a Coding agent touched the frontend, every design decision was already made — no mid-build redesign, no wasted work.

---

## Phase 1 — Expert Mode: Parallel Implementation

With the design system locked, the Leader agent switched to **Expert Mode** and decomposed the project. Insurix's functional spec contained roughly **50 user stories**. The Leader agent broke these into dependency-ordered tasks and dispatched specialized Coding agents in parallel — each with **module-level isolation** so that no agent's changes could collide with another's.

### The Four Parallel Tracks

| Agent | Scope | Output |
|---|---|---|
| **Contracts specialist** | Sui Move smart contracts | 8 modules: `claim.move`, `escrow.move`, `settlement.move`, `identity.move`, `external_data.move`, `fraud.move`, `lib.move`, + test suites |
| **Backend lead** | Express API + AI agents | REST routes (claims, admin), orchestrator service, 3 agents (identity, external-data, fraud-check), attestation service, auth middleware |
| **Frontend lead** | Next.js UI | Landing page (3D hero, scroll features), claims workflow (new, list, detail), admin dashboard, shared components, API client |
| **DevOps** | Scripts + tests | `dev.ps1`, `start-backend.ps1`, `start-frontend.ps1`, `seed-demo.ps1`, `start-localnet.ps1`, Vitest config + API test suite |

### API Contracts Defined Upfront

The critical integration risk in parallel development is mismatched interfaces. To prevent this, **API contracts were defined before any agent wrote implementation**:
- The frontend agent built against a documented REST API shape (endpoints, request/response schemas, status codes).
- The backend agent implemented exactly that shape.
- The contracts agent (Move) defined the on-chain attestation structure that the backend's attestation service would produce and the settlement contract would consume.

When the parallel tracks merged, integration was a matter of wiring, not redesign. This is the multi-agent equivalent of interface-first development — enforced by the Leader agent's planning step, not by convention.

---

## Phase 2 — Multi-Agent Quality Pipeline

Implementation is only half the work. Qoder's quality pipeline runs a sequence of specialized agents after each module is written:

### Research Agents
Investigated the codebase, environment, and dependencies *before* coding began. Read existing configs, understood the Sui CLI setup, verified MystenLabs/attestations API surface, and confirmed Node/pnpm versions. This front-loaded context so Coding agents never started blind.

### Coding Agents
Implemented features with attention to the design system — spring physics on transitions, staggered cascade reveals on cards, particle-burst animation on settlement, focus-ring accessibility on forms. Each Coding agent operated within its module boundary and referenced the pre-defined API contracts.

### Verify Agents
After each module, a Verify agent ran the full validation suite:
- `tsc` — TypeScript type-checking across backend and frontend
- `lint` — ESLint on backend routes and frontend components
- `tests` — Vitest on the API test suite; `sui test` on Move contracts

A failure here blocked the module from progressing — the task stayed `in_progress` until green.

### CodeReview Agents
Three independent CodeReview agents ran in parallel, each with a different lens:
1. **Completeness reviewer** — Does the implementation cover all acceptance criteria from the user story? Are edge cases handled?
2. **Correctness reviewer** — Is the logic sound? Are there race conditions, off-by-one errors, or incorrect type assertions?
3. **Impact reviewer** — What does this change affect downstream? Could it break another module's integration?

A module only advanced once all three reviewers signed off (or flagged issues that the Coding agent then resolved).

### Debug Agents
When something broke — and in a project this complex, things broke — a Debug agent was dispatched with a structured diagnostic mandate:
- Reproduce the failure
- Trace the root cause across module boundaries
- Produce a diagnostic report (not just a fix)
- Hand the report to a Coding agent for the actual patch

This separation of *diagnosis* and *fix* matters: the Debug agent has no incentive to apply a quick patch, only to find the real cause.

### Committer Agents
Once a module passed Verify and CodeReview, a Committer agent wrote a structured **conventional commit** — `feat(scope): summary` with a body explaining the what and why. Commits were atomic, scoped, and reviewable.

---

## Phase 3 — Repowiki: Knowledge Capture

When the implementation was complete, Qoder's **Repowiki** auto-generated a knowledge graph of the entire codebase. This is not a README — it is a structured, module-level documentation system that captures:

- **Architecture** — how each module fits into the whole, what it depends on, what depends on it
- **Tech stack** — the exact technologies, versions, and configurations per module
- **Coding conventions** — naming, file structure, error-handling patterns observed in the actual code
- **Commands** — how to build, test, run, and debug each module

For Insurix, this means a future maintainer (or a future Qoder session) can query the knowledge graph to understand, e.g., "how does the orchestrator dispatch agents?" or "what's the attestation flow from backend to contract?" — without reading 8,000 lines of code.

> The Repowiki serves double duty: it is documentation for humans **and** context for future Qoder sessions, enabling the agentic pipeline to resume work with full project memory.

---

## The Multi-Agent Advantage

| Dimension | Traditional Development | Qoder Multi-Agent |
|---|---|---|
| **Execution** | Sequential coding — one developer, one file at a time | Parallel agent dispatch — Contracts + Backend + Frontend + DevOps simultaneously |
| **Code review** | Manual, single-reviewer, often skipped under deadline pressure | 3-dimensional automated review (completeness + correctness + impact) — every module, every time |
| **Planning** | Single developer holds context in their head | Research-informed planning — agents investigate codebase, environment, dependencies before task decomposition |
| **Debugging** | Manual, trial-and-error, "printf" debugging | Debug agent with structured diagnostic reports — root cause traced across module boundaries, then handed off |
| **Commits** | Ad-hoc, inconsistent messages, "wip" commits | Conventional commit agents — atomic, scoped, reviewable |
| **Documentation** | Written manually at the end (if at all) | Repowiki — auto-generated knowledge graph, structurally complete |

---

## Key Bugs Fixed by Agents

The quality pipeline caught and fixed several non-trivial bugs. These are not theoretical — they are real failures that the agent system identified, diagnosed, and resolved:

### Bug 1: Claim Lifecycle Stuck at "pending"
**Symptom:** Claims created successfully but never advanced to "verified," even after the 3-second mock-attestation window. The UI showed pending indefinitely.

**Diagnosis (Debug agent):** The claim service queried the on-chain attestation status on every read. In PoC mode (no real on-chain state), the on-chain query returned an empty result — which the service interpreted as "no attestations" — and **overwrote the in-memory verified state** back to pending. The in-memory state and the on-chain query were fighting each other.

**Fix (Coding agent):** Added a PoC-mode conditional block: when `POC_MODE=true`, the service trusts in-memory attestation state and skips the on-chain query. The on-chain path remains intact for mainnet.

### Bug 2: Revoke Endpoint 500 Error
**Symptom:** `POST /api/admin/claims/:id/reject` returned HTTP 500 when rejecting a claim that had no on-chain attestation IDs (i.e., a claim that failed before any agent issued an attestation).

**Diagnosis (Debug agent):** The revoke handler attempted to build a revoke-attestation transaction using the claim's attestation IDs. When those IDs were empty strings (a failed claim), the attestation service threw an `AppError` because it could not construct a valid transaction object.

**Fix (Coding agent):** Added a conditional block — if attestation IDs are empty, skip the on-chain revoke call and update only the in-memory claim status. The admin can reject claims at any stage.

### Bug 3: Dual API Client Conflict
**Symptom:** Two parallel API client implementations existed in the frontend — one in `lib/api-client.ts` and another embedded in individual page components. They used slightly different base-URL resolution and error-handling logic, causing inconsistent behavior across pages.

**Diagnosis (Debug agent):** Traced the divergence to the parallel implementation phase — the frontend Coding agent had created a shared client, but several page-level components had been written with inline `fetch` calls before the shared client was finalized. Both paths worked in isolation; they conflicted in integration.

**Fix (Coding agent):** Reconciled the two implementations into a single shared client (`lib/api-client.ts`). Removed inline `fetch` calls from all page components and replaced them with calls to the shared client. Centralized base-URL resolution and error handling.

---

## Architecture: The Qoder Agent Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        QODER AGENT PIPELINE                         │
└─────────────────────────────────────────────────────────────────────┘

  Quest Mode          Research           Plan
  (Brainstorm)   ──>  (Explore)    ──>  (Decompose)
  Design system        Codebase          50 user stories
  Color, type,         Environment       → dependency-ordered
  animation lib        Dependencies        tasks
                                            │
                                            ▼
          ┌──────────────────────────────────────────────────┐
          │           CODING AGENTS (parallel)               │
          │                                                 │
          │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
          │  │ Contracts │  │ Backend  │  │ Frontend │      │
          │  │ (Move)   │  │ (Express)│  │ (Next.js)│      │
          │  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
          │       │              │              │             │
          │       │      ┌───────┴───────┐      │             │
          │       │      │    DevOps     │      │             │
          │       │      │ (Scripts+Test)│      │             │
          │       │      └───────┬───────┘      │             │
          └───────┴──────────────┴──────────────┴─────────────┘
                                  │
                                  ▼
                         ┌────────────────┐
                         │     VERIFY      │
                         │ tsc · lint ·    │
                         │ vitest · sui    │
                         │ test            │
                         └───────┬────────┘
                                 │ pass
                                 ▼
          ┌──────────────────────────────────────────────┐
          │         CODEREVIEW (3×, parallel)            │
          │                                            │
          │   ┌──────────────┐  ┌──────────────┐       │
          │   │ Completeness │  │ Correctness  │       │
          │   └──────┬───────┘  └──────┬───────┘       │
          │          │                  │               │
          │          │      ┌───────────┴────┐          │
          │          │      │    Impact      │          │
          │          │      └───────┬────────┘          │
          └──────────┴──────────────┴───────────────────┘
                                 │ 3× sign-off
                                 ▼
                    ┌────────────────────┐
                    │      COMMIT        │
                    │  Conventional      │
                    │  commit agent      │
                    └─────────┬──────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
     ┌────────────────┐            ┌──────────────────┐
     │  Debug (if     │            │    Repowiki      │
     │  fail) ──loop──┘            │  (Document)      │
     │  root cause +  │            │  Knowledge graph │
     │  diagnostic    │            │  of entire        │
     │  report        │            │  codebase         │
     └────────────────┘            └──────────────────┘
```

**Pipeline summary:**

```
Quest Mode (Brainstorm) → Research (Explore) → Plan (Decompose)
→ Coding Agents (Parallel: Contracts + Backend + Frontend + DevOps)
→ Verify (Test/Lint) → CodeReview (3×: Completeness + Correctness + Impact)
→ Commit → Repowiki (Document)
```

---

## The Outcome

Insurix stands as a complete, demonstrable proof-of-concept:

- **3 Sui Move smart contracts** (schemas + settlement) with full test suites
- **Express backend** with 3 AI agents, an orchestrator, attestation service, and admin/claims routes
- **Next.js frontend** with 3D Three.js hero, spring-physics animations, particle-burst settlement, and a full claims + admin workflow
- **DevOps tooling** — PowerShell scripts for dev, seed, and localnet
- **Repowiki knowledge graph** capturing the entire architecture for future sessions

Built by a coordinated team of AI agents — from Quest Mode brainstorm to Repowiki documentation. No single human wrote this codebase line by line. The Qoder agentic pipeline designed it, decomposed it, implemented it in parallel, reviewed it from three dimensions, debugged it, committed it, and documented it.

> **This is what multi-agent development looks like.**

---

*See the [Product Pitch](./product-pitch.md) for the Insurix market positioning, and the [Video Demo Script](../demo/video-demo-script.md) for the live demonstration screenplay.*
