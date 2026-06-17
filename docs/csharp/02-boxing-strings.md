# Boxing, Unboxing & `string` Immutability

## Concept Explanation

**Boxing** is converting a value type to `object` (or an interface it implements). The runtime allocates a box on the heap and copies the value into it. **Unboxing** extracts the value back out, and requires an explicit cast. Boxing has a performance cost (heap allocation + copy + GC pressure), so it matters in hot paths.

**`string` immutability**: a `string` object never changes after creation. Every operation that "modifies" a string (`+`, `.Replace`, `.ToUpper`, `.Substring`) returns a **new** string. This makes strings thread-safe and safe to share, but means building strings in a loop with `+` creates lots of garbage. Use **`StringBuilder`** for repeated concatenation.

## Code Example(s)

```csharp
// Boxing & unboxing
int n = 42;
object boxed = n;        // boxing: heap allocation, value copied in
int back = (int)boxed;   // unboxing: explicit cast required
// double bad = (double)boxed; // ❌ InvalidCastException — must unbox to exact type
```

```csharp
// String immutability — this creates a NEW string each iteration (slow, lots of garbage)
string s = "";
for (int i = 0; i < 10000; i++)
    s += i;   // O(n^2) total work

// Use StringBuilder for repeated concatenation (mutable buffer)
var sb = new System.Text.StringBuilder();
for (int i = 0; i < 10000; i++)
    sb.Append(i);
string result = sb.ToString();
```

## Interview Q&A

**🟢 What is boxing and unboxing?**
Boxing wraps a value type in a heap-allocated `object`; unboxing casts that object back to the value type. Boxing is implicit, unboxing is explicit.

**🟡 Why is boxing considered expensive?**
It allocates on the managed heap, copies the value, and adds GC pressure. In tight loops or large collections (e.g. old non-generic `ArrayList`), it can dominate runtime. Generics (`List<int>`) avoid it.

**🟢 Why are strings immutable in C#?**
For thread-safety, security (can't change a string after a security check), and to enable interning/caching. Any change returns a new string.

**🟡 When should you use `StringBuilder` instead of `+`?**
When concatenating in a loop or building strings from many pieces. For a few fixed concatenations the compiler optimizes `+` into `string.Concat`, so `StringBuilder` isn't needed.

**🔴 What is string interning?**
The CLR keeps a pool of unique string literals; identical compile-time literals share one instance. `string.Intern()` can add runtime strings to the pool. This is why `"a" == "a"` references can be the same object, but it doesn't change equality semantics.

## ⚠️ Tricky / Gotchas

- **Unboxing must match the exact type.** Boxing an `int` then unboxing to `long` throws `InvalidCastException` — there's no implicit numeric conversion during unboxing.

```csharp
object o = 5;        // boxed int
long l = (long)o;    // ❌ InvalidCastException
long ok = (int)o;    // ✅ unbox to int first, then widen
```

- **Hidden boxing.** Calling a struct's `ToString()`/`Equals()` when treated as `object`, using a value type with non-generic interfaces, or `string.Format("{0}", myStruct)` can silently box.
- **`string` `==` compares values, not references.** Because `string` overloads `==`. But `object.ReferenceEquals(a, b)` checks identity.
- **Concatenation gotcha:** `"" + 1 + 2` is `"12"` (string), but `1 + 2 + ""` is `"3"` — left-to-right evaluation matters.

## 📌 Quick Recap

- Boxing = value type → heap object; unboxing = cast back (exact type only).
- Boxing costs allocations + GC; generics avoid it.
- Strings are immutable → every "edit" makes a new string.
- Use `StringBuilder` for loop/heavy concatenation.
- `==` on strings compares content; watch for hidden boxing and exact-type unboxing.
