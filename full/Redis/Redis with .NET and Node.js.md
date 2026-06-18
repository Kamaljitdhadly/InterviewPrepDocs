# Redis with .NET and Node.js

## Questions Covered

1. How do you connect to Redis from ASP.NET Core?
2. What is StackExchange.Redis vs IDistributedCache?
3. How do you configure Azure Cache for Redis in .NET?
4. How do you use Redis as ASP.NET Core session and Data Protection store?
5. How does SignalR use Redis as a backplane?
6. How do you connect to Redis from Node.js?
7. What is ioredis vs node-redis?
8. How do you use Redis with NestJS?
9. How do you health-check Redis in production?
10. How do you test code that uses Redis?
11. What are connection multiplexer best practices?
12. How do you serialize objects for Redis in .NET and Node?

## How do you connect to Redis from ASP.NET Core?

**StackExchange.Redis** is the standard .NET client — high performance, multiplexer pattern, supports cluster/sentinel.

```csharp
// Program.cs
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var config = ConfigurationOptions.Parse(
        builder.Configuration.GetConnectionString("Redis")!);
    config.AbortOnConnectFail = false;   // retry on startup blip
    return ConnectionMultiplexer.Connect(config);
});

builder.Services.AddSingleton<IRedisCacheService, RedisCacheService>();
```

```csharp
public class RedisCacheService
{
    private readonly IDatabase _db;

    public RedisCacheService(IConnectionMultiplexer mux)
        => _db = mux.GetDatabase();   // default DB 0

    public async Task SetJsonAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var json = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, json, expiry);
    }

    public async Task<T?> GetJsonAsync<T>(string key)
    {
        var value = await _db.StringGetAsync(key);
        return value.HasValue
            ? JsonSerializer.Deserialize<T>(value!)
            : default;
    }
}
```

**NuGet:** `StackExchange.Redis` — also pulled in by `Microsoft.Extensions.Caching.StackExchangeRedis`.

Register **`IConnectionMultiplexer` as singleton** — one multiplexer per app domain for the process lifetime.

## What is StackExchange.Redis vs IDistributedCache?

Two APIs — same Redis server, different abstraction level:

| API | Abstraction | Use when |
|-----|-------------|----------|
| **`IConnectionMultiplexer` / `IDatabase`** | Full Redis — pub/sub, hashes, Lua, transactions | Locks, rate limits, SignalR backplane, custom patterns |
| **`IDistributedCache`** | Simple `Get` / `Set` / `Remove` strings | Standard response caching; swap Redis ↔ SQL Server cache |

```csharp
// IDistributedCache — Microsoft abstraction
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = configuration.GetConnectionString("Redis");
    options.InstanceName = "ContosoShop:";   // prefix on all keys
});

public class ProductService(IDistributedCache cache)
{
    public async Task SetAsync(Product p)
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(p);
        await cache.SetAsync($"product:{p.Id}", bytes, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        });
    }
}
```

**Decision:** Start with `IDistributedCache` for basic caching. Drop to **`IDatabase`** when you need `HashSet`, `SortedSet`, pub/sub, or atomic `StringSet` with `When.NotExists` (locks).

## How do you configure Azure Cache for Redis in .NET?

**Azure Cache for Redis** connection string format:

```json
{
  "ConnectionStrings": {
    "Redis": "contoso.redis.cache.windows.net:6380,password=YOUR_ACCESS_KEY,ssl=True,abortConnect=False,connectTimeout=5000"
  }
}
```

| Setting | Why |
|---------|-----|
| **Port 6380 + `ssl=True`** | Azure requires TLS |
| **`abortConnect=False`** | App starts if Redis briefly unavailable; client retries in background |
| **`connectTimeout`** | Fail fast vs hang on network issues |
| **Access key / Entra ID** | Password auth vs passwordless on supported tiers |

**Production checklist:**
- **Private endpoint** or VNet injection — no public Redis
- **Firewall** — allow only app subnet IPs
- **Separate caches** for prod vs non-prod (never share)
- Monitor **server load**, **used memory**, **evicted keys** in Azure Portal

**Local dev:** Docker `redis:7-alpine` or Azure cache dev instance — same connection pattern with `localhost:6379,ssl=False`.

## How do you use Redis as ASP.NET Core session and Data Protection store?

Scaling ASP.NET Core horizontally requires **shared session** and **shared encryption keys**:

**Distributed session:**

```csharp
builder.Services.AddStackExchangeRedisCache(o =>
    o.Configuration = builder.Configuration.GetConnectionString("Redis"));

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.IsEssential = true;
    options.Cookie.HttpOnly = true;
});

// Pipeline order matters
app.UseSession();   // after UseRouting, before endpoints
```

**Data Protection** (cookie authentication, anti-forgery tokens):

```csharp
builder.Services.AddDataProtection()
    .SetApplicationName("ContosoShop")   // same across all instances
    .PersistKeysToStackExchangeRedis(
        sp.GetRequiredService<IConnectionMultiplexer>(),
        "DataProtection-Keys");
```

```text
Without shared keys:
  Server 1 encrypts auth cookie → Server 2 can't decrypt → user logged out

With Redis key ring:
  All servers read/write keys from Redis → cookies work on any instance
```

Session stores **session ID in cookie**; actual session payload lives in Redis (or SQL). Keep payloads small.

## How does SignalR use Redis as a backplane?

SignalR connections are **sticky to a server process**. Without a backplane, a message sent on Server 1 never reaches clients connected to Server 2.

```csharp
builder.Services.AddSignalR()
    .AddStackExchangeRedis(
        builder.Configuration.GetConnectionString("Redis")!,
        options =>
        {
            options.Configuration.ChannelPrefix = RedisChannel.Literal("ContosoHub");
        });
```

```text
Client A ──WebSocket──► Server 1 ──publish──► Redis pub/sub
                                                    │
Client B ──WebSocket──► Server 2 ◄──subscribe───────┘
                              └── delivers to Client B
```

**When you need it:** Multiple SignalR server instances behind load balancer (Azure App Service scale-out, AKS pods).

**When you don't:** Single instance, or Azure SignalR Service (managed backplane — different product).

Use a **channel prefix** per app so staging and prod don't cross-talk on shared Redis.

## How do you connect to Redis from Node.js?

Two popular clients — both work well:

**node-redis (official, Redis Ltd maintained):**

```typescript
import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis error', err));

await client.connect();

await client.set('session:abc', JSON.stringify({ userId: 42 }), { EX: 3600 });
const raw = await client.get('session:abc');
const session = raw ? JSON.parse(raw) : null;

await client.quit();
```

**ioredis (popular in NestJS/Bull queues):**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

await redis.hset('user:42', { name: 'Ada', tier: 'gold' });
await redis.expire('user:42', 3600);
```

**Express middleware pattern:** Connect once at startup; inject `client` into routes/services — don't create a new connection per request.

## What is ioredis vs node-redis?

| | **node-redis** | **ioredis** |
|--|----------------|-------------|
| **Maintainer** | Redis Ltd (official) | Community (widely used) |
| **API style** | Modern async/await | Promise-based, EventEmitter |
| **Cluster / Sentinel** | Supported | Mature, common in docs |
| **Bull / BullMQ** | Works with adapter | Native integration history |
| **NestJS** | `@nestjs-modules/ioredis` or cache-manager | Very common in examples |

**Recommendation:** Pick **one client per service** and wrap behind a `CacheRepository` interface for tests. For new Node projects, **node-redis** is the official path; **ioredis** if you need advanced cluster features or existing Bull stack.

## How do you use Redis with NestJS?

**CacheModule (simple get/set TTL):**

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL,
          ttl: 60_000,   // default TTL ms
        }),
      }),
    }),
  ],
})
export class AppModule {}
```

```typescript
@Injectable()
export class ProductService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getProduct(id: string) {
    const cached = await this.cache.get<Product>(`product:${id}`);
    if (cached) return cached;
    const product = await this.db.findProduct(id);
    await this.cache.set(`product:${id}`, product, 600_000);
    return product;
  }
}
```

**Direct Redis (pub/sub, streams, locks):**

```typescript
// @nestjs-modules/ioredis
RedisModule.forRoot({ type: 'single', url: process.env.REDIS_URL })
```

Use CacheModule for **HTTP caching**; ioredis module for **custom Redis patterns**.

## How do you health-check Redis in production?

**.NET — ASP.NET Core health checks:**

```csharp
builder.Services.AddHealthChecks()
    .AddRedis(
        builder.Configuration.GetConnectionString("Redis")!,
        name: "redis",
        tags: new[] { "ready", "cache" });

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
});
```

**Node — startup ping:**

```typescript
export async function checkRedis(client: RedisClientType): Promise<boolean> {
  try {
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
```

**Alert on (Azure Monitor / Prometheus):**
- Connection count near limit
- **used_memory** > 80% of max
- **evicted_keys** rate spike
- **replication lag** (Premium with replica)
- Latency p99 increase

Kubernetes: readiness probe fails if Redis unreachable — pod doesn't receive traffic until cache recovers (or degrade gracefully if designed to).

## How do you test code that uses Redis?

| Level | Approach |
|-------|----------|
| **Unit tests** | Mock `IDatabase` / wrap `IRedisCacheService` interface |
| **Integration tests** | **Testcontainers** — real Redis in Docker |
| **Don't** | Point tests at production or shared dev Redis |

```csharp
// Testcontainers.Redis
private RedisContainer _redis = new RedisBuilder().Build();

public async Task InitializeAsync()
{
    await _redis.StartAsync();
    _mux = await ConnectionMultiplexer.ConnectAsync(_redis.GetConnectionString());
}

[Fact]
public async Task SetAndGet_RoundTripsJson()
{
    var svc = new RedisCacheService(_mux);
    await svc.SetJsonAsync("test:1", new Product { Id = 1, Name = "Widget" }, TimeSpan.FromMinutes(1));
    var result = await svc.GetJsonAsync<Product>("test:1");
    Assert.Equal("Widget", result!.Name);
}
```

Integration tests catch serialization bugs and TTL issues mocks miss.

## What are connection multiplexer best practices?

StackExchange.Redis **`ConnectionMultiplexer`** is designed to be **long-lived and shared**:

| Rule | Reason |
|------|--------|
| **One multiplexer per app** | Expensive to create; manages connection pool internally |
| **`GetDatabase()` is cheap** | Call freely; no need to cache IDatabase in singleton |
| **Never `.Result` / `.Wait()`** | Blocks thread pool; use async |
| **`AbortOnConnectFail = false`** | Resilience on startup / transient network |
| **Key naming convention** | `{service}:{entity}:{id}` — e.g. `orders:summary:42` |
| **Avoid `KEYS`** | Use `IServer.Keys` with page size or maintain indexes |
| **Handle connection restarts** | Subscribe to `ConnectionFailed` / `ConnectionRestored` events for logging |

```csharp
mux.ConnectionFailed += (_, e) =>
    _logger.LogWarning("Redis connection failed: {Message}", e.Exception?.Message);
```

**Node equivalent:** One `createClient()` at bootstrap; reuse for all requests — don't connect per HTTP request.

## How do you serialize objects for Redis in .NET and Node?

Redis stores **bytes**. Choose serialization for size, speed, and cross-language needs:

| Format | Pros | Cons |
|--------|------|------|
| **JSON** | Human-readable, cross-language, easy debug | Larger, slower parse |
| **MessagePack** | Compact, fast | Binary, less readable |
| **RedisJSON module** | Partial updates with `JSON.SET` path | Requires module on server |

**.NET:**

```csharp
private static readonly JsonSerializerOptions JsonOpts = new()
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

static byte[] Serialize<T>(T obj) => JsonSerializer.SerializeToUtf8Bytes(obj, JsonOpts);
static T? Deserialize<T>(ReadOnlySpan<byte> data) => JsonSerializer.Deserialize<T>(data, JsonOpts);
```

**Node:**

```typescript
// Dates don't JSON natively — use ISO strings or superjson
await client.set(`user:${id}`, JSON.stringify({ ...user, updatedAt: user.updatedAt.toISOString() }));
```

**Schema evolution — version your payload:**

```json
{ "v": 1, "data": { "name": "Ada", "tier": "gold" } }
```

Reader checks `v` and migrates or rejects unknown versions — avoids silent deserialization bugs after deploy.

## Related Topics

- Redis/Redis Caching Patterns.md
- Redis/Redis Basics.md
- C#/.NET Core Basics.md
- Azure Cloud/Azure Storage and Databases.md
- Testing/Integration Testing.md
