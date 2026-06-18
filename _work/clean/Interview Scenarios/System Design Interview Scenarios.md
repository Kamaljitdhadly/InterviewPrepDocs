# System Design Interview Scenarios

## Questions Covered

1. Design logout for 50M users on mobile — JWT, no sticky sessions. Architecture?
2. Viral product drops — cache stampede collapses DB. Walk through fix live.
3. URL shortener at 10k creates/sec — how do you avoid collision without global lock?
4. Rate limit 100 req/min per user globally across 20 regions. Approach?
5. Celebrity posts to 10M followers — fanout on write vs read. Trade-off at scale?
6. Active-active multi-region cart — user adds item in US and EU simultaneously. Merge?
7. Message queue lag growing 1M/min — consumers healthy. What do you check first?
8. Payment succeeds, order DB write fails — how does system reconcile?
9. Design "who's online" presence for 5M concurrent WebSocket users.
10. Search autocomplete < 50ms — data changes every second. Stack?
11. File upload 5GB — API gateway timeout 60s. Design end-to-end.
12. Blue-green deploy with DB migration — zero downtime checklist?

## Design logout for 50M users — JWT, no sticky sessions?

**Scenario:** Mobile + web, stateless API fleet, JWT access token 15 min, refresh 30 days.

```text
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│ Client  │────►│ Auth Service │────►│ Redis/DB    │
└─────────┘     └──────────────┘     │ refresh store│
       │                │             │ jti blocklist│
       │  access JWT    │             └─────────────┘
       │  (short)       │ revoke refresh + optional jti
       └────────────────┘
```

| Component | Role |
|-----------|------|
| **Access JWT** | Short TTL; crypto validation only |
| **Refresh token** | HttpOnly cookie or secure storage; hashed at rest |
| **Logout API** | Revoke refresh family; add `jti` to Redis until `exp` |
| **Forced logout** | Bump `auth_version` claim on user record |

**Scale:** Redis SET for blocklist with TTL = remaining token life — memory bounded.

**90% miss:** "Delete token on client" is not logout at scale.

## Viral product drops — cache stampede collapses DB?

**Scenario:** Flash sale 12:00:00 — 500k users hit product `SKU-42`; cache expires together; DB dies.

**Layered defense:**

```text
1. CDN edge cache product page (static shell)
2. Redis cache-aside with TTL jitter + stale-while-revalidate
3. Single-flight lock: only ONE request rebuilds cache per key
4. Pre-warm cache before sale
5. Queue checkout requests (token bucket) — accept wait page
6. Read replica for product reads; primary for orders only
```

```text
Request → CDN hit? return
        → Redis hit? return (even if stale, async refresh)
        → Acquire lock "rebuild:sku-42"
              → winner loads DB, sets cache
              → losers wait 50ms, retry Redis
```

## URL shortener 10k creates/sec — collision?

**Scenario:** `hash(url)` → base62 — birthday collision at scale.

| Approach | Detail |
|----------|--------|
| **Snowflake IDs** | 64-bit unique, encode base62 |
| **Counter + base62** | Single allocator (Redis INCR / DB sequence) |
| **Pre-generated pool** | Workers fill pool of available codes |
| **Collision retry** | Only if hash-based — not primary at 10k/s |

**Read path:** Redis cache `short → long`; CDN 301 redirect; analytics async via queue.

## Rate limit 100 req/min per user across 20 regions?

**Problem:** Local in-memory counters → 20 × 100 = 2000 effective limit.

**Solutions:**

| Approach | Trade-off |
|----------|-----------|
| **Central Redis** | Cross-region latency; single point (cluster) |
| **CRDT / GCRA in Redis** | Accurate global |
| **Approximate per region** | 100/20 = 5 per region (unfair) |
| **Cell-based** | User pinned to region |

```text
Edge → API Gateway → Redis Cluster (global or per-region sync)
Token bucket key: ratelimit:{userId}:{minute_window}
```

## Celebrity 10M followers — fanout on write vs read?

| | **Fanout on write** | **Fanout on read** |
|--|---------------------|---------------------|
| **Idea** | Precompute timeline at post time | Merge follows at read |
| **Celebrity post** | 10M writes — bad | 1 write — good |
| **Normal user read** | Fast read | Slower read |
| **Hybrid** | Fanout write for normal; celebrity = pull merge |

**Production:** Twitter-style hybrid — identify high-out-degree users, treat differently.

## Active-active cart — US and EU simultaneous edit?

**Scenario:** User offline on plane; edits cart on phone (US); tablet (EU proxy) adds item — merge conflict.

| Strategy | UX |
|----------|-----|
| **Last-write-wins (timestamp)** | Loses item silently — bad |
| **Version vector / cart revision** | Reject stale write, show merge UI |
| **CRDT cart** | Math merge — rare in commerce |
| **Single writer session** | Session stickiness + revision check |

Checkout always re-validates price/stock server-side — cart is hint only.

## Queue lag growing 1M/min — consumers healthy?

**Checklist (order matters):**

```text
1. Producer rate spike? (deploy bug, retry storm)
2. Message size exploded? (blob in message)
3. Poison message — consumer crash loop?
4. Downstream DB slow — consumer threads blocked?
5. Partition count << consumer count — idle consumers?
6. Hot partition — one key dominates?
7. Network / broker disk full?
```

**Fix:** Scale consumers (if partitions allow), fix poison DLQ, backpressure producer, add replicas, temporary bypass for non-critical events.

## Payment succeeds, order DB write fails?

**Scenario:** Charge card OK; `INSERT Order` disk full — money taken, no order.

**Requires reconciliation:**

```text
1. Idempotent payment id stored BEFORE charge attempt
2. Outbox: PaymentCaptured event even if order insert fails
3. Reconciliation job: payments without orders → alert + auto-refund or complete order
4. Never "fire and forget" payment without durable local state
```

**Interview:** This is **distributed transaction** problem — saga + compensating refund + human ops dashboard.

## Who's online — 5M concurrent WebSocket?

```text
Clients ──WS──► Gateway fleet (stateless)
                    │
                    ├── Redis Pub/Sub or dedicated presence service
                    │   key: user:{id} → gateway instance, last_seen
                    └── Heartbeat every 30s; TTL 60s = offline
```

**Tricky:** Gateway crash — stale online until TTL. **Graceful:** connection events to presence service.

Don't store 5M sockets in one server — horizontal gateway + shared presence store.

## Autocomplete < 50ms — data changes every second?

| Layer | Role |
|-------|------|
| **Trie / prefix index** | In-memory per shard or Elasticsearch completion suggester |
| **CDN** | Not for personalized autocomplete |
| **Delta stream** | Update trie incrementally from Kafka |
| **Debounce client** | 150ms — reduces QPS |

Stale suggestions for 1–2 seconds usually acceptable vs wrong results.

## File upload 5GB — gateway timeout 60s?

```text
Client → POST /uploads/init → presigned URL (S3/Blob)
       → PUT chunks directly to object storage (multipart)
       → POST /uploads/complete → virus scan queue → metadata DB
```

Never stream 5GB through API server or 60s gateway. **Presigned URLs + multipart upload.**

## Blue-green deploy + DB migration — zero downtime?

```text
Phase 1: Migration ADD nullable column (both versions OK)
Phase 2: Deploy GREEN code writing new column
Phase 3: Backfill
Phase 4: Deploy GREEN read-only new column
Phase 5: Migration DROP old column (remove BLUE)
```

**Switch traffic** only when both schema and code compatible. **Rollback** = switch back to BLUE if schema still compatible.

## Related Topics

- System Design/System Design Basics.md
- System Design/System Design CAP Theorem.md
- Interview Scenarios/Microservices Interview Scenarios.md
- Redis/Redis Caching Patterns.md
- Important Concepts/Interview Comparisons.md
