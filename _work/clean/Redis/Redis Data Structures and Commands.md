# Redis Data Structures and Commands

## Questions Covered

1. What data structures does Redis support?
2. How do Redis strings work, and what are common commands?
3. What are Redis hashes, and when should you use them?
4. What are lists, and how are they used for queues?
5. What are sets and sorted sets?
6. What are Redis streams?
7. What is pub/sub in Redis?
8. What are pipelines and transactions (MULTI/EXEC)?
9. What is Lua scripting in Redis?
10. What commands should you avoid in production?
11. How do you inspect and debug Redis data?
12. How do Redis modules extend functionality?

## What data structures does Redis support?

| Structure | Use case |
|-----------|----------|
| **String** | Cache blob, counter, lock |
| **Hash** | Object fields (user profile) |
| **List** | Queue, recent items |
| **Set** | Unique tags, friends |
| **Sorted set (ZSET)** | Leaderboard, priority queue |
| **Stream** | Event log, consumer groups |
| **Bitmap / HyperLogLog / GEO** | Analytics, cardinality, location |

All keys are **binary-safe strings**; structure type is per key.

## How do Redis strings work, and what are common commands?

```bash
SET product:42 "{\"name\":\"Widget\",\"price\":9.99}"
GET product:42

SET counter 0
INCR counter
INCRBY counter 5

SET lock:order:99 "owner-1" NX EX 30   # set if not exists, 30s TTL
```

| Command | Purpose |
|---------|---------|
| `GET` / `SET` | Read/write |
| `MGET` / `MSET` | Batch |
| `INCR` / `DECR` | Atomic counters |
| `SET NX EX` | Distributed lock pattern |
| `APPEND` | Extend string |

Max value size ~512 MB — prefer smaller JSON chunks.

## What are Redis hashes, and when should you use them?

Field-value map under one key — efficient for objects:

```bash
HSET user:42 name "Ada" email "ada@example.com" tier "gold"
HGET user:42 name
HGETALL user:42
HDEL user:42 tier
HINCRBY user:42 loginCount 1
```

| vs String JSON | Hash advantage |
|----------------|----------------|
| Update one field | No read-modify-write whole blob |
| Memory | Often more compact for small objects |

Use hash for **session data**, **user profiles**, **cart line metadata**.

## What are lists, and how are they used for queues?

Doubly linked lists — FIFO queue pattern:

```bash
LPUSH jobs "job-1"
LPUSH jobs "job-2"
BRPOP jobs 30          # blocking pop, 30s timeout → "job-1" (FIFO with LPUSH+BRPOP)
```

| Pattern | Commands |
|---------|----------|
| **Simple queue** | LPUSH + BRPOP |
| **Reliable queue** | RPOPLPUSH to processing list |
| **Recent N** | LPUSH + LTRIM 0 99 |

For **durable** workloads prefer **Streams** or external broker (RabbitMQ).

## What are sets and sorted sets?

**Set** — unique unordered members:

```bash
SADD product:42:tags electronics sale
SISMEMBER product:42:tags sale
SINTER tag:sale tag:electronics    # products in both tags (if tag → product sets)
```

**Sorted set (ZSET)** — member + score:

```bash
ZADD leaderboard 9850 "player:ada"
ZADD leaderboard 9200 "player:bob"
ZREVRANGE leaderboard 0 9 WITHSCORES   # top 10
ZRANK leaderboard "player:ada"
ZINCRBY leaderboard 100 "player:bob"
```

Perfect for **rankings**, **delayed jobs** (score = timestamp), **rate limiting windows**.

## What are Redis streams?

Append-only log with consumer groups — Kafka-lite:

```bash
XADD orders * customerId 42 total 199.99
XREAD COUNT 10 STREAMS orders 0

XGROUP CREATE orders fulfillment $ MKSTREAM
XREADGROUP GROUP fulfillment consumer1 COUNT 1 STREAMS orders >
XACK orders fulfillment 1699999999-0
```

| Feature | Benefit |
|---------|---------|
| **Consumer groups** | Competing consumers |
| **Persistence** | Replay events |
| **ACK** | At-least-once processing |

## What is pub/sub in Redis?

Fire-and-forget messaging — no persistence:

```bash
SUBSCRIBE notifications
PUBLISH notifications "order-shipped:123"
```

| Pub/sub | Streams |
|---------|---------|
| No history | Retained log |
| All subscribers online | Consumer groups |
| Low latency broadcast | Event sourcing lite |

Use pub/sub for **live UI updates** (with SignalR backplane); not for critical business events.

## What are pipelines and transactions (MULTI/EXEC)?

**Pipeline** — batch commands, one round-trip (not atomic):

```csharp
var batch = db.CreateBatch();
batch.StringSetAsync("a", "1");
batch.StringSetAsync("b", "2");
batch.Execute();
```

**Transaction:**

```bash
MULTI
INCR account:42:balance
DECR account:99:balance
EXEC
```

`WATCH key` — optimistic locking; `EXEC` fails if key changed.

## What is Lua scripting in Redis?

Atomic server-side logic:

```bash
EVAL "return redis.call('GET', KEYS[1])" 1 mykey
```

```lua
-- Rate limit: max 10 requests per key in window
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
```

Scripts run **atomically** — good for complex compare-and-set.

## What commands should you avoid in production?

| Command | Problem | Alternative |
|---------|---------|-------------|
| `KEYS pattern` | Blocks server O(N) | `SCAN` |
| `FLUSHALL` | Deletes everything | ACL restrict |
| `DEBUG` | Dangerous | Disable |
| Huge `HGETALL` / `SMEMBERS` | Memory spike | Pagination, `HSCAN` |

Monitor **slowlog** for hot keys and expensive ops.

## How do you inspect and debug Redis data?

```bash
TYPE user:42
TTL user:42
MEMORY USAGE user:42
SCAN 0 MATCH session:* COUNT 100
MONITOR          # dev only — high overhead
INFO stats
SLOWLOG GET 10
```

Redis Insight / Azure Portal metrics for GUI profiling.

## How do Redis modules extend functionality?

| Module | Adds |
|--------|------|
| **RediSearch** | Full-text search |
| **RedisJSON** | Native JSON |
| **RedisBloom** | Bloom filters |
| **RedisTimeSeries** | Time-series metrics |

Azure Cache for Redis supports selected modules on Enterprise tiers.

## Related Topics

- Redis/Redis Basics.md
- Redis/Redis Caching Patterns.md
- System Design/System Design Basics.md
