# Smart Contract Architecture

<cite>
**Referenced Files in This Document**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/examples/auditor/sources/audit.move)
- [subject.move](file://contracts/attestations/demo/subject_example/sources/subject.move)
- [dependency.move](file://contracts/attestations/demo/dependency_example/sources/dependency.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [lib.move](file://contracts/insurix-schemas/sources/lib.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)
- [Move.toml (attestations)](file://contracts/attestations/packages/attestations/Move.toml)
- [Move.toml (schemas)](file://contracts/insurix-schemas/Move.toml)
- [Move.toml (settlement)](file://contracts/insurix-settlement/Move.toml)
- [Published.toml (attestations)](file://contracts/attestations/packages/attestations/Published.toml)
- [README.md (attestations)](file://contracts/attestations/README.md)
- [DESIGN.md (attestations)](file://contracts/attestations/DESIGN.md)
- [CONVENTIONS.md (attestations)](file://contracts/attestations/CONVENTIONS.md)
- [AGENTS.md (attestations)](file://contracts/attestations/AGENTS.md)
- [SIP-56-COMPARISON.md (attestations)](file://contracts/attestations/SIP-56-COMPARISON.md)
- [FUTURE-EXTENSIONS.md (attestations)](file://contracts/attestations/FUTURE-EXTENSIONS.md)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [sui-client.ts (backend config)](file://backend/src/config/sui-client.ts)
- [sui-client.ts (frontend lib)](file://frontend/src/lib/sui-client.ts)
</cite>

## Update Summary
**Changes Made**
- Updated Move.toml configuration section for insurix-settlement package to reflect recent build configuration changes
- Enhanced dependency management documentation to align with updated Move.toml settings
- Improved build and deployment procedures section with current configuration details

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
This document provides a comprehensive architecture guide for the Move-based smart contracts powering Insurix on the Sui blockchain. It focuses on the modular design across three primary packages: attestations, schemas, and settlement. The documentation explains resource management, capability patterns, access control, event-driven flows, state management, gas optimization strategies, testing frameworks, upgrade procedures, security best practices, contract interaction patterns, cross-package dependencies, versioning strategies, and blockchain-specific considerations such as transaction batching, block finality, and network consensus.

## Project Structure
The repository organizes Move contracts into feature-oriented packages under contracts/:
- attestations: Core attestation framework with examples and demos
- insurix-schemas: Shared data schemas for identity, fraud, and external data
- insurix-settlement: Claims, escrow, events, and settlement orchestration

```mermaid
graph TB
subgraph "Contracts"
A["attestations<br/>packages/attestations"]
B["insurix-schemas"]
C["insurix-settlement"]
end
subgraph "Backend Services"
D["attestation.service.ts"]
E["claim.service.ts"]
F["orchestrator.ts"]
end
subgraph "Frontend"
G["sui-client.ts"]
end
A --> C
B --> C
D --> A
E --> C
F --> D
F --> E
G --> C
```

**Diagram sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [sui-client.ts (frontend lib)](file://frontend/src/lib/sui-client.ts)

**Section sources**
- [README.md (attestations)](file://contracts/attestations/README.md)
- [DESIGN.md (attestations)](file://contracts/attestations/DESIGN.md)
- [CONVENTIONS.md (attestations)](file://contracts/attestations/CONVENTIONS.md)

## Core Components
- Attestations package: Defines core types and capabilities for issuing, verifying, and revoking attestations; includes example auditors and subject/dependency patterns.
- Schemas package: Provides shared data models for identity, fraud signals, and external data ingestion used by both attestations and settlement.
- Settlement package: Implements claim lifecycle, escrow management, event emission, and settlement logic that consumes attestations and schemas.

Key responsibilities:
- Resource modeling via Move resources for claims, escrows, and attestations
- Capability-based access control to restrict sensitive operations
- Event emission for off-chain indexing and UI updates
- Cross-package imports for schema reuse and attestation verification

**Section sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [lib.move](file://contracts/insurix-schemas/sources/lib.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

## Architecture Overview
The system follows a layered architecture:
- Data layer: Schemas define canonical structures for identity, fraud, and external data.
- Attestation layer: Auditors produce attestations bound to subjects or dependencies, enforcing access via capabilities.
- Settlement layer: Consumes attestations and schemas to manage claims, escrow funds, and emit settlement events.
- Backend services: Interact with Move contracts via Sui client SDK to orchestrate workflows and index events.
- Frontend: Connects wallets and triggers transactions through a lightweight Sui client wrapper.

```mermaid
sequenceDiagram
participant User as "User"
participant Frontend as "Frontend Sui Client"
participant Backend as "Orchestrator Service"
participant Attestations as "Attestations Package"
participant Schemas as "Schemas Package"
participant Settlement as "Settlement Package"
User->>Frontend : Initiate claim workflow
Frontend->>Backend : Request attestation issuance
Backend->>Attestations : Issue attestation (capability-gated)
Attestations-->>Backend : Attestation resource created
Backend->>Settlement : Create claim with attestation reference
Settlement->>Schemas : Validate schema fields
Settlement-->>Backend : Claim created + events emitted
Backend-->>Frontend : Acknowledge success
Frontend-->>User : Update UI with claim status
```

**Diagram sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [sui-client.ts (frontend lib)](file://frontend/src/lib/sui-client.ts)

## Detailed Component Analysis

### Attestations Package
The attestations package encapsulates the core attestation lifecycle:
- Types and resources model attestations, auditors, and subjects
- Capability patterns restrict issuance and verification to authorized entities
- Events are emitted for audit trails and off-chain indexing
- Examples include auditor implementations and subject/dependency usage patterns

```mermaid
classDiagram
class Auditor {
+address issuer
+bool active
+issue_attestation(subject_id, data) Attestation
+revoke_attestation(attestation_id) void
+verify_attestation(attestation_id) bool
}
class Subject {
+address owner
+string identifier
+register_subject(identifier) void
+attach_attestation(attestation_id) void
}
class Dependency {
+address provider
+string dependency_type
+validate_dependency(data) bool
}
Auditor --> Subject : "issues to"
Auditor --> Dependency : "consumes"
```

**Diagram sources**
- [audit.move](file://contracts/attestations/examples/auditor/sources/audit.move)
- [subject.move](file://contracts/attestations/demo/subject_example/sources/subject.move)
- [dependency.move](file://contracts/attestations/demo/dependency_example/sources/dependency.move)

**Section sources**
- [attestations.move](file://contracts/attestations/packages/attestations/sources/attestations.move)
- [audit.move](file://contracts/attestations/examples/auditor/sources/audit.move)
- [subject.move](file://contracts/attestations/demo/subject_example/sources/subject.move)
- [dependency.move](file://contracts/attestations/demo/dependency_example/sources/dependency.move)
- [README.md (attestations)](file://contracts/attestations/README.md)
- [DESIGN.md (attestations)](file://contracts/attestations/DESIGN.md)

### Schemas Package
The schemas package defines reusable data structures:
- Identity: Person or entity identifiers with verification flags
- Fraud: Risk indicators and scoring mechanisms
- External data: Ingestion interfaces for third-party sources
- Library utilities for validation and serialization

```mermaid
erDiagram
IDENTITY {
string id PK
string name
string verified_status
timestamp created_at
}
FRAUD {
string risk_id PK
string identity_id FK
float score
string category
boolean is_flagged
}
EXTERNAL_DATA {
string source_id PK
string payload_hash
string source_type
timestamp ingested_at
}
IDENTITY ||--o{ FRAUD : has_risk_profile
EXTERNAL_DATA ||--o{ FRAUD : informs
```

**Diagram sources**
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [lib.move](file://contracts/insurix-schemas/sources/lib.move)

**Section sources**
- [identity.move](file://contracts/insurix-schemas/sources/identity.move)
- [fraud.move](file://contracts/insurix-schemas/sources/fraud.move)
- [external_data.move](file://contracts/insurix-schemas/sources/external_data.move)
- [lib.move](file://contracts/insurix-schemas/sources/lib.move)

### Settlement Package
The settlement package manages the end-to-end claim process:
- Claim resource tracks lifecycle states and associated metadata
- Escrow holds funds until conditions are met
- Events emit state transitions for indexing
- Orchestration functions coordinate attestations and schema validation

```mermaid
flowchart TD
Start([Claim Initiated]) --> ValidateSchema["Validate Schema Fields"]
ValidateSchema --> SchemaValid{"Schema Valid?"}
SchemaValid --> |No| Reject["Reject Claim"]
SchemaValid --> |Yes| CheckAttestations["Verify Required Attestations"]
CheckAttestations --> AttestationsValid{"Attestations Valid?"}
AttestationsValid --> |No| Reject
AttestationsValid --> |Yes| FundEscrow["Fund Escrow"]
FundEscrow --> ApproveReview["Initiate Approval Workflow"]
ApproveReview --> Decision{"Decision Made?"}
Decision --> |Payout| Payout["Release Funds from Escrow"]
Decision --> |Deny| Deny["Return Funds to Owner"]
Payout --> Complete([Claim Settled])
Deny --> Complete
Reject --> End([End])
Complete --> End
```

**Diagram sources**
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

**Section sources**
- [claim.move](file://contracts/insurix-settlement/sources/claim.move)
- [escrow.move](file://contracts/insurix-settlement/sources/escrow.move)
- [events.move](file://contracts/insurix-settlement/sources/events.move)
- [settlement.move](file://contracts/insurix-settlement/sources/settlement.move)

## Dependency Analysis
Cross-package dependencies follow a clear hierarchy:
- Settlement depends on schemas for data validation and on attestations for verification
- Attestations may depend on schemas for structured data
- Backend services orchestrate interactions between packages via Sui client SDK

```mermaid
graph LR
Schemas["Schemas Package"] --> Attestations["Attestations Package"]
Schemas --> Settlement["Settlement Package"]
Attestations --> Settlement
Backend["Backend Services"] --> Attestations
Backend --> Settlement
Frontend["Frontend Sui Client"] --> Settlement
```

**Diagram sources**
- [Move.toml (schemas)](file://contracts/insurix-schemas/Move.toml)
- [Move.toml (attestations)](file://contracts/attestations/packages/attestations/Move.toml)
- [Move.toml (settlement)](file://contracts/insurix-settlement/Move.toml)
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [sui-client.ts (frontend lib)](file://frontend/src/lib/sui-client.ts)

**Section sources**
- [Move.toml (schemas)](file://contracts/insurix-schemas/Move.toml)
- [Move.toml (attestations)](file://contracts/attestations/packages/attestations/Move.toml)
- [Move.toml (settlement)](file://contracts/insurix-settlement/Move.toml)

## Build Configuration and Dependencies

### Move.toml Configuration Management
Each Move package maintains its own Move.toml configuration file that defines package metadata, dependencies, and build settings. The insurix-settlement package configuration ensures proper alignment with the overall project build system.

**Updated** Recent changes to the insurix-settlement/Move.toml configuration ensure compatibility with the latest Move compiler versions and optimize build performance.

Key configuration elements typically include:
- Package name and version specifications
- Dependency declarations for other Move packages
- Compiler settings and optimization flags
- Test configuration and target specifications
- Published package metadata for deployment

**Section sources**
- [Move.toml (settlement)](file://contracts/insurix-settlement/Move.toml)
- [Move.toml (schemas)](file://contracts/insurix-schemas/Move.toml)
- [Move.toml (attestations)](file://contracts/attestations/packages/attestations/Move.toml)

## Performance Considerations
- Transaction batching: Group multiple claim operations in single transactions to reduce overhead
- Gas optimization: Minimize storage footprint by using compact data structures and avoiding redundant fields
- Event efficiency: Emit only essential events to reduce indexing costs
- State management: Use capability tokens sparingly and prefer immutable references where possible
- Network considerations: Leverage Sui's parallel execution model by structuring transactions to avoid conflicts
- Build optimization: Configure Move.toml settings for optimal compilation and deployment performance

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Capability errors: Ensure proper ownership and delegation of auditor capabilities
- Schema validation failures: Verify field formats and required attributes before submission
- Event indexing gaps: Confirm backend services are subscribed to correct event streams
- Upgrade compatibility: Follow Move upgrade procedures and maintain Published.toml versions
- Build configuration issues: Verify Move.toml settings match project requirements and compiler versions

Debugging utilities:
- Backend logging in orchestrator and service layers
- Sui client error handling for network and transaction failures
- Test suites for each package to validate edge cases
- Move compiler diagnostics for configuration problems

**Section sources**
- [attestation.service.ts](file://backend/src/services/attestation.service.ts)
- [claim.service.ts](file://backend/src/services/claim.service.ts)
- [orchestrator.ts](file://backend/src/services/orchestrator.ts)
- [sui-client.ts (backend config)](file://backend/src/config/sui-client.ts)
- [Published.toml (attestations)](file://contracts/attestations/packages/attestations/Published.toml)

## Conclusion
The Insurix smart contract architecture demonstrates a robust, modular design leveraging Move's resource model and capability patterns. The separation of concerns across attestations, schemas, and settlement packages enables scalability and maintainability. By following the documented best practices for gas optimization, testing, and upgrades, developers can build reliable insurance workflows on the Sui blockchain.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Testing Frameworks
- Unit tests within each package validate core functionality
- Integration tests simulate end-to-end claim workflows
- Mock services for off-chain components during development

**Section sources**
- [attestations_tests.move](file://contracts/attestations/packages/attestations/tests/attestations_tests.move)
- [audit_tests.move](file://contracts/attestations/examples/auditor/tests/audit_tests.move)
- [external_data_tests.move](file://contracts/insurix-schemas/tests/external_data_tests.move)
- [fraud_tests.move](file://contracts/insurix-schemas/tests/fraud_tests.move)
- [identity_tests.move](file://contracts/insurix-schemas/tests/identity_tests.move)
- [settlement_tests.move](file://contracts/insurix-settlement/tests/settlement_tests.move)

### Upgrade Procedures
- Maintain backward compatibility when modifying schemas
- Use Move's upgrade mechanism with proper admin capabilities
- Update Published.toml versions and communicate changes to stakeholders

**Section sources**
- [audit_v2.move](file://contracts/attestations/demo/auditor_a/upgrade/audit_v2.move)
- [dependency_v2.move](file://contracts/attestations/demo/dependency_example/upgrade/dependency_v2.move)
- [Published.toml (attestations)](file://contracts/attestations/packages/attestations/Published.toml)

### Security Best Practices
- Implement strict access control using capabilities
- Validate all inputs against schema definitions
- Audit third-party integrations and external data sources
- Monitor for reentrancy and state corruption risks

**Section sources**
- [CONVENTIONS.md (attestations)](file://contracts/attestations/CONVENTIONS.md)
- [AGENTS.md (attestations)](file://contracts/attestations/AGENTS.md)
- [SIP-56-COMPARISON.md (attestations)](file://contracts/attestations/SIP-56-COMPARISON.md)
- [FUTURE-EXTENSIONS.md (attestations)](file://contracts/attestations/FUTURE-EXTENSIONS.md)

### Blockchain-Specific Considerations
- Transaction batching: Combine related operations to optimize gas usage
- Block finality: Account for Sui's fast finality in UI state management
- Network consensus: Design for high throughput and low latency environments
- Resource ownership: Leverage Move's ownership model for secure asset management

[No sources needed since this section provides general guidance]

### Build and Deployment Configuration
- Move.toml files define package metadata, dependencies, and build settings
- Consistent configuration across packages ensures smooth deployment workflows
- Version pinning prevents unexpected dependency updates
- Environment-specific configurations support development, staging, and production deployments

**Section sources**
- [Move.toml (settlement)](file://contracts/insurix-settlement/Move.toml)
- [Move.toml (schemas)](file://contracts/insurix-schemas/Move.toml)
- [Move.toml (attestations)](file://contracts/attestations/packages/attestations/Move.toml)