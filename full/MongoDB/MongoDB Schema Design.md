# MongoDB Schema Design

## Questions Covered

1. When should you embed documents vs reference them in MongoDB?
2. How do you model one-to-many relationships in MongoDB?
3. How do you model many-to-many relationships in MongoDB?
4. What is schema validation in MongoDB and when should you use it?
5. What is the polymorphic pattern and when do you use it?
6. What is the bucket pattern and when do you use it?
7. What are common MongoDB schema anti-patterns?
8. What strategies exist for schema migration in MongoDB?

## When should you embed documents vs reference them in MongoDB?

The **embed vs reference** decision is the core MongoDB schema choice — match **read patterns** and **data lifecycle** to storage.

```
EMBED (denormalize)                    REFERENCE (normalize)
+------------------+                   +------------------+
| order            |                   | order            |
|  _id: 1          |                   |  _id: 1          |
|  customer: {     |                   |  customerId: 42  |
|    name: "Ada"   |                   +------------------+
|    email: "..."  |                   +------------------+
|  }               |                   | customer         |
|  items: [ ... ]  |                   |  _id: 42         |
+------------------+                   |  name: "Ada"     |
  1 read, atomic                       +------------------+
                                       2 reads, $lookup or 2nd query
```

| Factor | Prefer **embed** | Prefer **reference** |
|--------|------------------|----------------------|
| **Relationship** | One-to-few, data owned by parent | One-to-many/unbounded, shared across parents |
| **Read pattern** | Always read together | Often read independently |
| **Update frequency** | Child changes with parent | Child updated independently and often |
| **Document size** | Stays well under 16 MB limit | Would bloat parent document |
| **Consistency** | Atomic single-document updates suffice | Need independent versioning |

**Rule of thumb:** embed when data is **contained** and **bounded**; reference when data is **shared**, **unbounded**, or **updated on its own schedule**.

```javascript
// EMBED — line items belong to one order; always fetched with the order
db.orders.insertOne({
  _id: ObjectId("65a1..."),
  status: "shipped",
  customer: { name: "Ada Lovelace", email: "ada@example.com" },
  items: [
    { sku: "BOOK-001", title: "MongoDB Patterns", qty: 1, price: 39.99 },
    { sku: "BOOK-002", title: "Schema Design", qty: 2, price: 29.99 }
  ],
  createdAt: ISODate("2025-06-01T10:00:00Z")
});

// REFERENCE — product catalog is shared; price/description change independently
db.orders.insertOne({
  _id: ObjectId("65a2..."),
  status: "pending",
  customerId: ObjectId("cust_42"),
  lineItems: [
    { productId: ObjectId("prod_101"), qty: 1, unitPrice: 39.99 }, // snapshot price
    { productId: ObjectId("prod_102"), qty: 2, unitPrice: 29.99 }
  ]
});

// $lookup products collection when live catalog fields are needed
```

Mention **16 MB limit**, **working set**, and **write amplification**. Snapshot `unitPrice` on orders even when referencing products.

## How do you model one-to-many relationships in MongoDB?

Three patterns by cardinality and access:

```
Pattern A: ARRAY OF SUBDOCS (one-to-few)
  user ──► addresses: [ { type, street, city }, ... ]     (≤ ~20 items)

Pattern B: PARENT REFERENCE (one-to-many, many side stores parentId)
  author ──► books: [ { _id, title, authorId: author._id }, ... ]

Pattern C: CHILD REFERENCES (one-to-squillions)
  product ◄── reviews: [ { productId, rating, text }, ... ]  (unbounded)
```

| Pattern | Best when | Trade-off |
|---------|-----------|-----------|
| **Array of subdocuments** | Few children; read with parent | Array growth; multi-doc updates if child shared |
| **Parent reference on child** | Many children; paginate/filter children | Extra query or `$lookup` to get parent |

```javascript
// Pattern A — user with few addresses (embed)
db.users.insertOne({
  _id: ObjectId("u1"),
  name: "Grace Hopper",
  addresses: [
    { type: "home", street: "1 Navy Way", city: "Arlington", zip: "22202" },
    { type: "work", street: "100 Compiler Ln", city: "Washington", zip: "20001" }
  ]
});

// Pattern B — author with many books (child holds authorId)
db.authors.insertOne({ _id: ObjectId("a1"), name: "Ursula K. Le Guin" });
db.books.insertMany([
  { _id: ObjectId("b1"), title: "The Left Hand of Darkness", authorId: ObjectId("a1"), year: 1969 },
  { _id: ObjectId("b2"), title: "The Dispossessed", authorId: ObjectId("a1"), year: 1974 }
]);
// Index for "all books by author"
db.books.createIndex({ authorId: 1, year: -1 });
db.books.find({ authorId: ObjectId("a1") }).sort({ year: -1 });

// Pattern C — product with unbounded reviews (never embed all reviews)
db.reviews.insertOne({
  productId: ObjectId("p99"),
  userId: ObjectId("u5"),
  rating: 4,
  text: "Solid introduction to schema design.",
  createdAt: ISODate("2025-06-15T08:30:00Z")
});
db.reviews.createIndex({ productId: 1, createdAt: -1 });
db.reviews.find({ productId: ObjectId("p99") })
  .sort({ createdAt: -1 })
  .limit(20);
```

Keep **summary fields** on the parent (`reviewCount`) while reviews live in a separate collection:

```javascript
// Atomic increment on parent when inserting a review
db.products.updateOne(
  { _id: ObjectId("p99") },
  { $inc: { reviewCount: 1 }, $set: { lastReviewAt: new Date() } }
);
```

## How do you model many-to-many relationships in MongoDB?

Use a **join collection** (default) or **arrays of references** when links per document stay bounded.

```
students ◄──────── enrollments ────────► courses
              { studentId, courseId, grade, semester }
```

| Approach | Use when | Avoid when |
|----------|----------|------------|
| **Join collection** | Unbounded links; need metadata on relationship | N/A — default for M:N |
| **Arrays on both sides** | Few links per doc; bidirectional nav without join | Either side can grow large |
| **Array on one side only** | Asymmetric access (e.g., tags on post only) | Need efficient reverse lookup |

```javascript
// Join collection — canonical M:N with relationship attributes
db.enrollments.createIndex({ studentId: 1, courseId: 1 }, { unique: true });
db.enrollments.createIndex({ courseId: 1 });

db.enrollments.insertOne({
  studentId: ObjectId("stu_10"),
  courseId: ObjectId("crs_201"),
  semester: "2025-Fall",
  grade: "A",
  enrolledAt: ISODate("2025-08-20T00:00:00Z")
});

// All courses for a student
db.enrollments.find({ studentId: ObjectId("stu_10") });

// All students in a course (with $lookup for names)
db.enrollments.aggregate([
  { $match: { courseId: ObjectId("crs_201") } },
  { $lookup: {
      from: "students",
      localField: "studentId",
      foreignField: "_id",
      as: "student"
  }},
  { $unwind: "$student" },
  { $project: { grade: 1, "student.name": 1 } }
]);
```

Put relationship fields (`grade`, `enrolledAt`) on the join doc. Use **compound unique indexes** to prevent duplicates.

## What is schema validation in MongoDB and when should you use it?

**Schema validation** enforces document shape via **JSON Schema** at insert/update — opt-in, server-side.

```
Client/App ──► insert/update ──► MongoDB ──► validator (JSON Schema)
                                    │
                                    ├─ pass ──► write
                                    └─ fail ──► WriteError (code 121)
```

| `validationLevel` | `strict` — inserts + updates; `moderate` — legacy-safe updates |
| `validationAction` | `error` — reject; `warn` — log and allow (migration) |

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "createdAt", "role"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[\\w.-]+@[\\w.-]+\\.\\w+$",
          description: "must be a valid email"
        },
        role: { enum: ["admin", "editor", "viewer"] },
        age: { bsonType: "int", minimum: 0, maximum: 150 },
        createdAt: { bsonType: "date" }
      },
      additionalProperties: false
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// Valid insert
db.users.insertOne({
  email: "dev@example.com",
  role: "editor",
  age: 30,
  createdAt: new Date()
});

// Invalid — missing required field
db.users.insertOne({ email: "x@y.com" });
// MongoServerError: Document failed validation

// Add validation to existing collection (use moderate during migration)
db.runCommand({
  collMod: "orders",
  validator: { $jsonSchema: { required: ["status", "total"], properties: {
    status: { enum: ["pending", "paid", "shipped", "cancelled"] },
    total: { bsonType: ["decimal", "double", "int"], minimum: 0 }
  }}},
  validationLevel: "moderate"
});
```

Use for API contracts and regulated data. Does not enforce cross-document FK constraints — handle in app code. Use `moderate` + `warn` during migrations.

## What is the polymorphic pattern and when do you use it?

Store multiple shapes in **one collection**, discriminated by `type` / `kind` — like OOP inheritance or union types.

```
events collection
├── { type: "login",  userId, ip, ... }
├── { type: "purchase", orderId, amount, ... }
└── { type: "pageview", url, referrer, ... }
```

| Variant | Trade-off |
|---------|-----------|
| **Single collection + discriminator** | Cross-type queries easy; sparse indexes |
| **Collection per type** | Clean per-type schema; `$unionWith` for cross-type |

```javascript
// Single collection polymorphism — activity feed
db.activities.createIndex({ userId: 1, createdAt: -1 });
db.activities.createIndex({ type: 1, createdAt: -1 });

db.activities.insertMany([
  { type: "comment", userId: ObjectId("u1"), postId: ObjectId("p10"),
    text: "Great article!", createdAt: ISODate("2025-06-01T12:00:00Z") },
  { type: "like", userId: ObjectId("u1"), postId: ObjectId("p10"),
    createdAt: ISODate("2025-06-01T12:01:00Z") }
]);

// Query one type
db.activities.find({ userId: ObjectId("u1"), type: "comment" })
  .sort({ createdAt: -1 });

// Polymorphic validation — use $jsonSchema oneOf per type (see schema validation section)
```

Use for audit logs, notifications, CMS blocks. Separate collections when types share no queries.

## What is the bucket pattern and when do you use it?

The **bucket pattern** groups time-series events into one document per window (hour/day) or fixed count — fewer docs, less index RAM.

```
Without buckets:  1 doc per reading  ──► millions of tiny documents
With buckets:     1 doc per (sensor + hour) ──► thousands of docs, array of readings

sensors_readings
  { sensorId, bucketDate: "2025-06-01T14", count: 3600,
    readings: [ { t: ISODate(...), v: 22.1 }, ... ] }
```

| Benefit | Explanation |
|---------|-------------|
| **Fewer documents** | Lower index RAM, faster range scans |
| **Locality** | Time-range reads hit one doc |
| **Controlled growth** | Roll to new bucket when array hits threshold |

```javascript
const BUCKET_MAX = 1000;

function insertReading(sensorId, timestamp, value) {
  const bucketStart = new Date(timestamp);
  bucketStart.setMinutes(0, 0, 0);
  db.sensors_readings.updateOne(
    { sensorId, bucketStart, count: { $lt: BUCKET_MAX } },
    {
      $push: { readings: { t: timestamp, v: value } },
      $inc: { count: 1, sum: value },
      $min: { min: value },
      $max: { max: value }
    },
    { upsert: true }
  );
}

db.sensors_readings.createIndex({ sensorId: 1, bucketStart: -1 });
db.sensors_readings.find({
  sensorId: ObjectId("sensor_temp_01"),
  bucketStart: { $gte: ISODate("2025-06-01T00:00:00Z"), $lt: ISODate("2025-06-02T00:00:00Z") }
});
```

Use for IoT and clickstream. Cap array size for **16 MB limit**. Prefer **Time Series Collections** (5.0+) for pure time-series.

## What are common MongoDB schema anti-patterns?

Common mistakes: treating MongoDB like SQL or ignoring document growth limits.

```
ANTI-PATTERN: Massive unbounded array
  post.comments: [ ... 50,000 comments ... ]  ──► 16MB risk, rewrite whole doc per comment

ANTI-PATTERN: Bloated document
  user: { ... everything ever ... }  ──► hot doc in RAM, slow updates

ANTI-PATTERN: Scatter-gather
  1 query per item in a loop  ──► N+1 problem (same as SQL ORMs)
```

| Anti-pattern | Problem | Fix |
|--------------|---------|-----|
| **Massive arrays** | 16 MB cap; whole-doc rewrite on `$push` | Child collection + pagination |
| **Unbounded document growth** | RAM pressure; replication lag | Bucket pattern, archival, separate collections |
| **Over-embedding shared entities** | Update amplification across parents | Reference + `$lookup` or cache |
| **No indexes** | COLLSCAN | Compound indexes on filter + sort |
| **Schema chaos** | Inconsistent types | Validation + conventions |

```javascript
// BAD — unbounded comments array on post
db.posts.updateOne(
  { _id: ObjectId("post_1") },
  { $push: { comments: { userId: ObjectId("u99"), text: "...", at: new Date() } } }
);
// Every comment rewrites the entire post document

// GOOD — comments collection
db.comments.insertOne({
  postId: ObjectId("post_1"),
  userId: ObjectId("u99"),
  text: "Insightful write-up.",
  createdAt: new Date()
});
db.comments.createIndex({ postId: 1, createdAt: -1 });

// GOOD — audit log stores actorId + display snapshot, not full profile
db.audit_logs.insertOne({
  action: "DELETE",
  actorId: ObjectId("u42"),
  actorName: "Ada L."
});
```

Cite **16 MB limit**, **WiredTiger cache** pressure, and **write amplification** on growing arrays.

## What strategies exist for schema migration in MongoDB?

MongoDB migrations are **application-driven** and **online** — no `ALTER TABLE`.

```
Migration lifecycle
  1. Deploy code that writes BOTH old + new shape (dual-write)
  2. Backfill historical documents (batch job)
  3. Deploy code that reads new shape only
  4. Remove old fields (lazy or batch cleanup)
```

| Strategy | Best for |
|----------|----------|
| **Lazy migration** | Transform on read; small collections |
| **Batch backfill** | Chunked `updateMany` / `$merge` |
| **Dual-write** | Zero-downtime cutover |
| **Expand-contract** | Add → migrate → remove old fields |

```javascript
// Phase 1 — chunked backfill
const cursor = db.users.find({ fullName: { $exists: false } }).batchSize(500);
let bulk = [];
for (const doc of cursor) {
  bulk.push({ updateOne: {
    filter: { _id: doc._id },
    update: { $set: { fullName: `${doc.firstName} ${doc.lastName}` } }
  }});
  if (bulk.length === 500) { db.users.bulkWrite(bulk); bulk = []; }
}
if (bulk.length) db.users.bulkWrite(bulk);

// Phase 2 — reshape with aggregation $merge
db.orders.aggregate([
  { $match: { shippingAddress: { $exists: true }, "address.line1": { $exists: false } } },
  { $set: { address: {
      line1: "$shippingAddress.street",
      city: "$shippingAddress.city",
      postalCode: "$shippingAddress.zip"
  }}},
  { $unset: "shippingAddress" },
  { $merge: { into: "orders", whenMatched: "replace" } }
]);

// Phase 3 — tighten validation; lazy migrate on read in app code
db.runCommand({ collMod: "users", validationLevel: "strict", validationAction: "error" });
```

Throttle backfill to protect **replication lag**. Track progress in a `migrations` collection. Keep old fields until rollback is ruled out.
