# Configuration & the Options Pattern

## Concept Explanation

ASP.NET Core reads configuration from multiple **providers** layered in order, with later sources overriding earlier ones: `appsettings.json` → `appsettings.{Environment}.json` → **user secrets** (dev) → **environment variables** → **command-line args**. This lets you keep defaults in JSON and override per environment without code changes.

The **Options pattern** binds a configuration section to a strongly-typed POCO and injects it via `IOptions<T>`. This gives type safety and decouples classes from raw configuration keys.

## Code Example(s)

```json
// appsettings.json
{
  "EmailSettings": {
    "SmtpHost": "smtp.example.com",
    "Port": 587
  }
}
```

```csharp
// Strongly-typed options class
public class EmailSettings
{
    public string SmtpHost { get; set; } = "";
    public int Port { get; set; }
}

// Bind the section
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

// Inject and use
public class EmailSender
{
    private readonly EmailSettings _settings;
    public EmailSender(IOptions<EmailSettings> options) => _settings = options.Value;
}
```

```csharp
// Quick reads (no options class)
string host = builder.Configuration["EmailSettings:SmtpHost"]; // colon = nesting
int port = builder.Configuration.GetValue<int>("EmailSettings:Port");
string conn = builder.Configuration.GetConnectionString("Default");
```

## Interview Q&A

**🟢 How does configuration work in ASP.NET Core?**
Configuration is built from layered providers (JSON files, env vars, user secrets, command line). Later providers override earlier ones, allowing per-environment overrides.

**🟡 What is the Options pattern?**
A way to bind a configuration section to a typed class and inject it via `IOptions<T>`, giving type safety and separation from raw keys.

**🟡 Difference between `IOptions<T>`, `IOptionsSnapshot<T>`, and `IOptionsMonitor<T>`?**
`IOptions<T>` is a singleton, computed once (no reload). `IOptionsSnapshot<T>` is scoped and recomputed per request (picks up changes, good for web). `IOptionsMonitor<T>` is a singleton that supports change notifications and live reload, usable in singletons/background services.

**🟡 Where should secrets (connection strings, API keys) go?**
Never in source-controlled `appsettings.json`. Use **User Secrets** in development and **environment variables** / a secret store (Azure Key Vault, etc.) in production.

**🔴 How does environment-specific configuration get applied?**
The `ASPNETCORE_ENVIRONMENT` variable (Development/Staging/Production) selects `appsettings.{Environment}.json`, which is layered on top of the base `appsettings.json`.

## ⚠️ Tricky / Gotchas

- **Override order matters.** An environment variable named `EmailSettings__Port` (double underscore) overrides the JSON value. Forgetting this leads to "why is my config not what's in the file?" confusion.
- **`IOptions<T>` doesn't reload.** If you need updated values after a file change, use `IOptionsSnapshot` (scoped) or `IOptionsMonitor`.
- **Colon vs double-underscore:** JSON/keys use `:` for nesting; environment variables use `__` because `:` isn't valid in env var names on all platforms.
- **Binding requires public settable properties** (or matching constructor). Read-only properties won't bind.
- **Don't inject `IConfiguration` everywhere** — prefer typed options for testability and clarity.

## 📌 Quick Recap

- Config = layered providers; later overrides earlier (JSON → secrets → env → CLI).
- Options pattern binds a section to a typed class, injected via `IOptions<T>`.
- `IOptions` (singleton, no reload), `IOptionsSnapshot` (scoped, per request), `IOptionsMonitor` (live reload + singletons).
- Secrets: User Secrets (dev), env vars / Key Vault (prod) — never in committed JSON.
- Nesting: `:` in keys, `__` in environment variables.
