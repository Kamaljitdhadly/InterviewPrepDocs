# Generics

## Concept Explanation

**Generics** let you write type-safe, reusable code parameterized by type. Instead of coding against `object` (which boxes value types and loses type safety), you write `List<T>`, `Dictionary<TKey,TValue>`, or your own generic class/method, and the compiler enforces types at compile time.

Benefits: **type safety**, **no boxing** for value types, **code reuse**, and **better performance**. **Constraints** (`where T : ...`) restrict what `T` can be, unlocking operations on it.

## Code Example(s)

```csharp
// Generic class
class Box<T>
{
    public T Value { get; set; }
}

// Generic method with a constraint
T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) > 0 ? a : b;

Console.WriteLine(Max(3, 7));        // 7  — T inferred as int
Console.WriteLine(Max("ab", "ac")); // "ac" — T inferred as string
```

```csharp
// Common constraints
class Repository<T> where T : class, new()   // reference type with parameterless ctor
{
    public T Create() => new T();
}

void Process<T>(T item) where T : struct { }            // value types only
void Handle<T>(T svc)   where T : IDisposable { svc.Dispose(); } // interface
```

## Interview Q&A

**🟢 Why use generics?**
Type safety without casting, no boxing for value types, code reuse, and better performance compared to using `object`.

**🟡 What are generic constraints? Name a few.**
Constraints restrict the type argument: `where T : class` (reference type), `struct` (value type), `new()` (parameterless ctor), `SomeBaseClass`, `ISomeInterface`, `notnull`, `unmanaged`. They let you call members/operations on `T`.

**🟡 What's the difference between `List<T>` and `ArrayList`?**
`List<T>` is generic and type-safe with no boxing for value types. `ArrayList` stores `object`, so it boxes value types and requires casts — slower and error-prone. Prefer `List<T>`.

**🔴 What is covariance and contravariance in generics?**
They allow implicit reference conversions between generic types. **Covariance** (`out T`, e.g. `IEnumerable<out T>`) lets `IEnumerable<string>` be used as `IEnumerable<object>`. **Contravariance** (`in T`, e.g. `Action<in T>`) lets `Action<object>` be used as `Action<string>`. Only applies to interfaces/delegates with reference types.

**🔴 Are C# generics like C++ templates or Java generics?**
Neither exactly. Unlike Java's type erasure, C# generics are **reified** — type info is preserved at runtime, and the JIT specializes value-type instantiations. Unlike C++ templates, they're resolved at runtime via the CLR, not pure compile-time code generation.

## ⚠️ Tricky / Gotchas

- **You can't use most operators on `T`** (`a + b`, `a > b`) without a constraint or `IComparable`. The compiler doesn't know `T` supports them. (Newer C# `static abstract` interface members help via generic math.)
- **`default(T)`** is `null` for reference types but the zero-value for value types — useful when you need a fallback.
- **Covariance only works with reference types.** `IEnumerable<int>` is NOT assignable to `IEnumerable<object>` because `int` is a value type (would require boxing).

```csharp
IEnumerable<string> strings = new[] { "a" };
IEnumerable<object> objs = strings;   // ✅ covariance
IEnumerable<int> ints = new[] { 1 };
// IEnumerable<object> bad = ints;    // ❌ value type, no covariance
```

- **Static fields are per-constructed-type.** `Counter<int>` and `Counter<string>` have separate static fields.

## 📌 Quick Recap

- Generics = type-safe reuse, no boxing, better perf vs `object`.
- Constraints (`where T : class/struct/new()/IFoo`) unlock operations on `T`.
- Covariance (`out`) and contravariance (`in`) work for reference types only.
- C# generics are reified (runtime type info), unlike Java erasure.
- Prefer `List<T>`/`Dictionary<,>` over non-generic `ArrayList`/`Hashtable`.
