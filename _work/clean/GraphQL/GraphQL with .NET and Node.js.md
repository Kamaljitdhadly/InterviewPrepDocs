# GraphQL with .NET and Node.js

## Questions Covered

1. How do you implement GraphQL in ASP.NET Core?
2. What is Hot Chocolate vs GraphQL.NET?
3. How do you define types and resolvers in Hot Chocolate?
4. How do you handle authentication and authorization in GraphQL?
5. How do you integrate EF Core with GraphQL resolvers?
6. How do you implement DataLoader in Hot Chocolate?
7. How do you implement GraphQL in Node.js with Apollo Server?
8. What is GraphQL Yoga, and how does it compare to Apollo?
9. How do you use GraphQL with React (Apollo Client)?
10. How do you secure GraphQL APIs?
11. How do you test GraphQL APIs?
12. What is Apollo Federation for microservices?

## How do you implement GraphQL in ASP.NET Core?

**Hot Chocolate** is the dominant .NET GraphQL server:

```csharp
// Program.cs
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

app.MapGraphQL();
```

```csharp
public class Query
{
    public async Task<User?> GetUser(int id, [Service] IUserService users)
        => await users.GetByIdAsync(id);
}
```

Endpoint: `/graphql` — Banana Cake Pop IDE in dev.

## What is Hot Chocolate vs GraphQL.NET?

| | **Hot Chocolate** | **GraphQL.NET** |
|--|-------------------|-----------------|
| **Status** | Actively developed, ChilliCream | Mature, smaller community |
| **Features** | Projections, filtering, federation, subscriptions | Core GraphQL |
| **DX** | Attributes, source generators | Manual schema |

**Recommendation for interviews:** Hot Chocolate for new .NET GraphQL APIs.

## How do you define types and resolvers in Hot Chocolate?

**Code-first with types:**

```csharp
public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Email).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.Orders).UseProjection().UseFiltering();
    }
}
```

**Minimal API style:**

```csharp
public class Query
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Product> GetProducts(AppDbContext db) => db.Products;
}
```

`UseProjection` pushes SELECT to SQL — avoids over-fetching columns.

## How do you handle authentication and authorization in GraphQL?

```csharp
builder.Services.AddGraphQLServer()
    .AddAuthorization()
    .ModifyRequestOptions(o => o.IncludeExceptionDetails = false);

public class Query
{
    [Authorize(Roles = new[] { "Admin" })]
    public IQueryable<Order> GetAllOrders(AppDbContext db) => db.Orders;
}
```

| Challenge | Approach |
|-----------|----------|
| **Field-level auth** | `[Authorize]` on fields/types |
| **Same as REST** | JWT bearer middleware before GraphQL |
| **User context** | `IHttpContextAccessor` in resolvers |

Don't rely on "security through obscurity" — unrequested fields still need auth if in schema.

## How do you integrate EF Core with GraphQL resolvers?

**Preferred:** return `IQueryable` + projections:

```csharp
public class Query
{
    [UseProjection]
    public IQueryable<Order> Orders(AppDbContext db) => db.Orders;
}
```

**Avoid** loading full entities then mapping in every resolver — let HC + EF translate.

For mutations:

```csharp
public class Mutation
{
    public async Task<Order> CreateOrder(CreateOrderInput input, AppDbContext db)
    {
        var order = new Order { /* map input */ };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return order;
    }
}
```

Use transactions for multi-entity mutations.

## How do you implement DataLoader in Hot Chocolate?

```csharp
builder.Services
    .AddGraphQLServer()
    .AddDataLoader<UserByIdDataLoader>();

public class UserByIdDataLoader : BatchDataLoader<int, User>
{
    private readonly AppDbContext _db;
    public UserByIdDataLoader(AppDbContext db, IBatchScheduler scheduler)
        : base(scheduler) => _db = db;

    protected override async Task<IReadOnlyDictionary<int, User>> LoadBatchAsync(
        IReadOnlyList<int> keys, CancellationToken ct)
    {
        var users = await _db.Users.Where(u => keys.Contains(u.Id)).ToListAsync(ct);
        return users.ToDictionary(u => u.Id);
    }
}
```

Register per-request scope — batches within single GraphQL operation.

## How do you implement GraphQL in Node.js with Apollo Server?

```typescript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type Query {
    user(id: ID!): User
  }
  type User { id: ID! name: String! email: String! }
`;

const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }, ctx: Context) =>
      ctx.db.users.findById(id),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => ({ db, user: verifyJwt(req.headers.authorization) }),
});
```

With **Express:** `@apollo/server` + `@as-integrations/express5`.

## What is GraphQL Yoga, and how does it compare to Apollo?

| | **Apollo Server** | **GraphQL Yoga** |
|--|-------------------|------------------|
| **Ecosystem** | Apollo Federation, Studio | Lightweight, standards-focused |
| **Subscriptions** | Via separate setup | Built-in |
| **Use** | Enterprise GraphQL platform | Fast setup, edge/serverless |

Both work with **Pothos**, **TypeGraphQL**, **Nexus** for code-first schemas.

## How do you use GraphQL with React (Apollo Client)?

```tsx
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) { name orders { id total } }
  }
`;

function UserProfile({ id }: { id: string }) {
  const { data, loading, error } = useQuery(GET_USER, { variables: { id } });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  return <div>{data.user.name}</div>;
}

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});
```

Alternatives: **TanStack Query** + `graphql-request`, **urql**.

## How do you secure GraphQL APIs?

| Threat | Mitigation |
|--------|------------|
| **Deep nested queries** | `MaxDepth`, `MaxComplexity` |
| **Batch abuse** | Rate limiting (Redis) |
| **Introspection leak** | Disable in prod |
| **Auth bypass** | Field-level `[Authorize]` |
| **DoS** | Query cost analysis, timeouts |
| **Injection** | Parameterized DB queries in resolvers |

```csharp
.AddMaxExecutionDepth(10)
.AddMaxOperationComplexity(1000)
```

Never expose raw SQL construction from client arguments.

## How do you test GraphQL APIs?

**Integration test** — send HTTP POST to `/graphql`:

```csharp
var response = await _client.PostAsJsonAsync("/graphql", new
{
    query = "{ user(id: 1) { name email } }"
});
var json = await response.Content.ReadFromJsonAsync<JsonElement>();
Assert.Equal("Ada", json.GetProperty("data").GetProperty("user").GetProperty("name").GetString());
```

**Node:** `apollo-server/testing` or supertest against Yoga.

Use **snapshots** for schema changes; test auth denied paths.

## What is Apollo Federation for microservices?

Each service owns part of schema; **gateway** composes supergraph:

```graphql
# Users service
type User @key(fields: "id") {
  id: ID!
  name: String!
}

# Orders service
extend type User @key(fields: "id") {
  id: ID! @external
  orders: [Order!]!
}
```

Hot Chocolate supports **Fusion / federation** patterns — know concept for microservices interviews.

**Alternative:** REST BFF aggregating services — simpler ops than federation.

## Related Topics

- GraphQL/GraphQL Basics.md
- React/React HTTP and Data Fetching.md
- C#/WebApi Basics.md
- Microservices/Microservices Communication.md
