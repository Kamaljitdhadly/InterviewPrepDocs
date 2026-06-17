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

Sharding **horizontally partitions** data across multiple machines. It solves **capacity** (disk, RAM, I/O) and **throughput** limits of a single replica set — not slow queries on a small dataset.

| Signal | Action |
|--------|--------|
| Working set exceeds RAM on largest node | Scale RAM first; shard if still insufficient |
| Sustained write/read throughput exceeds single replica set | Consider sharding |
| Dataset > ~2–3 TB on one node (rule of thumb) | Evaluate sharding |
| Single hot collection dominates I/O | Shard that collection |
| < 100 GB, queries slow | **Index and schema** first — don't shard yet |

**Shard when vertical scaling is exhausted** and you need horizontal scale. A single replica set handles most workloads up to terabyte scale with proper indexing.

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

**Interview answer:** Shard for horizontal scale when a single replica set cannot meet storage or throughput needs. Always optimize indexes, schema, and hardware first.

## What are the components of a sharded cluster?

| Component | Role |
|-----------|------|
| **mongos** | Query router; apps connect here; routes queries to correct shards |
| **Config servers** | Store cluster metadata (shard list, chunk ranges, zones) as a CSRS replica set |
| **Shards** | Each shard is a **replica set** holding a subset of data |
| **Chunks** | Contiguous range of shard key values (default ~128 MB) |

```
App → mongos → (metadata from config servers) → target shard replica set(s)
```

- **Targeted query:** mongos knows exact shard from shard key in filter → single shard.
- **Scatter-gather:** no shard key in filter → mongos hits all shards, merges results.
- Config servers are critical — always deploy as a 3-node replica set (CSRS).

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

**Interview answer:** mongos routes queries; config servers store metadata; each shard is a replica set. Clients never connect to shards directly in production.

## How do you select a shard key?

The shard key is **immutable** after `sh.shardCollection` (changing it requires dump/restore or resharding). Choose carefully.

| Criterion | Why |
|-----------|-----|
| **High cardinality** | Many distinct values → even distribution |
| **Even distribution** | Avoid one value owning most data (hot shard) |
| **Query isolation** | Include fields used in common filters → targeted queries |
| **Write distribution** | Monotonic keys (timestamp alone) → all writes to one chunk |

**Good patterns:**

- `{ userId: 1, createdAt: 1 }` — user-scoped queries target one shard; time adds cardinality.
- `{ tenantId: "hashed" }` — multi-tenant SaaS with even spread.

**Bad patterns:**

- `{ status: 1 }` — low cardinality (`active`/`inactive`).
- `{ _id: 1 }` on ObjectId — monotonic inserts pile on latest chunk unless hashed.

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

**Interview answer:** High cardinality, even writes, and alignment with query patterns. Compound keys with a high-cardinality prefix plus a secondary discriminator are common.

## What is the difference between hashed and ranged shard keys?

| Aspect | Ranged | Hashed |
|--------|--------|--------|
| Key type | `{ field: 1 }` or `{ a: 1, b: 1 }` | `{ field: "hashed" }` |
| Distribution | Preserves sort order; risk of hot spots on monotonic keys | Spreads monotonic values (ObjectId, timestamp) evenly |
| Range queries | Efficient on shard key | Inefficient — scatter-gather |
| Sort on shard key | Can merge sorted results from shards | Cannot use index order across shards for hashed field |

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

**Interview answer:** Ranged preserves order and supports range scans but hot-spots on monotonic keys. Hashed distributes writes evenly but kills range/sort efficiency on that field.

## What is zone sharding and when do you use it?

**Zone sharding** (tag-aware sharding) assigns chunk ranges to specific shards — data **locality** and **tiered storage**.

| Use case | Example |
|----------|---------|
| Geographic compliance | EU data on EU shards only |
| Archive / cold tier | Old chunks on cheap storage shards |
| Tenant isolation | Enterprise tenant pinned to dedicated shard |
| Co-locate related data | All `region: "apac"` chunks on APAC hardware |

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

**Interview answer:** Zones pin chunk ranges to named shards for geo-compliance, tenant isolation, or storage tiering. The balancer migrates chunks to satisfy zone rules.

## What does the balancer do in a sharded cluster?

The **balancer** is a background process on the config server primary that **redistributes chunks** so data is evenly spread across shards (respecting zone constraints).

| Behavior | Detail |
|----------|--------|
| Trigger | Chunk imbalance exceeds threshold (~2 chunks or size difference) |
| Runs on | Config server primary only |
| Window | Configurable schedule (`balancerActiveWindow`) for off-peak migration |
| Paused | `sh.stopBalancer()` / `sh.setBalancerState(false)` during maintenance |
| Jumbo chunks | Chunks > max size (default 2× chunk size) are **not** migrated |

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

**Interview answer:** The balancer migrates chunks between shards for even distribution, honors zones, and can be scheduled or paused. Jumbo chunks block migration until split.

## How does chunk migration work?

Chunk migration moves a chunk (shard key range) from one shard to another **without downtime**. The config server coordinates; source and destination shards execute the transfer.

**Migration steps (simplified):**

1. Balancer selects imbalanced chunk on source shard.
2. Destination creates receiving range; config metadata updated to `pending`.
3. Source **migrates documents** in batches; tracks oplog for changes during copy.
4. Source acquires **write lock** briefly for final sync.
5. Config metadata points chunk to destination; source deletes local copy.

| Concern | Mitigation |
|---------|------------|
| Migration I/O load | Schedule balancer window; limit `rangeMigrationConcurrency` |
| Jumbo chunks | Split before migrate |
| Long migrations | Monitor `sh.status()` migrations array |
| Zone violations | Balancer targets zone-compliant shard |

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

**Interview answer:** Chunks migrate in batches with oplog tailing, a brief write lock at cutover, and metadata update on the config servers. Jumbo chunks and I/O contention are the main operational risks.
