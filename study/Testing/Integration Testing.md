# Integration Testing

## Questions Covered

1. What is integration testing, and how does it differ from unit testing?
2. What should you integrate-test vs unit-test in ASP.NET Core?
3. How does WebApplicationFactory work for API integration tests?
4. How do you override services and configuration in integration tests?
5. How do you test authenticated APIs in integration tests?
6. What is Testcontainers, and when should you use it?
7. How do you run integration tests against SQL Server or PostgreSQL with Testcontainers?
8. How do you test MongoDB integration with Testcontainers?
9. How do you test message queues and external HTTP with WireMock or TestServer?
10. How do integration tests fit into CI pipelines?
11. What are common pitfalls with integration tests?
12. How do you test React apps at the integration layer?

## What is integration testing, and how does it differ from unit testing?

**Integration tests** verify that **multiple components work together** — real or realistic dependencies (database, HTTP pipeline, message bus).

| Aspect | Unit | Integration |
|--------|------|-------------|
| **Scope** | One class/function | Several modules + I/O |
| **Dependencies** | Mocked | Real DB, TestServer, containers |
| **Speed** | Milliseconds | Seconds |
| **Confidence** | Logic correct | Wiring and contracts correct |

```text
Unit:        Controller logic with mocked IService
Integration: HTTP → Middleware → Controller → EF → SQL Server (container)
```

## What should you integrate-test vs unit-test in ASP.NET Core?

| Integration-test | Unit-test |
|------------------|-----------|
| Full HTTP request/response pipeline | Business rules, validators |
| EF Core queries against real DB | Mapping, DTO transforms |
| Auth middleware + `[Authorize]` | Permission helper logic |
| Serialization (JSON options) | Edge cases in pure functions |

**Rule:** If failure means "components don't connect," integration test it.

## How does WebApplicationFactory work for API integration tests?

`WebApplicationFactory<TProgram>` bootstraps the **real app** in memory with `TestServer` — no separate process or port by default.

```csharp
public class ProductsApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ProductsApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/products");
        response.EnsureSuccessStatusCode();
        var products = await response.Content.ReadFromJsonAsync<List<ProductDto>>();
        Assert.NotNull(products);
    }
}
```

Project reference: test project → API project; `Program` must be accessible (`public partial class Program { }` in .NET 6+).

## How do you override services and configuration in integration tests?

```csharp
public class CustomWebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            // Replace real DB with in-memory or container connection
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.AddDbContext<AppDbContext>(opts =>
                opts.UseInMemoryDatabase("TestDb"));

            // Replace external email service
            services.AddSingleton<IEmailSender, FakeEmailSender>();
        });

        builder.UseEnvironment("Testing");
    }
}
```

| Approach | When |
|----------|------|
| **In-memory DB** | Fast, limited SQL fidelity |
| **Testcontainers** | Real PostgreSQL/SQL Server semantics |
| **Fake/stub services** | External APIs you don't own |

## How do you test authenticated APIs in integration tests?

```csharp
public class AuthenticatedFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });
    }
}

// TestAuthHandler returns fixed ClaimsPrincipal with roles
_client.DefaultRequestHeaders.Authorization =
    new AuthenticationHeaderValue("Test");
```

Alternatively generate a real JWT in test setup using the same signing key as test config.

## What is Testcontainers, and when should you use it?

**Testcontainers** spins up **Docker containers** for databases, Redis, Kafka, etc. during tests — disposable, isolated, CI-friendly.

| Use Testcontainers when | Skip when |
|-------------------------|-----------|
| SQL-specific features (transactions, constraints) | In-memory is enough |
| Same image as production | Shared dev DB (anti-pattern) |
| CI has Docker available | Ultra-fast unit-only suites |

```csharp
private readonly MsSqlContainer _sql = new MsSqlBuilder().Build();

public async Task InitializeAsync()
{
    await _sql.StartAsync();
    // Point DbContext to _sql.GetConnectionString()
}

public async Task DisposeAsync() => await _sql.DisposeAsync();
```

NuGet: `Testcontainers.MsSql`, `Testcontainers.PostgreSql`, `Testcontainers.MongoDb`.

## How do you run integration tests against SQL Server or PostgreSQL with Testcontainers?

```csharp
public class PostgresApiTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    private WebApplicationFactory<Program> _factory = null!;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(b =>
            {
                b.ConfigureServices(s =>
                {
                    s.AddDbContext<AppDbContext>(o =>
                        o.UseNpgsql(_postgres.GetConnectionString()));
                });
            });
        using var scope = _factory.Services.CreateScope();
        scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.Migrate();
    }

    [Fact]
    public async Task CreateOrder_PersistsToDatabase() { /* HTTP POST + query DB */ }

    public async Task DisposeAsync()
    {
        _factory.Dispose();
        await _postgres.DisposeAsync();
    }
}
```

Run migrations or `EnsureCreated()` before tests; truncate tables between tests if needed.

## How do you test MongoDB integration with Testcontainers?

```csharp
var mongo = new MongoDbBuilder()
    .WithImage("mongo:7")
    .Build();
await mongo.StartAsync();

services.AddSingleton<IMongoClient>(_ =>
    new MongoClient(mongo.GetConnectionString()));
```

Assert document counts, indexes, and aggregation pipelines against real MongoDB behavior.

## How do you test message queues and external HTTP with WireMock or TestServer?

**External HTTP** — WireMock.NET or `HttpClient` pointed at TestServer mock:

```csharp
var mockHttp = new MockHttpMessageHandler();
mockHttp.When("https://payments.example/*")
    .Respond(HttpStatusCode.OK, "application/json", """{"status":"approved"}""");

services.AddHttpClient<IPaymentClient, PaymentClient>()
    .ConfigurePrimaryHttpMessageHandler(() => mockHttp);
```

**Message bus** — use in-memory transport (MassTransit test harness, RabbitMQ test container) and assert published/consumed messages.

## How do integration tests fit into CI pipelines?

```yaml
# Azure Pipelines excerpt
- task: DockerInstaller@0
- script: dotnet test --filter "Category=Integration" --logger trx
  env:
    DOCKER_HOST: $(DockerHost)
```

| Practice | Why |
|----------|-----|
| Tag `[Trait("Category", "Integration")]` | Split fast vs slow jobs |
| Parallelize cautiously | Container port conflicts |
| Reuse containers per class (`IAsyncLifetime`) | Faster than per test |
| Fail build on flaky retries | Fix root cause |

## What are common pitfalls with integration tests?

| Pitfall | Mitigation |
|---------|------------|
| Shared DB state | Unique DB name per run; transactions + rollback |
| Testing through UI for API bugs | Hit API directly |
| No cleanup | `IAsyncLifetime`, containers auto-dispose |
| Flaky timing | `await` properly; avoid `Thread.Sleep` |
| Testing entire system as "integration" | That's E2E — keep scope bounded |

## How do you test React apps at the integration layer?

Integration here = **multiple components + router + data layer** without full browser:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/products', (_req, res, ctx) =>
    res(ctx.json([{ id: 1, name: 'Widget' }]))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('product list page loads from API', async () => {
  render(
    <MemoryRouter initialEntries={['/products']}>
      <Routes>
        <Route path="/products" element={<ProductListPage />} />
      </Routes>
    </MemoryRouter>
  );
  expect(await screen.findByText('Widget')).toBeInTheDocument();
});
```

Use **MSW** to mock HTTP; reserve Playwright for true E2E.

## Related Topics

- Testing Unit Testing.md
- Testing E2E Testing.md
- Docker/Docker Basics.md
- PostgreSQL/PostgreSQL Basics.md
- MongoDB/MongoDB with Node.js and .NET.md
