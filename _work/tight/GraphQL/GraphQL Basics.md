# GraphQL Basics

## Questions Covered

1. What is GraphQL, and how does it differ from REST?
2. What are queries, mutations, and subscriptions?
3. What is a GraphQL schema and SDL?
4. What are types, fields, and nullability?
5. What are arguments, variables, and aliases?
6. What is the GraphQL execution model?
7. What are resolvers, and how do they work?
8. What is the N+1 problem in GraphQL?
9. How do you handle errors in GraphQL?
10. What is GraphQL introspection?
11. What are GraphQL vs REST trade-offs for interviews?
12. When should you not use GraphQL?

## What is GraphQL, and how does it differ from REST?

**GraphQL** is a **query language and runtime** for APIs. Clients send a **single request** describing exactly which fields they need; the server returns JSON matching that shape.

**REST** exposes many endpoints with **fixed response shapes**:

```http
GET /api/users/42
GET /api/users/42/orders
GET /api/users/42/orders/99/items
```

**GraphQL** uses one endpoint (typically `POST /graphql`) and one query:

```graphql
query {
  user(id: "42") {
    name
    email
    orders(status: OPEN) {
      id
      total
      items { productName quantity }
    }
  }
}
```

| Aspect | REST | GraphQL |
|--------|------|---------|
| **Endpoints** | Many URLs | Usually one |
| **Over-fetching** | Common (extra fields) | Client selects fields |
| **Under-fetching** | Multiple round-trips | Nested data in one request |
| **Versioning** | `/v1`, `/v2` URLs | Evolve schema; deprecate fields |
| **Caching** | HTTP cache (GET) | Client cache (Apollo) + CDN harder |
| **Contract** | OpenAPI (optional) | Schema (required) |

**Best fit:** Mobile/web clients with **different data needs**, BFF layer aggregating backends, strong typing between frontend and backend.

## What are queries, mutations, and subscriptions?

GraphQL has three operation types:

| Operation | Purpose | HTTP analogy | Side effects? |
|-----------|---------|--------------|---------------|
| **Query** | Read data | GET | Should be side-effect free |
| **Mutation** | Write data | POST/PUT/DELETE | Yes — creates/updates/deletes |
| **Subscription** | Real-time updates | WebSocket/SSE | Server pushes events |

**Query — read:**

```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    price
  }
}
```

**Mutation — write:**

```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    order { id total status }
    errors { field message code }
  }
}
```

**Subscription — real-time:**

```graphql
subscription OnOrderUpdated($orderId: ID!) {
  orderStatusChanged(orderId: $orderId) {
    id
    status
    updatedAt
  }
}
```

**Convention:** Queries should not change server state. Mutations run **sequentially** (not in parallel) if multiple in one request. Subscriptions require WebSocket or SSE transport.

## What is a GraphQL schema and SDL?

The **schema** is the **contract** — types, fields, and operations clients may request. Written in **SDL (Schema Definition Language)**:

```graphql
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

type Query {
  user(id: ID!): User
  products(filter: ProductFilter, limit: Int = 20): [Product!]!
}

type Mutation {
  createOrder(input: CreateOrderInput!): CreateOrderPayload!
}

type User {
  id: ID!
  name: String!
  email: String!
  orders: [Order!]!
}

type Order {
  id: ID!
  total: Float!
  status: OrderStatus!
  items: [OrderItem!]!
}

enum OrderStatus {
  PENDING
  SHIPPED
  DELIVERED
  CANCELLED
}

input CreateOrderInput {
  customerId: ID!
  lineItems: [LineItemInput!]!
}

input LineItemInput {
  productId: ID!
  quantity: Int!
}

type CreateOrderPayload {
  order: Order
  errors: [UserError!]!
}

type UserError {
  field: String
  message: String!
  code: String
}
```

**Schema-first:** Write SDL → generate types/resolvers. **Code-first:** Define types in C#/TS → generate schema (Hot Chocolate, type-graphql).

## What are types, fields, and nullability?

GraphQL's type system prevents many client/server mismatches:

| Syntax | Meaning |
|--------|---------|
| `String` | Nullable string — may return `null` |
| `String!` | Non-null — must always return a value |
| `[Order!]` | List may contain nulls (rare) |
| `[Order!]!` | Non-null list of non-null orders |
| `ID` | Scalar — serialized as string (often UUID/int) |

```graphql
type Product {
  id: ID!
  name: String!
  description: String          # nullable
  tags: [String!]!             # non-null list; items non-null
  reviews: [Review!]           # nullable list
}
```

**Null propagation:** If a non-null field resolves to `null`, GraphQL **bubbles the error up** — parent field may become null and error appears in `errors` array. Design nullability carefully — use `!` only when guaranteed.

**Scalars built-in:** `Int`, `Float`, `String`, `Boolean`, `ID`. Custom scalars: `DateTime`, `JSON`, `Decimal`.

## What are arguments, variables, and aliases?

**Field arguments** — filter and parameterize fields:

```graphql
query {
  products(category: "electronics", limit: 10, sortBy: PRICE_DESC) {
    id
    name
    price
  }
}
```

**Variables** — parameterized operations (required for production — no string concatenation):

```graphql
query GetUser($id: ID!, $orderStatus: OrderStatus) {
  user(id: $id) {
    name
    orders(status: $orderStatus) { id total }
  }
}
```

Variables JSON:

```json
{ "id": "42", "orderStatus": "OPEN" }
```

**Aliases** — same field, different arguments, different result keys:

```graphql
query {
  openOrders: orders(status: OPEN) { id }
  shippedOrders: orders(status: SHIPPED) { id }
}
```

**Directives** — conditional inclusion:

```graphql
query GetUser($withOrders: Boolean!) {
  user(id: "42") {
    name
    orders @include(if: $withOrders) { id total }
  }
}
```

## What is the GraphQL execution model?

```text
1. Parse query document → AST
2. Validate against schema (unknown fields/types fail fast)
3. Execute operation:
     Resolve root fields (Query/Mutation)
     For each field, call resolver → get value
     Recursively resolve nested fields (breadth-first by level)
4. Return { data, errors } JSON
```

```text
query { user { name orders { total } } }
         ↓
    resolve user(id)
         ↓
    resolve user.name    resolve user.orders (list)
                              ↓
                         resolve order.total for each
```

Execution is **predictable** — same query + same data = same shape. **@defer** and **@stream** (incremental delivery) allow streaming large results in modern GraphQL.

## What are resolvers, and how do they work?

A **resolver** is a function that returns the value for a field:

```typescript
const resolvers = {
  Query: {
    user: (_parent, args: { id: string }, context: Context) =>
      context.db.users.findById(args.id),
  },
  User: {
    // parent = User object from parent resolver
    orders: (parent, args, context) =>
      context.db.orders.findByUserId(parent.id, args.status),
  },
  Order: {
    total: (parent) => parent.lineItems.reduce((s, i) => s + i.price * i.qty, 0),
  },
};
```

**Resolver signature:** `(parent, args, context, info) => result`

| Parameter | Purpose |
|-----------|---------|
| **parent** | Result from parent field resolver |
| **args** | Field arguments (`id`, `filter`, etc.) |
| **context** | Shared per request — DB, current user, loaders |
| **info** | Query AST metadata — used for projections |

**Keep resolvers thin** — delegate to service layer. Business logic belongs in domain services, not scattered in every field resolver.

## What is the N+1 problem in GraphQL?

Nested queries can trigger **one database query per child object**:

```graphql
query {
  users {           # 1 query: get 100 users
    orders { id }   # 100 queries: one per user → N+1
  }
}
```

```text
Without batching: 1 + N queries (101 for 100 users)
With DataLoader:  2 queries (users, then all orders WHERE userId IN (...))
```

**DataLoader** batches and caches within a single request:

```typescript
const orderLoader = new DataLoader(async (userIds: readonly string[]) => {
  const orders = await db.orders.findByUserIds([...userIds]);
  return userIds.map(id => orders.filter(o => o.userId === id));
});

// In resolver
User: {
  orders: (user, _args, ctx) => ctx.loaders.orders.load(user.id),
}
```

**Other fixes:**
- **EF Core + Hot Chocolate** `UseProjection()` — push SELECT to SQL
- **Join/eager load** at root when field always requested
- **Lookahead** — inspect selection set in resolver

**Interview must-know:** GraphQL doesn't cause N+1 — **naive resolvers** do. Always mention DataLoader.

## How do you handle errors in GraphQL?

GraphQL often returns **HTTP 200** with partial data and an `errors` array:

```json
{
  "data": {
    "user": {
      "name": "Ada",
      "orders": null
    }
  },
  "errors": [
    {
      "message": "Not authorized to view orders",
      "path": ["user", "orders"],
      "extensions": { "code": "FORBIDDEN" }
    }
  ]
}
```

| Pattern | When |
|---------|------|
| **Top-level `errors`** | Unexpected exceptions, auth failures |
| **Union / payload types** | Expected domain errors (validation) |
| **`extensions.code`** | Client-friendly handling (`VALIDATION_ERROR`) |

**Mutation payload pattern (recommended):**

```graphql
type CreateOrderPayload {
  order: Order
  errors: [UserError!]!
}

type UserError {
  field: String
  message: String!
  code: String!
}
```

Client checks `errors` array in payload — no thrown exception for "quantity must be > 0."

**Security:** Don't expose stack traces in `extensions` in production.

## What is GraphQL introspection?

Introspection lets clients query the schema itself:

```graphql
{
  __schema {
    types { name kind }
  }
  __type(name: "User") {
    fields { name type { name } }
  }
}
```

| Use | Risk |
|-----|------|
| GraphiQL / Banana Cake Pop IDE | Exposes full API surface |
| Code generation (GraphQL Code Generator) | Attackers map your API |
| Documentation | Disable in production or restrict network |

**Tools:** GraphQL Code Generator → TypeScript types and React hooks from schema.

## What are GraphQL vs REST trade-offs for interviews?

**Choose GraphQL when:**
- Multiple clients (web, mobile, admin) need **different shapes** of same data
- Reducing **chatty REST** calls matters (mobile on slow networks)
- Strong **typed contract** between teams is valued
- Building a **BFF** (Backend for Frontend) aggregation layer

**Choose REST when:**
- Simple CRUD, **public API**, HTTP caching at CDN is critical
- File upload/download, streaming binary
- Team unfamiliar with GraphQL operational complexity (N+1, query cost)
- **HTTP semantics** (ETag, 304) matter

| GraphQL cost | Detail |
|--------------|--------|
| **Query complexity** | Need max depth / cost analysis |
| **Caching** | No simple CDN GET cache for POST queries |
| **Authorization** | Must secure every field, not just endpoint |
| **Monitoring** | Harder than REST path-based metrics |

See also **Interview Comparisons.md** — REST vs GraphQL vs gRPC.

## When should you not use GraphQL?

| Scenario | Better fit |
|----------|------------|
| File download / upload | REST multipart, signed URLs |
| Simple internal CRUD | REST or gRPC |
| High-performance service-to-service | gRPC + Protobuf |
| Heavy reporting / CSV export | REST endpoint or SQL |
| Team lacks GraphQL experience | REST until pain is real |

**Anti-pattern:** GraphQL on **every** microservice — operational overhead multiplies. Common pattern: **GraphQL gateway/BFF** in front of REST/gRPC services.

```text
React app → GraphQL BFF → REST Order API
                        → REST Product API
                        → gRPC Inventory service
```

## Related Topics

- GraphQL/GraphQL with .NET and Node.js.md
- Important Concepts/Interview Comparisons.md
- C#/WebApi Basics.md
- React/React HTTP and Data Fetching.md
- Microservices/Microservices Communication.md
