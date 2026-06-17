# C# Delegates and Events

## Questions Covered

1. What are Delegates in C#? When to use delegates in real applications?
2. What are Events in C#? When to use events in real applications?

## What are Delegates in C#? When to use delegates in real applications?

A **delegate** is a type-safe reference to a method with a matching signature and return type (similar to function pointers in C++, but secure). Delegates let you treat methods as first-class values — pass them as arguments, store them in fields, and invoke them dynamically. They underpin callbacks, LINQ (`Func<>`, `Action<>`), async patterns, and events.

**Key features:**

- **Type safety** — assigned method must match delegate signature.
- **Encapsulation** — pass methods as parameters.
- **Multicasting** — one delegate can invoke multiple methods (`+=`, `-=`).
- **Async support** — callback and async invocation.

### Declare, Assign, Invoke

```csharp
public delegate int MathOperation(int a, int b);

public class Calculator
{
    public int Add(int a, int b) => a + b;
    public int Subtract(int a, int b) => a - b;
}
```

```csharp
class Program
{
    static void Main(string[] args)
    {
        Calculator calculator = new Calculator();
        MathOperation operation = new MathOperation(calculator.Add);
        int result = operation(5, 3);
        Console.WriteLine("Addition Result: " + result); // 8

        operation = calculator.Subtract;
        result = operation(5, 3);
        Console.WriteLine("Subtraction Result: " + result); // 2
    }
}
```

### Multicasting

```csharp
class Program
{
    static void Main(string[] args)
    {
        Calculator calculator = new Calculator();
        MathOperation operation = calculator.Add;
        operation += calculator.Subtract;
        int result = operation(5, 3);
        Console.WriteLine("Final Result: " + result);
    }
}
```

**Real use cases:** callbacks, strategy/plug-in methods, LINQ predicates (`Func<>`, `Action<>`), decoupling caller from implementation, custom comparers, timer/thread callbacks. Prefer built-in generic delegates (`Action`, `Func`, `Predicate`) over custom delegate types when the signature is standard.

## What are Events in C#? When to use events in real applications?

An **event** is a publisher-subscriber notification mechanism built on delegates (observer pattern). When raised, all subscribed handlers run in sequence. Events wrap a delegate so external code can **subscribe** (`+=`) and **unsubscribe** (`-=`) but cannot **invoke** it — only the declaring class raises the event, preserving encapsulation.

**Key features:**

- **Encapsulation** — external code cannot invoke the event directly.
- **Publisher-subscriber** — publisher defines; subscribers register handlers.
- **Type safety** — handlers match the event's delegate signature.

### Declare and Raise

```csharp
public delegate void NotifyEventHandler(string message);

public class Process
{
    public event NotifyEventHandler ProcessCompleted;

    public void StartProcess()
    {
        Console.WriteLine("Process Started.");
        System.Threading.Thread.Sleep(2000);
        OnProcessCompleted("Process completed successfully.");
    }

    protected virtual void OnProcessCompleted(string message)
    {
        ProcessCompleted?.Invoke(message);
    }
}
```

### Subscribe

```csharp
public class EventSubscriber
{
    public void OnProcessCompletedHandler(string message)
    {
        Console.WriteLine("Subscriber received this message: " + message);
    }
}
```

```csharp
class Program
{
    static void Main(string[] args)
    {
        Process process = new Process();
        EventSubscriber subscriber = new EventSubscriber();
        process.ProcessCompleted += subscriber.OnProcessCompletedHandler;
        process.StartProcess();
    }
}
```

**Real use cases:** UI controls (`Click`, `TextChanged`), domain notifications (order placed, balance changed), logging/monitoring hooks, plugin architectures, decoupled service communication. Follow the pattern: public `event`, protected `OnXxx` raise method, `?.Invoke` for null-safe invocation.

### Delegates vs Events

| Aspect | Delegate | Event |
|--------|----------|-------|
| Definition | Type referencing method(s) with a specific signature | Encapsulated delegate for notifications |
| Purpose | Callbacks, dynamic method references | Publisher-subscriber pattern |
| Access control | Any holder can invoke | Only declaring class can raise |
| Invocation | Direct call like a method | Raised via protected helper inside publisher |
| Subscriber control | Add/remove methods on delegate instance | Add/remove handlers; cannot invoke externally |
| Common usage | LINQ, callbacks, anonymous methods | GUI, async notifications, state-change signaling |

### Delegate Example (direct invocation)

```csharp
public delegate void Notify(string message);

public class Program
{
    public static void Main(string[] args)
    {
        Notify notifyDelegate = ShowMessage;
        notifyDelegate("Hello via delegate!");
        notifyDelegate = ShowAnotherMessage;
        notifyDelegate("Hello again via delegate!");
    }
    public static void ShowMessage(string message) => Console.WriteLine(message);
    public static void ShowAnotherMessage(string message) => Console.WriteLine("Another: " + message);
}
```

### Event Example (encapsulated invocation)

```csharp
public delegate void Notify(string message);

public class Process
{
    public event Notify ProcessCompleted;
    public void StartProcess()
    {
        Console.WriteLine("Process Started.");
        System.Threading.Thread.Sleep(2000);
        OnProcessCompleted("Process completed successfully.");
    }
    protected virtual void OnProcessCompleted(string message)
    {
        ProcessCompleted?.Invoke(message);
    }
}

public class EventSubscriber
{
    public void OnProcessCompletedHandler(string message)
    {
        Console.WriteLine("Event received: " + message);
    }
}

class Program
{
    static void Main(string[] args)
    {
        Process process = new Process();
        EventSubscriber subscriber = new EventSubscriber();
        process.ProcessCompleted += subscriber.OnProcessCompletedHandler;
        process.StartProcess();
    }
}
```

**Summary:** Delegates are general-purpose method references; events add encapsulation so only the publisher raises notifications. Events are the standard pattern for signaling; delegates are the underlying mechanism.
