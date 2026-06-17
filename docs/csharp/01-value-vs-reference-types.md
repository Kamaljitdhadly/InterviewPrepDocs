# Value Types vs Reference Types

## Concept Explanation

In C#, every type is either a **value type** or a **reference type**, and the difference is *where the data lives* and *what gets copied when you assign or pass it*.

- **Value types** hold the data directly. Examples: `int`, `double`, `bool`, `char`, `enum`, and any `struct`. When you assign one value-type variable to another, the **value is copied** — the two variables are independent.
- **Reference types** hold a *reference* (a pointer) to data on the managed heap. Examples: `class`, `string`, `object`, arrays, delegates. When you assign one reference variable to another, you copy the **reference**, not the object — both now point at the same object.

> Common rule of thumb: **`struct` = value type, `class` = reference type.** Storage location (stack vs heap) is an implementation detail — value types can live on the heap too (e.g. a value-type field inside a class). The *real* distinction is copy semantics.

## Code Example(s)

```csharp
// Value type: independent copies
int a = 10;
int b = a;   // b gets a COPY of the value
b = 20;
Console.WriteLine(a); // 10  — a is unaffected

// Reference type: shared object
class Box { public int Value; }

Box x = new Box { Value = 10 };
Box y = x;   // y copies the REFERENCE — same object
y.Value = 20;
Console.WriteLine(x.Value); // 20 — x sees the change too
```

```csharp
// Passing to methods follows the same rule
void Mutate(int n)  { n = 99; }          // changes a copy
void Mutate(Box bx) { bx.Value = 99; }   // mutates shared object

int num = 1;  Mutate(num);  // num still 1
Box box = new() { Value = 1 }; Mutate(box); // box.Value now 99
```

## Interview Q&A

**🟢 What is the difference between a value type and a reference type?**
A value type stores its data directly and is copied by value on assignment; a reference type stores a reference to an object on the heap, so assignment copies the reference and both variables point to the same object.

**🟢 Give examples of each.**
Value types: `int`, `double`, `bool`, `DateTime`, any `struct`, `enum`. Reference types: `class`, `string`, `object`, arrays, delegates.

**🟡 Is `string` a value type or reference type? It behaves like a value...**
`string` is a **reference type**, but it's **immutable**, so it *feels* like a value type — any "modification" creates a new string. Two equal strings compare equal with `==` because `string` overloads `==` to compare contents.

**🟡 Where are value types stored — stack or heap?**
It depends. Local value-type variables go on the stack; but a value type that is a field of a class lives on the heap (inside that object), and value types inside arrays live on the heap too. The defining trait is copy-by-value, not the storage location.

**🔴 What happens with a struct that contains a reference type field?**
Copying the struct copies the reference field's *reference*, not the referenced object — so you get a shallow copy. Both struct copies share the same underlying referenced object.

## ⚠️ Tricky / Gotchas

- **Mutating a struct that's in a collection or property does nothing visible.** `myList[0].X = 5;` on a `List<SomeStruct>` doesn't compile (or mutates a copy) because the indexer returns a *copy*. This is a classic source of "why didn't my change stick?" bugs — prefer immutable structs.

```csharp
struct Point { public int X; }
var list = new List<Point> { new Point { X = 1 } };
// list[0].X = 5;  // ❌ Compile error: cannot modify the return value (it's a copy)
var p = list[0]; p.X = 5; list[0] = p; // ✅ correct way
```

- **"Value types are always on the stack" is wrong.** Repeat after the interviewer's trap: storage depends on context.
- **Equality is different by default.** Two reference-type instances with identical fields are *not* equal with `==` (reference equality) unless the type overrides it (like `string` or `record`). Two value types compare by structural value via the default `ValueType.Equals`.

```csharp
class C { public int N; }
Console.WriteLine(new C{N=1} == new C{N=1}); // False — different references
```

## 📌 Quick Recap

- Value type → copies the **value**; reference type → copies the **reference**.
- `struct`/`enum`/primitives = value; `class`/`string`/array/delegate = reference.
- The key difference is **copy semantics**, not stack vs heap.
- `string` is a reference type that acts value-like because it's immutable.
- Mutating struct copies (in lists/properties) is a top gotcha — make structs immutable.
