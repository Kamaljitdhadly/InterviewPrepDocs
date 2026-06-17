# Caching

## Concept Explanation

A **cache** stores frequently-accessed data in fast storage (memory) to reduce latency and load on the backend/database. Caching appears at many layers: **browser**, **CDN**, **application/in-memory**, **distributed cache (Redis/Memcached)**, and **database** caches.

**Caching strategies:**
- **Cache-aside (lazy loading)** — app checks cache; on miss, reads DB and populates cache. Most common.
- **Read-through** — cache library loads from DB on miss transparently.
- **Write-through** — write to cache and DB together (consistent, slower writes).
- **Write-back (write-behind)** — write to cache, async to DB (fast, risk of loss).

**Eviction policies** (when full): **LRU** (least recently used), LFU, FIFO, TTL-based expiry.

## Code Example(s)

```text
CACHE-ASIDE flow:
  read(key):
    value = cache.get(key)
    if value == null:               # cache miss
        value = db.query(key)
        cache.set(key, value, ttl)  # populate for next time
    return value
```

```csharp
// Cache-aside with Redis (StackExchange.Redis / IDistributedCache)
public async Task<Product> GetProduct(int id)
{
    var key = $"product:{id}";
    var cached = await cache.GetStringAsync(key);
    if (cached != null) return Deserialize(cached);        // hit

    var product = await db.Products.FindAsync(id);          // miss → DB
    await cache.SetStringAsync(key, Serialize(product),
        new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) });
    return product;
}
```

## Interview Q&A

**🟢 Why use a cache?**
To reduce latency and offload the database/backend by serving frequently-accessed data from fast (usually in-memory) storage, improving performance and scalability.

**🟢 What is cache-aside?**
The app checks the cache first; on a miss it reads from the database and stores the result in the cache for next time. The application manages the cache explicitly.

**🟡 What's the difference between write-through and write-back caching?**
Write-through writes to cache and DB synchronously — consistent but slower writes. Write-back writes to cache immediately and persists to the DB asynchronously — faster but risks data loss if the cache fails before flushing.

**🟡 What is cache eviction and what is LRU?**
When the cache is full, eviction removes entries to make room. LRU (Least Recently Used) evicts the entries not accessed for the longest time — a good default that exploits temporal locality.

**🔴 What are cache stampede, penetration, and avalanche?**
**Stampede/thundering herd:** a popular key expires and many requests hit the DB at once (mitigate with locks/single-flight or staggered TTLs). **Penetration:** queries for non-existent keys always miss and hit the DB (cache nulls or use a bloom filter). **Avalanche:** many keys expire simultaneously, overwhelming the DB (add jitter to TTLs).

## ⚠️ Tricky / Gotchas

- **Cache invalidation is one of the hardest problems** — stale data vs complexity. Decide on TTLs and explicit invalidation carefully; "there are only two hard things: cache invalidation and naming things."
- **Cache stampede** when a hot key expires can crash the DB — use locking/single-flight and TTL jitter.
- **Caching everything wastes memory** and lowers hit rate — cache hot, expensive-to-compute, read-heavy data.
- **Consistency:** caches are eventually consistent with the DB; for must-be-fresh data, cache carefully or bypass.
- **Cache penetration with null lookups** silently hammers the DB — cache negative results (with short TTL) or use a bloom filter.

## 📌 Quick Recap

- Cache = fast (memory) store for hot data → lower latency, less DB load; layers: browser/CDN/app/distributed.
- Strategies: cache-aside (common), read-through, write-through (consistent), write-back (fast, risky).
- Eviction: LRU/LFU/FIFO/TTL; LRU is a solid default.
- Hard parts: invalidation (use TTLs + explicit invalidation), stampede (locks + TTL jitter), penetration (cache nulls/bloom filter), avalanche (TTL jitter).
- Cache hot/read-heavy/expensive data; accept eventual consistency.
