# System Design Interview Scenarios

**What this is:** Senior-level system design questions framed as **production incidents** or **scale constraints** — not "draw a URL shortener box diagram." Each scenario assumes you know basics (load balancers, caches, queues) and tests whether you can reason about **failure modes, trade-offs, and operational reality**.

**How interviewers use these:** They describe a symptom ("DB died at flash sale") and watch whether you jump to solutions or first clarify scale, SLOs, and constraints. Strong answers name **what breaks at scale**, **how you'd fix it live**, and **what a naive fix makes worse**.

**How to study:** Pause on each question, outline: constraints → bottleneck → layered fix → how you validate. Pair with Microservices Interview Scenarios for distributed-system traps.

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

**Context:** Mobile and web clients talk to a **stateless API fleet** behind a global load balancer — no sticky sessions. Auth uses a 15-minute access JWT and a 30-day refresh token. The interviewer wants to know whether you understand that **JWT logout is not "delete the token."**

**What trips people up:** Saying "remove JWT from localStorage" or "maintain a server session table for every user" (doesn't scale with stateless JWT at 50M users without a plan).

**Architecture:**

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
| **Access JWT** | Short TTL; validated cryptographically only — no DB hit per request if you accept brief exposure |
| **Refresh token** | HttpOnly cookie or secure mobile storage; **hashed** at rest in DB/Redis |
| **Logout API** | Revokes refresh token family; optionally adds access token `jti` to blocklist until `exp` |
| **Forced logout** | Bump `auth_version` (or similar) on user record; API rejects tokens with old version |

**Scale note:** Blocklist entries in Redis use TTL = remaining token life — memory is bounded; you are not storing 50M users forever, only active revoked tokens until they would have expired anyway.

**Strong close:** "Client discard is UX; security is server-side refresh revocation plus optional short-lived access tokens and `jti` blocklist. Forced logout uses a version claim or key rotation for breach response."

## Viral product drops — cache stampede collapses DB?

**Context:** A flash sale starts at 12:00:00. Five hundred thousand users hit product `SKU-42` within seconds. Cache entries for that key **expire at the same moment** (or cold cache on first request). Every request misses cache and hits the database — classic **cache stampede** (thundering herd).

**What trips people up:** "Add more DB replicas" without single-flight or request shaping — replicas still melt under identical heavy queries.

**Layered defense (apply in order):**

```text
1. CDN edge cache product page (static shell)
2. Redis cache-aside with TTL jitter + stale-while-revalidate
3. Single-flight lock: only ONE request rebuilds cache per key
4. Pre-warm cache before sale
5. Queue checkout requests (token bucket) — accept wait page
6. Read replica for product reads; primary for orders only
```

**Request path:**

```text
Request → CDN hit? return
        → Redis hit? return (even if stale, async refresh)
        → Acquire lock "rebuild:sku-42"
              → winner loads DB, sets cache
              → losers wait 50ms, retry Redis
```

**Why stale-while-revalidate helps:** Users see slightly stale stock count for a second while one worker refreshes — better than 503 for everyone.

**Strong close:** "Stampede is a coordination problem, not just a capacity problem — single-flight, jittered TTL, pre-warm, and checkout throttling together."

## URL shortener 10k creates/sec — collision?

**Context:** At 10k creates per second, `hash(url) → base62` runs into **birthday paradox** collisions. A global lock on "check then insert" becomes the bottleneck.

**What trips people up:** Relying on retry-on-collision with hash-only IDs at this throughput without measuring collision rate or lock contention.

| Approach | Detail |
|----------|--------|
| **Snowflake IDs** | 64-bit unique ID from timestamp + machine + sequence; encode base62 for short URL |
| **Counter + base62** | Single allocator (Redis `INCR` or DB sequence) — predictable, no collision |
| **Pre-generated pool** | Background workers fill a pool of available codes; API pops from pool |
| **Collision retry** | Only if hash-based — acceptable at low QPS, not primary at 10k/s |

**Read path:** Redis cache `short → long`; CDN 301 redirect; analytics async via queue so writes don't slow redirects.

**Strong close:** "Uniqueness is an allocation problem — Snowflake or centralized counter beats hash-and-pray at this scale."

## Rate limit 100 req/min per user across 20 regions?

**Context:** Product rule: each user gets 100 requests per minute **globally**. You deploy API in 20 regions with in-memory counters — each region allows 100, so power users get 2000.

**What trips people up:** "Sync counters eventually" without defining accuracy vs latency trade-off.

| Approach | Trade-off |
|----------|-----------|
| **Central Redis** | Accurate global count; cross-region latency on every request |
| **GCRA / token bucket in Redis Cluster** | Standard algorithm; replicate or use global cluster |
| **Approximate per region** | 100÷20 = 5 per region — simple but unfair (traveling users) |
| **Cell-based routing** | Pin user to home region; limit locally — works if UX allows |

```text
Edge → API Gateway → Redis Cluster (global or per-region sync)
Token bucket key: ratelimit:{userId}:{minute_window}
```

**Strong close:** "Global limit needs shared state or accepted inaccuracy — document which you choose and why."

## Celebrity 10M followers — fanout on write vs read?

**Context:** Social feed design. A celebrity with 10M followers posts once. Do you push that post into 10M inbox rows at write time, or merge timelines at read time?

| | **Fanout on write** | **Fanout on read** |
|--|---------------------|---------------------|
| **Idea** | Precompute each follower's timeline when user posts | At read, merge posts from all followed users |
| **Celebrity post** | 10M writes — catastrophic | 1 write — ideal |
| **Normal user read** | Fast read (prebuilt feed) | Slower read (merge at query time) |
| **Hybrid** | Fanout write for users with &lt; N followers; celebrity posts fetched at read | Production pattern (Twitter/Instagram style) |

**What trips people up:** Picking one model for all users without identifying **high out-degree** accounts.

**Strong close:** "Hybrid by follower count — fanout on write for normal users, pull/merge for celebrities."

## Active-active cart — US and EU simultaneous edit?

**Context:** User's phone (US region) and tablet (EU region) both edit the cart while one device was offline. Both sync when connectivity returns — **conflict**.

**What trips people up:** "Last write wins by timestamp" without mentioning clock skew or silent item loss.

| Strategy | UX |
|----------|-----|
| **Last-write-wins (timestamp)** | Loses items silently — bad for commerce |
| **Version vector / cart revision** | Stale write rejected; show merge UI ("keep both?") |
| **CRDT cart** | Mathematical merge — rare in production commerce |
| **Single writer session** | Session stickiness + revision check on every update |

**Important:** Checkout always **re-validates price and stock server-side** — the cart is a hint, not a contract.

**Strong close:** "Expose conflicts to the user or use monotonic revisions; never silently drop line items."

## Queue lag growing 1M/min — consumers healthy?

**Context:** Kafka/RabbitMQ lag grows by a million messages per minute. Consumer pods report healthy CPU. This is a **diagnosis** question — order of checks matters.

**Checklist:**

```text
1. Producer rate spike? (deploy bug, retry storm, missing idempotency)
2. Message size exploded? (blob payload in message body)
3. Poison message — consumer crash loop on one bad payload?
4. Downstream DB slow — consumer threads blocked waiting?
5. Partition count << consumer count — extra consumers idle?
6. Hot partition — one key dominates (ordering bottleneck)?
7. Broker disk full / network saturation?
```

**Fix direction:** Scale consumers only if partitions allow; move poison to DLQ; backpressure producer; fix downstream; temporarily shed non-critical events.

**Strong close:** "Healthy consumers ≠ healthy pipeline — lag is producer rate minus effective consume rate; find the bottleneck before scaling."

## Payment succeeds, order DB write fails?

**Context:** Payment gateway returns success. Your `INSERT INTO Orders` fails (disk full, timeout, unique constraint). Customer is charged; no order exists — **split brain** between payment and order systems.

**What trips people up:** "Use a distributed transaction (2PC)" — most payment APIs don't participate in XA; sagas and reconciliation are the real answer.

**Requires reconciliation:**

```text
1. Store idempotent payment id BEFORE calling gateway
2. Outbox: PaymentCaptured event even if order insert fails
3. Reconciliation job: payments without orders → alert + auto-refund or complete order
4. Never fire-and-forget payment without durable local state
```

**Strong close:** "At-least-once payment + idempotency + reconciliation job — ops dashboard for orphans is mandatory."

## Who's online — 5M concurrent WebSocket?

**Context:** Chat or collaboration feature needs presence ("green dot"). Five million concurrent WebSocket connections — cannot run on one server.

```text
Clients ──WS──► Gateway fleet (stateless)
                    │
                    ├── Redis Pub/Sub or dedicated presence service
                    │   key: user:{id} → gateway instance, last_seen
                    └── Heartbeat every 30s; TTL 60s = offline
```

**Tricky details:** Gateway crash leaves stale "online" until TTL expires — send disconnect events to presence service on graceful shutdown.

**What trips people up:** Storing all socket state in one process or querying DB on every presence check.

**Strong close:** "Horizontal gateway fleet + shared presence store with heartbeat TTL; don't centralize 5M sockets."

## Autocomplete < 50ms — data changes every second?

**Context:** Search box must return suggestions in under 50ms while catalog updates every second (price, availability, new SKUs).

| Layer | Role |
|-------|------|
| **Trie / prefix index** | In-memory per shard or Elasticsearch completion suggester |
| **CDN** | Not useful for personalized autocomplete |
| **Delta stream** | Kafka updates trie incrementally — avoid full rebuild |
| **Client debounce** | 150ms debounce cuts QPS without hurting UX |

Stale suggestions for 1–2 seconds are usually acceptable; **wrong** suggestions (sold-out item) are not — version or filter at selection time.

**Strong close:** "Prefix index + incremental updates + debounce; accept brief staleness, not wrong results."

## File upload 5GB — gateway timeout 60s?

**Context:** User uploads a large video. API gateway times out at 60 seconds. Streaming 5GB through your API server wastes bandwidth and ties up workers.

**What trips people up:** "Chunked upload through API" without presigned direct-to-storage upload.

```text
Client → POST /uploads/init → presigned URL (S3/Blob)
       → PUT chunks directly to object storage (multipart)
       → POST /uploads/complete → virus scan queue → metadata DB
```

**Strong close:** "Presigned multipart upload to object storage; API only orchestrates metadata and completion."

## Blue-green deploy + DB migration — zero downtime?

**Context:** You switch traffic from blue to green API while also changing database schema. Old pods still run during rollout — **breaking schema change kills blue**.

**Expand-contract phases:**

```text
Phase 1: Migration ADD nullable column (both versions OK)
Phase 2: Deploy GREEN code writing new column
Phase 3: Backfill old rows
Phase 4: Deploy GREEN reading new column only
Phase 5: Migration DROP old column (decommission BLUE)
```

**Switch traffic** only when schema and code are compatible in both directions. **Rollback** = route back to blue if schema still supports old code.

**Strong close:** "Schema and code migrate in phases — never drop column while old code still reads it."

## Related Topics

- System Design/System Design Basics.md
- System Design/System Design CAP Theorem.md
- Interview Scenarios/Microservices Interview Scenarios.md
- Redis/Redis Caching Patterns.md
- Important Concepts/Interview Comparisons.md
