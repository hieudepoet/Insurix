---
kind: dependency_management
name: pnpm Workspace Monorepo with Move Package Dependencies
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - pnpm-workspace.yaml
    - pnpm-lock.yaml
    - backend/package.json
    - frontend/package.json
    - contracts/insurix-settlement/Move.toml
    - contracts/insurix-schemas/Move.toml
    - contracts/attestations/packages/attestations/Move.toml
    - contracts/attestations/packages/attestations/Published.toml
---

This repository uses a **pnpm workspace monorepo** to manage dependencies across three Node.js/TypeScript packages (backend, frontend) and multiple Move smart contract packages. The dependency management strategy combines npm-style package manifests for JavaScript/TypeScript code with Move's native `Move.toml` + `Move.lock` system for on-chain contracts.

### JavaScript/TypeScript Dependencies (pnpm)
- **Workspace root** (`package.json`, `pnpm-workspace.yaml`) declares two packages: `backend` and `frontend`. Scripts at the root delegate commands via `pnpm --filter`.
- **Lockfile**: `pnpm-lock.yaml` (lockfileVersion 9) pins exact versions of all transitive dependencies, ensuring reproducible installs across environments.
- **Backend** (`backend/package.json`): Express-based API using `@mysten/sui` (^1.24.0), axios, cors, dotenv, and @noble/hashes. Dev tooling includes tsx, vitest, typescript, eslint.
- **Frontend** (`frontend/package.json`): Next.js 16 with React 19, Three.js ecosystem (@react-three/fiber, drei, postprocessing), framer-motion, gsap, lenis, and `@mysten/dapp-kit` for wallet integration. Uses `@mysten/sui` (^2.23.1) — a different major version than the backend, indicating separate SUI SDK versions per layer.
- No vendoring is used; node_modules are gitignored. Dependencies use caret ranges (`^`) for minor/patch updates while lockfiles pin exact resolved versions.

### Move Contract Dependencies
- Each Move package has its own `Move.toml` and `Move.lock` file, managed by the Move CLI.
- **Local cross-package dependencies**: `insurix-settlement` depends on both `attestations` and `insurix-schemas` via `local = "../path"` references. `insurix-schemas` depends on `attestations` locally.
- **External framework dependency**: `insurix-settlement` imports the Sui framework from GitHub (`https://github.com/MystenLabs/sui.git`, subdir `crates/sui-framework/packages/sui-framework`, rev `framework/testnet`).
- **Published metadata**: `contracts/attestations/packages/attestations/Published.toml` tracks published versions on testnet, including chain-id, published address, upgrade capability, and toolchain version (1.72.2).
- Demo auditor packages show the pattern for switching between local and MVR (Move Version Registry) dependencies via comments in their `Move.toml` files.

### Conventions & Rules
- Use pnpm workspaces for JS/TS packages; never install dependencies outside the workspace.
- Commit `pnpm-lock.yaml` to ensure deterministic builds.
- For Move packages, commit both `Move.toml` and `Move.lock`; update versions via `move run` / `move publish` commands rather than manual edits.
- Prefer local path dependencies within the monorepo for internal contract coupling; switch to MVR names when publishing auditors externally.
- Pin external framework dependencies to specific git revisions (e.g., `framework/testnet`) for reproducibility.