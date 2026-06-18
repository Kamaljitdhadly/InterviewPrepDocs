# Ride-Hailing Platform — Architecture Design Document

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-RHP-001 |
| **Version** | 1.0 |
| **Status** | Approved for implementation planning |
| **Classification** | Internal — Engineering |
| **Audience** | Solution architects, platform engineers, service owners, SRE, security |
| **Related documents** | ARCH-RHP-002 (Services & Data), ARCH-RHP-003 (Request Lifecycle), ARCH-RHP-004 (Azure Infrastructure), ARCH-RHP-005 (Reliability & Operations) |

---

## Executive summary

A ride-hailing platform at enterprise scale is fundamentally a **real-time marketplace**: it must match supply (drivers) with demand (riders) in seconds, track physical movement continuously, settle payments correctly, and remain available through regional peaks that dwarf normal web traffic patterns.

Unlike a typical CRUD application, the dominant engineering challenges are **geospatial indexing at scale**, **high-frequency location ingestion**, **distributed state machines** (trip lifecycle), and **eventual consistency** in a system where users expect real-time feedback. A rider waiting more than eight seconds for a match will abandon; a driver missing a push notification loses income; a payment failure after a completed trip creates support cost and regulatory exposure.

This architecture addresses those constraints by:

- Isolating **hot paths** (location, matching) in regional cells with in-memory geo indexes
- Treating the **Trip** as the single source of truth for ride state
- Using **async messaging** for everything that does not need to block the initial API response
- Deploying on **Azure** with managed services that scale horizontally without operating custom Kafka or self-hosted spatial databases

The document set describes a target-state platform supporting approximately **50M monthly active riders**, **10M daily trips**, and **170K location writes per second** at global peak. Teams may implement phases incrementally (see §12) without violating the boundaries defined here.

---

## 1. Purpose

This document defines the **target enterprise architecture** for a multi-region ride-hailing platform comparable in scale and capability to Uber or Lyft. It establishes the logical structure, quality attributes, service boundaries, and design principles used across the platform.

This is an **architecture design document**, not an interview guide. Implementation teams use it to align services, infrastructure, and operational models before build-out.

The platform follows a **domain-driven decomposition**: services map to business capabilities (trips, payments, matching) rather than technical layers (database layer, API layer). That boundary discipline prevents the most common failure mode in large distributed systems — multiple teams writing to the same tables and corrupting invariants.

---

## 1.1 Stakeholders and concerns

| Stakeholder | Primary concern | Architectural response |
|-------------|-----------------|------------------------|
| **Riders** | Fast match, accurate ETA, fair pricing | Regional geo index, SignalR updates, surge transparency |
| **Drivers** | Reliable offers, accurate earnings | Push + SignalR redundancy, immutable payment ledger |
| **Product** | Launch new cities without re-architecture | Metro cell model, configurable pricing rules |
| **Finance** | Auditable revenue, PCI compliance | PSP tokenization, SQL ledger, idempotent capture |
| **Legal / compliance** | Data residency, trip record retention | Regional Cosmos/SQL, 7-year retention policy |
| **SRE** | Detect and recover from failures in minutes | SLOs, runbooks, regional isolation (ARCH-RHP-005) |
| **Security** | Fraud, account takeover, GPS spoofing | Fraud service, WAF, device trust, stream anomaly detection |

---

## 2. Scope

### 2.1 In scope

- Rider and driver mobile/web clients
- Real-time ride request, matching, trip execution, and completion
- Dynamic pricing and payment settlement
- Driver onboarding and availability management
- Multi-metro, multi-region deployment on **Microsoft Azure**
- Observability, resilience, and security at platform level

### 2.2 Out of scope (referenced only)

- Autonomous vehicle fleet management
- Food delivery / freight product lines
- Detailed UI/UX specifications
- Vendor contract terms (PSP, maps provider)

---

## 3. Context and constraints

### 3.1 System context

```text
                    ┌─────────────────────────────────────┐
                    │         Ride-Hailing Platform        │
                    │  (matching, trips, payments, ops)   │
                    └───────────┬─────────────────────────┘
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  Rider / Driver           External services         Operations
  mobile & web             (maps, PSP, SMS, KYC)     (support, fraud, admin)
```

### 3.2 Regulatory and compliance constraints

| Constraint | Architectural implication |
|------------|---------------------------|
| PCI-DSS | Card data tokenized at PSP; platform stores tokens only |
| GDPR / regional privacy | Data residency per region; retention policies per domain |
| Transport licensing | Trip records retained per jurisdiction (7+ years typical) |
| Auditability | Immutable payment ledger; trip state transition audit trail |

### 3.3 Technical constraints

- Cloud provider: **Azure** (mandated for this design)
- Microservices on **AKS** with managed Azure data services
- Mobile clients require sub-second perceived responsiveness for trip status
- Location telemetry is the highest-volume data stream

### 3.4 Why these constraints drive the design

**Azure as mandated cloud** means the design uses first-party integration: Managed Identity to Key Vault, private endpoints to Cosmos DB, native SignalR Service for WebSocket scale, and Event Hubs for telemetry ingestion. Self-managing Kafka or Elasticsearch clusters is avoided unless a future ADR proves a gap.

**AKS over serverless-only** reflects the need for long-running stream processors, predictable latency on matching loops, and optional service mesh. Azure Container Apps or Functions remain valid for auxiliary workers (outbox relay, receipt PDF generation) but core domain services run on AKS with explicit resource limits and pod disruption budgets.

**Sub-second trip status** is a product perception requirement, not a hard network bound. The architecture achieves it via SignalR push with polling fallback — not by synchronous polling of ten microservices on every map frame.

---

## 4. Business capabilities

The platform is decomposed by **business capability**, not by team org chart.

| Capability | Description | Primary owning services |
|------------|-------------|-------------------------|
| **Identity & access** | Authentication, authorization, device trust | Identity Service |
| **Rider management** | Profiles, preferences, payment method references | Rider Profile Service |
| **Driver management** | Onboarding, vehicle, compliance documents | Driver Profile Service |
| **Location intelligence** | GPS ingest, geo-index, ETA | Location Service |
| **Dispatch & matching** | Pair rider with driver | Matching Service |
| **Trip orchestration** | Trip lifecycle state machine | Trip Service |
| **Pricing** | Fare estimation, surge, final fare | Pricing Service |
| **Payments** | Pre-auth, capture, refunds, driver payouts | Payment Service |
| **Notifications** | Push, SMS, email | Notification Service |
| **Ratings & trust** | Post-trip feedback, driver scores | Rating Service |
| **Risk & fraud** | GPS spoofing, payment abuse | Fraud Service |

Capabilities are intentionally **loosely coupled**. The Matching Service does not write trip records directly; it requests a state transition from Trip Service. Payment Service never mutates trip status — it reacts to `TripCompleted` events. This separation allows teams to deploy matching algorithm improvements without risking payment correctness.

---

## 5. Architecture principles

| # | Principle | Rationale |
|---|-----------|-----------|
| P1 | **Domain-owned data** | Each service owns its datastore; no shared database tables |
| P2 | **Trip as aggregate root** | Trip Service owns ride lifecycle; other services react via events |
| P3 | **Async by default for non-critical path** | Matching, notifications, analytics do not block synchronous API response |
| P4 | **Regional autonomy** | Each metro region operates independently for matching and location hot paths |
| P5 | **Idempotent operations** | All write APIs and message consumers support safe retry |
| P6 | **Fail operational, not ambiguous** | Explicit trip states; no silent partial success |
| P7 | **Defense in depth** | WAF, mTLS internal mesh, managed identities, least privilege |
| P8 | **Observable by design** | Correlation ID and `tripId` propagated across all tiers |

Principles P2 and P3 together define the **critical path** for ride requests: the rider receives a `tripId` within 300ms; matching, push notifications, and analytics proceed asynchronously. This is the single most important latency decision in the system. Putting matching inside the synchronous request thread would couple rider perceived performance to geo query time, Maps API latency, and driver response — an unacceptable dependency chain.

---

## 6. Quality attributes (non-functional requirements)

### 6.1 Availability and reliability

| Attribute | Target | Measurement |
|-----------|--------|-------------|
| Trip API availability | 99.95% monthly | Excludes planned maintenance |
| Ride request acceptance (API) | 99.9% | HTTP 2xx on `POST /rides/request` |
| Active trip continuity | 99.99% | No lost in-progress trip state |
| Payment capture (after retries) | 99.99% | Reconciliation for failures |

### 6.2 Performance

| Path | p50 | p99 |
|------|-----|-----|
| Ride request API (sync portion) | 120 ms | 300 ms |
| Time to first driver offer | 2 s | 8 s |
| Location update → rider map | 2 s | 5 s |
| Trip completion → payment capture initiated | 500 ms | 2 s |

### 6.3 Scalability targets (design envelope)

| Metric | Value |
|--------|-------|
| Monthly active riders | 50M |
| Monthly active drivers | 5M |
| Daily completed trips | 10M |
| Peak concurrent active trips | 500K |
| Peak driver location writes | 170K/sec (global) |
| Peak ride request rate | 90/sec (global) |

#### Capacity derivation notes

The **170K location writes/sec** figure assumes ~500K drivers online globally, each reporting every 3 seconds: 500,000 ÷ 3 ≈ 167K writes/sec. Batching on the mobile client (sending 2–3 buffered points per request) reduces HTTP overhead but not event volume at the stream layer.

**10M daily trips** with ~20 state transitions and location reads each implies billions of operations per day — but the read/write ratio is heavily skewed toward location (continuous during trips) versus trip document updates (discrete state changes). Storage planning must weight location stream retention and Redis memory over trip document count.

**500K concurrent active trips** at peak drives SignalR connection planning: each active trip typically holds one rider connection (driver may share hub or use separate channel), contributing to the ~1M concurrent WebSocket connections cited in ARCH-RHP-004.

### 6.4 Consistency model

| Domain | Consistency | Notes |
|--------|-------------|-------|
| Trip state | Strong per `tripId` | Optimistic concurrency (`version` field) |
| Payment ledger | Strong / transactional | Azure SQL with ACID |
| Driver location (live) | Eventual | 3–5 second staleness acceptable |
| Surge multiplier | Eventual | 30-second cache TTL |
| Driver rating aggregate | Eventual | Updated via event consumer |

Choosing strong consistency everywhere would make the platform unable to meet location write throughput. Choosing eventual consistency for trip state would produce rider/driver disagreements on whether a ride is active — unacceptable. The table above reflects deliberate **per-domain** trade-offs.

---

## 7. Logical architecture

### 7.1 Layered view

```text
┌────────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER                                                            │
│   Rider App (iOS/Android/Web)    Driver App (iOS/Android)              │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ HTTPS / WSS
┌───────────────────────────────▼────────────────────────────────────────┐
│ EDGE LAYER                                                              │
│   Azure Front Door (WAF, TLS, geo-routing)                             │
│   Azure API Management (auth, rate limit, routing)                       │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│ EXPERIENCE LAYER (BFF)                                                  │
│   Rider BFF          Driver BFF          Admin BFF                       │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│ DOMAIN SERVICES (AKS)                                                   │
│   Trip │ Matching │ Location │ Pricing │ Payment │ Identity │ ...      │
└───────┬───────────────────────────────────────┬────────────────────────┘
        │                                       │
┌───────▼───────────────┐           ┌───────────▼────────────────────────┐
│ DATA PLANE            │           │ MESSAGING & REAL-TIME               │
│ Cosmos DB, Azure SQL  │           │ Event Hubs, Service Bus, SignalR    │
│ Redis, Blob Storage   │           │                                     │
└───────────────────────┘           └─────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────────────────────────────┐
│ EXTERNAL INTEGRATIONS                                                 │
│ Azure Maps │ Payment PSP │ FCM/APNs │ KYC provider │ Entra External ID│
└────────────────────────────────────────────────────────────────────────┘
```

#### Layer responsibilities (detailed)

**Client layer** — Native mobile apps (Swift/Kotlin) with offline-tolerant local state for active trips. Maps rendering uses client SDK (Google Maps or Mapbox) while positions come from platform SignalR. Web client is secondary; same BFF contracts.

**Edge layer** — Terminates TLS, applies WAF rules, routes to nearest healthy region. No business logic at edge except caching of static pricing configuration bundles.

**Experience layer (BFF)** — Adapts domain APIs for mobile bandwidth: combines trip summary + driver location + ETA into one payload. Enforces client-specific rate limits. Does not own business rules.

**Domain services** — Encapsulate business logic and data ownership. Communicate via internal REST/gRPC (sync) and Service Bus (async). No service reads another service's database.

**Data plane** — Polyglot persistence chosen per access pattern: Cosmos for high-write documents, SQL for ledger, Redis for geo, Event Hubs for streams.

**External integrations** — Treated as unreliable: every external call has timeout, circuit breaker, and fallback where safe.

### 7.2 Regional topology

Each **metro region** (e.g. `us-west`, `eu-north`) is a failure-isolated cell:

```text
Global:  Front Door → APIM → regional routing by latency

Per region:
  AKS cluster
  Redis cluster (driver geo index)
  Cosmos DB regional endpoint
  Event Hubs namespace
  Service Bus namespace
```

Cross-region dependencies are limited to: global identity, payment PSP, Front Door, and analytics pipelines.

### 7.3 Communication patterns

| Pattern | Usage |
|---------|-------|
| **Synchronous REST/gRPC** | BFF → domain services; read paths; command with immediate response |
| **Asynchronous messaging** | Domain events (`TripCompleted`, `TripRequested`); Service Bus topics |
| **Event streaming** | High-volume location telemetry; Event Hubs |
| **WebSocket (SignalR)** | Real-time trip status and driver position to clients |
| **Transactional outbox** | Guarantee event publish on same commit as trip state change |

---

## 8. Service landscape (summary)

Detailed specifications: **ARCH-RHP-002**.

| Service | Responsibility | Sync API | Async consumer |
|---------|----------------|----------|----------------|
| Identity | AuthN/AuthZ, tokens | Yes | No |
| Rider BFF | Rider API aggregation | Yes | No |
| Driver BFF | Driver API aggregation | Yes | No |
| Trip | Trip state machine | Yes | Yes |
| Matching | Driver dispatch | Yes | Yes |
| Location | GPS ingest & geo query | Yes | Yes (stream processor) |
| Pricing | Fare rules & surge | Yes | Yes |
| Payment | Charges & ledger | Yes | Yes |
| Notification | Push/SMS/email | No | Yes |
| Rating | Post-trip feedback | Yes | Yes |
| Fraud | Risk scoring | Yes | Yes |

---

## 9. Trip lifecycle (state machine summary)

The Trip Service is the **system of record** for ride state. All other services subscribe to transitions.

```text
REQUESTED → MATCHING → DRIVER_ASSIGNED → DRIVER_EN_ROUTE → ARRIVED
    → IN_PROGRESS → COMPLETED

CANCELLED (from any pre-IN_PROGRESS state, subject to fee policy)
```

Full transition rules, triggers, and compensating actions: **ARCH-RHP-003**.

---

## 10. Architecture decision records

| ADR | Decision | Alternatives considered | Outcome |
|-----|----------|-------------------------|---------|
| ADR-001 | Microservices on AKS | Monolith, Container Apps only | AKS for mature ops, HPA, service mesh option |
| ADR-002 | Cosmos DB for trip documents | PostgreSQL, MongoDB Atlas | Geo-replication, flexible schema, partition scale |
| ADR-003 | Redis GEO for live driver index | Dedicated spatial DB, in-memory per pod | Proven sub-ms geo radius; regional cluster |
| ADR-004 | Event Hubs for location stream | Service Bus, direct Redis write | Throughput and cost at 100K+ events/sec |
| ADR-005 | Service Bus for domain events | Event Grid only, Kafka self-managed | DLQ, sessions, transactions for commands |
| ADR-006 | Async matching after trip create | Sync matching in request thread | Meets 300ms API SLA; isolates matching failures |
| ADR-007 | BFF per client type | Single API for all clients | Mobile payload optimization, separate rate limits |
| ADR-008 | Azure SignalR for real-time | Self-hosted SignalR on AKS | Managed scale for connection spikes |

#### ADR-006 expanded rationale (async matching)

Synchronous matching would require the Rider BFF to block until a driver accepts — potentially 15–45 seconds. Mobile HTTP clients, load balancers, and API gateways typically timeout at 30–60 seconds. More critically, holding a server thread (or async continuation) per waiting rider does not scale: 5,000 concurrent matchers at Friday peak would exhaust connection pools.

Async matching decouples **acceptance of the request** from **fulfillment of the match**. The rider watches progress via SignalR; the server scales matching workers independently based on Service Bus queue depth.

---

## 11. Security architecture (summary)

| Layer | Control |
|-------|---------|
| Edge | WAF (OWASP), DDoS Protection, TLS 1.2+ |
| API | JWT validation at APIM; per-client rate limits |
| Service mesh | mTLS between AKS services (optional: Istio/Linkerd) |
| Secrets | Azure Key Vault; Managed Identity; no secrets in images |
| Data | Encryption at rest (platform-managed keys); private endpoints |
| PCI | PAN never stored; PSP tokenization only |

Full security and network design: **ARCH-RHP-004**.

---

## 12. Evolution roadmap

| Phase | Capability | Architecture simplification |
|-------|------------|----------------------------|
| **Phase 0 — MVP** | Single city, card payment | Modular monolith or 3 services; PostgreSQL + Redis |
| **Phase 1 — Multi-city** | Surge pricing, scheduled rides | Extract Location, Matching, Trip; introduce Event Hubs |
| **Phase 2 — Enterprise** | Multi-region, fraud, payouts | Full service catalog; Cosmos multi-region; sagas |
| **Phase 3 — Hyperscale** | Global peak optimization | Metro cells; H3 indexing; custom matching fleet |

---

## 13. Document index

| ID | Title |
|----|-------|
| ARCH-RHP-001 | Architecture Design Document (this document) |
| ARCH-RHP-002 | Services and Data Architecture |
| ARCH-RHP-003 | Request Lifecycle and Integration Flows |
| ARCH-RHP-004 | Azure Infrastructure Design |
| ARCH-RHP-005 | Reliability, Operations, and Observability |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **BFF** | Backend-for-Frontend; API tailored to a specific client |
| **Geohash** | Hierarchical spatial encoding for grid-based geo queries |
| **Metro cell** | Isolated regional deployment serving one or more cities |
| **Offer** | Time-limited ride assignment proposal sent to a driver |
| **Outbox** | DB pattern: write business row + event row in one transaction |
| **PSP** | Payment Service Provider (e.g. Stripe, Adyen) |
| **Saga** | Distributed transaction via coordinated local transactions + compensation |
