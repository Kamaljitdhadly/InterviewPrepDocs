# GraphQL Basics

## Questions Covered

1. What is GraphQL, and how does it differ from REST?
2. What are queries, mutations, and subscriptions?
3. What is a GraphQL schema?
4. What are types, fields, and nullability in GraphQL?
5. What are arguments and variables?
6. What is the GraphQL execution model?
7. What are resolvers?
8. What is the N+1 problem in GraphQL?
9. How do you handle errors in GraphQL?
10. What is GraphQL introspection?
11. What are GraphQL vs REST trade-offs for interviews?
12. When should you not use GraphQL?

## What is GraphQL, and how does it differ from REST?

**GraphQL** is a **query language and runtime** for APIs — clients request **exactly the fields** they need from a single endpoint.

| Aspect | REST | GraphQL |
|--------|------|---------|
| **Endpoints** | Many URLs (`/users`, `/orders`) | One (`/graphql`) |
| **Data fetching** | Fixed response shape | Client selects fields |
| **Over/under-fetching** | Common | Reduced |
| **Versioning** | `/v1`, `/v2` | Evolve schema |
| **Caching** | HTTP cache friendly | POST; needs client cache (Apollo) |

```graphql
query {
  user(id: "42") {
    name
    email
    orders { id total status }
  }
}
```

One round-trip for nested data vs multiple REST calls.

## What are queries, mutations, and subscriptions?

| Operation | Purpose | HTTP analogy |
|-----------|---------|--------------|
| **Query** | Read data | GET |
| **Mutation** | Write data | POST/PUT/DELETE |
| **Subscription** | Real-time updates | WebSocket |

```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    order { id total }
    errors { message field }
  }
}

subscription OnOrderStatusChanged($orderId: ID!) {
  orderStatusChanged(orderId: $orderId) {
    id status
  }
}
```

**Convention:** queries should be side-effect free; mutations handle writes.

## What is a GraphQL schema?

**Schema** defines types and operations — contract between client and server:

```graphql
type Query {
  user(id: ID!): User
  products(filter: ProductFilter): [Product!]!
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
}

enum OrderStatus { PENDING SHIPPED DELIVERED }

input CreateOrderInput {
  customerId: ID!
  lineItems: [LineItemInput!]!
}
```

Schema-first or code-first — both generate executable schema.

## What are types, fields, and nullability in GraphQL?

| Syntax | Meaning |
|--------|---------|
| `String` | Nullable string |
| `String!` | Non-null string |
| `[Order!]!` | Non-null list of non-null orders |

```graphql
type Product {
  id: ID!
  name: String!
  description: String      # nullable
  tags: [String!]!         # list may be empty; items non-null
}
```

Non-null violations bubble up as field errors — design nullability carefully.

## What are arguments and variables?

**Field arguments:**

```graphql
query {
  products(category: "electronics", limit: 10) { id name price }
}
```

**Variables** — parameterized queries (avoid string concat):

```graphql
query GetUser($id: ID!) {
  user(id: $id) { name email }
}
```

```json
{ "id": "42" }
```

Use variables for **client caching** and **security** (prepared operations).

## What is the GraphQL execution model?

```text
Query document → Parse → Validate against schema → Execute
  → Resolve root fields → Resolve nested fields recursively
```

Execution is **breadth-first by level** — parent fields before children unless `@defer` / streaming.

Each field resolver receives: `(parent, args, context, info)`.

## What are resolvers?

Functions backing each field:

```typescript
const resolvers = {
  Query: {
    user: (_parent, args, ctx) => ctx.db.users.findById(args.id),
  },
  User: {
    orders: (user, _args, ctx) => ctx.db.orders.findByUserId(user.id),
  },
};
```

| Resolver scope | Responsibility |
|----------------|----------------|
| **Root** | Entry points |
| **Type field** | Nested data, default property mapping if names match |
| **Scalar** | Custom serialization (Date, BigInt) |

Keep resolvers thin — delegate to service layer.

## What is the N+1 problem in GraphQL?

Fetching `users { orders { id } }` may call `findOrders(userId)` **per user**.

| Solution | How |
|----------|-----|
| **DataLoader** | Batch + cache requests per tick |
| **Join in root query** | Eager load when field always requested |
| **Lookahead** | Analyze selection set |

```typescript
const orderLoader = new DataLoader(async (userIds: readonly string[]) => {
  const orders = await db.orders.findByUserIds(userIds);
  return userIds.map(id => orders.filter(o => o.userId === id));
});

User: {
  orders: (user, _args, ctx) => ctx.loaders.orders.load(user.id),
}
```

**Interview must-know** for GraphQL + SQL backends.

## How do you handle errors in GraphQL?

GraphQL returns **200 OK** with partial data + errors array often:

```json
{
  "data": { "user": { "name": "Ada", "orders": null } },
  "errors": [
    { "message": "Forbidden", "path": ["user", "orders"], "extensions": { "code": "FORBIDDEN" } }
  ]
}
```

| Pattern | Use |
|---------|-----|
| **Union types** | `CreateOrderPayload = OrderSuccess \| ValidationError` |
| **extensions.code** | Client handling |
| **Don't leak stack traces** | Production |

Mutations: return **domain errors in payload** instead of only top-level errors when possible.

## What is GraphQL introspection?

Clients can query schema metadata:

```graphql
{ __schema { types { name } } }
```

| Pros | Cons |
|------|------|
| GraphiQL, codegen | Exposes API surface |

Disable introspection in **production** or restrict to internal networks.

Tools: **GraphQL Code Generator** → TypeScript types from schema.

## What are GraphQL vs REST trade-offs for interviews?

**Choose GraphQL when:**
- Mobile/web clients need flexible shapes
- Aggregating many resources
- Strong typing contract valued
- Federation across microservices (Apollo Federation)

**Choose REST when:**
- Simple CRUD, public API, HTTP caching critical
- File upload/download simplicity
- Team unfamiliar with GraphQL ops complexity

**GraphQL costs:** query complexity limits, resolver perf, caching harder, authorization per field.

## When should you not use GraphQL?

| Scenario | Better fit |
|----------|------------|
| File streaming / binary | REST + CDN |
| Simple CRUD internal API | REST or gRPC |
| Heavy caching at CDN | REST GET |
| Report export (large CSV) | REST endpoint |
| Low-latency internal service | gRPC |

GraphQL shines at **BFF (Backend for Frontend)** layer, not always at every microservice boundary.

## Related Topics

- GraphQL/GraphQL with .NET and Node.js.md
- Important Concepts/Interview Comparisons.md
- C#/WebApi Basics.md
- Microservices/Microservices Communication.md
