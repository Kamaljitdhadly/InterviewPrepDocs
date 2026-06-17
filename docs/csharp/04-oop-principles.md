# OOP: Encapsulation, Inheritance, Polymorphism, Abstraction

## Concept Explanation

The four pillars of object-oriented programming in C#:

- **Encapsulation** — bundle data + behavior together and hide internal state behind a controlled interface (properties, access modifiers). Protects invariants.
- **Inheritance** — a class (`derived`) reuses and extends another (`base`). Models an "is-a" relationship. C# supports single class inheritance + multiple interface implementation.
- **Polymorphism** — the same call behaves differently depending on the runtime type. Achieved via `virtual`/`override` (runtime) and method overloading (compile-time).
- **Abstraction** — expose *what* something does, hide *how*. Achieved with abstract classes and interfaces.

## Code Example(s)

```csharp
// Encapsulation: private field guarded by a property
class BankAccount
{
    private decimal _balance;                 // hidden state
    public decimal Balance => _balance;       // read-only to outside
    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("Must be positive");
        _balance += amount;                   // invariant enforced here
    }
}
```

```csharp
// Inheritance + runtime polymorphism
abstract class Shape { public abstract double Area(); }

class Circle : Shape
{
    public double R { get; init; }
    public override double Area() => Math.PI * R * R;
}
class Square : Shape
{
    public double Side { get; init; }
    public override double Area() => Side * Side;
}

Shape[] shapes = { new Circle { R = 2 }, new Square { Side = 3 } };
foreach (var s in shapes)
    Console.WriteLine(s.Area()); // dispatches to the right override at runtime
```

```csharp
// Compile-time polymorphism (overloading)
int Add(int a, int b) => a + b;
double Add(double a, double b) => a + b;
```

## Interview Q&A

**🟢 What are the four pillars of OOP?**
Encapsulation, inheritance, polymorphism, abstraction.

**🟢 Difference between method overloading and overriding?**
Overloading = same method name, different parameters, resolved at **compile time** (static polymorphism). Overriding = redefining a `virtual`/`abstract` base method in a derived class, resolved at **runtime** (dynamic dispatch).

**🟡 What do `virtual`, `override`, and `new` mean?**
`virtual` marks a base method as overridable. `override` provides a new implementation that participates in dynamic dispatch. `new` *hides* the base member (method hiding) — it does NOT participate in polymorphism and depends on the compile-time type.

**🟡 What is the difference between abstraction and encapsulation?**
Abstraction is about *design* — hiding complexity and exposing essential behavior (the "what"). Encapsulation is about *implementation* — protecting internal state via access control (the "how"). They're complementary.

**🔴 Does C# support multiple inheritance?**
Not for classes (to avoid the diamond problem). You can implement multiple interfaces, and since C# 8 interfaces can have default implementations, giving a controlled form of multiple inheritance of behavior.

## ⚠️ Tricky / Gotchas

- **`new` (hiding) vs `override` — output trap.** With hiding, the *declared type* of the variable decides which method runs.

```csharp
class Base { public virtual void V() => Console.WriteLine("Base.V");
             public void H() => Console.WriteLine("Base.H"); }
class Derived : Base { public override void V() => Console.WriteLine("Derived.V");
                       public new void H() => Console.WriteLine("Derived.H"); }

Base b = new Derived();
b.V(); // "Derived.V"  — override → dynamic dispatch
b.H(); // "Base.H"     — hiding → uses declared type Base
```

- **Calling virtual methods from a constructor** can call the derived override before the derived fields are initialized — avoid it.
- **Encapsulation ≠ just making fields private.** Exposing a mutable list via a getter (`public List<T> Items => _items;`) breaks encapsulation since callers can mutate it. Return `IReadOnlyList<T>` instead.

## 📌 Quick Recap

- 4 pillars: Encapsulation, Inheritance, Polymorphism, Abstraction.
- Overloading = compile-time; Overriding (`virtual`/`override`) = runtime.
- `new` hides (binds to declared type); `override` dispatches (binds to runtime type).
- No multiple class inheritance; use interfaces (with optional default methods).
- Real encapsulation guards invariants and avoids leaking mutable internals.
