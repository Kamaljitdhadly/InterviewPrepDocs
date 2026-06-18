1.  **What is the default access modifier class?**

2.  **What is the default access modifier interface?**

3.  **What is Property?**

4.  **What is Boxing and Unboxing? Where to use them in real applications?**

5.  **What is the difference between “String” and “StringBuilder”**

6.  **What is String Interpolation in C#**

7.  **What is the difference between Finally and Finalize?**

8.  **What is the difference between “throw ex” and “throw”?**

9.  **What are the types of constructor?**

10. **What is Static constructor? What is the use in real applications?**

11. **What is Private constructor? What is the use?**

12. **What is Constructor overloading?**

13. **What is Destructor?**

14. **If base & child both class have constructors, which will be called first?**

15. **What is “this” keyword in C#? When to use it in real application?**

16. **What is the purpose of “using” keyword in C#?**

17. **What is the difference between “is” and “as” operators?**

18. **What is the difference between “Readonly” and “Constant” variables?**

19. **What is “Static” class? When to use it?**

20. **What is the difference between “var” and “dynamic” in C#?**

21. **What is the use of Yield keyword in C#?**

22. **Common Use Cases for Enums**

Access specifiers, also known as access modifiers, are keywords in C# that define the accessibility or visibility of classes, methods, properties, and other members. They control how the members of a class can be accessed both within the same class and from other classes. C# provides several access specifiers, each with a different level of accessibility.

**Types of Access Specifiers in C#**

1.  **Public (public)**

    - **Accessibility**: The public access specifier allows a class or member to be accessible from any other code in the same assembly or another assembly that references it.

    - **Use Case**: Use public when you want a class, method, or property to be accessible from any other part of the application.

    - **Example**:

> public class MyClass
>
> {
>
> public int MyProperty { get; set; }
>
> public void MyMethod()
>
> {
>
> // Method code here
>
> }
>
> }

2.  **Private (private)**

    - **Accessibility**: The private access specifier restricts the visibility of a class or member to the containing class only. It cannot be accessed from outside the class.

    - **Use Case**: Use private when you want to encapsulate data and prevent access from outside the class.

    - **Example**:

> public class MyClass
>
> {
>
> private int myField;
>
> private void MyMethod()
>
> {
>
> // Method code here
>
> }
>
> }

3.  **Protected (protected)**

    - **Accessibility**: The protected access specifier allows access to a class member within the same class and by derived classes (subclasses). It is not accessible from outside these classes.

    - **Use Case**: Use protected when you want to allow derived classes to access and modify a base class's members.

    - **Example**:

> public class BaseClass
>
> {
>
> protected int myField;
>
> protected void MyMethod()
>
> {
>
> // Method code here
>
> }
>
> }
>
> public class DerivedClass : BaseClass
>
> {
>
> public void AnotherMethod()
>
> {
>
> myField = 10; // Accessible due to protected access
>
> }
>
> }

4.  **Internal (internal)**

    - **Accessibility**: The internal access specifier allows a class or member to be accessible within the same assembly but not from another assembly.

    - **Use Case**: Use internal when you want to expose members within an assembly but hide them from external assemblies.

    - **Example**:

> internal class MyClass
>
> {
>
> internal int MyProperty { get; set; }
>
> internal void MyMethod()
>
> {
>
> // Method code here
>
> }
>
> }

5.  **Protected Internal (protected internal)**

    - **Accessibility**: The protected internal access specifier allows access within the same assembly (like internal) and also allows derived classes to access the member (like protected).

    - **Use Case**: Use protected internal when you want to provide access to derived classes and classes within the same assembly.

    - **Example**:

> public class MyClass
>
> {
>
> protected internal int MyProperty { get; set; }
>
> protected internal void MyMethod()
>
> {
>
> // Method code here
>
> }
>
> }

6.  **Private Protected (private protected)**

    - **Accessibility**: The private protected access specifier allows access within the same class and derived classes, but only if they are within the same assembly.

    - **Use Case**: Use private protected when you want to restrict access to derived classes that are within the same assembly.

    - **Example**:

> public class MyClass
>
> {
>
> private protected int MyProperty { get; set; }
>
> private protected void MyMethod()
>
> {
>
> // Method code here
>
> }
>
> }

**Summary**

- **Public**: Accessible from anywhere.

- **Private**: Accessible only within the containing class.

- **Protected**: Accessible within the containing class and by derived classes.

- **Internal**: Accessible within the same assembly.

- **Protected Internal**: Accessible within the same assembly or by derived classes.

- **Private Protected**: Accessible within the containing class and derived classes within the same assembly.

What is the default access modifier class?

In C#, the default access modifier varies depending on the context in which it is used:

**1. Top-Level Classes**

For a top-level class (a class that is not nested within another class), the default access modifier is internal.

- **Default Access Modifier**: internal

- **Explanation**: If you declare a class without specifying an access modifier, it will be accessible within the same assembly but not from other assemblies.

class MyClass // Default is internal

{

// Class members

}

**2. Class Members (Fields, Methods, Properties, etc.)**

For members of a class, such as fields, methods, properties, constructors, etc., the default access modifier is private.

- **Default Access Modifier**: private

- **Explanation**: If you declare a member of a class without specifying an access modifier, it will only be accessible within the containing class.

public class MyClass

{

int myField; // Default is private

void MyMethod() // Default is private

{

// Method code here

}

}

**3. Nested Classes**

For classes that are nested within another class, the default access modifier is private.

- **Default Access Modifier**: private

- **Explanation**: If you declare a nested class without specifying an access modifier, it will be accessible only within the containing class.

public class OuterClass

{

class NestedClass // Default is private

{

// Nested class members

}

}

**Summary**

- **Top-Level Classes**: Default access modifier is internal.

- **Class Members**: Default access modifier is private.

- **Nested Classes**: Default access modifier is private.

What is the default access modifier interface?

In C#, the default access modifier for members of an interface is always public. This applies to all methods, properties, events, and indexers defined within the interface.

**Key Points:**

1.  **Public by Default**: All members of an interface are implicitly public, and you do not need to specify the public keyword. In fact, attempting to use any other access modifier (e.g., private, protected, internal) on an interface member will result in a compilation error.

2.  **No Access Modifiers Allowed**: You cannot explicitly specify an access modifier (like public, private, or protected) on interface members, as they are automatically considered public.

**Example:**

public interface IMyInterface

{

// All members are implicitly public

void MyMethod(); // This is equivalent to "public void MyMethod();"

int MyProperty { get; set; } // This is equivalent to "public int MyProperty { get; set; }"

}

**Summary**

- In an interface, all members are public by default.

- No other access modifiers are allowed on interface members.

- This ensures that any class or struct implementing the interface must provide a public implementation of the interface members.

What is Property?

In C#, a **property** is a member of a class that provides a flexible mechanism to read, write, or compute the value of a private field. Properties can be thought of as a combination of a field and methods (getters and setters) that control access to the data. They are typically used to encapsulate private fields and provide a controlled way to access and modify the data while maintaining encapsulation.

**Key Features of Properties:**

1.  **Encapsulation**: Properties help in encapsulating data. They allow you to hide the internal implementation of how data is stored while providing a public interface for accessing and modifying that data.

2.  **Get and Set Accessors**: Properties use two accessors:

    - **get Accessor**: Returns the value of the property. It is similar to a method that retrieves a value.

    - **set Accessor**: Assigns a value to the property. It is similar to a method that sets a value.

3.  **Automatic Properties**: C# allows you to define properties with automatic backing fields. This simplifies the code by automatically generating the backing field.

4.  **Read-Only and Write-Only Properties**: A property can be made read-only by omitting the set accessor, or write-only by omitting the get accessor.

**Example of a Basic Property**

public class Person

{

// Private field

private string name;

// Public property with a get and set accessor

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

**Explanation:**

- **Private Field**: The name field is private and cannot be accessed directly from outside the Person class.

- **Public Property (Name)**: The Name property provides a public way to get and set the value of the name field. The get accessor returns the value, and the set accessor allows the value to be set, with a validation check.

**Example of an Automatic Property**

public class Person

{

// Automatic property with a public get and set accessor

public string Name { get; set; }

}

**Explanation:**

- **Automatic Property**: The Name property is declared using automatic syntax. C# automatically creates a private backing field to store the value, and the get and set accessors are automatically implemented.

**Read-Only and Write-Only Properties**

- **Read-Only Property**:

> public class Person
>
> {
>
> public string Name { get; } // No set accessor, so this is a read-only property
>
> public Person(string name)
>
> {
>
> Name = name; // Value can only be set in the constructor or within the class
>
> }
>
> }

- **Write-Only Property**:

> public class Person
>
> {
>
> private string password;
>
> public string Password
>
> {
>
> set { password = value; } // No get accessor, so this is a write-only property
>
> }
>
> }

**Summary**

- **Properties** in C# provide a way to encapsulate data and control how it is accessed and modified.

- Properties consist of get and set accessors that allow reading and writing of values.

- You can create automatic properties, read-only properties, and write-only properties depending on your requirements.

- Properties maintain encapsulation while providing a clean interface for interacting with class data.

What is Boxing and Unboxing? Where to use them in real applications?

**Boxing** and **Unboxing** are concepts in C# related to converting value types to reference types and vice versa. They play an essential role in the runtime's handling of value types and reference types, particularly in scenarios involving collections, type conversion, and method calls.

### 1. **Boxing**

**Boxing** is the process of converting a value type (such as int, float, struct, etc.) to a reference type (object). When a value type is boxed, the runtime creates an object on the heap to hold the value, and the value is copied into that object.

#### How Boxing Works:

- A value type is wrapped inside a System.Object or any interface that the value type implements.

- Boxing allocates memory on the heap to store the value type.

#### Example of Boxing:

int num = 123; // Value type

object obj = num; // Boxing: num is boxed into an object

**Explanation**:

- In the example above, the integer num is a value type. When it is assigned to the object variable obj, the integer is boxed, meaning that a new object is created on the heap to hold the value 123.

### 2. **Unboxing**

**Unboxing** is the process of converting a reference type (an object) back into a value type. It involves extracting the value from the object and storing it in a value type variable.

#### How Unboxing Works:

- The reference type (object) is explicitly cast back to the original value type.

- The runtime checks that the object being unboxed is actually a boxed value of the correct value type.

#### Example of Unboxing:

object obj = 123; // Boxing

int num = (int)obj; // Unboxing: obj is unboxed back to an int

**Explanation**:

- Here, the obj contains a boxed integer. When it is cast back to int using (int)obj, the value is unboxed, and the integer 123 is retrieved.

### Key Points:

- **Boxing**: Converts a value type to a reference type (object). It involves copying the value type's data to a new object allocated on the heap.

- **Unboxing**: Converts a reference type back to a value type. It involves casting the reference type to the original value type and copying the value back to the stack.

### Performance Considerations:

- **Boxing and unboxing are expensive operations**: They involve memory allocation and copying, which can impact performance, especially in scenarios with frequent boxing and unboxing.

- **Use carefully**: In performance-critical applications, excessive boxing and unboxing should be avoided. Instead, consider using generic collections like List\<T\> or Dictionary\<TKey, TValue\> that operate on value types without boxing.

### Where to Use Boxing and Unboxing in Real Applications:

1.  **Collections Before Generics**:

    - Before the introduction of generics in C#, collections like ArrayList stored elements as objects, which required boxing and unboxing for value types.

    - Example:

> ArrayList list = new ArrayList();
>
> list.Add(10); // Boxing the int
>
> int num = (int)list\[0\]; // Unboxing the object back to int

2.  **Interoperability with Non-Generic APIs**:

    - When working with APIs or libraries that accept object types, you may need to box value types to pass them as parameters.

    - Example:

> void Print(object obj)
>
> {
>
> Console.WriteLine(obj);
>
> }
>
> int number = 42;
>
> Print(number); // Boxing the int to pass it as an object

3.  **Reflection**:

    - Reflection often returns or works with objects, requiring boxing when accessing value types.

    - Example:

> int num = 10;
>
> Type type = num.GetType(); // Boxing occurs when calling a method like GetType

### Summary:

- **Boxing**: Conversion of a value type to a reference type (object), which involves allocating memory on the heap.

- **Unboxing**: Conversion of a reference type (object) back to a value type, which requires an explicit cast.

- **Usage**: Although generics have reduced the need for boxing and unboxing, they are still necessary in certain situations, such as interacting with non-generic collections, APIs that work with object, and reflection. However, care should be taken to minimize unnecessary boxing and unboxing for performance reasons.

What is the difference between “String” and “StringBuilder”

The String and StringBuilder classes in C# are both used to work with strings, but they differ significantly in terms of mutability, performance, and use cases. Here's a breakdown of the key differences:

**1. Mutability**

- **String:**

  - **Immutable**: Once a String object is created, it cannot be modified. Any operation that appears to modify a string actually creates a new String object with the new value, leaving the original string unchanged.

  - **Example**:

> string str = "Hello";
>
> str += " World"; // This creates a new string "Hello World", and the old string "Hello" is discarded.

- **StringBuilder:**

  - **Mutable**: StringBuilder is designed for scenarios where you need to modify a string repeatedly. Unlike String, StringBuilder allows modification of the string content without creating a new object each time.

  - **Example**:

> StringBuilder sb = new StringBuilder("Hello");
>
> sb.Append(" World"); // This modifies the existing StringBuilder object, appending " World" to it.

**2. Performance**

- **String:**

  - **Less Efficient for Frequent Modifications**: Since String is immutable, every time you modify a string (e.g., concatenation, replacing characters), a new string is created. This results in additional memory allocation and garbage collection, making it less efficient for frequent modifications.

  - **Use Case**: Suitable for scenarios where the string value is not changed frequently, such as working with constants, short-lived strings, or when performance is not a concern.

- **StringBuilder:**

  - **More Efficient for Frequent Modifications**: StringBuilder is designed to handle frequent string modifications efficiently. It manages a buffer internally, which can grow as needed. This avoids the overhead of creating new strings and is therefore more performant in scenarios involving many modifications.

  - **Use Case**: Ideal for scenarios where you need to modify a string repeatedly, such as in loops, when building a long string through concatenation, or when performing multiple string operations.

**3. Memory Management**

- **String:**

  - **Memory Allocation**: Every modification creates a new string object, leading to increased memory usage, especially in scenarios with frequent modifications.

  - **Garbage Collection**: The old string objects need to be garbage collected, which can add overhead in memory management.

- **StringBuilder:**

  - **Memory Allocation**: StringBuilder allocates a buffer and resizes it as needed. It avoids creating multiple objects for every modification, resulting in better memory usage.

  - **Garbage Collection**: Fewer objects are created, which reduces the pressure on the garbage collector.

**4. Thread Safety**

- **String:**

  - **Thread-Safe**: Since String is immutable, it is inherently thread-safe. Multiple threads can read a String object simultaneously without any risk of data corruption.

- **StringBuilder:**

  - **Not Thread-Safe**: StringBuilder is mutable and not thread-safe. If multiple threads need to modify the same StringBuilder instance, you must implement your own synchronization to avoid data corruption.

**Summary**

- **String**: Immutable, better for scenarios with few modifications, and inherently thread-safe.

- **StringBuilder**: Mutable, better for scenarios with frequent modifications, more efficient in terms of performance and memory management, but not thread-safe.

**What is String Interpolation in C#**

**String Interpolation** in C# is a feature that allows you to embed expressions directly within string literals, making it easier and more readable to create formatted strings. Introduced in C# 6.0, string interpolation provides a more convenient and concise syntax compared to traditional string formatting methods like String.Format.

**Syntax**

To use string interpolation, you prefix the string with the \$ symbol. Inside the string, you can include expressions within curly braces {}. These expressions are evaluated, and their results are inserted into the string.

**Example of String Interpolation**

string name = "Alice";

int age = 30;

string greeting = \$"Hello, my name is {name} and I am {age} years old.";

Console.WriteLine(greeting);

**Output:**

Hello, my name is Alice and I am 30 years old.

**Explanation**

- **\$ Prefix**: The \$ symbol indicates that the string is an interpolated string.

- **Curly Braces {}**: The expressions inside the curly braces {} are evaluated at runtime, and their values are inserted into the string at that position.

- **Expressions**: You can include any valid C# expression inside the braces, not just variables. This includes method calls, arithmetic operations, and even other strings.

**Advantages of String Interpolation**

1.  **Readability**: String interpolation makes your code more readable and concise. It eliminates the need for placeholders like {0}, {1}, etc., which are used in String.Format.

2.  **Type Safety**: Since string interpolation directly references variables and expressions, you benefit from compile-time checking, reducing the risk of runtime errors due to mismatched format specifiers.

3.  **Flexibility**: You can include complex expressions within the interpolated string, which are evaluated at runtime.

In C#, there are several alternative ways to handle conditional logic beyond the traditional if-else statements. Each alternative has its own use cases and advantages. Here’s an overview of these alternatives and guidelines on when to use each one:

### 1. **Switch Statement**

The switch statement is used to select one of many code blocks to be executed based on the value of a variable or expression. It is often preferred over multiple if-else statements when dealing with a single variable with multiple possible values.

#### Syntax:

switch (expression)

{

case value1:

// Code to be executed if expression == value1

break;

case value2:

// Code to be executed if expression == value2

break;

// More cases

default:

// Code to be executed if no case matches

break;

}

#### Example:

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

// More cases

default:

Console.WriteLine("Unknown day");

break;

}

#### When to Use:

- When you need to handle multiple discrete values for a single variable.

- When the number of conditions is relatively large, and the code for each condition is significantly different.

### 2. **Switch Expression (C# 8.0+)**

The switch expression is a more concise and expressive way to handle multiple conditions, especially when you want to return a value based on the condition.

#### Syntax:

var result = expression switch

{

value1 =\> result1,

value2 =\> result2,

// More cases

\_ =\> defaultResult

};

#### Example:

int dayOfWeek = 3;

string dayName = dayOfWeek switch

{

1 =\> "Monday",

2 =\> "Tuesday",

3 =\> "Wednesday",

// More cases

\_ =\> "Unknown day"

};

Console.WriteLine(dayName);

#### When to Use:

- When you want to return a result based on multiple conditions in a more concise way.

- When using C# 8.0 or later, as it provides a more readable and functional style.

### 3. **Ternary Operator**

The ternary operator (? :) is a shorthand for simple if-else conditions that return a value. It is used for conditional assignment.

#### Syntax:

condition ? valueIfTrue : valueIfFalse;

#### Example:

int age = 20;

string category = age \>= 18 ? "Adult" : "Minor";

Console.WriteLine(category);

#### When to Use:

- For simple conditions where you need to assign a value based on a boolean condition.

- When you want concise, one-line conditional logic.

### 4. **Null-Coalescing Operator (**??**)**

The null-coalescing operator is used to provide a default value when a nullable expression is null.

#### Syntax:

value ?? defaultValue;

#### Example:

string name = null;

string displayName = name ?? "Default Name";

Console.WriteLine(displayName);

#### When to Use:

- When you need to provide a fallback value for potentially null expressions.

### 5. **Pattern Matching (C# 7.0+)**

Pattern matching enhances the switch statement and is operator to allow more complex conditional logic.

#### Syntax:

if (obj is Type pattern)

{

// Code using pattern

}

#### Example:

object obj = 42;

if (obj is int number)

{

Console.WriteLine(\$"The number is {number}");

}

#### When to Use:

- When you need to check the type and value of an object simultaneously.

- When you want more expressive and readable type checking and extraction.

### 6. **Lookup Tables**

Using dictionaries or similar data structures to map keys to actions or values can be a way to replace complex if-else or switch statements.

#### Example:

var actions = new Dictionary\<int, Action\>

{

{ 1, () =\> Console.WriteLine("Action 1") },

{ 2, () =\> Console.WriteLine("Action 2") },

{ 3, () =\> Console.WriteLine("Action 3") }

};

int key = 2;

if (actions.ContainsKey(key))

{

actions\[key\]();

}

else

{

Console.WriteLine("Default action");

}

#### When to Use:

- When you have a set of actions or values that can be mapped and lookups are more efficient.

- When you want to avoid a large number of conditional statements.

### Summary

- **switch Statement**: Use when dealing with multiple discrete values for a single variable.

- **switch Expression**: Use for concise value-based conditionals in C# 8.0 or later.

- **Ternary Operator**: Use for simple conditional assignments.

- **Null-Coalescing Operator (??)**: Use to provide default values for nullable expressions.

- **Pattern Matching**: Use for complex type and value checks.

- **Lookup Tables**: Use for mapping keys to actions or values, especially when conditions are numerous or complex.

What is the difference between Finally and Finalize?

In C#, finally and Finalize serve different purposes and are used in different contexts for managing resources and cleanup. Here's a detailed explanation of each and the differences between them:

### finally Block

#### Purpose:

The finally block is used in exception handling to ensure that a block of code is executed regardless of whether an exception was thrown or not. It is typically used for cleanup operations, such as closing files or releasing resources.

#### How It Works:

- The finally block is executed after the try block and any associated catch blocks.

- It runs regardless of whether an exception was thrown and whether it was caught.

- You can have a finally block with or without catch blocks.

#### Example:

try

{

// Code that may throw an exception

Console.WriteLine("In try block.");

}

catch (Exception ex)

{

// Exception handling

Console.WriteLine(\$"Caught exception: {ex.Message}");

}

finally

{

// Cleanup code that always executes

Console.WriteLine("In finally block.");

}

#### When to Use:

- When you need to ensure that certain code runs regardless of whether an exception occurs, such as releasing resources or closing connections.

### Finalize Method

#### Purpose:

The Finalize method is used to perform cleanup operations on an object before it is reclaimed by the garbage collector. It allows you to release unmanaged resources that the garbage collector cannot handle automatically.

#### How It Works:

- The Finalize method is a special method in the Object class and is overridden in derived classes to provide cleanup logic.

- It is called by the garbage collector when it determines that an object is no longer reachable and is about to be collected.

- The method is called automatically and cannot be invoked directly by user code.

#### Syntax:

protected override void Finalize()

{

try

{

// Cleanup code here

}

finally

{

base.Finalize(); // Call base class Finalize

}

}

#### Example:

class ResourceHolder

{

// Finalizer method

~ResourceHolder()

{

// Code to release unmanaged resources

Console.WriteLine("Finalizer called.");

}

}

#### When to Use:

- When you need to release unmanaged resources, such as file handles or database connections, that are not automatically managed by the garbage collector.

### Differences Between finally and Finalize

1.  **Purpose**:

    - **finally**: Used for ensuring code execution for cleanup after a try block, regardless of whether an exception occurs.

    - **Finalize**: Used for releasing unmanaged resources before an object is garbage collected.

2.  **Timing**:

    - **finally**: Executes immediately after the try block and any catch blocks, before the program continues.

    - **Finalize**: Executed by the garbage collector at an unspecified time when the object is no longer in use.

3.  **Control**:

    - **finally**: Explicitly managed by the programmer and can be used to handle both normal and exceptional termination of code.

    - **Finalize**: Automatically managed by the .NET runtime and is intended for handling unmanaged resources.

4.  **Explicit Invocation**:

    - **finally**: Can be explicitly included in try-catch-finally constructs.

    - **Finalize**: Cannot be directly called by user code; it is called by the garbage collector.

5.  **Resource Management**:

    - **finally**: Typically used for releasing managed and unmanaged resources within the context of exception handling.

    - **Finalize**: Specifically used for cleanup of unmanaged resources when an object is being collected.

### Best Practices

- **Prefer IDisposable Pattern**: Instead of relying solely on finalizers, use the IDisposable interface and the Dispose method to provide explicit resource management. This pattern allows for more deterministic resource cleanup.

- **Avoid Overusing Finalizers**: Finalizers should be used sparingly and only when necessary to release unmanaged resources. Overusing finalizers can lead to performance issues due to the additional overhead of garbage collection.

By understanding and applying these concepts appropriately, you can manage resources effectively and ensure that your application runs efficiently and without resource leaks.

What is the difference between “throw ex” and “throw”?

In C#, the throw statement is used to raise exceptions. There are two primary ways to use throw: throw ex and throw. The difference between these two forms lies in how they handle the exception being thrown, particularly with regard to the preservation of the original exception information.

### throw ex

When you use throw ex, you're re-throwing the exception object (ex) that was caught in a catch block. This approach explicitly throws the caught exception again.

#### Example:

try

{

// Code that may throw an exception

}

catch (Exception ex)

{

// Handle exception or log it

Console.WriteLine(\$"Caught exception: {ex.Message}");

// Re-throw the same exception

throw ex;

}

#### Characteristics:

- **Exception Information**: Using throw ex rethrows the exception but may lose the original stack trace information. The new stack trace starts from the point where throw ex is called.

- **Use Case**: Typically used when you need to log or process the exception before re-throwing it, but you need to be aware that this approach might not preserve the full context of where the original exception occurred.

### throw

When you use throw by itself, without specifying an exception object, you're re-throwing the current exception object that was caught in the catch block. This approach preserves the original stack trace information.

#### Example:

try

{

// Code that may throw an exception

}

catch (Exception ex)

{

// Handle exception or log it

Console.WriteLine(\$"Caught exception: {ex.Message}");

// Re-throw the same exception with preserved stack trace

throw;

}

#### Characteristics:

- **Exception Information**: Using throw preserves the original stack trace and exception details. The stack trace remains intact from the point where the original exception was thrown.

- **Use Case**: Preferred method for re-throwing exceptions because it maintains the original context and stack trace, making debugging easier and providing better diagnostic information.

### Summary

- **throw ex**:

  - Re-throws the specified exception object.

  - May lose the original stack trace information.

  - Use when you need to perform additional operations on the exception before re-throwing, but be cautious of losing stack trace details.

- **throw**:

  - Re-throws the current exception being handled.

  - Preserves the original stack trace and exception details.

  - Preferred method for re-throwing exceptions to maintain the integrity of the original exception context.

### Best Practice

- **Use throw**: Prefer using throw in catch blocks to re-throw exceptions, as it retains the original stack trace and provides better diagnostics.

- **Avoid throw ex**: Avoid using throw ex unless you have a specific reason to manipulate the exception before re-throwing it and are aware of the implications regarding stack trace preservation.

What are the types of constructor?

In C#, constructors are special methods that are called when an instance of a class is created. They are used to initialize the object's state. There are several types of constructors in C#:

### 1. **Default Constructor**

A default constructor is a constructor that takes no parameters. If no constructor is defined for a class, the compiler automatically provides a default constructor.

#### Example:

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

### 2. **Parameterized Constructor**

A parameterized constructor is a constructor that takes one or more parameters. This allows for initialization of an object's properties or fields with specific values when the object is created.

#### Example:

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

### 3. **Static Constructor**

A static constructor is used to initialize static members of a class. It does not take any parameters and is called automatically before any static members are accessed or any static methods are called.

#### Example:

public class Counter

{

public static int Count;

// Static constructor

static Counter()

{

Count = 0;

}

}

### 4. **Copy Constructor**

A copy constructor is used to create a new instance of a class by copying an existing instance. It typically takes another instance of the same class as a parameter.

#### Example:

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

### Summary of Constructors:

1.  **Default Constructor**: Initializes an object with default values. No parameters.

    - public Person() { }

2.  **Parameterized Constructor**: Initializes an object with specific values. Takes parameters.

    - public Person(string name, int age) { }

3.  **Static Constructor**: Initializes static members of a class. No parameters. Called automatically by the runtime.

    - static Counter() { }

4.  **Copy Constructor**: Creates a new object as a copy of an existing object. Takes another instance as a parameter.

    - public Person(Person other) { }

### Best Practices:

- **Use Default Constructors** when you want to initialize an object with default values.

- **Use Parameterized Constructors** to provide flexibility in initializing objects with specific values.

- **Use Static Constructors** for initializing static members or performing one-time setup for the class.

- **Use Copy Constructors** when you need to create a new object that is a copy of an existing one.

What is Static constructor? What is the use in real applications?

**Static Constructor in C#**

A **static constructor** in C# is a special type of constructor that is used to initialize static members of a class or to perform actions that need to be done only once for the class. Unlike instance constructors, which initialize individual instances of a class, a static constructor initializes the class itself.

**Characteristics of Static Constructors**

1.  **Syntax**:

    - It is declared with the static keyword and does not take any parameters.

    - It has no access modifiers (e.g., public, private) because it is always called by the runtime and not directly by code.

> static ClassName()
>
> {
>
> // Initialization code
>
> }

2.  **Initialization**:

    - A static constructor is called automatically when the class is first accessed, either by creating an instance of the class or by accessing a static member.

    - It is guaranteed to be called only once, which makes it suitable for one-time initialization.

3.  **No Direct Invocation**:

    - You cannot call a static constructor directly. It is invoked automatically by the runtime when needed.

4.  **No Parameters**:

    - Static constructors cannot have parameters, so you cannot pass arguments to them.

5.  **Order of Execution**:

    - Static constructors are executed before any static members are accessed or any static methods are called.

**Example of Static Constructor**

public class Configuration

{

public static string ConnectionString;

// Static constructor

static Configuration()

{

// Initialization code

ConnectionString = "Data Source=server;Initial Catalog=database;Integrated Security=True";

Console.WriteLine("Static constructor called.");

}

}

**Use Cases for Static Constructors**

1.  **Initialization of Static Members**:

    - Static constructors are commonly used to initialize static fields or properties. For example, setting up a configuration string or establishing a connection pool.

> public class Logger
>
> {
>
> public static string LogFilePath;
>
> // Static constructor to initialize static field
>
> static Logger()
>
> {
>
> LogFilePath = "/var/log/application.log";
>
> // Additional initialization logic
>
> }
>
> }

2.  **One-Time Setup**:

    - Perform setup operations that need to occur only once for the class. For example, initializing resources or performing setup tasks that should only be done a single time.

> public class Cache
>
> {
>
> private static Dictionary\<string, object\> \_cache;
>
> // Static constructor for one-time setup
>
> static Cache()
>
> {
>
> \_cache = new Dictionary\<string, object\>();
>
> // Additional one-time initialization
>
> }
>
> }

3.  **Lazy Initialization**:

    - Use static constructors for lazy initialization, where the initialization is deferred until the class is first accessed. This can improve performance and avoid unnecessary work if the static members are not used.

> public class DatabaseConnection
>
> {
>
> private static SqlConnection \_connection;
>
> // Static constructor for lazy initialization
>
> static DatabaseConnection()
>
> {
>
> \_connection = new SqlConnection("connection_string");
>
> \_connection.Open();
>
> }
>
> }

**Best Practices**

- **Use Static Constructors for Class-Level Initialization**: Ideal for setting up static members or performing one-time setup tasks.

- **Avoid Complex Logic**: Keep static constructors simple and avoid complex logic that may fail. If complex initialization is needed, consider using other patterns like lazy initialization.

- **Ensure Thread-Safety**: Static constructors are automatically synchronized by the runtime, so you don’t need to handle synchronization explicitly. However, ensure that any code within the constructor is thread-safe if it interacts with shared resources.

What is Private constructor? What is the use?

**Private Constructor in C#**

A **private constructor** is a constructor with private access modifier. This means that the constructor can only be called from within the class itself, and not from outside. It is used to control the instantiation of the class and enforce certain design patterns.

**Characteristics of Private Constructors**

1.  **Access Restriction**:

    - A private constructor cannot be accessed from outside the class. This restricts the ability to create instances of the class directly.

2.  **Usage**:

    - Private constructors are often used in combination with static members and methods to control object creation and manage class instances.

**Use Cases for Private Constructors**

1.  **Singleton Pattern**:

    - The Singleton pattern ensures that only one instance of a class is created and provides a global point of access to it. A private constructor is used to prevent direct instantiation and control the creation of the single instance.

> public class Singleton
>
> {
>
> private static Singleton \_instance;
>
> // Private constructor
>
> private Singleton()
>
> {
>
> // Initialization code
>
> }
>
> // Public method to access the single instance
>
> public static Singleton Instance
>
> {
>
> get
>
> {
>
> if (\_instance == null)
>
> {
>
> \_instance = new Singleton();
>
> }
>
> return \_instance;
>
> }
>
> }
>
> }

2.  **Static Class**:

    - When creating a static class, you often use a private constructor to prevent the instantiation of the class. This enforces that all members of the class are accessed statically.

> public static class Utility
>
> {
>
> // Private constructor to prevent instantiation
>
> private Utility()
>
> {
>
> }
>
> public static void PerformAction()
>
> {
>
> // Method implementation
>
> }
>
> }

3.  **Factory Pattern**:

    - In the Factory pattern, a private constructor can be used to prevent direct instantiation and instead use a factory method to create instances. This allows for more control over the instantiation process and can enforce specific creation logic.

> public class Product
>
> {
>
> public string Name { get; private set; }
>
> // Private constructor
>
> private Product(string name)
>
> {
>
> Name = name;
>
> }
>
> // Factory method
>
> public static Product CreateProduct(string name)
>
> {
>
> return new Product(name);
>
> }
>
> }

4.  **Preventing Default Instantiation**:

    - If a class should not be instantiated using default constructors, a private constructor can be used to prevent this and enforce specific initialization requirements.

> public class ConfigurationManager
>
> {
>
> private static ConfigurationManager \_instance;
>
> // Private constructor to prevent default instantiation
>
> private ConfigurationManager()
>
> {
>
> // Initialization code
>
> }
>
> public static ConfigurationManager Instance
>
> {
>
> get
>
> {
>
> if (\_instance == null)
>
> {
>
> \_instance = new ConfigurationManager();
>
> }
>
> return \_instance;
>
> }
>
> }
>
> }

**Summary**

- **Private Constructor**:

  - **Purpose**: Controls instantiation of a class and enforces design patterns such as Singleton, Static, and Factory.

  - **Access**: Can only be called from within the class itself.

  - **Usage**: Commonly used in patterns where direct instantiation should be restricted, or in static classes where instantiation is not needed.

**Best Practices**

- **Use with Design Patterns**: Implement private constructors when using design patterns that require controlled instantiation.

- **Avoid Instantiation**: Prevent unwanted instantiation by using private constructors in static classes or utility classes.

- **Encapsulation**: Ensure that the class logic aligns with the intended design pattern and encapsulates the creation logic effectively.

What is Constructor overloading?

**Constructor Overloading in C#**

**Constructor overloading** in C# refers to the ability to define multiple constructors within a class, each with a different set of parameters. This allows for the creation of class instances in various ways, depending on the arguments provided.

**Key Characteristics**

1.  **Multiple Constructors**:

    - You can define more than one constructor in a class, as long as each constructor has a unique parameter list (different number, types, or order of parameters).

2.  **Purpose**:

    - Constructor overloading provides flexibility in how objects are instantiated. It allows you to initialize objects with different sets of data or configurations.

3.  **Default Constructor**:

    - If no constructors are defined, the compiler provides a default constructor with no parameters. However, if you define any constructors, you need to explicitly define a parameterless constructor if you want one.

**Example of Constructor Overloading**

public class Rectangle

{

public int Width { get; set; }

public int Height { get; set; }

// Parameterless constructor

public Rectangle()

{

Width = 0;

Height = 0;

}

// Constructor with one parameter (square)

public Rectangle(int size)

{

Width = size;

Height = size;

}

// Constructor with two parameters

public Rectangle(int width, int height)

{

Width = width;

Height = height;

}

}

**Usage Example**

public class Program

{

public static void Main()

{

// Using parameterless constructor

Rectangle rect1 = new Rectangle();

Console.WriteLine(\$"rect1 - Width: {rect1.Width}, Height: {rect1.Height}");

// Using constructor with one parameter

Rectangle rect2 = new Rectangle(10);

Console.WriteLine(\$"rect2 - Width: {rect2.Width}, Height: {rect2.Height}");

// Using constructor with two parameters

Rectangle rect3 = new Rectangle(10, 20);

Console.WriteLine(\$"rect3 - Width: {rect3.Width}, Height: {rect3.Height}");

}

}

**Benefits of Constructor Overloading**

1.  **Flexibility**:

    - Provides multiple ways to initialize an object, catering to different scenarios or requirements.

2.  **Code Clarity**:

    - Makes the code more readable and expressive by allowing constructors to initialize objects in various ways.

3.  **Ease of Use**:

    - Users of the class can choose the constructor that best fits their needs without having to perform additional setup after object creation.

**Best Practices**

- **Define Constructors Based on Common Use Cases**:

  - Overload constructors to cover the most common scenarios for initializing objects, but avoid excessive overloading that might lead to confusion.

- **Keep Constructors Simple**:

  - Ensure that each constructor is focused on a specific initialization task and avoid putting too much logic into constructors.

- **Provide Default Values**:

  - When using multiple constructors, consider providing default values for parameters where applicable to simplify object creation.

What is Destructor?

A **destructor** in C# is a special method that is used to perform cleanup operations on an object before it is reclaimed by the garbage collector. Destructors are used to release unmanaged resources or perform other cleanup tasks when an object is no longer needed.

**Characteristics of Destructors**

1.  **Syntax**:

    - A destructor has the same name as the class but is prefixed with a tilde (~).

    - It does not take any parameters and does not have a return type.

    - You cannot call a destructor directly; it is called automatically by the garbage collector.

> ~ClassName()
>
> {
>
> // Cleanup code
>
> }

2.  **Automatic Invocation**:

    - Destructors are called automatically by the garbage collector when an object is no longer in use.

    - The timing of destructor execution is non-deterministic, meaning you cannot predict exactly when it will be called.

3.  **Resource Management**:

    - Destructors are typically used to clean up unmanaged resources like file handles, database connections, or network connections that need explicit release.

4.  **Inheritance**:

    - If a class has a destructor, its base class can also have a destructor. The derived class destructor calls the base class destructor automatically, ensuring that both the base and derived class resources are cleaned up.

5.  **No Overloading**:

    - Unlike constructors, you cannot overload destructors. Each class can have only one destructor.

**Example of Destructor**

public class FileManager

{

private IntPtr fileHandle; // Unmanaged resource

public FileManager(string filePath)

{

// Allocate unmanaged resource

fileHandle = OpenFile(filePath);

}

// Destructor

~FileManager()

{

// Release unmanaged resource

CloseFile(fileHandle);

}

private IntPtr OpenFile(string filePath)

{

// Code to open file and return handle

return new IntPtr(); // Placeholder

}

private void CloseFile(IntPtr handle)

{

// Code to close file handle

}

}

**Differences from Finalize**

1.  **Finalization**:

    - Destructors are also known as finalizers in C# and are part of the finalization process. The Finalize method is a more general term used in the .NET framework, and the destructor syntax (~ClassName()) is a shorthand for Finalize.

2.  **Automatic and Non-Deterministic**:

    - Like destructors, finalizers are non-deterministic, meaning you cannot control exactly when they will run. They are called by the garbage collector.

**Best Practices**

1.  **Prefer IDisposable Pattern**:

    - Instead of relying solely on destructors for resource management, it is better to implement the IDisposable interface and use the Dispose method to provide explicit resource management. This allows for deterministic cleanup and better resource management.

> public class FileManager : IDisposable
>
> {
>
> private IntPtr fileHandle;
>
> private bool disposed = false;
>
> public FileManager(string filePath)
>
> {
>
> fileHandle = OpenFile(filePath);
>
> }
>
> public void Dispose()
>
> {
>
> Dispose(true);
>
> GC.SuppressFinalize(this);
>
> }
>
> protected virtual void Dispose(bool disposing)
>
> {
>
> if (!disposed)
>
> {
>
> if (disposing)
>
> {
>
> // Release managed resources
>
> }
>
> // Release unmanaged resources
>
> CloseFile(fileHandle);
>
> disposed = true;
>
> }
>
> }
>
> ~FileManager()
>
> {
>
> Dispose(false);
>
> }
>
> }

2.  **Keep Destructors Simple**:

    - Ensure that destructors only contain code necessary for releasing unmanaged resources. Avoid complex logic or operations that could fail.

3.  **Understand Finalization Overhead**:

    - Be aware that relying on destructors for resource cleanup may introduce performance overhead and delays in resource release. Using IDisposable provides more control over resource management.

By using destructors appropriately and implementing the IDisposable pattern where necessary, you can effectively manage resources and ensure that your objects are cleaned up properly when they are no longer needed.

If base & child both class have constructors, which will be called first?

 **Base Class Constructor**: The base class constructor is called first.

 **Derived Class Constructor**: After the base class constructor has completed, the derived class constructor is called.

**Constructor Chaining**

In cases where you explicitly call a base class constructor from a derived class constructor using the base keyword, the base class constructor will still be called first.

Example with constructor chaining:

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

// Creating an instance of DerivedClass

DerivedClass obj = new DerivedClass();

}

}

**Output:**

BaseClass Constructor: Hello from BaseClass

DerivedClass Constructor

**Summary**

- **Order of Execution**: The base class constructor is called first, followed by the derived class constructor.

- **Constructor Chaining**: You can use the base keyword to call a specific base class constructor from a derived class, but the base class constructor still runs before the derived class constructor.

What is “this” keyword in C#? When to use it in real application?

The this keyword in C# is a reference to the current instance of the class in which it is used. It is used to refer to the members (fields, methods, constructors, etc.) of the current object. The this keyword is commonly used in several scenarios to make code clearer and to resolve ambiguity between class members and parameters or variables with the same name.

**Use Cases for the this Keyword**

1.  **Distinguishing Between Class Members and Parameters**:

    - When a method or constructor parameter has the same name as a class field or property, this is used to clarify that you are referring to the class member.

> public class Person
>
> {
>
> private string name;
>
> public Person(string name)
>
> {
>
> // "this.name" refers to the class field, "name" refers to the parameter
>
> this.name = name;
>
> }
>
> }

2.  **Calling Another Constructor**:

    - The this keyword is used to call another constructor in the same class, enabling constructor chaining. This helps avoid code duplication by allowing one constructor to reuse the initialization logic of another.

> public class Person
>
> {
>
> private string name;
>
> private int age;
>
> // Constructor 1
>
> public Person(string name)
>
> {
>
> this.name = name;
>
> }
>
> // Constructor 2 (calls Constructor 1)
>
> public Person(string name, int age) : this(name)
>
> {
>
> this.age = age;
>
> }
>
> }

3.  **Passing the Current Instance as a Parameter**:

    - You can use this to pass the current instance of the class to a method or another object. This is useful in scenarios such as event handling or when implementing certain design patterns like the observer pattern.

> public class Button
>
> {
>
> public void Click()
>
> {
>
> // Pass the current instance to the event handler
>
> OnClick(this);
>
> }
>
> private void OnClick(Button sender)
>
> {
>
> Console.WriteLine("Button clicked!");
>
> }
>
> }

4.  **Returning the Current Instance**:

    - The this keyword can be used in methods to return the current instance, which is helpful in implementing fluent interfaces (also known as method chaining).

> public class Person
>
> {
>
> private string name;
>
> private int age;
>
> public Person SetName(string name)
>
> {
>
> this.name = name;
>
> return this;
>
> }
>
> public Person SetAge(int age)
>
> {
>
> this.age = age;
>
> return this;
>
> }
>
> }
>
> // Usage:
>
> var person = new Person().SetName("John").SetAge(30);

5.  **Extension Methods**:

    - Although not directly related to the this keyword within a class, in extension methods, this is used as the first parameter to specify the type of object the method extends.

> public static class StringExtensions
>
> {
>
> public static string ToUpperFirstLetter(this string input)
>
> {
>
> if (string.IsNullOrEmpty(input)) return input;
>
> return char.ToUpper(input\[0\]) + input.Substring(1);
>
> }
>
> }
>
> // Usage:
>
> string example = "hello";
>
> string result = example.ToUpperFirstLetter(); // "Hello"

**When to Use the this Keyword**

- **Clarity and Disambiguation**: Use this when there is a naming conflict between a class member and a method parameter or local variable to make it clear that you are referring to the class member.

- **Constructor Chaining**: Use this to chain constructors within a class, reducing code duplication.

- **Fluent Interfaces**: Return this from a method when implementing a fluent interface, allowing method chaining.

- **Event Handling and Callbacks**: Use this to pass the current instance of a class to another method or object, especially in event handling scenarios.

**Example in a Real Application**

Consider a scenario where you have a class representing a person, and you want to set the person's name and age using a fluent interface. The this keyword is used to return the current instance, allowing for a more readable and intuitive way to set properties.

public class Person

{

private string name;

private int age;

public Person SetName(string name)

{

this.name = name; // Use "this" to clarify that we are setting the class member

return this; // Return the current instance

}

public Person SetAge(int age)

{

this.age = age;

return this;

}

}

// Usage in an application

var person = new Person()

.SetName("Alice")

.SetAge(25);

Console.WriteLine(\$"Name: {person.Name}, Age: {person.Age}");

What is the purpose of “using” keyword in C#?

The using keyword in C# serves multiple purposes, each useful in different contexts. The two primary uses of the using keyword are:

1.  **using Directive**: To include namespaces in your code.

2.  **using Statement**: To manage resources and ensure they are properly disposed of.

### 1. using Directive

The using directive is used to include namespaces in your code, allowing you to reference types (classes, interfaces, etc.) defined within those namespaces without having to specify the full namespace path each time.

#### Example of using Directive

using System;

using System.Collections.Generic;

public class Program

{

public static void Main()

{

List\<string\> names = new List\<string\>();

names.Add("Alice");

names.Add("Bob");

foreach (string name in names)

{

Console.WriteLine(name);

}

}

}

**Explanation**:

- The using System; directive allows the program to use types from the System namespace (e.g., Console).

- The using System.Collections.Generic; directive allows the use of the List\<T\> type without needing to fully qualify it as System.Collections.Generic.List\<T\>.

### 2. using Statement (Resource Management)

The using statement is used to manage resources, particularly unmanaged resources like file handles, database connections, or network streams. It ensures that the resources are disposed of properly, even if an exception occurs, by automatically calling the Dispose method on the object at the end of the using block.

#### Example of using Statement

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

// The StreamWriter object is automatically disposed of here

}

}

**Explanation**:

- The using statement creates a scope at the end of which the Dispose method is called on the StreamWriter object, ensuring that the file is properly closed and the resources are released.

- This pattern is particularly important for managing resources that are expensive or limited, such as file handles, database connections, or network streams.

### Benefits of Using the using Statement

- **Automatic Resource Management**: The using statement ensures that resources are disposed of automatically when they are no longer needed, reducing the risk of resource leaks.

- **Exception Safety**: If an exception is thrown within the using block, the Dispose method is still called, ensuring proper cleanup.

- **Code Simplicity**: It simplifies the code by removing the need for explicit try-finally blocks to manage resources.

### Equivalent Code Without using

Without the using statement, you would need to explicitly dispose of the object using a try-finally block:

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

### Summary

- **using Directive**: Includes namespaces in your code, making it easier to reference types within those namespaces.

- **using Statement**: Manages resources and ensures they are disposed of properly by automatically calling the Dispose method when the scope ends. This is particularly useful for handling unmanaged resources like files, network connections, and database connections.

What is the difference between “is” and “as” operators?

In C#, the is and as operators are used for type checking and type conversion, respectively. Here's a breakdown of their differences and when to use each one:

**is Operator**

- **Purpose**: The is operator is used to check if an object is of a specific type (or can be cast to that type). It returns true if the object is of the specified type, and false otherwise.

- **Usage**: Typically used in conditional statements to safely check the type of an object before performing operations that require the object to be of a specific type.

- **Example**:

> object obj = "Hello, World!";
>
> if (obj is string)
>
> {
>
> Console.WriteLine("The object is a string.");
>
> }
>
> else
>
> {
>
> Console.WriteLine("The object is not a string.");
>
> }
>
> **Explanation**:

- In this example, the is operator checks if obj is of type string. Since obj is a string, the condition evaluates to true, and "The object is a string." is printed.

**as Operator**

- **Purpose**: The as operator is used to perform a safe type conversion. It attempts to cast an object to a specified type, returning the object as the specified type if the cast is successful, or null if it is not.

- **Usage**: Commonly used when you want to perform a type conversion and handle cases where the conversion might fail, without throwing an exception.

- **Example**:

> object obj = "Hello, World!";
>
> string str = obj as string;
>
> if (str != null)
>
> {
>
> Console.WriteLine("The object was successfully cast to a string.");
>
> }
>
> else
>
> {
>
> Console.WriteLine("The object is not a string.");
>
> }
>
> **Explanation**:

- In this example, the as operator attempts to cast obj to a string. If obj were not a string, str would be null, allowing the program to safely handle the failed conversion without throwing an exception.

**Example Combining Both**

Sometimes, you might use both is and as together for type checking and conversion:

object obj = "Hello, World!";

if (obj is string str)

{

Console.WriteLine(\$"The object is a string: {str}");

}

else

{

Console.WriteLine("The object is not a string.");

}

- **Explanation**: Here, the is keyword is used with pattern matching. If obj is a string, it is automatically cast and assigned to str within the if block.

**Summary**

- **is**: Checks the type of an object and returns a boolean value.

- **as**: Attempts to cast an object to a specified type, returning the object if successful, or null if unsuccessful.

What is the difference between “Readonly” and “Constant” variables?

In C#, both readonly and const are used to declare variables whose values cannot be changed once they are set. However, they have key differences in their behavior, usage, and when the values are assigned. Here's a detailed comparison:

**const (Constant)**

- **Compile-time Constant**:

  - The value of a const variable is set at compile time and cannot be changed. This means that the value must be known and assigned at the time of declaration.

- **Implicitly Static**:

  - A const variable is implicitly static, meaning it belongs to the type itself, not to any instance of the type. Therefore, it cannot be marked with the static keyword explicitly.

- **Data Types**:

  - const can be used only with simple data types such as int, float, double, char, string, etc., and some enum types.

- **Accessibility**:

  - Because const values are replaced by their literal values at compile time, they are essentially hard-coded into your program. This makes them faster to access but also more rigid.

- **Example**:

> public class Circle
>
> {
>
> public const double Pi = 3.14159;
>
> }
>
> public class Program
>
> {
>
> public static void Main()
>
> {
>
> double radius = 5;
>
> double circumference = 2 \* Circle.Pi \* radius;
>
> Console.WriteLine("Circumference: " + circumference);
>
> }
>
> }
>
> **Explanation**:

- Pi is a const because its value (3.14159) will never change. The value of Pi is embedded directly into the compiled code wherever it is used.

**readonly**

- **Runtime Constant**:

  - The value of a readonly variable can be set either at the time of declaration or within the constructor of the class in which it is declared. This allows for different values depending on how the constructor is used.

- **Instance-level or Static**:

  - readonly variables can be either instance-level (unique to each object instance) or static (shared across all instances of a class). If it's static, you need to explicitly use the static keyword.

- **Data Types**:

  - readonly can be used with any data type, including complex types like objects, arrays, and classes.

- **Mutability**:

  - The readonly keyword prevents reassigning the reference of a variable, but if the variable is a reference type (like an array or object), the members of that reference can still be changed.

- **Example**:

> public class Circle
>
> {
>
> public readonly double Radius;
>
> public static readonly double Pi = 3.14159;
>
> public Circle(double radius)
>
> {
>
> Radius = radius; // Assigned in the constructor
>
> }
>
> public double Circumference()
>
> {
>
> return 2 \* Pi \* Radius;
>
> }
>
> }
>
> public class Program
>
> {
>
> public static void Main()
>
> {
>
> Circle circle = new Circle(5);
>
> Console.WriteLine("Circumference: " + circle.Circumference());
>
> }
>
> }
>
> **Explanation**:

- Radius is a readonly field because it is set in the constructor and cannot be changed afterward. This allows for the creation of Circle objects with different radii, but once set, the Radius value cannot be modified.

- Pi is a static readonly field, which means it behaves like a constant for the Circle class, but its value could theoretically be set at runtime (though in this example, it's assigned a fixed value).

**Key Differences**

| **Feature** | **const** | **readonly** |
|----|----|----|
| **Assignment** | Must be assigned at declaration. | Can be assigned at declaration or in constructor. |
| **When** | Compile-time constant. | Runtime constant. |
| **Data Type** | Simple data types only (e.g., int, string). | Any data type (including objects and arrays). |
| **Static** | Implicitly static (belongs to the type). | Can be static or instance-level. |
| **Mutability** | Completely immutable. | Reference is immutable; object state may change. |
| **Accessibility** | Value is inlined in compiled code. | Value is accessed at runtime. |

**Summary**

- **const**: Use when the value is truly constant and will never change. It's useful for defining constants like Pi or mathematical values that are universal and immutable.

- **readonly**: Use when you need to set a value that should not change after initialization but might need to be assigned at runtime, such as configuration settings that are determined when an object is created.

Choosing between const and readonly depends on whether you need flexibility at runtime or absolute immutability at compile time.

What is “Static” class? When to use it?

A **static class** in C# is a class that cannot be instantiated and can only contain static members. Static members belong to the class itself rather than to instances of the class, meaning they are shared across all uses of the class.

**Characteristics of a Static Class**

1.  **No Instances**:

    - A static class cannot be instantiated, which means you cannot create objects of a static class using the new keyword.

    - Since no objects can be created, a static class cannot have instance constructors.

2.  **All Members Are Static**:

    - All members of a static class must be static, including fields, methods, properties, and events.

    - You cannot declare instance members (non-static) in a static class.

3.  **No Inheritance**:

    - A static class cannot inherit from other classes, nor can other classes inherit from a static class. However, a static class can still inherit from System.Object, the base class of all classes in C#.

    - A static class cannot implement interfaces.

4.  **Access Modifiers**:

    - A static class can have access modifiers like public, internal, protected, and private to control the visibility of the class to other code.

**When to Use a Static Class**

1.  **Utility or Helper Classes**:

    - Static classes are commonly used for utility or helper methods that operate on parameters and do not need to maintain any internal state. For example, classes that perform mathematical operations, string manipulations, or logging.

> **Example**: Math, Console, Path classes in .NET.

2.  **Global State**:

    - Static classes can be used to hold global state or configuration settings that need to be accessed across the application. However, this should be done cautiously to avoid issues related to global state management.

3.  **Organizing Constants**:

    - Static classes can be used to organize related constants in a single place, especially if those constants are used in multiple places within an application.

> **Example**: A ConfigurationSettings static class that holds application-wide constants like file paths or API URLs.

4.  **Singleton Pattern**:

    - While not required, the Singleton pattern (which ensures that a class has only one instance) often uses a static class to provide access to the single instance.

**Summary**

- A **static class** is a class that cannot be instantiated and can only contain static members.

- **Use static classes** for utility functions, global state, organizing constants, or implementing the Singleton pattern.

- They are ideal when you want to group related functionality together and ensure that the functionality is accessible without needing to create an object instance.

What is the difference between “var” and “dynamic” in C#?

In C#, both var and dynamic are used to declare variables, but they differ significantly in how they handle types, when type checking occurs, and their overall behavior. Here’s a detailed comparison:

**var**

- **Type Inference at Compile Time**:

  - When you declare a variable using var, the compiler infers the variable's type based on the assigned value at compile time.

  - The type is determined at compile time, meaning that once the type is inferred, it cannot change.

- **Static Typing**:

  - Even though the type is inferred, var is statically typed. The compiler knows the exact type of the variable during compilation, and all the type-checking is done at compile time.

  - This means that once the type is inferred, you can't assign a value of a different type to the variable later in the code.

- **Usage**:

  - var is typically used when the type is obvious from the right-hand side of the assignment or when the type is long and complex.

- **Example**:

> var number = 10; // The compiler infers that 'number' is of type int.
>
> var name = "John"; // The compiler infers that 'name' is of type string.
>
> // Compilation error: 'name' is of type string, so you can't assign an integer to it.
>
> // name = 5;
>
> **Explanation**:

- In the first line, var number is inferred as an int because 10 is an integer. Similarly, var name is inferred as a string because "John" is a string.

**dynamic**

- **Type Resolution at Runtime**:

  - When you declare a variable using dynamic, the type checking is deferred until runtime. This means that the type of a dynamic variable can change during the execution of the program.

- **Dynamic Typing**:

  - Unlike var, dynamic is dynamically typed. The compiler does not check the type of a dynamic variable at compile time. Instead, the type is determined at runtime based on the actual object assigned to the variable.

  - This flexibility comes at the cost of potential runtime errors, as the compiler cannot catch type-related mistakes.

- **Usage**:

  - dynamic is useful in scenarios where you need to interact with components that are not statically typed, such as COM objects, dynamic languages like Python, or when using reflection.

- **Example**:

> dynamic value = 10; // At runtime, 'value' is treated as an int.
>
> Console.WriteLine(value.GetType()); // Outputs: System.Int32
>
> value = "Hello"; // Now 'value' is treated as a string at runtime.
>
> Console.WriteLine(value.GetType()); // Outputs: System.String
>
> // No compile-time error, but may cause a runtime error if 'value' is not an int at this point
>
> value++;
>
> **Explanation**:

- The dynamic variable value first holds an int, then a string. The type is checked and resolved at runtime, allowing this flexibility.

**Key Differences**

| **Feature** | **var** | **dynamic** |
|----|----|----|
| **Type Determination** | At compile time | At runtime |
| **Type Checking** | Compile-time | Runtime |
| **Static vs. Dynamic Typing** | Statically typed | Dynamically typed |
| **Error Detection** | Caught at compile time | Caught at runtime |
| **Usage Scenarios** | When type is obvious or complex | Interacting with dynamic languages, COM objects, or for more flexibility |
| **Performance** | More efficient due to compile-time type checking | Less efficient due to runtime type checking |

**Example Comparison**

var list = new List\<int\>(); // 'list' is inferred as List\<int\>

list.Add(1); // Valid operation

dynamic dynList = new List\<int\>(); // 'dynList' is dynamic

dynList.Add(1); // Valid operation

dynList = "Now I'm a string"; // Valid because 'dynList' is dynamic

// Following will compile but may throw runtime error

int length = dynList.Length; // 'Length' is not valid on a string at compile time

**Summary**

- **var**: Use when the type is known and should be statically checked at compile time. It’s type-safe and performs better because of compile-time type resolution.

- **dynamic**: Use when you need more flexibility with types that are only known at runtime, such as when dealing with dynamic languages or loosely-typed APIs. However, it sacrifices type safety and may lead to runtime errors.

What is the use of Yield keyword in C#?

The yield keyword in C# is used to simplify the creation of iterators. It allows you to return elements one at a time in a method without having to create, manage, or maintain an entire collection in memory. The yield keyword can be used in methods that return IEnumerable, IEnumerable\<T\>, IEnumerator, or IEnumerator\<T\>.

**How yield Works**

When a method that contains yield return or yield break is called, it does not immediately execute the code in the method. Instead, it returns an iterator object that keeps track of where it is in the method. Each time the MoveNext() method of the iterator is called (such as in a foreach loop), the code in the method runs until it reaches a yield return statement, at which point it returns the value to the caller and remembers the current location in the code. When MoveNext() is called again, it resumes execution from that point.

**yield return**

- **yield return** is used to return each element in a sequence one at a time.

- When yield return is encountered, the current location in the code is preserved, so that the next time the iterator is called, it resumes from that point.

**yield break**

- **yield break** is used to stop the iteration prematurely. When yield break is encountered, the iteration ends, and no more elements are returned.

**Example: Using yield return**

Here’s an example of how yield return can be used in a method to generate a sequence of numbers:

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

public static IEnumerable\<int\> GenerateNumbers(int start, int count)

{

for (int i = start; i \< start + count; i++)

{

yield return i;

}

}

}

**Explanation**:

- The GenerateNumbers method uses yield return to return each integer from start to start + count - 1 one by one.

- In the Main method, when foreach iterates over the result of GenerateNumbers, it calls the MoveNext() method on the iterator, which executes the code in GenerateNumbers up to the next yield return, yielding the next integer in the sequence.

**Example: Using yield break**

Here’s how yield break can be used to stop the iteration early:

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

public static IEnumerable\<int\> GenerateNumbers(int start, int count)

{

for (int i = start; i \< start + count; i++)

{

if (i == 5)

{

yield break; // Stop the iteration when i reaches 5

}

yield return i;

}

}

}

**Explanation**:

- In this example, the GenerateNumbers method stops yielding values when i reaches 5 because of the yield break statement.

- The foreach loop in Main will print the numbers 1 through 4, and then the iteration will stop.

**Use Cases for yield**

1.  **Deferred Execution**:

    - yield allows you to create sequences of data on demand, which is useful for scenarios where you want to generate large datasets or work with streams of data without loading everything into memory at once.

2.  **Simplified Iterators**:

    - Instead of manually managing the state of an iterator (such as creating a custom IEnumerator class), you can use yield to produce elements from a sequence in a natural and concise way.

3.  **Complex Iterations**:

    - For complex iteration logic, yield can make the code easier to write and understand by breaking up the logic into smaller, more manageable parts that yield results as they are computed.

**Summary**

- The yield keyword is used in iterator methods to simplify the process of returning data one element at a time.

- **yield return** returns the next element in a sequence.

- **yield break** stops the iteration prematurely.

- Using yield allows for more readable and maintainable code, particularly when dealing with complex or large datasets that are best processed incrementally.

Common Use Cases for Enums

**Common Use Cases for Enums**

1.  **Representing States**:

    - Enums are often used to represent a set of related states, such as the days of the week, months of the year, or various statuses in an application (e.g., Active, Inactive, Pending).

2.  **Flags**:

    - You can use enums with the \[Flags\] attribute to represent combinations of values (bitwise operations), although this is a more advanced use case.

> \[Flags\]
>
> public enum FileAccess
>
> {
>
> Read = 1,
>
> Write = 2,
>
> Execute = 4
>
> }
>
> With the \[Flags\] attribute, you can combine values like this:
>
> FileAccess access = FileAccess.Read \| FileAccess.Write;

3.  **Switch Statements**:

    - Enums are commonly used with switch statements to handle various possible values in a clear and structured way.
