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

Indexes speed reads; cost **write overhead** and **RAM**. Design from real query patterns.

| Rule | Detail |
|------|--------|
| ESR rule | **E**quality → **S**ort → **R**ange |
| Covered queries | Projection ⊆ index keys |
| Partial indexes | Smaller index on filtered subset |
| Avoid redundant | `{ a: 1 }` prefix of `{ a: 1, b: 1 }` |

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

**Interview:** Index from `explain()` and slow logs. ESR for compounds. Drop unused (`$indexStats`). No COLLSCAN on hot paths.

## What is the working set and how does RAM affect performance?

**Working set** = actively accessed data + indexes. WiredTiger cache (default ~50% RAM) holds hot data.

| Scenario | Behavior |
|----------|----------|
| Fits in cache | RAM reads — low latency |
| Exceeds cache | Page faults — latency spikes |
| Index not cached | Indexed queries still slow |

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

**Interview:** Keep working set in RAM. High eviction → add RAM, shard, or archive. Indexes must fit cache too.

## How does connection pooling improve MongoDB performance?

Each connection ≈ **1 MB server RAM**. Per-request connections waste TCP + TLS + auth.

| Practice | Why |
|----------|-----|
| Pool in app | Reuse across requests |
| Right-size | Many instances × pool = storm |
| `maxPoolSize` | Default 100 — tune per instance |
| Single client | One `MongoClient` per process |

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

**Interview:** One client per process with pool. pool × instances < `maxIncomingConnections`. Never per-request clients.

## How do you optimize aggregation pipelines?

Order matters — filter early, project needed fields only, index-backed `$match`.

| Optimization | Technique |
|--------------|-----------|
| `$match` first | Reduce docs before heavy stages |
| `$project` early | Less memory |
| `$lookup` sparingly | Pipeline + index on foreign field |
| `$sort` + `$limit` before `$group` | Top-N |
| Index `$match`/`$sort` | Same as find |

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

**Interview:** `$match`/`$project` early, index-backed filters, bounded `$lookup`/`$group`. Use `explain`.

## How should you design schema for read vs write patterns?

**Embed** data read together; **reference** unbounded/independent data.

| Pattern | Read-optimized | Write-optimized |
|---------|----------------|-----------------|
| Embed | Single query, atomic subtree | Large doc rewrites |
| Reference | `$lookup` or app join | Update one doc |
| Bucket | Time-series grouped docs | Less index churn |
| Denormalize | Cached display fields | Accept duplication |

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

**Interview:** Embed when bounded + read together; reference when unbounded. Bucket for high-ingest time-series.

## How does the MongoDB profiler help diagnose slow queries?

Profiler records ops exceeding **slowms** to `system.profile`.

| Level | Records |
|-------|---------|
| 0 | Off |
| 1 | Slow ops only |
| 2 | All (dev only) |

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

**Interview:** Level 1 + `slowms` for diagnosis. Watch COLLSCAN, `docsExamined` vs `nreturned`. Atlas Performance Advisor in prod.

## What are TTL indexes and when do you use them?

**TTL indexes** auto-expire docs after seconds on a **date field**. Background thread removes (~60s granularity).

| Use case | Field |
|----------|-------|
| Sessions | `expiresAt` |
| Logs | `createdAt` |
| Cache | `cachedAt` |

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

**Interview:** TTL for ephemeral data (sessions, logs). Offset or `0` for absolute expiry. Not archival to cold storage.

## What monitoring metrics matter for MongoDB?

Monitor **throughput**, **latency**, **saturation**, **replication**.

| Metric | Alert on |
|--------|----------|
| Opcounters | Sudden drop/spike |
| WiredTiger cache | High eviction |
| Connections | Near max |
| Replication lag | Lag > SLA |
| Page faults | Sustained increase |

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

**Interview:** Opcounters, cache eviction, connections, replication lag, disk. `explain` + Performance Advisor for queries. Alert before saturation.
