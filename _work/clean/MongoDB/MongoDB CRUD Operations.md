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

**Insert** operations add documents to a collection. MongoDB generates `_id` if omitted. Inserts are **atomic per document** — `insertMany` is atomic per document, not across the whole batch (unless in a transaction).

| Method | Behavior | Returns |
|--------|----------|---------|
| `insertOne(doc)` | Single document | `insertedId`, `acknowledged` |
| `insertMany([docs])` | Multiple documents | `insertedIds`, `insertedCount` |

**Options:** `ordered` (default `true` — stop on first error) vs `ordered: false` (continue inserting valid docs); `writeConcern`; `bypassDocumentValidation`.

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

**Best practices:** use **unique indexes** on business keys (`sku`, `email`) to prevent duplicates; prefer `insertMany` with reasonable batch sizes (hundreds–thousands) for throughput; wrap related inserts in a **transaction** when all-or-nothing is required.

## How do you query documents with `find` and filters?

`find(filter, projection)` returns a **cursor** over matching documents. Filters are BSON documents using query operators.

| Operator | Meaning | Example |
|----------|---------|---------|
| `$eq`, `$ne` | Equal / not equal | `{ status: { $ne: "deleted" } }` |
| `$gt`, `$gte`, `$lt`, `$lte` | Comparisons | `{ price: { $gte: 10, $lte: 100 } }` |
| `$in`, `$nin` | In / not in array | `{ sku: { $in: ["A", "B"] } }` |
| `$and`, `$or`, `$nor` | Logic | `{ $or: [{ tier: "gold" }, { points: { $gt: 1000 } }] }` |
| `$exists` | Field presence | `{ phone: { $exists: true } }` |
| `$regex` | Pattern match | `{ name: { $regex: /^Pro/, $options: "i" } }` |
| `$elemMatch` | Array element match | `{ tags: { $elemMatch: { $eq: "sale" } } }` |
| `$all` | Array contains all | `{ tags: { $all: ["new", "featured"] } }` |

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

**Dot notation** queries nested fields. **Array fields** match if any element satisfies the condition unless `$elemMatch` constrains a single element. Use `.explain("executionStats")` to verify index use — **COLLSCAN** on large collections is a common interview red flag.

## What is projection and how do you limit returned fields?

**Projection** selects which fields to return, reducing network payload and memory. In read-heavy APIs, projecting only needed fields is a core optimization.

| Syntax | Effect |
|--------|--------|
| `{ field: 1 }` | Include field (`_id` included by default) |
| `{ field: 0 }` | Exclude field |
| `{ _id: 0 }` | Exclude `_id` |
| `{ field: 1, other: 0 }` | Cannot mix include/exclude except `_id` |

**Positional operators:** `$` returns first array match; `$elemMatch` in projection returns first matching subdocument; `$slice` limits array elements.

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

**Rule:** inclusion projection (specify `1`s) is clearer for APIs; exclusion for hiding sensitive fields (`passwordHash: 0`). Never return secrets — project them out at the database layer when possible.

## How do `updateOne`, `updateMany`, and `replaceOne` differ?

Updates modify existing documents using **update operators** (`$set`, `$inc`, `$push`, etc.) — you cannot replace the entire document with a plain object in `updateOne`/`updateMany` (that would cause errors). `replaceOne` swaps the whole document (except `_id`).

| Method | Scope | Body |
|--------|-------|------|
| `updateOne(filter, update)` | First match | Update operators |
| `updateMany(filter, update)` | All matches | Update operators |
| `replaceOne(filter, replacement)` | First match | Full new document |

Common operators: `$set`, `$unset`, `$inc`, `$mul`, `$rename`, `$push`, `$pull`, `$addToSet`, `$currentDate`.

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

**Return values:** `matchedCount`, `modifiedCount`, `upsertedId` (if upsert). `updateMany` on unindexed filters can lock large ranges — always index filter fields.

## How do `deleteOne` and `deleteMany` work?

**Delete** operations permanently remove documents (unless using encrypted ephemeral collections). There is no soft-delete built in — implement via `status: "deleted"` if recovery is needed.

| Method | Scope | Returns |
|--------|-------|---------|
| `deleteOne(filter)` | First match | `deletedCount` (0 or 1) |
| `deleteMany(filter)` | All matches | `deletedCount` |

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

**Interview note:** `deleteMany({})` is not the same as `drop()` — the collection and indexes remain. For GDPR "right to erasure," combine targeted `deleteOne` with audit logging. Use transactions if delete must align with related updates.

## What is an upsert and when should you use it?

An **upsert** (update + insert) updates a document if the filter matches; otherwise inserts a new document. Enabled with `{ upsert: true }` on `updateOne`, `updateMany` (rare), `replaceOne`, or via `bulkWrite`.

| Use case | Why upsert |
|----------|------------|
| Idempotent ingest by natural key | Same command on retry won't duplicate |
| Config / feature flags | One doc per key |
| Sync from external system | External ID as filter |
| Counters with `$inc` on first write | Atomic create-or-increment |

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

**Caution:** `updateMany` with `upsert: true` can insert **multiple** documents when no match — one per filter combination is not how it works; actually updateMany with upsert only inserts **one** document if no matches. Prefer `updateOne` for keyed upserts. Combine with **unique indexes** to handle race conditions.

## How does `bulkWrite` batch mixed operations?

`bulkWrite` executes an ordered or unordered array of write operations in one round trip — higher throughput for mixed inserts, updates, deletes.

| Operation type | Maps to |
|----------------|---------|
| `insertOne` | Insert |
| `updateOne` / `updateMany` | Update |
| `replaceOne` | Replace |
| `deleteOne` / `deleteMany` | Delete |

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

**Guidelines:** batch size 500–5000 depending on document size; `ordered: false` maximizes parallelism; handle `BulkWriteError` and inspect `result.writeErrors` for partial failures; use transactions when cross-collection atomicity is required.

## What is write concern and how do you configure it?

**Write concern** defines how many replica set members must acknowledge a write before the operation returns success. It trades **durability/latency** and protects against single-node loss.

| Level | Meaning |
|-------|---------|
| `w: 0` | Unacknowledged (fire-and-forget) — avoid in prod |
| `w: 1` | Primary acknowledged (default) |
| `w: "majority"` | Majority of voting nodes |
| `w: <n>` | Specific number of nodes |
| `j: true` | Wait for journal flush (durability) |
| `wtimeout` | Max wait ms before error |

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

**Interview scenarios:** `w: 1` may lose writes if primary fails before replication. `w: "majority"` is standard for financial/critical data. In elections, writes may fail temporarily — implement app-level retry with idempotency keys. **Write concern** pairs with **read concern: majority** for read-your-writes consistency across failover.

## What is read concern and how does it affect query results?

**Read concern** controls **which data** a query can return relative to replication and rollback — distinct from **read preference** (which node you read from).

| Level | Behavior |
|-------|----------|
| `"local"` | Return node's latest data (may include uncommitted/rolled-back) |
| `"available"` | Sharded: no guarantee doc still exists (migrations) |
| `"majority"` | Only data acknowledged by majority (no rolled-back writes) |
| `"linearizable"` | Strict ordering on primary (limited ops) |
| `"snapshot"` | Multi-doc transaction consistent snapshot |

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

**Summary:** `readConcern: majority` prevents reading data that could be rolled back after failover. Combine with appropriate **read preference** for analytics on secondaries. Default `local` on primary is fine for many apps; tighten for banking and inventory consistency stories in interviews.

## How do you design idempotent writes in MongoDB?

**Idempotent writes** produce the same end state when executed once or multiple times — essential for retries, message queues (at-least-once delivery), and network failures.

| Technique | Mechanism |
|-----------|-----------|
| **Deterministic `_id`** | Client-supplied or hash of natural key |
| **Upsert on unique key** | `updateOne` + `upsert` with unique index |
| **Idempotency key collection** | Store processed request IDs |
| **Optimistic locking** | Version field `$eq` check in filter |
| **Retryable writes** | Driver feature for supported ops |

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

**Design checklist:** choose a stable business key; enforce with **unique index**; use `$setOnInsert` for create-only fields; return stored outcome for duplicate idempotency keys; log `modifiedCount` vs `matchedCount` to detect no-ops. Avoid non-idempotent operators like `$inc` without version checks when duplicates would double-apply.
