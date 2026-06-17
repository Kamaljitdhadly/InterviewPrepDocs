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

Aggregation runs documents through ordered **stages**—each transforms the stream and passes to the next.

| Category | Stages |
|----------|--------|
| Filter | `$match` |
| Reshape | `$project`, `$addFields` |
| Analyze | `$group`, `$bucket` |
| Join / array | `$lookup`, `$unwind` |
| Paginate | `$sort`, `$limit`, `$skip` |
| Multi-output | `$facet` |

Put `$match` and field-trimming `$project` **early** to leverage indexes and shrink working set.

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

**Interview:** Ordered server-side transforms; `$match` first; replaces client-side grouping loops.

## How do `$match`, `$group`, and `$project` work?

| Stage | Role | SQL analog |
|-------|------|------------|
| `$match` | Filter docs | `WHERE` |
| `$group` | Aggregate by `_id` | `GROUP BY` |
| `$project` | Reshape output | `SELECT` |

Accumulators: `$sum`, `$avg`, `$min`, `$max`, `$push`, `$addToSet`, `$first`, `$last`. `_id` in `$group` can be a compound expression.

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

**Interview:** `$match` early; `$group` needs `_id`; `$addToSet` vs `$push` for uniqueness.

## How do you use `$lookup` for joins?

`$lookup` = **left outer join**. Classic form uses `localField`/`foreignField`; pipeline form uses `let` + `pipeline` for correlated joins.

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

**Interview:** Left outer join; pipeline form for filtered/correlated joins; index `foreignField`.

## What does `$unwind` do and when do you need it?

`$unwind` emits **one document per array element**. Use before per-item `$group`; after `$lookup` to flatten 1:1 joins.

| Option | Effect |
|--------|--------|
| `preserveNullAndEmptyArrays: true` | Keep docs with empty/missing array |
| `includeArrayIndex` | Add element index field |

Mind document multiplication cost on large arrays.

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

**Interview:** Explode arrays for aggregation; `preserveNullAndEmptyArrays` for optional relations.

## How do `$sort`, `$limit`, and `$skip` behave in a pipeline?

`$sort` orders (1/-1). `$limit` caps count. `$skip` discards leading docs — **expensive** at high offsets; prefer keyset pagination.

Top-N: `$sort` then `$limit` before heavy `$lookup`. Large sorts may need `allowDiskUse: true` (100 MB stage limit).

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

**Interview:** Sort+limit early for top-N; keyset over `$skip`; index `$match`+`$sort`.

## What is `$facet` and when is it useful?

`$facet` runs **parallel sub-pipelines** on the same input—one round trip for totals, buckets, and paged items.

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

**Interview:** Dashboard/filter UI in one query; all facets share upstream `$match` input.

## When should you use aggregation vs `find()`?

| `find()` | `aggregation` |
|----------|---------------|
| Filter + project + sort | `$group`, `$lookup`, `$unwind` |
| Document-as-stored CRUD | Joins, analytics, reshaping |
| Covered point lookups | Computed / report-shaped output |

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

**Interview:** `find` for retrieval; aggregation for joins/grouping/reports.

## What aggregation performance tips matter in interviews?

| Tip | Why |
|-----|-----|
| `$match` / `$project` early | Index + less data downstream |
| Index `$lookup` foreign key | Avoid nested loops |
| `$limit` before `$lookup` | Join fewer rows |
| Avoid huge `$unwind` | Document explosion |
| Keyset pagination | Not large `$skip` |
| `allowDiskUse: true` | Big sorts/groups |

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

**Interview:** Filter early; index join keys; limit before lookup; explain slow pipelines.
