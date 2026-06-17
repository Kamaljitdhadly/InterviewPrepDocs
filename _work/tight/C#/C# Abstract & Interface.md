# C# Abstract & Interface

## Questions Covered

1. What are abstract classes and interfaces
2. Do abstract class have Constructors in C#
3. Can Abstract class be Sealed or Static in C#
4. Can you declare abstract methods as private in C#?
5. What is the difference between abstraction and abstract class

## What are abstract classes and interfaces

Both define contracts for classes, but with different capabilities and inheritance rules.

**Abstract class** — cannot be instantiated; may contain abstract methods (no body) and concrete methods (with body), plus fields, constructors, and access modifiers.

```csharp
public abstract class Animal
{
    public abstract void MakeSound();
    public void Sleep() => Console.WriteLine("Sleeping...");
}
```

**Interface** — defines a contract (method signatures, properties, events, indexers). From C# 8.0, interfaces may include **default implementations**.

```csharp
public interface IAnimal
{
    void MakeSound();
    void Sleep() => Console.WriteLine("Sleeping..."); // C# 8.0+ default
}
```

| Feature | Abstract Class | Interface |
|---------|----------------|-----------|
| Members | Fields, constructors, methods | Methods, properties, events, indexers (defaults in C# 8.0+) |
| Implementation | Partial implementation allowed | No implementation except defaults |
| Access modifiers | Supported | Members implicitly public |
| Inheritance | Single class inheritance | Multiple interface implementation |
| Constructors | Yes | No |
| Fields | Yes | No |

**When to use:**

- **Abstract class** — shared base with common code and a class hierarchy.
- **Interface** — contract across unrelated types; multiple inheritance of behavior.

**Abstract class implementing an interface** — common pattern; provides partial implementation and leaves the rest to derived classes:

```csharp
public interface IAnimal
{
    void MakeSound();
    void Eat();
}

public abstract class Animal : IAnimal
{
    public abstract void MakeSound();
    public void Eat() => Console.WriteLine("Eating...");
    public abstract void Sleep();
}

public class Dog : Animal
{
    public override void MakeSound() => Console.WriteLine("Woof!");
    public override void Sleep() => Console.WriteLine("Sleeping...");
}
```

An abstract class can implement multiple interfaces and act as a bridge between contracts and concrete types.

## Do abstract class have Constructors in C#

**Yes.** Abstract classes can have constructors (typically `protected`) to initialize shared state. They are invoked when a derived class is instantiated — you cannot construct the abstract class directly.

```csharp
public abstract class Animal
{
    public string Name { get; set; }

    protected Animal(string name)
    {
        Name = name;
        Console.WriteLine($"{Name} is being created.");
    }

    public abstract void MakeSound();
}

public class Dog : Animal
{
    public Dog(string name) : base(name)
    {
        Console.WriteLine($"{Name} the dog is created.");
    }

    public override void MakeSound() => Console.WriteLine("Woof!");
}

Dog myDog = new Dog("Buddy"); // Calls Animal then Dog constructor
myDog.MakeSound();
```

## Can Abstract class be Sealed or Static in C#

**No** to both — compile-time errors.

**Sealed** — prevents inheritance; conflicts with the purpose of an abstract base class.

```csharp
public abstract class Animal
{
    public abstract void MakeSound();
}
// Error: cannot seal an abstract class
// public sealed class Dog : Animal { ... }
```

**Static** — cannot be instantiated and allows only static members; abstract classes are meant for instance-based inheritance with instance members.

```csharp
// Error: abstract class cannot be static
// public static class Animal { public abstract void MakeSound(); }
```

## Can you declare abstract methods as private in C#?

**No.** Abstract methods must be **`public`** or **`protected`** so derived classes can override them. `private` would hide the contract from subclasses.

```csharp
public abstract class Animal
{
    protected abstract void MakeSound();
    public abstract void Eat();
}

public class Dog : Animal
{
    protected override void MakeSound() => Console.WriteLine("Woof!");
    public override void Eat() => Console.WriteLine("Dog is eating.");
}
```

- `protected` — overrideable only within the hierarchy.
- `public` — overrideable and callable from outside.

## What is the difference between abstraction and abstract class

**Abstraction** is an OOP *concept* — hide implementation details and expose only essential behavior. Achieved via abstract classes, interfaces, and abstract methods.

```csharp
public interface IShape
{
    double GetArea();
    double GetPerimeter();
}
```

**Abstract class** is a concrete *language construct* — a non-instantiable base class with abstract and/or concrete members, fields, and constructors.

```csharp
public abstract class Shape
{
    public abstract double GetArea();
    public virtual double GetPerimeter() => 0;
}

public class Rectangle : Shape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public override double GetArea() => Width * Height;
    public override double GetPerimeter() => 2 * (Width + Height);
}
```

| Feature | Abstraction | Abstract Class |
|---------|-------------|----------------|
| Nature | Design principle | Specific class type |
| Implementation | Via interfaces, abstract classes | Class with abstract/concrete methods |
| Purpose | Reduce complexity; define contracts | Shared behavior + enforced overrides |
| Instantiation | Not instantiated directly | Not instantiated directly |
| Members | Interfaces define contracts | Fields, properties, methods |

Abstraction is the *what* (hide complexity); an abstract class is one *how* (shared base with partial implementation).
