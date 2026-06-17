# C# Generics & Collections

## Questions Covered

1. Explain Generics in C#? When and why to use them?
2. What are Collections in C# and what are their types?

## Explain Generics in C#? When and why to use them?

**Generics** let you define classes, interfaces, and methods with type placeholders (`T`) for type-safe, reusable code that works with any data type without boxing/unboxing overhead.

**Benefits:**

- **Type safety** — compile-time checks; fewer invalid casts at runtime
- **Code reuse** — one implementation for multiple types
- **Performance** — avoids boxing/unboxing for value types

**When/why:** Use generics for collections, repositories, utilities, and any API that should work across types while staying strongly typed.

### Generic Classes

```csharp
public class Box<T>
{
    private T _content;

    public void Pack(T item) => _content = item;
    public T Unpack() => _content;
}

// Usage
Box<int> intBox = new Box<int>();
intBox.Pack(123);
Console.WriteLine(intBox.Unpack()); // 123

Box<string> strBox = new Box<string>();
strBox.Pack("Hello Generics");
Console.WriteLine(strBox.Unpack()); // Hello Generics
```

### Generic Methods

```csharp
public class Utility
{
    public static void Swap<T>(ref T a, ref T b)
    {
        T temp = a;
        a = b;
        b = temp;
    }
}

// Usage
int x = 1, y = 2;
Utility.Swap(ref x, ref y);

string a = "Hello", b = "World";
Utility.Swap(ref a, ref b);
```

### Generic Interfaces

```csharp
public interface IRepository<T>
{
    void Add(T item);
    T Get(int id);
}

public class Repository<T> : IRepository<T>
{
    private readonly Dictionary<int, T> _storage = new();
    private int _nextId = 1;

    public void Add(T item) => _storage[_nextId++] = item;
    public T Get(int id) => _storage.ContainsKey(id) ? _storage[id] : default;
}

// Usage
IRepository<string> stringRepo = new Repository<string>();
stringRepo.Add("Hello");
Console.WriteLine(stringRepo.Get(1)); // Hello
```

### Generic Constraints

Restrict which types can substitute `T`:

```csharp
public class Calculator<T> where T : struct, IComparable<T>
{
    public T Max(T a, T b) => a.CompareTo(b) >= 0 ? a : b;
}

Calculator<int> calc = new Calculator<int>();
Console.WriteLine(calc.Max(5, 10)); // 10
```

Common constraints: `where T : class` · `where T : struct` · `where T : new()` · `where T : BaseType` · `where T : IInterface`

## What are Collections in C# and what are their types?

**Collections** store and manage groups of related objects with APIs for add, remove, lookup, and iteration.

| # | Type | Description |
|---|------|-------------|
| 1 | **Arrays** | Fixed-size, zero-based, same-type elements |
| 2 | **ArrayList** | Non-generic, dynamic, any object type |
| 3 | **List&lt;T&gt;** | Generic dynamic list; type-safe |
| 4 | **Dictionary&lt;TKey, TValue&gt;** | Key-value pairs; O(1) lookup by key |
| 5 | **Queue&lt;T&gt;** | FIFO |
| 6 | **Stack&lt;T&gt;** | LIFO |
| 7 | **HashSet&lt;T&gt;** | Unique elements; fast lookup |
| 8 | **SortedList&lt;TKey, TValue&gt;** | Key-value pairs sorted by key |
| 9 | **LinkedList&lt;T&gt;** | Doubly linked list; efficient insert/delete |
| 10 | **ObservableCollection&lt;T&gt;** | Change notifications for UI data binding |

### 1. Arrays

```csharp
int[] numbers = { 1, 2, 3, 4, 5 };
foreach (int number in numbers)
    Console.WriteLine(number);
```

### 2. ArrayList

```csharp
using System.Collections;

ArrayList list = new ArrayList();
list.Add(1);
list.Add("Hello");
list.Add(3.14);
foreach (var item in list)
    Console.WriteLine(item);
```

### 3. List&lt;T&gt;

```csharp
using System.Collections.Generic;

List<string> fruits = new List<string> { "Apple", "Banana", "Cherry" };
fruits.Add("Date");
fruits.Remove("Banana");
foreach (string fruit in fruits)
    Console.WriteLine(fruit);
```

### 4. Dictionary&lt;TKey, TValue&gt;

```csharp
Dictionary<string, int> ageDict = new Dictionary<string, int>
{
    { "Alice", 30 },
    { "Bob", 25 },
    { "Charlie", 35 }
};
foreach (var kvp in ageDict)
    Console.WriteLine($"{kvp.Key}: {kvp.Value}");
```

### 5. Queue&lt;T&gt;

```csharp
Queue<string> queue = new Queue<string>();
queue.Enqueue("First");
queue.Enqueue("Second");
queue.Enqueue("Third");
while (queue.Count > 0)
    Console.WriteLine(queue.Dequeue());
```

### 6. Stack&lt;T&gt;

```csharp
Stack<string> stack = new Stack<string>();
stack.Push("First");
stack.Push("Second");
stack.Push("Third");
while (stack.Count > 0)
    Console.WriteLine(stack.Pop());
```

### 7. HashSet&lt;T&gt;

```csharp
HashSet<string> set = new HashSet<string> { "Apple", "Banana", "Cherry" };
set.Add("Date");
set.Add("Apple"); // Duplicate — ignored
foreach (string fruit in set)
    Console.WriteLine(fruit);
```

### 8. SortedList&lt;TKey, TValue&gt;

```csharp
SortedList<int, string> sortedList = new SortedList<int, string>
{
    { 2, "Two" },
    { 1, "One" },
    { 3, "Three" }
};
foreach (var kvp in sortedList)
    Console.WriteLine($"{kvp.Key}: {kvp.Value}"); // Keys in sorted order
```

### 9. LinkedList&lt;T&gt;

```csharp
LinkedList<string> linkedList = new LinkedList<string>();
linkedList.AddLast("First");
linkedList.AddLast("Second");
linkedList.AddLast("Third");
foreach (string item in linkedList)
    Console.WriteLine(item);
```

### 10. ObservableCollection&lt;T&gt;

```csharp
using System.Collections.ObjectModel;

ObservableCollection<string> items = new ObservableCollection<string> { "Item1", "Item2", "Item3" };
items.CollectionChanged += (sender, e) =>
    Console.WriteLine($"Collection changed: {e.Action}");
items.Add("Item4");
items.Remove("Item2");
```

**Choosing a collection:** fixed size → Array · general-purpose list → `List<T>` · key lookup → `Dictionary` · uniqueness → `HashSet` · FIFO/LIFO → `Queue`/`Stack` · sorted keys → `SortedList` · UI binding → `ObservableCollection`
