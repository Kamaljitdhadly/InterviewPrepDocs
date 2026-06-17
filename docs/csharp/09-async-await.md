# `async` / `await` & `Task`

## Concept Explanation

`async`/`await` enable **asynchronous, non-blocking** code that reads like synchronous code. A `Task` represents an operation that completes in the future; `Task<T>` produces a result. `await` *suspends* the current method until the awaited task completes, **without blocking the thread** — the thread is freed to do other work, and execution resumes when the task finishes.

This matters for **I/O-bound** work (network, disk, DB): instead of blocking a thread while waiting, the thread returns to the pool. For **CPU-bound** work you use `Task.Run` to offload to a background thread.

## Code Example(s)

```csharp
// Async I/O — thread is freed during the await
async Task<string> FetchAsync(string url)
{
    using var client = new HttpClient();
    string html = await client.GetStringAsync(url); // suspends here, no blocking
    return html.Substring(0, 100);
}
```

```csharp
// Run independent tasks concurrently
async Task<int> TotalAsync()
{
    Task<int> a = GetCountAsync("A");   // start both...
    Task<int> b = GetCountAsync("B");   // ...without awaiting yet
    int[] results = await Task.WhenAll(a, b); // await together → parallel
    return results.Sum();
}
```

```csharp
// CPU-bound work offloaded to the thread pool
async Task<long> ComputeAsync()
    => await Task.Run(() => { long sum = 0; for (int i=0;i<1_000_000;i++) sum+=i; return sum; });
```

## Interview Q&A

**🟢 What does `async`/`await` do?**
It lets you write asynchronous code sequentially. `await` suspends the method until the task completes, freeing the thread, then resumes — avoiding blocking.

**🟡 Does `async` create a new thread?**
No. `async`/`await` by itself doesn't spawn threads. For I/O it uses I/O completion (no thread is held while waiting). To run CPU work on another thread you explicitly use `Task.Run`.

**🟡 What's the difference between `Task.WhenAll` and `Task.WaitAll`?**
`WhenAll` returns a task you `await` (non-blocking). `WaitAll` blocks the current thread until all complete. Prefer `await Task.WhenAll` in async code.

**🔴 What is a deadlock with `.Result`/`.Wait()` and how does it happen?**
In contexts with a synchronization context (old ASP.NET, WinForms/WPF), calling `.Result` blocks the captured context thread, while the continuation also needs that thread to resume → deadlock. Fix: use `await` all the way, or `ConfigureAwait(false)` in library code.

**🔴 Why is `async void` discouraged?**
`async void` can't be awaited, and exceptions thrown in it can't be caught by the caller — they crash the process. Only use it for event handlers; otherwise return `Task`.

## ⚠️ Tricky / Gotchas

- **`async void` swallows the ability to catch exceptions.** Use `async Task`.

```csharp
async void Fire() => throw new Exception("boom"); // ❌ crashes app, can't catch
async Task FireSafe() => throw new Exception("boom"); // ✅ awaitable & catchable
```

- **Blocking on async (`.Result`, `.Wait()`) can deadlock** in UI/legacy ASP.NET. Async all the way down.
- **`await` inside a loop runs sequentially.** To parallelize, start tasks first, then `await Task.WhenAll`.

```csharp
foreach (var url in urls) await Fetch(url);        // sequential (slow)
var tasks = urls.Select(Fetch); await Task.WhenAll(tasks); // concurrent (fast)
```

- **Exceptions are stored on the Task**, re-thrown when awaited. If you never await, you may miss them (unobserved exceptions).
- **`ConfigureAwait(false)`** in library code avoids capturing the context — improves perf and avoids deadlocks. Don't use it where you need the original context (e.g. UI updates).

## 📌 Quick Recap

- `await` suspends without blocking; frees the thread for I/O.
- `async` alone doesn't create threads; `Task.Run` offloads CPU work.
- Use `Task.WhenAll` to run independent tasks concurrently.
- Avoid `.Result`/`.Wait()` (deadlocks); async all the way down.
- Avoid `async void` except event handlers; return `Task` to allow await + catch.
- Use `ConfigureAwait(false)` in libraries.
