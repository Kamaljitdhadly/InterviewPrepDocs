# C# Multithreading

## Questions Covered

1. What is the difference between Process and Thread?

## What is the difference between Process and Thread?

Concurrent programming in C# revolves around **processes** (isolated program instances) and **threads** (units of execution within a process).

### Process vs Thread

| | Process | Thread |
|---|---------|--------|
| Definition | Running instance of a program | Smallest unit of execution within a process |
| Memory | Separate address space | Shares process memory and resources |
| Communication | IPC — more complex | Shared memory — simpler |
| Overhead | Higher create/manage cost | Lower; lighter than processes |

- **Process** — own memory, code, data, system resources; independent of other processes.
- **Thread** — multiple threads in one process run concurrently, sharing memory.

```csharp
using System;
using System.Threading;
class Program
{
    static void Main(string[] args)
    {
        Thread thread1 = new Thread(DoWork);
        Thread thread2 = new Thread(DoWork);
        thread1.Start();
        thread2.Start();
        thread1.Join();
        thread2.Join();
    }
    static void DoWork()
    {
        for (int i = 0; i < 5; i++)
        {
            Console.WriteLine($"Thread {Thread.CurrentThread.ManagedThreadId} is working");
            Thread.Sleep(1000);
        }
    }
}
```

### Multithreading

**Multithreading** spawns multiple threads in one process to execute code simultaneously, improving CPU utilization.

```csharp
using System;
using System.Threading;
class Program
{
    static void Main(string[] args)
    {
        Thread thread1 = new Thread(PrintNumbers);
        Thread thread2 = new Thread(PrintLetters);
        thread1.Start();
        thread2.Start();
        thread1.Join();
        thread2.Join();
    }
    static void PrintNumbers()
    {
        for (int i = 1; i <= 5; i++) { Console.WriteLine(i); Thread.Sleep(500); }
    }
    static void PrintLetters()
    {
        for (char c = 'A'; c <= 'E'; c++) { Console.WriteLine(c); Thread.Sleep(500); }
    }
}
```

### Synchronous vs Asynchronous

- **Synchronous** — tasks run sequentially; next task waits; can block on long operations.
- **Asynchronous** — work runs off the main flow; program continues other work while waiting (especially I/O-bound).

```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Synchronous Start");
        FetchDataSynchronously();
        Console.WriteLine("Synchronous End");

        Console.WriteLine("Asynchronous Start");
        FetchDataAsynchronously().Wait();
        Console.WriteLine("Asynchronous End");
    }
    static void FetchDataSynchronously()
    {
        using (var client = new HttpClient())
        {
            var result = client.GetStringAsync("https://www.example.com").Result;
            Console.WriteLine(result.Substring(0, 100));
        }
    }
    static async Task FetchDataAsynchronously()
    {
        using (var client = new HttpClient())
        {
            var result = await client.GetStringAsync("https://www.example.com");
            Console.WriteLine(result.Substring(0, 100));
        }
    }
}
```

### Thread vs Task

- **Thread** — low-level; manual lifecycle (start, join, stop).
- **Task** — higher-level abstraction (.NET); represents async work with value return, continuations, and pool-backed execution.

**Task advantages over raw threads:**

- Easier API and composition.
- Thread pool reuse — less create/destroy overhead.
- Continuations (`ContinueWith`, `await`).
- Better exception propagation.

```csharp
using System;
using System.Threading.Tasks;
class Program
{
    static void Main(string[] args)
    {
        Task task1 = Task.Run(() => DoWork(1));
        Task task2 = Task.Run(() => DoWork(2));
        Task.WaitAll(task1, task2);
    }
    static void DoWork(int id)
    {
        for (int i = 0; i < 5; i++)
        {
            Console.WriteLine($"Task {id} is working");
            Task.Delay(500).Wait();
        }
    }
}
```

### async and await

Keywords that make async code read like sync code — method pauses at `await` without blocking the calling thread.

- **`async`** — marks an asynchronous method (may contain `await`).
- **`await`** — yields until the awaited task completes; caller can do other work.

```csharp
using System;
using System.Net.Http;
using System.Threading.Tasks;
class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Fetching data asynchronously...");
        string data = await FetchDataAsync();
        Console.WriteLine("Data fetched:");
        Console.WriteLine(data.Substring(0, 100));
    }
    static async Task<string> FetchDataAsync()
    {
        using (var client = new HttpClient())
            return await client.GetStringAsync("https://www.example.com");
    }
}
```

**Summary:** Processes are isolated; threads share process memory. Multithreading runs concurrent threads; async/await and `Task` simplify non-blocking I/O and parallel work over manual thread management.
