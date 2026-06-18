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

Redis is **not** just string key-value. Each key has a **type** that determines available commands:

| Structure | Redis type | Typical use |
|-----------|------------|-------------|
| **String** | `string` | JSON blob, counter, lock token |
| **Hash** | `hash` | Object with fields (user, session) |
| **List** | `list` | Queue, activity feed (recent N) |
| **Set** | `set` | Unique tags, followers |
| **Sorted set** | `zset` | Leaderboard, delayed jobs |
| **Stream** | `stream` | Event log, consumer groups |
| **Bitmap / HyperLogLog / GEO** | special | Analytics, unique counts, location |

```bash
TYPE user:42          # → hash
TYPE leaderboard      # → zset
```

All **key names** are binary-safe strings (`user:42`, `session:abc`). Choose a **naming convention** early: `{service}:{entity}:{id}`.

## How do Redis strings work, and what are common commands?

The **string** type is the most common — stores binary-safe data up to **512 MB** (keep values much smaller in practice):

```bash
SET product:42 "{\"name\":\"Widget\",\"price\":9.99}"
GET product:42

SET page:home:html "<html>...</html>" EX 300    # cache with 5 min TTL

SET counter 0
INCR counter              # atomic → 1
INCRBY counter 5          # → 6

SET lock:order:99 "uuid-token-abc" NX EX 30     # only if not exists, 30s TTL
```

| Command | Purpose |
|---------|---------|
| `GET` / `SET` | Basic read/write |
| `MGET` / `MSET` | Batch read/write — one round-trip |
| `INCR` / `DECR` / `INCRBY` | Atomic counters (views, rate limits) |
| `SET key value NX EX ttl` | Distributed lock acquire |
| `APPEND` | Append to string |
| `GETSET` | Set and return old value |

**SET options interview note:**
- `NX` — set only if **not** exists
- `XX` — set only if **exists**
- `EX seconds` / `PX milliseconds` — expiry

Use strings for **serialized JSON cache entries** and **simple counters**. If you update individual fields often, use a **hash** instead.

## What are Redis hashes, and when should you use them?

A **hash** stores field → value pairs under one key — like a small dictionary:

```bash
HSET user:42 name "Ada" email "ada@example.com" tier "gold" loginCount 5
HGET user:42 name                    # → "Ada"
HMGET user:42 name email             # multiple fields
HGETALL user:42                      # all fields — OK for small hashes only
HINCRBY user:42 loginCount 1         # atomic field increment
HDEL user:42 tier
HEXISTS user:42 email                # → 1
```

| String (JSON) | Hash |
|---------------|------|
| Update one field = GET + deserialize + modify + SET | `HSET` one field directly |
| Whole blob transferred on read | Fetch only needed fields with `HMGET` |
| Good for immutable cached DTOs | Good for **sessions**, **profiles**, **cart metadata** |

```bash
# Session example
HSET session:abc userId 42 roles "[\"Admin\"]" lastSeen 1718640000
EXPIRE session:abc 28800    # 8 hours
```

**Memory tip:** Hashes use ziplist/listpack encoding for small hashes — very efficient for session-sized objects.

## What are lists, and how are they used for queues?

**Lists** are doubly linked lists — fast push/pop at head or tail:

```bash
LPUSH jobs "job-3" "job-2" "job-1"    # stack order at head
BRPOP jobs 30                           # blocking pop from tail → "job-1" (FIFO)
```

| Pattern | Commands | Behavior |
|---------|----------|----------|
| **FIFO queue** | `LPUSH` + `BRPOP` | Producer left, consumer right |
| **Reliable queue** | `RPOPLPUSH source processing` | Move to processing list; ACK removes |
| **Recent items** | `LPUSH` + `LTRIM 0 99` | Keep last 100 activity events |
| **Blocking workers** | `BRPOP` with timeout | Workers wait for jobs without polling |

```text
Producer: LPUSH jobs {payload}
Worker:   BRPOP jobs 0     ← blocks until job available
```

**Limitations:** No ack/replay like Kafka. For **durable job processing**, prefer **Streams** or RabbitMQ/Azure Service Bus. Lists work for **best-effort background tasks** (send email, resize image).

## What are sets and sorted sets?

**Set** — unordered collection of **unique** members:

```bash
SADD product:42:tags "electronics" "sale" "featured"
SISMEMBER product:42:tags "sale"           # → 1 (true)
SMEMBERS product:42:tags                   # all members
SINTER tag:sale:products tag:electronics:products   # products in BOTH tags
SUNION tag:sale:products tag:clearance:products
SCARD product:42:tags                      # count
```

**Sorted set (ZSET)** — unique members each with a **numeric score** (sorted by score):

```bash
ZADD leaderboard 9850 "player:ada"
ZADD leaderboard 9200 "player:bob"
ZINCRBY leaderboard 100 "player:bob"       # bob → 9300

ZREVRANGE leaderboard 0 9 WITHSCORES      # top 10 high scores
ZRANK leaderboard "player:ada"            # 0-based rank ascending
ZREVRANK leaderboard "player:ada"         # rank descending (games)
ZCOUNT leaderboard 9000 10000             # count in score range
```

| Structure | Use when |
|-----------|----------|
| **Set** | Unique tags, "users online" set, mutual followers check |
| **ZSET** | Leaderboards, **priority queues**, **sliding rate limits** (score = timestamp) |

**Delayed jobs pattern:** `ZADD delayed_jobs {execute_at_timestamp} {job_id}` — worker polls `ZRANGEBYSCORE` for due jobs.

## What are Redis streams?

**Streams** are append-only logs — closest Redis built-in to a **message broker**:

```bash
# Producer
XADD orders * customerId 42 total 199.99 status pending
# Returns ID like 1718640000123-0

# Consumer reads history
XREAD COUNT 10 STREAMS orders 0

# Consumer group (competing consumers, at-least-once)
XGROUP CREATE orders fulfillment $ MKSTREAM
XREADGROUP GROUP fulfillment worker1 COUNT 1 BLOCK 5000 STREAMS orders >
XACK orders fulfillment 1718640000123-0
```

| Feature | Benefit |
|---------|---------|
| **Persistent log** | Replay from offset |
| **Consumer groups** | Partition work across workers |
| **ACK** | Message processed confirmation |
| **Pending entries** | Reclaim stuck messages with `XCLAIM` |

**Streams vs pub/sub:** Streams **retain** messages; pub/sub drops if no subscriber is listening. Use Streams for **order events** you might replay; pub/sub for **live notifications** only.

## What is pub/sub in Redis?

**Publish/subscribe** is a fire-and-forget broadcast channel — no storage:

```bash
# Subscriber (blocking connection)
SUBSCRIBE notifications
# receives: order-shipped:123, user-joined:456, ...

# Publisher
PUBLISH notifications "order-shipped:123"
```

| Pub/sub | Streams | Message broker (Kafka/RabbitMQ) |
|---------|---------|--------------------------------|
| No message history | Retained log | Durable queues, DLQ |
| Subscribers must be online | Consumer groups catch up | Full enterprise messaging |
| Microsecond latency | ms latency | ms–s latency |
| Simple broadcast | Event sourcing lite | Workflows, transactions |

**Real uses:** SignalR **backplane** (scale WebSocket across servers), live dashboard updates, cache invalidation broadcast. **Not** for payment processing or anything requiring guaranteed delivery.

## What are pipelines and transactions (MULTI/EXEC)?

**Pipeline** — send multiple commands without waiting for each response; **one network round-trip**. Not atomic — other clients can interleave.

```csharp
// StackExchange.Redis — batch/pipeline
var batch = db.CreateBatch();
var t1 = batch.StringSetAsync("a", "1");
var t2 = batch.StringSetAsync("b", "2");
batch.Execute();
await Task.WhenAll(t1, t2);
```

**Transaction (`MULTI`/`EXEC`)** — queued commands execute **atomically** as a block:

```bash
MULTI
INCR account:42:balance
DECR account:99:balance
EXEC
# Both succeed or neither (if WATCH didn't fail)
```

**Optimistic locking with `WATCH`:**

```bash
WATCH account:42:balance
val = GET account:42:balance
MULTI
SET account:42:balance {val - 100}
EXEC
# EXEC fails if balance changed between WATCH and EXEC → retry
```

Use pipelines for **performance**; transactions/`WATCH` for **atomic read-modify-write** without Lua.

## What is Lua scripting in Redis?

Lua scripts run **atomically** on the server — no other command runs mid-script. Ideal for complex compare-and-set (rate limits, locks):

```lua
-- KEYS[1] = rate limit key, ARGV[1] = window seconds, ARGV[2] = max requests
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
if current > tonumber(ARGV[2]) then
  return 0   -- rejected
end
return 1     -- allowed
```

```bash
EVAL "<script>" 1 ratelimit:user:42 60 100
```

**Safe lock release** (only delete if token matches):

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
else
  return 0
end
```

Keep scripts **short** — long scripts block Redis single-threaded event loop.

## What commands should you avoid in production?

Redis is **single-threaded** for command processing — one slow command blocks everything:

| Command | Problem | Alternative |
|---------|---------|-------------|
| `KEYS pattern` | O(N) full key scan, blocks server | `SCAN cursor MATCH pattern COUNT 100` |
| `FLUSHALL` / `FLUSHDB` | Deletes everything | ACL disable; rename command |
| `DEBUG` | Dangerous introspection | Disable in prod |
| Large `HGETALL` / `SMEMBERS` | Huge memory allocation | `HSCAN`, `SSCAN`, fetch subset |
| `MONITOR` | Streams every command — massive overhead | Dev/debug only, seconds max |

```bash
SCAN 0 MATCH session:* COUNT 100    # iterative, non-blocking
```

Enable **slowlog** (`SLOWLOG GET 10`) and alert on commands > 10 ms.

## How do you inspect and debug Redis data?

```bash
TYPE user:42                 # key's data structure
TTL user:42                  # seconds until expiry
PTTL user:42                 # milliseconds
MEMORY USAGE user:42         # bytes (Redis 4+)
OBJECT ENCODING user:42      # internal encoding (ziplist, etc.)

SCAN 0 MATCH product:* COUNT 200   # iterate keys safely

INFO memory                  # used_memory, peak
INFO stats                   # ops/sec, evicted_keys
SLOWLOG GET 20

# Dev only — never leave running in prod
MONITOR
```

**GUI tools:** Redis Insight (free), Azure Portal metrics for Azure Cache for Redis (CPU, memory, connections, server load).

**Debugging cache miss spike:** Check if TTL expired together (stampede), hot key saturation, or eviction policy removing needed keys.

## How do Redis modules extend functionality?

Redis modules add new commands and types without forking Redis:

| Module | Adds | Use case |
|--------|------|----------|
| **RedisJSON** | `JSON.SET`, `JSON.GET` path queries | Document storage in Redis |
| **RediSearch** | Full-text search, secondary indexes | Product search |
| **RedisBloom** | Bloom / Cuckoo filters | "Probably exists" checks |
| **RedisTimeSeries** | Time-series metrics | IoT, monitoring |
| **RedisGraph** | Graph queries | Relationship data (niche) |

**Azure Cache for Redis Enterprise** supports RedisJSON, RediSearch, etc. on Enterprise tier. Self-hosted or Redis Cloud can load modules freely.

**Interview note:** Know modules exist — you may not hand-write RediSearch queries, but "we cache JSON with RedisJSON for partial updates" is a strong answer.

## Related Topics

- Redis/Redis Basics.md
- Redis/Redis Caching Patterns.md
- Redis/Redis with .NET and Node.js.md
- System Design/System Design Basics.md
