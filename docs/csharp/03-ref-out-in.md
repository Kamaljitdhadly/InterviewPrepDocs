# `ref`, `out`, `in` & Parameter Passing

## Concept Explanation

By default C# passes arguments **by value** — a copy of the value (for value types) or a copy of the reference (for reference types). The `ref`, `out`, and `in` modifiers change this:

- **`ref`** — passes the variable *by reference*. The method can read and modify the caller's variable. Must be initialized before the call.
- **`out`** — also by reference, but used for *output*. The caller need not initialize it; the method **must** assign it before returning. Great for "return multiple values".
- **`in`** — by reference but **read-only**. Avoids copying large structs while guaranteeing the method won't modify them.

## Code Example(s)

```csharp
void Increment(ref int x) => x++;          // modifies caller's variable
int n = 5; Increment(ref n); // n == 6

bool TryParseAge(string s, out int age)    // out: must assign before return
{
    if (int.TryParse(s, out age)) return true;
    age = 0;
    return false;
}
if (TryParseAge("30", out int a)) Console.WriteLine(a); // 30

void Print(in BigStruct s) => Console.WriteLine(s.X); // read-only, no copy
// s.X = 1; // ❌ not allowed inside the method
```

```csharp
// Passing a reference type WITHOUT ref vs WITH ref
void Reassign(List<int> list)      => list = new List<int> { 9 }; // local only
void ReassignRef(ref List<int> l)  => l = new List<int> { 9 };    // caller sees it

var data = new List<int> { 1 };
Reassign(data);          // data still { 1 } — reassignment was local
ReassignRef(ref data);   // data now { 9 }
```

## Interview Q&A

**🟢 What's the difference between `ref` and `out`?**
Both pass by reference. `ref` requires the argument to be initialized first and the method may or may not change it. `out` doesn't need prior initialization but the method *must* assign it before returning.

**🟡 If reference types are already passed "by reference", why use `ref`?**
By default you pass a *copy of the reference*. You can mutate the pointed-to object, but reassigning the parameter doesn't affect the caller. `ref` lets you reassign the caller's variable itself.

**🟡 What is `in` for?**
To pass large structs by reference without copying, while guaranteeing read-only access. It's a performance optimization for big value types.

**🔴 Can you overload methods that differ only by `ref`/`out`/`in`?**
You cannot have two overloads that differ *only* by `out` vs `ref` (they have the same signature for overload resolution in many cases). `in` vs by-value can be ambiguous too. Generally, differing only by these modifiers is restricted.

## ⚠️ Tricky / Gotchas

- **Passing a reference type by value still lets you mutate it.** Newbies think "no `ref` = nothing changes". You can change the object's contents; you just can't swap which object the caller's variable points to.
- **`out` parameters are assigned, not initialized by caller.** Any prior value is discarded; the method must set it.
- **`ref`/`out` can't be used with `async` methods or iterators** (`yield`), because the stack frame doesn't persist.
- **`in` can cause hidden defensive copies.** If you call a non-readonly member on an `in` parameter, the compiler makes a defensive copy — defeating the optimization. Mark structs `readonly struct` to avoid this.

## 📌 Quick Recap

- Default = pass by value (copy of value, or copy of reference).
- `ref` = read/write the caller's variable (must be pre-initialized).
- `out` = method must assign it; ideal for multiple return values / `TryParse`.
- `in` = read-only by reference; avoids copying big structs (use `readonly struct`).
- No `ref` ≠ "immutable" for reference types — you can still mutate the object.
