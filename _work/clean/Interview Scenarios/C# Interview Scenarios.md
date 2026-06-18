# C# Interview Scenarios

**What this is:** C# language and runtime traps that surface **under load or in long-running apps** — not syntax trivia. Interviewers describe a production symptom (hangs, memory leak, wrong data) and expect you to connect it to **threading, lifetime, async, or deferred execution**.

**Why these matter:** Code that passes unit tests and works in dev often fails at scale because of `DbContext` lifetime, thread pool starvation, or `IEnumerable` double enumeration.

**How to study:** For each scenario, name **symptom → root cause → fix → how you'd detect it in prod** (logs, counters, profilers).

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

**Context:** SPA stores JWT in memory or localStorage. User clicks Logout. The token is still cryptographically valid until `exp` — anyone with a copy (or XSS theft) can call APIs until then.

**What trips people up:** "Delete the token on the client" as the complete security answer.

| Approach | How it works | Trade-off |
|----------|--------------|-----------|
| **Short-lived access + refresh token** | Logout revokes refresh token in DB/Redis | Industry standard; brief access token window remains |
| **Token blocklist (`jti`)** | Store revoked `jti` in Redis until `exp` | Memory scales with logout volume |
| **Session version claim** | Bump `token_version` in DB on logout; API rejects old version | Requires claim check or cache |
| **Rotate signing keys** | Invalidates all tokens | Nuclear — not per-user logout |

```csharp
public async Task LogoutAsync(string userId, string refreshToken)
{
    await _refreshStore.RevokeAsync(userId, refreshToken);
    await _blocklist.AddAsync(jti, expiresAt);  // optional: block current access token
}
```

**Strong close:** "Client discard is UX; server revokes refresh and optionally blocklists `jti`. Keep access TTL short (5–15 min)."

## A DbContext is registered as Scoped but injected into a Singleton — what breaks?

**Context:** Developer injects `AppDbContext` into `EmailBackgroundService` (`IHostedService` singleton). App runs fine in tests; production shows random failures.

**Symptoms:** `ObjectDisposedException`, stale data, thread-safety exceptions, or cross-request data bleed.

**Why:** `DbContext` is **not thread-safe** and scoped to one unit of work (typically one HTTP request).

**Fix — create scope per operation:**

```csharp
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
| Singleton holds any scoped service | `IDbContextFactory<T>` for manual lifetime |

**Strong close:** "Scoped services in singletons need an explicit scope per operation — never capture `DbContext` in a long-lived object."

## Production hangs under load — `.Result` on Task in ASP.NET Core?

**Context:** Library or legacy code calls `GetDataAsync().Result` inside a request handler. Low traffic works; under concurrency the app **stops responding**.

**Mechanism:** ASP.NET Core uses thread pool threads for requests. `.Result` **blocks** a thread waiting for async I/O that needs another thread pool thread → **thread pool starvation** → deadlock-like hang.

```csharp
// DEADLOCK / starvation pattern
var data = _client.GetAsync(url).Result;

// Fix
var data = await _client.GetAsync(url).ConfigureAwait(false);
```

**Diagnosis:** Growing thread pool queue, `dotnet-counters` shows blocked threads, Kestrel accepts connections but handlers never complete.

**Strong close:** "No `.Result`, `.Wait()`, or `.GetAwaiter().GetResult()` on async I/O in the ASP.NET request path."

## Two threads double-check a lazy singleton without volatile?

**Context:** Classic double-checked locking without `volatile` or `Lazy<T>`:

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
                    _instance = new Singleton();
            }
        }
        return _instance;
    }
}
```

**What trips people up:** "Lock makes it safe" — without `volatile`, CPU/memory reordering can expose a **partially constructed** object to another thread (ECMA memory model issue; rare but valid interview depth).

**Correct:** `private static readonly Lazy<Singleton> _instance = new(() => new Singleton());`

**Strong close:** "Use `Lazy<T>` or `volatile` + DCL — don't hand-roll unless you know the memory model."

## Event handler on long-lived object prevents GC?

**Context:** UI form subscribes to static event bus; form closes but object stays in memory — users report memory growth after opening/closing screens.

```csharp
// Leak — bus holds reference to form via delegate
StaticEventHub.OrderPlaced += OnOrderPlaced;

// Fix — unsubscribe in Dispose / FormClosed
StaticEventHub.OrderPlaced -= OnOrderPlaced;
```

**Diagnose:** dotMemory / Visual Studio heap snapshot — object retained by delegate target chain from static event source.

**Strong close:** "Long-lived publishers + short-lived subscribers require unsubscribe or weak events."

## async void in WinForms/WPF button click — intermittent crash?

**Context:**

```csharp
private async void Button_Click(object sender, EventArgs e)
{
    await _api.PlaceOrderAsync();  // exception → unobserved → can crash process
}
```

**Why:** `async void` exceptions propagate to `SynchronizationContext` — not to caller; unhandled on UI thread can terminate the app.

**Fix:** Use `async Task` handler where possible; always try/catch inside `async void`; prefer `AsyncRelayCommand` in MVVM.

**Strong close:** "`async void` only for event handlers — catch inside; never for business logic you call directly."

## HttpClient DNS fails in production until restart?

**Context:** Team "fixed" `new HttpClient()` per request by using one static `HttpClient`. After blue/green deploy, downstream DNS points to new IPs — app still connects to **old IP** until restart.

**Cause:** `SocketsHttpHandler` **pools connections** and caches DNS for connection lifetime (can be very long).

```csharp
var handler = new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(2)
};
services.AddHttpClient<MyApiClient>()
    .ConfigurePrimaryHttpMessageHandler(() => handler);
```

**Strong close:** "Use `IHttpClientFactory` with bounded `PooledConnectionLifetime` — not static `HttpClient` or per-request disposal."

## ConfigureAwait(false) — when does it matter?

**Context:** Library author uses `ConfigureAwait(false)` everywhere; app developer wonders if controllers need it too.

| Location | Need `ConfigureAwait(false)`? |
|----------|-------------------------------|
| **Library / NuGet code** | Yes — don't capture caller's `SynchronizationContext` |
| **ASP.NET Core app code** | No — no request `SynchronizationContext` like classic ASP.NET |
| **WPF / WinForms app code** | Usually no in UI handlers — need UI thread for controls |

**Misuse:** `ConfigureAwait(false)` in UI library then touch controls → cross-thread exception.

**Strong close:** "Libraries: false. ASP.NET Core apps: unnecessary. UI apps: usually keep context in UI code."

## CancellationToken ignored deep in call stack?

**Context:** Client disconnects or times out; Kestrel cancels the request token. Repository ignores it and runs a 30-second report query anyway.

**Effects:** Wasted DB CPU, connection pool exhaustion, slow site for **other** users.

```csharp
public async Task<List<Order>> GetOrdersAsync(CancellationToken ct = default)
{
    return await _db.Orders.ToListAsync(ct);  // pass ct through EVERY async layer
}
```

**Strong close:** "Cancellation is cooperative — thread from controller to EF to `HttpClient`."

## string.Intern — memory grows until OOM?

**Context:** Developer interns every incoming SKU string to "save memory" on millions of unique products.

**What happened:** Intern pool **never releases** strings (lifetime = app domain). Unique SKUs → unbounded intern table → OOM.

**Lesson:** `string.Intern` only for **small, finite, repeated** sets. For general dedup use a **bounded cache with eviction**.

**Strong close:** "Intern is not a general-purpose string cache — it's permanent."

## IEnumerable enumerated twice — wrong data in production?

**Context:**

```csharp
public IEnumerable<Order> GetOpenOrders() =>
    _db.Orders.Where(o => o.Status == Open);

var q = repo.GetOpenOrders();
var count = q.Count();     // query 1
var first = q.First();     // query 2 — data may have changed
```

**Bugs this causes:** Wrong pagination, duplicate side effects, inconsistent counts in reports.

**Fix:** Materialize once (`ToListAsync()`), or return `IQueryable` with explicit contract, or single-enumeration API.

**Strong close:** "Deferred execution means a new query per enumeration — materialize when you need a stable snapshot."

## Static ConcurrentDictionary cache never evicts?

**Context:** Cache key = `userId:productId` for every catalog browse — cardinality explodes with traffic.

**Incident:** Gen2 / LOH pressure → full GC pauses → SLA breach; looks like "random" latency spikes.

**Fix:** Bounded cache (size + TTL), Redis with `maxmemory-policy`, or don't cache unbounded-cardinality keys.

**Strong close:** "Every cache needs an eviction story — unbounded in-process caches die from cardinality."

## Related Topics

- C#/.NET Core JSON Web Token.md
- C#/.NET Core Basics.md
- C# C# ADO.NET and Entity Framework.md
- Interview Scenarios/.NET Interview Scenarios.md
