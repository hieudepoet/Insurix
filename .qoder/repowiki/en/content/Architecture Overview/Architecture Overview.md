# Architecture Overview

<cite>
**Referenced Files in This Document**
- [index.ts](file://backend/src/index.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [layout.tsx](file://frontend/src/app/layout.tsx)
- [page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/demo/auditor_a/sources/audit.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [lib.move](file://contracts/insurix-schemas/sources/lib.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)
- [README.md](file://contracts/attestations/README.md)
- [DESIGN.md](file://contracts/attestations/DESIGN.md)
- [insurix-ai-workflow.md](file://docs/design/insurix-ai-workflow.md)
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
10. [Appendices](#appendices)

## Introduction
This document provides a comprehensive architectural overview of the Insurix decentralized insurance protocol. It describes a three-layer architecture composed of:
- A Next.js frontend for user interactions and wallet connectivity
- Node.js backend services implementing service-oriented orchestration, attestation, claim processing, and settlement workflows
- Move smart contracts deployed on the Sui blockchain for trust-minimized state management, multi-auditor attestations, and escrow-based settlement

The system integrates AI-driven agents for identity verification, external data ingestion, and fraud detection, while maintaining strong security, authentication, and monitoring practices across layers.

## Project Structure
Insurix is organized into three primary layers:
- Frontend (Next.js): User interface, routing, wallet integration, and API client utilities
- Backend (Node.js/TypeScript): REST services, middleware, configuration, orchestrators, and specialized agents
- Contracts (Move on Sui): Attestations, schemas, and settlement logic

```mermaid
graph TB
subgraph "Frontend"
FE_App["Next.js App<br/>layout.tsx, page.tsx"]
FE_Wallet["WalletConnect.tsx"]
FE_API["api-client.ts"]
FE_SUI["sui-client.ts"]
end
subgraph "Backend"
BE_Index["index.ts"]
BE_MW_Auth["middleware/auth.ts"]
BE_MW_Err["middleware/error-handler.ts"]
BE_Config_Key["config/keypairs.ts"]
BE_Config_SUI["config/sui-client.ts"]
BE_Att["services/attestation.service.ts"]
BE_Claim["services/claim.service.ts"]
BE_Orchestrator["services/orchestrator.ts"]
BE_Ag_Ext["agents/external-data.ts"]
BE_Ag_Fraud["agents/fraud-check.ts"]
BE_Ag_ID["agents/identity.ts"]
end
subgraph "Sui Blockchain"
SC_Atts["attestations.move"]
SC_AuditA["auditor_a/audit.move"]
SC_Schema_Ext["external_data.move"]
SC_Schema_Fraud["fraud.move"]
SC_Schema_ID["identity.move"]
SC_Sett_Claim["claim.move"]
SC_Sett_Escrow["escrow.move"]
SC_Sett_Events["events.move"]
SC_Sett_Settle["settlement.move"]
end
FE_App --> FE_API
FE_App --> FE_Wallet
FE_API --> BE_Index
FE_SUI --> SC_Atts
FE_SUI --> SC_Sett_Claim
FE_SUI --> SC_Sett_Escrow
BE_Index --> BE_MW_Auth
BE_Index --> BE_MW_Err
BE_Index --> BE_Config_Key
BE_Index --> BE_Config_SUI
BE_Index --> BE_Orchestrator
BE_Orchestrator --> BE_Att
BE_Orchestrator --> BE_Claim
BE_Orchestrator --> BE_Ag_Ext
BE_Orchestrator --> BE_Ag_Fraud
BE_Orchestrator --> BE_Ag_ID
BE_Att --> SC_Atts
BE_Claim --> SC_Sett_Claim
BE_Claim --> SC_Sett_Escrow
BE_Claim --> SC_Sett_Events
BE_Ag_Ext --> SC_Schema_Ext
BE_Ag_Fraud --> SC_Schema_Fraud
BE_Ag_ID --> SC_Schema_ID
```

**Diagram sources**
- [layout.tsx](file://frontend/src/app/layout.tsx)
- [page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/demo/auditor_a/sources/audit.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

**Section sources**
- [layout.tsx](file://frontend/src/app/layout.tsx)
- [page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [index.ts](file://backend/src/index.ts)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

## Core Components
- Next.js Frontend
  - Application layout and landing pages
  - Wallet connection component for Sui
  - API client for backend communication
  - Sui client utilities for on-chain interactions

- Node.js Backend Services
  - Entry point and HTTP server setup
  - Authentication middleware and error handling
  - Configuration for keypairs and Sui client
  - Service modules:
    - Attestation service for managing auditor attestations
    - Claim service for lifecycle management and settlement triggers
    - Orchestrator coordinating multi-step workflows

- Move Smart Contracts on Sui
  - Attestations package for multi-auditor audit records
  - Schemas for identity, external data, and fraud signals
  - Settlement package with claim, escrow, events, and settlement logic

**Section sources**
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

## Architecture Overview
The Insurix protocol follows a service-oriented architecture with clear separation between presentation, business logic, and on-chain state. The frontend communicates with backend services via REST APIs and interacts directly with Sui for wallet operations. The backend orchestrates multi-step processes involving auditors, AI agents, and settlement engines, ensuring deterministic outcomes enforced by Move contracts.

```mermaid
sequenceDiagram
participant User as "User"
participant FE as "Next.js Frontend"
participant API as "Backend API"
participant Auth as "Auth Middleware"
participant Orchestrator as "Orchestrator"
participant AttSvc as "Attestation Service"
participant ClaimSvc as "Claim Service"
participant AgentID as "Identity Agent"
participant AgentExt as "External Data Agent"
participant AgentFraud as "Fraud Check Agent"
participant Sui as "Sui Blockchain"
User->>FE : Open claims page
FE->>API : POST /claims (request body)
API->>Auth : Validate request
Auth-->>API : Authorized
API->>Orchestrator : Start claim workflow
Orchestrator->>AgentID : Verify identity
AgentID-->>Orchestrator : Identity result
Orchestrator->>AgentExt : Fetch external data
AgentExt-->>Orchestrator : External data result
Orchestrator->>AgentFraud : Run fraud checks
AgentFraud-->>Orchestrator : Fraud assessment
Orchestrator->>AttSvc : Create/update attestations
AttSvc->>Sui : Write attestations.move
Orchestrator->>ClaimSvc : Submit claim
ClaimSvc->>Sui : Write claim.move + escrow.move
Sui-->>ClaimSvc : Events emitted
ClaimSvc-->>Orchestrator : Claim submitted
Orchestrator-->>API : Workflow status
API-->>FE : Response
FE-->>User : UI updates
```

**Diagram sources**
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)

## Detailed Component Analysis

### Frontend Layer (Next.js)
- Application Layout and Pages
  - Global layout defines app shell and metadata
  - Landing page serves marketing and demo sections
  - Claims page initiates claim submission flows

- Wallet Integration
  - WalletConnect component manages Sui wallet connections and signing
  - Sui client utilities provide on-chain read/write helpers

- API Client
  - Centralized client for backend calls with error handling and retries
  - Encapsulates endpoints for claims and attestations

```mermaid
classDiagram
class NextJSApp {
+layout()
+landingPage()
+claimsPage()
}
class WalletConnect {
+connect()
+signMessage()
+disconnect()
}
class APIClient {
+postClaims(payload)
+getAttestations(id)
+handleError(err)
}
class SuiClient {
+readContract(module, function)
+writeTransaction(tx)
}
NextJSApp --> WalletConnect : "uses"
NextJSApp --> APIClient : "calls"
NextJSApp --> SuiClient : "interacts"
```

**Diagram sources**
- [layout.tsx](file://frontend/src/app/layout.tsx)
- [page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)

**Section sources**
- [layout.tsx](file://frontend/src/app/layout.tsx)
- [page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)

### Backend Layer (Node.js/TypeScript)
- Entry Point and Middleware
  - index.ts initializes HTTP server and routes
  - auth.ts enforces authentication and authorization
  - error-handler.ts centralizes error responses and logging

- Configuration
  - keypairs.ts manages cryptographic keys for signing transactions
  - sui-client.ts configures Sui network access and RPC endpoints

- Services
  - attestation.service.ts handles auditor attestation creation and updates
  - claim.service.ts manages claim lifecycle and settlement triggers
  - orchestrator.ts coordinates multi-step workflows across services and agents

- Agents
  - identity.ts performs identity verification and KYC checks
  - external-data.ts ingests third-party data sources
  - fraud-check.ts runs risk and fraud detection models

```mermaid
classDiagram
class BackendIndex {
+initServer()
+registerRoutes()
+start()
}
class AuthMiddleware {
+validateRequest(req)
+authorize(req)
}
class ErrorHandler {
+handleError(err)
+logError(err)
}
class ConfigKeypairs {
+loadKeys()
+signPayload(data)
}
class ConfigSuiClient {
+connect()
+sendTransaction(tx)
}
class AttestationService {
+createAttestation(data)
+updateAttestation(id, data)
}
class ClaimService {
+submitClaim(payload)
+processClaim(id)
+triggerSettlement(id)
}
class Orchestrator {
+runWorkflow(workflowId)
+coordinateAgents()
}
class IdentityAgent {
+verifyIdentity(userId)
}
class ExternalDataAgent {
+fetchData(source)
}
class FraudCheckAgent {
+assessRisk(data)
}
BackendIndex --> AuthMiddleware : "uses"
BackendIndex --> ErrorHandler : "uses"
BackendIndex --> ConfigKeypairs : "loads"
BackendIndex --> ConfigSuiClient : "uses"
BackendIndex --> Orchestrator : "invokes"
Orchestrator --> AttestationService : "coordinates"
Orchestrator --> ClaimService : "coordinates"
Orchestrator --> IdentityAgent : "calls"
Orchestrator --> ExternalDataAgent : "calls"
Orchestrator --> FraudCheckAgent : "calls"
```

**Diagram sources**
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)

**Section sources**
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)

### Smart Contracts Layer (Move on Sui)
- Attestations Package
  - Multi-auditor attestation management with upgrade paths
  - Demo auditors (A, B, C) illustrate independent auditing roles

- Schemas Package
  - Identity schema for user profiles and KYC data
  - External data schema for third-party integrations
  - Fraud schema for risk signals and flags

- Settlement Package
  - Claim contract for lifecycle states and approvals
  - Escrow contract for fund locking and release
  - Events contract for emitting on-chain state changes
  - Settlement contract for finalizing payouts and closures

```mermaid
erDiagram
AUDITOR {
string id PK
string name
bool active
timestamp createdAt
}
ATTESTATION {
uuid id PK
string auditor_id FK
string subject_id
bytes signature
enum status
timestamp createdAt
}
IDENTITY {
uuid id PK
string userId
bytes kycData
enum verified
timestamp updatedAt
}
EXTERNAL_DATA {
uuid id PK
string source
bytes payload
timestamp fetchedAt
}
FRAUD_SIGNAL {
uuid id PK
string claimId
float score
enum severity
timestamp generatedAt
}
CLAIM {
uuid id PK
string policyId
string claimantId
decimal amount
enum status
timestamp submittedAt
}
ESCROW {
uuid id PK
string claimId
decimal lockedAmount
enum state
timestamp createdAt
}
EVENT {
uuid id PK
string entityType
string entityId
bytes data
timestamp emittedAt
}
AUDITOR ||--o{ ATTESTATION : "issues"
ATTESTATION ||--o{ CLAIM : "supports"
IDENTITY ||--o{ CLAIM : "verifies"
EXTERNAL_DATA ||--o{ CLAIM : "informs"
FRAUD_SIGNAL ||--o{ CLAIM : "flags"
CLAIM ||--o{ ESCROW : "locks funds"
CLAIM ||--o{ EVENT : "emits"
```

**Diagram sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/demo/auditor_a/sources/audit.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

**Section sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/demo/auditor_a/sources/audit.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

### Multi-Auditor System Design
- Independent Auditor Roles
  - Each auditor maintains separate attestation records
  - Auditors can be upgraded independently with versioned Move modules

- Attestation Lifecycle
  - Creation, validation, and revocation flows
  - Signature verification ensures integrity

- Integration Patterns
  - Backend services coordinate auditor submissions
  - On-chain state reflects consensus among auditors

```mermaid
flowchart TD
Start(["Auditor Attestation Flow"]) --> Create["Create Attestation Record"]
Create --> Validate["Validate Auditor Signature"]
Validate --> Valid{"Valid?"}
Valid --> |No| Reject["Reject Attestation"]
Valid --> |Yes| Store["Store On-Chain"]
Store --> Update["Update Attestation Status"]
Update --> Revoke{"Revoke Needed?"}
Revoke --> |Yes| RevokeFlow["Revoke Attestation"]
Revoke --> |No| Complete["Complete"]
RevokeFlow --> Complete
Reject --> End(["End"])
Complete --> End
```

**Diagram sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/demo/auditor_a/sources/audit.move)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)

**Section sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/demo/auditor_a/sources/audit.move)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)

### AI Integration Patterns
- Identity Verification
  - AI-powered KYC and document validation
  - Integrates with external identity providers

- External Data Ingestion
  - Automated scraping and API calls to trusted sources
  - Data normalization and caching strategies

- Fraud Detection
  - Machine learning models for anomaly detection
  - Risk scoring and alerting mechanisms

```mermaid
sequenceDiagram
participant Orchestrator as "Orchestrator"
participant IDAgent as "Identity Agent"
participant ExtAgent as "External Data Agent"
participant FraudAgent as "Fraud Check Agent"
participant Sui as "Sui Blockchain"
Orchestrator->>IDAgent : Verify identity
IDAgent-->>Orchestrator : Identity result
Orchestrator->>ExtAgent : Fetch external data
ExtAgent-->>Orchestrator : External data result
Orchestrator->>FraudAgent : Assess fraud risk
FraudAgent-->>Orchestrator : Risk score
Orchestrator->>Sui : Emit events based on results
```

**Diagram sources**
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [events.move](file://contracts/insurix-settlement/sources/events.move)

**Section sources**
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [events.move](file://contracts/insurix-settlement/sources/events.move)

## Dependency Analysis
The Insurix system exhibits clear layering with minimal coupling between components:
- Frontend depends on backend APIs and Sui client libraries
- Backend depends on configuration, middleware, services, and agents
- Smart contracts are independent but interact through well-defined interfaces

```mermaid
graph LR
FE_API["frontend/api-client.ts"] --> BE_Index["backend/index.ts"]
FE_SUI["frontend/sui-client.ts"] --> SC_Atts["contracts/attestations.move"]
FE_SUI --> SC_Sett["contracts/settlement.move"]
BE_Index --> BE_MW["backend/middleware/*"]
BE_Index --> BE_Config["backend/config/*"]
BE_Index --> BE_Services["backend/services/*"]
BE_Services --> BE_Agents["backend/agents/*"]
BE_Services --> SC_Contracts["contracts/*"]
```

**Diagram sources**
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [index.ts](file://backend/src/index.ts)
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [keypairs.ts](file://backend/src/config/keypairs.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

**Section sources**
- [api-client.ts](file://frontend/src/lib/api-client.ts)
- [sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [index.ts](file://backend/src/index.ts)
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

## Performance Considerations
- Frontend Optimization
  - Lazy loading of components and routes
  - Efficient wallet connection management
  - Caching strategies for API responses

- Backend Scalability
  - Stateless service design for horizontal scaling
  - Connection pooling for Sui RPC endpoints
  - Asynchronous processing for long-running workflows

- Smart Contract Efficiency
  - Minimal storage usage in Move contracts
  - Event-driven architecture for off-chain indexing
  - Gas optimization through efficient data structures

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Authentication Issues
  - Verify JWT token validity and expiration
  - Check middleware configuration and secret keys

- Sui Network Connectivity
  - Validate RPC endpoint configuration
  - Monitor network latency and timeout settings

- Smart Contract Errors
  - Review transaction signatures and permissions
  - Check event logs for state transitions

- Agent Failures
  - Monitor external API availability
  - Implement retry logic with exponential backoff

**Section sources**
- [auth.ts](file://backend/src/middleware/auth.ts)
- [error-handler.ts](file://backend/src/middleware/error-handler.ts)
- [sui-client.ts](file://backend/src/config/sui-client.ts)
- [external-data.ts](file://backend/src/agents/external-data.ts)
- [fraud-check.ts](file://backend/src/agents/fraud-check.ts)
- [identity.ts](file://backend/src/agents/identity.ts)

## Conclusion
The Insurix decentralized insurance protocol demonstrates a robust three-layer architecture that effectively separates concerns while enabling complex insurance workflows. The service-oriented backend orchestrates multi-step processes involving auditors and AI agents, while Move smart contracts provide trust-minimized settlement and attestation management. The system's modular design supports scalability, maintainability, and extensibility for future enhancements.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Infrastructure Requirements
- Frontend: Node.js runtime, Next.js build tools, browser-compatible wallet extensions
- Backend: Node.js LTS, TypeScript compiler, Sui SDK dependencies
- Blockchain: Sui network access (mainnet/testnet/devnet), RPC endpoints
- Monitoring: Logging infrastructure, metrics collection, alerting systems

### Technology Stack Decisions
- Next.js for server-side rendering and static site generation
- TypeScript for type safety across frontend and backend
- Move for secure smart contract development on Sui
- Service-oriented architecture for modularity and scalability

### Third-Party Dependencies
- Sui SDK for blockchain interactions
- Cryptographic libraries for signature verification
- External data providers for KYC and market data
- AI/ML frameworks for fraud detection and identity verification

### Version Compatibility
- Node.js LTS compatibility matrix
- Sui SDK version pinning for stability
- Browser wallet extension compatibility requirements
- Move compiler version alignment across packages

**Section sources**
- [package.json](file://frontend/package.json)
- [package.json](file://backend/package.json)
- [Move.toml](file://contracts/insurix-schemas/Move.toml)
- [Move.toml](file://contracts/insurix-settlement/Move.toml)
- [README.md](file://contracts/attestations/README.md)
- [DESIGN.md](file://contracts/attestations/DESIGN.md)
- [insurix-ai-workflow.md](file://docs/design/insurix-ai-workflow.md)