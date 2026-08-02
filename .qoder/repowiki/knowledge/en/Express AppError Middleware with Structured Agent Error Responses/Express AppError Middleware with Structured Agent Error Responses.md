---
kind: error_handling
name: Express AppError Middleware with Structured Agent Error Responses
category: error_handling
scope:
    - '**'
source_files:
    - backend/src/middleware/error-handler.ts
    - backend/src/index.ts
    - backend/src/services/attestation.service.ts
    - backend/src/services/claim.service.ts
    - backend/src/agents/identity.ts
    - backend/src/agents/external-data.ts
    - backend/src/agents/fraud-check.ts
    - frontend/src/lib/api-client.ts
---

## Error Handling System Overview

The Insurix backend uses a layered error handling approach combining Express middleware, structured return types, and domain-specific error patterns across its verification agents.

### Core Architecture

**Centralized Error Class**: The `AppError` class in `backend/src/middleware/error-handler.ts` extends the native `Error` type with HTTP status codes, providing a unified way to represent application-level errors that should be returned to clients.

**Express Error Middleware**: A single `errorHandler` middleware function at the end of the Express pipeline catches all unhandled errors. It distinguishes between `AppError` instances (returns appropriate HTTP status) and unexpected errors (returns 500 with generic message).

### Agent-Level Error Patterns

Each verification agent (identity, external-data, fraud-check) follows a consistent pattern:
- **Structured Return Types**: All agents return a `VerifyResult` interface with `{ success: boolean, txDigest?: string, error?: string }` rather than throwing exceptions for business logic failures
- **Catching Network Errors**: External API calls wrap errors in descriptive messages while preserving the original error context
- **Configuration Validation**: Missing environment variables throw plain `Error` instances during initialization
- **Retry Logic**: The identity agent implements exponential backoff retry (3 attempts, 1s/2s/4s delays) for transaction execution

### Service Layer Error Handling

Services use mixed approaches:
- **AppError for Configuration**: Missing required configuration throws `AppError(500, 'REGISTRY_ID not configured')`
- **Return Objects for Business Logic**: Claim operations return result objects with `settled: boolean` and `reason` fields
- **In-Memory Fallbacks**: Some services gracefully degrade when contracts aren't deployed, logging warnings instead of failing

### Frontend Error Handling

The frontend uses simple try-catch blocks with basic error propagation through fetch responses, converting non-OK responses into generic Error objects.

### Key Conventions

1. **HTTP vs Application Errors**: Use `AppError` for client-facing errors, plain `Error` for internal/system issues
2. **Agent Results**: Agents return structured results rather than throwing for expected failures
3. **Logging**: All errors are logged with contextual labels (`[IdentityAgent]`, `[ExternalDataAgent]`, etc.)
4. **Graceful Degradation**: Services handle missing configurations by falling back to PoC modes
5. **No Centralized Error Codes**: Error messages are string-based rather than using enumerated error codes