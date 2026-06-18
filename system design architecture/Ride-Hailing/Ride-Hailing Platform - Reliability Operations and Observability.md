# Ride-Hailing Platform — Reliability, Operations, and Observability

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-RHP-005 |
| **Version** | 1.0 |
| **Parent** | ARCH-RHP-001 |
| **Audience** | SRE, operations, service owners, incident commanders |

---

## 1. Purpose

This document defines **service level objectives**, **resilience patterns**, **observability standards**, **alerting**, **runbooks**, and **operational testing** for the ride-hailing platform in production.

---

## 2. Service level objectives (SLOs)

### 2.1 Customer-facing SLOs

| Service | SLI | SLO (30-day) | Error budget |
|---------|-----|--------------|--------------|
| Ride request API | Success rate (2xx on POST /rides/request) | 99.9% | 43 min downtime |
| Trip status API | Availability (GET /rides/{id}) | 99.95% | 22 min |
| Time to first offer | p99 latency | ≤ 8 seconds | 1% of requests may exceed |
| Location freshness | Updates < 5s old during active trip | 95% | 5% stale acceptable |
| Payment capture | Success after retries | 99.99% | Manual reconciliation for remainder |
| Push delivery (offers) | Delivered within 10s | 99% | — |

### 2.2 Internal SLOs

| Component | SLI | SLO |
|-----------|-----|-----|
| Service Bus consumer lag | Max age of oldest message | < 30s p99 |
| Event Hubs processor lag | Offset lag | < 10s p99 |
| Cosmos DB | 429 throttle rate | < 0.1% of requests |
| Redis | Command latency p99 | < 5 ms |

### 2.3 Error budget policy

When a customer-facing SLO is on track to breach within the month:

1. Freeze non-critical deployments for the affected service
2. Redirect engineering capacity to reliability work
3. Post-incident review required for any budget-exhausting event

---

## 3. Resilience patterns

### 3.1 Pattern catalog by service

| Pattern | Service(s) | Implementation |
|---------|------------|----------------|
| **Timeout** | All HTTP clients | BFF: 2s; internal: 1–5s per dependency |
| **Retry with jitter** | Payment → PSP, Cosmos transient | 3 attempts; exponential backoff |
| **Circuit breaker** | Pricing → Azure Maps | Open after 5 failures / 30s; haversine fallback |
| **Bulkhead** | Matching node pool isolated from BFF | Separate AKS node pool |
| **Saga + compensation** | Trip complete → payment capture | Release pre-auth on permanent failure |
| **Dead-letter queue** | All Service Bus consumers | Alert + replay tooling |
| **Graceful degradation** | Surge pricing stale | Serve last-known multiplier (max 60s) |
| **Load shedding** | APIM + BFF | Reject new ride requests in overheated region |
| **Kill switch** | App Configuration | `matching.enabled`, `region.{id}.acceptingRides` |

### 3.2 Circuit breaker — Azure Maps

```csharp
// Polly policy on Pricing Service HTTP client
var circuitBreaker = Policy
    .Handle<HttpRequestException>()
    .OrResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
    .CircuitBreakerAsync(
        handledEventsAllowedBeforeBreaking: 5,
        durationOfBreak: TimeSpan.FromSeconds(30),
        onBreak: (result, duration) => _metrics.IncrementMapsCircuitOpen(),
        onReset: () => _metrics.IncrementMapsCircuitClosed());
```

Fallback: `distanceKm = Haversine(pickup, dropoff) × 1.3 road factor`.

### 3.3 Trip state durability

Trip Service guarantees no lost state transitions:

- Cosmos write + outbox row in **logical transaction** (outbox pattern)
- `version` field prevents lost updates (optimistic concurrency)
- All transitions logged to append-only `trip_audit` container

### 3.4 Cascading failure prevention

```text
Maps API slow
  WITHOUT protection → Pricing threads block → BFF pool exhausted → all APIs 503

WITH protection:
  Maps circuit opens at 5 failures
  → fallback estimate served
  → BFF threads freed
  → matching uses haversine for rank; matrix only for top 10
```

---

## 4. Observability architecture

### 4.1 Platform stack

```text
┌─────────────────────────────────────────────────────────────┐
│ Application tier (AKS)                                       │
│   OpenTelemetry SDK → OTLP exporter                          │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Azure Monitor                                                │
│   Application Insights (traces, dependencies, exceptions)  │
│   Log Analytics Workspace (KQL, log aggregation)           │
│   Azure Monitor Metrics (platform + custom)                  │
│   Managed Grafana (dashboards — optional)                    │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Alerting → Action Groups → PagerDuty / Teams / SMS           │
│ Workbooks → SLO dashboards, trip funnel, regional heatmap    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Telemetry standards

#### 4.2.1 Required log fields (structured JSON)

```json
{
  "timestamp": "2026-06-18T14:02:11.123Z",
  "level": "Information",
  "service": "matching-service",
  "environment": "production",
  "regionId": "sea-metro",
  "traceId": "4bf92f3577b34da6973aea469d5dc9b8",
  "spanId": "00f067aa0ba902b7",
  "correlationId": "corr_abc",
  "tripId": "trip_8f3a2b",
  "message": "Offer sent to driver",
  "properties": {
    "offerId": "off_77",
    "driverId": "drv_456",
    "searchRadiusKm": 1.5,
    "candidateCount": 12
  }
}
```

#### 4.2.2 Distributed tracing

| Requirement | Standard |
|-------------|----------|
| Propagation | W3C `traceparent` on all HTTP and Service Bus messages |
| Baggage | `tripId`, `regionId`, `correlationId` |
| Sampling | 100% for errors; 10% head-based for success paths (adjustable) |
| Dependency tracking | All outbound HTTP, Cosmos, Redis, Service Bus auto-instrumented |

#### 4.2.3 Custom metrics

| Metric name | Type | Dimensions |
|-------------|------|------------|
| `ride.request.count` | Counter | `regionId`, `vehicleType`, `status` |
| `matching.offer.sent` | Counter | `regionId` |
| `matching.offer.accepted` | Counter | `regionId` |
| `matching.time_to_offer` | Histogram | `regionId` |
| `matching.no_drivers` | Counter | `regionId` |
| `location.ingest.lag` | Gauge | `regionId` |
| `payment.capture.success` | Counter | `regionId` |
| `payment.capture.failure` | Counter | `regionId`, `errorCode` |
| `trip.state.transition` | Counter | `fromStatus`, `toStatus` |

### 4.3 Business funnel dashboard

```text
ride_requested
  → matching_started
  → offer_sent
  → offer_accepted
  → trip_started
  → trip_completed
  → payment_captured
```

Drop-off percentage between stages tracked per `regionId` and hour-of-day. Product and ops review daily.

---

## 5. Alerting

### 5.1 Severity definitions

| Severity | Definition | Response |
|----------|------------|----------|
| **SEV-1** | Active trips impaired; payment pipeline blocked; regional outage | Page on-call immediately; incident commander |
| **SEV-2** | Elevated match times; single service degraded with fallback | Page on-call; resolve within 1 hour |
| **SEV-3** | Non-critical degradation; workaround exists | Ticket; business hours |
| **SEV-4** | Informational; capacity warning | Review next business day |

### 5.2 Alert catalog

| Alert | Condition | Severity | Runbook |
|-------|-----------|----------|---------|
| `TripApi5xxRateHigh` | 5xx > 1% for 5 min | SEV-1 | RB-001 |
| `MatchP99High` | p99 time-to-offer > 10s for 5 min | SEV-2 | RB-002 |
| `LocationProcessorLag` | Event Hubs lag > 30s | SEV-2 | RB-003 |
| `RedisGeoEmpty` | Online driver count drops > 50% in 5 min | SEV-2 | RB-003 |
| `PaymentDLQNonZero` | DLQ depth > 0 | SEV-2 | RB-004 |
| `Cosmos429Spike` | 429 > 1% requests | SEV-3 | RB-005 |
| `SignalRConnectionDrop` | Connections -30% in 5 min | SEV-2 | RB-006 |
| `NoDriversRateHigh` | > 15% requests fail match | SEV-3 | RB-002 |
| `MapsCircuitOpen` | Circuit open > 2 min | SEV-3 | RB-007 |

---

## 6. Operational runbooks

### RB-001 — Trip API elevated 5xx

```text
1. Check App Insights → Failures blade → filter trip-service, rider-bff
2. Check Cosmos DB health metrics (throttling, regional outage)
3. Check AKS pod status: kubectl get pods -n core-services
4. If Cosmos 429: verify autoscale max RU; temporary raise ceiling
5. If pod OOM: check HPA limits; scale node pool
6. Communicate status page if SEV-1 > 10 min
```

### RB-002 — Slow matching / high no-driver rate

```text
1. Grafana: matching.time_to_offer p99 by regionId
2. Redis: ZCARD drivers:{regionId} — online driver count
3. Location processor lag (Event Hubs metric)
4. If lag high: scale location-processor deployment
5. If driver count low: real supply issue — ops notify; surge should already be elevated
6. If geo index empty but drivers online: check processor errors; restart deployment
```

```bash
# Verify online drivers in region
redis-cli -h $REDIS_HOST ZCARD drivers:sea-metro

# Restart stuck processor
kubectl rollout restart deployment/location-processor -n location
```

### RB-003 — Location pipeline degradation

```text
1. Event Hubs → monitor incoming vs outgoing messages
2. Check processor pod logs for Redis connection errors
3. Verify Redis Premium failover event (Azure portal)
4. Checkpoint lag: if growing, scale processor replicas
5. Stale drivers auto-excluded from matching after 30s — expect temporary match degradation
```

### RB-004 — Payment dead-letter queue

```text
1. Service Bus Explorer → DLQ messages for payment subscription
2. Inspect message body: tripId, error reason
3. If PSP outage: wait for recovery; messages retry automatically after replay
4. If data issue: fix trip record; manual replay via admin tool with idempotency check
5. Verify no duplicate captures in payment ledger before replay
```

### RB-005 — Cosmos DB throttling

```text
1. Identify hot partition key (regionId with skew?)
2. Short-term: raise autoscale max RU
3. Medium-term: review partition strategy; split hot regionId
4. Verify retry policy on clients is not amplifying load
```

### RB-006 — SignalR connection drop

```text
1. Azure portal → SignalR Service metrics → connection count
2. Check negotiate endpoint (Rider BFF) error rate
3. Regional Azure status page
4. Clients fall back to polling — confirm GET /rides/{id} healthy
5. Scale SignalR units if legitimate connection spike
```

---

## 7. Load and capacity management

### 7.1 Scheduled scale events

| Event | Pre-scale action | Lead time |
|-------|------------------|-----------|
| New Year Eve | AKS node pool +50%; Redis cluster review; SignalR units +2 | T-24h |
| Stadium event | Regional surge expected; pre-position drivers (ops) | T-4h |
| Known bad weather | Expect higher demand, lower supply | T-2h |

### 7.2 Load shedding procedure (region overheated)

Executed by on-call or automated when `region.cpu > 85%` AND `match_p99 > 12s`:

```text
1. Set App Configuration: region.{id}.acceptingRides = false
2. APIM returns 503 + Retry-After: 120 for new POST /rides/request
3. Active trips: FULL PRIORITY — no resource reduction
4. Notify ops and city team
5. Re-enable when metrics normalize for 15 min
```

---

## 8. Security operations

| Activity | Frequency |
|----------|-----------|
| Vulnerability scan (container images) | Every build |
| Penetration test | Annual |
| Access review (Managed Identities, RBAC) | Quarterly |
| Key Vault secret rotation | 90 days (automated) |
| WAF rule review | Monthly |
| PCI SAQ validation | Annual |

**Incident types requiring security team:** suspected GPS spoofing at scale, payment fraud spike, credential leak, unauthorized API access pattern.

---

## 9. Disaster recovery

### 9.1 DR objectives

| Tier | RPO | RTO | Scope |
|------|-----|-----|-------|
| Trip in progress | 0 | < 5 min | Regional failover via Front Door |
| Payment ledger | 0 | < 15 min | SQL geo-failover |
| Analytics | 1 hour | 24 hours | Rebuild from Event Hubs archive |

### 9.2 DR drill schedule

| Drill | Frequency | Success criteria |
|-------|-----------|------------------|
| Regional AKS failover (staging) | Quarterly | FL-002 completes in secondary region |
| Cosmos manual failover | Semi-annual | Trip read/write < 15 min interruption |
| Redis zone failure | Annual (staging) | Matching resumes < 5 min |
| Payment PSP failover to secondary | Annual | Capture succeeds on backup route |

---

## 10. Chaos and resilience testing

### 10.1 Staging chaos experiments

| Experiment | Injection | Pass criteria |
|------------|-----------|---------------|
| CHAOS-001 | Kill 1 matching pod during active offer | Offer completes or fails cleanly; no duplicate assign |
| CHAOS-002 | 500ms latency to Azure Maps | Circuit opens; estimates still returned |
| CHAOS-003 | Redis primary failover | Matching degraded < 30s; no data corruption |
| CHAOS-004 | Service Bus unavailable 60s | Trip creates succeed; consumers catch up without duplicate side effects |
| CHAOS-005 | 2× normal location ingest rate | Processor lag < 15s; no pod OOM |

### 10.2 Production game day

Quarterly cross-team simulation with incident commander, comms template, and timed recovery objectives. Example scenario: "Redis cluster memory exhaustion in US-East during rush hour."

---

## 11. On-call and incident management

| Role | Responsibility |
|------|----------------|
| **Incident Commander** | Coordinates response, comms, escalation |
| **Technical Lead** | Drives root cause investigation |
| **Comms Lead** | Status page, stakeholder updates |
| **Scribe** | Timeline documentation |

**Post-incident:** Blameless postmortem within 5 business days. Action items tracked to completion. SLO error budget impact documented.

---

## 12. Related documents

| ID | Title |
|----|-------|
| ARCH-RHP-001 | Architecture Design Document |
| ARCH-RHP-002 | Services and Data Architecture |
| ARCH-RHP-003 | Request Lifecycle and Integration Flows |
| ARCH-RHP-004 | Azure Infrastructure Design |
