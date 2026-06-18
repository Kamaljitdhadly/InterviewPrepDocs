# MongoDB Querying and Indexing

## Questions Covered

1. What comparison operators does MongoDB support in queries?
2. How do logical operators (`$and`, `$or`, `$not`, `$nor`) work?
3. What array operators should you know for document queries?
4. What are the basics of MongoDB text search?
5. How do compound indexes work and when do you create them?
6. When and how do you use single-field indexes?
7. How do you use `explain()` to read query plans?
8. What is a covered query and how do you design for one?
9. What is index intersection and when does MongoDB use it?
10. What is the ESR rule for compound index key order?

## What comparison operators does MongoDB support in queries?

Comparison operators filter by field values on BSON types. Multiple keys on one field combine as AND: `{ price: { $gte: 10, $lte: 50 } }`.

| Operator | Meaning |
|----------|---------|
| `$eq` | Equal (shorthand: `{ field: value }`) |
| `$ne` | Not equal |
| `$gt` / `$gte` / `$lt` / `$lte` | Range |
| `$in` / `$nin` | In / not in array |

Dot notation targets nested paths. Scalar-to-array comparison matches if any element satisfies the condition.

```javascript
// mongosh — products collection
db.products.find({
  price: { $gte: 25, $lte: 100 },
  category: { $in: ["electronics", "accessories"] },
  "ratings.score": { $gte: 4 }
});

db.orders.find({
  total: { $gt: 500 },
  status: { $ne: "cancelled" },
  placedAt: { $lte: new Date("2025-06-01") }
});
```

```javascript
// Node.js driver
const { MongoClient } = require('mongodb');

async function findAffordableElectronics(client) {
  const db = client.db('shop');
  const cursor = db.collection('products').find({
    price: { $gte: 25, $lte: 100 },
    category: { $in: ['electronics', 'accessories'] },
    'ratings.score': { $gte: 4 },
  });
  return cursor.toArray();
}

async function findLargeRecentOrders(client) {
  const db = client.db('shop');
  return db.collection('orders').find({
    total: { $gt: 500 },
    status: { $ne: 'cancelled' },
    placedAt: { $lte: new Date('2025-06-01') },
  }).toArray();
}
```

**Interview:** Know `$eq` shorthand, `$in`/`$nin`, range combos, dot notation; BSON type order matters for mixed types.

## How do logical operators (`$and`, `$or`, `$not`, `$nor`) work?

Top-level filter keys are **implicit AND**. Use explicit `$and` for multiple conditions on the **same field**.

| Operator | Behavior |
|----------|----------|
| `$and` | All clauses true |
| `$or` | At least one true — index each branch |
| `$not` | Negates one field expression |
| `$nor` | None of the clauses true |

Prefer `$in` over `$or` on one field. `$or` without supporting indexes can force collection scans.

```javascript
// mongosh — implicit AND vs explicit $and on same field
db.users.find({
  age: { $gte: 18 },
  country: "US",
  verified: true
});

db.users.find({
  $and: [
    { age: { $gte: 18, $lte: 65 } },
    { $or: [{ plan: "pro" }, { trialEndsAt: { $gt: new Date() } }] }
  ]
});

db.products.find({
  price: { $not: { $gt: 1000 } },
  $nor: [{ discontinued: true }, { stock: 0 }]
});
```

```javascript
// Node.js driver
async function findEligibleUsers(db) {
  return db.collection('users').find({
    $and: [
      { age: { $gte: 18, $lte: 65 } },
      {
        $or: [
          { plan: 'pro' },
          { trialEndsAt: { $gt: new Date() } },
        ],
      },
    ],
  }).toArray();
}

async function findAvailableProducts(db) {
  return db.collection('products').find({
    price: { $not: { $gt: 1000 } },
    $nor: [{ discontinued: true }, { stock: 0 }],
  }).toArray();
}
```

**Interview:** Implicit AND; explicit `$and` for same-field constraints; `$or` needs indexes per branch.

## What array operators should you know for document queries?

| Operator | Matches when |
|----------|--------------|
| `$all` | Array contains all listed values |
| `$elemMatch` | One element matches all inner conditions |
| `$size` | Exact array length |
| Equality | Field array contains value |

`$elemMatch` binds multiple predicates to the **same** element. Positional `$` updates pair with array queries.

```javascript
// mongosh
db.articles.find({
  tags: { $all: ["mongodb", "indexing"] }
});

db.students.find({
  exams: {
    $elemMatch: { subject: "math", score: { $gte: 90 } }
  }
});

db.carts.find({ "lineItems": { $size: 0 } });

// positional update after elemMatch query
db.orders.updateOne(
  { _id: 1, "items.sku": "ABC" },
  { $set: { "items.$.qty": 2 } }
);
```

```javascript
// Node.js driver
async function findArticlesByTags(db, requiredTags) {
  return db.collection('articles').find({
    tags: { $all: requiredTags },
  }).toArray();
}

async function findTopMathStudents(db) {
  return db.collection('students').find({
    exams: {
      $elemMatch: { subject: 'math', score: { $gte: 90 } },
    },
  }).toArray();
}

async function incrementLineItemQty(db, orderId, sku) {
  return db.collection('orders').updateOne(
    { _id: orderId, 'items.sku': sku },
    { $set: { 'items.$.qty': 2 } },
  );
}
```

**Interview:** `$elemMatch` for same-element logic; `$size` is exact length only.

## What are the basics of MongoDB text search?

Requires a **text index** (one per collection). Query with `$text: { $search: "..." }`; sort by `textScore`.

| Concept | Detail |
|---------|--------|
| Index | `createIndex({ title: "text", body: "text" })` |
| Weights | Boost fields in index options |
| Phrases | Quote terms in `$search` |
| Negation | Prefix term with `-` |

Atlas Search is the managed alternative for fuzzy/autocomplete.

```javascript
// mongosh — create index and search
db.articles.createIndex(
  { title: "text", summary: "text", tags: "text" },
  { weights: { title: 10, summary: 5, tags: 3 }, name: "article_text" }
);

db.articles.find(
  { $text: { $search: "\"compound index\" performance -slow" } },
  { score: { $meta: "textScore" }, title: 1, summary: 1 }
).sort({ score: { $meta: "textScore" } });
```

```javascript
// Node.js driver
async function ensureTextIndex(db) {
  await db.collection('articles').createIndex(
    { title: 'text', summary: 'text', tags: 'text' },
    { weights: { title: 10, summary: 5, tags: 3 }, name: 'article_text' },
  );
}

async function searchArticles(db, query) {
  return db.collection('articles')
    .find(
      { $text: { $search: query } },
      { projection: { score: { $meta: 'textScore' }, title: 1, summary: 1 } },
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .toArray();
}
```

**Interview:** One text index per collection; `$meta: "textScore"` for relevance sort.

## How do compound indexes work and when do you create them?

Compound indexes order multiple keys. MongoDB uses a **prefix** of keys left-to-right. Align with filter + sort patterns on hot queries.

| Scenario | Example |
|----------|---------|
| Filter + sort | `{ status: 1, createdAt: -1 }` |
| Multi-equality | `{ tenantId: 1, userId: 1, type: 1 }` |

Wrong key order leaves the index unused. Each extra index slows writes.

```javascript
// mongosh
db.orders.createIndex({ status: 1, createdAt: -1 });
db.orders.createIndex({ customerId: 1, placedAt: -1 });

db.orders.find({ status: "shipped", createdAt: { $gte: ISODate("2025-01-01") } })
  .sort({ createdAt: -1 });

// index supports equality on customerId + range/sort on placedAt
db.orders.find({ customerId: ObjectId("...") })
  .sort({ placedAt: -1 })
  .limit(10);
```

```javascript
// Node.js driver
async function createOrderIndexes(db) {
  const orders = db.collection('orders');
  await orders.createIndex({ status: 1, createdAt: -1 });
  await orders.createIndex({ customerId: 1, placedAt: -1 });
}

async function recentShippedOrders(db, since) {
  return db.collection('orders')
    .find({ status: 'shipped', createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .toArray();
}
```

**Interview:** Prefix rule; equality fields first; one compound beats several singles for a known hot path.

## When and how do you use single-field indexes?

Index one path with `createIndex({ field: 1 })`. Direction matters for **sort** on that field alone.

| Type | Use |
|------|-----|
| Unique | Natural keys (`email`) |
| Sparse | Field absent on most docs |
| TTL | Ephemeral sessions/events |

Monitor `$indexStats`; drop unused indexes.

```javascript
// mongosh
db.users.createIndex({ email: 1 }, { unique: true });
db.sessions.createIndex({ lastSeenAt: 1 }, { expireAfterSeconds: 86400 });
db.events.createIndex({ userId: 1 });
db.events.createIndex({ eventType: 1 }, { sparse: true });

db.users.find({ email: "dev@example.com" }); // IXSCAN on email
db.events.find({ userId: ObjectId("...") }).sort({ _id: -1 });
```

```javascript
// Node.js driver
async function bootstrapIndexes(db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('sessions').createIndex(
    { lastSeenAt: 1 },
    { expireAfterSeconds: 86400 },
  );
  await db.collection('events').createIndex({ userId: 1 });
  await db.collection('events').createIndex({ eventType: 1 }, { sparse: true });
}

async function findUserByEmail(db, email) {
  return db.collection('users').findOne({ email });
}
```

**Interview:** Index selective query fields; unique/sparse/TTL for special cases; avoid index sprawl.

## How do you use `explain()` to read query plans?

`explain("executionStats")` shows plan, index usage, docs examined vs returned, and timing.

| Signal | Problem |
|--------|---------|
| `COLLSCAN` | Missing index on large collection |
| High examined/returned ratio | Wrong or partial index |
| `SORT` in memory | Missing sort-supporting index |

```javascript
// mongosh
db.orders.find({ status: "open", customerId: ObjectId("...") })
  .sort({ createdAt: -1 })
  .explain("executionStats");

// shorthand keys to inspect
const plan = db.orders.find({ sku: "X1" }).explain("executionStats");
plan.queryPlanner.winningPlan.stage;
plan.executionStats.totalDocsExamined;
plan.executionStats.executionStages?.inputStage?.stage; // IXSCAN, FETCH, etc.
```

```javascript
// Node.js driver
async function diagnoseQuery(db) {
  const explanation = await db.collection('orders')
    .find({ status: 'open', customerId: new ObjectId('...') })
    .sort({ createdAt: -1 })
    .explain('executionStats');

  const stats = explanation.executionStats;
  return {
    examined: stats.totalDocsExamined,
    returned: stats.nReturned,
    millis: stats.executionTimeMillis,
    winningPlan: explanation.queryPlanner.winningPlan,
  };
}
```

**Interview:** Check `totalDocsExamined` vs `nReturned`; use `hint()` to test indexes.

## What is a covered query and how do you design for one?

**Covered** = satisfied entirely from the index (`totalDocsExamined: 0`). All filter, sort, and projection fields must be in the index. Exclude `_id` unless it is indexed.

```javascript
// mongosh — index covers filter + projection
db.products.createIndex({ category: 1, sku: 1, name: 1, price: 1 });

db.products.find(
  { category: "books" },
  { _id: 0, sku: 1, name: 1, price: 1 }
).explain("executionStats");
// totalDocsExamined: 0, covered: true in winning plan

// including _id: 1 requires _id in index or default _id index separate — usually exclude _id
```

```javascript
// Node.js driver
async function listBookSkus(db) {
  return db.collection('products')
    .find(
      { category: 'books' },
      { projection: { _id: 0, sku: 1, name: 1, price: 1 } },
    )
    .toArray();
}

async function isQueryCovered(db) {
  const exp = await db.collection('products')
    .find({ category: 'books' }, { projection: { _id: 0, sku: 1, name: 1, price: 1 } })
    .explain('executionStats');
  return exp.executionStats.totalDocsExamined === 0;
}
```

**Interview:** Index-only read; add projected fields to compound index tail; verify with `explain`.

## What is index intersection and when does MongoDB use it?

Planner may **AND** multiple single-field indexes. Less predictable than a purpose-built compound index—do not rely on it for SLAs.

```javascript
// mongosh — two singles; planner may intersect
db.inventory.createIndex({ warehouse: 1 });
db.inventory.createIndex({ sku: 1 });

db.inventory.find({
  warehouse: "west",
  sku: "bolt-42"
}).explain("executionStats");
// AND_SORTED or AND_HASH stages under winning plan when intersecting

// preferred for hot path: explicit compound
db.inventory.createIndex({ warehouse: 1, sku: 1 });
```

```javascript
// Node.js driver
async function findInventoryItem(db, warehouse, sku) {
  // relies on compound index { warehouse: 1, sku: 1 } in production
  return db.collection('inventory').findOne({ warehouse, sku });
}

async function comparePlans(db) {
  const withSingles = await db.collection('inventory')
    .find({ warehouse: 'west', sku: 'bolt-42' })
    .explain('executionStats');
  return withSingles.queryPlanner.winningPlan;
}
```

**Interview:** Intersection merges singles; prefer compound; each `$or` branch needs its own index.

## What is the ESR rule for compound index key order?

**ESR** = Equality, Sort, Range — field order in the index.

| Letter | Position |
|--------|----------|
| E | Equality filters first |
| S | Sort fields next |
| R | Range filters last |

Example: `{ tenantId: 1, status: 1, createdAt: -1 }` for `{ tenantId, status }` equality + `createdAt` range/sort.

```javascript
// mongosh — ESR-aligned index
db.tickets.createIndex({ tenantId: 1, status: 1, priority: 1, updatedAt: -1 });

db.tickets.find({
  tenantId: "acme",
  status: "open",
  updatedAt: { $gte: ISODate("2025-06-01") }
}).sort({ priority: 1, updatedAt: -1 });

// equality: tenantId, status; sort: priority, updatedAt; range on updatedAt — 
// planner uses index prefix; range on updatedAt is last range field
```

```javascript
// Node.js driver
async function openTicketsSince(db, tenantId, since) {
  return db.collection('tickets')
    .find({
      tenantId,
      status: 'open',
      updatedAt: { $gte: since },
    })
    .sort({ priority: 1, updatedAt: -1 })
    .toArray();
}

async function createTicketIndex(db) {
  await db.collection('tickets').createIndex({
    tenantId: 1,
    status: 1,
    priority: 1,
    updatedAt: -1,
  });
}
```

**Interview:** E-S-R left to right; validate with `explain`; range field last among filters.

---

## Related Topics

- **MongoDB Aggregation** (`MongoDB/`)
- **MongoDB Performance and Optimization** (`MongoDB/`)
