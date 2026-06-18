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

**Cache-aside** (also **lazy loading**) means the **application** owns cache logic — Redis doesn't automatically load from the database. This is the **most common pattern** in .NET and Node apps.

```text
READ path:
  1. App checks Redis for key
  2. HIT  → deserialize and return (fast)
  3. MISS → query database → write to Redis with TTL → return

WRITE path:
  1. App writes to database (source of truth)
  2. Invalidate cache (DELETE key) OR update cache (SET new value)
```

```csharp
async Task<Product?> GetProductAsync(int id, CancellationToken ct)
{
    var key = $"product:{id}";
    var cached = await _redis.StringGetAsync(key);

    if (cached.HasValue)
        return JsonSerializer.Deserialize<Product>(cached!);

    // Cache miss — load from authoritative store
    var product = await _db.Products.FindAsync([id], ct);
    if (product is not null)
    {
        var ttl = TimeSpan.FromMinutes(10) + TimeSpan.FromSeconds(Random.Shared.Next(0, 60));
        await _redis.StringSetAsync(key, JsonSerializer.Serialize(product), ttl);
    }

    return product;
}
```

| Pros | Cons |
|------|------|
| Simple to understand and debug | First request after expiry is slow (miss) |
| Cache only data that's actually read | App must handle invalidation correctly |
| Redis failure → fall back to DB | Stale data possible until TTL expires |

**Interview tip:** Always pair cache-aside with **TTL** and a clear **invalidation on write** strategy.

## What is read-through vs write-through cache?

These patterns shift responsibility from app code to a **caching layer or library**:

| Pattern | Who loads cache on miss? | Who writes on update? |
|---------|--------------------------|------------------------|
| **Cache-aside** | Application | Application |
| **Read-through** | Cache library (calls your loader delegate) | Application still writes DB |
| **Write-through** | — | Cache layer writes cache **and** DB together |
| **Write-behind** | — | Cache first; async flush to DB |

```text
Read-through:
  App → Cache.Get(key) → [miss] → Cache calls loader → DB → populate cache → return

Write-through:
  App → Cache.Set(key, value) → Cache writes Redis AND DB before returning OK
```

**.NET examples:** `HybridCache` (.NET 9+), **FusionCache**, **NCache** — abstract read-through with stampede protection.

**When it matters in interviews:** Name the patterns even if you implement cache-aside manually. "We use cache-aside with FusionCache for read-through semantics and L1+L2" is a complete answer.

## What is write-behind (write-back) caching?

**Write-behind:** Application writes to Redis **first** and returns quickly; a background process persists to the database later.

```text
App writes → Redis (ack to user in 5ms)
                ↓ (async batch, every N seconds)
             Database
```

| Pro | Con |
|-----|-----|
| Very low write latency | **Data loss** if Redis crashes before flush |
| Batches DB writes (fewer IOPS) | Harder reasoning about consistency |
| Good for analytics counters | Wrong for money/inventory without careful design |

**Safe uses:** View counters, "last seen" timestamps, non-critical telemetry.

**Unsafe uses:** Account balance, inventory count, order placement — use **write-through** or **DB first** instead.

## How do you handle cache invalidation?

> "There are only two hard things in computer science: cache invalidation and naming things." — Phil Karlton

| Strategy | When to use | Trade-off |
|----------|-------------|-----------|
| **TTL only** | Stale data OK for N minutes | Simple; temporary inconsistency |
| **Delete on write** | Need fresh reads after update | Extra Redis call per write |
| **Update on write** | Read-heavy, small objects | Risk if write fails mid-way |
| **Versioned keys** | `product:42:v7` — bump version on change | Old keys expire via TTL naturally |
| **Pub/sub broadcast** | Invalidate L1 on all app instances | Requires subscribers on every node |

```csharp
async Task UpdateProductAsync(Product p, CancellationToken ct)
{
    await _db.SaveChangesAsync(ct);

    // Invalidate L2 (Redis)
    await _redis.KeyDeleteAsync($"product:{p.Id}");

    // Notify other instances to drop L1
    await _subscriber.PublishAsync(
        RedisChannel.Literal("cache:invalidate"),
        $"product:{p.Id}");
}
```

**Event-driven invalidation (microservices):** `ProductUpdated` event → search service drops `product:42` from cache; order service drops related summary keys.

**Rule:** Invalidate **all keys derived from** the changed entity — not just one key if denormalized caches exist (`product:42`, `products:category:5`, `homepage:featured`).

## What is the thundering herd problem, and how do you prevent it?

When a popular cache key **expires**, hundreds of concurrent requests may all **miss** simultaneously and hammer the database:

```text
T=0:   product:42 expires
T=1:   500 requests → all MISS → 500 identical SQL queries
T=2:   DB overload, latency spikes for entire app
```

**Mitigations:**

| Technique | How it works |
|-----------|--------------|
| **Distributed lock on miss** | First request acquires lock, rebuilds cache; others wait/retry GET |
| **Singleflight / request coalescing** | In-process: one DB call serves all waiting threads |
| **Stale-while-revalidate** | Return stale value immediately; one async task refreshes |
| **Probabilistic early refresh** | Refresh before TTL expires (xfetch algorithm) |
| **TTL jitter** | Spread expiry times — don't all expire at :00 |

```csharp
// Conceptual: only one caller rebuilds on miss
async Task<Product?> GetProductWithLockAsync(int id)
{
    var key = $"product:{id}";
    var cached = await _redis.StringGetAsync(key);
    if (cached.HasValue) return Deserialize(cached);

    var lockKey = $"lock:{key}";
    var token = Guid.NewGuid().ToString();
    if (await _redis.StringSetAsync(lockKey, token, TimeSpan.FromSeconds(10), When.NotExists))
    {
        try
        {
            var product = await LoadFromDbAsync(id);
            await _redis.StringSetAsync(key, Serialize(product), TimeSpan.FromMinutes(10));
            return product;
        }
        finally { await ReleaseLockAsync(lockKey, token); }
    }

    await Task.Delay(50);  // brief wait for winner to populate cache
    return await GetProductAsync(id);  // retry
}
```

**.NET 9 HybridCache** includes stampede protection built-in — worth mentioning in interviews.

## What is cache stampede mitigation?

**Cache stampede** = **thundering herd** — same problem, two names. Additional practical tips:

```bash
# Redis lock pattern
SET lock:product:42 {uuid} NX EX 10
# Winner rebuilds; losers retry GET in loop with backoff
```

**TTL jitter** (always apply):

```csharp
var baseTtl = TimeSpan.FromMinutes(10);
var jitter = TimeSpan.FromSeconds(Random.Shared.Next(0, 120));
await _redis.StringSetAsync(key, json, baseTtl + jitter);
```

**Never** use identical TTL for all keys loaded at deploy time — they'll expire together on the next deploy anniversary.

## How do you implement distributed locking with Redis?

Use locks when **exactly one** worker should perform an action (rebuild cache, process payment idempotency, cron job leader election).

**Basic lock (single Redis node):**

```bash
SET lock:order:99 "unique-token-abc" NX EX 30
# ... do work ...
# Release with Lua — only if token matches (don't delete someone else's lock)
```

```csharp
var lockToken = Guid.NewGuid().ToString();
var acquired = await db.StringSetAsync(
    "lock:order:99", lockToken, TimeSpan.FromSeconds(30), When.NotExists);

if (acquired)
{
    try
    {
        await ProcessOrderAsync(99);
    }
    finally
    {
        await ReleaseLockAsync(db, "lock:order:99", lockToken);
    }
}
```

| Caveat | Mitigation |
|--------|------------|
| Lock expires before work finishes | Extend lock (watchdog) or keep work < TTL |
| Clock skew | Use short TTL + idempotent operations |
| Single Redis node failure | **Redlock** (multi-node) or use **Medallion.Threading** |
| Financial correctness | Prefer **DB unique constraint** or **lease table** |

**Interview:** Redis locks are **good enough** for cache rebuild and job deduplication; use **database transactions** for money.

## How do you implement rate limiting with Redis?

Protect APIs from abuse — per user, IP, or API key.

**Fixed window** (simple; boundary burst issue):

```bash
# Key includes window bucket: user 42, hour 2025061714
INCR ratelimit:user:42:2025061714
EXPIRE ratelimit:user:42:2025061714 60
# If count > 100 → HTTP 429
```

**Sliding window** (fairer; uses sorted set):

```bash
# Remove hits older than 60 seconds
ZREMRANGEBYSCORE hits:user:42 0 (current_timestamp_ms - 60000)
ZADD hits:user:42 current_timestamp_ms current_timestamp_ms
ZCARD hits:user:42
EXPIRE hits:user:42 60
# If ZCARD > 100 → reject
```

| Layer | Tool |
|-------|------|
| **App middleware** | AspNetCoreRateLimit, custom Redis middleware |
| **API Gateway** | Azure APIM, AWS API Gateway, Kong |
| **.NET 7+** | `Microsoft.AspNetCore.RateLimiting` + Redis backend (custom) |

Return **429 Too Many Requests** with `Retry-After` header when limited.

## What is a session store pattern with Redis?

Web apps scaled to **multiple instances** can't store session in memory — user hits server B on next request and loses session. **Redis centralizes session state:**

```csharp
// Store session as hash
await db.HashSetAsync($"session:{sessionId}", new HashEntry[]
{
    new("userId", userId.ToString()),
    new("email", email),
    new("roles", JsonSerializer.Serialize(roles)),
    new("cartId", cartId.ToString())
});
await db.KeyExpireAsync($"session:{sessionId}", TimeSpan.FromHours(8));
```

**ASP.NET Core integration:**

```csharp
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = redisConn);
builder.Services.AddSession(o =>
{
    o.IdleTimeout = TimeSpan.FromHours(2);
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});
```

**Data Protection keys in Redis** (required for cookie auth across instances):

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToStackExchangeRedis(mux, "DataProtection-Keys");
```

Without shared data protection keys, each server encrypts auth cookies differently — users get logged out randomly behind a load balancer.

| Benefit | Detail |
|---------|--------|
| **No sticky sessions** | Any instance handles any request |
| **TTL** | Auto logout after idle period |
| **Fast** | Session read every request — Redis keeps latency low |

Store **session ID in cookie**, not user secrets. Session data in Redis should not include raw passwords.

## How do you cache API responses effectively?

Caching HTTP GET responses in Redis speeds APIs but risks **wrong data to wrong user** if keys are sloppy:

| Rule | Reason |
|------|--------|
| Key includes **tenant / user scope** | `api:user:42:orders` not `api:orders` |
| Key includes **API version** | `v2:products:list` — schema changes invalidate |
| Cache **GET only** | POST/PUT/DELETE are not idempotent cache targets |
| Short TTL for **personalized** data | Long TTL for public catalog |
| **Vary** on language, region | `Accept-Language` in key if responses differ |
| Don't cache **5xx** or transient errors | Unless intentional circuit-breaker fallback |

```csharp
var key = $"api:tenant:{tenantId}:products:list:lang:{culture}:v2";
var cached = await _redis.StringGetAsync(key);
if (cached.HasValue)
    return Results.Content(cached!, "application/json");

var json = await BuildProductListJsonAsync(tenantId, culture);
await _redis.StringSetAsync(key, json, TimeSpan.FromMinutes(5));
return Results.Content(json, "application/json");
```

**CDN vs Redis:** Public static assets and anonymous GETs → **CDN** (Azure Front Door). Personalized or authorized JSON → **Redis** at origin.

## What are multi-level caches (L1 + L2)?

Two cache tiers reduce Redis round-trips and DB load:

```text
Request
  → L1: IMemoryCache (per instance, ~microseconds)
        ↓ miss
  → L2: Redis (shared fleet, ~milliseconds)
        ↓ miss
  → Database (milliseconds–seconds)
```

| Level | Scope | Invalidation |
|-------|-------|--------------|
| **L1** | Single app instance | Short TTL; pub/sub invalidation from writes |
| **L2** | All instances | DELETE on write; TTL |

```csharp
// .NET 9 HybridCache — built-in L1 + L2 + stampede protection
builder.Services.AddHybridCache()
    .AddRedisDistributedCache(redisConn);

await hybridCache.GetOrCreateAsync($"product:{id}",
    async cancel => await _db.Products.FindAsync(id, cancel),
    options: new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(10),
        LocalCacheExpiration = TimeSpan.FromMinutes(1)
    });
```

**When L1 helps:** Read-heavy, same keys hit repeatedly on one server (product catalog). **When L1 hurts:** Highly personalized data — low hit rate, wasted memory.

## How do caching patterns differ in microservices?

Each service should own its cache — **don't create a shared "cache microservice"** that knows everyone's schema.

| Principle | Example |
|-----------|---------|
| **Cache inside service boundary** | Order Service caches `order:123`, not User Service's DB rows |
| **Cache aggregates, not joins** | Cache `orderSummary:123`, not joined user+order SQL result |
| **Invalidate via domain events** | `OrderPlaced` → invalidate `user:42:recent-orders` |
| **Don't cache synchronous call chains** | B calls C calls D — cache at B and C separately |
| **CDN for public edge** | Product images, public catalog JSON |
| **Consistent key namespace** | `{service}:{entity}:{id}` prevents collisions |

**Anti-patterns:**
- One Redis database with all services writing each other's keys
- Caching responses that embed data from 5 services (stale + invalidation nightmare)
- No TTL "because we'll invalidate manually" (you won't, consistently)

**Good pattern:** Order Service listens to `ProductPriceChanged` → drops any cached line-item previews that included that product.

## Related Topics

- Redis/Redis Basics.md
- Redis/Redis with .NET and Node.js.md
- System Design/Designing Scalable Web Application.md
- Microservices/Microservices Data Replication, Sharding, and Distributed Caching.md
