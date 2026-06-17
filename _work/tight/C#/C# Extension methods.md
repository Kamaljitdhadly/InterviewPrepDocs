# C# Extension methods

## Questions Covered

1. What are extension Methods? When to use them?

## What are extension Methods? When to use them?

**Extension methods** add methods to existing types without modifying the original type or using inheritance — useful for built-in types, third-party libraries, or types you don't control.

**How they work:**

1. Defined as **static methods** in a **static class**.
2. First parameter uses the **`this`** modifier to specify the extended type.
3. Called as if they were instance methods.

**Syntax:**

```csharp
public static class ExtensionClass
{
    public static ReturnType ExtensionMethod(this Type typeParameter, otherParameters)
    {
        // Method implementation
    }
}
```

**Example — word count on `string`:**

```csharp
using System;

public static class StringExtensions
{
    public static int WordCount(this string str)
    {
        if (string.IsNullOrWhiteSpace(str))
            return 0;
        return str.Split(new[] { ' ', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }
}
```

```csharp
using System;

class Program
{
    static void Main(string[] args)
    {
        string sentence = "Hello world! This is an example.";
        int count = sentence.WordCount(); // Called like an instance method
        Console.WriteLine($"The number of words is: {count}");
    }
}
```

`sentence.WordCount()` is syntactic sugar for `StringExtensions.WordCount(sentence)`.

**Key points:**

- Must be in a **static class** with **static methods** (no instantiation needed).
- First parameter uses **`this`** to mark the extended type.
- Import the namespace with `using` to bring extension methods into scope.

**When to use:**

- Extend built-in or third-party types you can't modify.
- Build **fluent interfaces** for readable APIs.
- Group type-related helpers in a dedicated static class.

Extension methods enhance existing types without changing their definitions — keeping code modular and maintainable.
