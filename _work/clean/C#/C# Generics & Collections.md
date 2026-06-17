# C# Generics & Collections

## Questions Covered

1. Explain Generics in C#? When and why to use them?
2. What are Collections in C# and what are their types?

 Explain Generics in C#? When and why to use them?

**Generics** in C# provide a way to define classes, interfaces, and methods with a placeholder for the data type. This allows you to create type-safe and reusable code that can work with any data type without losing the benefits of type checking and performance.

### Benefits of Generics

1.  **Type Safety**: Generics ensure that operations on data are type-safe, reducing runtime errors due to invalid type casts.

2.  **Code Reusability**: You can create a single class or method that works with different types without duplicating code.

3.  **Performance**: Generics avoid the overhead of boxing and unboxing operations when using value types (e.g., int, double), which can improve performance.

### Generic Classes

A **generic class** allows you to define a class with a type parameter. This type parameter can be used throughout the class to define the type of data it will store or work with.

### Example: Generic Class

```csharp
public class Box<T>
{
private T _content;
// Method to pack an item into the box
public void Pack(T item)
{
_content = item;
}
// Method to unpack the item from the box
public T Unpack()
{
return _content;
}
}
class Program
{
static void Main(string[] args)
{
// Create a Box for int
Box<int> intBox = new Box<int>();
intBox.Pack(123);
Console.WriteLine(intBox.Unpack()); // Output: 123
// Create a Box for string
Box<string> strBox = new Box<string>();
strBox.Pack("Hello Generics");
Console.WriteLine(strBox.Unpack()); // Output: Hello Generics
}
}
```

- **Explanation**: The Box<T> class can store and return an item of any type. The type parameter T is specified when creating an instance of Box.

### Generic Methods

A **generic method** allows you to define a method with a type parameter. This allows the method to operate on different data types without needing multiple implementations.

### Example: Generic Method

```csharp
public class Utility
{
// Generic method to swap two items
public static void Swap<T>(ref T a, ref T b)
{
T temp = a;
a = b;
b = temp;
}
}
class Program
{
static void Main(string[] args)
{
int x = 1, y = 2;
Console.WriteLine($"Before swap: x = {x}, y = {y}");
Utility.Swap(ref x, ref y);
Console.WriteLine($"After swap: x = {x}, y = {y}");
string a = "Hello", b = "World";
Console.WriteLine($"Before swap: a = {a}, b = {b}");
Utility.Swap(ref a, ref b);
Console.WriteLine($"After swap: a = {a}, b = {b}");
}
}
```

- **Explanation**: The Swap<T> method can swap two values of any type, demonstrated here with both integers and strings.

### Generic Interfaces

A **generic interface** allows you to define an interface with a type parameter. Implementations of this interface can then specify the type they work with.

### Example: Generic Interface

```csharp
public interface IRepository<T>
{
void Add(T item);
T Get(int id);
}
public class Repository<T> : IRepository<T>
{
private readonly Dictionary<int, T> _storage = new Dictionary<int, T>();
private int _nextId = 1;
public void Add(T item)
{
_storage[_nextId++] = item;
}
public T Get(int id)
{
return _storage.ContainsKey(id) ? _storage[id] : default;
}
}
class Program
{
static void Main(string[] args)
{
IRepository<string> stringRepo = new Repository<string>();
stringRepo.Add("Hello");
Console.WriteLine(stringRepo.Get(1)); // Output: Hello
IRepository<int> intRepo = new Repository<int>();
intRepo.Add(123);
Console.WriteLine(intRepo.Get(1)); // Output: 123
}
}
```

- **Explanation**: The IRepository<T> interface and Repository<T> class use a type parameter T. This allows the repository to handle different data types in a type-safe manner.

### Generic Constraints

**Generic constraints** allow you to impose restrictions on the types that can be used with a generic class or method. This ensures that the type parameter meets certain criteria.

### Example: Generic Constraints

```csharp
public class Calculator<T> where T : struct, IComparable<T>
{
public T Max(T a, T b)
{
return a.CompareTo(b) >= 0 ? a : b;
}
}
class Program
{
static void Main(string[] args)
{
Calculator<int> intCalculator = new Calculator<int>();
Console.WriteLine(intCalculator.Max(5, 10)); // Output: 10
Calculator<double> doubleCalculator = new Calculator<double>();
Console.WriteLine(doubleCalculator.Max(5.5, 10.1)); // Output: 10.1
}
}
```

- **Explanation**: The Calculator<T> class has a constraint that T must be a value type (struct) and implement IComparable<T>. This ensures that the Max method can safely compare values of type T.

### Summary

- **Generic Classes**: Allow the creation of classes with type parameters, enhancing code reuse and type safety.

- **Generic Methods**: Provide methods that can operate on different types, avoiding the need for multiple implementations.

- **Generic Interfaces**: Enable defining interfaces with type parameters for flexibility in implementation.

- **Generic Constraints**: Restrict the types that can be used with a generic class or method, ensuring they meet specific requirements.

Generics in C# help you write more versatile, maintainable, and type-safe code, which is especially useful in collections and utility classes.

What are Collections in C# and what are their types?

collections are classes that store and manage groups of related objects. They provide various functionalities to store, retrieve, and manipulate data. Collections are essential for handling and processing data in a structured way.

### Types of Collections in C#

1.  **Arrays**

2.  **ArrayList**

3.  **`List<`T>**

4.  **`Dictionary<`TKey, TValue>**

5.  **Queue<T>**

6.  **Stack<T>**

7.  **HashSet<T>**

8.  **SortedList<TKey, TValue>**

9.  **LinkedList<T>**

10. **ObservableCollection<T>**

### Examples and Usage

### 1. Arrays

An **array** is a fixed-size, zero-based collection of elements of the same type. It is suitable for situations where the size of the collection is known and fixed.

### Example

```csharp
using System;
class Program
{
static void Main(string[] args)
{
int[] numbers = { 1, 2, 3, 4, 5 };
foreach (int number in numbers)
{
Console.WriteLine(number);
}
}
}
```

### 2. ArrayList

An **ArrayList** is a non-generic collection that can store objects of any type. It is dynamic in size and allows for adding and removing elements.

### Example

```csharp
using System;
using System.Collections;
class Program
{
static void Main(string[] args)
{
ArrayList list = new ArrayList();
list.Add(1);
list.Add("Hello");
list.Add(3.14);
foreach (var item in list)
{
Console.WriteLine(item);
}
}
}
```

### 3. List<T>

A **`List<`T>** is a generic collection that represents a dynamically sized list of objects of a specific type. It provides type safety and performance benefits over ArrayList.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
List<string> fruits = new List<string> { "Apple", "Banana", "Cherry" };
fruits.Add("Date");
fruits.Remove("Banana");
foreach (string fruit in fruits)
{
Console.WriteLine(fruit);
}
}
}
```

### 4. Dictionary<TKey, TValue>

A **`Dictionary<`TKey, TValue>** is a generic collection that represents a collection of key-value pairs. It allows efficient lookups by key.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
Dictionary<string, int> ageDict = new Dictionary<string, int>
{
{ "Alice", 30 },
{ "Bob", 25 },
{ "Charlie", 35 }
};
foreach (var kvp in ageDict)
{
Console.WriteLine($"{kvp.Key}: {kvp.Value}");
}
}
}
```

### 5. Queue<T>

A **Queue<T>** is a generic collection that represents a first-in, first-out (FIFO) collection of objects. It is used for scenarios where you need to process items in the order they are added.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
Queue<string> queue = new Queue<string>();
queue.Enqueue("First");
queue.Enqueue("Second");
queue.Enqueue("Third");
while (queue.Count > 0)
{
Console.WriteLine(queue.Dequeue());
}
}
}
```

### 6. Stack<T>

A **Stack<T>** is a generic collection that represents a last-in, first-out (LIFO) collection of objects. It is used for scenarios where you need to process items in reverse order of their addition.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
Stack<string> stack = new Stack<string>();
stack.Push("First");
stack.Push("Second");
stack.Push("Third");
while (stack.Count > 0)
{
Console.WriteLine(stack.Pop());
}
}
}
```

### 7. HashSet<T>

A **HashSet<T>** is a generic collection that represents a set of unique objects. It does not allow duplicate elements and provides fast lookup.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
HashSet<string> set = new HashSet<string> { "Apple", "Banana", "Cherry" };
set.Add("Date");
```

set.Add("Apple"); // Duplicate, will not be added

```csharp
foreach (string fruit in set)
{
Console.WriteLine(fruit);
}
}
}
```

### 8. SortedList<TKey, TValue>

A **SortedList<TKey, TValue>** is a generic collection that represents a collection of key-value pairs sorted by the key. It provides fast lookups and maintains sorted order.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
SortedList<int, string> sortedList = new SortedList<int, string>
{
{ 2, "Two" },
{ 1, "One" },
{ 3, "Three" }
};
foreach (var kvp in sortedList)
{
Console.WriteLine($"{kvp.Key}: {kvp.Value}");
}
}
}
```

### 9. LinkedList<T>

A **LinkedList<T>** is a generic collection that represents a doubly linked list. It provides efficient insertions and deletions.

### Example

```csharp
using System;
using System.Collections.Generic;
class Program
{
static void Main(string[] args)
{
LinkedList<string> linkedList = new LinkedList<string>();
linkedList.AddLast("First");
linkedList.AddLast("Second");
linkedList.AddLast("Third");
foreach (string item in linkedList)
{
Console.WriteLine(item);
}
}
}
```

### 10. ObservableCollection<T>

An **ObservableCollection<T>** is a collection that provides notifications when items are added, removed, or when the whole list is refreshed. It is useful for data binding in UI applications.

### Example

```csharp
using System;
using System.Collections.ObjectModel;
class Program
{
static void Main(string[] args)
{
ObservableCollection<string> observableCollection = new ObservableCollection<string>
{
"Item1",
"Item2",
```

"Item3"

```csharp
};
observableCollection.CollectionChanged += (sender, e) =>
{
Console.WriteLine($"Collection changed: {e.Action}");
};
observableCollection.Add("Item4");
observableCollection.Remove("Item2");
}
}
```

### Summary

- **Arrays**: Fixed-size, type-safe collections.

- **ArrayList**: Non-generic, dynamic-size collections.

- **`List<`T>**: Generic, dynamic-size collections with type safety.

- **`Dictionary<`TKey, TValue>**: Generic collections of key-value pairs.

- **Queue<T>**: FIFO collections.

- **Stack<T>**: LIFO collections.

- **HashSet<T>**: Collections of unique elements.

- **SortedList<TKey, TValue>**: Sorted collections of key-value pairs.

- **LinkedList<T>**: Doubly linked lists for efficient insertions and deletions.

- **ObservableCollection<T>**: Collections with change notifications, useful for UI data binding.

Understanding these collection types helps in choosing the right data structure based on the requirements of your application.
