# Ambient Physical Safety Intelligence

<img width="1536" height="1024" alt="physicalsecurity-ambient" src="https://github.com/user-attachments/assets/b9fb5a48-a075-4a5a-82af-232d4afa54d1" />

Ambient Physical Safety Intelligence (APSI) is a modular, real-time sensing and decision-support platform designed to monitor environmental signals, contextual data streams, and system state in order to generate actionable safety insights. The system is built using TypeScript with a Vite + React front-end architecture and structured service abstraction layers to enable scalable integration with physical sensor networks, AI inference services, and emergency response orchestration layers.

This document provides a detailed technical breakdown of architecture, modules, execution flow, and extensibility considerations.

---

# 1. System Objectives

APSI is designed to:

• Ingest real-time ambient data (sensor streams, environmental signals, API feeds)
• Maintain contextual system state across the application
• Apply rule-based and/or AI-assisted decision logic
• Generate alerts, risk scores, and recommended actions
• Provide an operator-facing monitoring interface
• Support extensible integration with physical safety infrastructure

The architecture prioritizes modularity, deterministic state handling, and service abstraction to ensure production-grade extensibility.

---

# 2. High-Level Architecture

The application follows a layered architecture:

UI Layer → Context Layer → Hooks Layer → Services Layer → External Systems

Each layer has a defined responsibility:

• UI: Presentation and operator interaction
• Context: Global state management and orchestration
• Hooks: Encapsulated reactive logic
• Services: API communication and external integration
• External Systems: Sensors, inference engines, safety APIs

The design avoids tight coupling between UI and external APIs by isolating side effects in services and hooks.

---

# 3. Core Modules and Responsibilities

## 3.1 components/

This directory contains reusable UI elements and structured interface components.

Typical responsibilities include:

• Dashboard panels
• Risk visualization components
• Alert cards and notification systems
• Data tables for event streams
• Status indicators
• Control interfaces for operator input

Design Principles:

• Stateless when possible
• Business logic avoided inside components
• All side-effects delegated to hooks
• Fully typed props using TypeScript interfaces

If real-time visualizations are implemented, components subscribe via context selectors to avoid unnecessary re-renders.

---

## 3.2 context/

This layer manages global application state.

Responsibilities:

• System-wide safety state
• Active alerts
• Sensor data aggregation
• Risk scoring outputs
• Operator session state
• Configuration flags

Likely implementation patterns:

• React Context API
• Reducer-based state machine
• Action dispatch model
• Immutable state updates

Why this matters:

Ambient safety systems require deterministic transitions. Using reducer-based architecture prevents unpredictable UI states and ensures traceable event handling.

If implemented correctly, this module functions as the orchestration brain of the frontend.

---

## 3.3 hooks/

Custom hooks encapsulate reactive logic and side-effects.

Examples of responsibilities:

• useSensorStream(): subscribes to live sensor updates
• useRiskComputation(): derives risk score from context state
• useAlerts(): handles alert lifecycle and expiration
• useAPI(): wraps service calls with loading and error states

Design Strategy:

• All async operations isolated in hooks
• No direct API calls from components
• Clean cancellation handling (AbortController)
• WebSocket or SSE subscription management

Hooks make the system testable and composable.

---

## 3.4 services/

This layer abstracts external communication.

Responsibilities:

• REST API calls
• WebSocket management
• Authentication handling
• Data transformation
• Error normalization

Service design should:

• Avoid UI dependencies
• Return typed responses
• Handle retries and timeouts
• Centralize error handling
• Provide retry/backoff logic for sensor ingestion

Production Considerations:

• Implement exponential backoff for sensor streams
• Implement heartbeat for persistent connections
• Validate payload schema before state mutation

---

## 3.5 App.tsx

Root component responsible for:

• Composing global providers
• Initializing context
• Routing (if implemented)
• Top-level error boundaries

It wires together the context providers and top-level layout components.

---

## 3.6 index.tsx

Application bootstrap entry.

Responsibilities:

• DOM mounting
• StrictMode wrapping
• Initial provider injection

No business logic should exist here.

---

## 3.7 vite.config.ts

Defines:

• Dev server configuration
• Proxy rules
• Build optimization
• Environment variable exposure
• Alias resolution

For safety systems, proxy configuration may route API calls to backend simulation environments during development.

---

## 3.8 TypeScript Configuration (tsconfig.json)

Ensures:

• Strict typing
• Path aliasing
• Module resolution
• Target compilation standard

Strict mode is recommended to prevent runtime inconsistencies in safety-critical state handling.

---

# 4. Data Flow Lifecycle

1. Sensor emits data
2. Service layer receives data
3. Hook processes and validates data
4. Context dispatch updates global state
5. Risk engine derives updated risk score
6. UI re-renders relevant components
7. Alert system triggers if threshold exceeded

This separation ensures testability at every layer.

---

# 5. Risk Scoring Strategy (Abstracted Model)

Risk may be derived from:

• Environmental signals
• Behavioral signals
• Historical patterns
• Contextual weighting

Recommended architecture:

• Deterministic baseline scoring
• AI-assisted augmentation layer
• Threshold-based alert escalation

Keep scoring stateless and pure whenever possible.

---

# 6. Environment Configuration

Example .env.local

GEMINI_API_KEY=your_key
API_BASE_URL=[https://api.yourdomain.com](https://api.yourdomain.com)

All sensitive configuration should be injected at build time and never hardcoded.

---

# 7. Build & Execution

Install dependencies:

npm install

Run development server:

npm run dev

Build for production:

npm run build

Preview production build:

npm run preview

---

# 8. Production Hardening Recommendations

• Add runtime schema validation (Zod or Yup)
• Implement centralized logging
• Integrate Sentry or similar monitoring
• Add structured telemetry
• Implement rate limiting
• Secure API keys via server proxy
• Add integration tests for alert thresholds

---

# 9. Testing Strategy

Recommended layers:

• Unit tests for hooks
• Reducer state transition tests
• Service mock tests
• End-to-end UI tests

Focus especially on alert escalation logic and state transitions.

---

# 10. Security Considerations

• Do not expose inference keys client-side
• Validate all incoming sensor payloads
• Implement CORS restrictions
• Use HTTPS strictly
• Sanitize all dynamic inputs

For real-world deployment, the frontend must not directly trust sensor-originated data.

---

# 11. Extensibility Model

To add a new sensor integration:

1. Add service abstraction in services/
2. Add hook wrapper in hooks/
3. Dispatch structured action to context/
4. Update reducer to handle new event type
5. Add UI visualization component

The architecture allows safe expansion without tight coupling.

---

# 12. Deployment Strategy

Recommended:

• Docker multi-stage build
• CI/CD pipeline on main branch
• Static hosting + API gateway backend
• Observability integration

Production deployments must ensure fail-safe fallback UI in case of API failure.

---

# 13. License

MIT License

---

This README reflects the structural architecture of the repository and is designed to serve as production-level documentation. Replace abstracted sections with implementation-specific details as the platform evolves.
