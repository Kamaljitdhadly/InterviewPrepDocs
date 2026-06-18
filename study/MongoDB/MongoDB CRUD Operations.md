# MongoDB CRUD Operations

## Questions Covered

1. How do `insertOne` and `insertMany` work?
2. How do you query documents with `find` and filters?
3. What is projection and how do you limit returned fields?
4. How do `updateOne`, `updateMany`, and `replaceOne` differ?
5. How do `deleteOne` and `deleteMany` work?
6. What is an upsert and when should you use it?
7. How does `bulkWrite` batch mixed operations?
8. What is write concern and how do you configure it?
9. What is read concern and how does it affect query results?
10. How do you design idempotent writes in MongoDB?

## How do `insertOne` and `insertMany` work?

**Insert** adds documents to a collection. `_id` auto-generated if omitted. Atomic **per document** — use transactions for all-or-nothing batches.

| Method | Behavior |
|--------|----------|
| `insertOne(doc)` | Single document |
| `insertMany([docs])` | Batch; `ordered: false` continues on errors |

```javascript
// insertOne — basic
const one = db.customers.insertOne({
  email: "dana@example.com",
  name: "Dana Rivera",
  tier: "gold",
  createdAt: new Date()
});
one.acknowledged;    // true
one.insertedId;      // ObjectId(...)

// insertMany — ordered batch (stops on duplicate key if _id collides)
db.products.insertMany([
  { sku: "A-100", name: "Cable", price: NumberDecimal("12.99") },
  { sku: "B-200", name: "Adapter", price: NumberDecimal("24.50") },
  { sku: "C-300", name: "Dock", price: NumberDecimal("89.00") }
], { ordered: true });

// insertMany unordered — useful for parallel ingest; partial success OK
db.events.insertMany(
  [
    { eventId: "evt-1", type: "click", ts: new Date() },
    { eventId: "evt-2", type: "view", ts: new Date() },
    { eventId: "evt-1", type: "duplicate" }  // may fail; others still insert if unordered
  ],
  { ordered: false }
);
```

```javascript
// Node.js driver — insert with error handling and write concern
const { MongoClient } = require("mongodb");

async function seedProducts(collection) {
  try {
    const result = await collection.insertMany(
      [
        { sku: "SKU-001", active: true },
        { sku: "SKU-002", active: true }
      ],
      { ordered: false, writeConcern: { w: "majority" } }
    );
    return result.insertedCount;
  } catch (err) {
    if (err.code === 11000) {
      // duplicate key — handle partial batch in unordered mode
      console.log("Duplicates skipped:", err.writeErrors?.length);
    }
    throw err;
  }
}
```

Use **unique indexes** on business keys; batch hundreds–thousands per `insertMany`; transactions when all-or-nothing required.

## How do you query documents with `find` and filters?

`find(filter, projection)` returns a **cursor**. Filters use query operators.

| Operator | Example |
|----------|---------|
| `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte` | `{ price: { $gte: 10 } }` |
| `$in`, `$nin` | `{ sku: { $in: ["A", "B"] } }` |
| `$and`, `$or` | `{ $or: [{ tier: "gold" }, { points: { $gt: 1000 } }] }` |
| `$exists`, `$regex` | `{ phone: { $exists: true } }` |
| `$elemMatch`, `$all` | Array matching |

```javascript
// Equality shorthand — { field: value } is { field: { $eq: value } }
db.orders.find({ status: "shipped", "customer.country": "US" });

// Range + sort + limit
db.orders.find({
  placedAt: { $gte: ISODate("2024-01-01"), $lt: ISODate("2024-07-01") },
  total: { $gt: 50 }
})
  .sort({ placedAt: -1 })
  .limit(20);

// $or with index awareness — compound indexes matter for performance
db.users.find({
  $or: [
    { email: "alice@example.com" },
    { "profile.handle": "@alice" }
  ]
});
```

```javascript
// findOne — single doc or null
const user = db.users.findOne({ email: "bob@example.com" });

// Cursor methods
db.products.find({ active: true })
  .skip(100)
  .limit(50)
  .forEach(doc => print(doc.sku));

// Count without fetching all docs (use estimated for unfiltered on large collections)
db.products.countDocuments({ active: true });
db.products.estimatedDocumentCount();  // metadata-based, no filter
```

Use `.explain("executionStats")` — **COLLSCAN** on large collections is a red flag.

## What is projection and how do you limit returned fields?

**Projection** selects returned fields — reduces payload and memory.

| Syntax | Effect |
|--------|--------|
| `{ field: 1 }` | Include (`_id` default on) |
| `{ field: 0 }` | Exclude |
| `{ _id: 0 }` | Exclude `_id` |

Supports `$`, `$elemMatch`, `$slice` for arrays.

```javascript
// Include only name and email; suppress _id
db.users.find(
  { tier: "gold" },
  { _id: 0, name: 1, email: 1 }
);

// Exclude large embedded array from list endpoint
db.articles.find(
  { published: true },
  { title: 1, author: 1, summary: 1, comments: 0 }
);

// $slice — paginate embedded array (detail view pattern)
db.posts.findOne(
  { _id: ObjectId("...") },
  { title: 1, comments: { $slice: [0, 10] } }  // first 10 comments
);
```

```javascript
// Aggregation $project — computed fields, rename, type conversion
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $project: {
      _id: 0,
      orderId: 1,
      totalUsd: { $toDouble: "$total" },
      itemCount: { $size: "$items" },
      year: { $year: "$placedAt" }
    }
  }
]);

// Covered query — projection matches index keys exactly; no document fetch
// Index: { sku: 1, name: 1 }
db.products.find(
  { sku: "A-100" },
  { _id: 0, sku: 1, name: 1 }
).explain("executionStats");
// Look for "totalDocsExamined": 0, "stage": "PROJECTION_COVERED"
```

Project out secrets at the DB layer when possible.

## How do `updateOne`, `updateMany`, and `replaceOne` differ?

Updates use **operators** (`$set`, `$inc`, etc.). `replaceOne` swaps the full document (keeps `_id`).

| Method | Scope |
|--------|-------|
| `updateOne` | First match |
| `updateMany` | All matches |
| `replaceOne` | First match, full replacement |

```javascript
// updateOne — patch fields
db.users.updateOne(
  { email: "dana@example.com" },
  {
    $set: { tier: "platinum", updatedAt: new Date() },
    $inc: { loginCount: 1 }
  }
);

// updateMany — bulk status change
db.orders.updateMany(
  { status: "pending", placedAt: { $lt: ISODate("2024-01-01") } },
  { $set: { status: "archived" } }
);

// replaceOne — full document swap (preserves _id)
db.config.replaceOne(
  { key: "featureFlags" },
  {
    key: "featureFlags",
    value: { darkMode: true, betaCheckout: false },
    version: 3,
    updatedAt: new Date()
  }
);
```

```javascript
// Array updates
db.carts.updateOne(
  { userId: "u-42" },
  {
    $push: { items: { sku: "X-9", qty: 1 } },
    $set: { updatedAt: new Date() }
  }
);

db.carts.updateOne(
  { userId: "u-42" },
  { $pull: { items: { sku: "X-9" } } }
);

// Positional $ — update matched array element
db.reviews.updateOne(
  { productId: "P-1", "comments.userId": "u-99" },
  { $set: { "comments.$.text": "Updated comment" } }
);

// arrayFilters — update multiple matching array elements
db.reviews.updateOne(
  { productId: "P-1" },
  { $set: { "comments.$[elem].moderated": true } },
  { arrayFilters: [{ "elem.flagged": true }] }
);
```

Index filter fields — unindexed `updateMany` can scan entire collections.

## How do `deleteOne` and `deleteMany` work?

Permanently removes documents. Implement soft-delete via `status` if recovery needed.

| Method | Scope |
|--------|-------|
| `deleteOne` | First match |
| `deleteMany` | All matches |

```javascript
// deleteOne — remove single record
db.sessions.deleteOne({ token: "expired-token-abc" });

// deleteMany — purge old data (TTL indexes are often better for time-based expiry)
const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
db.auditLogs.deleteMany({ createdAt: { $lt: cutoff } });

// Dangerous — empty filter deletes ALL documents in collection
// db.temp.deleteMany({});  // use with extreme caution
```

```javascript
// Soft delete pattern — prefer for user-facing data
db.users.updateOne(
  { _id: ObjectId("...") },
  { $set: { deletedAt: new Date(), status: "deleted" } }
);

// Queries exclude soft-deleted by default
db.users.find({ status: { $ne: "deleted" } });

// TTL index — MongoDB auto-deletes after expireAfterSeconds
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // 1 hour
);
```

`deleteMany({})` ≠ `drop()` — collection and indexes remain.

## What is an upsert and when should you use it?

**Upsert** updates if matched, inserts if not — `{ upsert: true }` on `updateOne`/`replaceOne` or via `bulkWrite`.

| Use case | Why |
|----------|-----|
| Idempotent ingest | Retry-safe by natural key |
| Config flags | One doc per key |
| Counters | `$inc` + `$setOnInsert` |

```javascript
// upsert — create or bump inventory
db.inventory.updateOne(
  { warehouseId: "WH-01", sku: "BOLT-M8" },
  {
    $inc: { qty: 50 },
    $set: { lastRestockedAt: new Date() },
    $setOnInsert: { createdAt: new Date() }  // only on insert
  },
  { upsert: true }
);

// replaceOne upsert — full document per key
db.settings.replaceOne(
  { key: "maintenanceMode" },
  { key: "maintenanceMode", enabled: false, updatedAt: new Date() },
  { upsert: true }
);
```

```javascript
// Pitfall: update operators required (not a raw replacement doc)
// WRONG: db.stats.updateOne({ id: 1 }, { count: 1 }, { upsert: true });
// RIGHT:
db.stats.updateOne(
  { id: 1 },
  { $setOnInsert: { id: 1 }, $inc: { count: 1 } },
  { upsert: true }
);

// Unique index ensures concurrent upserts don't create duplicates
db.inventory.createIndex({ warehouseId: 1, sku: 1 }, { unique: true });
```

Prefer `updateOne` for keyed upserts; enforce with **unique indexes**.

## How does `bulkWrite` batch mixed operations?

`bulkWrite` runs mixed inserts/updates/deletes in one round trip — `ordered: false` for max parallelism.

```javascript
const ops = [
  {
    insertOne: {
      document: { sku: "NEW-1", name: "Widget", price: NumberDecimal("9.99") }
    }
  },
  {
    updateOne: {
      filter: { sku: "OLD-2" },
      update: { $set: { discontinued: true } }
    }
  },
  {
    replaceOne: {
      filter: { sku: "CFG-1" },
      replacement: { sku: "CFG-1", config: { theme: "dark" } },
      upsert: true
    }
  },
  {
    deleteOne: {
      filter: { sku: "TEMP-0" }
    }
  }
];

const result = db.products.bulkWrite(ops, { ordered: false });
result.insertedCount;
result.modifiedCount;
result.deletedCount;
result.getWriteErrors();  // if unordered partial failure
```

```javascript
// Node.js driver — bulkWrite in application service
async function syncCatalog(collection, changes) {
  const operations = changes.map(change => {
    if (change.op === "upsert") {
      return {
        updateOne: {
          filter: { sku: change.sku },
          update: {
            $set: { name: change.name, price: change.price },
            $setOnInsert: { createdAt: new Date() }
          },
          upsert: true
        }
      };
    }
    if (change.op === "delete") {
      return { deleteOne: { filter: { sku: change.sku } } };
    }
  }).filter(Boolean);

  return collection.bulkWrite(operations, {
    ordered: false,
    writeConcern: { w: "majority" }
  });
}
```

Batch 500–5000 ops; handle `BulkWriteError` for partial failures.

## What is write concern and how do you configure it?

**Write concern** — how many replica nodes must ack before success.

| Level | Meaning |
|-------|---------|
| `w: 1` | Primary (default) |
| `w: "majority"` | Majority of voting nodes |
| `j: true` | Journal flush |
| `wtimeout` | Max wait ms |

```javascript
// Per-operation write concern
db.orders.insertOne(
  { orderId: "O-500", total: 99.00 },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
);

// Collection default (3.6+)
db.createCollection("payments", {
  writeConcern: { w: "majority", wtimeout: 5000 }
});

// Client-level default in connection string
// mongodb://host1,host2,host3/mydb?replicaSet=rs0&w=majority&journal=true
```

```javascript
// C# driver example
var collection = database.GetCollection<Order>("orders")
  .WithWriteConcern(WriteConcern.WMajority.With(journal: true));

await collection.InsertOneAsync(order);

// Retryable writes — driver auto-retries once on network errors
// for idempotent ops (insert with _id, update with _id filter, etc.)
```

`w: "majority"` standard for critical data; pair with `readConcern: majority` for consistency across failover.

## What is read concern and how does it affect query results?

**Read concern** — what data visibility you accept (vs **read preference** = which node).

| Level | Behavior |
|-------|----------|
| `"local"` | Node's latest (default) |
| `"majority"` | No rolled-back writes |
| `"snapshot"` | Transaction consistent view |
| `"linearizable"` | Strict primary ordering |

```javascript
// Majority read — common with majority write for consistency
db.accounts.find(
  { userId: "u-100" },
  { readConcern: { level: "majority" } }
);

// Transaction snapshot isolation
const session = db.getMongo().startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});
try {
  const accounts = session.getDatabase("bank").accounts;
  const from = accounts.findOne({ _id: "A1" }, { session });
  const to = accounts.findOne({ _id: "A2" }, { session });
  accounts.updateOne({ _id: "A1" }, { $inc: { balance: -100 } }, { session });
  accounts.updateOne({ _id: "A2" }, { $inc: { balance: 100 } }, { session });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
} finally {
  session.endSession();
}
```

```javascript
// Read preference — which node (orthogonal to read concern)
// primary (default), primaryPreferred, secondary, secondaryPreferred, nearest
db.reports.find({ region: "EU" })
  .readPref("secondaryPreferred", [{ nodeType: "ANALYTICS" }])
  .withOptions({ readConcern: { level: "majority" } });

// Stale read risk: secondary + local readConcern = fastest but may lag
```

Tighten beyond `local` for banking/inventory consistency stories.

## How do you design idempotent writes in MongoDB?

Same end state whether executed once or many times — critical for retries and at-least-once messaging.

| Technique | Mechanism |
|-----------|-----------|
| Deterministic `_id` | Natural key / provider ID |
| Upsert + unique index | Convergent state |
| Idempotency ledger | Processed request IDs |
| Optimistic locking | Version in filter |

```javascript
// 1. Natural key as _id — duplicate insert fails with 11000 (safe to treat as success)
db.payments.insertOne({
  _id: "pay_stripe_ch_3NxYz123",  // idempotency key from payment provider
  amount: NumberDecimal("49.99"),
  status: "captured",
  createdAt: new Date()
});

// 2. Idempotency ledger — record processed request before side effects
db.idempotencyKeys.updateOne(
  { key: "req-7f3a9c2e" },
  {
    $setOnInsert: {
      key: "req-7f3a9c2e",
      status: "processing",
      createdAt: new Date()
    }
  },
  { upsert: true }
);
// If duplicate key on unique index → already processing or done; skip or return cached response

db.idempotencyKeys.updateOne(
  { key: "req-7f3a9c2e", status: "processing" },
  { $set: { status: "completed", result: { orderId: "O-9001" } } }
);
```

```javascript
// 3. Optimistic concurrency — only update if version matches
const current = db.inventory.findOne({ sku: "SKU-1" });
const update = db.inventory.updateOne(
  { sku: "SKU-1", version: current.version },
  { $inc: { qty: -1 }, $set: { version: current.version + 1 } }
);
if (update.modifiedCount === 0) {
  // retry or conflict — another writer won
}

// 4. Node.js — safe retry wrapper for upsert-by-key
async function upsertOrder(collection, orderId, payload) {
  await collection.updateOne(
    { orderId },
    {
      $set: { ...payload, updatedAt: new Date() },
      $setOnInsert: { orderId, createdAt: new Date() }
    },
    { upsert: true }
  );
  // Calling twice with same orderId converges to same document state
}
```

Stable business key + **unique index** + `$setOnInsert` for create-only fields. Watch `$inc` without version checks — duplicates double-apply.

---

## Related Topics

- **MongoDB Querying and Indexing** (`MongoDB/`)
