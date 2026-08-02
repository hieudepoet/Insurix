---
kind: configuration_system
name: Environment-Based Configuration with dotenv
category: configuration_system
scope:
    - '**'
source_files:
    - backend/.env
    - .env.example
    - backend/src/config/sui-client.ts
    - backend/src/config/keypairs.ts
    - backend/src/index.ts
    - frontend/src/lib/sui-client.ts
    - frontend/src/lib/api-client.ts
---

The Insurix monorepo uses a straightforward environment-variable-driven configuration system built on `dotenv` with no centralized configuration framework. Configuration is split across three layers: shared `.env.example` at the repository root, backend-specific `.env`, and frontend Next.js public env vars.

**Backend configuration** lives in two dedicated modules under `backend/src/config/`: `sui-client.ts` loads Sui network settings (`SUI_NETWORK`, `SUI_RPC_URL`) and contract/object IDs (`ATTESTATIONS_PKG_ID`, `SCHEMAS_PKG_ID`, `SETTLEMENT_PKG_ID`, `REGISTRY_ID`, plus per-agent verifier capability IDs) from `process.env`. `keypairs.ts` provides factory functions that read each agent's Ed25519 secret key (`IDENTITY_AGENT_KEY`, `EXTERNAL_DATA_AGENT_KEY`, `FRAUD_AGENT_KEY`) and throw explicit errors when missing. The Express app entrypoint (`backend/src/index.ts`) calls `dotenv.config()` at startup and reads `BACKEND_PORT` and `ADMIN_API_KEY` directly via `process.env`.

**Frontend configuration** is minimal: `frontend/src/lib/sui-client.ts` reads `NEXT_PUBLIC_SUI_NETWORK` to pick the correct Sui fullnode URL (testnet vs mainnet), and `frontend/src/lib/api-client.ts` reads `NEXT_PUBLIC_BACKEND_URL` for API routing. These are the only `NEXT_PUBLIC_*` variables — Next.js exposes them at build time.

**Configuration file layout**: `.env.example` documents all required variables with comments grouped by category (Sui Network, Published Contract IDs, Agent Keypairs, Admin, External APIs, Backend, Frontend). Each module calls `dotenv.config()` independently rather than relying on a single load point, which means every file importing config modules re-invokes dotenv (harmless but redundant).

**Conventions observed**:
- All secrets (agent keys, API keys, admin key) come exclusively from `process.env` — no hardcoded defaults for sensitive values.
- Non-sensitive runtime defaults are provided inline (e.g., `SUI_NETWORK || 'testnet'`, `BACKEND_PORT || 3001`).
- Contract and object IDs are loaded as strings with empty-string fallbacks, requiring deployment scripts to populate them before use.
- No schema validation or type-safe config loading (no Zod, Joi, or typed config loaders); correctness relies on developers setting the right env vars.
- No configuration files in TOML/YAML/JSON — pure `.env` flat key-value pairs.