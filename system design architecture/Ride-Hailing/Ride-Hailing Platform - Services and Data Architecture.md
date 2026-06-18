# Ride-Hailing Platform — Services and Data Architecture

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-RHP-002 |
| **Version** | 1.0 |
| **Parent** | ARCH-RHP-001 |
| **Audience** | Service owners, backend engineers, data engineers |

---

## Executive summary

This document is the **service and data contract layer** of the ride-hailing platform. Where ARCH-RHP-001 explains *why* the system is shaped as it is, this document explains *what each service owns*, *how services communicate*, and *where data lives*.

The central design choice is **strict data ownership**: no shared databases between services. If Payment Service needs trip fare data, it receives it in a `TripCompleted` event payload — it does not query Cosmos DB's trips container. That rule adds integration overhead but eliminates the class of bugs where one team's schema migration breaks another team's production path.

The highest-volume path — **driver location** — is intentionally separated from the **trip state machine**. Location data is loss-tolerant and refreshed every few seconds; trip state is durable and legally significant. Mixing them in one store would force an impossible consistency model.

---

## 1. Purpose

This document specifies **microservice boundaries**, **API contracts**, **data ownership**, **storage technology selection**, and **messaging topology** for the ride-hailing platform.

Readers should use this document when: defining a new API endpoint, choosing a datastore for a new feature, onboarding to a service team, or reviewing cross-service integration in a design review.

---

## 1.1 Service interaction overview

```text
                    ┌─────────────┐     ┌─────────────┐
                    │  Rider BFF  │     │ Driver BFF  │
                    └──────┬──────┘     └──────┬──────┘
                           │                   │
         ┌─────────────────┼───────────────────┼─────────────────┐
         ▼                 ▼                   ▼                 ▼
    ┌─────────┐      ┌───────────┐       ┌──────────┐      ┌──────────┐
    │  Trip   │◄────►│ Matching  │◄─────►│ Location │      │ Payment  │
    └────┬────┘      └───────────┘       └──────────┘      └──────────┘
         │
         │ trip-events (Service Bus)
         ▼
    ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌─────────┐
    │ Pricing  │  │  Fraud   │  │ Notification│  │ Rating  │
    └──────────┘  └──────────┘  └────────────┘  └─────────┘
```

Solid lines are synchronous calls during request handling. The `trip-events` topic fans out asynchronous reactions — the Trip Service does not call Payment or Notification directly.

---

## 2. Service catalog

### 2.1 Identity Service

Identity is the **trust anchor** for the entire platform. Every API call carries a JWT issued or validated through this service (or Entra External ID federation). The service does not know about trips, fares, or locations — it only answers: *who is this user, and what role do they have?*

The `auth_version` claim enables **forced logout** after password reset or fraud detection without maintaining a per-request session table at 50M users. APIs reject tokens whose version lags the current value on the user record.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | User accounts, credentials, refresh tokens, roles (`rider`, `driver`, `admin`) |
| **Store** | Azure SQL |
| **Integrations** | Microsoft Entra External ID (B2C) for social/OAuth login |
| **Public API** | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |

Token model:

- Access JWT: 15-minute TTL; claims: `sub`, `role`, `regionId`, `auth_version`
- Refresh token: 30-day TTL; hashed at rest; family revocation on logout

---

### 2.2 Rider Profile Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Rider preferences, saved places, emergency contacts, payment method **references** |
| **Store** | Cosmos DB (container: `riders`, PK: `/riderId`) |
| **Does not own** | PAN or card numbers (PSP tokens only) |

```json
{
  "riderId": "rider_123",
  "displayName": "Jane Doe",
  "defaultPaymentMethodId": "pm_xyz",
  "savedPlaces": [
    { "label": "Home", "lat": 47.60, "lng": -122.33 }
  ],
  "blockedDriverIds": []
}
```

---

### 2.3 Driver Profile Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Driver status (`PENDING`, `APPROVED`, `ONLINE`, `OFFLINE`, `ON_TRIP`), vehicle info, compliance docs |
| **Store** | Cosmos DB (container: `drivers`, PK: `/driverId`) + Blob Storage for documents |
| **Integrations** | KYC provider webhook for approval status |

Driver cannot receive offers unless `status = ONLINE` and Location Service confirms active heartbeat.

---

### 2.4 Location Service

Location is the **highest-throughput subsystem**. At peak, it absorbs more writes per second than all other services combined. The design therefore never persists every GPS point to a transactional database on the hot path — that would be economically and operationally infeasible.

Instead, the service implements a **lambda architecture** pattern:

- **Speed layer:** Redis GEO holds only the latest position per driver for matching and map display
- **Batch/stream layer:** Event Hubs retains raw events for analytics, fraud, and dispute investigation
- **Serving layer:** Sampled route points written to cold storage during active trips for support queries

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Real-time driver positions, regional geo-index, sampled trip route history |
| **Hot store** | Azure Cache for Redis (GEO commands, per metro) |
| **Stream** | Azure Event Hubs (`location-updates` hub) |
| **Cold store** | Cosmos DB or Data Lake (sampled history for disputes/fraud) |

#### Ingest path

```text
Driver App → Location Ingest API (AKS) → Event Hubs
    → Location Processor (AKS / Functions)
        → Redis GEOADD + driver metadata hash
        → (optional) cold storage sink
```

#### Ingest API contract

```http
POST /v1/locations/batch
Authorization: Bearer {driver_jwt}
Content-Type: application/json

{
  "driverId": "drv_456",
  "regionId": "sea-metro",
  "points": [
    { "lat": 47.6062, "lng": -122.3321, "heading": 180, "speedKph": 35, "ts": "2026-06-18T14:20:01Z" }
  ]
}
```

#### Redis data structures

```bash
# Geo set per metro
GEOADD drivers:sea-metro -122.3321 47.6062 drv_456

# Driver metadata
HSET driver:drv_456 regionId sea-metro tripId trip_8f3a2b updatedAt 1718724001 vehicleType STANDARD

# Query — drivers within 2 km, nearest first
GEORADIUS drivers:sea-metro -122.3321 47.6062 2 km WITHDIST ASC COUNT 50
```

**Staleness policy:** Drivers without update in 30 seconds are excluded from matching queries (not deleted — marked stale in metadata). This prevents matching against drivers whose app crashed or lost GPS signal. The 30-second window balances rider experience (don't match "ghost" drivers) against urban canyon GPS dropouts (don't eject drivers too aggressively).

---

### 2.5 Matching Service

Matching is the **marketplace brain**. Its job is not merely "find nearest driver" — it optimizes for pickup ETA, driver fairness (idle time), vehicle type match, rider safety (blocked drivers), and platform efficiency (minimize empty miles).

The algorithm is deliberately **sequential offer** (one driver at a time with 15-second timeout) rather than broadcast (notify all nearby drivers simultaneously). Broadcast creates race conditions, wastes driver attention, and encourages dangerous phone use while driving. Sequential offer with fairness weighting is industry standard for a reason.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Dispatch algorithm, ride offers, offer expiry |
| **Store** | Cosmos DB (container: `offers`, PK: `/regionId`, TTL on expired offers) |
| **Triggers** | Consumes `TripRequested` from Service Bus |
| **Calls** | Location (geo search), Trip (assign driver), Notification (offer push) |

#### Dispatch algorithm

```text
INPUT:  tripId, pickup coordinates, vehicleType, regionId
CONFIG: initialRadius=1km, maxRadius=5km, offerTtl=15s, matchTimeout=45s

1. Transition trip to MATCHING (via Trip Service API)
2. WHILE elapsed < matchTimeout AND trip still MATCHING:
     a. candidates = Location.geoSearch(pickup, radius, limit=50)
     b. candidates = FILTER online, correct vehicle, not on trip, not blocked, fraud score OK
     c. candidates = RANK by ETA (Azure Maps matrix for top N) + driver score + idle fairness
     d. FOR each candidate:
          create Offer(offerId, expiresAt = now + 15s)
          notify driver (SignalR + FCM)
          WAIT accept | decline | timeout
          IF accept → Trip.assignDriver(driverId); PUBLISH TripMatched; RETURN
     e. radius = min(radius * 1.5, maxRadius)
3. IF timeout → Trip.cancel(reason=NO_DRIVERS_AVAILABLE)
```

**Concurrency:** If two drivers accept simultaneously, Trip Service conditional update on `version` + `status=MATCHING` ensures exactly one winner.

---

### 2.6 Trip Service

The Trip Service is the **authoritative record of ride lifecycle**. No other service may set `status` on a trip document. Matching proposes an assignment; Trip Service commits it. Payment reports financial outcome; Trip Service records `paymentStatus` but does not execute charges.

This single-writer model eliminates split-brain scenarios where a rider sees "cancelled" and a driver sees "active". Every transition requires `expectedVersion` — optimistic concurrency control that is cheap at trip scale and requires no distributed locks.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Trip aggregate, state machine, audit trail |
| **Store** | Cosmos DB (container: `trips`, PK: `/regionId`) |
| **Pattern** | Transactional outbox → Service Bus topic `trip-events` |

#### Trip document schema

```json
{
  "id": "trip_8f3a2b",
  "regionId": "sea-metro",
  "version": 7,
  "status": "IN_PROGRESS",
  "riderId": "rider_123",
  "driverId": "drv_456",
  "pickup": { "lat": 47.6062, "lng": -122.3321, "address": "400 Broad St" },
  "dropoff": { "lat": 47.6205, "lng": -122.3493, "address": "Space Needle" },
  "vehicleType": "STANDARD",
  "fareEstimate": { "amountCents": 1850, "currency": "USD", "surgeMultiplier": 1.2 },
  "paymentMethodId": "pm_xyz",
  "paymentStatus": "PRE_AUTHORIZED",
  "timestamps": {
    "requestedAt": "2026-06-18T14:01:55Z",
    "matchedAt": "2026-06-18T14:02:11Z",
    "startedAt": "2026-06-18T14:18:44Z"
  },
  "idempotencyKey": "req_abc_from_client"
}
```

#### State transition authority

Only Trip Service may change `status`. Other services request transitions via internal API:

```http
PATCH /internal/trips/{tripId}/transition
{
  "targetStatus": "DRIVER_ASSIGNED",
  "expectedVersion": 3,
  "commandId": "cmd_unique_001",
  "metadata": { "driverId": "drv_456", "offerId": "off_77" }
}
```

---

### 2.7 Pricing Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Base fare rules, per-km/minute rates, surge multipliers, promo codes |
| **Store** | Azure SQL (rules) + Redis (surge cache by geohash) |
| **Integrations** | Azure Maps (distance/duration for estimates) |

Surge computation (simplified):

```text
demand = active ride requests in geohash cell (last 5 min)
supply = online drivers in cell
surgeMultiplier = clamp(baseFunction(demand/supply), 1.0, 3.0)
```

Cached at `surge:{geohash}` with 30-second TTL. Recalculated by stream consumer from `TripRequested` and driver availability events.

---

### 2.8 Payment Service

Money movement demands **strongest consistency** in the platform. Trip and location data can tolerate seconds of staleness; a double charge or lost capture is a customer incident and potential regulatory violation.

Payment Service uses Azure SQL Hyperscale with an **append-only transaction log** pattern: charges and refunds are inserted, never updated. Corrections are new rows. PSP integration uses idempotency keys on every call because network timeouts make duplicate submission inevitable at scale.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Payment ledger, PSP integration, driver payout batches |
| **Store** | Azure SQL (Hyperscale) — ledger tables with strict ACID |
| **Pattern** | Saga orchestration for pre-auth → capture → payout |

#### Ledger tables (conceptual)

| Table | Purpose |
|-------|---------|
| `payment_intents` | Pre-auth holds linked to `tripId` |
| `transactions` | Immutable charge/refund records |
| `driver_earnings` | Per-trip driver credit |
| `payout_batches` | Nightly settlement to driver bank accounts |

All mutations require `idempotencyKey`. PSP calls use `tripId` + operation as PSP idempotency key.

---

### 2.9 Notification Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Template rendering, delivery tracking, provider failover |
| **Store** | Azure SQL (outbox + delivery log) |
| **Providers** | FCM, APNs, Azure Communication Services (SMS) |

Consumes: `TripMatched`, `TripCancelled`, `PaymentCaptured`, `RideOffer`.

---

### 2.10 Rating Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Star ratings, comments, driver rolling averages |
| **Store** | Cosmos DB (PK: `/tripId` for ratings; aggregated scores in `drivers`) |
| **Consistency** | Eventual aggregate update via `RatingSubmitted` event |

---

### 2.11 Fraud Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Risk scores, block lists, GPS anomaly detection rules |
| **Store** | Event Hubs (events) → Synapse / stream analytics; Redis (block list cache) |
| **Actions** | `ALLOW`, `CHALLENGE`, `BLOCK` returned synchronously on ride request |

---

## 3. BFF layer design

The Backend-for-Frontend (BFF) pattern exists because **mobile clients and domain services have different optimization goals**. Domain services expose stable, normalized APIs designed for longevity. BFFs aggregate, trim, and shape responses for specific clients — reducing round trips over high-latency mobile networks.

Without a BFF, the rider app might need four HTTP calls to render the "driver en route" screen: trip status, driver profile, vehicle details, and live location. The Rider BFF returns one payload.

BFFs contain **orchestration logic** (call order, parallelization, timeout handling) but **no domain invariants**. A BFF never decides cancellation fees — it calls Trip and Payment services that own those rules.

### 3.1 Rider BFF

Aggregates chatty backend calls into mobile-optimized responses.

| Public endpoint | Backend orchestration |
|-----------------|----------------------|
| `POST /api/v1/rides/request` | Fraud → Pricing → Trip.create → publish (async matching) |
| `GET /api/v1/rides/{id}` | Trip + Location (driver position) |
| `POST /api/v1/rides/{id}/cancel` | Trip.cancel → Matching.abort → Payment (fee) |
| `GET /api/v1/rides/estimate` | Pricing + Azure Maps distance |

**Sync response rule:** `POST /rides/request` returns within 300ms with `{ tripId, status, signalRUrl }`. Matching runs asynchronously.

### 3.2 Driver BFF

| Public endpoint | Purpose |
|-----------------|---------|
| `POST /api/v1/drivers/status` | ONLINE / OFFLINE |
| `POST /api/v1/locations/batch` | Proxy to Location ingest |
| `POST /api/v1/offers/{id}/accept` | Forward to Matching |
| `POST /api/v1/trips/{id}/arrived` | Trip transition |
| `POST /api/v1/trips/{id}/start` | Trip transition + Payment pre-auth |
| `POST /api/v1/trips/{id}/complete` | Trip transition + trigger capture saga |

---

## 4. Data architecture

Data store selection follows **access pattern**, not team preference:

| If you need… | Choose… | Because… |
|--------------|---------|----------|
| High-write documents with flexible schema | Cosmos DB | Horizontal partition scale, geo-replication |
| ACID transactions and audit trail | Azure SQL | Mature ledger patterns, compliance tooling |
| Sub-millisecond geo radius queries | Redis GEO | In-memory spatial commands |
| Millions of events/sec append-only | Event Hubs | Purpose-built stream ingestion |
| Reliable workflow messaging | Service Bus | DLQ, sessions, duplicate detection |

### 4.1 Storage allocation matrix

| Data domain | Technology | Partition / shard key | Replication |
|-------------|------------|----------------------|-------------|
| Trips | Cosmos DB | `regionId` | Multi-region account |
| Riders / drivers | Cosmos DB | `riderId` / `driverId` | Regional |
| Payment ledger | Azure SQL Hyperscale | `tripId` clustered | Geo-secondary |
| Live driver positions | Redis Premium Cluster | Per `regionId` key prefix | Zone redundant |
| Location stream | Event Hubs | Partition by `driverId` hash | Regional namespace |
| Domain events | Service Bus Premium | Topic per domain | Geo-DR pairing |
| Documents (KYC) | Blob Storage | `driverId` path | GRS |
| Analytics | Data Lake + Synapse | Date partition | Regional |

### 4.2 Data flow classification

```text
HOT PATH (latency-critical):
  Location write → Event Hubs → Redis (< 3s)
  Geo query → Redis (< 10ms)
  Trip read → Cosmos session consistency (< 20ms)

WARM PATH (seconds acceptable):
  Matching → Service Bus → offer notification
  Trip state change → outbox → event consumers

COLD PATH (minutes/hours):
  Analytics ETL → Synapse
  Driver payout batch → nightly SQL job
```

### 4.3 Retention policy

| Data type | Retention |
|-----------|-----------|
| Active trip | Life of trip + 90 days hot |
| Completed trip record | 7 years (compliance) |
| Location raw stream | 7 days Event Hubs |
| Sampled route (in-trip) | 1 year |
| Payment ledger | 7 years immutable |
| Application logs | 90 days hot, 1 year archive |

---

## 5. Messaging topology

### 5.1 Service Bus topics

**Topic: `trip-events`**

| Subscription | Consumer | Action |
|--------------|----------|--------|
| `matching` | Matching Service | Start dispatch on `TripRequested` |
| `payment` | Payment Service | Pre-auth on `TripStarted`; capture on `TripCompleted` |
| `notification` | Notification Service | Push on state changes |
| `pricing` | Pricing Service | Demand signal for surge |
| `analytics` | Forwarder → Event Hubs | Data warehouse ingest |

### 5.2 Event Hubs

| Hub | Producers | Consumers |
|-----|-----------|-----------|
| `location-updates` | Location Ingest API | Location Processor, Fraud (stream) |
| `platform-analytics` | Event forwarders | Synapse, Power BI |

### 5.3 Event schema (domain event envelope)

```json
{
  "eventId": "evt_9d4e1a2b",
  "eventType": "TripCompleted",
  "eventVersion": "1.0",
  "occurredAt": "2026-06-18T14:45:00Z",
  "correlationId": "corr_abc",
  "regionId": "sea-metro",
  "payload": {
    "tripId": "trip_8f3a2b",
    "finalDistanceMeters": 8420,
    "finalDurationSeconds": 1240,
    "fareAmountCents": 1920,
    "currency": "USD"
  }
}
```

---

## 6. Idempotency and duplicate handling

| Layer | Mechanism |
|-------|-----------|
| Client → BFF | `Idempotency-Key` header; 24-hour dedup store in Redis |
| Trip transitions | `commandId` in PATCH body; ignore duplicate |
| Service Bus | `messageId` deduplication (Premium) |
| Payment → PSP | Idempotency key = `{tripId}:{operation}` |
| Outbox relay | Processed flag on outbox row; at-least-once → consumer idempotent |

---

## 7. Geospatial indexing design

### 7.1 Index structure

Metro regions use **H3 or geohash cells** for demand/supply aggregation. Live matching uses **Redis GEO** for radius search.

```text
Pickup (47.606, -122.332)
  → geohash precision 6: "c23nd6"
  → GEORADIUS 1km → expand to 1.5km → 2.25km → ... → 5km max
```

### 7.2 ETA ranking

For top 10 geo candidates, call **Azure Maps Matrix Routing API** (batched). Fallback: haversine distance ÷ average city speed when Maps circuit is open.

#### Why Redis GEO instead of PostGIS or Elasticsearch

PostGIS and Elasticsearch excel at complex polygon queries but add operational overhead and higher baseline latency than in-memory Redis at the 100K-driver-per-metro scale. Redis GEO radius search consistently delivers sub-10ms p99 in production ride-hailing workloads. H3 cell aggregation (used for surge) sits alongside Redis — cells for demand/supply math, Redis for live driver positions.

Uber open-sourced **H3** for hexagonal grid indexing; this design supports either H3 or geohash for surge cells. The live matching index remains Redis GEO for simplicity and team familiarity.

---

## 8. Related documents

| ID | Title |
|----|-------|
| ARCH-RHP-001 | Architecture Design Document |
| ARCH-RHP-003 | Request Lifecycle and Integration Flows |
| ARCH-RHP-004 | Azure Infrastructure Design |
| ARCH-RHP-005 | Reliability, Operations, and Observability |
