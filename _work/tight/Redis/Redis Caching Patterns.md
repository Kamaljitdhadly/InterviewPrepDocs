# Redis Caching Patterns

## Questions Covered

1. What is cache-aside (lazy loading)?
2. What is read-through vs write-through cache?
3. What is write-behind (write-back) caching?
4. How do you handle cache invalidation?
5. What is the thundering herd problem, and how do you prevent it?
6. What is cache stampede mitigation?
7. How do you implement distributed locking with Redis?
8. How do you implement rate limiting with Redis?
9. What is a session store pattern with Redis?
10. How do you cache API responses effectively?
11. What are multi-level caches (L1 + L2)?
12. How do caching patterns differ in microservices?

## What is cache-aside (lazy loading)?

Application manages cache — most common pattern:

```text
Read:
  1. Check cache
  2. Hit → return
  3. Miss → read DB → write cache → return

Write:
  1. Write DB
  2. Invalidate or update cache
```

```csharp
async Task<Product?> GetProductAsync(int id)
{
    var key = $"product:{id}";
    var cached = await _redis.StringGetAsync(key);
    if (cached.HasValue)
        return JsonSerializer.Deserialize<Product>(cached!);

    var product = await _db.Products.FindAsync(id);
    if (product is not null)
        await _redis.StringSetAsync(key, JsonSerializer.Serialize(product), TimeSpan.FromMinutes(10));

    return product;
}
```

**Pros:** Simple, cache only what's read. **Cons:** First request slow (miss).

## What is read-through vs write-through cache?

| Pattern | Who writes cache? |
|---------|-----------------|
| **Cache-aside** | Application |
| **Read-through** | Cache layer on miss (library handles DB fetch) |
| **Write-through** | Write to cache + DB synchronously |

```text
Write-through:
  App → Cache → DB (both updated before ack)

Read-through:
  App → Cache → (miss) Cache loads from DB
```

.NET: `HybridCache`, `FusionCache` can abstract read-through. Interview: know names even if you implement cache-aside manually.

## What is write-behind (write-back) caching?

Write to cache **immediately**; async flush to DB:

```text
App → Redis (ack fast) → background worker → DB
```

| Pro | Con |
|-----|-----|
| Low write latency | Data loss risk if Redis fails before flush |
| Batches DB writes | Complexity |

Use only when **eventual persistence** acceptable (analytics counters, non-critical writes).

## How do you handle cache invalidation?

> "There are only two hard things... cache invalidation and naming things."

| Strategy | When |
|----------|------|
| **TTL** | Default; stale data OK for N minutes |
| **Delete on write** | Strong consistency needed |
| **Update on write** | Read-heavy, small objects |
| **Versioned keys** | `product:42:v3` — bump version on change |
| **Pub/sub invalidation** | All nodes drop local L1 |

```csharp
async Task UpdateProductAsync(Product p)
{
    await _db.SaveAsync(p);
    await _redis.KeyDeleteAsync($"product:{p.Id}");
    await _redis.PublishAsync("cache:invalidate", $"product:{p.Id}");
}
```

**Event-driven:** domain event → consumers invalidate related keys.

## What is the thundering herd problem, and how do you prevent it?

Many requests miss cache simultaneously → all hit DB:

```text
Cache expires → 1000 requests → 1000 DB queries
```

**Mitigations:**

| Technique | How |
|-----------|-----|
| **Lock on miss** | One thread rebuilds; others wait/retry |
| **Early expiration** | Refresh before TTL (probabilistic) |
| **Stale-while-revalidate** | Serve stale; async refresh |
| **Request coalescing** | Single flight pattern |

```csharp
// Single flight pseudo
await _lock.WaitAsync($"product:{id}", async () => {
    // double-check cache, then load DB
});
```

## What is cache stampede mitigation?

Same as thundering herd — **singleflight** library or Redis lock:

```bash
SET lock:product:42 "1" NX EX 10
# winner rebuilds cache; losers sleep and retry GET
```

**Jitter on TTL** — avoid all keys expiring at same second:

```csharp
var ttl = TimeSpan.FromMinutes(10) + TimeSpan.FromSeconds(Random.Shared.Next(0, 60));
```

## How do you implement distributed locking with Redis?

**Redlock pattern** (or simplified single-node for low contention):

```bash
SET resource:order:99 token:uuid NX EX 30
# ... critical section ...
# delete only if value matches (Lua script)
```

```csharp
if (await db.StringSetAsync(lockKey, lockToken, TimeSpan.FromSeconds(30), When.NotExists))
{
    try { /* work */ }
    finally
    {
        // Lua: if GET == token then DEL
        await ReleaseLockAsync(lockKey, lockToken);
    }
}
```

| Caveat | Detail |
|--------|--------|
| Clock skew | Keep TTL short |
| Long work | Extend lock (watchdog) |
| Not a mutex | Use Redlock or dedicated lib (Medallion.Threading) for correctness |

Prefer **database constraints** or **lease table** when financial correctness required.

## How do you implement rate limiting with Redis?

**Fixed window:**

```bash
INCR ratelimit:user:42:2025061714
EXPIRE ratelimit:user:42:2025061714 60
# reject if > 100
```

**Sliding window** (sorted set scores = timestamps):

```bash
ZREMRANGEBYSCORE hits:user:42 0 (now-60000)
ZADD hits:user:42 now now
ZCARD hits:user:42
EXPIRE hits:user:42 60
```

Libraries: **AspNetCoreRateLimit**, **Redis rate limiter** middleware, API Gateway limits.

## What is a session store pattern with Redis?

Stateful apps with multiple instances — session in Redis:

```csharp
await _redis.HashSetAsync($"session:{sessionId}", new HashEntry[]
{
    new("userId", userId.ToString()),
    new("roles", JsonSerializer.Serialize(roles))
});
await _redis.KeyExpireAsync($"session:{sessionId}", TimeSpan.FromHours(8));
```

ASP.NET Core: `AddStackExchangeRedisCache` + `AddSession` or **Data Protection keys** in Redis for scale-out.

| Benefit | Detail |
|---------|--------|
| Sticky sessions not required | Any instance serves request |
| TTL | Auto logout |

## How do you cache API responses effectively?

| Rule | Reason |
|------|--------|
| Key by **URL + auth scope + version** | Avoid leaking user A's data to B |
| Cache **GET** only | Safe idempotent reads |
| Respect **Cache-Control** | Honor HTTP semantics at CDN |
| Short TTL for **personalized** data | Long TTL for public catalog |
| **Vary** on Accept-Language / tenant | Correct representation |

```csharp
var key = $"api:products:list:tenant:{tenantId}:v2";
```

Don't cache error responses (unless intentional circuit breaker cache).

## What are multi-level caches (L1 + L2)?

```text
Request → L1 (IMemoryCache, per instance)
            ↓ miss
          L2 (Redis, shared)
            ↓ miss
          Database
```

| Level | Latency | Consistency |
|-------|---------|-------------|
| L1 | ~μs | Per-node; invalidate via pub/sub |
| L2 | ~ms | Shared across fleet |

`.NET 9+ HybridCache` combines L1 + L2 with stampede protection built-in.

## How do caching patterns differ in microservices?

| Concern | Pattern |
|---------|---------|
| **Each service owns cache** | No shared DB cache across boundaries |
| **Cache per aggregate** | `order:123`, not join tables |
| **Invalidation via events** | OrderUpdated → invalidate order + summary caches |
| **CDN at edge** | Static assets, public GET APIs |
| **Don't cache cross-service chains** | Cache at service boundary |

**Anti-pattern:** One giant shared cache keyspace coupling all services.

## Related Topics

- Redis/Redis Basics.md
- Redis/Redis with .NET and Node.js.md
- System Design/Designing Scalable Web Application.md
- Microservices/Microservices Data Replication, Sharding, and Distributed Caching.md
