# Redis Basics

## Questions Covered

1. What is Redis, and when should you use it?
2. How does Redis compare to Memcached and in-memory caches?
3. Is Redis a database or a cache?
4. What are Redis deployment modes (standalone, sentinel, cluster)?
5. What is Redis persistence (RDB vs AOF)?
6. What are Redis eviction policies?
7. What is TTL, and how do you set key expiration?
8. What are common Redis use cases in web applications?
9. How does Redis fit in a .NET microservices architecture?
10. What is Redis Cloud vs self-hosted Redis?
11. What are Redis security basics?
12. What are Redis performance characteristics?

## What is Redis, and when should you use it?

**Redis** (Remote Dictionary Server) is an **in-memory data structure server**. Data lives in RAM, so reads and writes are extremely fast — typically sub-millisecond. Redis is not just a key-value cache; it supports lists, sets, sorted sets, streams, pub/sub, and more.

In a typical web stack, Redis sits **between your app and the database** — holding hot data so SQL/MongoDB isn't hit on every request:

```text
Browser → API (3 instances behind load balancer)
              ↓
         Redis (shared cache, sessions, rate limits)
              ↓
         PostgreSQL / SQL Server (source of truth)
```

| Use Redis when | Avoid Redis when |
|----------------|------------------|
| You need **sub-ms reads** for hot paths | Data must survive as **only copy** with no backup plan |
| Multiple app instances need **shared state** | Dataset is **larger than RAM** |
| You need counters, leaderboards, pub/sub, locks | You need **complex joins** or ACID across many entities |
| You want to **protect the database** from read spikes | Simple single-instance app with `IMemoryCache` is enough |

**Interview one-liner:** Redis trades **durability and query flexibility** for **speed and simple data structures**. The database remains authoritative; Redis accelerates access.

## How does Redis compare to Memcached and in-memory caches?

Teams often ask "why Redis instead of Memcached or `IMemoryCache`?"

| Feature | Redis | Memcached | IMemoryCache (.NET) |
|---------|-------|-----------|---------------------|
| **Data structures** | Strings, hashes, lists, sets, ZSET, streams | Strings only | .NET objects in process |
| **Persistence** | Optional RDB/AOF | None | None |
| **Pub/sub** | ✓ | ✗ | ✗ |
| **Multi-instance sharing** | ✓ (one Redis cluster) | ✓ | ✗ (per process only) |
| **Clustering / HA** | Sentinel, Redis Cluster | Client-side sharding | N/A |
| **Typical latency** | ~0.1–1 ms (network) | Similar | ~μs (in-process) |

**Decision guide:**
- **`IMemoryCache`** — per-server cache, no network hop; invalidation doesn't sync across instances.
- **Memcached** — simple string cache at scale; no persistence, no rich types.
- **Redis** — default choice when you need **shared cache + sessions + rate limiting + pub/sub** in one service.

Most .NET full-stack interviews expect **Redis + StackExchange.Redis**, not Memcached.

## Is Redis a database or a cache?

**Both** — depending on how you configure and use it:

| Mode | Role | Durability expectation |
|------|------|------------------------|
| **Cache-aside** | Speed layer; SQL/ Mongo is truth | Keys can evict; OK to lose |
| **Session store** | User session blobs with TTL | Recreate session on loss (re-login) |
| **Primary store** | Main data store (Redis Stack, counters) | Enable AOF + replication |

```text
Cache:     "If Redis dies, app is slower until cache rebuilds — acceptable"
Database:  "If Redis dies without backup, data is lost — unacceptable unless designed for it"
```

**Default mindset:** Treat Redis as **volatile**. Enable persistence and replication only when business requirements demand it (e.g. job queues you can't replay easily). Never store the **only copy** of financial records in Redis without backup strategy.

## What are Redis deployment modes (standalone, sentinel, cluster)?

How you run Redis depends on **availability** and **data size** needs:

| Mode | HA (failover) | Sharding | Typical use |
|------|---------------|----------|-------------|
| **Standalone** | None — single point of failure | No | Dev, low-traffic prod with quick restore |
| **Sentinel** | Auto promote replica to master | No (one master) | Prod HA without sharding |
| **Cluster** | Failover + data partitioned | 16,384 hash slots | Large datasets, horizontal scale |

```text
Standalone:     [ Redis ]

Sentinel:       [ Master ] ←→ [ Replica ]
                 ↑ monitored by 3+ Sentinel processes (quorum failover)

Cluster:        [ Master A ] [ Master B ] [ Master C ]
                 ↓ replica    ↓ replica    ↓ replica
                Client routes key → slot → node
```

**Managed cloud (recommended for prod):**
- **Azure Cache for Redis** — Basic/Standard/Premium/Enterprise tiers
- **AWS ElastiCache** — Redis or Memcached-compatible
- **GCP Memorystore for Redis**

Premium/Enterprise tiers add **clustering, persistence, VNet isolation, Entra ID auth** (Azure).

## What is Redis persistence (RDB vs AOF)?

Redis is in-memory, but can **persist to disk** for recovery after restart:

| Type | How it works | Recovery | Data loss risk |
|------|--------------|----------|----------------|
| **RDB (snapshot)** | Periodic point-in-time dump | Fast startup | Last few minutes between snapshots |
| **AOF (append-only file)** | Logs every write command | Slower restart | Minimal if `appendfsync everysec` |
| **RDB + AOF** | Both enabled | Balanced | Production compromise |

```conf
# redis.conf examples
save 900 1              # RDB: snapshot if ≥1 key changed in 15 min
save 300 10
appendonly yes          # AOF on
appendfsync everysec    # fsync every second (balance safety/speed)
```

**Pure cache:** Disable persistence — faster, and you rebuild from DB on restart anyway.

**Sessions / queues:** Consider AOF or accept re-login / replay from broker on failure.

## What are Redis eviction policies?

When Redis hits **`maxmemory`**, it must free space. Eviction policy decides **which keys to remove**:

| Policy | Behavior | Best for |
|--------|----------|----------|
| **noeviction** | Return errors on new writes | When you must never silently lose data |
| **allkeys-lru** | Evict any key — approx LRU | General-purpose cache |
| **volatile-lru** | Evict only keys **with TTL** | Cache where non-TTL keys are permanent config |
| **allkeys-lfu** | Evict least frequently used | Hot-key heavy workloads |
| **volatile-ttl** | Evict keys with shortest TTL first | Mixed TTL workloads |

```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**Cache-aside best practice:** Set **TTL on every cache key** + use `allkeys-lru` or `volatile-lru`. Monitor **evicted_keys** metric — high eviction rate means undersized memory or TTL too long.

## What is TTL, and how do you set key expiration?

**TTL (Time To Live)** auto-deletes keys — essential for cache and sessions:

```bash
SET session:abc "data" EX 3600          # expires in 3600 seconds
SETEX user:42 300 "{\"name\":\"Ada\"}"  # set + expire in one command
EXPIRE product:99 600                   # add expiry to existing key
TTL product:99                          # seconds remaining (-1 = no expiry, -2 = missing)
PERSIST product:99                      # remove expiry
```

**Why TTL matters:**
- Prevents **memory leaks** from forgotten keys
- Makes **stale data** self-healing (re-fetch from DB after expiry)
- Bounds **session lifetime** without manual cleanup jobs

Add **random jitter** to TTL in app code so thousands of keys don't expire in the same second (cache stampede — see Caching Patterns doc).

## What are common Redis use cases in web applications?

| Use case | Redis feature | Example key |
|----------|---------------|-------------|
| **API / page cache** | String (JSON) | `product:42` |
| **User session** | Hash + TTL | `session:{sessionId}` |
| **Rate limiting** | INCR + EXPIRE or ZSET | `ratelimit:user:42:{window}` |
| **Leaderboard** | Sorted set | `game:leaderboard:2025` |
| **Real-time notifications** | Pub/sub or Streams | channel `notifications` |
| **Distributed lock** | SET NX EX | `lock:order:99` |
| **Background job queue** | List or Stream | `queue:email` |
| **OTP / verification codes** | String + short TTL | `otp:+15551234567` |

Pick the **simplest structure** that fits — don't store everything as JSON strings if a hash or counter is cleaner.

## How does Redis fit in a .NET microservices architecture?

In microservices, Redis is **shared infrastructure** — not owned by one service's database:

```text
                    ┌─────────────┐
  API Gateway ─────►│  Service A  │──┐
                    └─────────────┘  │
                    ┌─────────────┐  ├──► Redis (cache, locks, rate limit)
                    │  Service B  │──┤
                    └─────────────┘  │
                    ┌─────────────┐  │
                    │  Service C  │──┘
                    └─────────────┘
                           ↓
                    SQL / MongoDB (per service)
```

| Pattern | Redis role | Not Redis |
|---------|------------|-----------|
| **Cache-aside** | Reduce DB read load | — |
| **Rate limit at gateway** | Token bucket per client IP/user | — |
| **SignalR backplane** | Pub/sub across web servers | — |
| **Cross-service workflow** | — | Use Service Bus, RabbitMQ, Kafka |
| **Domain events (durable)** | — | Redis pub/sub is fire-and-forget |

**Rule:** Each service caches **its own aggregates** (`order:123` in Order Service). Don't share cache keys that encode another service's internal DB schema — that couples services.

## What is Redis Cloud vs self-hosted Redis?

| | **Managed (Azure/AWS/GCP)** | **Self-hosted on VM/K8s** |
|--|----------------------------|---------------------------|
| **Operations** | Patching, failover, backups managed | You run redis-server, monitor, upgrade |
| **Networking** | Private Link / VNet integration | Full control |
| **Features** | Tier-gated (cluster, modules, geo-replication) | Any Redis version/modules |
| **Cost** | Per GB-hour + tier fee | VM cost + your on-call time |
| **Interview default** | "We use Azure Cache for Redis in prod" | Labs, cost-sensitive, special modules |

**When self-host:** Need bleeding-edge modules, air-gapped environment, or already operating K8s operators (Redis Operator) at scale.

## What are Redis security basics?

Redis defaults are **not production-safe** — bind to all interfaces, no auth in old setups. Harden before exposing:

| Practice | Detail |
|----------|--------|
| **AUTH password or ACL users** | Separate users for app (read/write) vs admin |
| **TLS in transit** | Port 6380 on Azure; `ssl=True` in connection string |
| **Private network** | VNet injection — no public Redis endpoint |
| **Disable/rename dangerous commands** | `FLUSHALL`, `CONFIG`, `DEBUG` |
| **Don't store passwords in Redis** | Store session **IDs**; secrets stay in Key Vault |
| **Least privilege ACL** | App user can't run admin commands |

```conf
requirepass <strong-secret>       # or use ACL in Redis 6+
rename-command FLUSHALL ""
rename-command CONFIG ""
```

**Azure Cache for Redis:** Firewall rules, private endpoint, Microsoft Entra authentication on supported tiers.

## What are Redis performance characteristics?

| Metric | Typical (single node) | Notes |
|--------|----------------------|-------|
| **Latency** | 0.1–1 ms LAN | Cross-region adds RTT |
| **Throughput** | 100k+ ops/sec | Depends on command complexity |
| **Memory** | All data in RAM | Plan headroom for fragmentation (~1.5× raw data) |

**Performance killers:**

| Anti-pattern | Fix |
|--------------|-----|
| `KEYS *` in production | `SCAN` with cursor |
| Huge values (multi-MB JSON) | Split keys, compress, or don't cache |
| `HGETALL` on massive hashes | `HSCAN` or fetch fields individually |
| No connection pooling | Singleton `ConnectionMultiplexer` (.NET) |
| Hot keys on single slot (Cluster) | Hash tag spread or replicate read pattern |

Monitor: **used_memory**, **evicted_keys**, **connected_clients**, **replication lag**, **slowlog**.

## Related Topics

- Redis/Redis Data Structures and Commands.md
- Redis/Redis Caching Patterns.md
- Redis/Redis with .NET and Node.js.md
- Microservices/Microservices Data Replication, Sharding, and Distributed Caching.md
