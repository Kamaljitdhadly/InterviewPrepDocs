# MongoDB Basics

## Questions Covered

1. What is MongoDB and what problem does it solve?
2. How does MongoDB compare to relational SQL databases?
3. What is BSON and how does the document model work?
4. How are collections and databases organized in MongoDB?
5. What is the `_id` field and how is it generated?
6. When should you use MongoDB vs SQL?
7. How does MongoDB fit into CAP theorem and consistency models?
8. What is MongoDB Atlas and how is it used?
9. What are mongosh basics for connecting and exploring data?
10. What data types does MongoDB support?
11. What are the pros and cons of a flexible schema?
12. How is MongoDB used in microservices architectures?

## What is MongoDB and what problem does it solve?

**MongoDB** is a document-oriented **NoSQL** database storing **BSON documents** in **collections** within **databases**. It targets flexible schemas, horizontal scaling, and fast iteration on evolving data shapes.

| Aspect | MongoDB approach |
|--------|------------------|
| **Data unit** | Document (nested JSON-like object) |
| **Schema** | Flexible; optional JSON Schema validation |
| **Query** | MongoDB Query API (mongosh, drivers) |
| **Scaling** | Sharding across replica sets |
| **Transactions** | Multi-document ACID (replica set 4.0+; sharded 4.2+) |

**Solves:** rigid relational schemas, OO/SQL impedance mismatch, semi-structured hierarchical data without heavy JOINs.

```javascript
// A single document can embed related data — no JOIN required for reads
db.products.insertOne({
  sku: "LAPTOP-15",
  name: "ProBook 15",
  price: 1299.99,
  specs: { cpu: "i7", ramGb: 16, storageGb: 512 },
  tags: ["laptop", "business"],
  inStock: true,
  updatedAt: new Date()
});
```

**Interview angle:** MongoDB trades normalization for document locality, schema flexibility, and scale-out — know when that helps vs hurts.

## How does MongoDB compare to relational SQL databases?

| Dimension | MongoDB | Relational SQL |
|-----------|---------|----------------|
| **Model** | Document (BSON) | Tables, rows, columns |
| **Relationships** | Embed, `$lookup`, refs | FKs, JOINs |
| **Schema** | Flexible per document | Fixed columns + migrations |
| **Transactions** | Multi-doc ACID (replica set+) | Full ACID, mature isolation |
| **Scaling** | Native horizontal sharding | Vertical first |
| **Consistency** | Tunable (write/read concern) | Strong by default |

**SQL wins:** multi-table reporting, referential integrity, ad-hoc JOIN analytics. **MongoDB wins:** document workloads, schema evolution, geo/time-series, horizontal growth.

```javascript
// Relational: users + addresses often normalized across tables
// MongoDB: embed when data is read together and bounded in size
db.users.insertOne({
  email: "alice@example.com",
  name: "Alice Chen",
  addresses: [
    { type: "billing", city: "Seattle", zip: "98101" },
    { type: "shipping", city: "Portland", zip: "97201" }
  ]
});

// SQL equivalent requires JOIN or separate queries
// SELECT u.*, a.* FROM users u LEFT JOIN addresses a ON u.id = a.user_id
```

Many teams use **both** — SQL for ledger/billing, MongoDB for catalogs and events.

## What is BSON and how does the document model work?

**BSON** (Binary JSON) is MongoDB's encoding — extends JSON with `Date`, `ObjectId`, `Decimal128`, `BinData`, etc. Field order is preserved.

| JSON | BSON | Notes |
|------|------|-------|
| `object` | document | Nested sub-docs |
| `array` | array | Ordered; mixed types OK |
| `number` | int32/int64/double/decimal128 | Type affects range |
| — | ObjectId, Date, Timestamp | Not in standard JSON |

**Rules:** self-contained docs (max **16 MB**); embed vs reference by read pattern; no collection-wide column set.

```javascript
// BSON types in a realistic order document
db.orders.insertOne({
  _id: ObjectId(),                    // 12-byte unique identifier
  orderNumber: "ORD-2024-88421",
  customerId: ObjectId("507f1f77bcf86cd799439011"),
  items: [
    { productId: ObjectId(), qty: 2, unitPrice: Decimal128("29.99") }
  ],
  placedAt: ISODate("2024-06-15T10:30:00Z"),
  status: "shipped",
  metadata: BinData(0, "base64payload==")  // binary attachments / hashes
});
```

Model for **read patterns** — embed when always fetched together; reference when shared or unbounded.

## How are collections and databases organized in MongoDB?

```
Cluster
 └── Database (e.g., ecommerce)
      └── Collection (e.g., products, orders, users)
           └── Documents
```

| Level | Purpose |
|-------|---------|
| **Database** | Logical grouping; separate auth |
| **Collection** | Holds similar documents (like a table) |
| **Document** | Single record |
| **Field** | Key in document; dot notation (`address.city`) |

Collections created on first insert. **Capped** = FIFO ring buffer; **time series** (5.0+) = optimized metrics storage.

```javascript
// Switch context and list structure
use ecommerce

db.getCollectionNames()
// ["products", "orders", "users", "inventory_snapshots"]

db.products.stats()
// size, count, index info

// Fully qualified namespace: database.collection
db.getSiblingDB("analytics").events.insertOne({
  event: "page_view",
  ts: new Date(),
  userId: "u-4421"
});
```

Indexes are per-collection. Cross-collection work uses `$lookup` or app-level joins — no server-side FKs.

## What is the `_id` field and how is it generated?

Every document **must** have `_id` — primary key, unique, immutable, indexed by default.

| Source | Behavior |
|--------|----------|
| Omitted | Server generates `ObjectId` |
| Custom | String, int, UUID, compound |
| Sharding | Often `_id` or hashed `_id` |

**ObjectId structure (12 bytes):**

```
[4 bytes timestamp][5 bytes random][3 bytes counter]
```

- Roughly time-sortable (not a substitute for a proper `createdAt` index in all cases).

```javascript
// Auto-generated _id
const result = db.users.insertOne({ name: "Bob", email: "bob@example.com" });
result.insertedId;  // ObjectId("665a1b2c3d4e5f678901234")

// Custom _id — useful for idempotency or external system keys
db.users.insertOne({
  _id: "auth0|507f1f77bcf86cd799439011",
  name: "Carol",
  provider: "auth0"
});

// Compound natural key as _id (ensures uniqueness constraint)
db.inventory.insertOne({
  _id: { warehouseId: "WH-01", sku: "BOLT-M8" },
  qty: 500
});
```

Uniqueness is per **collection**. Add unique indexes on business keys (`email`) for extra constraints.

## When should you use MongoDB vs SQL?

| Choose MongoDB | Choose SQL |
|----------------|------------|
| Document maps to domain objects | Many JOINs across normalized tables |
| Frequent schema evolution | Strict cross-service schema contracts |
| Embedded reads reduce round trips | Complex reporting on normalized facts |
| Near-term horizontal scale | Multi-table transactional invariants |
| Semi-structured / polymorphic records | SQL analytics (CTEs, window functions) |

```javascript
// Good MongoDB fit: product catalog with variable attributes
db.products.insertOne({
  category: "electronics",
  name: "USB-C Hub",
  attributes: { ports: 7, powerDeliveryW: 100 }
});
db.products.insertOne({
  category: "apparel",
  name: "Running Shirt",
  attributes: { size: "M", material: "polyester", color: "blue" }
});
// Same collection, different attribute shapes — awkward in rigid SQL without EAV
```

```javascript
// Poor MongoDB fit without careful design: financial ledger requiring
// strict double-entry across accounts — SQL + transactions is usually simpler
// db.transfers — two balance updates must be atomic and isolated
```

**Red flags:** unbounded arrays, no modeling discipline, expecting relational BI without ETL.

## How does MongoDB fit into CAP theorem and consistency models?

Distributed MongoDB prioritizes **partition tolerance**; tune consistency vs availability via replica elections, **write concern**, and **read concern**.

| Concept | Behavior |
|---------|----------|
| **Replica set** | Primary + secondaries; auto failover |
| **Strong reads** | `readConcern: "majority"` + primary |
| **Stale reads** | Secondary read preference |
| **Linearizable** | `readConcern: "linearizable"` on primary |

```javascript
// Majority write + majority read — common production default for important data
db.orders.insertOne(
  { orderId: "O-991", total: 149.99, status: "paid" },
  {
    writeConcern: { w: "majority", wtimeout: 5000 }
  }
);

db.orders.find(
  { orderId: "O-991" },
  { readConcern: { level: "majority" } }
);
```

```javascript
// Causal consistency session — operations see causally related writes in order
const session = db.getMongo().startSession();
session.startTransaction({ readConcern: { level: "snapshot" }, writeConcern: { w: "majority" } });
try {
  const orders = session.getDatabase("ecommerce").orders;
  orders.insertOne({ orderId: "O-992", status: "pending" }, { session });
  orders.updateOne({ orderId: "O-992" }, { $set: { status: "confirmed" } }, { session });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
} finally {
  session.endSession();
}
```

Multi-document transactions give **snapshot isolation**. Design **idempotent** change-stream consumers for at-least-once delivery.

## What is MongoDB Atlas and how is it used?

**MongoDB Atlas** — managed cloud DB (AWS/Azure/GCP): provisioning, backups, monitoring, patches, scaling.

| Feature | Benefit |
|---------|---------|
| Clusters | Replica sets + sharding |
| Atlas Search | Lucene full-text |
| VPC peering | Network isolation |
| Backup | Point-in-time restore |
| M0 free tier | Learning/prototypes |

```javascript
// Connect via mongosh with Atlas SRV connection string
// mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/mydb" --apiVersion 1 --username appuser

// Node.js driver equivalent
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = process.env.ATLAS_URI; // mongodb+srv://...

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
  await client.connect();
  const db = client.db("ecommerce");
  const count = await db.collection("products").countDocuments();
  console.log(`Product count: ${count}`);
  await client.close();
}
```

Use Atlas to reduce ops; self-host when you need air-gapped or full control. Enforce TLS, least-privilege users, secrets in vault.

## What are mongosh basics for connecting and exploring data?

**mongosh** — modern JS shell with autocomplete and improved output.

| Task | Command |
|------|---------|
| Connect | `mongosh` or `mongosh "mongodb+srv://..."` |
| Select DB | `use mydb` |
| Query | `db.col.find({ field: value })` |
| Help | `help`, `db.help()` |

```javascript
// Interactive exploration workflow
show dbs
use bookstore

db.books.insertMany([
  { title: "Designing Data-Intensive Applications", author: "Kleppmann", year: 2017 },
  { title: "MongoDB: The Definitive Guide", author: "Chodorow", year: 2019 }
]);

db.books.find({ author: "Kleppmann" }).pretty()

db.books.createIndex({ title: "text", author: "text" })
db.books.find({ $text: { $search: "MongoDB data" } })

// Explain plan — critical for interview performance questions
db.books.find({ year: { $gte: 2018 } }).explain("executionStats")
```

```javascript
// Load and run a script file
// mongosh bookstore --file seed.js

// seed.js
db.authors.updateOne(
  { name: "Kleppmann" },
  { $set: { country: "US" }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true }
);
```

Use `--eval` for CI smoke tests; check `getIndexes()` before assuming coverage.

## What data types does MongoDB support?

| Type | Example | Use case |
|------|---------|----------|
| String | `"hello"` | Text |
| Int32/64, Double | `NumberInt(42)` | Counters |
| Decimal128 | `NumberDecimal("19.99")` | Money |
| Date | `ISODate(...)` | Timestamps |
| ObjectId | `ObjectId()` | PKs, refs |
| Array/Object | `[1, {x:1}]` | Nested data |
| Null | `null` | Explicit absence (≠ missing) |
| BinData | UUID | Binary |

```javascript
db.samples.insertOne({
  name: "type-demo",
  qty: NumberInt(100),
  revenue: NumberDecimal("12345.67"),
  eventAt: new Date(),
  ref: ObjectId(),
  tags: ["alpha", "beta"],
  meta: { region: "us-west", tier: 2 },
  optionalField: null,           // explicitly null
  // missingField omitted         // field does not exist — different from null in queries
  uuid: UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")
});

// Query: null matches null OR missing (unless $exists: false used carefully)
db.samples.find({ optionalField: null });
db.samples.find({ missingField: { $exists: false } });
```

Shell numbers default to **double** — use `NumberInt`/`NumberDecimal` for integers and currency.

## What are the pros and cons of a flexible schema?

Documents need not share identical fields. Enforce via convention, app code, or **JSON Schema validation**.

| Pros | Cons |
|------|------|
| Fast iteration | Data drift without governance |
| Natural JSON/API fit | Sparse-field analytics harder |
| Polymorphic entities | Typos create orphan fields |
| Optional validation rules | Migrations still needed |

```javascript
// Optional JSON Schema validation (moderate enforcement)
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "createdAt"],
      properties: {
        email: { bsonType: "string", pattern: "^.+@.+$" },
        age: { bsonType: "int", minimum: 0 },
        role: { enum: ["user", "admin"] },
        createdAt: { bsonType: "date" }
      },
      additionalProperties: true
    }
  },
  validationLevel: "moderate",   // existing invalid docs not checked on read
  validationAction: "error"      // reject invalid inserts/updates
});
```

```javascript
// Application-level migration pattern — backfill new field
db.products.updateMany(
  { warrantyMonths: { $exists: false } },
  { $set: { warrantyMonths: 12 } }
);

// Rename field safely across collection
db.users.updateMany({}, { $rename: { "phoneNumber": "phone" } });
```

Document schema as **evolving but governed** — validation for invariants, migrations for backfills.

## How is MongoDB used in microservices architectures?

**Database-per-service** — each service owns its data; no cross-service JOINs.

| Pattern | Use |
|---------|-----|
| Bounded context storage | Tailored document models per service |
| Change streams → bus | Event-driven sync |
| Transactional outbox | Reliable domain events |
| CQRS | MongoDB writes; separate read stores |

```javascript
// Order service — embed cart snapshot at checkout (no live cart JOIN)
db.orders.insertOne({
  orderId: "ORD-1001",
  customerId: "cust-88",
  snapshot: {
    items: [{ sku: "SKU-1", name: "Widget", price: NumberDecimal("9.99"), qty: 3 }],
    subtotal: NumberDecimal("29.97")
  },
  status: "placed",
  createdAt: new Date()
});

// Change stream consumer (another service builds search index)
const changeStream = db.orders.watch(
  [{ $match: { operationType: { $in: ["insert", "update"] } } }],
  { fullDocument: "updateLookup" }
);
changeStream.on("change", (event) => {
  // publish to message bus — design idempotent handlers
  console.log(event.operationType, event.fullDocument.orderId);
});
```

```javascript
// Transactional outbox pattern within order service
const session = db.getMongo().startSession();
session.startTransaction();
try {
  const orders = db.orders;
  const outbox = db.outbox;
  orders.insertOne({ orderId: "ORD-1002", status: "placed" }, { session });
  outbox.insertOne({
    aggregateId: "ORD-1002",
    eventType: "OrderPlaced",
    payload: { orderId: "ORD-1002" },
    published: false,
    createdAt: new Date()
  }, { session });
  session.commitTransaction();
} catch (err) {
  session.abortTransaction();
} finally {
  session.endSession();
}
```

Share clusters OK; **sharing collections** is not. Cross-service access via APIs/events. Use idempotent writes for at-least-once delivery.

---

## Related Topics

- **MongoDB CRUD Operations** (`MongoDB/`)
- **SQL Server Basics** (`Sql Server/`)
- **Interview Comparisons** (`Important Concepts/`)
