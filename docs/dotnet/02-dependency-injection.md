# Dependency Injection & Service Lifetimes

## Concept Explanation

**Dependency Injection (DI)** is a design pattern where a class receives its dependencies from the outside (usually via the constructor) instead of creating them itself. This promotes **loose coupling**, **testability** (inject mocks), and **single responsibility**. ASP.NET Core has a built-in **IoC container** (the service provider).

You **register** services in the container with a **lifetime**:

| Lifetime | One instance per... | Use for |
|---|---|---|
| **Transient** | every request for the service | lightweight, stateless services |
| **Scoped** | HTTP request (scope) | per-request state, `DbContext` |
| **Singleton** | entire application | caches, config, stateless shared services |

## Code Example(s)

```csharp
// Registration
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddSingleton<IClock, SystemClock>();
builder.Services.AddDbContext<AppDbContext>(); // scoped by default
```

```csharp
// Constructor injection — the container supplies the dependencies
public class OrderService
{
    private readonly IOrderRepository _repo;
    private readonly IEmailSender _email;

    public OrderService(IOrderRepository repo, IEmailSender email) // injected
    {
        _repo = repo;
        _email = email;
    }

    public void Place(Order o)
    {
        _repo.Add(o);
        _email.Send("Order placed");
    }
}
```

## Interview Q&A

**🟢 What is dependency injection and why use it?**
It's supplying a class's dependencies from outside rather than constructing them internally. Benefits: loose coupling, easier testing (swap in mocks), and adherence to SOLID.

**🟢 What are the three service lifetimes?**
Transient (new instance every time it's requested), Scoped (one per HTTP request), Singleton (one for the whole app lifetime).

**🟡 Which lifetime should a `DbContext` use and why?**
Scoped. A `DbContext` is not thread-safe and holds per-request change tracking, so it should live exactly one HTTP request. `AddDbContext` registers it as scoped by default.

**🟡 What's the difference between constructor injection and other forms?**
Constructor injection (preferred) makes dependencies explicit and required. Method injection passes a dependency to a specific method; property injection sets it via a settable property (used rarely, for optional dependencies).

**🔴 What is a captive dependency?**
When a longer-lived service captures a shorter-lived one — e.g. a Singleton depends on a Scoped service. The scoped service then effectively becomes a singleton, sharing state across requests and possibly causing bugs/threading issues. The container throws by default in development for singleton→scoped.

## ⚠️ Tricky / Gotchas

- **Injecting Scoped into Singleton = captive dependency.** A singleton resolves the scoped service once and holds it forever. To use scoped services from a singleton, inject `IServiceScopeFactory` and create a scope per use.

```csharp
public class Worker
{
    private readonly IServiceScopeFactory _scopeFactory;
    public Worker(IServiceScopeFactory f) => _scopeFactory = f;
    public void Do()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>(); // fresh scoped
    }
}
```

- **Transient services held by a singleton are also captive** — same trap.
- **Disposing**: the container disposes the services it creates at the end of their scope. Don't dispose injected services yourself.
- **Multiple registrations**: the *last* registration wins when resolving a single instance, but injecting `IEnumerable<IService>` gives you all of them.
- **Singletons must be thread-safe** — they're shared across concurrent requests.

## 📌 Quick Recap

- DI = dependencies supplied from outside → loose coupling + testability.
- Transient = per resolve; Scoped = per request; Singleton = per app.
- `DbContext` is Scoped (not thread-safe, per-request tracking).
- Captive dependency: longer lifetime capturing shorter (Singleton→Scoped) — use `IServiceScopeFactory`.
- Prefer constructor injection; singletons must be thread-safe.
