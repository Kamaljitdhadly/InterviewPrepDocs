# C# Basics

## Questions Covered

1. What is the default access modifier class?
2. What is the default access modifier interface?
3. What is Property?
4. What is Boxing and Unboxing? Where to use them in real applications?
5. What is the difference between "String" and "StringBuilder"
6. What is String Interpolation in C#
7. What is the difference between Finally and Finalize?
8. What is the difference between "throw ex" and "throw"?
9. What are the types of constructor?
10. What is Static constructor? What is the use in real applications?
11. What is Private constructor? What is the use?
12. What is Constructor overloading?
13. What is Destructor?
14. If base & child both class have constructors, which will be called first?
15. What is "this" keyword in C#? When to use it in real application?
16. What is the purpose of "using" keyword in C#?
17. What is the difference between "is" and "as" operators?
18. What is the difference between "Readonly" and "Constant" variables?
19. What is "Static" class? When to use it?
20. What is the difference between "var" and "dynamic" in C#?
21. What is the use of Yield keyword in C#?
22. Common Use Cases for Enums

## What is the default access modifier class?

**Access specifiers** (access modifiers) define visibility of classes, methods, properties, and other members — both within the same class and from other classes/assemblies.

| Modifier | Accessibility |
|----------|---------------|
| `public` | Any code in same or referencing assembly |
| `private` | Containing class only |
| `protected` | Containing class and derived classes |
| `internal` | Same assembly only |
| `protected internal` | Same assembly or derived classes |
| `private protected` | Derived classes in same assembly only |

```csharp
public class MyClass
{
    public int MyProperty { get; set; }
    public void MyMethod()
    {
        // Method code here
    }
}
```

```csharp
public class MyClass
{
    private int myField;
    private void MyMethod()
    {
        // Method code here
    }
}
```

```csharp
public class BaseClass
{
    protected int myField;
    protected void MyMethod()
    {
        // Method code here
    }
}
public class DerivedClass : BaseClass
{
    public void AnotherMethod()
    {
        myField = 10; // Accessible due to protected access
    }
}
```

```csharp
internal class MyClass
{
    internal int MyProperty { get; set; }
    internal void MyMethod()
    {
        // Method code here
    }
}
```

```csharp
public class MyClass
{
    protected internal int MyProperty { get; set; }
    protected internal void MyMethod()
    {
        // Method code here
    }
}
```

```csharp
public class MyClass
{
    private protected int MyProperty { get; set; }
    private protected void MyMethod()
    {
        // Method code here
    }
}
```

**Defaults by context:**

| Context | Default | Meaning |
|---------|---------|---------|
| Top-level class | `internal` | Same assembly only |
| Class members | `private` | Containing class only |
| Nested class | `private` | Containing class only |

```csharp
class MyClass // Default is internal
{
    // Class members
}

public class MyClass
{
    int myField; // Default is private
    void MyMethod() // Default is private
    {
        // Method code here
    }
}

public class OuterClass
{
    class NestedClass // Default is private
    {
        // Nested class members
    }
}
```

## What is the default access modifier interface?

All interface members are **implicitly `public`**. You cannot use other access modifiers on interface members; doing so causes a compile error. Implementing types must provide public implementations.

```csharp
public interface IMyInterface
{
    // All members are implicitly public
    void MyMethod(); // Equivalent to "public void MyMethod();"
    int MyProperty { get; set; } // Equivalent to "public int MyProperty { get; set; }"
}
```

## What is Property?

A **property** is a class member that provides flexible read/write/compute access to a private field. It combines field-like syntax with method-like control via `get` and `set` accessors, maintaining encapsulation while exposing a clean public interface.

**Key features:** encapsulation of backing fields; `get`/`set` accessors; automatic properties (compiler-generated backing field); read-only (no `set`) and write-only (no `get`) variants.

**Basic property** — validation in setter:

```csharp
public class Person
{
    private string name;

    public string Name
    {
        get
        {
            return name;
        }
        set
        {
            if (!string.IsNullOrEmpty(value))
            {
                name = value;
            }
        }
    }
}
```

**Automatic property** — compiler generates backing field:

```csharp
public class Person
{
    public string Name { get; set; }
}
```

**Read-only** — no `set` accessor (set only in constructor or within class):

```csharp
public class Person
{
    public string Name { get; }
    public Person(string name)
    {
        Name = name;
    }
}
```

**Write-only** — no `get` accessor:

```csharp
public class Person
{
    private string password;
    public string Password
    {
        set { password = value; }
    }
}
```

## What is Boxing and Unboxing? Where to use them in real applications?

**Boxing** converts a value type (`int`, `float`, `struct`, etc.) to a reference type (`object`). The runtime allocates a heap object and copies the value into it. **Unboxing** extracts the value back via an explicit cast; the runtime verifies the boxed type matches.

```csharp
int num = 123; // Value type
object obj = num; // Boxing: num is boxed into an object

object obj = 123; // Boxing
int num = (int)obj; // Unboxing: obj is unboxed back to an int
```

**Performance:** boxing/unboxing involve heap allocation and copying — costly in hot paths. Prefer generic collections (`List<T>`, `Dictionary<TKey, TValue>`) that operate on value types without boxing.

**Real applications:**

1. **Pre-generic collections** — `ArrayList` stores `object`, requiring boxing for value types:

```csharp
ArrayList list = new ArrayList();
list.Add(10); // Boxing the int
int num = (int)list[0]; // Unboxing
```

2. **Non-generic APIs** accepting `object`:

```csharp
void Print(object obj)
{
    Console.WriteLine(obj);
}
int number = 42;
Print(number); // Boxing the int to pass it as an object
```

3. **Reflection** — value types may be boxed when working with `object`:

```csharp
int num = 10;
Type type = num.GetType(); // Boxing occurs when calling a method like GetType
```

## What is the difference between "String" and "StringBuilder"

Both work with text, but differ in mutability, performance, and thread safety.

### Mutability

- **`String`** — immutable; any apparent modification creates a new object; the original is unchanged.
- **`StringBuilder`** — mutable; designed for repeated in-place modifications without creating new objects each time.

```csharp
string str = "Hello";
str += " World"; // Creates new string "Hello World"; old "Hello" discarded

StringBuilder sb = new StringBuilder("Hello");
sb.Append(" World"); // Modifies existing StringBuilder object
```

### Performance

- **`String`** — each modification allocates a new string and triggers GC pressure; fine for constants or infrequent changes.
- **`StringBuilder`** — maintains an internal buffer that grows as needed; far more efficient for loops and repeated concatenation.

### Memory and Thread Safety

- **`String`** — every change creates a new object; old objects await GC; inherently thread-safe due to immutability.
- **`StringBuilder`** — fewer allocations; not thread-safe — synchronize if multiple threads modify the same instance.

## What is String Interpolation in C#

**String interpolation** (C# 6.0+) embeds expressions in string literals using the `$` prefix and `{expression}` placeholders — more readable than `String.Format`.

**Syntax:** prefix string with `$`; expressions inside `{}` are evaluated at runtime.

```csharp
string name = "Alice";
int age = 30;
string greeting = $"Hello, my name is {name} and I am {age} years old.";
Console.WriteLine(greeting);
```

**Output:** `Hello, my name is Alice and I am 30 years old.`

Supports any valid C# expression (method calls, arithmetic, etc.) with compile-time type checking.

### Alternative Conditional Logic in C#

**Switch statement** — multiple discrete values for one variable:

```csharp
int dayOfWeek = 3;
switch (dayOfWeek)
{
    case 1:
        Console.WriteLine("Monday");
        break;
    case 2:
        Console.WriteLine("Tuesday");
        break;
    case 3:
        Console.WriteLine("Wednesday");
        break;
    default:
        Console.WriteLine("Unknown day");
        break;
}
```

**Switch expression (C# 8.0+):**

```csharp
int dayOfWeek = 3;
string dayName = dayOfWeek switch
{
    1 => "Monday",
    2 => "Tuesday",
    3 => "Wednesday",
    _ => "Unknown day"
};
Console.WriteLine(dayName);
```

**Ternary operator** — `condition ? valueIfTrue : valueIfFalse`:

```csharp
int age = 20;
string category = age >= 18 ? "Adult" : "Minor";
Console.WriteLine(category);
```

**Null-coalescing (`??`)** — default when nullable is null:

```csharp
string name = null;
string displayName = name ?? "Default Name";
Console.WriteLine(displayName);
```

**Pattern matching (C# 7.0+):**

```csharp
object obj = 42;
if (obj is int number)
{
    Console.WriteLine($"The number is {number}");
}
```

**Lookup tables:**

```csharp
var actions = new Dictionary<int, Action>
{
    { 1, () => Console.WriteLine("Action 1") },
    { 2, () => Console.WriteLine("Action 2") },
    { 3, () => Console.WriteLine("Action 3") }
};
int key = 2;
if (actions.ContainsKey(key))
{
    actions[key]();
}
else
{
    Console.WriteLine("Default action");
}
```

## What is the difference between Finally and Finalize?

`finally` and `Finalize` serve different cleanup roles in different contexts.

| Aspect | `finally` block | `Finalize` / destructor (`~ClassName()`) |
|--------|-----------------|------------------------------------------|
| Purpose | Cleanup after `try`/`catch` | Release unmanaged resources before GC |
| Timing | Immediately after `try`/`catch` | Non-deterministic — GC decides |
| Control | Explicit in code | Automatic; cannot call directly |
| Resource scope | Managed and unmanaged in exception handling | Primarily unmanaged resources |
| Best practice | Use for guaranteed cleanup in `try`/`catch` | Prefer `IDisposable`/`Dispose`; avoid overusing finalizers |

**`finally` block** — always executes after `try`/`catch`:

```csharp
try
{
    Console.WriteLine("In try block.");
}
catch (Exception ex)
{
    Console.WriteLine($"Caught exception: {ex.Message}");
}
finally
{
    Console.WriteLine("In finally block.");
}
```

**`Finalize` / destructor:**

```csharp
protected override void Finalize()
{
    try
    {
        // Cleanup code here
    }
    finally
    {
        base.Finalize();
    }
}

class ResourceHolder
{
    ~ResourceHolder()
    {
        Console.WriteLine("Finalizer called.");
    }
}
```

## What is the difference between "throw ex" and "throw"?

Both re-throw a caught exception, but **`throw ex`** resets the stack trace from the re-throw point; **`throw`** preserves the original stack trace.

**`throw ex`** — may lose original stack trace:

```csharp
try
{
    // Code that may throw an exception
}
catch (Exception ex)
{
    Console.WriteLine($"Caught exception: {ex.Message}");
    throw ex;
}
```

**`throw`** — preserves original stack trace (preferred):

```csharp
try
{
    // Code that may throw an exception
}
catch (Exception ex)
{
    Console.WriteLine($"Caught exception: {ex.Message}");
    throw;
}
```

**Best practice:** use `throw` unless you deliberately need to reset the stack trace.

## What are the types of constructor?

Constructors initialize object state when an instance is created. C# supports several types:

1. **Default** — no parameters; compiler provides one if none is defined.
2. **Parameterized** — accepts arguments to set fields/properties at creation time.
3. **Static** — initializes static members; called once automatically before first static access.
4. **Copy** — takes another instance of the same class and duplicates its state.

```csharp
public class Person
{
    public string Name;
    public int Age;

    // Default constructor
    public Person()
    {
        Name = "Unknown";
        Age = 0;
    }
}

public class Person
{
    public string Name;
    public int Age;

    // Parameterized constructor
    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }
}

public class Counter
{
    public static int Count;

    // Static constructor
    static Counter()
    {
        Count = 0;
    }
}

public class Person
{
    public string Name;
    public int Age;

    // Copy constructor
    public Person(Person other)
    {
        Name = other.Name;
        Age = other.Age;
    }
}
```

## What is Static constructor? What is the use in real applications?

A **static constructor** initializes static members or performs one-time class-level setup. It uses the `static` keyword, takes no parameters, has no access modifiers, cannot be called directly, and runs exactly once before any static member access or instance creation. The runtime synchronizes it automatically.

**Characteristics:** called on first class access; guaranteed single execution; runs before static methods/fields are used; keep logic simple to avoid initialization failures.

```csharp
static ClassName()
{
    // Initialization code
}
```

**Example:**

```csharp
public class Configuration
{
    public static string ConnectionString;

    static Configuration()
    {
        ConnectionString = "Data Source=server;Initial Catalog=database;Integrated Security=True";
        Console.WriteLine("Static constructor called.");
    }
}
```

**Real uses:** initialize static fields, one-time setup, lazy initialization:

```csharp
public class Logger
{
    public static string LogFilePath;

    static Logger()
    {
        LogFilePath = "/var/log/application.log";
    }
}

public class Cache
{
    private static Dictionary<string, object> _cache;

    static Cache()
    {
        _cache = new Dictionary<string, object>();
    }
}

public class DatabaseConnection
{
    private static SqlConnection _connection;

    static DatabaseConnection()
    {
        _connection = new SqlConnection("connection_string");
        _connection.Open();
    }
}
```

## What is Private constructor? What is the use?

A **private constructor** restricts instantiation to within the class itself. External code cannot call `new` on the class — useful for controlling object creation and enforcing design patterns.

**Common uses:** Singleton (single global instance), static utility classes (no instances needed), Factory pattern (creation via static factory methods), preventing unwanted default instantiation.

**Singleton:**

```csharp
public class Singleton
{
    private static Singleton _instance;

    private Singleton()
    {
        // Initialization code
    }

    public static Singleton Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new Singleton();
            }
            return _instance;
        }
    }
}
```

**Static/utility class** — prevent instantiation:

```csharp
public static class Utility
{
    private Utility()
    {
    }

    public static void PerformAction()
    {
        // Method implementation
    }
}
```

**Factory pattern:**

```csharp
public class Product
{
    public string Name { get; private set; }

    private Product(string name)
    {
        Name = name;
    }

    public static Product CreateProduct(string name)
    {
        return new Product(name);
    }
}
```

**Prevent default instantiation:**

```csharp
public class ConfigurationManager
{
    private static ConfigurationManager _instance;

    private ConfigurationManager()
    {
        // Initialization code
    }

    public static ConfigurationManager Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new ConfigurationManager();
            }
            return _instance;
        }
    }
}
```

## What is Constructor overloading?

**Constructor overloading** defines multiple constructors in one class, each with a unique parameter list (different count, types, or order). This lets callers initialize objects in different ways. If you define any constructor, you must explicitly add a parameterless one if you still need it.

```csharp
public class Rectangle
{
    public int Width { get; set; }
    public int Height { get; set; }

    public Rectangle()
    {
        Width = 0;
        Height = 0;
    }

    public Rectangle(int size)
    {
        Width = size;
        Height = size;
    }

    public Rectangle(int width, int height)
    {
        Width = width;
        Height = height;
    }
}
```

**Usage:**

```csharp
public class Program
{
    public static void Main()
    {
        Rectangle rect1 = new Rectangle();
        Console.WriteLine($"rect1 - Width: {rect1.Width}, Height: {rect1.Height}");

        Rectangle rect2 = new Rectangle(10);
        Console.WriteLine($"rect2 - Width: {rect2.Width}, Height: {rect2.Height}");

        Rectangle rect3 = new Rectangle(10, 20);
        Console.WriteLine($"rect3 - Width: {rect3.Width}, Height: {rect3.Height}");
    }
}
```

## What is Destructor?

A **destructor** (`~ClassName()`) is a special method for cleanup before the garbage collector reclaims an object. It has no parameters, no return type, cannot be called directly, cannot be overloaded, and runs at a non-deterministic time. If both base and derived classes have destructors, the derived destructor calls the base destructor automatically.

Destructors (finalizers) are suited for releasing unmanaged resources (file handles, native pointers). For managed resources, prefer the `IDisposable` pattern for deterministic cleanup.

```csharp
~ClassName()
{
    // Cleanup code
}
```

**Example:**

```csharp
public class FileManager
{
    private IntPtr fileHandle;

    public FileManager(string filePath)
    {
        fileHandle = OpenFile(filePath);
    }

    ~FileManager()
    {
        CloseFile(fileHandle);
    }

    private IntPtr OpenFile(string filePath)
    {
        return new IntPtr();
    }

    private void CloseFile(IntPtr handle)
    {
    }
}
```

**Prefer `IDisposable`** for deterministic cleanup:

```csharp
public class FileManager : IDisposable
{
    private IntPtr fileHandle;
    private bool disposed = false;

    public FileManager(string filePath)
    {
        fileHandle = OpenFile(filePath);
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!disposed)
        {
            if (disposing)
            {
                // Release managed resources
            }
            CloseFile(fileHandle);
            disposed = true;
        }
    }

    ~FileManager()
    {
        Dispose(false);
    }
}
```

## If base & child both class have constructors, which will be called first?

**Base class constructor runs first**, then the derived class constructor. With `base(...)`, the specified base constructor still runs before the derived body.

```csharp
public class BaseClass
{
    public BaseClass(string message)
    {
        Console.WriteLine("BaseClass Constructor: " + message);
    }
}

public class DerivedClass : BaseClass
{
    public DerivedClass() : base("Hello from BaseClass")
    {
        Console.WriteLine("DerivedClass Constructor");
    }
}

public class Program
{
    public static void Main()
    {
        DerivedClass obj = new DerivedClass();
    }
}
```

**Output:**

```
BaseClass Constructor: Hello from BaseClass
DerivedClass Constructor
```

## What is "this" keyword in C#? When to use it in real application?

`this` is a reference to the **current instance** of the class. It resolves ambiguity between members and parameters, enables constructor chaining, passes the current object to other methods, and supports fluent interfaces by returning `this`.

**When to use:** naming conflicts between fields and parameters; calling another constructor in the same class; passing `this` to event handlers or callbacks; returning `this` for method chaining.

**Disambiguate field vs parameter:**

```csharp
public class Person
{
    private string name;

    public Person(string name)
    {
        this.name = name;
    }
}
```

**Constructor chaining:**

```csharp
public class Person
{
    private string name;
    private int age;

    public Person(string name)
    {
        this.name = name;
    }

    public Person(string name, int age) : this(name)
    {
        this.age = age;
    }
}
```

**Pass current instance:**

```csharp
public class Button
{
    public void Click()
    {
        OnClick(this);
    }

    private void OnClick(Button sender)
    {
        Console.WriteLine("Button clicked!");
    }
}
```

**Fluent interface (return `this`):**

```csharp
public class Person
{
    private string name;
    private int age;

    public Person SetName(string name)
    {
        this.name = name;
        return this;
    }

    public Person SetAge(int age)
    {
        this.age = age;
        return this;
    }
}

var person = new Person().SetName("John").SetAge(30);
```

**Extension methods** — `this` as first parameter (different context):

```csharp
public static class StringExtensions
{
    public static string ToUpperFirstLetter(this string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        return char.ToUpper(input[0]) + input.Substring(1);
    }
}

string example = "hello";
string result = example.ToUpperFirstLetter(); // "Hello"
```

**Real application example:**

```csharp
public class Person
{
    private string name;
    private int age;

    public Person SetName(string name)
    {
        this.name = name;
        return this;
    }

    public Person SetAge(int age)
    {
        this.age = age;
        return this;
    }
}

var person = new Person()
    .SetName("Alice")
    .SetAge(25);
Console.WriteLine($"Name: {person.Name}, Age: {person.Age}");
```

## What is the purpose of "using" keyword in C#?

Two uses: **`using` directive** (import namespaces) and **`using` statement** (automatic `Dispose`).

**`using` directive:**

```csharp
using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        List<string> names = new List<string>();
        names.Add("Alice");
        names.Add("Bob");
        foreach (string name in names)
        {
            Console.WriteLine(name);
        }
    }
}
```

**`using` statement** — calls `Dispose` at end of scope, even on exception:

```csharp
using System;
using System.IO;

public class Program
{
    public static void Main()
    {
        string path = "example.txt";
        using (StreamWriter writer = new StreamWriter(path))
        {
            writer.WriteLine("Hello, World!");
        }
    }
}
```

**Equivalent without `using`:**

```csharp
StreamWriter writer = null;
try
{
    writer = new StreamWriter("example.txt");
    writer.WriteLine("Hello, World!");
}
finally
{
    if (writer != null)
    {
        writer.Dispose();
    }
}
```

## What is the difference between "is" and "as" operators?

| Operator | Purpose | On failure |
|----------|---------|------------|
| `is` | Type check (returns `bool`) | Returns `false` |
| `as` | Safe cast | Returns `null` (no exception) |

**`is`:**

```csharp
object obj = "Hello, World!";
if (obj is string)
{
    Console.WriteLine("The object is a string.");
}
else
{
    Console.WriteLine("The object is not a string.");
}
```

**`as`:**

```csharp
object obj = "Hello, World!";
string str = obj as string;
if (str != null)
{
    Console.WriteLine("The object was successfully cast to a string.");
}
else
{
    Console.WriteLine("The object is not a string.");
}
```

**Pattern matching with `is`:**

```csharp
object obj = "Hello, World!";
if (obj is string str)
{
    Console.WriteLine($"The object is a string: {str}");
}
else
{
    Console.WriteLine("The object is not a string.");
}
```

## What is the difference between "Readonly" and "Constant" variables?

| Feature | `const` | `readonly` |
|---------|---------|------------|
| Assignment | At declaration only | Declaration or constructor |
| When resolved | Compile-time | Runtime |
| Data types | Simple types (int, string, etc.) | Any type |
| Static | Implicitly static | Can be instance or `static` |
| Mutability | Fully immutable | Reference immutable; object state may change |

**`const`:**

```csharp
public class Circle
{
    public const double Pi = 3.14159;
}

public class Program
{
    public static void Main()
    {
        double radius = 5;
        double circumference = 2 * Circle.Pi * radius;
        Console.WriteLine("Circumference: " + circumference);
    }
}
```

**`readonly`:**

```csharp
public class Circle
{
    public readonly double Radius;
    public static readonly double Pi = 3.14159;

    public Circle(double radius)
    {
        Radius = radius;
    }

    public double Circumference()
    {
        return 2 * Pi * Radius;
    }
}

public class Program
{
    public static void Main()
    {
        Circle circle = new Circle(5);
        Console.WriteLine("Circumference: " + circle.Circumference());
    }
}
```

## What is "Static" class? When to use it?

A **static class** cannot be instantiated (`new` is invalid), cannot be inherited, cannot implement interfaces, and all members must be static. Static members belong to the type itself, shared across all uses.

**When to use:**

- **Utility/helper classes** — stateless operations (e.g., `Math`, `Console`, `Path` in .NET).
- **Global state/configuration** — shared settings accessed app-wide (use cautiously to avoid tight coupling).
- **Organizing constants** — related constants in one place (e.g., API URLs, file paths).
- **Singleton access** — often paired with a static property exposing a single instance.

## What is the difference between "var" and "dynamic" in C#?

Both declare variables without an explicit type on the left, but type handling differs fundamentally.

### var

- Type inferred at **compile time** from the initializer; once inferred, the type is fixed.
- **Statically typed** — compile-time checking; assigning a different type later is a compile error.
- Use when the type is obvious from the right-hand side or when the type name is long/complex.

### dynamic

- Type resolved at **runtime**; the variable can hold values of different types during execution.
- **Dynamically typed** — no compile-time type checks; errors surface at runtime.
- Use for COM interop, dynamic languages, reflection-heavy APIs, or when the type is unknown until runtime.

**`var`:**

```csharp
var number = 10; // Inferred as int
var name = "John"; // Inferred as string
// name = 5; // Compile error
```

**`dynamic`:**

```csharp
dynamic value = 10;
Console.WriteLine(value.GetType()); // System.Int32
value = "Hello";
Console.WriteLine(value.GetType()); // System.String
value++; // No compile-time error; may throw at runtime
```

**Comparison:**

```csharp
var list = new List<int>();
list.Add(1);

dynamic dynList = new List<int>();
dynList.Add(1);
dynList = "Now I'm a string";

int length = dynList.Length; // Compiles; may throw at runtime
```

| Feature | `var` | `dynamic` |
|---------|-------|-------------|
| Type determination | Compile-time | Runtime |
| Type checking | Compile-time | Runtime |
| Error detection | Compile-time | Runtime |
| Performance | Better | Slower (runtime resolution) |

## What is the use of Yield keyword in C#?

The `yield` keyword simplifies **iterator** methods returning `IEnumerable`, `IEnumerable<T>`, `IEnumerator`, or `IEnumerator<T>`. Instead of building and returning an entire collection, the method returns elements one at a time with minimal memory overhead.

**How it works:** calling a method with `yield` returns an iterator that tracks position. Each `MoveNext()` (e.g., in `foreach`) runs the method until the next `yield return`, returns that value, and resumes from that point on the next call. `yield break` stops iteration early.

**`yield return`:**

```csharp
using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        foreach (int number in GenerateNumbers(1, 5))
        {
            Console.WriteLine(number);
        }
    }

    public static IEnumerable<int> GenerateNumbers(int start, int count)
    {
        for (int i = start; i < start + count; i++)
        {
            yield return i;
        }
    }
}
```

**`yield break`:**

```csharp
using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        foreach (int number in GenerateNumbers(1, 10))
        {
            Console.WriteLine(number);
        }
    }

    public static IEnumerable<int> GenerateNumbers(int start, int count)
    {
        for (int i = start; i < start + count; i++)
        {
            if (i == 5)
            {
                yield break;
            }
            yield return i;
        }
    }
}
```

Prints 1–4 then stops.

**Use cases:** deferred/lazy sequences, simplified iterators, large datasets processed incrementally.

## Common Use Cases for Enums

1. **Representing states** — days, months, statuses (`Active`, `Inactive`, `Pending`).
2. **Flags** — bitwise combinations with `[Flags]`:

```csharp
[Flags]
public enum FileAccess
{
    Read = 1,
    Write = 2,
    Execute = 4
}

FileAccess access = FileAccess.Read | FileAccess.Write;
```

3. **Switch statements** — structured handling of enum values.

---

## Related Topics

- **C# OOPS** (`C#/`)
- **C# SOLID Principles** (`C#/`)
