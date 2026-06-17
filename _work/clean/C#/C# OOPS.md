# C# OOPS

## Questions Covered

1. What is OOPS? What are the main concepts of OOPS?
2. What is Polymorphism and what are its types? When to use polymorphism?
3. What is the difference between Method Overriding and Method Hiding?

What is OOPS? What are the main concepts of OOPS?

### Object-Oriented Programming (OOP)

**Object-Oriented Programming (OOP)** is a programming paradigm centered around the concept of "objects." Objects represent real-world entities or concepts and encapsulate data (attributes or properties) and behavior (methods or functions) that operate on that data. OOP promotes code reusability, modularity, and a clear structure for software design.

OOP in C# is based on four key principles:

1.  **Abstraction**

2.  **Encapsulation**

3.  **Inheritance**

4.  **Polymorphism** (which includes Overriding and Overloading)

Let's explore each concept with examples.

### 1. Abstraction

**Abstraction** is the process of hiding the implementation details of a class and exposing only the essential features. It allows you to focus on what an object does rather than how it does it.

### Example of Abstraction

```csharp
public abstract class Animal
{
public abstract void MakeSound(); // Abstract method, no implementation
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

- **Explanation**: Animal is an abstract class with an abstract method MakeSound. The concrete classes Dog and Cat implement the MakeSound method. The client code doesn't need to know how MakeSound is implemented; it only needs to know that animals can make sounds.

### 2. Encapsulation

**Encapsulation** is the process of bundling the data (attributes) and the methods (behavior) that operate on the data into a single unit or class. It also involves restricting access to certain components of an object to protect the internal state from unwanted modification.

### Example of Encapsulation

```csharp
public class BankAccount
{
private decimal balance; // Private field
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

- **Explanation**: The balance field is private and can only be modified using the Deposit and Withdraw methods. This encapsulation ensures that the balance cannot be directly modified from outside the BankAccount class, protecting the internal state.

### 3. Inheritance

**Inheritance** allows a new class (derived class) to inherit properties and methods from an existing class (base class). This promotes code reusability and establishes a relationship between classes.

### Example of Inheritance

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
```

NumberOfDoors = 4

```csharp
};
car.Drive(); // Output: Driving at 120 km/h
car.Honk(); // Output: Honking
}
}
```

- **Explanation**: The Car class inherits from the Vehicle class, gaining access to the Speed property and Drive method. The Car class also adds its own properties and methods, like NumberOfDoors and Honk.

### 4. Polymorphism

**Polymorphism** allows objects of different classes to be treated as objects of a common superclass. The two main types of polymorphism in C# are **method overriding** and **method overloading**.

### a. Overriding

**Overriding** allows a derived class to provide a specific implementation of a method that is already defined in its base class.

### Example of Overriding

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

- **Explanation**: The Car class overrides the Drive method from the Vehicle class. When Drive is called on a Vehicle reference pointing to a Car object, the Car's implementation of Drive is executed.

### b. Overloading

**Overloading** allows multiple methods in the same class to have the same name but different signatures (different parameter lists).

### Example of Overloading

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
Console.WriteLine(calc.Add(5, 10)); // Output: 15
Console.WriteLine(calc.Add(5.5, 10.5)); // Output: 16.0
}
}
```

- **Explanation**: The Add method is overloaded to handle both int and double parameters. The appropriate method is called based on the arguments provided.

### Summary

- **OOP**: A programming paradigm that uses objects and classes to model real-world entities.

- **Abstraction**: Hides implementation details and shows only essential features.

- **Encapsulation**: Bundles data and methods, restricting direct access to some of the object's components.

- **Inheritance**: Enables a class to inherit properties and methods from another class, promoting code reusability.

- **Overriding**: Allows a derived class to provide a specific implementation of a method that is defined in its base class.

- **Overloading**: Allows multiple methods with the same name but different parameter lists within the same class.

These principles form the foundation of OOP and are essential for creating well-structured, reusable, and maintainable code in C#.

What is Polymorphism and what are its types? When to use polymorphism?

**Polymorphism** is a fundamental concept in object-oriented programming (OOP) that allows objects of different classes to be treated as objects of a common base class. It enables the same operation to behave differently on different classes. Polymorphism enhances flexibility and maintainability by allowing code to work with objects of various types through a unified interface.

Polymorphism in C# can be classified into two types:

1.  **Static (Compile-time) Polymorphism**

2.  **Dynamic (Run-time) Polymorphism**

### 1. Static Polymorphism (Compile-time Polymorphism)

**Static Polymorphism** refers to the ability to resolve method calls at compile time. It is achieved through **method overloading** and **operator overloading**.

### a. Method Overloading

Method overloading occurs when multiple methods in the same class share the same name but differ in their parameter lists (number, type, or order of parameters).

### Example of Method Overloading

```csharp
public class Calculator
{
// Overloaded method with two integer parameters
public int Add(int a, int b)
{
return a + b;
}
// Overloaded method with three integer parameters
public int Add(int a, int b, int c)
{
return a + b + c;
}
// Overloaded method with two double parameters
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
Console.WriteLine(calc.Add(5, 10)); // Output: 15
Console.WriteLine(calc.Add(5, 10, 15)); // Output: 30
Console.WriteLine(calc.Add(5.5, 10.5)); // Output: 16.0
}
}
```

- **Explanation**: The Add method is overloaded to accept different numbers and types of parameters. The correct method is chosen at compile time based on the arguments provided.

### b. Operator Overloading

Operator overloading allows you to redefine the way operators work with user-defined types. It gives you the flexibility to define custom behavior for standard operators (like +, -, *, etc.) when applied to instances of your classes.

### Example of Operator Overloading

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
// Overloading the + operator
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
```

ComplexNumber sum = c1 + c2; // Using the overloaded + operator

```csharp
Console.WriteLine(sum); // Output: 4 + 6i
}
}
```

- **Explanation**: The + operator is overloaded to add two ComplexNumber objects. When the + operator is used with ComplexNumber instances, it adds their real and imaginary parts.

### 2. Dynamic Polymorphism (Run-time Polymorphism)

**Dynamic Polymorphism** is achieved through **method overriding**. It allows the determination of the method to be called at runtime based on the actual object type, rather than the type of reference.

### Example of Method Overriding

```csharp
public class Animal
{
// Virtual method to be overridden in derived classes
public virtual void MakeSound()
{
Console.WriteLine("Animal sound");
}
}
public class Dog : Animal
{
// Overriding the MakeSound method in the Dog class
public override void MakeSound()
{
Console.WriteLine("Bark");
}
}
public class Cat : Animal
{
// Overriding the MakeSound method in the Cat class
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
myDog.MakeSound(); // Output: Bark (Dog's implementation)
myCat.MakeSound(); // Output: Meow (Cat's implementation)
}
}
```

- **Explanation**: The MakeSound method is overridden in the Dog and Cat classes. The actual method that gets called depends on the runtime type of the object (Dog or Cat), even though the reference type is Animal.

### Summary of Static vs. Dynamic Polymorphism

| **Feature** | **Static Polymorphism** | **Dynamic Polymorphism** |
|----|----|----|
| **Resolution Time** | Compile-time | Run-time |
| **Method Binding** | Early Binding (Method Overloading, Operator Overloading) | Late Binding (Method Overriding) |
| **Flexibility** | Less flexible as decisions are made at compile-time | More flexible as decisions are made at runtime |
| **Example** | Method Overloading, Operator Overloading | Method Overriding |

### Conclusion

Polymorphism allows for flexible and reusable code by enabling methods to behave differently based on the object they're acting upon. **Static polymorphism** (via method overloading and operator overloading) provides compile-time decision-making, while **dynamic polymorphism** (via method overriding) allows for runtime decision-making, enhancing the ability to extend and modify behavior in a controlled manner.

What is the difference between Method Overriding and Method Hiding?

**Method Overriding** and **Method Hiding** are both techniques in C# that allow a derived class to define a new implementation of a method that is already defined in a base class. However, they operate differently in terms of how the base class method is treated and how the method resolution works at runtime and compile-time.

### 1. Method Overriding

**Method Overriding** allows a derived class to provide a specific implementation of a method that is already defined in its base class. Overriding is achieved using the virtual keyword in the base class method and the override keyword in the derived class method.

### Key Characteristics

- **Base Class**: The method in the base class must be marked as virtual, abstract, or override.

- **Derived Class**: The method in the derived class must be marked with the override keyword.

- **Behavior**: When a derived class object is accessed through a base class reference, the overridden method in the derived class is called (runtime polymorphism).

- **Late Binding**: The method to be executed is determined at runtime.

### Example

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

**Explanation**:

- The Display method in DerivedClass overrides the Display method in BaseClass. Even when accessed through a BaseClass reference, the DerivedClass implementation is executed.

### 2. Method Hiding

**Method Hiding** occurs when a derived class defines a method with the same name as a method in the base class, but without using the override keyword. Instead, the new keyword is used in the derived class method to explicitly hide the base class method.

### Key Characteristics

- **Base Class**: The method in the base class can be any regular method.

- **Derived Class**: The method in the derived class must be marked with the new keyword to hide the base class method.

- **Behavior**: When a derived class object is accessed through a base class reference, the base class method is called (method hiding is not polymorphic).

- **Early Binding**: The method to be executed is determined at compile-time.

### Example

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

**Explanation**:

- The Display method in DerivedClass hides the Display method in BaseClass. When accessed through a BaseClass reference, the base class implementation is executed. When accessed through a DerivedClass reference, the derived class implementation is executed.

### Differences Between Method Overriding and Method Hiding

| **Feature** | **Method Overriding** | **Method Hiding** |
|----|----|----|
| **Keywords Used** | virtual in base class, override in derived class | new in derived class |
| **Method Resolution** | Determined at runtime (late binding) | Determined at compile-time (early binding) |
| **Polymorphism** | Supports runtime polymorphism | Does not support runtime polymorphism |
| **Base Class Method** | Base class method can be accessed using base. in the derived class | Base class method is hidden when accessed through derived class reference |
| **Use Case** | Use when the derived class should provide a specific implementation that replaces the base class method | Use when the derived class should provide a new implementation, but without replacing the base class method |

### Summary

- **Method Overriding**: Provides a way for a derived class to replace a base class method's implementation and supports polymorphism.

- **Method Hiding**: Provides a way for a derived class to define a new method with the same name as in the base class, without affecting the base class method. This hides the base class method rather than overriding it.
