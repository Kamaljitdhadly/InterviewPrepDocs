# Exception Handling

## Concept Explanation

Exceptions represent runtime errors that disrupt normal flow. C# uses `try`/`catch`/`finally`:

- **`try`** — code that might throw.
- **`catch`** — handles a specific exception type (most-specific first). Can include a **filter** (`when`).
- **`finally`** — always runs (whether or not an exception occurred), used for cleanup.

Best practices: catch the **most specific** exception you can handle, don't swallow exceptions silently, preserve stack traces (use `throw;` not `throw ex;`), and use exceptions for *exceptional* conditions, not control flow.

## Code Example(s)

```csharp
try
{
    int result = Divide(10, 0);
}
catch (DivideByZeroException ex) when (DateTime.Now.Hour < 12) // exception filter
{
    Console.WriteLine("Morning divide error: " + ex.Message);
}
catch (ArithmeticException ex)        // more general, comes after specific
{
    Console.WriteLine("Math error: " + ex.Message);
}
finally
{
    Console.WriteLine("Always runs — cleanup here");
}
```

```csharp
// Preserve the stack trace when rethrowing
try { DoWork(); }
catch (Exception ex)
{
    Log(ex);
    throw;        // ✅ keeps original stack trace
    // throw ex;  // ❌ resets the stack trace to here
}
```

```csharp
// Custom exception + inner exception (wrap & preserve cause)
class OrderException : Exception
{
    public OrderException(string msg, Exception inner) : base(msg, inner) { }
}
```

## Interview Q&A

**🟢 What is the purpose of `finally`?**
To run cleanup code that should execute regardless of whether an exception was thrown (e.g. closing files/connections).

**🟡 Difference between `throw;` and `throw ex;`?**
`throw;` rethrows the current exception preserving the original stack trace. `throw ex;` resets the stack trace to the rethrow point, losing where it originally occurred. Always prefer `throw;`.

**🟡 What is an exception filter (`when`)?**
A condition on a `catch` block; the catch runs only if the condition is true. Unlike catching-then-rethrowing, a filter doesn't unwind the stack when it doesn't match, preserving better diagnostics.

**🟡 Should you catch `Exception` (the base type)?**
Rarely. Catch specific exceptions you can handle. A broad `catch (Exception)` is acceptable at top-level boundaries (e.g. logging + graceful shutdown) but not for normal logic.

**🔴 What is the difference between `Exception` and `SystemException`/`ApplicationException`?**
All derive from `Exception`. `SystemException` is for CLR-thrown errors; `ApplicationException` was once recommended as a base for custom exceptions but Microsoft now advises deriving directly from `Exception`.

## ⚠️ Tricky / Gotchas

- **`finally` runs even after `return`** in the `try` — and can override the return value if it also returns (avoid returning from `finally`).

```csharp
int M()
{
    try { return 1; }
    finally { Console.WriteLine("runs before the method returns 1"); }
}
```

- **When `finally` does NOT run:** a `StackOverflowException`, `Environment.FailFast`, an unhandled exception on another thread that terminates the process, or killing the process. Also, if the `try` is never entered.
- **Swallowing exceptions silently** (`catch {}`) hides bugs — at minimum log them.
- **Exceptions are expensive** — don't use them for normal control flow (e.g. parsing). Use `int.TryParse` instead of catching `FormatException`.
- **Ordering matters:** a more general catch before a specific one is a compile error (unreachable catch).

## 📌 Quick Recap

- `try`/`catch`/`finally`; catch specific → general.
- `finally` always runs (cleanup); rarely won't (FailFast, stack overflow, process kill).
- `throw;` preserves stack trace; `throw ex;` resets it.
- Use `when` filters; avoid swallowing exceptions; avoid exceptions for control flow.
- Wrap causes via inner exceptions; prefer `Try...` methods over catching.
