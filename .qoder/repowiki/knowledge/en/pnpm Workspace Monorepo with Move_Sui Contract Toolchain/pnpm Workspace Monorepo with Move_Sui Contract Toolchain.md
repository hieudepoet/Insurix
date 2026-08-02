---
kind: build_system
name: pnpm Workspace Monorepo with Move/Sui Contract Toolchain
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - pnpm-workspace.yaml
    - backend/package.json
    - backend/tsconfig.json
    - frontend/package.json
    - frontend/tsconfig.json
    - contracts/attestations/packages/attestations/Move.toml
    - contracts/insurix-schemas/Move.toml
    - contracts/insurix-settlement/Move.toml
    - contracts/attestations/demo/scripts/demo-up.sh
    - contracts/attestations/demo/scripts/test-publish.sh
---

This repository uses a **pnpm workspace monorepo** to orchestrate three distinct build systems: TypeScript/Node.js (backend), Next.js (frontend), and Move/Sui smart contracts. There is no centralized Makefile or CI pipeline — each subsystem manages its own build, test, and publish lifecycle through its own tooling.

### Off-chain services (backend + frontend)
- Root `package.json` defines workspace scripts (`dev`, `build`, `test`, `lint`) that delegate via `pnpm --filter` to individual packages.
- **Backend** (`backend/package.json`): TypeScript compiled with `tsc` to `dist/`, run in dev via `tsx watch`. Tests use Vitest; linting via ESLint.
- **Frontend** (`frontend/package.json`): Standard Next.js 16 build pipeline (`next build` / `next dev`). Uses Tailwind CSS v4, React 19, and Three.js for the landing page.
- Both packages are declared in the root `pnpm-workspace.yaml` under `packages: ['backend', 'frontend']`.

### On-chain contracts (Move/Sui)
- Contracts live under `contracts/` as independent Sui Move packages, each with its own `Move.toml`:
  - `attestations/packages/attestations` — core attestation registry (no external dependencies).
  - `insurix-schemas` — typed schema modules (identity, fraud, external_data) depending on `attestations` locally.
  - `insurix-settlement` — claim settlement flow using escrowed SUI, depending on both `attestations` and `insurix_schemas` locally, plus the Sui framework from git.
- Each package has its own `Move.lock` file pinning dependency versions.
- No global contract build script exists at the repo root; developers run `sui move build/test/publish` inside each package directory.

### Demo & local development tooling
- `contracts/attestations/demo/scripts/` provides a full local demo stack:
  - `demo-up.sh` orchestrates a Sui localnet, publishes all demo packages, and optionally starts a Rust-based mvr frontend server and Next.js app.
  - `test-publish.sh` publishes all packages against an active network using `sui client test-publish --build-env testnet`, then exercises upgrades (e.g., auditor_a → AuditV2) and registers Display types.
  - `run-demo.sh`, `demo-down.sh`, `localnets.py` support the end-to-end demo workflow.
- These scripts manage process lifecycles, port polling, log collection, and cleanup via bash traps.

### Build conventions & developer rules
- Use `pnpm` exclusively — lockfiles (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) must be committed.
- Add new off-chain packages by creating a subdirectory with its own `package.json` and listing it in the root `pnpm-workspace.yaml`; add corresponding scripts in root `package.json` if needed.
- For Move packages, follow the existing `Move.toml` structure with `edition = "2024"`, declare local dependencies via relative paths, and keep `Move.lock` in sync.
- Run the full workspace with `pnpm dev` (parallel backend + frontend); run tests across all packages with `pnpm test`.
- Contract publishing and upgrades are performed per-package via `sui client test-publish` / `test-upgrade` with a shared pubfile; do not rely on a single top-level command.