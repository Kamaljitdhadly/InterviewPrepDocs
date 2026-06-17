# MongoDB Performance and Optimization

## Questions Covered

1. What is a good MongoDB index strategy?
2. What is the working set and how does RAM affect performance?
3. How does connection pooling improve MongoDB performance?
4. How do you optimize aggregation pipelines?
5. How should you design schema for read vs write patterns?
6. How does the MongoDB profiler help diagnose slow queries?
7. What are TTL indexes and when do you use them?
8. What monitoring metrics matter for MongoDB?

## What is a good MongoDB index strategy?

Indexes speed reads but cost **write overhead** and **RAM**. Design indexes from real query patterns, not every field.

| Rule | Detail |
|------|--------|
| ESR rule (compound) | **E**quality → **S**ort → **R**ange field order |
| Covered queries | Projection fields ⊆ index keys → no document fetch |
| Partial indexes | Index subset matching filter — smaller, faster |
| Avoid redundant | `{ a: 1 }` is prefix of `{ a: 1, b: 1 }` — drop redundant |
| Multikey limits | One array field per compound index |

```javascript
// Compound index — equality + sort + range (ESR)
db.orders.createIndex({ customerId: 1, status: 1, createdAt: -1 });

db.orders.find({ customerId: "cust-42", status: "open" })
  .sort({ createdAt: -1 })
  .limit(20);
```

```javascript
// Partial index — only index active orders
db.orders.createIndex(
  { customerId: 1, createdAt: -1 },
  { partialFilterExpression: { status: { $eq: "active" } } }
);

// Covered query — index-only
db.orders.find(
  { customerId: "cust-42" },
  { _id: 0, customerId: 1, total: 1 }
).hint({ customerId: 1, total: 1 });
```

```javascript
// Analyze index usage
db.orders.aggregate([{ $indexStats: {} }])

db.orders.find({ sku: "ABC" }).explain("executionStats")
// totalDocsExamined vs nReturned — should be close
// stage: "IXSCAN" not "COLLSCAN"
```

**Interview answer:** Index from `explain()` and slow query logs. ESR ordering for compounds. Drop unused indexes (`$indexStats`). Avoid collection scans on hot paths.

## What is the working set and how does RAM affect performance?

The **working set** is the subset of data and indexes actively accessed. MongoDB uses **WiredTiger cache** (default ~50% RAM) to keep hot data in memory.

| Scenario | Behavior |
|----------|----------|
| Working set fits in cache | Reads from RAM — microsecond latency |
| Working set exceeds cache | Page faults to disk — latency spikes |
| Index not in cache | Even indexed queries slow |

**Sizing:** `storageSize` + `totalIndexSize` from `db.stats()` vs available RAM. Leave headroom for connections and OS.

```javascript
// Database and collection size
db.stats(1024 * 1024)   // MB
db.orders.stats().indexSizes
db.serverStatus().wiredTiger.cache
// "bytes currently in the cache", "pages read into cache", "pages written from cache"
```

```javascript
// Cache hit ratio — monitor over time
const wt = db.serverStatus().wiredTiger.cache;
const readInto = wt["pages read into cache"];
const requested = wt["pages requested from the cache"];
// hit ratio ≈ 1 - (readInto / requested) when requested > 0
```

```javascript
// Force collection scan cost demo
db.orders.find({ notes: /urgent/ }).explain("executionStats")
// executionStats.totalKeysExamined, docsExamined, executionTimeMillis
```

**Interview answer:** Keep working set in RAM for predictable latency. If cache eviction is high, add RAM, shard, or archive cold data. Indexes must also fit in cache.

## How does connection pooling improve MongoDB performance?

Each MongoDB connection consumes **~1 MB RAM** on the server. Opening connections per request is expensive (TCP + TLS + auth handshake).

| Practice | Why |
|----------|-----|
| Pool in app tier | Reuse connections across requests |
| Right-size pool | Too many pools × connections = connection storm |
| `maxPoolSize` | Default 100 — tune per app instance count |
| `minPoolSize` | Warm pool for latency-sensitive apps |
| Single client instance | One `MongoClient` per process — not per request |

```javascript
// Node.js — singleton client with pool options
const { MongoClient } = require("mongodb");

const client = new MongoClient(uri, {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true
});

// Reuse client — do NOT create per request
async function getOrdersCollection() {
  const db = client.db("ecommerce");
  return db.collection("orders");
}
```

```csharp
// .NET — singleton MongoClient (thread-safe)
services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(new MongoClientSettings
    {
        Server = new MongoServerAddress("host", 27017),
        MaxConnectionPoolSize = 100,
        MinConnectionPoolSize = 10
    }));
```

```javascript
// Monitor connections
db.serverStatus().connections
// { current: 245, available: 7755, totalCreated: 12000 }

db.currentOp({ "clientMetadata.application.name": "orders-api" })
```

**Interview answer:** One client per process with a connection pool. Size pool × app instances < server `maxIncomingConnections`. Avoid per-request client creation.

## How do you optimize aggregation pipelines?

Aggregation runs a **pipeline** of stages. Order matters — filter early, project only needed fields, use indexes where possible.

| Optimization | Technique |
|--------------|-----------|
| `$match` first | Reduce documents before heavy stages |
| `$project` early | Drop unneeded fields — less memory |
| `$lookup` sparingly | Joins are expensive; prefer embedding or `$lookup` with pipeline + index |
| `$sort` + `$limit` before `$group` | Top-N patterns |
| `allowDiskUse` | Large sorts/groups spill to disk — slower |
| Index for `$match` / `$sort` | Same as find queries |

```javascript
// Optimized — $match and $project before $group
db.orders.aggregate([
  { $match: { status: "completed", createdAt: { $gte: ISODate("2025-01-01") } } },
  { $project: { customerId: 1, total: 1 } },
  { $group: { _id: "$customerId", revenue: { $sum: "$total" }, count: { $sum: 1 } } },
  { $sort: { revenue: -1 } },
  { $limit: 100 }
]);
```

```javascript
// $lookup with pipeline filter (not full collection scan)
db.customers.aggregate([
  { $match: { region: "us-east" } },
  {
    $lookup: {
      from: "orders",
      let: { cid: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: [ "$customerId", "$$cid" ] }, status: "open" } },
        { $project: { total: 1 } }
      ],
      as: "openOrders"
    }
  }
]);
```

```javascript
db.orders.aggregate(
  [ { $match: { status: "pending" } }, { $count: "n" } ],
  { explain: true }
);
// winningPlan.inputStage.stage === "IXSCAN"
```

**Interview answer:** `$match`/`$project` early, index-backed filters, avoid unbounded `$lookup` and `$group` on large sets. Use `explain` on the pipeline.

## How should you design schema for read vs write patterns?

MongoDB favors **embedded documents** for data read together; **references** for unbounded growth, independent lifecycle, or many-to-many.

| Pattern | Read-optimized | Write-optimized |
|---------|----------------|-----------------|
| Embed | Single query, atomic updates on subtree | Large doc rewrites on small field change |
| Reference | Join via `$lookup` or app-side | Update one doc without touching parent |
| Bucket | Time-series grouped docs (e.g. 100 events/doc) | Reduces index churn vs one doc per event |
| Denormalize | Cache display names on child | Accept duplication; update with care |

```javascript
// Read-optimized — embed line items in order (bounded items per order)
{
  _id: ObjectId("..."),
  customerId: "cust-42",
  status: "shipped",
  items: [
    { sku: "A1", qty: 2, price: 29.99 },
    { sku: "B3", qty: 1, price: 49.99 }
  ],
  total: 109.97
}
```

```javascript
// Write-optimized — reference for high-churn / unbounded (comments)
// orders collection
{ _id: ObjectId("..."), customerId: "cust-42", status: "open" }

// comments collection — indexed by orderId
db.comments.createIndex({ orderId: 1, createdAt: -1 });
db.comments.find({ orderId: ObjectId("...") }).sort({ createdAt: -1 }).limit(50);
```

```javascript
// Bucket pattern — IoT / time-series (one doc per hour per sensor)
{
  sensorId: "s-100",
  hour: ISODate("2025-06-17T14:00:00Z"),
  readings: [
    { t: ISODate("2025-06-17T14:00:01Z"), temp: 22.1 },
    { t: ISODate("2025-06-17T14:00:02Z"), temp: 22.3 }
  ],
  count: 3600
}
```

**Interview answer:** Embed when data is read together and bounded; reference when unbounded or independently updated. Bucket for high-ingest time-series.

## How does the MongoDB profiler help diagnose slow queries?

The **database profiler** records operations exceeding a **slowms** threshold to `system.profile`.

| Level | Records |
|-------|---------|
| 0 | Off |
| 1 | Slow ops only |
| 2 | All ops (dev only — high overhead) |

```javascript
// Enable profiling — slow ops > 100ms
db.setProfilingLevel(1, { slowms: 100, filter: { op: { $in: [ "query", "command", "update" ] } } });

// Inspect slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5).pretty();
// fields: millis, ns, command, planSummary, docsExamined, keysExamined
```

```javascript
// Find worst offenders — high docsExamined ratio
db.system.profile.aggregate([
  { $match: { op: "query", millis: { $gt: 200 } } },
  { $project: {
      ns: 1, millis: 1,
      docsExamined: "$docsExamined",
      nreturned: "$nreturned",
      plan: "$planSummary"
    }
  },
  { $sort: { millis: -1 } },
  { $limit: 10 }
]);
```

```javascript
// Disable after diagnosis
db.setProfilingLevel(0);

// Atlas / FTDC — prefer Performance Advisor and Query Insights in production
```

**Interview answer:** Profiler level 1 with `slowms` for dev/staging diagnosis. Look for COLLSCAN, high `docsExamined` vs `nreturned`. Use Atlas Performance Advisor in production.

## What are TTL indexes and when do you use them?

**TTL indexes** expire documents automatically after a specified seconds on a **date field**. Background thread removes expired docs (~60s granularity).

| Use case | Field |
|----------|-------|
| Session data | `expiresAt` |
| Logs / events | `createdAt` |
| Cache entries | `cachedAt` |
| OTP / tokens | `validUntil` |

**Constraints:** Single date field; cannot TTL partial subsets without compound tricks; replication delay can briefly show expired docs.

```javascript
// Expire sessions 24 hours after createdAt
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
);

// Fixed expiry time — expireAfterSeconds: 0 expires at exact date in field
db.tokens.createIndex(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

```javascript
// TTL on nested field
db.events.createIndex(
  { "metadata.retentionDate": 1 },
  { expireAfterSeconds: 0 }
);

// Check TTL monitor
db.serverStatus().metrics.ttl
// deletedDocuments, passes
```

**Interview answer:** TTL for automatic cleanup of ephemeral data (sessions, logs). Use `expireAfterSeconds` offset or `0` for absolute expiry. Not a replacement for archival to cold storage.

## What monitoring metrics matter for MongoDB?

Monitor **throughput**, **latency**, **resource saturation**, and **replication health**.

| Metric | Source | Alert on |
|--------|--------|----------|
| Opcounters | `serverStatus.opcounters` | Sudden drop or spike |
| Query latency | `opcounters`, profiler, Atlas | p95 > SLA |
| WiredTiger cache | `wiredTiger.cache` | High eviction, low hit ratio |
| Connections | `serverStatus.connections` | Near `maxConnections` |
| Replication lag | `rs.printSecondaryReplicationInfo()` | Lag > seconds (workload-dependent) |
| Page faults | `extra_info.page_faults` | Sustained increase |
| Disk I/O | OS / cloud metrics | Saturation with cache misses |
| Queue | `globalLock` (legacy) / `flows` | Write contention |

```javascript
// Key serverStatus sections
const ss = db.serverStatus();
ss.opcounters;
ss.connections;
ss.wiredTiger.cache["maximum bytes configured"];
ss.wiredTiger.cache["tracked dirty bytes in the cache"];
ss.metrics.cursor.open;
ss.mem.resident;   // MB (legacy metric name)
```

```javascript
// Replication lag
rs.printSecondaryReplicationInfo()
rs.status().members.forEach(m =>
  print(m.name, m.stateStr, m.optimeDate, m.lastHeartbeatRecv)
);
```

```javascript
// Atlas / Prometheus exporters — common alert rules
// - replication lag > 10s
// - connections > 80% max
// - disk usage > 85%
// - query targeting: scanned / returned > 1000
```

**Interview answer:** Watch opcounters, cache eviction, connections, replication lag, and disk. Use `explain` + Performance Advisor for query-level issues. Alert before saturation, not after outage.
