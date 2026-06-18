# Microservices Interview Scenarios

**What this is:** Distributed-system traps that only appear when services are **deployed separately** — sagas, duplicate events, partial failures, and trust boundaries. These are not "what is a microservice" questions; they assume you already split the monolith and now things break in production.

**Why interviewers ask:** They want evidence you've run (or debugged) real distributed flows — not just drawn boxes. Weak answers treat HTTP like an in-process call or assume "Kafka fixes it."

**How to study:** For each scenario, state: **delivery guarantee** (at-least-once?), **idempotency key**, **compensation path**, and **what the user sees** while async work runs.

## Questions Covered

1. Saga step 3 fails after step 1–2 committed — how do you compensate without double refund?
2. Same payment webhook delivered twice — customer charged once or twice?
3. Circuit breaker opens — 1000 requests hit half-open at once. What happens?
4. Service A calls B, C, D for dashboard — B is down. Return partial data or fail all?
5. Outbox published event twice after DB crash between commit and mark-sent. Impact?
6. JWT passed service-to-service — how does Service B know caller is allowed to act for User X?
7. Distributed trace shows gap — message consumed but no child span. Why?
8. Kubernetes rolls out v2 — mixed v1/v2 during deploy break event schema. Fix?
9. Cache invalidation event lost — users see stale price for 10 minutes. Architecture fix?
10. "We'll use Kafka for everything" — when does that fail for order placement?
11. API gateway timeout 30s — checkout saga needs 2 minutes. User experience?
12. Database per service — report needs join across Customer and Orders. Solution?

## Saga step 3 fails after step 1–2 committed — how do you compensate?

**Context:** Checkout saga: Create Order (OK) → Reserve Inventory (OK) → Charge Payment (FAIL). Steps 1 and 2 are already committed in their respective services. There is no automatic database rollback across services.

**What trips people up:** Assuming the transaction "rolls back" like a single DB transaction, or writing compensation that isn't **idempotent** (double refund on retry).

**Forward and backward flow:**

```text
Forward:  CreateOrder → ReserveStock → ChargePayment
Backward:  (fail) → ReleaseStock → CancelOrder
```

**Tricky part:** `ReleaseStock` fails (network timeout). Compensation must be **retryable** and **idempotent** — same `idempotencyKey` safe to call twice.

```csharp
public async Task CompensateReserveAsync(Guid reservationId, string idempotencyKey)
{
  // Safe to call multiple times — second call is no-op
  await _inventory.ReleaseAsync(reservationId, idempotencyKey);
}
```

| Pattern | Pros | Cons |
|---------|------|------|
| **Orchestration** | Clear flow, easier debug, central saga state | Orchestrator is coupling point; must be HA |
| **Choreography** | Loose coupling via events | Hard to see full saga state; debugging is harder |

**Strong close:** "Compensation is new business logic with its own failure modes — design idempotent undo steps and observable saga state."

## Same payment webhook delivered twice — customer charged once or twice?

**Context:** Stripe (or any provider) delivers `payment_intent.succeeded` **at least once**. Two workers process the same event — without deduplication you ship twice or record payment twice.

**What trips people up:** Checking "if order exists" in application code without a unique constraint — race condition allows two inserts.

**Fix:** Idempotency on provider event ID:

```sql
INSERT INTO ProcessedWebhooks (ProviderId, EventId, ProcessedAt)
VALUES ('stripe', @eventId, SYSUTCDATETIME());
-- Unique constraint on (ProviderId, EventId) — second insert fails, skip side effects
```

Process webhook inside a transaction: insert event ID first, then create order / mark paid.

**Strong close:** "Webhook handler is idempotent by unique event ID — assume duplicates, not exceptions."

## Circuit breaker opens — 1000 requests hit half-open at once?

**Context:** Service B is down; circuit breaker opens. When it transitions to **half-open**, many waiting requests try the downstream at once — if misconfigured, **all pass through** and kill B again (half-open stampede).

**What trips people up:** "Circuit breaker fixes resilience" without mentioning half-open probe count and bulkhead isolation.

**Fix:** Allow **one** trial request in half-open; use bulkhead to limit concurrent calls; jittered retry; queue-based load leveling for background work.

```csharp
Policy.Handle<HttpRequestException>()
    .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
// Configure half-open so only one probe runs — library-specific settings matter
```

**Strong close:** "Breaker protects downstream only if half-open doesn't admit a thundering herd."

## Service A calls B, C, D — B is down. Partial or fail?

**Context:** Product page aggregates price (B), stock (C), and reviews (D). Reviews service is down — should the whole page 503?

**What trips people up:** Failing the entire page when a non-critical dependency fails; or returning partial data without indicating staleness.

| Strategy | UX |
|----------|-----|
| **Fail entire page** | Bad — 503 because reviews are missing |
| **Degrade gracefully** | Show product without reviews section |
| **Cached fallback** | Stale stock with "may be outdated" disclaimer |
| **Timeout budget** | 200ms max per dependency; fail fast |

```csharp
var reviews = await _reviews.GetAsync(id)
    .OrDefaultAsync(Array.Empty<Review>(), TimeSpan.FromMilliseconds(200));
```

**BFF pattern** aggregates with per-call timeout, fallback, and circuit breaker — one place to enforce UX rules.

**Strong close:** "Define critical vs optional dependencies; BFF enforces timeouts and graceful degradation."

## Outbox published event twice after DB crash?

**Context:** Transactional outbox: order row and outbox row commit together. Relay reads outbox, publishes to broker, crashes **before** marking row sent. Relay restarts and republishes — **duplicate message**.

**What trips people up:** Expecting exactly-once delivery from the broker alone.

**Reality:**

```text
Producer: at-least-once delivery (assume duplicates)
Consumer: idempotent processing or exactly-once effect
```

Consumer dedupes on `MessageId` / `OutboxId` — store processed IDs with unique constraint.

**Strong close:** "Outbox gives reliable publish, not single delivery — consumers must be idempotent."

## JWT service-to-service — Service B trusts User X claim?

**Context:** Service A forwards the user's JWT to Service B in an internal call. Attacker calls B directly with a forged JWT or sends `X-User-Id: admin` without a token.

**What trips people up:** Trusting headers or user claims without validating audience, issuer, and service-to-service identity.

| Approach | Detail |
|----------|--------|
| **mTLS between services** | Network-layer service identity |
| **OAuth client credentials** | Service identity separate from end-user |
| **Token exchange (RFC 8693)** | Downscoped token for B only |
| **User delegation token** | B validates JWT signature, `aud`, `iss`, expiry |

Never trust `X-User-Id` without cryptographic proof.

**Strong close:** "User identity and service identity are different — B validates token or mTLS, not headers."

## Distributed trace gap — message consumed, no child span?

**Context:** Jaeger shows HTTP request into Service A, message published, then nothing under consumer Service B — looks like work vanished.

**Cause:** Consumer doesn't extract `traceparent` / `tracestate` from message headers — starts a **new root trace** instead of continuing the parent.

```csharp
// Propagate W3C trace context in message headers
activity.InjectPropagationContext(message.Headers);
```

**What trips people up:** "We have OpenTelemetry" without propagation on async boundaries (queues, background tasks).

**Strong close:** "Every async handoff must inject/extract trace context — gaps mean broken instrumentation, not missing work."

## K8s rollout — mixed v1/v2 event schema?

**Context:** During rolling deploy, v1 and v2 publishers and consumers run simultaneously. v2 adds required field `currency`; v1 consumers deserialize and **crash**.

**Fix:** **Expand-contract** for events: add optional field first → deploy consumers that tolerate both → deploy producers writing new field → make required → remove old.

Use schema registry (Avro/Protobuf with compatibility rules) or explicit `eventVersion` in payload.

**Strong close:** "Events are APIs — backward-compatible schema evolution like database expand-contract."

## Cache invalidation event lost — stale price 10 min?

**Context:** Price updated in DB; invalidation event dropped from message bus. Redis cache TTL is 10 minutes — users see wrong price at checkout.

**What trips people up:** "Cache invalidation is hard" with no safety net.

**Fix:** TTL as safety net + **version in cache key** (`price:v42`) + event replay + at checkout **re-fetch authoritative price** from DB/service if `priceVersion` mismatch.

**Strong close:** "Never trust cache as sole source for money — version check at commit point."

## Kafka for everything — order placement fails?

**Context:** Team routes "Place Order" through Kafka choreography. User clicks Buy, waits 8 seconds, sees spinner, refreshes, **double-submits**.

**What trips people up:** Using async messaging for synchronous user-facing commit without UX for async completion.

**Kafka good for:** Event log, analytics, notifications, downstream fulfillment.

**Bad for:** User waiting for definitive "order placed" without polling/WebSocket/email confirmation.

Use **sync API** for the commit point (order ID returned) + **async** for warehouse, email, analytics.

**Strong close:** "Sync boundary where the user needs an answer; async for everything after."

## API gateway timeout 30s — saga needs 2 min?

**Context:** Gateway returns 504 after 30s. Client retries checkout — second saga starts — **duplicate order** risk.

**Fix:** Return immediately with async handle:

```http
HTTP/1.1 202 Accepted
Location: /orders/status/abc-123
```

Saga runs in background; client polls or uses WebSocket. **Idempotency-Key** on original POST prevents duplicate sagas on retry.

**Strong close:** "202 + status URL + idempotency key — never let gateway timeout drive duplicate sagas."

## Database per service — cross-service report?

**Context:** CFO wants "customers with unpaid orders." No cross-database join allowed — each service owns its data.

**What trips people up:** "Shared read replica with views" — breaks service boundaries and coupling.

| Pattern | Use |
|---------|-----|
| **Read model / CQRS** | Denormalized projection fed by domain events |
| **Data warehouse** | ETL to Snowflake/BigQuery for analytics |
| **API composition** | OK for small datasets; slow at report scale |
| **Materialized view service** | Dedicated reporting bounded context |

**Strong close:** "Reporting is a first-class consumer of events — not an excuse to join databases."

## Related Topics

- Microservices/Microservices Distributed Transactions.md
- Microservices/Microservices Communication.md
- Interview Scenarios/System Design Interview Scenarios.md
- Interview Scenarios/JavaScript Interview Scenarios.md
