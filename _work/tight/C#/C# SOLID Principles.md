# C# SOLID Principles

## Questions Covered

1. What are SOLID Principles? How they different from Design Patterns?
2. How SOLID Principles different from Design Patterns?
3. What is KISS (Keep It Simple, Stupid) principle?
4. What is DRY(Don't Repeat Yourself) principle?
5. What is YAGNI (You Aren't Gonna Need It) principle?
6. What is Separation of Concerns (SoC) principle?

## What are SOLID Principles? How they different from Design Patterns?

**Design principles** are guidelines for maintainable code. **SOLID** (Robert C. Martin) is five OOP principles for understandable, flexible, maintainable designs.

### S — Single Responsibility Principle (SRP)

A class should have **one reason to change** — one job.

**Violates SRP:**

```csharp
public class User
{
    public string Name { get; set; }
    public string Email { get; set; }
    public void Save() => Console.WriteLine("User saved.");
    public void SendEmail(string message) =>
        Console.WriteLine($"Email sent to {Email}: {message}");
    public void GenerateReport() => Console.WriteLine("User report generated.");
}
```

**Follows SRP:**

```csharp
public class User
{
    public string Name { get; set; }
    public string Email { get; set; }
}

public class UserRepository
{
    public void Save(User user) => Console.WriteLine("User saved.");
}

public class EmailService
{
    public void SendEmail(User user, string message) =>
        Console.WriteLine($"Email sent to {user.Email}: {message}");
}

public class UserReportGenerator
{
    public void GenerateReport(User user) =>
        Console.WriteLine("User report generated.");
}
```

### O — Open/Closed Principle (OCP)

Open for **extension**, closed for **modification**.

**Violates OCP** — adding shapes requires editing `CalculateArea`:

```csharp
public class Shape
{
    public enum ShapeType { Rectangle, Circle }
    public ShapeType Type { get; set; }
    public double Width { get; set; }
    public double Height { get; set; }

    public double CalculateArea() => Type switch
    {
        ShapeType.Rectangle => Width * Height,
        ShapeType.Circle => Math.PI * (Width / 2) * (Width / 2),
        _ => throw new NotImplementedException("Shape not supported")
    };
}
```

**Follows OCP** — new shapes via new classes:

```csharp
public interface IShape { double CalculateArea(); }

public class Rectangle : IShape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public double CalculateArea() => Width * Height;
}

public class Circle : IShape
{
    public double Radius { get; set; }
    public double CalculateArea() => Math.PI * Radius * Radius;
}

public class Triangle : IShape
{
    public double Base { get; set; }
    public double Height { get; set; }
    public double CalculateArea() => 0.5 * Base * Height;
}
```

### L — Liskov Substitution Principle (LSP)

Subtypes must be substitutable for their base types without breaking behavior.

**Violates LSP** — `Penguin` cannot fly:

```csharp
public class Bird
{
    public virtual void Fly() => Console.WriteLine("I can fly!");
}
public class Sparrow : Bird
{
    public override void Fly() => Console.WriteLine("Sparrow flying!");
}
public class Penguin : Bird
{
    public override void Fly() =>
        throw new NotImplementedException("Penguins cannot fly!");
}
```

**Follows LSP** — separate flying capability:

```csharp
public class Bird
{
    public virtual void Eat() => Console.WriteLine("Eating...");
}

public interface IFlyable { void Fly(); }

public class Sparrow : Bird, IFlyable
{
    public void Fly() => Console.WriteLine("Sparrow flying!");
}

public class Penguin : Bird { }

public class BirdWatcher
{
    public void WatchBird(Bird bird)
    {
        bird.Eat();
        if (bird is IFlyable flyable)
            flyable.Fly();
    }
}
```

### I — Interface Segregation Principle (ISP)

Clients should not depend on methods they do not use — prefer small, focused interfaces.

**Violates ISP:**

```csharp
public interface IMachine { void Print(); void Scan(); void Fax(); }

public class SimplePrinter : IMachine
{
    public void Print() => Console.WriteLine("Printing...");
    public void Scan() => throw new NotImplementedException();
    public void Fax() => throw new NotImplementedException();
}
```

**Follows ISP:**

```csharp
public interface IPrinter { void Print(); }
public interface IScanner { void Scan(); }
public interface IFax { void Fax(); }

public class MultiFunctionPrinter : IPrinter, IScanner, IFax
{
    public void Print() => Console.WriteLine("Printing...");
    public void Scan() => Console.WriteLine("Scanning...");
    public void Fax() => Console.WriteLine("Faxing...");
}

public class SimplePrinter : IPrinter
{
    public void Print() => Console.WriteLine("Printing...");
}
```

### D — Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules; both depend on **abstractions**.

**Violates DIP** — `Notification` tightly coupled to `SMS`:

```csharp
public class SMS
{
    public void SendMessage(string message) =>
        Console.WriteLine("Sending SMS: " + message);
}

public class Notification
{
    private SMS _sms = new SMS();
    public void Send(string message) => _sms.SendMessage(message);
}
```

**Follows DIP** — depend on `IMessageSender`:

```csharp
public interface IMessageSender
{
    void SendMessage(string message);
}

public class SMS : IMessageSender
{
    public void SendMessage(string message) =>
        Console.WriteLine("Sending SMS: " + message);
}

public class Email : IMessageSender
{
    public void SendMessage(string message) =>
        Console.WriteLine("Sending Email: " + message);
}

public class Notification
{
    private readonly IMessageSender _messageSender;
    public Notification(IMessageSender messageSender) =>
        _messageSender = messageSender;
    public void Send(string message) => _messageSender.SendMessage(message);
}
```

**SOLID at a glance:** SRP — one job; OCP — extend, don't modify; LSP — safe substitution; ISP — small interfaces; DIP — depend on abstractions.

## How SOLID Principles different from Design Patterns?

| Aspect | SOLID Principles | Design Patterns |
|--------|------------------|-----------------|
| Nature | Design guidelines / best practices | Proven solutions to recurring problems |
| Scope | General OOP structure | Specific problems (creation, behavior, structure) |
| Application | Philosophy for all OO design | Reusable templates (Singleton, Factory, Observer, Strategy, etc.) |

SOLID guides *how* to design; patterns provide *what* to implement for specific scenarios. They complement each other.

## What is KISS (Keep It Simple, Stupid) principle?

**KISS** — prefer simple, understandable solutions; avoid unnecessary complexity and over-engineering.

**Complex (violates KISS):**

```csharp
public class ShapeAreaCalculator
{
    public double CalculateArea(string shapeType, params double[] dimensions)
    {
        if (shapeType == "rectangle")
        {
            if (dimensions.Length != 2)
                throw new ArgumentException("Rectangle requires 2 dimensions.");
            return dimensions[0] * dimensions[1];
        }
        else if (shapeType == "circle")
        {
            if (dimensions.Length != 1)
                throw new ArgumentException("Circle requires 1 dimension.");
            return Math.PI * Math.Pow(dimensions[0], 2);
        }
        else if (shapeType == "triangle")
        {
            if (dimensions.Length != 2)
                throw new ArgumentException("Triangle requires 2 dimensions.");
            return 0.5 * dimensions[0] * dimensions[1];
        }
        throw new NotImplementedException("Shape type not supported.");
    }
}
```

**Simple (follows KISS):**

```csharp
public interface IShape { double CalculateArea(); }

public class Rectangle : IShape
{
    public double Width { get; set; }
    public double Height { get; set; }
    public double CalculateArea() => Width * Height;
}

public class Circle : IShape
{
    public double Radius { get; set; }
    public double CalculateArea() => Math.PI * Radius * Radius;
}

public class Triangle : IShape
{
    public double Base { get; set; }
    public double Height { get; set; }
    public double CalculateArea() => 0.5 * Base * Height;
}
```

## What is DRY(Don't Repeat Yourself) principle?

**DRY** — each piece of knowledge has a **single, authoritative representation**; avoid duplicated logic.

**Violates DRY** — repeated discount logic:

```csharp
public class Product
{
    public string Name { get; set; }
    public double Price { get; set; }
    public double Discount { get; set; }

    public double GetDiscountedPrice()
    {
        if (Name == "Electronics")
        {
            if (Discount > 0 && Discount < 1)
                return Price * (1 - Discount);
            return Price;
        }
        if (Name == "Clothing")
        {
            if (Discount > 0 && Discount < 1)
                return Price * (1 - Discount);
            return Price;
        }
        return Price;
    }
}
```

**Follows DRY:**

```csharp
public class Product
{
    public string Name { get; set; }
    public double Price { get; set; }
    public double Discount { get; set; }

    public double GetDiscountedPrice() => CalculateDiscountedPrice(Price, Discount);

    private double CalculateDiscountedPrice(double price, double discount)
    {
        if (discount > 0 && discount < 1)
            return price * (1 - discount);
        return price;
    }
}
```

## What is YAGNI (You Aren't Gonna Need It) principle?

**YAGNI** — implement only what is needed now; don't build speculative features.

**Violates YAGNI:**

```csharp
public class UserAccount
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string PreferredLanguage { get; set; } // Not needed yet
    public string Theme { get; set; }             // Not needed yet

    public void Save() => Console.WriteLine("User account saved.");
    public void LoadPreferences() =>
        Console.WriteLine("Loading user preferences...");
}
```

**Follows YAGNI:**

```csharp
public class UserAccount
{
    public string Username { get; set; }
    public string Password { get; set; }
    public void Save() => Console.WriteLine("User account saved.");
}
```

## What is Separation of Concerns (SoC) principle?

**SoC** — divide a system into distinct modules, each handling one concern, for modularity, maintainability, and reuse.

**Violates SoC** — business and presentation logic mixed:

```csharp
public class UserRegistration
{
    public void RegisterUser(string username, string password)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            Console.WriteLine("Username and password cannot be empty.");
            return;
        }
        Console.WriteLine("User registered successfully!");
        Console.WriteLine($"Welcome, {username}!");
    }
}
```

**Follows SoC:**

```csharp
public class UserRegistrationService
{
    public bool RegisterUser(string username, string password)
    {
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            return false;
        Console.WriteLine("User registered successfully!");
        return true;
    }
}

public class UserRegistrationUI
{
    private readonly UserRegistrationService _registrationService;

    public UserRegistrationUI(UserRegistrationService registrationService) =>
        _registrationService = registrationService;

    public void Register(string username, string password)
    {
        if (_registrationService.RegisterUser(username, password))
            Console.WriteLine($"Welcome, {username}!");
        else
            Console.WriteLine("Username and password cannot be empty.");
    }
}
```

Business logic (`UserRegistrationService`) is separated from presentation (`UserRegistrationUI`) with loose coupling via constructor injection.
