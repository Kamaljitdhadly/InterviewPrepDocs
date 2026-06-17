# Delegates, Events, `Func`/`Action`, Lambdas

## Concept Explanation

A **delegate** is a type-safe function pointer — a reference to a method (or methods) with a matching signature. Delegates enable callbacks, plug-in behavior, and underpin events and LINQ.

- **`Action<...>`** — a built-in delegate for methods that return `void`.
- **`Func<...,TResult>`** — a built-in delegate where the last type parameter is the return type.
- **`Predicate<T>`** — shorthand for `Func<T,bool>`.
- A **lambda** (`x => x * 2`) is an inline anonymous method, usually assigned to a delegate or expression.
- An **event** is a delegate field with restricted access: subscribers can only `+=`/`-=`; only the declaring class can invoke it. This is the publisher/subscriber pattern.

## Code Example(s)

```csharp
// Delegate + Func/Action + lambda
Func<int, int, int> add = (a, b) => a + b;     // returns int
Action<string> log = msg => Console.WriteLine(msg); // returns void
Predicate<int> isEven = n => n % 2 == 0;

Console.WriteLine(add(2, 3)); // 5
log("hello");
Console.WriteLine(isEven(4)); // True
```

```csharp
// Events: publisher / subscriber
class Button
{
    public event EventHandler? Clicked;            // event = restricted delegate
    public void Press() => Clicked?.Invoke(this, EventArgs.Empty); // null-safe raise
}

var btn = new Button();
btn.Clicked += (sender, e) => Console.WriteLine("Clicked!"); // subscribe
btn.Press(); // "Clicked!"
```

```csharp
// Multicast delegate — invokes all in order
Action chain = () => Console.Write("A");
chain += () => Console.Write("B");
chain(); // "AB"
```

## Interview Q&A

**🟢 What is a delegate?**
A type-safe reference to a method with a specific signature; it lets you pass methods as arguments and invoke them indirectly.

**🟢 Difference between `Func` and `Action`?**
`Action` returns `void`; `Func` returns a value (its last generic parameter is the return type).

**🟡 What's the difference between a delegate and an event?**
An event is a delegate with restricted access — external code can only subscribe/unsubscribe (`+=`/`-=`), not invoke it or overwrite the invocation list. This protects the publisher.

**🟡 What is a multicast delegate?**
A delegate holding multiple methods. Invoking it calls them all in subscription order. For non-void delegates, only the *last* return value is kept.

**🔴 What's a closure, and what's the classic capture bug?**
A closure captures variables from the enclosing scope by *reference* (the variable, not its value at capture time). The classic bug is capturing a loop variable. (See Gotchas.)

**🔴 Difference between `Func<int>` and `Expression<Func<int>>`?**
`Func<int>` is compiled executable code. `Expression<Func<int>>` is a data structure (expression tree) representing the code, which LINQ providers like EF Core translate to SQL. You can inspect/translate the expression but not run it directly without compiling.

## ⚠️ Tricky / Gotchas

- **Closure over a loop variable.** In a `for` loop the variable is shared, so all lambdas see the final value:

```csharp
var actions = new List<Action>();
for (int i = 0; i < 3; i++)
    actions.Add(() => Console.Write(i));
foreach (var a in actions) a(); // "333"  — all captured the same i

// Fix: copy to a local
for (int i = 0; i < 3; i++) { int copy = i; actions.Add(() => Console.Write(copy)); } // "012"
```
> Note: `foreach` loop variables are per-iteration since C# 5, so they're safe — but classic `for` is not.

- **Forgetting to unsubscribe causes memory leaks.** If a long-lived publisher holds a subscriber via an event, the subscriber can't be GC'd. Always `-=` when done.
- **`event` can be `null`** if no subscribers — always raise with `Clicked?.Invoke(...)`.
- **`+=` on a delegate creates a new delegate** (delegates are immutable); it doesn't mutate the original.

## 📌 Quick Recap

- Delegate = type-safe method reference; enables callbacks, events, LINQ.
- `Action` = void return; `Func` = has return value; `Predicate<T>` = `Func<T,bool>`.
- Event = delegate with `+=`/`-=` only; protects the publisher.
- Lambdas create closures that capture variables by reference — watch the `for`-loop trap.
- `Expression<Func<>>` = inspectable code tree (used by EF/LINQ providers).
- Always unsubscribe from events to avoid leaks.
