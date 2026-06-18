# C# Garbage Collector

## Questions Covered

1. What is Garbage Collection(GC)?
2. What is the difference between "Dispose" and "Finalize"?
3. Can we force Garbage Collector to run?

## What is Garbage Collection(GC)?

The **Garbage Collector** is the .NET runtime component that automatically allocates and reclaims memory for managed objects, preventing leaks and optimizing usage.

**How it works:**

- **Allocation** — new objects get memory from the managed heap.
- **Tracking** — GC tracks all managed objects and their references.
- **Generations** — objects classified into Gen 0, Gen 1, Gen 2 by lifespan to optimize collection.
- **Collection** — unreferenced objects are marked and memory reclaimed.

```csharp
public class Program
{
    static void Main(string[] args)
    {
        var obj = new object(); // Allocated on the managed heap
        // GC cleans up when obj is no longer referenced
    }
}
```

### Managed vs. Unmanaged Code

- **Managed** — runs under the CLR; GC handles memory, type safety, and collection (e.g., C# with .NET libraries).
- **Unmanaged** — runs outside CLR control; programmer manages memory (e.g., C/C++, native Windows APIs via P/Invoke).

```csharp
using System;
using System.Runtime.InteropServices;

[DllImport("user32.dll", CharSet = CharSet.Auto)]
public static extern int MessageBox(IntPtr hWnd, String text, String caption, uint type);

class Program
{
    static void Main()
    {
        MessageBox(IntPtr.Zero, "Hello, World!", "MyApp", 0); // Unmanaged code
    }
}
```

### Dispose Pattern

Releases unmanaged resources (file handles, DB connections, sockets) via `IDisposable.Dispose()`:

```csharp
public class ResourceHolder : IDisposable
{
    private bool disposed = false;

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                // Free managed objects here
            }
            // Free unmanaged resources here
            disposed = true;
        }
    }

    ~ResourceHolder() // Finalizer
    {
        Dispose(false);
    }
}
```

```csharp
class Program
{
    static void Main()
    {
        using (var resource = new ResourceHolder())
        {
            // Use the resource
        } // Dispose called automatically
    }
}
```

### Memory Leaks

Objects no longer needed but still referenced consume memory over time. In .NET, events/delegates are a common cause — a subscriber stays alive as long as the publisher holds the reference.

```csharp
public class Publisher
{
    public event EventHandler SomeEvent;
}

public class Subscriber
{
    public void Subscribe(Publisher publisher)
    {
        publisher.SomeEvent += HandleEvent;
    }
    private void HandleEvent(object sender, EventArgs e) { }
}
```

**Risk:** if `Subscriber` never unsubscribes, it remains in memory while `Publisher` is alive.

### Weak vs. Strong References

- **Strong** — prevents GC collection while the reference exists.
- **Weak** — does not prevent collection; useful when you want to reference an object only if it still exists.

```csharp
class Program
{
    static void Main()
    {
        var strongRef = new object();
        var weakRef = new WeakReference(strongRef);

        strongRef = null;

        if (weakRef.IsAlive)
            Console.WriteLine("Object is still alive.");
        else
            Console.WriteLine("Object has been collected.");
    }
}
```

### Managed vs. Unmanaged Resources

| | **Managed** | **Unmanaged** |
|---|---|---|
| **Management** | Automatic via GC | Manual via `IDisposable` |
| **Examples** | Objects, strings, `List<T>`, `Dictionary<K,V>` | File handles, DB connections, sockets, `Marshal.AllocHGlobal` |
| **Cleanup** | Not required | Must explicitly release |

```csharp
public class ManagedResourceExample
{
    public string ManagedString { get; set; }
    public ManagedResourceExample()
    {
        ManagedString = "This is a managed resource.";
    }
}
```

```csharp
using System;
using System.Runtime.InteropServices;

public class UnmanagedResourceExample : IDisposable
{
    private IntPtr unmanagedResource;

    public UnmanagedResourceExample()
    {
        unmanagedResource = Marshal.AllocHGlobal(100);
    }

    public void Dispose()
    {
        if (unmanagedResource != IntPtr.Zero)
        {
            Marshal.FreeHGlobal(unmanagedResource);
            unmanagedResource = IntPtr.Zero;
        }
        GC.SuppressFinalize(this);
    }

    ~UnmanagedResourceExample()
    {
        Dispose();
    }
}
```

## What is the difference between "Dispose" and "Finalize"?

Both release resources, but differ in invocation and purpose.

### Dispose

Part of `IDisposable` — **explicit, deterministic** cleanup of unmanaged (and optionally managed) resources.

- Called explicitly or via `using`.
- Releases file handles, DB connections, sockets, etc.
- Not automatic — developer must ensure it runs.

```csharp
public class ResourceHolder : IDisposable
{
    private IntPtr unmanagedResource;
    private bool disposed = false;

    public ResourceHolder()
    {
        unmanagedResource = /* allocation logic */;
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                // Dispose managed resources if needed
            }
            if (unmanagedResource != IntPtr.Zero)
            {
                unmanagedResource = IntPtr.Zero;
            }
            disposed = true;
        }
    }

    ~ResourceHolder()
    {
        Dispose(false);
    }
}
```

`GC.SuppressFinalize(this)` skips the finalizer when `Dispose` already cleaned up.

### Finalize

Destructor (`~ClassName`) called by the GC **before** reclamation — **non-deterministic** fallback when `Dispose` was not called.

- Automatic but unpredictable timing.
- Generally unreliable for resource management; prefer `Dispose`.
- Can cause performance issues if relied upon.

```csharp
public class ResourceHolderWithFinalizer
{
    private IntPtr unmanagedResource;

    public ResourceHolderWithFinalizer()
    {
        unmanagedResource = /* allocation logic */;
    }

    ~ResourceHolderWithFinalizer()
    {
        if (unmanagedResource != IntPtr.Zero)
            unmanagedResource = IntPtr.Zero;
    }
}
```

**Summary:** call `Dispose` for deterministic cleanup; finalizers are a safety net only.

## Can we force Garbage Collector to run?

You can **request** a collection via the `GC` class, but routine forced collection is **not recommended** — the GC is tuned for most scenarios and manual calls can hurt performance without expected benefits.

```csharp
GC.Collect();           // Request collection of all generations
GC.Collect(0);          // Collect Gen 0 only
GC.WaitForPendingFinalizers(); // Wait for finalizers to complete
```

Use only for diagnostics or rare edge cases, not as regular practice.
