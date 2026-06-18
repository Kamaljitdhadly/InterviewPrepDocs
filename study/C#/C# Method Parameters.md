# C# Method Parameters

## Questions Covered

1. Difference between Pass by Value and Pass by Reference Parameters?
2. How to return more than one value from a method in C#?
3. What is "params" keyword? When to use params keyword in real applications?
4. What are optional parameters in a method?
5. What are named parameters in a method?

## Difference between Pass by Value and Pass by Reference Parameters?

C# passes parameters **by value** (copy) or **by reference** (alias to original). This controls whether method changes affect the caller's variables. Understanding the distinction is essential for predictable data flow — especially with value types, `ref`/`out`, and reference-type reassignment vs mutation.

### Pass by Value

A **copy** of the value is passed. Changes inside the method do not affect the original.

- **Value copy** — original variable unchanged.
- **Default for value types** — `int`, `float`, `char`, `bool`, structs.
- **Reference types** — the reference is copied; reassigning the parameter does not change the caller's reference (mutating the object still affects shared state).

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        int number = 10;
        ModifyValue(number);
        Console.WriteLine(number); // Output: 10
    }
    static void ModifyValue(int num)
    {
        num = 20; // Changes the local copy, not the original variable
    }
}
```

### Pass by Reference

A **reference** to the actual data is passed. Changes inside the method affect the original variable.

- **Operates on original data** — modifications reflect in the caller.
- **Reference types** — passed by reference by default (reference copy); use `ref`/`out` to pass value types by reference.
- **Mutability** — parameter changes update the caller's variable.

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        int number = 10;
        ModifyReference(ref number);
        Console.WriteLine(number); // Output: 20
    }
    static void ModifyReference(ref int num)
    {
        num = 20; // Changes the original variable
    }
}
```

### ref vs out

Both pass by reference; requirements differ:

- **`ref`** — caller must initialize before passing; method may read/write.
- **`out`** — caller need not initialize; method **must** assign before return.

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        int number = 10;
        ModifyValue(ref number);
        Console.WriteLine(number); // Output: 20

        int uninitialized;
        InitializeValue(out uninitialized);
        Console.WriteLine(uninitialized); // Output: 20
    }
    static void ModifyValue(ref int num) { num = 20; }
    static void InitializeValue(out int num) { num = 20; }
}
```

**Summary:** Value types pass by value by default; use `ref`/`out` for by-reference value types. Reference types copy the reference (both caller and callee can mutate the same object); `ref`/`out` pass an alias to the caller's variable itself, so reassignment inside the method updates the caller's binding.

## How to return more than one value from a method in C#?

Four common approaches:

### 1. Tuples

Return multiple values of different types; named elements improve readability.

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        var result = GetPersonInfo();
        Console.WriteLine($"Name: {result.Name}, Age: {result.Age}");
    }
    static (string Name, int Age) GetPersonInfo()
    {
        return ("John Doe", 30);
    }
}
```

### 2. out Parameters

Return extra values via reference parameters; must be assigned inside the method.

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        string name;
        int age;
        GetPersonInfo(out name, out age);
        Console.WriteLine($"Name: {name}, Age: {age}");
    }
    static void GetPersonInfo(out string name, out int age)
    {
        name = "Jane Doe";
        age = 25;
    }
}
```

### 3. Custom Types (class or struct)

Encapsulate values in a class or struct for named properties and richer behavior.

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        var personInfo = GetPersonInfo();
        Console.WriteLine($"Name: {personInfo.Name}, Age: {personInfo.Age}");
    }
    static Person GetPersonInfo()
    {
        return new Person { Name = "Alice Smith", Age = 28 };
    }
}
class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
}
```

```csharp
struct Person
{
    public string Name { get; set; }
    public int Age { get; set; }
}
```

- **Class** — reference type; heap-allocated.
- **Struct** — value type; stack-allocated (when not boxed).

### 4. Anonymous Types

Useful in LINQ and local scenarios; limited scope (type inferred at compile site).

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        var personInfo = GetPersonInfo();
        Console.WriteLine($"Name: {personInfo.Name}, Age: {personInfo.Age}");
    }
    static dynamic GetPersonInfo()
    {
        return new { Name = "Bob Johnson", Age = 40 };
    }
}
```

**Choose by complexity:**

- **Tuples** — quick, lightweight multiple returns without defining a type.
- **out parameters** — when the method must assign values the caller reads afterward (e.g., `TryParse` pattern).
- **Custom types** — reusable, named models with validation or behavior.
- **Anonymous types** — LINQ projections and local-only shapes; not ideal as public API return types.

## What is "params" keyword? When to use params keyword in real applications?

`params` lets a method accept a **variable number** of arguments of one type. The compiler wraps them in an array.

**Rules:**

- Only **one** `params` parameter per method.
- Must be the **last** parameter.

```csharp
public void MethodName(params Type[] parameters) { }
```

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        PrintNumbers(1, 2, 3, 4, 5);
        PrintNumbers(10, 20);
        PrintNumbers(); // zero arguments OK
    }
    static void PrintNumbers(params int[] numbers)
    {
        foreach (int number in numbers)
            Console.WriteLine(number);
    }
}
```

**Real use cases:** logging (`params object[]`), `string.Format`-style APIs, aggregation helpers (`Sum(params int[] values)`), flexible argument lists without forcing callers to allocate arrays. Callers can pass zero, one, or many arguments naturally.

## What are optional parameters in a method?

Optional parameters have **default values** in the signature. Omitted arguments use those defaults.

**Rules:**

- Defaults assigned in the method signature.
- Optional parameters follow all **required** parameters.
- Reduces overload proliferation.

```csharp
public void MethodName(int requiredParam, int optionalParam1 = defaultValue1, string optionalParam2 = defaultValue2) { }
```

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        PrintMessage("Hello");
        PrintMessage("Hello", "World");
        PrintMessage("Hello", "World", 5);
    }
    static void PrintMessage(string message, string suffix = "!", int repeatCount = 1)
    {
        for (int i = 0; i < repeatCount; i++)
            Console.WriteLine(message + suffix);
    }
}
```

**Usage scenarios:**

```csharp
// Without optional parameters — two overloads
void LogMessage(string message) { }
void LogMessage(string message, int severity) { }
// With optional parameters — one method
void LogMessage(string message, int severity = 0) { }

void SendEmail(string recipient, string subject = "No Subject", string body = "No Content") { }
```

**Limitations:** optional params after required only; if combined with `params`, `params` must be last. Default values are baked in at compile time — changing them requires recompilation of callers.

## What are named parameters in a method?

Named parameters specify arguments **by parameter name** at the call site (`name: value`), improving readability and allowing out-of-order / selective optional arguments.

```csharp
MethodName(parameter1: value1, parameter2: value2);
```

```csharp
using System;
class Program
{
    static void Main(string[] args)
    {
        PrintMessage(message: "Hello", repeatCount: 3, suffix: "!");
    }
    static void PrintMessage(string message, int repeatCount = 1, string suffix = "!")
    {
        for (int i = 0; i < repeatCount; i++)
            Console.WriteLine(message + suffix);
    }
}
```

**Usage scenarios:**

```csharp
// Positional — unclear meaning
ConfigureSettings("MyApp", true, 10);
// Named — self-documenting
ConfigureSettings(applicationName: "MyApp", isDebugMode: true, maxConnections: 10);

SendEmail(recipient: "user@example.com", subject: "Hello");
```

**Limitations:** positional arguments must come **before** named arguments; names apply at call site only, not in method definitions. Particularly valuable when a method has many optional parameters — you can set only the ones you care about without passing placeholders for skipped positions.
