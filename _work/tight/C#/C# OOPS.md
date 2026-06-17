# C# OOPS

## Questions Covered

1. What is OOPS? What are the main concepts of OOPS?
2. What is Polymorphism and what are its types? When to use polymorphism?
3. What is the difference between Method Overriding and Method Hiding?

## What is OOPS? What are the main concepts of OOPS?

**Object-Oriented Programming (OOP)** is a paradigm centered on **objects** — entities that bundle data (attributes/properties) and behavior (methods). OOP promotes reusability, modularity, and clear structure. C# OOP rests on four pillars: **Abstraction**, **Encapsulation**, **Inheritance**, and **Polymorphism** (overriding and overloading).

### Abstraction

Hides implementation details; exposes only essential behavior.

```csharp
public abstract class Animal
{
    public abstract void MakeSound();
}

public class Dog : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Bark");
    }
}

public class Cat : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Meow");
    }
}

class Program
{
    static void Main(string[] args)
    {
        Animal dog = new Dog();
        dog.MakeSound(); // Output: Bark
        Animal cat = new Cat();
        cat.MakeSound(); // Output: Meow
    }
}
```

Client code calls `MakeSound()` without knowing implementation details.

### Encapsulation

Bundles data and methods; restricts direct access to internal state.

```csharp
public class BankAccount
{
    private decimal balance;

    public void Deposit(decimal amount)
    {
        if (amount > 0)
        {
            balance += amount;
        }
    }

    public void Withdraw(decimal amount)
    {
        if (amount > 0 && amount <= balance)
        {
            balance -= amount;
        }
    }

    public decimal GetBalance()
    {
        return balance;
    }
}

class Program
{
    static void Main(string[] args)
    {
        BankAccount account = new BankAccount();
        account.Deposit(100);
        account.Withdraw(50);
        Console.WriteLine("Balance: " + account.GetBalance()); // Output: Balance: 50
    }
}
```

`balance` is private — only modified through `Deposit`/`Withdraw`.

### Inheritance

Derived class reuses base class members.

```csharp
public class Vehicle
{
    public int Speed { get; set; }

    public void Drive()
    {
        Console.WriteLine("Driving at " + Speed + " km/h");
    }
}

public class Car : Vehicle
{
    public int NumberOfDoors { get; set; }

    public void Honk()
    {
        Console.WriteLine("Honking");
    }
}

class Program
{
    static void Main(string[] args)
    {
        Car car = new Car
        {
            Speed = 120,
            NumberOfDoors = 4
        };
        car.Drive(); // Output: Driving at 120 km/h
        car.Honk();  // Output: Honking
    }
}
```

### Polymorphism

Objects of different types treated through a common base type.

**Overriding** — derived class replaces base implementation:

```csharp
public class Vehicle
{
    public virtual void Drive()
    {
        Console.WriteLine("Vehicle is driving");
    }
}

public class Car : Vehicle
{
    public override void Drive()
    {
        Console.WriteLine("Car is driving");
    }
}

class Program
{
    static void Main(string[] args)
    {
        Vehicle myCar = new Car();
        myCar.Drive(); // Output: Car is driving
    }
}
```

**Overloading** — same method name, different signatures:

```csharp
public class Calculator
{
    public int Add(int a, int b)
    {
        return a + b;
    }

    public double Add(double a, double b)
    {
        return a + b;
    }
}

class Program
{
    static void Main(string[] args)
    {
        Calculator calc = new Calculator();
        Console.WriteLine(calc.Add(5, 10));     // Output: 15
        Console.WriteLine(calc.Add(5.5, 10.5)); // Output: 16.0
    }
}
```

## What is Polymorphism and what are its types? When to use polymorphism?

**Polymorphism** allows objects of different classes to be treated through a common base type, so the same operation behaves differently per actual object type. It improves flexibility, extensibility, and maintainability by letting code work with varied types through a unified interface.

**When to use:** apply static polymorphism (overloading) when the correct overload should be chosen at compile time based on arguments; apply dynamic polymorphism (overriding) when behavior must depend on the actual runtime type behind a base-class reference.

### Static (Compile-time) Polymorphism

Resolved at compile time via **method overloading** and **operator overloading**.

**Method overloading:**

```csharp
public class Calculator
{
    public int Add(int a, int b)
    {
        return a + b;
    }

    public int Add(int a, int b, int c)
    {
        return a + b + c;
    }

    public double Add(double a, double b)
    {
        return a + b;
    }
}

class Program
{
    static void Main(string[] args)
    {
        Calculator calc = new Calculator();
        Console.WriteLine(calc.Add(5, 10));       // Output: 15
        Console.WriteLine(calc.Add(5, 10, 15));   // Output: 30
        Console.WriteLine(calc.Add(5.5, 10.5));   // Output: 16.0
    }
}
```

**Operator overloading:**

```csharp
public class ComplexNumber
{
    public double Real { get; set; }
    public double Imaginary { get; set; }

    public ComplexNumber(double real, double imaginary)
    {
        Real = real;
        Imaginary = imaginary;
    }

    public static ComplexNumber operator +(ComplexNumber c1, ComplexNumber c2)
    {
        return new ComplexNumber(c1.Real + c2.Real, c1.Imaginary + c2.Imaginary);
    }

    public override string ToString()
    {
        return $"{Real} + {Imaginary}i";
    }
}

class Program
{
    static void Main(string[] args)
    {
        ComplexNumber c1 = new ComplexNumber(1.0, 2.0);
        ComplexNumber c2 = new ComplexNumber(3.0, 4.0);
        ComplexNumber sum = c1 + c2;
        Console.WriteLine(sum); // Output: 4 + 6i
    }
}
```

### Dynamic (Run-time) Polymorphism

Resolved at runtime via **method overriding** (`virtual`/`override`).

```csharp
public class Animal
{
    public virtual void MakeSound()
    {
        Console.WriteLine("Animal sound");
    }
}

public class Dog : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Bark");
    }
}

public class Cat : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Meow");
    }
}

class Program
{
    static void Main(string[] args)
    {
        Animal myDog = new Dog();
        Animal myCat = new Cat();
        myDog.MakeSound(); // Output: Bark
        myCat.MakeSound(); // Output: Meow
    }
}
```

| Feature | Static Polymorphism | Dynamic Polymorphism |
|---------|---------------------|----------------------|
| Resolution | Compile-time | Run-time |
| Binding | Early (overloading, operator overloading) | Late (overriding) |
| Flexibility | Less — fixed at compile time | More — based on actual object type |

## What is the difference between Method Overriding and Method Hiding?

Both let a derived class redefine a base method, but resolution differs.

| Feature | Method Overriding | Method Hiding |
|---------|-------------------|---------------|
| Keywords | `virtual`/`abstract` in base, `override` in derived | `new` in derived |
| Resolution | Runtime (late binding) | Compile-time (early binding) |
| Polymorphism | Yes — base ref calls derived method | No — base ref calls base method |
| Use case | Replace base behavior polymorphically | New implementation without replacing base via base ref |

**Method overriding** — `virtual` + `override`; base reference calls derived implementation:

```csharp
public class BaseClass
{
    public virtual void Display()
    {
        Console.WriteLine("BaseClass Display");
    }
}

public class DerivedClass : BaseClass
{
    public override void Display()
    {
        Console.WriteLine("DerivedClass Display");
    }
}

class Program
{
    static void Main()
    {
        BaseClass obj = new DerivedClass();
        obj.Display(); // Output: DerivedClass Display
    }
}
```

**Method hiding** — `new` hides base method; base reference calls base implementation:

```csharp
public class BaseClass
{
    public void Display()
    {
        Console.WriteLine("BaseClass Display");
    }
}

public class DerivedClass : BaseClass
{
    public new void Display()
    {
        Console.WriteLine("DerivedClass Display");
    }
}

class Program
{
    static void Main()
    {
        BaseClass obj = new DerivedClass();
        obj.Display(); // Output: BaseClass Display

        DerivedClass derivedObj = new DerivedClass();
        derivedObj.Display(); // Output: DerivedClass Display
    }
}
```

---

## Related Topics

- **C# Abstract & Interface** (`C#/`)
- **C# Design Pattern** (`C#/`)
