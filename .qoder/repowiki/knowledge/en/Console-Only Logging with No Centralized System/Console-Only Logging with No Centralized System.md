---
kind: logging_system
name: Console-Only Logging with No Centralized System
category: logging_system
scope:
    - '**'
source_files:
    - backend/src/index.ts
    - backend/src/middleware/error-handler.ts
    - backend/src/agents/identity.ts
    - backend/src/agents/external-data.ts
    - backend/src/agents/fraud-check.ts
    - backend/src/services/claim.service.ts
---

The Insurix monorepo does not implement a structured logging system. All backend logging is done through direct calls to Node.js `console.log`, `console.error`, and `console.warn` scattered across individual files, with no centralized logger, log levels, structured fields, or output routing.

**What exists:**
- Backend (`backend/src/`) uses raw `console.*` calls throughout — agents (`identity.ts`, `external-data.ts`, `fraud-check.ts`), services (`claim.service.ts`), the Express entrypoint (`index.ts`), and the error-handling middleware (`error-handler.ts`).
- A consistent ad-hoc convention is used: messages are prefixed with `[ComponentName]` brackets (e.g., `[ExternalDataAgent]`, `[ClaimService]`, `[IdentityAgent]`) so that console output can be visually parsed by humans.
- The error handler middleware logs unhandled errors via `console.error('Unhandled error:', err)` before returning a generic 500 JSON response.

**What is missing:**
- No logging library (pino, winston, bunyan, morgan, debug, etc.) is installed in `backend/package.json`.
- No logger initialization, configuration, or singleton pattern.
- No structured log objects with fields like timestamp, level, requestId, userId, etc.
- No log sinks (file, stdout, external collectors, Sentry, Datadog, etc.).
- No log-level management (debug/info/warn/error) beyond the bare `console.*` methods.
- No frontend logging strategy identified — the Next.js frontend does not appear to use any logging framework either.

**Developer conventions observed:**
- Prefix every `console.*` call with a bracketed component name for readability.
- Use `console.error` for failures and `console.log` for informational flow; `console.warn` is used sparingly (e.g., circuit breaker re-closing).
- Error messages include contextual details such as attempt counts, transaction digests, and input values.

This is an informal, development-time-only approach suitable for a PoC but not production-ready.