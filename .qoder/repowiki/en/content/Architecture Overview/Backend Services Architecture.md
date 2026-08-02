# Backend Services Architecture

<cite>
**Referenced Files in This Document**
- [index.ts](file://backend/src/index.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the backend services architecture for Insurix, focusing on a service-oriented design with an orchestrator pattern, middleware stack, and dependency injection. It explains RESTful API design, authentication middleware, error handling strategies, database connectivity, caching mechanisms, external service integrations, configuration management, environment-specific settings, secret handling, logging, monitoring, performance profiling, scalability, load balancing, and microservice communication patterns. The goal is to provide both high-level architectural insights and detailed component analysis to help developers understand, extend, and operate the system effectively.

## Project Structure
The backend resides under backend/src and is organized by concerns:
- Entry point and server bootstrap
- Services implementing business logic (attestation, claim, orchestrator)
- Agents for external data, fraud checks, and identity verification
- Middleware for authentication and centralized error handling
- Configuration for keypairs and SUI client setup

```mermaid
graph TB
A["Entry Point<br/>index.ts"] --> B["Auth Middleware<br/>middleware/auth.ts"]
A --> C["Error Handler Middleware<br/>middleware/error-handler.ts"]
A --> D["Orchestrator Service<br/>services/orchestrator.ts"]
D --> E["Attestation Service<br/>services/attestation.service.ts"]
D --> F["Claim Service<br/>services/claim.service.ts"]
D --> G["External Data Agent<br/>agents/external-data.ts"]
D --> H["Fraud Check Agent<br/>agents/fraud-check.ts"]
D --> I["Identity Agent<br/>agents/identity.ts"]
J["Config: Keypairs<br/>config/keypairs.ts"] --> D
K["Config: SUI Client<br/>config/sui-client.ts"] --> D
```

**Diagram sources**
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)

**Section sources**
- [index.ts](file://backend/src/index.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)

## Core Components
- Orchestrator Service: Central coordinator that composes workflows across attestation, claim processing, and agent calls. It manages dependencies, sequencing, retries, and error propagation.
- Attestation Service: Encapsulates attestation lifecycle operations such as creation, validation, and storage.
- Claim Service: Handles claim submission, validation, state transitions, and settlement coordination.
- Authentication Middleware: Validates requests, enforces authorization policies, and injects user context into downstream handlers.
- Error Handler Middleware: Centralizes error formatting, logging, and response standardization.
- Agents: External-facing modules for data retrieval, fraud detection, and identity verification.
- Configuration: Secure loading of keypairs and SUI client settings from environment variables or secrets managers.

Key responsibilities and interactions are illustrated below.

**Section sources**
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)

## Architecture Overview
The backend follows a service-oriented architecture with an orchestrator coordinating domain services and agents. Middleware provides cross-cutting concerns like authentication and error handling. Configuration is injected into services and agents to ensure environment-specific behavior and secure secret handling.

```mermaid
sequenceDiagram
participant Client as "Client"
participant API as "HTTP Server<br/>index.ts"
participant Auth as "Auth Middleware<br/>auth.ts"
participant Err as "Error Handler<br/>error-handler.ts"
participant Orchestrator as "Orchestrator<br/>orchestrator.ts"
participant Attestation as "Attestation Service<br/>attestation.service.ts"
participant Claim as "Claim Service<br/>claim.service.ts"
participant ExtData as "External Data Agent<br/>external-data.ts"
participant Fraud as "Fraud Check Agent<br/>fraud-check.ts"
participant Identity as "Identity Agent<br/>identity.ts"
Client->>API : "HTTP Request"
API->>Auth : "Validate request"
Auth-->>API : "Context + token"
API->>Err : "Wrap handler"
API->>Orchestrator : "Invoke workflow"
Orchestrator->>Attestation : "Create/validate attestation"
Orchestrator->>ExtData : "Fetch external data"
Orchestrator->>Fraud : "Run fraud check"
Orchestrator->>Identity : "Verify identity"
Orchestrator->>Claim : "Submit/transition claim"
Claim-->>Orchestrator : "Result"
Orchestrator-->>API : "Workflow result"
API-->>Client : "HTTP Response"
```

**Diagram sources**
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)

## Detailed Component Analysis

### Orchestrator Pattern
The orchestrator coordinates multi-step workflows across services and agents. It encapsulates business process logic, handles sequencing, retries, and error aggregation, and ensures consistent responses.

```mermaid
flowchart TD
Start(["Start Workflow"]) --> Validate["Validate Input"]
Validate --> Valid{"Valid?"}
Valid --> |No| ReturnError["Return Validation Error"]
Valid --> |Yes| CreateAttestation["Create/Update Attestation"]
CreateAttestation --> FetchExternal["Fetch External Data"]
FetchExternal --> RunFraud["Run Fraud Check"]
RunFraud --> VerifyIdentity["Verify Identity"]
VerifyIdentity --> SubmitClaim["Submit/Transition Claim"]
SubmitClaim --> Persist["Persist Results"]
Persist --> Success["Return Success"]
ReturnError --> End(["End"])
Success --> End
```

**Diagram sources**
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)

**Section sources**
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)

### Authentication Middleware
Authentication validates tokens, extracts user context, and enforces authorization rules before routing to handlers. It integrates with configuration for signing keys and issuer settings.

```mermaid
classDiagram
class AuthMiddleware {
+validateToken(token) bool
+extractUserContext(request) UserContext
+authorize(request, policy) bool
+handle(request, next) void
}
class ConfigKeypairs {
+loadKeys() KeypairSet
+verifySignature(data, signature) bool
}
AuthMiddleware --> ConfigKeypairs : "uses"
```

**Diagram sources**
- [auth.ts](file://backend/src/middleware/auth.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)

**Section sources**
- [auth.ts](file://backend/src/middleware/auth.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)

### Error Handling Strategy
Centralized error handling normalizes errors, logs details, and returns consistent HTTP responses. It supports custom error types and structured logging for observability.

```mermaid
flowchart TD
Enter(["Handler Execution"]) --> TryBlock["Try Business Logic"]
TryBlock --> Success{"Success?"}
Success --> |Yes| RespondOK["Respond OK"]
Success --> |No| CatchError["Catch Error"]
CatchError --> Classify["Classify Error Type"]
Classify --> LogError["Log Structured Error"]
LogError --> FormatResponse["Format Standard Error Response"]
FormatResponse --> SendResp["Send HTTP Response"]
RespondOK --> Exit(["Exit"])
SendResp --> Exit
```

**Diagram sources**
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)

**Section sources**
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)

### Database Connectivity and Caching
Database access is abstracted through services and agents. Caching can be implemented at the service layer to reduce latency and external calls. Typical patterns include read-through caches, write-behind updates, and TTL-based invalidation.

```mermaid
classDiagram
class AttestationService {
+createAttestation(data) Promise
+getAttestation(id) Promise
+updateAttestation(id, data) Promise
-cacheGet(key) any
-cacheSet(key, value, ttl) void
}
class ClaimService {
+submitClaim(data) Promise
+transitionClaim(id, status) Promise
-cacheGet(key) any
-cacheSet(key, value, ttl) void
}
class CacheLayer {
+get(key) any
+set(key, value, ttl) void
+invalidate(key) void
}
AttestationService --> CacheLayer : "reads/writes"
ClaimService --> CacheLayer : "reads/writes"
```

[No sources needed since this diagram shows conceptual caching patterns]

### External Service Integrations
Agents encapsulate external calls for data retrieval, fraud checks, and identity verification. They handle retries, timeouts, and circuit breakers to improve resilience.

```mermaid
classDiagram
class ExternalDataAgent {
+fetchData(source, params) Promise
+retryOnError(attempts) void
+timeout(ms) void
}
class FraudCheckAgent {
+analyze(profile, history) Promise
+scoreThreshold(threshold) void
}
class IdentityAgent {
+verify(credential) Promise
+checkRevocation(id) Promise
}
class Orchestrator {
+invokeAgents(workflow) Promise
}
Orchestrator --> ExternalDataAgent : "calls"
Orchestrator --> FraudCheckAgent : "calls"
Orchestrator --> IdentityAgent : "calls"
```

**Diagram sources**
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)

**Section sources**
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)

### Configuration Management and Secrets
Configuration is loaded via dedicated modules for keypairs and SUI client settings. Environment variables and secrets managers should be used to avoid hardcoding sensitive values.

```mermaid
classDiagram
class KeypairsConfig {
+loadFromEnv() KeypairSet
+validateKeys(keys) bool
}
class SuiClientConfig {
+connect(config) Promise
+signTransaction(tx, keypair) Promise
}
class Orchestrator {
+useConfig(config) void
}
Orchestrator --> KeypairsConfig : "loads"
Orchestrator --> SuiClientConfig : "initializes"
```

**Diagram sources**
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)

**Section sources**
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)

## Dependency Analysis
Dependencies between components are managed through dependency injection patterns. Services depend on configuration and agents; middleware depends on configuration for cryptographic operations.

```mermaid
graph TB
Index["index.ts"] --> Auth["auth.ts"]
Index --> ErrorHandler["error-handler.ts"]
Index --> Orchestrator["orchestrator.ts"]
Orchestrator --> Attestation["attestation.service.ts"]
Orchestrator --> Claim["claim.service.ts"]
Orchestrator --> ExtData["external-data.ts"]
Orchestrator --> Fraud["fraud-check.ts"]
Orchestrator --> Identity["identity.ts"]
Orchestrator --> Keypairs["keypairs.ts"]
Orchestrator --> SuiClient["sui-client.ts"]
```

**Diagram sources**
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)

**Section sources**
- [index.ts](file://backend/src/index.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)

## Performance Considerations
- Caching: Implement read-through and write-behind caching for frequently accessed data to reduce latency and external calls.
- Concurrency: Use asynchronous processing and worker pools for heavy tasks like fraud checks and identity verification.
- Timeouts and Retries: Configure appropriate timeouts and retry policies for external services to prevent cascading failures.
- Connection Pooling: Ensure database and HTTP clients use connection pooling to optimize resource usage.
- Profiling: Integrate performance profiling tools to identify bottlenecks and measure throughput.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Authentication Failures: Verify token signatures, issuer configurations, and keypair validity.
- Error Responses: Check structured logs for error classification and message formatting.
- External Service Errors: Inspect agent logs for timeouts, retries, and circuit breaker states.
- Configuration Issues: Validate environment variables and secret manager integration.

**Section sources**
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)

## Conclusion
The Insurix backend employs a robust service-oriented architecture with an orchestrator pattern, middleware stack, and dependency injection. It emphasizes secure configuration management, resilient external integrations, and comprehensive error handling. By following the outlined patterns and best practices, the system can scale horizontally, integrate seamlessly with microservices, and maintain high availability and performance.

[No sources needed since this section summarizes without analyzing specific files]