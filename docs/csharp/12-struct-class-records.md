# `struct` vs `class` & Records

## Concept Explanation

- **`class`** — reference type, heap-allocated, copied by reference, supports inheritance. The default choice for most types.
- **`struct`** — value type, copied by value, no inheritance (can implement interfaces). Good for small, immutable, data-like values (e.g. `Point`, `Money`) to reduce heap allocations.
- **`record`** (C# 9) — a reference type (or `record struct` in C# 10) designed for **immutable data** with **value-based equality** and concise syntax. The compiler generates `Equals`, `GetHashCode`, `ToString`, deconstruction, and `with`-expression copying.

## Code Example(s)

```csharp
// record: value equality + immutability + with-expressions
public record Person(string Name, int Age);

var p1 = new Person("Ada", 36);
var p2 = new Person("Ada", 36);
Console.WriteLine(p1 == p2);          // True  — value-based equality
var older = p1 with { Age = 37 };     // non-destructive copy
Console.WriteLine(older);             // Person { Name = Ada, Age = 37 }
```

```csharp
// class: reference equality by default
class PersonClass { public string Name = ""; public int Age; }
var c1 = new PersonClass { Name = "Ada", Age = 36 };
var c2 = new PersonClass { Name = "Ada", Age = 36 };
Console.WriteLine(c1 == c2);          // False — different references

// struct: value type, value equality, copied on assignment
struct Point { public int X, Y; }
var a = new Point { X = 1, Y = 2 };
var b = a;     // full copy
b.X = 99;
Console.WriteLine(a.X); // 1 — independent
```

## Interview Q&A

**🟢 When should you use a struct instead of a class?**
For small, short-lived, immutable values that are logically a single value (coordinates, money, a date). Structs avoid heap allocations and GC pressure but copying large structs is costly.

**🟡 What is a record and why use it?**
A record is a type optimized for immutable data: the compiler generates value-based equality, `GetHashCode`, `ToString`, and supports `with` for non-destructive copies. Ideal for DTOs and domain values.

**🟡 What's the difference between a `record` and a `record struct`?**
`record` is a reference type; `record struct` is a value type. Both get value equality and `with`; choose `record struct` for small values you want copied by value.

**🟡 How does equality differ between class, struct, and record?**
Class: reference equality by default. Struct: value equality (member-wise, via `ValueType.Equals`, but slow due to reflection unless overridden). Record: compiler-generated value equality (fast).

**🔴 Are records immutable by default?**
Positional record properties are `init`-only (immutable after construction), but you can declare mutable properties. `record` (class) instances are still reference types — `with` creates a shallow copy.

## ⚠️ Tricky / Gotchas

- **Large structs are slow to copy.** Passing big structs by value repeatedly hurts performance; use `class`, `in` parameters, or `readonly struct`.
- **Mutable structs are evil.** Because they copy, mutations often hit a copy, not the original (see Value vs Reference Types). Make structs `readonly`.
- **`record` equality is value-based but `with` is a shallow copy** — nested reference members are shared between the original and the copy.
- **Default struct equality uses reflection and is slow**; override `Equals`/`GetHashCode` (or use `record struct`) for hot paths.
- **A struct always has a parameterless constructor** that zero-initializes fields; you can't remove it (though C# 10+ allows defining your own).

## 📌 Quick Recap

| | class | struct | record (class) |
|---|---|---|---|
| Kind | reference | value | reference |
| Equality | reference | value (member-wise) | value (generated) |
| Inheritance | ✅ | ❌ (interfaces only) | ✅ (records only) |
| Copy | reference | full value copy | `with` (shallow) |
| Best for | general objects | small immutable values | immutable data/DTOs |

- Use struct for small immutable values; make them `readonly`.
- Records = concise immutable data with value equality + `with`.
- `with` and record equality are shallow/value-based respectively.
