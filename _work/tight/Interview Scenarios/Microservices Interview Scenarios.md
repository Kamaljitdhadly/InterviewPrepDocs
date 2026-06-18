# Microservices Interview Scenarios

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

**Scenario:** Create Order (OK) → Reserve Inventory (OK) → Charge Payment (FAIL).

**Must run compensating transactions:**

```text
Forward:  CreateOrder → ReserveStock → ChargePayment
Backward:  (fail) → ReleaseStock → CancelOrder
```

**Tricky part:** ReleaseStock fails (network). Compensation must be **retryable** and **idempotent**.

```csharp
public async Task CompensateReserveAsync(Guid reservationId, string idempotencyKey)
{
    // Safe to call multiple times
    await _inventory.ReleaseAsync(reservationId, idempotencyKey);
}
```

**90% miss:** Compensation is not automatic rollback — it's **new business logic** with failure modes. Use **orchestrator** (explicit) vs **choreography** (events) trade-off.

| Pattern | Pros | Cons |
|---------|------|------|
| **Orchestration** | Clear flow, easier debug | Orchestrator is coupling point |
| **Choreography** | Loose coupling | Hard to see full saga state |

## Same payment webhook delivered twice — customer charged once or twice?

**Scenario:** Stripe sends `payment_intent.succeeded` twice; two workers process.

**Fix:** Idempotency on `payment_intent.id`:

```sql
INSERT INTO ProcessedWebhooks (ProviderId, EventId, ProcessedAt)
VALUES ('stripe', @eventId, SYSUTCDATETIME());
-- Unique constraint on (ProviderId, EventId) — second insert fails, skip charge
```

Without this — **double ship**, **double charge**, angry customer.

## Circuit breaker opens — 1000 requests hit half-open at once?

**Scenario:** Polly half-open allows one trial; misconfig allows all waiting threads through → downstream dies again.

**Fix:** Single trial request, bulkhead isolation, jittered retry, queue-based load leveling.

```csharp
Policy.Handle<HttpRequestException>()
    .CircuitBreakerAsync(5, TimeSpan.FromSeconds(30));
// Ensure half-open doesn't stampede — library-specific settings
```

## Service A calls B, C, D — B is down. Partial or fail?

**Scenario:** Product page needs price (B), stock (C), reviews (D).

| Strategy | UX |
|----------|-----|
| **Fail entire page** | Bad — 503 on missing reviews |
| **Degrade gracefully** | Show product without reviews section |
| **Cached fallback** | Stale stock with disclaimer |
| **Timeout budget** | 200ms max per dependency |

```csharp
var reviews = await _reviews.GetAsync(id)
    .OrDefaultAsync(Array.Empty<Review>(), TimeSpan.FromMilliseconds(200));
```

**BFF pattern** — aggregate with per-call timeout and fallback.

## Outbox published event twice after DB crash?

**Scenario:** Transaction commits order + outbox row; crash before broker ACK; relay republishes same `OutboxId`.

**Consumer must dedupe** on `MessageId` / `OutboxId` — at-least-once delivery is assumed.

```text
Producer: at-least-once
Consumer: idempotent or exactly-once effect
```

## JWT service-to-service — Service B trusts User X claim?

**Scenario:** Service A forwards user's JWT to B. Attacker calls B directly with forged JWT.

**Fixes:**

| Approach | Detail |
|----------|--------|
| **mTLS between services** | Network identity |
| **OAuth client credentials** | Service identity separate from user |
| **Token exchange** | Downscope token for B only |
| **User delegation token** | B validates original JWT + audience |

Never trust `X-User-Id` header without cryptographic proof.

## Distributed trace gap — message consumed, no child span?

**Causes:** Consumer doesn't extract `traceparent` from message headers; new trace starts orphaned.

```csharp
// Propagate W3C trace context in message headers
activity.InjectPropagationContext(message.Headers);
```

Without propagation — impossible to debug cross-service latency in prod.

## K8s rollout — mixed v1/v2 event schema?

**Scenario:** v2 adds required field `currency`; v1 consumers deserialize fail.

**Fix:** **Expand-contract** events — optional field first, dual publishing, schema registry (Avro/Protobuf), feature flags.

## Cache invalidation event lost — stale price 10 min?

**Scenario:** Redis cache TTL 10 min; price update event dropped from bus.

**Fix:** TTL as safety net + **version in cache key** + event replay + max stale age for commerce (reject if `priceVersion` mismatch at checkout).

## Kafka for everything — order placement fails?

**Scenario:** Synchronous user waiting for "Order placed" — choreographed Kafka saga takes 8 seconds; user refreshes and double-submits.

**Kafka good for:** Event log, analytics, async notifications.

**Bad for:** User-facing sync request/response without UX for async completion (polling, websocket, email).

Use **sync API** for commit point + **async** for downstream (email, warehouse).

## API gateway timeout 30s — saga needs 2 min?

**Scenario:** Gateway returns 504; client retries; second saga starts — duplicate order risk.

**Fix:** Return `202 Accepted` + `orderId` + status URL immediately; saga runs async; idempotency key on client retry.

```http
HTTP/1.1 202 Accepted
Location: /orders/status/abc-123
```

## Database per service — cross-service report?

**Scenario:** CFO wants "customers with unpaid orders" — no cross-DB join allowed.

| Pattern | Use |
|---------|-----|
| **Read model / CQRS** | Denormalized projection fed by events |
| **Data warehouse** | ETL to Snowflake/BigQuery |
| **API composition** | Slow, not for big reports |
| **Saga query API** | Materialized view service |

Violating service boundaries with "just one shared read DB" — defeats microservices.

## Related Topics

- Microservices/Microservices Distributed Transactions.md
- Microservices/Microservices Communication.md
- Interview Scenarios/System Design Interview Scenarios.md
- Interview Scenarios/JavaScript Interview Scenarios.md
