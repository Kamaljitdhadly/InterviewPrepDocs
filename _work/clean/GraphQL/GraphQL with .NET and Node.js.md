# GraphQL with .NET and Node.js

## Questions Covered

1. How do you implement GraphQL in ASP.NET Core?
2. What is Hot Chocolate vs GraphQL.NET?
3. How do you define types and resolvers in Hot Chocolate?
4. How do you handle authentication and authorization in GraphQL?
5. How do you integrate EF Core with GraphQL and avoid N+1?
6. How do you implement DataLoader in Hot Chocolate?
7. How do you implement GraphQL in Node.js with Apollo Server?
8. How do you use GraphQL with React (Apollo Client)?
9. How do you use GraphQL with NestJS?
10. How do you secure GraphQL APIs?
11. How do you test GraphQL APIs?
12. What is Apollo Federation for microservices?

## How do you implement GraphQL in ASP.NET Core?

**Hot Chocolate** is the dominant GraphQL server for .NET — integrates with ASP.NET Core, EF Core, and authorization.

```csharp
// Program.cs
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .AddAuthorization();

var app = builder.Build();
app.MapGraphQL();                    // POST/GET /graphql
app.MapGraphQLSchema("/graphql/schema");  // optional SDL download
app.RunWithGraphQLCommands(args);    // CLI tools
```

```csharp
public class Query
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Product> GetProducts(AppDbContext db) => db.Products;

    public async Task<User?> GetUser(int id, IUserService users, CancellationToken ct)
        => await users.GetByIdAsync(id, ct);
}
```

**NuGet:** `HotChocolate.AspNetCore`, `HotChocolate.Data.EntityFramework`

**Dev experience:** Navigate to `/graphql` — **Banana Cake Pop** IDE for queries, schema explorer, and docs.

## What is Hot Chocolate vs GraphQL.NET?

| | **Hot Chocolate** | **GraphQL.NET** |
|--|-------------------|-----------------|
| **Maintenance** | Active (ChilliCream) | Slower release cadence |
| **EF Core integration** | Projections, filtering, sorting built-in | Manual |
| **Authorization** | `[Authorize]` on types/fields | Custom |
| **Subscriptions** | Built-in | Supported |
| **Federation** | Hot Chocolate Fusion | Limited |

**Interview recommendation:** Hot Chocolate for new ASP.NET Core GraphQL APIs. GraphQL.NET if maintaining legacy code.

## How do you define types and resolvers in Hot Chocolate?

**Code-first with explicit types:**

```csharp
public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Email).Type<NonNullType<StringType>>();
        descriptor.Field(u => u.Orders)
            .UseProjection()
            .UseFiltering()
            .UseSorting();
    }
}

// Register
builder.Services.AddGraphQLServer()
    .AddType<UserType>()
    .AddType<OrderType>();
```

**Convention-based (minimal boilerplate):**

```csharp
public class Query
{
    public IQueryable<Order> GetOrders(AppDbContext db) => db.Orders;

    public async Task<Order?> GetOrder(int id, AppDbContext db)
        => await db.Orders.FindAsync(id);
}
```

Hot Chocolate infers schema from .NET types when configured. Use explicit `ObjectType<T>` for custom field descriptions, deprecation, or auth.

**Mutations:**

```csharp
public class Mutation
{
    public async Task<CreateOrderPayload> CreateOrder(
        CreateOrderInput input,
        AppDbContext db,
        CancellationToken ct)
    {
        var errors = Validate(input);
        if (errors.Count > 0)
            return new CreateOrderPayload(null, errors);

        var order = MapToEntity(input);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        return new CreateOrderPayload(order, []);
    }
}
```

Return **payload types** with domain errors instead of throwing for validation failures.

## How do you handle authentication and authorization in GraphQL?

GraphQL uses the same **JWT/cookie auth** as REST — middleware runs before the GraphQL pipeline:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(/* ... */);

builder.Services.AddGraphQLServer()
    .AddAuthorization();
```

**Field-level authorization:**

```csharp
public class Query
{
    [Authorize]
    public User? GetMe(ClaimsPrincipal user, AppDbContext db)
        => db.Users.Find(GetUserId(user));

    [Authorize(Roles = new[] { "Admin" })]
    public IQueryable<Order> GetAllOrders(AppDbContext db) => db.Orders;
}

// On type
[Authorize(Roles = new[] { "Admin" })]
public class AdminQuery { /* ... */ }
```

| Challenge | Approach |
|-----------|----------|
| **Unauthorized field** | `[Authorize]` + policy-based auth |
| **User-scoped data** | Filter in resolver: `orders.Where(o => o.UserId == currentUserId)` |
| **Introspection in prod** | Disable or require admin role |
| **GraphQL != public** | Hiding a field doesn't remove it from schema — use auth + don't expose sensitive fields |

**Never rely on "security through obscurity"** — clients can introspect or guess field names.

## How do you integrate EF Core with GraphQL and avoid N+1?

**Best pattern:** Return `IQueryable<T>` with **projections** — Hot Chocolate translates selected GraphQL fields to SQL `SELECT`:

```csharp
public class Query
{
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Product> GetProducts(AppDbContext db) => db.Products;
}
```

Client query:

```graphql
query {
  products {
    id
    name
    # price NOT requested → not selected from SQL
  }
}
```

**When `IQueryable` isn't enough** (computed fields, cross-service calls):

```csharp
public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Orders)
            .ResolveWith<UserResolvers>(r => r.GetOrdersAsync(default!, default!, default!));
    }
}

public class UserResolvers
{
    public async Task<IEnumerable<Order>> GetOrdersAsync(
        [Parent] User user,
        IOrdersByUserIdDataLoader loader,
        CancellationToken ct)
        => await loader.LoadAsync(user.Id, ct);
}
```

Avoid `.Include()` on every root query — projections + DataLoader are more efficient.

## How do you implement DataLoader in Hot Chocolate?

```csharp
// Register
builder.Services
    .AddGraphQLServer()
    .AddDataLoader<UserByIdDataLoader>()
    .AddDataLoader<OrdersByUserIdDataLoader>();

// DataLoader implementation
public class OrdersByUserIdDataLoader : BatchDataLoader<int, IReadOnlyList<Order>>
{
    private readonly AppDbContext _db;

    public OrdersByUserIdDataLoader(
        AppDbContext db,
        IBatchScheduler batchScheduler,
        DataLoaderOptions? options = null)
        : base(batchScheduler, options)
        => _db = db;

    protected override async Task<IReadOnlyDictionary<int, IReadOnlyList<Order>>> LoadBatchAsync(
        IReadOnlyList<int> userIds,
        CancellationToken cancellationToken)
    {
        var orders = await _db.Orders
            .Where(o => userIds.Contains(o.UserId))
            .ToListAsync(cancellationToken);

        return userIds.ToDictionary(
            id => id,
            id => (IReadOnlyList<Order>)orders.Where(o => o.UserId == id).ToList());
    }
}
```

DataLoader scope is **per GraphQL request** — cache doesn't leak across users/requests.

## How do you implement GraphQL in Node.js with Apollo Server?

**Apollo Server 4** with standalone or Express:

```typescript
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  type Query {
    user(id: ID!): User
    products(limit: Int = 20): [Product!]!
  }
  type Mutation {
    createOrder(input: CreateOrderInput!): CreateOrderPayload!
  }
  type User { id: ID! name: String! email: String! orders: [Order!]! }
  type Product { id: ID! name: String! price: Float! }
  type Order { id: ID! total: Float! status: String! }
  input CreateOrderInput { customerId: ID! productIds: [ID!]! }
  type CreateOrderPayload { order: Order errors: [UserError!]! }
  type UserError { field: String message: String! }
`;

const resolvers = {
  Query: {
    user: (_: unknown, { id }: { id: string }, ctx: Context) =>
      ctx.repositories.users.findById(id),
    products: (_: unknown, { limit }: { limit: number }, ctx: Context) =>
      ctx.repositories.products.list(limit),
  },
  User: {
    orders: (user: User, _: unknown, ctx: Context) =>
      ctx.loaders.ordersByUserId.load(user.id),
  },
  Mutation: {
    createOrder: async (_: unknown, { input }: { input: CreateOrderInput }, ctx: Context) =>
      ctx.orderService.create(input),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => ({
    user: verifyJwt(req.headers.authorization),
    repositories: buildRepositories(),
    loaders: buildLoaders(),
  }),
});

console.log(`GraphQL ready at ${url}`);
```

**Express integration:** `@apollo/server` + `@as-integrations/express4` or `@as-integrations/express5`.

## How do you use GraphQL with React (Apollo Client)?

**Apollo Client** — cache, queries, mutations, subscriptions:

```tsx
import { ApolloClient, InMemoryCache, gql, useQuery, useMutation } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
      orders { id total status }
    }
  }
`;

function UserProfile({ id }: { id: string }) {
  const { data, loading, error } = useQuery(GET_USER, { variables: { id } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>{data.user.name}</h1>
      <ul>
        {data.user.orders.map((o: Order) => (
          <li key={o.id}>{o.total} — {o.status}</li>
        ))}
      </ul>
    </div>
  );
}

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  credentials: 'include',
});
```

**Mutation with cache update:**

```tsx
const [createOrder] = useMutation(CREATE_ORDER, {
  refetchQueries: [{ query: GET_USER, variables: { id: userId } }],
  // or update(cache) { ... } for optimistic UI
});
```

**Alternatives:** TanStack Query + `graphql-request`, urql (lighter), Relay (Facebook-scale).

## How do you use GraphQL with NestJS?

**Code-first with `@nestjs/graphql` + Apollo driver:**

```typescript
// product.model.ts
@ObjectType()
export class Product {
  @Field(() => ID) id: string;
  @Field() name: string;
  @Field() price: number;
}

// products.resolver.ts
@Resolver(() => Product)
export class ProductsResolver {
  constructor(private productsService: ProductsService) {}

  @Query(() => [Product])
  products(@Args('limit', { defaultValue: 20 }) limit: number) {
    return this.productsService.findAll(limit);
  }

  @Query(() => Product, { nullable: true })
  product(@Args('id', { type: () => ID }) id: string) {
    return this.productsService.findById(id);
  }

  @Mutation(() => CreateOrderPayload)
  @UseGuards(GqlAuthGuard)
  createOrder(@Args('input') input: CreateOrderInput, @CurrentUser() user: User) {
    return this.ordersService.create(input, user);
  }
}

// app.module.ts
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  playground: process.env.NODE_ENV !== 'production',
}),
```

**Guards:** Use `GqlExecutionContext` to access request inside GraphQL guards (different from REST `@Req()`).

## How do you secure GraphQL APIs?

| Threat | Mitigation |
|--------|------------|
| **Deep nested queries** | Max depth limit (e.g. 10) |
| **Expensive queries** | Max complexity / cost analysis |
| **Batch attacks** | Rate limiting (Redis, APIM) |
| **Introspection leak** | Disable in production |
| **Auth bypass** | Field-level auth + scope checks |
| **Injection** | Parameterized DB queries — never concat args into SQL |
| **DoS via large queries** | Query timeout, pagination limits |

**Hot Chocolate:**

```csharp
builder.Services.AddGraphQLServer()
    .AddMaxExecutionDepth(10)
    .AddMaxOperationComplexity(1000)
    .ModifyRequestOptions(o => o.IncludeExceptionDetails = false);
```

**Pagination — always cap list sizes:**

```graphql
products(limit: Int = 20): [Product!]!   # enforce max 100 in resolver
```

Require authentication for mutations and sensitive queries. Log query complexity in APM (Application Insights).

## How do you test GraphQL APIs?

**Integration test — HTTP POST to `/graphql` (.NET):**

```csharp
public class GraphQLTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GraphQLTests(WebApplicationFactory<Program> factory)
        => _client = factory.CreateClient();

    [Fact]
    public async Task GetUser_ReturnsName()
    {
        var request = new
        {
            query = """
                query($id: ID!) {
                  user(id: $id) { name email }
                }
                """,
            variables = new { id = "1" }
        };

        var response = await _client.PostAsJsonAsync("/graphql", request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var name = json.GetProperty("data").GetProperty("user").GetProperty("name").GetString();
        Assert.Equal("Ada", name);
    }
}
```

**Node — supertest or Apollo executeOperation:**

```typescript
const response = await server.executeOperation({
  query: `query { product(id: "1") { name price } }`,
});
expect(response.body.singleResult.data?.product.name).toBe('Widget');
```

Test **auth denied**, **validation errors in payload**, and **N+1** (assert SQL query count in integration tests with EF logging).

## What is Apollo Federation for microservices?

**Apollo Federation** (and **Hot Chocolate Fusion**) compose multiple **subgraphs** into one **supergraph**:

```graphql
# Users subgraph
type User @key(fields: "id") {
  id: ID!
  name: String!
}

# Orders subgraph
extend type User @key(fields: "id") {
  id: ID! @external
  orders: [Order!]!
}

type Order @key(fields: "id") {
  id: ID!
  total: Float!
}
```

```text
Client → GraphQL Gateway (Router)
           ├── Users subgraph
           ├── Orders subgraph
           └── Products subgraph
```

Gateway **plans** query across services — fetches `User` from one service, `orders` from another using `@key` references.

| Federation | BFF pattern |
|------------|-------------|
| Each team owns subgraph schema | One BFF calls REST services |
| Stronger schema composition | Simpler ops, fewer moving parts |
| Needs platform maturity | Good starting point |

**Interview:** Know federation concept; many teams start with **single GraphQL BFF** aggregating REST before full federation.

## Related Topics

- GraphQL/GraphQL Basics.md
- React/React HTTP and Data Fetching.md
- C#/WebApi Basics.md
- C#/.NET Core JSON Web Token.md
- Microservices/Microservices Communication.md
- Important Concepts/Interview Comparisons.md
