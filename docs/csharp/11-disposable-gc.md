# `IDisposable`, `using` & Garbage Collection

## Concept Explanation

The .NET **Garbage Collector (GC)** automatically reclaims **managed memory** — you don't free objects manually. But the GC doesn't know about **unmanaged resources** (file handles, DB connections, sockets, OS handles). Those must be released deterministically via the **`IDisposable`** pattern.

- Implement **`IDisposable.Dispose()`** to release unmanaged/expensive resources.
- The **`using`** statement guarantees `Dispose()` is called when the scope exits, even on exceptions.
- The GC is **generational** (Gen 0, 1, 2): short-lived objects are collected cheaply in Gen 0; survivors get promoted. A **finalizer** (`~Type()`) is a last-resort safety net but is non-deterministic and slows collection — prefer `Dispose`.

## Code Example(s)

```csharp
// using ensures Dispose() runs deterministically
using (var conn = new SqlConnection(connStr))
{
    conn.Open();
    // ... use conn ...
} // conn.Dispose() called here, even if an exception was thrown

// C# 8 "using declaration" — disposed at end of enclosing scope
using var file = new StreamReader("data.txt");
string line = file.ReadLine();
```

```csharp
// Full Dispose pattern (managed + unmanaged + finalizer safety net)
class ResourceHolder : IDisposable
{
    private IntPtr _handle;        // unmanaged
    private StreamReader? _stream; // managed disposable
    private bool _disposed;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this); // no need to finalize; we cleaned up
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed) return;
        if (disposing) _stream?.Dispose(); // free managed
        // free unmanaged _handle here
        _disposed = true;
    }

    ~ResourceHolder() => Dispose(false); // finalizer: only unmanaged cleanup
}
```

## Interview Q&A

**🟢 What does the garbage collector do?**
It automatically reclaims memory used by managed objects that are no longer reachable, so you don't free memory manually.

**🟡 If there's a GC, why do we need `IDisposable`?**
The GC handles managed memory but not unmanaged resources (file/DB handles, sockets). `IDisposable`/`Dispose` releases those deterministically rather than waiting for non-deterministic finalization.

**🟢 What does `using` do?**
It calls `Dispose()` automatically at the end of its scope — even if an exception is thrown — ensuring deterministic cleanup.

**🟡 What are GC generations?**
Gen 0 (newest, collected most often and cheaply), Gen 1 (buffer), Gen 2 (long-lived). Objects surviving a collection are promoted. The Large Object Heap (LOH) holds objects ≥ 85 KB and is collected with Gen 2.

**🔴 What's the difference between `Dispose` and a finalizer (`~Type`)?**
`Dispose` is deterministic, called explicitly or via `using`. A finalizer runs non-deterministically on a separate GC thread as a safety net; it delays collection (objects with finalizers survive an extra GC cycle). Use `GC.SuppressFinalize` in `Dispose` to skip finalization when you've cleaned up.

## ⚠️ Tricky / Gotchas

- **GC is non-deterministic** — you can't predict *when* an object is collected. Don't rely on finalizers for timely cleanup; use `Dispose`/`using`.
- **Forgetting `using` leaks unmanaged resources** (e.g. leaving DB connections open exhausts the connection pool).
- **Don't call `GC.Collect()` in normal code** — it usually hurts performance by forcing premature/full collections. The GC self-tunes.
- **Events can keep objects alive** — a subscriber referenced by a long-lived publisher won't be collected until unsubscribed (a managed "leak").
- **`using` with a null is safe** (no-op), but a `using` declaration disposes at the *end of the method scope*, which may be later than you expect.

## 📌 Quick Recap

- GC reclaims managed memory automatically, generationally (Gen 0/1/2 + LOH).
- `IDisposable`/`Dispose` releases unmanaged/expensive resources deterministically.
- `using` guarantees `Dispose()` even on exceptions.
- Finalizers are a non-deterministic safety net; suppress them after `Dispose`.
- Avoid `GC.Collect()`; watch for event-handler and undisposed-connection leaks.
