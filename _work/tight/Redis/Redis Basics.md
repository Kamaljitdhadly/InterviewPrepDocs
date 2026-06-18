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

**Redis** (Remote Dictionary Server) is an **in-memory data structure store** — cache, session store, pub/sub, rate limiter, leaderboard, distributed lock.

| Use Redis when | Avoid Redis when |
|----------------|------------------|
| Sub-millisecond reads needed | Primary source of truth without persistence plan |
| Shared cache across app instances | Data larger than RAM |
| Pub/sub, streams for events | Complex relational queries |
| RateLimiting, leaderboards | Strong ACID transactions across entities |

```text
App → Redis (hot data) → PostgreSQL/SQL Server (source of truth)
```

## How does Redis compare to Memcached and in-memory caches?

| Feature | Redis | Memcached | IMemoryCache (.NET) |
|---------|-------|-----------|---------------------|
| **Data structures** | Strings, hashes, lists, sets, sorted sets, streams | Strings only | Objects in process |
| **Persistence** | RDB, AOF | None | None |
| **Pub/sub** | ✓ | ✗ | ✗ |
| **Multi-process** | ✓ | ✓ | Single process only |
| **Clustering** | Redis Cluster | Client sharding | N/A |

**Interview:** Redis = richer features; Memcached = simple string cache; `IMemoryCache` = per-instance only.

## Is Redis a database or a cache?

**Both** — depends on configuration:

| Mode | Role |
|------|------|
| **Cache-aside** | Ephemeral; DB is truth; keys can evict |
| **Primary store** | Persistence enabled; replication; still not a relational DB |
| **Session store** | TTL keys; durability optional |

Treat Redis as **volatile by default** unless you explicitly design for durability (AOF + replicas).

## What are Redis deployment modes (standalone, sentinel, cluster)?

| Mode | HA | Sharding |
|------|-----|----------|
| **Standalone** | Single node | No |
| **Sentinel** | Auto failover, monitoring | No (one master) |
| **Cluster** | Failover + sharding | Hash slots 16384 |

```text
Sentinel: 1 master + replicas + 3 sentinel processes
Cluster:  3+ masters, each with replicas, client routes by slot
```

Cloud: **Azure Cache for Redis**, **AWS ElastiCache**, **GCP Memorystore**.

## What is Redis persistence (RDB vs AOF)?

| Type | Mechanism | Trade-off |
|------|-----------|-----------|
| **RDB** | Point-in-time snapshots | Fast recovery; may lose last minutes |
| **AOF** | Append every write | More durable; larger files |
| **Both** | RDB + AOF | Common production compromise |

```conf
save 900 1          # RDB: save if 1 key changed in 900s
appendonly yes      # AOF enabled
appendfsync everysec
```

For **pure cache**, disable persistence for speed.

## What are Redis eviction policies?

When `maxmemory` reached, Redis evicts keys:

| Policy | Behavior |
|--------|----------|
| **noeviction** | Returns errors on write (default without maxmemory) |
| **allkeys-lru** | Evict any key — LRU approx |
| **volatile-lru** | Evict keys with TTL |
| **allkeys-lfu** | Least frequently used |
| **volatile-ttl** | Shortest TTL first |

```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**Cache-aside:** prefer `allkeys-lru` or `volatile-lru` with TTL on all cache keys.

## What is TTL, and how do you set key expiration?

```bash
SET session:abc "data" EX 3600        # expires in 1 hour
SETEX user:42 300 "{...}"             # 5 minutes
EXPIRE product:99 600
TTL product:99                        # seconds remaining
```

Always set **TTL on cache keys** — prevents unbounded memory growth.

## What are common Redis use cases in web applications?

| Use case | Redis feature |
|----------|---------------|
| **Page/API cache** | String + JSON |
| **Session store** | Hash + TTL |
| **Rate limiting** | INCR + EXPIRE or sliding window |
| **Leaderboard** | Sorted set (ZADD, ZRANGE) |
| **Real-time feed** | Streams or pub/sub |
| **Distributed lock** | SET key NX EX |
| **Job queue** | List (LPUSH/BRPOP) or Streams |

## How does Redis fit in a .NET microservices architecture?

```text
API Gateway → Service A ─┐
              Service B ─┼→ Redis (shared cache, pub/sub)
              Service C ─┘
                    ↓
              SQL / MongoDB
```

| Pattern | Redis role |
|---------|------------|
| **Cache-aside** | Reduce DB load |
| **Pub/sub** | Lightweight events (not replacement for Kafka) |
| **Rate limit** | Protect APIs at gateway |
| **SignalR backplane** | Scale WebSocket hubs |

Use **message broker** (Service Bus, RabbitMQ) for durable workflows; Redis pub/sub is fire-and-forget.

## What is Redis Cloud vs self-hosted Redis?

| | **Managed (Azure/AWS/GCP)** | **Self-hosted** |
|--|----------------------------|-----------------|
| **Ops** | Patching, failover managed | You operate |
| **Features** | Tier limits (cluster, modules) | Full control |
| **Network** | VNet/VPC integration | Anywhere |
| **Cost** | Per GB + tier | VM cost + labor |

Interview: prefer managed for production unless strict cost/control needs.

## What are Redis security basics?

| Practice | Detail |
|----------|--------|
| **AUTH / ACL** | Strong password; least-privilege users |
| **TLS** | Encrypt in transit |
| **Network** | Private VNet; no public IP |
| **Disable dangerous commands** | `FLUSHALL`, `CONFIG` rename or restrict |
| **No secrets in keys** | Store session IDs, not passwords |

```conf
requirepass strong-secret
rename-command FLUSHALL ""
```

## What are Redis performance characteristics?

| Metric | Typical |
|--------|---------|
| **Latency** | Sub-ms for simple GET/SET |
| **Throughput** | 100k+ ops/sec single node |
| **Bottleneck** | Network, large values, slow commands (KEYS) |

**Avoid:** `KEYS *` in production — use `SCAN`. Keep values small; compress JSON if needed.

## Related Topics

- Redis/Redis Data Structures and Commands.md
- Redis/Redis Caching Patterns.md
- Redis/Redis with .NET and Node.js.md
- Microservices/Microservices Data Replication, Sharding, and Distributed Caching.md
