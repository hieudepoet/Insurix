# Frontend Architecture

<cite>
**Referenced Files in This Document**
- [frontend/package.json](file://frontend/package.json)
- [frontend/next.config.ts](file://frontend/next.config.ts)
- [frontend/tsconfig.json](file://frontend/tsconfig.json)
- [frontend/src/app/layout.tsx](file://frontend/src/app/layout.tsx)
- [frontend/src/app/globals.css](file://frontend/src/app/globals.css)
- [frontend/src/app/(landing)/layout.tsx](file://frontend/src/app/(landing)/layout.tsx)
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/(landing)/components/HeroSection.tsx](file://frontend/src/app/(landing)/components/HeroSection.tsx)
- [frontend/src/app/(landing)/components/HeroScene.tsx](file://frontend/src/app/(landing)/components/HeroScene.tsx)
- [frontend/src/app/(landing)/components/FeaturesSection.tsx](file://frontend/src/app/(landing)/components/FeaturesSection.tsx)
- [frontend/src/app/(landing)/components/DemoSection.tsx](file://frontend/src/app/(landing)/components/DemoSection.tsx)
- [frontend/src/app/(landing)/components/StatsSection.tsx](file://frontend/src/app/(landing)/components/StatsSection.tsx)
- [frontend/src/app/(landing)/components/FAQSection.tsx](file://frontend/src/app/(landing)/components/FAQSection.tsx)
- [frontend/src/app/(landing)/components/HowItWorks.tsx](file://frontend/src/app/(landing)/components/HowItWorks.tsx)
- [frontend/src/app/(landing)/components/HowItWorksScene.tsx](file://frontend/src/app/(landing)/components/HowItWorksScene.tsx)
- [frontend/src/app/(landing)/components/CTASection.tsx](file://frontend/src/app/(landing)/components/CTASection.tsx)
- [frontend/src/app/(landing)/components/Footer.tsx](file://frontend/src/app/(landing)/components/Footer.tsx)
- [frontend/src/app/(landing)/components/Navigation.tsx](file://frontend/src/app/(landing)/components/Navigation.tsx)
- [frontend/src/app/claims/layout.tsx](file://frontend/src/app/claims/layout.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)
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
This document describes the frontend architecture of the Next.js application for Insurix. It covers the app router structure, component hierarchy, state management patterns, wallet integration using the Sui SDK, authentication and session handling, responsive design system, component library organization, routing strategies, page composition, layout management, performance optimizations, code splitting, asset management, accessibility compliance, cross-browser compatibility, and mobile responsiveness.

## Project Structure
The frontend follows the Next.js App Router conventions with feature-based grouping under the app directory:
- Root layout and global styles define the base shell and theme.
- The (landing) route group hosts marketing pages and shared landing components.
- The claims route group encapsulates claim-related features.
- Shared UI components live under src/components.
- Client-side integrations for Sui SDK and API client are centralized under src/lib.

```mermaid
graph TB
A["App Shell<br/>src/app/layout.tsx"] --> B["Global Styles<br/>src/app/globals.css"]
A --> C["Landing Group<br/>src/app/(landing)/layout.tsx"]
A --> D["Claims Group<br/>src/app/claims/layout.tsx"]
C --> E["Landing Page<br/>src/app/(landing)/page.tsx"]
E --> F["Hero Section<br/>src/app/(landing)/components/HeroSection.tsx"]
E --> G["Features Section<br/>src/app/(landing)/components/FeaturesSection.tsx"]
E --> H["Demo Section<br/>src/app/(landing)/components/DemoSection.tsx"]
E --> I["Stats Section<br/>src/app/(landing)/components/StatsSection.tsx"]
E --> J["FAQ Section<br/>src/app/(landing)/components/FAQSection.tsx"]
E --> K["How It Works<br/>src/app/(landing)/components/HowItWorks.tsx"]
E --> L["CTA Section<br/>src/app/(landing)/components/CTASection.tsx"]
E --> M["Footer<br/>src/app/(landing)/components/Footer.tsx"]
E --> N["Navigation<br/>src/app/(landing)/components/Navigation.tsx"]
D --> O["Claims Page<br/>src/app/claims/page.tsx"]
P["Wallet Integration<br/>src/components/WalletConnect.tsx"] --> E
P --> Q["Sui Client<br/>src/lib/sui-client.ts"]
R["API Client<br/>src/lib/api-client.ts"] --> E
R --> O
```

**Diagram sources**
- [frontend/src/app/layout.tsx](file://frontend/src/app/layout.tsx)
- [frontend/src/app/globals.css](file://frontend/src/app/globals.css)
- [frontend/src/app/(landing)/layout.tsx](file://frontend/src/app/(landing)/layout.tsx)
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/(landing)/components/HeroSection.tsx](file://frontend/src/app/(landing)/components/HeroSection.tsx)
- [frontend/src/app/(landing)/components/FeaturesSection.tsx](file://frontend/src/app/(landing)/components/FeaturesSection.tsx)
- [frontend/src/app/(landing)/components/DemoSection.tsx](file://frontend/src/app/(landing)/components/DemoSection.tsx)
- [frontend/src/app/(landing)/components/StatsSection.tsx](file://frontend/src/app/(landing)/components/StatsSection.tsx)
- [frontend/src/app/(landing)/components/FAQSection.tsx](file://frontend/src/app/(landing)/components/FAQSection.tsx)
- [frontend/src/app/(landing)/components/HowItWorks.tsx](file://frontend/src/app/(landing)/components/HowItWorks.tsx)
- [frontend/src/app/(landing)/components/HowItWorksScene.tsx](file://frontend/src/app/(landing)/components/HowItWorksScene.tsx)
- [frontend/src/app/(landing)/components/CTASection.tsx](file://frontend/src/app/(landing)/components/CTASection.tsx)
- [frontend/src/app/(landing)/components/Footer.tsx](file://frontend/src/app/(landing)/components/Footer.tsx)
- [frontend/src/app/(landing)/components/Navigation.tsx](file://frontend/src/app/(landing)/components/Navigation.tsx)
- [frontend/src/app/claims/layout.tsx](file://frontend/src/app/claims/layout.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)

**Section sources**
- [frontend/package.json](file://frontend/package.json)
- [frontend/next.config.ts](file://frontend/next.config.ts)
- [frontend/tsconfig.json](file://frontend/tsconfig.json)
- [frontend/src/app/layout.tsx](file://frontend/src/app/layout.tsx)
- [frontend/src/app/globals.css](file://frontend/src/app/globals.css)
- [frontend/src/app/(landing)/layout.tsx](file://frontend/src/app/(landing)/layout.tsx)
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/claims/layout.tsx](file://frontend/src/app/claims/layout.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)

## Core Components
- App Shell and Global Styles: The root layout defines the HTML structure, metadata, and global CSS imports. Global styles provide theming, typography, and responsive utilities.
- Landing Layout and Page: The landing layout sets up navigation and common sections. The landing page composes multiple feature sections to present product value propositions.
- Claims Layout and Page: The claims layout provides a focused environment for claim workflows. The claims page orchestrates claim interactions and integrates with backend services and wallet operations.
- Wallet Integration: The WalletConnect component abstracts wallet connection flows and exposes methods for signing transactions via the Sui SDK client.
- Sui Client: Centralized configuration and helpers for interacting with the Sui network, including provider setup, account management, and transaction building.
- API Client: Encapsulates HTTP requests to the backend, handling error normalization and response parsing.

**Section sources**
- [frontend/src/app/layout.tsx](file://frontend/src/app/layout.tsx)
- [frontend/src/app/globals.css](file://frontend/src/app/globals.css)
- [frontend/src/app/(landing)/layout.tsx](file://frontend/src/app/(landing)/layout.tsx)
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/claims/layout.tsx](file://frontend/src/app/claims/layout.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)

## Architecture Overview
The application uses Next.js App Router for file-based routing and server/client component boundaries. The landing experience is composed of modular sections that can be independently optimized and tested. The claims module encapsulates domain-specific logic and integrates with both the Sui SDK and backend APIs.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant NextJS as "Next.js App Router"
participant Landing as "Landing Page"
participant Claims as "Claims Page"
participant Wallet as "WalletConnect"
participant Sui as "Sui Client"
participant API as "API Client"
Browser->>NextJS : Navigate to /
NextJS-->>Landing : Render landing layout + page
Landing-->>Browser : Composed sections (Hero, Features, Demo, Stats, FAQ, HowItWorks, CTA, Footer)
Browser->>NextJS : Navigate to /claims
NextJS-->>Claims : Render claims layout + page
Claims->>Wallet : Connect wallet
Wallet->>Sui : Initialize provider and account
Claims->>API : Fetch claim data or submit actions
API-->>Claims : Return structured responses
Claims-->>Browser : Update UI based on state
```

**Diagram sources**
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)

## Detailed Component Analysis

### App Router and Layout Management
- Root layout establishes the document shell, metadata, and global styles. It ensures consistent behavior across all routes.
- Route groups (landing, claims) isolate concerns and enable independent layouts per feature area.
- Each page composes reusable sections or modules, keeping files focused and testable.

```mermaid
flowchart TD
Start(["Route Entry"]) --> CheckGroup{"Route Group?"}
CheckGroup --> |Yes| ApplyLayout["Apply Group Layout"]
CheckGroup --> |No| UseRoot["Use Root Layout"]
ApplyLayout --> RenderPage["Render Page Component"]
UseRoot --> RenderPage
RenderPage --> ComposeSections["Compose Feature Sections"]
ComposeSections --> End(["Hydrate and Interact"])
```

**Diagram sources**
- [frontend/src/app/layout.tsx](file://frontend/src/app/layout.tsx)
- [frontend/src/app/(landing)/layout.tsx](file://frontend/src/app/(landing)/layout.tsx)
- [frontend/src/app/claims/layout.tsx](file://frontend/src/app/claims/layout.tsx)
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)

**Section sources**
- [frontend/src/app/layout.tsx](file://frontend/src/app/layout.tsx)
- [frontend/src/app/(landing)/layout.tsx](file://frontend/src/app/(landing)/layout.tsx)
- [frontend/src/app/claims/layout.tsx](file://frontend/src/app/claims/layout.tsx)
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)

### Landing Page Composition
The landing page aggregates multiple sections to tell a cohesive story:
- HeroSection and HeroScene introduce the product visually.
- FeaturesSection highlights core capabilities.
- DemoSection showcases interactive elements.
- StatsSection presents key metrics.
- FAQSection addresses common questions.
- HowItWorks and HowItWorksScene explain processes.
- CTASection drives conversions.
- Footer provides navigation and legal links.
- Navigation offers top-level access and responsive menu behavior.

```mermaid
classDiagram
class LandingPage {
+render() JSX
}
class HeroSection {
+render() JSX
}
class FeaturesSection {
+render() JSX
}
class DemoSection {
+render() JSX
}
class StatsSection {
+render() JSX
}
class FAQSection {
+render() JSX
}
class HowItWorks {
+render() JSX
}
class HowItWorksScene {
+render() JSX
}
class CTASection {
+render() JSX
}
class Footer {
+render() JSX
}
class Navigation {
+render() JSX
}
LandingPage --> HeroSection : "composes"
LandingPage --> FeaturesSection : "composes"
LandingPage --> DemoSection : "composes"
LandingPage --> StatsSection : "composes"
LandingPage --> FAQSection : "composes"
LandingPage --> HowItWorks : "composes"
LandingPage --> HowItWorksScene : "composes"
LandingPage --> CTASection : "composes"
LandingPage --> Footer : "composes"
LandingPage --> Navigation : "composes"
```

**Diagram sources**
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/(landing)/components/HeroSection.tsx](file://frontend/src/app/(landing)/components/HeroSection.tsx)
- [frontend/src/app/(landing)/components/FeaturesSection.tsx](file://frontend/src/app/(landing)/components/FeaturesSection.tsx)
- [frontend/src/app/(landing)/components/DemoSection.tsx](file://frontend/src/app/(landing)/components/DemoSection.tsx)
- [frontend/src/app/(landing)/components/StatsSection.tsx](file://frontend/src/app/(landing)/components/StatsSection.tsx)
- [frontend/src/app/(landing)/components/FAQSection.tsx](file://frontend/src/app/(landing)/components/FAQSection.tsx)
- [frontend/src/app/(landing)/components/HowItWorks.tsx](file://frontend/src/app/(landing)/components/HowItWorks.tsx)
- [frontend/src/app/(landing)/components/HowItWorksScene.tsx](file://frontend/src/app/(landing)/components/HowItWorksScene.tsx)
- [frontend/src/app/(landing)/components/CTASection.tsx](file://frontend/src/app/(landing)/components/CTASection.tsx)
- [frontend/src/app/(landing)/components/Footer.tsx](file://frontend/src/app/(landing)/components/Footer.tsx)
- [frontend/src/app/(landing)/components/Navigation.tsx](file://frontend/src/app/(landing)/components/Navigation.tsx)

**Section sources**
- [frontend/src/app/(landing)/page.tsx](file://frontend/src/app/(landing)/page.tsx)
- [frontend/src/app/(landing)/components/HeroSection.tsx](file://frontend/src/app/(landing)/components/HeroSection.tsx)
- [frontend/src/app/(landing)/components/FeaturesSection.tsx](file://frontend/src/app/(landing)/components/FeaturesSection.tsx)
- [frontend/src/app/(landing)/components/DemoSection.tsx](file://frontend/src/app/(landing)/components/DemoSection.tsx)
- [frontend/src/app/(landing)/components/StatsSection.tsx](file://frontend/src/app/(landing)/components/StatsSection.tsx)
- [frontend/src/app/(landing)/components/FAQSection.tsx](file://frontend/src/app/(landing)/components/FAQSection.tsx)
- [frontend/src/app/(landing)/components/HowItWorks.tsx](file://frontend/src/app/(landing)/components/HowItWorks.tsx)
- [frontend/src/app/(landing)/components/HowItWorksScene.tsx](file://frontend/src/app/(landing)/components/HowItWorksScene.tsx)
- [frontend/src/app/(landing)/components/CTASection.tsx](file://frontend/src/app/(landing)/components/CTASection.tsx)
- [frontend/src/app/(landing)/components/Footer.tsx](file://frontend/src/app/(landing)/components/Footer.tsx)
- [frontend/src/app/(landing)/components/Navigation.tsx](file://frontend/src/app/(landing)/components/Navigation.tsx)

### Claims Module and State Management
The claims module manages user interactions related to insurance claims. It coordinates:
- Data fetching from the API client.
- Wallet connection and transaction signing via the Sui client.
- Local state updates to reflect claim status and results.

```mermaid
sequenceDiagram
participant User as "User"
participant ClaimsPage as "Claims Page"
participant APIClient as "API Client"
participant Wallet as "WalletConnect"
participant SuiClient as "Sui Client"
User->>ClaimsPage : Open claims workflow
ClaimsPage->>APIClient : GET claim details
APIClient-->>ClaimsPage : Claim data
ClaimsPage->>Wallet : Connect wallet if needed
Wallet->>SuiClient : Initialize provider/account
User->>ClaimsPage : Submit claim action
ClaimsPage->>SuiClient : Build and sign transaction
SuiClient-->>ClaimsPage : Transaction result
ClaimsPage->>APIClient : POST update or confirmation
APIClient-->>ClaimsPage : Success/failure
ClaimsPage-->>User : Updated UI and feedback
```

**Diagram sources**
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)

**Section sources**
- [frontend/src/app/claims/page.tsx](file://frontend/src/app/claims/page.tsx)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)

### Wallet Integration Using Sui SDK
The wallet integration abstracts connection and signing flows:
- WalletConnect handles user prompts and state synchronization.
- SuiClient configures the network provider and exposes helper functions for account and transaction operations.
- Error handling covers rejected connections, network issues, and invalid payloads.

```mermaid
flowchart TD
Init(["Initialize Wallet"]) --> Detect["Detect Installed Wallets"]
Detect --> Connect{"Connect Selected Wallet?"}
Connect --> |Yes| Provider["Setup Sui Provider"]
Provider --> Account["Load Account Info"]
Account --> Ready{"Ready to Sign?"}
Ready --> |Yes| SignTx["Sign Transaction"]
SignTx --> Broadcast["Broadcast to Network"]
Broadcast --> Result{"Success?"}
Result --> |Yes| Done(["Update UI"])
Result --> |No| HandleError["Handle Error"]
Connect --> |No| Cancel["Cancel Flow"]
HandleError --> Done
Cancel --> Done
```

**Diagram sources**
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)

**Section sources**
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)

### Authentication Flow and Session Management
Authentication and session handling typically involve:
- Backend token issuance upon successful login.
- Secure storage of tokens (e.g., httpOnly cookies or secure local storage).
- Middleware or client-side guards to protect routes and enforce authenticated states.
- Automatic refresh mechanisms for long-lived sessions.

```mermaid
sequenceDiagram
participant User as "User"
participant AuthUI as "Auth UI"
participant API as "API Client"
participant Server as "Backend Auth"
participant Storage as "Session Storage"
User->>AuthUI : Enter credentials
AuthUI->>API : POST login
API->>Server : Validate credentials
Server-->>API : Issue token/session
API-->>AuthUI : Set session cookie/token
AuthUI->>Storage : Persist session securely
AuthUI-->>User : Redirect to protected route
```

[No sources needed since this section outlines general patterns without analyzing specific files]

### Responsive Design System and UI/UX Patterns
- Global styles define typography scales, color tokens, spacing units, and breakpoints.
- Components use flexible layouts (flexbox/grid), relative units, and media queries for responsiveness.
- Accessibility attributes (aria-*), semantic HTML, keyboard navigation, and focus management ensure inclusive experiences.
- Visual consistency is maintained through shared components and design tokens.

**Section sources**
- [frontend/src/app/globals.css](file://frontend/src/app/globals.css)

## Dependency Analysis
The frontend dependencies include Next.js, React, TypeScript, and libraries for Sui SDK integration and HTTP clients. Configuration files manage build settings, linting, and type checking.

```mermaid
graph TB
PKG["package.json"] --> NEXT["Next.js Runtime"]
PKG --> REACT["React"]
PKG --> TS["TypeScript"]
PKG --> SUI["Sui SDK"]
PKG --> HTTP["HTTP Client"]
CFG["next.config.ts"] --> BUILD["Build Config"]
TSC["tsconfig.json"] --> TYPES["Type Checking"]
```

**Diagram sources**
- [frontend/package.json](file://frontend/package.json)
- [frontend/next.config.ts](file://frontend/next.config.ts)
- [frontend/tsconfig.json](file://frontend/tsconfig.json)

**Section sources**
- [frontend/package.json](file://frontend/package.json)
- [frontend/next.config.ts](file://frontend/next.config.ts)
- [frontend/tsconfig.json](file://frontend/tsconfig.json)

## Performance Considerations
- Code Splitting: Leverage Next.js automatic code splitting per route and component-level lazy loading where appropriate.
- Asset Optimization: Use Next.js image optimization, font loading strategies, and static asset minification.
- Bundle Size: Analyze bundle size, remove unused dependencies, and prefer tree-shaking-friendly libraries.
- Caching: Implement efficient caching for API responses and static assets; consider service workers for offline scenarios.
- Rendering: Prefer server components for heavy rendering and reduce client-side overhead; hydrate only necessary parts.
- Monitoring: Track performance metrics (FCP, LCP, CLS) and optimize bottlenecks identified by profiling tools.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Wallet Connection Failures: Verify installed wallets, correct network configuration, and permissions. Check browser console errors and network logs.
- API Errors: Inspect request payloads, headers, and backend responses. Normalize error messages and surface actionable feedback to users.
- Hydration Mismatches: Ensure consistent server and client rendering; avoid window-dependent code in server components.
- Routing Issues: Confirm route group syntax and file naming conventions; validate dynamic segments and redirects.
- Accessibility Problems: Validate aria attributes, contrast ratios, and keyboard navigation; run automated audits and manual testing.

**Section sources**
- [frontend/src/components/WalletConnect.tsx](file://frontend/src/components/WalletConnect.tsx)
- [frontend/src/lib/api-client.ts](file://frontend/src/lib/api-client.ts)
- [frontend/src/lib/sui-client.ts](file://frontend/src/lib/sui-client.ts)

## Conclusion
The Insurix frontend leverages Next.js App Router for scalable routing and layout management, modular component composition for maintainability, and robust wallet integration via the Sui SDK. By adhering to responsive design principles, accessibility standards, and performance best practices, the application delivers a secure, user-friendly experience across devices and browsers. Continuous monitoring, testing, and iterative improvements will further enhance reliability and usability.