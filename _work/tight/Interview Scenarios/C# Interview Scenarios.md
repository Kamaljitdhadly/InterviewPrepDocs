# C# Interview Scenarios

## Questions Covered

1. How do you log out a user when authentication uses stateless JWT?
2. A `DbContext` is registered as Scoped but injected into a Singleton — what breaks and how do you fix it?
3. Production hangs under load — someone used `.Result` on `Task` in ASP.NET Core. Explain and fix.
4. Two threads double-check a lazy singleton without `volatile` — can it return a half-initialized object?
5. An event handler on a long-lived object prevents GC of a form/screen — how do you diagnose and fix?
6. `async void` in a WinForms/WPF button click crashes the app intermittently — why?
7. `HttpClient` works in dev but DNS changes fail in production until restart — why?
8. `ConfigureAwait(false)` in a library — when does it matter and when does it not?
9. A `CancellationToken` is ignored deep in the call stack — what user-visible bug appears?
10. `string.Intern` seemed like a good cache — memory grows until OOM. What happened?
11. `IEnumerable` returned from a repository is enumerated twice — data is wrong in production. Why?
12. A static `ConcurrentDictionary` cache never evicts entries — what production incident follows?

## How do you log out a user when authentication uses stateless JWT?

**Scenario:** SPA stores JWT in memory/localStorage. User clicks Logout. You cannot "invalidate" the JWT on the client alone — it is valid until `exp`.

**What 90% miss:** Logout is a **server-side concern** for stateless JWT. Client delete ≠ security.

| Approach | How it works | Trade-off |
|----------|--------------|-----------|
| **Short-lived access token + refresh token** | Logout revokes **refresh token** in DB/Redis denylist | Industry standard |
| **Token blocklist (jti)** | Store `jti` until `exp` in Redis | Memory scales with logouts |
| **Session version claim** | User has `token_version` in DB; bump on logout; API rejects old version | One DB read per request or cached |
| **Rotate signing keys** | Nuclear option — invalidates everyone | Not per-user logout |

```csharp
// Refresh token store — logout removes it
public async Task LogoutAsync(string userId, string refreshToken)
{
    await _refreshStore.RevokeAsync(userId, refreshToken);
    // Optional: blocklist current access token jti until exp
    await _blocklist.AddAsync(jti, expiresAt);
}
```

**Interview answer:** "Client discards tokens for UX; server revokes refresh token and optionally blocklists `jti`. Access token may live until expiry unless we use very short TTL (5–15 min)."

## A DbContext is registered as Scoped but injected into a Singleton — what breaks and how do you fix it?

**Scenario:** Developer injects `AppDbContext` into `EmailBackgroundService` registered as `IHostedService` singleton.

**Symptoms:** `ObjectDisposedException`, stale data, thread-safety exceptions, or silent cross-request data bleed in tests.

**Why:** `DbContext` is **not thread-safe** and scoped to a request/unit of work.

**Fixes:**

```csharp
// Correct — create scope per operation
public class EmailBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await ProcessPendingEmailsAsync(db, stoppingToken);
        }
    }
}
```

| Wrong | Right |
|-------|-------|
| Singleton holds `DbContext` | `IServiceScopeFactory` + `using scope` |
| Singleton holds scoped service | `IDbContextFactory<T>` for manual lifetime |

## Production hangs under load — someone used `.Result` on Task in ASP.NET Core. Explain and fix.

**Scenario:** Library calls `GetDataAsync().Result` inside a request. Under concurrency, threads block waiting for thread pool threads → **thread pool starvation** → app stops responding.

```csharp
// DEADLOCK / starvation pattern
var data = _client.GetAsync(url).Result;  // blocks thread pool thread

// Fix
var data = await _client.GetAsync(url).ConfigureAwait(false);
```

**Diagnosis:** Thread pool queue length grows, `dotnet-counters` shows high `# of blocked threads`, Kestrel accepts connections but handlers never run.

**Rule:** No `.Result`, `.Wait()`, `.GetAwaiter().GetResult()` on async I/O in ASP.NET Core request path — ever.

## Two threads double-check a lazy singleton without volatile — can it return a half-initialized object?

**Scenario:**

```csharp
private static Singleton? _instance;
private static readonly object _lock = new();

public static Singleton Instance
{
    get
    {
        if (_instance == null)
        {
            lock (_lock)
            {
                if (_instance == null)
                    _instance = new Singleton();  // reordering risk without volatile
            }
        }
        return _instance;
    }
}
```

Without `volatile` on `_instance` (or `Lazy<T>`), CPU/memory reordering can expose **partially constructed** object to another thread (rare, architecture-dependent — but real on interview).

**Correct:** `private static readonly Lazy<Singleton> _instance = new(() => new Singleton());` or `volatile` + DCL pattern.

## An event handler on a long-lived object prevents GC of a form/screen — how do you diagnose and fix?

**Scenario:** `MessageBus.Subscribe(this, OnMessage)` in UI code; bus is static singleton. Form closes but stays in memory.

**Fix:** Unsubscribe in `Dispose`/`FormClosed`, or use **weak event** pattern, or `IOptions` change tokens instead of events.

```csharp
// Leak
StaticEventHub.OrderPlaced += OnOrderPlaced;

// Fix
StaticEventHub.OrderPlaced -= OnOrderPlaced;  // in Dispose
```

**Diagnose:** dotMemory / Visual Studio heap — object retained by delegate target chain.

## async void in a WinForms/WPF button click crashes the app intermittently — why?

**Scenario:**

```csharp
private async void Button_Click(object sender, EventArgs e)
{
    await _api.PlaceOrderAsync();  // exception here is unobserved → crashes process
}
```

`async void` exceptions propagate to `SynchronizationContext` — unhandled on UI thread.

**Fix:** `async Task` handler if possible, or try/catch inside `async void` and log. Prefer `AsyncRelayCommand` in MVVM.

## HttpClient works in dev but DNS changes fail in production until restart — why?

**Scenario:** `new HttpClient()` per request was "fixed" by single static `HttpClient` — but DNS of downstream service changed (blue/green deploy, new IP).

**Cause:** `HttpClient` with `SocketsHttpHandler` **caches DNS** for connection lifetime (default can be long).

**Fix (.NET 5+):**

```csharp
var handler = new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(2)  // refresh DNS periodically
};
services.AddHttpClient<MyApiClient>()
    .ConfigurePrimaryHttpMessageHandler(() => handler);
```

Use **`IHttpClientFactory`** — don't roll your own static `HttpClient`.

## ConfigureAwait(false) in a library — when does it matter and when does it not?

**Scenario:** NuGet library author uses `ConfigureAwait(false)` everywhere; app developer wonders if they need it in ASP.NET Core controllers.

| Location | Need ConfigureAwait(false)? |
|----------|----------------------------|
| **Library code** | Yes — don't capture caller context |
| **ASP.NET Core app code** | No — no `SynchronizationContext` like old UI |
| **UI (WPF/WinForms)** | App code usually wants context — don't use false in UI event handlers |

Misuse in UI library → callbacks run on wrong thread, controls cross-thread exception.

## A CancellationToken is ignored deep in the call stack — what user-visible bug appears?

**Scenario:** Client disconnects; Kestrel cancels token; repository ignores it and runs 30s report query anyway.

**Effects:** Wasted DB CPU, connection pool exhaustion, slow site for everyone.

```csharp
public async Task<List<Order>> GetOrdersAsync(CancellationToken ct = default)
{
    return await _db.Orders.ToListAsync(ct);  // pass ct through EVERY async call
}
```

**Interview point:** Cancellation is cooperative — must flow from controller → service → EF → HTTP client.

## string.Intern seemed like a good cache — memory grows until OOM. What happened?

**Scenario:** Intern every incoming SKU string from millions of products — intern pool **never releases** strings (lifetime = app domain).

**Lesson:** `string.Intern` only for **small, finite** repeated set. For general dedup use your own bounded cache with eviction.

## IEnumerable returned from a repository is enumerated twice — data is wrong in production. Why?

**Scenario:**

```csharp
public IEnumerable<Order> GetOpenOrders() => _db.Orders.Where(o => o.Status == Open);
// Caller:
var q = repo.GetOpenOrders();
var count = q.Count();      // executes query
var first = q.First();      // NEW query — data may have changed between
```

**Fix:** Return `IQueryable` with clear contract, or materialize `ToListAsync()` once, or use **single enumeration** pattern.

Deferred execution surprises cause **duplicate charges**, **wrong pagination**, **modified collection during enum** bugs.

## A static ConcurrentDictionary cache never evicts entries — what production incident follows?

**Scenario:** Cache key = `userId:productId` for every catalog browse — millions of unique keys → **LOH/gen2 pressure** → full GC pauses → SLA breach.

**Fix:** Bounded cache (size + TTL), Redis with `maxmemory-policy`, or don't cache unbounded cardinality keys.

## Related Topics

- C#/.NET Core JSON Web Token.md
- C#/.NET Core Basics.md
- C# C# ADO.NET and Entity Framework.md
- Interview Scenarios/.NET Interview Scenarios.md
