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

```csharp
// Program.cs
builder.Services.AddSingleton<IConnectionMultiplexer>(
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis")!));

builder.Services.AddSingleton<IRedisService, RedisService>();
```

```csharp
public class RedisService
{
    private readonly IDatabase _db;
    public RedisService(IConnectionMultiplexer mux) => _db = mux.GetDatabase();

    public async Task SetJsonAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var json = JsonSerializer.Serialize(value);
        await _db.StringSetAsync(key, json, expiry);
    }
}
```

Package: `StackExchange.Redis`.

## What is StackExchange.Redis vs IDistributedCache?

| API | Use |
|-----|-----|
| **`IConnectionMultiplexer` / `IDatabase`** | Full Redis features (pub/sub, hashes, Lua) |
| **`IDistributedCache`** | Simple get/set/remove — swap Redis for SQL Server cache |

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = configuration.GetConnectionString("Redis");
    options.InstanceName = "ContosoShop:";
});

// Inject IDistributedCache
await cache.SetStringAsync("product:42", json, new DistributedCacheEntryOptions
{
    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
});
```

Use **IDistributedCache** for standard caching; **StackExchange.Redis** for advanced structures.

## How do you configure Azure Cache for Redis in .NET?

```json
{
  "ConnectionStrings": {
    "Redis": "contoso.redis.cache.windows.net:6380,password=...,ssl=True,abortConnect=False"
  }
}
```

| Setting | Why |
|---------|-----|
| **Port 6380 + SSL** | Azure requirement |
| **abortConnect=False** | App starts even if Redis briefly unavailable |
| **Managed identity** | Enterprise tier — passwordless |

Enable **Microsoft Entra authentication** on Premium tiers where supported.

## How do you use Redis as ASP.NET Core session and Data Protection store?

**Session:**

```csharp
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = redisConn);
builder.Services.AddSession(o => o.IdleTimeout = TimeSpan.FromHours(2));
app.UseSession();
```

**Data Protection** (scale cookie auth across instances):

```csharp
builder.Services.AddDataProtection()
    .PersistKeysToStackExchangeRedis(mux, "DataProtection-Keys");
```

Without shared keys, each instance encrypts cookies differently — auth breaks behind load balancer.

## How does SignalR use Redis as a backplane?

```csharp
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConn, options =>
    {
        options.Configuration.ChannelPrefix = "ContosoHub";
    });
```

```text
Client A → Server 1 ─┐
                     ├→ Redis pub/sub → Server 2 → Client B
Client B → Server 2 ─┘
```

Broadcast from any instance reaches clients on all instances.

## How do you connect to Redis from Node.js?

**node-redis (official):**

```typescript
import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });
await client.connect();

await client.set('session:abc', JSON.stringify({ userId: 42 }), { EX: 3600 });
const data = await client.get('session:abc');
```

**ioredis** — cluster/sentinel support, popular in NestJS ecosystem:

```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
await redis.hset('user:42', 'name', 'Ada');
```

## What is ioredis vs node-redis?

| | **node-redis** | **ioredis** |
|--|----------------|-------------|
| **Maintainer** | Redis Ltd | Community |
| **Cluster/Sentinel** | Supported | Mature cluster support |
| **API** | Modern async | Promise-based |
| **NestJS** | Either works | Common in examples |

Pick one per service; wrap behind repository interface for tests.

## How do you use Redis with NestJS?

```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({ url: process.env.REDIS_URL }),
        ttl: 60_000,
      }),
    }),
  ],
})
export class AppModule {}
```

Or `@nestjs-modules/ioredis` for direct Redis access + pub/sub in microservices.

## How do you health-check Redis in production?

```csharp
builder.Services.AddHealthChecks()
    .AddRedis(configuration.GetConnectionString("Redis")!, name: "redis");
```

```typescript
// Terminus / custom
await client.ping(); // PONG
```

Alert on: connection failures, memory > 80%, evicted keys spike, replication lag.

## How do you test code that uses Redis?

| Approach | When |
|----------|------|
| **Mock `IDatabase`** | Unit tests |
| **Testcontainers Redis** | Integration tests |
| **In-memory fake** | Limited — behavior differs |

```csharp
var container = new RedisBuilder().Build();
await container.StartAsync();
var mux = await ConnectionMultiplexer.ConnectAsync(container.GetConnectionString());
```

Don't use production Redis in tests.

## What are connection multiplexer best practices?

| Rule | Reason |
|------|--------|
| **Singleton multiplexer** | Expensive to create; designed to be shared |
| **Reuse `IDatabase`** | Lightweight |
| **Avoid sync over async** | `.Result` blocks |
| **Handle connection failures** | Retry policies; circuit breaker |
| **Key naming convention** | `{service}:{entity}:{id}` |

```text
Good: orders:summary:42
Bad:  42summaryorders
```

## How do you serialize objects for Redis in .NET and Node?

| Format | Pros |
|--------|------|
| **JSON** | Human-readable, cross-language |
| **MessagePack** | Smaller, faster |
| **RedisJSON module** | Native JSON path queries |

.NET:

```csharp
JsonSerializer.Serialize(obj, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
```

Node: `JSON.stringify` / `superjson` for Date types.

Version your payload: `{ "v": 1, "data": { ... } }` for schema evolution.

## Related Topics

- Redis/Redis Caching Patterns.md
- C#/.NET Core Basics.md
- Azure Cloud 1/Azure Storage and Databases.md
- Testing/Integration Testing.md
