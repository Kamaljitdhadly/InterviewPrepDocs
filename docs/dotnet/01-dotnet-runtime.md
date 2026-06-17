# .NET Framework vs .NET Core vs .NET 5+ & the CLR

## Concept Explanation

- **.NET Framework** (1.0–4.8): the original, **Windows-only** framework. Still supported but no longer getting new features.
- **.NET Core** (1.0–3.1): a **cross-platform**, open-source, modular, high-performance rewrite (Windows, Linux, macOS).
- **.NET 5+** (.NET 5, 6, 7, 8, 9...): the unified successor. Microsoft dropped "Core" from the name. One platform for web, desktop, mobile, cloud. **.NET 6/8** are LTS releases.

Under the hood, your C# is compiled to **IL** (Intermediate Language) stored in assemblies. At runtime the **CLR** (Common Language Runtime) uses the **JIT** (Just-In-Time) compiler to turn IL into native machine code, and provides services like **garbage collection**, type safety, and exception handling.

```mermaid
flowchart LR
    A[C# source] -->|csc compiler| B[IL + metadata in assembly]
    B -->|CLR loads| C[JIT compiler]
    C --> D[Native machine code]
    D --> E[Executes with GC, type safety]
```

## Code Example(s)

```xml
<!-- A modern .NET project file (SDK-style) targets a Target Framework Moniker (TFM) -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

```csharp
// Minimal API host (modern .NET) — no Startup.cs needed
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
app.MapGet("/", () => "Hello .NET");
app.Run();
```

## Interview Q&A

**🟢 What is the difference between .NET Framework and .NET Core?**
.NET Framework is Windows-only and legacy; .NET Core is cross-platform, open-source, modular, and faster. .NET 5+ unifies them into a single platform.

**🟢 What is the CLR?**
The Common Language Runtime — the execution engine that runs .NET code. It JIT-compiles IL to native code and provides garbage collection, type safety, exception handling, and security.

**🟡 What is IL and JIT?**
IL (Intermediate Language) is the CPU-independent bytecode the C# compiler produces. The JIT compiler converts IL to native machine code at runtime, per method, the first time it runs.

**🟡 What is the difference between managed and unmanaged code?**
Managed code runs under the CLR with GC and type safety. Unmanaged code (e.g. C/C++) runs directly on the OS without those services; you manage memory yourself.

**🔴 What is AOT compilation and how does it differ from JIT?**
Ahead-Of-Time (e.g. Native AOT in .NET 7+) compiles to native code at build time, giving faster startup and smaller memory with no JIT at runtime — at the cost of some reflection/dynamic features. JIT compiles at runtime and can optimize for the actual hardware.

## ⚠️ Tricky / Gotchas

- **"Which should I use for new projects?"** — Always the latest **.NET (5+)**, preferably an LTS (.NET 8). Never start new projects on .NET Framework.
- **.NET Standard** is not a runtime — it's a *specification* of APIs that libraries can target to run on multiple runtimes (Framework + Core). Less relevant now that .NET unified, but still appears in interviews.
- **CLR vs CTS vs CLS:** CLR = runtime; CTS (Common Type System) defines how types are declared/used; CLS (Common Language Specification) is a subset of rules for cross-language interop.
- **JIT cost on startup**: first execution of a method is slower (JIT compilation); this is why warm-up and AOT matter for latency-sensitive apps.

## 📌 Quick Recap

- Framework = Windows-only legacy; Core = cross-platform rewrite; .NET 5+ = unified future (use .NET 8 LTS).
- CLR runs .NET: JIT (IL → native), GC, type safety, exceptions.
- IL = bytecode; JIT = runtime compile; AOT = build-time native compile.
- .NET Standard = API spec for library portability, not a runtime.
- Managed code = CLR-governed; unmanaged = direct OS, manual memory.
