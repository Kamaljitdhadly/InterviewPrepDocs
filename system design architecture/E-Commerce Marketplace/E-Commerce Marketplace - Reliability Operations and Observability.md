# E-Commerce Marketplace — Reliability, Operations, and Observability

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-ECOM-005 |
| **Version** | 1.0 |
| **Parent** | ARCH-ECOM-001 |
| **Audience** | SRE, operations, service owners, incident commanders |

---

## Executive summary

A marketplace **loses revenue every minute checkout is down** — especially during sale events where 80% of quarterly GMV may occur in 24 hours. This document defines how the organization measures health, survives failures, and responds operationally.

Observability must answer business questions, not only infrastructure ones: "Why did conversion drop 2%?" requires funnel metrics from `view_pdp → add_to_cart → checkout_start → payment_success → order_placed`, not just CPU graphs.

---

## 1. Service level objectives

### 1.1 Customer-facing SLOs

| Service | SLI | SLO (30-day) | Error budget |
|---------|-----|--------------|--------------|
| Search API | Success + p99 < 200ms | 99.95% | 22 min |
| PDP API | Success + p99 < 300ms | 99.95% | 22 min |
| Checkout start | 2xx rate | 99.9% | 43 min |
| Place order | Order created / attempts | 99.9% | 43 min |
| Payment success | Captured / initiated (excl. user cancel) | 99.95% | 22 min |
| CDN cache hit ratio (PDP) | Hits / total | > 90% | — |

During **sale events**, SLOs are measured separately with stricter alerting — a 99.9% monthly budget exhausts in minutes at 1M concurrent users if unchecked.

### 1.2 Internal SLOs

| Component | SLI | SLO |
|-----------|-----|-----|
| Search index freshness | Catalog update → searchable | < 5 min p99 |
| Inventory accuracy | Audit mismatch rate | < 0.01% |
| Service Bus lag | Oldest message age | < 30s p99 |
| Redis stock operations | p99 latency | < 5 ms |
| Checkout saga completion | End-to-end (excl. UPI user delay) | < 3s p99 |

### 1.3 Error budget policy

SLO burn >50% in 24 hours during sale week → freeze non-critical deploys; incident review within 4 hours.

---

## 2. Resilience patterns

| Pattern | Application |
|---------|-------------|
| **CDN + stale-while-revalidate** | PDP during sales |
| **Single-flight cache rebuild** | Origin PDP on cache miss storm |
| **Checkout token queue** | FL-012 flash sale |
| **Inventory atomic DECRBY** | Redis oversell prevention |
| **Saga + compensation** | Release stock on payment fail |
| **Circuit breaker** | PSP, carrier APIs |
| **Bulkhead** | Checkout node pool isolated |
| **Outbox** | Order placed + event atomic |
| **Idempotency keys** | Place order, webhooks |
| **Load shedding** | APIM 429 when origin saturated |

### 2.1 Cache stampede prevention

```text
PDP cache miss for sku_123:
  1. CDN → origin
  2. Redis lock "rebuild:pdp:sku_123" (SET NX EX 5)
  3. Winner rebuilds; losers wait 100ms → retry CDN
  4. Serve stale if rebuild slow (stale-while-revalidate)
```

### 2.2 Checkout saga compensation

```text
reserve OK → payment FAIL:
  → inventory.release(checkoutId)
  → checkout.status = FAILED
  → notify user

reserve OK → payment OK → order create FAIL (rare):
  → payment.refund()
  → inventory.release()
  → alert SEV-1 (money moved without order)
```

---

## 3. Observability architecture

```text
AKS (OpenTelemetry) → Application Insights + Log Analytics
                   → Azure Monitor Metrics
                   → Managed Grafana (funnel, sale dashboard)
                   → Alerts → PagerDuty / Teams
```

### 3.1 Required log fields

```json
{
  "timestamp": "2026-06-18T14:30:00Z",
  "service": "checkout-orchestrator",
  "traceId": "4bf92f3577b34da6",
  "correlationId": "corr_xyz",
  "checkoutId": "chk_789",
  "customerId": "cust_123",
  "orderId": "ord_001",
  "message": "Inventory reserved",
  "properties": { "skuCount": 3, "totalPaise": 7499900 }
}
```

### 3.2 Business funnel metrics

```text
view_pdp → add_to_cart → checkout_start → inventory_reserved
  → payment_initiated → payment_success → order_placed
```

Dashboard dimensions: `skuId` (sale SKUs), `region`, `paymentMethod`, `saleId`.

**Diagnostic example:** Drop at `payment_initiated → payment_success` with stable upstream → PSP or UPI network issue, not inventory.

### 3.3 Sale-event war room dashboard

| Panel | Metric |
|-------|--------|
| Live GMV | `order_placed` sum `totalPaise` / minute |
| CDN hit rate | PDP cache hits % |
| Checkout queue depth | Token queue length |
| Stock remaining | Redis `stock:sale_sku:*` |
| Payment success rate | By method (UPI vs card) |
| Origin 5xx | By service |

---

## 4. Alert catalog

| Alert | Condition | Severity | Runbook |
|-------|-----------|----------|---------|
| `Checkout5xxHigh` | 5xx > 1% 3 min | SEV-1 | RB-001 |
| `PaymentSuccessDrop` | Success < 95% 5 min | SEV-1 | RB-002 |
| `InventoryMismatch` | Audit delta > threshold | SEV-1 | RB-003 |
| `SearchIndexLag` | Lag > 10 min | SEV-2 | RB-004 |
| `CDNHitRateLow` | PDP hit < 80% during sale | SEV-2 | RB-005 |
| `RedisStockLatency` | p99 > 10ms | SEV-2 | RB-006 |
| `OrderDLQ` | DLQ > 0 | SEV-2 | RB-007 |
| `PSPCircuitOpen` | Circuit open > 2 min | SEV-2 | RB-002 |

---

## 5. Operational runbooks

### RB-001 — Checkout failure spike

```text
1. App Insights → failures on checkout-orchestrator, payment-service
2. Check Redis connectivity (reservation failures?)
3. Check Inventory Service error rate (OUT_OF_STOCK storm vs bug)
4. Check APIM 429 rate (load shedding active?)
5. Scale checkout namespace pods
6. Status page if SEV-1 > 5 min during sale
```

### RB-002 — Payment gateway degradation

```text
1. PSP status page + webhook error rate
2. Payment Service circuit breaker state
3. Enable backup PSP route if configured (ADR)
4. Extend inventory reservation TTL if payments slow
5. Comms: "UPI delays — your order is safe if money debited"
```

### RB-003 — Inventory oversell suspected

```text
1. Compare Redis stock counters vs SQL audit sum
2. Halt flash SKU sales via App Configuration kill switch
3. Identify checkoutIds that confirmed without valid reservation
4. Manual order cancellation + refund for affected customers
5. Postmortem: race condition or bypass of reserve API?
```

### RB-004 — Search index stale

```text
1. catalog-events subscription lag
2. Indexer errors in AI Search portal
3. Replay catalog-events from checkpoint
4. Temporary: boost cached PDP for affected SKUs
```

### RB-005 — CDN hit rate collapse (sale)

```text
1. Verify cache headers on BFF PDP response
2. Check if query-string cache busting (remove unnecessary params)
3. Purge + pre-warm top SKUs
4. Increase CDN TTL temporarily (product approval)
```

### RB-006 — Redis cluster issues

```text
1. Azure portal → Redis metrics (connections, memory, ops/sec)
2. Failover event? Brief reservation failures expected
3. Scale cluster if memory > 80%
4. Inventory Service: verify DECRBY errors not causing false OOS
```

### RB-007 — Order event DLQ

```text
1. Inspect DLQ messages (fulfillment vs notification)
2. Fix root cause (schema change, downstream timeout)
3. Replay with idempotency check on orderId
4. Verify no duplicate shipments
```

---

## 6. Load and chaos testing

| Test | Scenario | Pass criteria |
|------|----------|---------------|
| LOAD-001 | 500K search QPS synthetic | p99 < 250ms |
| LOAD-002 | 14 orders/sec checkout sustained | No oversell |
| LOAD-003 | 1M users PDP same SKU (CDN) | Origin < 10% traffic |
| CHAOS-001 | Kill payment pod mid-saga | Compensation releases stock |
| CHAOS-002 | Redis failover | < 30s reservation errors only |
| CHAOS-003 | PSP 503 | Circuit opens; user sees retry |

**Sale rehearsal:** Full dress rehearsal T-7 days — pre-scale, simulate 30% expected peak, run FL-012 token queue.

---

## 7. Disaster recovery

| Tier | RPO | RTO |
|------|-----|-----|
| Orders in flight | 0 | < 15 min (Cosmos failover) |
| Payment ledger | 0 | < 15 min (SQL failover) |
| Search index | 1 hour | < 4 hours (reindex) |
| CDN config | 0 | < 5 min (Front Door) |

Quarterly DR drill: failover South India → Central India read path; verify checkout completes.

---

## 8. Incident management

| Role | Responsibility |
|------|----------------|
| Incident Commander | Coordination, escalation |
| Tech Lead | Root cause, fix path |
| Comms | Status page, social, seller notify |
| Scribe | Timeline for postmortem |

**Sale event:** Dedicated war room with predefined roster; 15-minute checkpoint cadence.

Blameless postmortem within 5 business days for SEV-1/2. Action items tracked to closure.

---

## 9. Related documents

| ID | Title |
|----|-------|
| ARCH-ECOM-001 | Architecture Design Document |
| ARCH-ECOM-002 | Services and Data Architecture |
| ARCH-ECOM-003 | Request Lifecycle and Integration Flows |
| ARCH-ECOM-004 | Azure Infrastructure Design |
