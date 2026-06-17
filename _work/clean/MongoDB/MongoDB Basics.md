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

**MongoDB** is a document-oriented, distributed **NoSQL** database. Data is stored as **BSON documents** (binary JSON) grouped in **collections** inside **databases**. It targets applications that need flexible schemas, horizontal scaling, and fast iteration on evolving data shapes.

| Aspect | MongoDB approach |
|--------|------------------|
| **Data unit** | Document (nested JSON-like object) |
| **Schema** | Flexible; enforced at application or via JSON Schema validation |
| **Query language** | MongoDB Query API (mongosh, drivers) |
| **Scaling** | Sharding across replica sets |
| **Transactions** | Multi-document ACID since 4.0 (replica set); sharded clusters since 4.2 |

**Problems it solves:** rigid relational schemas that slow product changes; impedance mismatch between object-oriented code and normalized tables; need to store semi-structured or hierarchical data (catalogs, user profiles, IoT events) without heavy JOINs.

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

**Interview angle:** MongoDB is not "SQL but faster" — it trades normalized relational modeling for document locality, schema flexibility, and scale-out patterns. Know when that trade-off helps and when it hurts.

## How does MongoDB compare to relational SQL databases?

| Dimension | MongoDB | Relational SQL (PostgreSQL, SQL Server) |
|-----------|---------|----------------------------------------|
| **Model** | Document (BSON) | Tables, rows, columns |
| **Relationships** | Embedding, `$lookup`, app-level refs | Foreign keys, JOINs |
| **Schema** | Flexible per document | Fixed columns (migrations alter DDL) |
| **Transactions** | Multi-doc ACID (replica set+) | Full ACID, mature isolation levels |
| **Scaling** | Horizontal sharding native | Vertical first; sharding harder |
| **Query** | Aggregation pipeline, indexes on nested fields | SQL, optimizer, complex JOINs |
| **Consistency** | Tunable (write/read concern) | Strong by default |

**When SQL wins:** complex multi-table reporting, strict referential integrity, heavy ad-hoc JOIN analytics, mature BI tooling.

**When MongoDB wins:** document-shaped workloads, rapid schema evolution, geo/time-series patterns, horizontal growth with replica sets and sharding.

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

**Hybrid reality:** many teams use both — PostgreSQL for ledger/billing, MongoDB for catalogs, sessions, or event logs.

## What is BSON and how does the document model work?

**BSON** (Binary JSON) is MongoDB's on-wire and on-disk encoding. It extends JSON with additional types (`Date`, `ObjectId`, `Decimal128`, `BinData`, etc.) and preserves field order in each document.

| JSON type | BSON equivalent | Notes |
|-----------|-----------------|-------|
| `object` | document | Nested sub-documents |
| `array` | array | Ordered; can mix types |
| `string` | UTF-8 string | |
| `number` | `int32`, `int64`, `double`, `decimal128` | Type matters for range/precision |
| `true/false` | boolean | |
| `null` | null | Distinct from missing field |
| — | `ObjectId`, `Date`, `Timestamp` | Not in standard JSON |

**Document model rules:**

- Each document is a self-contained record (up to **16 MB** max size).
- Fields are key-value pairs; keys are strings (except `_id`).
- **Embedding** stores related data in one document; **referencing** stores `ObjectId` pointers to other documents.
- No enforced table-wide column set — two documents in the same collection can have different fields.

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

**Design tip:** model for **read patterns**. If you always fetch order + line items together, embed. If line items are huge or shared across orders, reference.

## How are collections and databases organized in MongoDB?

MongoDB uses a **hierarchical namespace**:

```
Cluster
 └── Database (e.g., ecommerce)
      └── Collection (e.g., products, orders, users)
           └── Documents
```

| Level | Purpose | Naming |
|-------|---------|--------|
| **Database** | Logical grouping; separate auth namespaces | Lowercase, no spaces (convention) |
| **Collection** | Like a table; holds documents of similar purpose | Plural nouns common (`users`) |
| **Document** | Single record | |
| **Field** | Key inside a document | Dot notation for nesting (`address.city`) |

- Collections are created **implicitly** on first insert (no `CREATE TABLE` required).
- A database can host many collections; a collection belongs to one database.
- **Capped collections** are fixed-size, FIFO ring buffers (logs, telemetry).
- **Time series collections** (5.0+) optimize storage/query for timestamped metrics.

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

**Indexes** are defined per collection. Cross-collection operations use aggregation `$lookup` or application-level joins — not server-side foreign keys.

## What is the `_id` field and how is it generated?

Every document **must** have an `_id` field. It acts as the **primary key** within a collection — unique, immutable, and indexed by default.

| Source | Behavior |
|--------|----------|
| **Omitted on insert** | Server generates `ObjectId` |
| **Custom value** | String, int, UUID (BinData subtype 4), compound key |
| **Shard key** | Often `_id` or hashed `_id`; can be compound |

**ObjectId structure (12 bytes):**

```
[4 bytes timestamp][5 bytes random][3 bytes counter]
```

- Roughly time-sortable (not a substitute for a proper `createdAt` index in all cases).
- Unique per process/machine in practice; collisions are astronomically rare.

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

**Interview tip:** `_id` uniqueness is per **collection**, not global. Use application logic or unique indexes on business keys (`email`) for additional constraints.

## When should you use MongoDB vs SQL?

Use a **decision matrix** tied to access patterns, consistency needs, and team skills — not hype.

| Choose MongoDB when | Choose SQL when |
|---------------------|-----------------|
| Document maps naturally to domain objects | Heavy relational modeling with many JOINs |
| Schema evolves frequently (A/B features, startups) | Strict schema contracts across services |
| Read-heavy, embedded data reduces round trips | Complex reporting across normalized facts |
| Horizontal scale-out is a near-term requirement | Strong multi-table transactional invariants |
| Semi-structured / polymorphic records | Mature SQL analytics (window functions, CTEs) |
| Geo, text, time-series built-in index types | Regulatory needs for relational audit patterns |

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

**Red flags for MongoDB:** unbounded document growth (unbounded arrays), no data modeling discipline ("schemaless" ≠ no schema), expecting relational BI without ETL.

## How does MongoDB fit into CAP theorem and consistency models?

In CAP terms, a distributed MongoDB deployment prioritizes **partition tolerance** and offers configurable trade-offs between **consistency** and **availability** via replica set elections, read concern, and write concern.

| Concept | MongoDB behavior |
|---------|------------------|
| **Replica set** | 1 primary + secondaries; automatic failover |
| **Default writes** | Acknowledged by primary (`w: 1`) |
| **Strong reads** | `readConcern: "majority"` + `readPreference: primary` |
| **Eventual reads** | Read from secondaries (`secondary`, `secondaryPreferred`) |
| **Linearizable reads** | `readConcern: "linearizable"` on primary (specific use cases) |

**Write concern** controls durability acknowledgment (how many nodes must confirm before success). **Read concern** controls what data visibility you accept (rolled-back writes, stale secondaries).

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

**Interview framing:** MongoDB is **not** "eventually consistent only" — defaults are tunable. Multi-document transactions on replica sets provide **snapshot isolation**. Sharded clusters add routing complexity; understand **at-least-once** delivery in change streams and design idempotent consumers.

## What is MongoDB Atlas and how is it used?

**MongoDB Atlas** is MongoDB Inc.'s fully managed cloud database service (AWS, Azure, GCP). It handles provisioning, backups, monitoring, patches, and scaling.

| Feature | Benefit |
|---------|---------|
| **Clusters** | Replica sets and sharded clusters with UI/API |
| **Atlas Search** | Lucene-based full-text on Atlas (vs self-managed `$text`) |
| **Triggers / Functions** | Serverless hooks on data changes |
| **VPC peering / PrivateLink** | Network isolation |
| **Backup** | Continuous cloud backup, point-in-time restore |
| **Performance Advisor** | Index recommendations |
| **Free tier (M0)** | Learning and prototypes |

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

**Atlas vs self-hosted:** Atlas reduces ops burden; self-hosted (or DocumentDB-compatible alternatives) when you need full control, air-gapped environments, or specific cost models at very large scale.

**Security checklist:** IP allowlist or VPC, least-privilege DB users, TLS enforced, secrets in vault (not repos), enable auditing for compliance workloads.

## What are mongosh basics for connecting and exploring data?

**mongosh** is the modern MongoDB shell — JavaScript-based REPL with syntax highlighting, autocomplete, and improved output vs legacy `mongo` shell.

| Task | Command |
|------|---------|
| Connect local | `mongosh` or `mongosh mongodb://localhost:27017` |
| Connect Atlas | `mongosh "mongodb+srv://..."` |
| Select database | `use mydb` |
| Insert | `db.col.insertOne({ ... })` |
| Query | `db.col.find({ field: value })` |
| Help | `help`, `db.help()`, `db.col.help()` |

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

**Tips:** use `--eval` for CI smoke tests; `db.collection.getIndexes()` before assuming index coverage; `mongosh --version` to match server compatibility.

## What data types does MongoDB support?

MongoDB supports rich types beyond JSON. Choosing the correct type affects sorting, indexing, aggregation, and driver serialization.

| Type | Example | Use case |
|------|---------|----------|
| **String** | `"hello"` | Text, enums as strings |
| **Int32 / Int64 / Double** | `NumberInt(42)`, `NumberLong(9e15)`, `3.14` | Counters, metrics |
| **Decimal128** | `NumberDecimal("19.99")` | Money (avoid float rounding) |
| **Boolean** | `true` | Flags |
| **Date** | `ISODate("2024-01-01")` | Timestamps |
| **ObjectId** | `ObjectId()` | Primary keys, refs |
| **Array** | `[1, "a", { x: 1 }]` | Lists, tags |
| **Object** | `{ a: 1 }` | Embedded docs |
| **Null** | `null` | Explicit absence of value |
| **BinData** | UUID, binary hashes | |
| **Regex** | `/^foo/i` | Pattern queries (index cautiously) |
| **JavaScript** | `function() { ... }` | Server-side `$where` (avoid in prod) |
| **Timestamp** | `Timestamp(1, 1)` | Internal replication (not for apps) |
| **MinKey / MaxKey** | bounds in indexes | |

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

**Pitfall:** shell numbers default to **double**. Use `NumberInt` / `NumberDecimal` for integers and currency. Drivers map language types (C# `decimal`, Java `BigDecimal`) to BSON correctly when configured.

## What are the pros and cons of a flexible schema?

**Flexible schema** means documents in one collection need not share identical fields. Structure is enforced by convention, application code, or optional **JSON Schema validation**.

| Pros | Cons |
|------|------|
| Faster feature iteration | Data quality drift without governance |
| Natural fit for OO/JSON APIs | Harder ad-hoc analytics on sparse fields |
| Polymorphic entities in one collection | Typos create orphan fields (`staus` vs `status`) |
| Easier handling of optional attributes | Migration discipline still required for breaking changes |
| Gradual enforcement via validation rules | Unbounded arrays / document bloat risk |

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

**Best practice:** treat schema as **evolving but documented**. Use validation for invariants, migrations for backfills, and monitoring for unknown fields (aggregation on `Object.keys` samples in staging).

## How is MongoDB used in microservices architectures?

In microservices, each service typically owns its data store (**database-per-service**). MongoDB fits services with document-shaped domains, independent deploy cycles, and variable schemas.

| Pattern | Description |
|---------|-------------|
| **Database per service** | `orders` service owns `orders` DB; no cross-service SQL JOINs |
| **Bounded context storage** | Catalog, cart, reviews each with tailored document models |
| **Event-driven sync** | Change streams → Kafka → materialized views in other services |
| **Saga / outbox** | Transactional outbox collection + poller for reliable events |
| **CQRS** | Write model in MongoDB; read models in Elasticsearch/Redis |

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

**Cautions:** sharing one MongoDB cluster across many services is OK; **sharing collections** is not. Avoid distributed monolith anti-pattern — cross-service queries go through APIs or events, not direct DB peering. Use **unique business keys** and **idempotent writes** for at-least-once delivery.
