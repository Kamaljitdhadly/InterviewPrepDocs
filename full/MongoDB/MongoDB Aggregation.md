# MongoDB Aggregation

## Questions Covered

1. What is the MongoDB aggregation pipeline overview?
2. How do `$match`, `$group`, and `$project` work?
3. How do you use `$lookup` for joins?
4. What does `$unwind` do and when do you need it?
5. How do `$sort`, `$limit`, and `$skip` behave in a pipeline?
6. What is `$facet` and when is it useful?
7. When should you use aggregation vs `find()`?
8. What aggregation performance tips matter in interviews?

## What is the MongoDB aggregation pipeline overview?

The **aggregation pipeline** processes documents through ordered **stages**—like a Unix pipe for BSON.

| Concept | Description |
|---------|-------------|
| Stage | `$match`, `$group`, `$lookup`, etc. |
| Pipeline | `db.orders.aggregate([...])` |
| Output | Cursor or `$out` / `$merge` |

Place `$match` and field-trimming `$project` **early**; indexes help first-stage `$match` and `$sort`.

```javascript
// mongosh — revenue by category for 2025 orders
db.orders.aggregate([
  { $match: { status: "completed", placedAt: { $gte: ISODate("2025-01-01") } } },
  { $unwind: "$lineItems" },
  {
    $group: {
      _id: "$lineItems.category",
      revenue: { $sum: { $multiply: ["$lineItems.qty", "$lineItems.price"] } },
      orders: { $addToSet: "$_id" }
    }
  },
  { $project: { category: "$_id", revenue: 1, orderCount: { $size: "$orders" }, _id: 0 } },
  { $sort: { revenue: -1 } }
]);
```

```javascript
// Node.js driver
async function revenueByCategory(db, since) {
  return db.collection('orders').aggregate([
    { $match: { status: 'completed', placedAt: { $gte: since } } },
    { $unwind: '$lineItems' },
    {
      $group: {
        _id: '$lineItems.category',
        revenue: { $sum: { $multiply: ['$lineItems.qty', '$lineItems.price'] } },
        orders: { $addToSet: '$_id' },
      },
    },
    {
      $project: {
        category: '$_id',
        revenue: 1,
        orderCount: { $size: '$orders' },
        _id: 0,
      },
    },
    { $sort: { revenue: -1 } },
  ]).toArray();
}
```

**Interview answer:** Pipeline = ordered stages transforming documents; push `$match` first; know core stages; aggregation server-side reduces round trips vs client-side grouping.

## How do `$match`, `$group`, and `$project` work?

Filter, aggregate, reshape—the core analytics trio.

| Stage | Role | SQL analog |
|-------|------|------------|
| `$match` | Filter (like `find`) | `WHERE` |
| `$group` | Aggregate by `_id` | `GROUP BY` |
| `$project` | Reshape output | `SELECT` |

`$match` should be early for indexes. Accumulators: `$sum`, `$avg`, `$min`, `$max`, `$push`, `$addToSet`, `$first`, `$last`.

```javascript
// mongosh — monthly signups by country
db.users.aggregate([
  { $match: { verified: true, createdAt: { $gte: ISODate("2024-01-01") } } },
  {
    $group: {
      _id: {
        country: "$address.country",
        month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
      },
      signups: { $sum: 1 },
      domains: { $addToSet: { $arrayElemAt: [{ $split: ["$email", "@"] }, 1] } }
    }
  },
  {
    $project: {
      country: "$_id.country",
      month: "$_id.month",
      signups: 1,
      uniqueDomains: { $size: "$domains" },
      _id: 0
    }
  },
  { $sort: { month: 1, signups: -1 } }
]);
```

```javascript
// Node.js driver
async function monthlySignupsByCountry(db, since) {
  return db.collection('users').aggregate([
    { $match: { verified: true, createdAt: { $gte: since } } },
    {
      $group: {
        _id: {
          country: '$address.country',
          month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        },
        signups: { $sum: 1 },
        domains: {
          $addToSet: { $arrayElemAt: [{ $split: ['$email', '@'] }, 1] },
        },
      },
    },
    {
      $project: {
        country: '$_id.country',
        month: '$_id.month',
        signups: 1,
        uniqueDomains: { $size: '$domains' },
        _id: 0,
      },
    },
    { $sort: { month: 1, signups: -1 } },
  ]).toArray();
}
```

**Interview answer:** `$match` early; `$group` requires `_id`; use `$project` to clean output; accumulators differ—`$addToSet` vs `$push` for uniqueness.

## How do you use `$lookup` for joins?

`$lookup` performs a **left outer join**. Classic form: `localField`/`foreignField`. Pipeline form: `let` + `pipeline` for correlated joins. Index `foreignField`; `$unwind` for flat 1:1 output.

```javascript
// mongosh — classic lookup
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      orderId: "$_id",
      total: 1,
      customerName: "$customer.name",
      customerEmail: "$customer.email"
    }
  }
]);

// pipeline lookup — correlated
db.products.aggregate([
  {
    $lookup: {
      from: "reviews",
      let: { productId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$productId", "$$productId"] }, rating: { $gte: 4 } } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 }
      ],
      as: "topReviews"
    }
  }
]);
```

```javascript
// Node.js driver
async function ordersWithCustomers(db) {
  return db.collection('orders').aggregate([
    { $match: { status: 'completed' } },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        orderId: '$_id',
        total: 1,
        customerName: '$customer.name',
        customerEmail: '$customer.email',
      },
    },
  ]).toArray();
}

async function productsWithTopReviews(db) {
  return db.collection('products').aggregate([
    {
      $lookup: {
        from: 'reviews',
        let: { productId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$productId', '$$productId'] },
              rating: { $gte: 4 },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 3 },
        ],
        as: 'topReviews',
      },
    },
  ]).toArray();
}
```

**Interview answer:** `$lookup` = left outer join; classic for simple key equality; pipeline form for correlated/filtered joins; index `foreignField`; `$unwind` if you need a flat 1:1 shape.

## What does `$unwind` do and when do you need it?

`$unwind` emits one document per array element. Use before per-item `$group` or after `$lookup` to flatten. `preserveNullAndEmptyArrays: true` keeps docs with empty arrays.

```javascript
// mongosh
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$lineItems" },
  {
    $group: {
      _id: "$lineItems.sku",
      qtySold: { $sum: "$lineItems.qty" },
      revenue: { $sum: { $multiply: ["$lineItems.qty", "$lineItems.price"] } }
    }
  }
]);

// unwind with index for ranking inside order
db.orders.aggregate([
  { $unwind: { path: "$lineItems", includeArrayIndex: "lineIndex" } },
  { $match: { lineIndex: 0 } } // first line item only
]);
```

```javascript
// Node.js driver
async function salesBySku(db) {
  return db.collection('orders').aggregate([
    { $match: { status: 'completed' } },
    { $unwind: '$lineItems' },
    {
      $group: {
        _id: '$lineItems.sku',
        qtySold: { $sum: '$lineItems.qty' },
        revenue: {
          $sum: { $multiply: ['$lineItems.qty', '$lineItems.price'] },
        },
      },
    },
  ]).toArray();
}
```

**Interview answer:** `$unwind` = one doc per array element; required before grouping array elements; use `preserveNullAndEmptyArrays` for optional relations; mind document multiplication cost on large arrays.

## How do `$sort`, `$limit`, and `$skip` behave in a pipeline?

`$sort` orders (1/-1). `$limit` caps count. `$skip` discards leading docs—expensive at high offsets; prefer keyset pagination. Top-N: sort + limit before heavy `$lookup`. Large sorts may need `allowDiskUse: true`.

```javascript
// mongosh — top 10 products by rating (after computing avg)
db.reviews.aggregate([
  { $group: { _id: "$productId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  { $match: { count: { $gte: 5 } } },
  { $sort: { avgRating: -1 } },
  { $limit: 10 }
]);

// offset pagination (avoid large skip in production)
db.products.aggregate([
  { $sort: { name: 1 } },
  { $skip: 20 },
  { $limit: 10 }
]);
```

```javascript
// Node.js driver — keyset pagination preferred
async function topRatedProducts(db, minReviews = 5) {
  return db.collection('reviews').aggregate([
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gte: minReviews } } },
    { $sort: { avgRating: -1 } },
    { $limit: 10 },
  ]).toArray();
}

async function productsAfterName(db, lastName, pageSize = 10) {
  return db.collection('products').aggregate([
    { $match: { name: { $gt: lastName } } },
    { $sort: { name: 1 } },
    { $limit: pageSize },
  ]).toArray();
}
```

**Interview answer:** Sort + limit early for top-N; large `$skip` is O(n); use keyset pagination; `allowDiskUse` for big sorts; compound index can cover `$match` + `$sort`.

## What is `$facet` and when is it useful?

`$facet` runs **parallel sub-pipelines** on the same input—dashboard counts, buckets, and paged items in one round trip.

```javascript
// mongosh — search results with metadata
db.products.aggregate([
  { $match: { category: "electronics", price: { $lte: 500 } } },
  {
    $facet: {
      metadata: [{ $count: "total" }],
      priceRanges: [
        {
          $bucket: {
            groupBy: "$price",
            boundaries: [0, 100, 250, 500],
            default: "500+",
            output: { count: { $sum: 1 } }
          }
        }
      ],
      items: [
        { $sort: { rating: -1 } },
        { $skip: 0 },
        { $limit: 12 },
        { $project: { name: 1, price: 1, rating: 1 } }
      ]
    }
  }
]);
```

```javascript
// Node.js driver
async function productSearchFacets(db, category, maxPrice, page = 0, pageSize = 12) {
  const [result] = await db.collection('products').aggregate([
    { $match: { category, price: { $lte: maxPrice } } },
    {
      $facet: {
        metadata: [{ $count: 'total' }],
        priceRanges: [
          {
            $bucket: {
              groupBy: '$price',
              boundaries: [0, 100, 250, 500],
              default: '500+',
              output: { count: { $sum: 1 } },
            },
          },
        ],
        items: [
          { $sort: { rating: -1 } },
          { $skip: page * pageSize },
          { $limit: pageSize },
          { $project: { name: 1, price: 1, rating: 1 } },
        ],
      },
    },
  ]).toArray();

  return result;
}
```

**Interview answer:** `$facet` = parallel sub-pipelines on same input; one DB round trip for multi-part UI; each facet independent; watch memory—all branches process full input set.

## When should you use aggregation vs `find()`?

| Use `find()` | Use `aggregation` |
|--------------|-------------------|
| Filter + project + sort | `$group`, `$lookup`, `$unwind` |
| Document-as-stored CRUD | Joins, analytics, reshaping |

Use aggregation when you'd otherwise group or join in application code.

```javascript
// mongosh — find: simple list
db.orders.find(
  { customerId: ObjectId("..."), status: "open" },
  { projection: { total: 1, placedAt: 1 } }
).sort({ placedAt: -1 }).limit(20);

// aggregation: same filter but with customer join + computed field
db.orders.aggregate([
  { $match: { customerId: ObjectId("..."), status: "open" } },
  { $sort: { placedAt: -1 } },
  { $limit: 20 },
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: "$customer" },
  {
    $project: {
      total: 1,
      placedAt: 1,
      discountEligible: { $gte: ["$customer.loyaltyPoints", 100] }
    }
  }
]);
```

```javascript
// Node.js driver
async function listOpenOrders(db, customerId) {
  return db.collection('orders')
    .find({ customerId, status: 'open' }, { projection: { total: 1, placedAt: 1 } })
    .sort({ placedAt: -1 })
    .limit(20)
    .toArray();
}

async function openOrdersWithEligibility(db, customerId) {
  return db.collection('orders').aggregate([
    { $match: { customerId, status: 'open' } },
    { $sort: { placedAt: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
    {
      $project: {
        total: 1,
        placedAt: 1,
        discountEligible: { $gte: ['$customer.loyaltyPoints', 100] },
      },
    },
  ]).toArray();
}
```

**Interview answer:** `find` for document retrieval; aggregation for joins, grouping, analytics, and shaped reports; don't ship large datasets to the app to group in JS.

## What aggregation performance tips matter in interviews?

| Tip | Why |
|-----|-----|
| `$match` / `$project` early | Index + less data downstream |
| Index `$lookup` foreign key | Avoid nested loops |
| `$limit` before `$lookup` | Join fewer rows |
| Keyset pagination | Not large `$skip` |
| `allowDiskUse: true` | Big sorts/groups (100 MB stage limit) |

```javascript
// mongosh — optimized vs naive
// good: filter and trim before join
db.orders.aggregate([
  { $match: { placedAt: { $gte: ISODate("2025-06-01") }, status: "completed" } },
  { $project: { customerId: 1, total: 1 } },
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customer"
    }
  },
  { $unwind: "$customer" },
  { $group: { _id: "$customer.country", revenue: { $sum: "$total" } } }
], { allowDiskUse: true });

// ensure foreign index
db.customers.createIndex({ _id: 1 }); // default
db.orders.createIndex({ placedAt: 1, status: 1 });
```

```javascript
// Node.js driver
async function revenueByCountrySince(db, since) {
  return db.collection('orders').aggregate(
    [
      { $match: { placedAt: { $gte: since }, status: 'completed' } },
      { $project: { customerId: 1, total: 1 } },
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      { $group: { _id: '$customer.country', revenue: { $sum: '$total' } } },
    ],
    { allowDiskUse: true },
  ).toArray();
}

async function ensureAggIndexes(db) {
  await db.collection('orders').createIndex({ placedAt: 1, status: 1 });
}
```

**Interview answer:** Filter and project early; index match/sort/lookup fields; limit before join; keyset not skip; `allowDiskUse` when needed; explain slow pipelines; avoid massive unwinds without `$match` first.
