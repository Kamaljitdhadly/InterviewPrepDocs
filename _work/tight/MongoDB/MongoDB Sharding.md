# MongoDB Sharding

## Questions Covered

1. When should you shard a MongoDB deployment?
2. What are the components of a sharded cluster?
3. How do you select a shard key?
4. What is the difference between hashed and ranged shard keys?
5. What is zone sharding and when do you use it?
6. What does the balancer do in a sharded cluster?
7. How does chunk migration work?

## When should you shard a MongoDB deployment?

Sharding **horizontally partitions** data across machines — solves **capacity** and **throughput** limits, not slow queries on small data.

| Signal | Action |
|--------|--------|
| Working set exceeds RAM on largest node | Scale RAM first; shard if still insufficient |
| Sustained write/read throughput exceeds single replica set | Consider sharding |
| Dataset > ~2–3 TB on one node (rule of thumb) | Evaluate sharding |
| Single hot collection dominates I/O | Shard that collection |
| < 100 GB, queries slow | **Index and schema** first — don't shard yet |

**Shard when vertical scaling is exhausted.** Most workloads fit a single replica set with proper indexing.

```javascript
// Check if deployment is a sharded cluster
db.hello().msg          // "isdbgrid" on mongos
sh.status()             // overview: shards, chunks, balancer

// Pre-shard checklist — collection stats
db.orders.stats().size
db.orders.stats().indexSizes
db.orders.getIndexes()
```

```javascript
// Enable sharding on database, then shard a collection
sh.enableSharding("ecommerce");

sh.shardCollection(
  "ecommerce.orders",
  { customerId: 1, orderDate: 1 }   // compound shard key
);
```

**Interview:** Shard for horizontal scale when one replica set can't meet storage/throughput. Optimize indexes and hardware first.

## What are the components of a sharded cluster?

| Component | Role |
|-----------|------|
| **mongos** | Query router; apps connect here |
| **Config servers** | Cluster metadata (shards, chunks, zones) — CSRS replica set |
| **Shards** | Replica sets holding data subsets |
| **Chunks** | Contiguous shard key ranges (~128 MB default) |

```
App → mongos → (metadata from config servers) → target shard replica set(s)
```

- **Targeted:** shard key in filter → single shard.
- **Scatter-gather:** no shard key → all shards, merge results.

```javascript
// Connect to mongos (not directly to shards)
// mongodb://mongos1:27017,mongos2:27017/ecommerce

sh.status()
// shows: shards[], databases[], chunks per shard, balancer state

db.getSiblingDB("config").shards.find().pretty()
db.getSiblingDB("config").collections.find({ _id: /^ecommerce\.orders/ }).pretty()
```

```javascript
// Add a new shard to the cluster
sh.addShard("shard2/rs-shard2/host1:27017,host2:27017,host3:27017")

// List shard connection strings
sh.status().shards
```

**Interview:** mongos routes; config servers store metadata; shards are replica sets. Clients connect to mongos only.

## How do you select a shard key?

Shard key is **immutable** after `sh.shardCollection` (change requires resharding or dump/restore).

| Criterion | Why |
|-----------|-----|
| **High cardinality** | Even distribution |
| **Even distribution** | Avoid hot shard |
| **Query isolation** | Common filter fields → targeted queries |
| **Write distribution** | Monotonic-only keys → hot chunk |

**Good:** `{ userId: 1, createdAt: 1 }`, `{ tenantId: "hashed" }`. **Bad:** `{ status: 1 }`, monotonic `{ _id: 1 }` without hash.

```javascript
// Compound shard key — supports queries on prefix
sh.shardCollection("ecommerce.orders", { customerId: 1, orderDate: 1 });

// Targeted query (includes shard key prefix)
db.orders.find({ customerId: "cust-42", orderDate: { $gte: ISODate("2025-01-01") } });

// Scatter-gather (no shard key) — hits all shards
db.orders.find({ status: "shipped" });
```

```javascript
// Check chunk distribution for a collection
use config
db.chunks.aggregate([
  { $match: { ns: "ecommerce.orders" } },
  { $group: { _id: "$shard", count: { $sum: 1 } } }
])
```

**Interview:** High cardinality, even writes, query-aligned. Compound keys with high-cardinality prefix are common.

## What is the difference between hashed and ranged shard keys?

| Aspect | Ranged | Hashed |
|--------|--------|--------|
| Key type | `{ field: 1 }` | `{ field: "hashed" }` |
| Distribution | Sort order; hot spots on monotonic keys | Spreads monotonic values evenly |
| Range queries | Efficient on shard key | Scatter-gather |
| Sort on shard key | Merge sorted shard results | No cross-shard order on hashed field |

```javascript
// Ranged — good when queries use ranges AND key is high-cardinality / non-monotonic
sh.shardCollection("analytics.events", { region: 1, eventTime: 1 });

db.events.find({
  region: "us-east",
  eventTime: { $gte: ISODate("2025-06-01"), $lt: ISODate("2025-07-01") }
});
```

```javascript
// Hashed — good for monotonic _id or insert-heavy collections
sh.shardCollection("logs.entries", { _id: "hashed" });

// Compound hashed + ranged — hashed tenantId for distribution, storeId for locality
sh.shardCollection("retail.sales", { tenantId: "hashed", storeId: 1 });
```

```javascript
// Explain shows targeted vs scatter-gather
db.orders.find({ customerId: "cust-42" }).explain("executionStats")
// winningPlan.shards[] — single shard = targeted

db.orders.find({ status: "pending" }).explain("executionStats")
// multiple shards = scatter-gather
```

**Interview:** Ranged = order + range scans, hot-spot risk. Hashed = even writes, no range/sort on that field.

## What is zone sharding and when do you use it?

**Zone sharding** assigns chunk ranges to specific shards — **locality** and **tiered storage**.

| Use case | Example |
|----------|---------|
| Geographic compliance | EU data on EU shards |
| Archive / cold tier | Old chunks on cheap storage |
| Tenant isolation | Enterprise tenant on dedicated shard |
| Co-locate related data | `region: "apac"` on APAC hardware |

```javascript
// Define zones on shards
sh.addShardToZone("shard-eu", "EU");
sh.addShardToZone("shard-us", "US");

// Map shard key ranges to zones
sh.updateZoneKeyRange(
  "ecommerce.users",
  { country: "DE" }, { country: "FR" },   // min (inclusive), max (exclusive)
  "EU"
);

sh.updateZoneKeyRange(
  "ecommerce.users",
  { country: "US" }, { country: "ZZ" },
  "US"
);
```

```javascript
// Verify zone configuration
sh.status()
db.getSiblingDB("config").tags.find().pretty()

// Balancer respects zones — migrates chunks to correct shard for their range
sh.enableBalancing("ecommerce.users")
```

**Interview:** Zones pin ranges to shards for geo-compliance, tenant isolation, or storage tiering.

## What does the balancer do in a sharded cluster?

The **balancer** (config server primary) **redistributes chunks** for even spread, respecting zones.

| Behavior | Detail |
|----------|--------|
| Trigger | Imbalance exceeds threshold (~2 chunks) |
| Window | `balancerActiveWindow` for off-peak |
| Paused | `sh.stopBalancer()` during maintenance |
| Jumbo chunks | > 2× chunk size — **not** migrated |

```javascript
// Balancer status
sh.getBalancerState()          // true / false
sh.isBalancerRunning()

sh.status()                    // "balancer" section: active, migrations in progress
```

```javascript
// Schedule balancer — UTC, Sunday 02:00–06:00 only
use config
db.settings.updateOne(
  { _id: "balancer" },
  { $set: {
      activeWindow: {
        start: "02:00",
        stop: "06:00"
      }
    }
  },
  { upsert: true }
)

// Pause during index build or version upgrade
sh.stopBalancer()
// ... maintenance ...
sh.startBalancer()
```

```javascript
// Identify jumbo chunks (block balancing)
db.getSiblingDB("config").chunks.find({ ns: "ecommerce.orders", jumbo: true })

// Split oversized chunk manually if safe
sh.splitFind("ecommerce.orders", { customerId: "cust-999" })
```

**Interview:** Migrates chunks for balance, honors zones, schedulable/pausable. Jumbo chunks block until split.

## How does chunk migration work?

Chunk migration moves a shard key range **without downtime**. Config server coordinates; source/destination shards execute.

**Steps:** select chunk → destination prepares → batch copy + oplog tail → brief write lock → metadata update → source deletes.

| Concern | Mitigation |
|---------|------------|
| I/O load | Balancer window; `rangeMigrationConcurrency` |
| Jumbo chunks | Split first |
| Zone violations | Balancer targets compliant shard |

```javascript
// Watch active migrations
sh.status()
// migrations: [{ _id, when, from, to, ... }]

use config
db.locks.find({ _id: { $regex: /^ecommerce/ } }).pretty()
```

```javascript
// Manual chunk move (emergency / zone fix) — use with care
sh.moveChunk(
  "ecommerce.orders",
  { customerId: "cust-100" },    // bounds of chunk to move
  "shard2"
)

// Split a chunk at a specific shard key value
sh.splitFind("ecommerce.orders", { customerId: "cust-500", orderDate: ISODate("2025-01-01") })
```

```javascript
// Throttle migration concurrency (config server)
use config
db.settings.updateOne(
  { _id: "balancer" },
  { $set: { _secondaryThrottle: true, _waitForDelete: true } }
)
```

**Interview:** Batch copy with oplog tailing, brief lock at cutover, metadata on config servers. Jumbo chunks and I/O are main risks.
