# Ride-Hailing Platform — Services and Data Architecture

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-RHP-002 |
| **Version** | 1.0 |
| **Parent** | ARCH-RHP-001 |
| **Audience** | Service owners, backend engineers, data engineers |

---

## 1. Purpose

This document specifies **microservice boundaries**, **API contracts**, **data ownership**, **storage technology selection**, and **messaging topology** for the ride-hailing platform.

---

## 2. Service catalog

### 2.1 Identity Service

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

**Staleness policy:** Drivers without update in 30 seconds are excluded from matching queries (not deleted — marked stale in metadata).

---

### 2.5 Matching Service

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

---

## 8. Related documents

| ID | Title |
|----|-------|
| ARCH-RHP-001 | Architecture Design Document |
| ARCH-RHP-003 | Request Lifecycle and Integration Flows |
| ARCH-RHP-004 | Azure Infrastructure Design |
| ARCH-RHP-005 | Reliability, Operations, and Observability |
