# Interfaces vs Abstract Classes

## Concept Explanation

Both define a contract that derived types must fulfil, but they serve different design goals.

- An **interface** declares *what* a type can do — a pure capability contract. A class can implement **many** interfaces. Since C# 8, interfaces can include **default implementations**, static members, and constants.
- An **abstract class** is a partially implemented base class. It can have fields, constructors, state, and a mix of abstract and concrete members. A class can inherit only **one** abstract (or any) class.

Use an **interface** for capabilities that cut across unrelated types (e.g. `IDisposable`, `IComparable`). Use an **abstract class** when you have a strong "is-a" relationship and want to share state/implementation among related types.

## Code Example(s)

```csharp
interface ILogger
{
    void Log(string message);
    void LogError(string message) => Log("ERROR: " + message); // C# 8 default method
}

abstract class RepositoryBase
{
    protected readonly string ConnectionString;   // shared state
    protected RepositoryBase(string cs) => ConnectionString = cs; // constructor
    public abstract void Save();                   // must be implemented
    public void Audit() => Console.WriteLine("Audited"); // shared behavior
}

class UserRepository : RepositoryBase, ILogger
{
    public UserRepository(string cs) : base(cs) { }
    public override void Save() => Console.WriteLine("Saved");
    public void Log(string m) => Console.WriteLine(m);
}
```

## Interview Q&A

**🟢 What is the difference between an interface and an abstract class?**
An interface is a pure contract (historically no implementation), supports multiple inheritance, and has no state/constructor. An abstract class can hold state, constructors, fields, and concrete methods, but a class can inherit only one.

**🟡 When would you choose one over the other?**
Use an interface to define a capability shared by unrelated types or when you need multiple inheritance. Use an abstract class when related types share common state or implementation and you want to provide a base.

**🟡 Can an abstract class have a constructor?**
Yes. It can't be instantiated directly, but its constructor runs when a derived class is created (to initialize shared state).

**🔴 C# 8 added default interface methods — does that make abstract classes obsolete?**
No. Default methods let interfaces evolve without breaking implementers, but interfaces still can't hold instance state or run constructors. Abstract classes remain the choice for shared mutable state and a single coherent base type.

**🟡 Can a class implement two interfaces with the same method name?**
Yes — via **explicit interface implementation** you can provide separate implementations: `void IFoo.M()` and `void IBar.M()`.

## ⚠️ Tricky / Gotchas

- **Members of an interface are `public` by default; you cannot use access modifiers on classic interface members.** (Default-implementation members can be modified in newer C#.)
- **Explicit interface implementation hides the method from the class's public surface** — it's only callable through the interface reference.

```csharp
interface IA { void M(); }
class C : IA { void IA.M() => Console.WriteLine("A"); }
var c = new C();
// c.M();          // ❌ not visible
((IA)c).M();        // ✅ "A"
```

- **Adding a member to an interface breaks all implementers** (unless it has a default implementation). Adding a concrete member to an abstract class does not.
- **Don't reach for interfaces just to "be flexible".** A single-implementation interface with no other purpose adds indirection without value.

## 📌 Quick Recap

| | Interface | Abstract class |
|---|---|---|
| Multiple inheritance | ✅ Yes | ❌ No |
| Fields / state | ❌ No | ✅ Yes |
| Constructor | ❌ No | ✅ Yes |
| Default implementations | ✅ (C# 8+) | ✅ Always |
| Access modifiers on members | Mostly public | Any |

- Interface = capability contract; abstract class = shared base with state.
- Default interface methods aid versioning but don't replace abstract classes.
- Explicit implementation resolves name clashes and hides members.
