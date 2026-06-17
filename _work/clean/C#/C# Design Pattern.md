# C# Design Pattern

## Questions Covered

1. What are Design Pattern and what problem they solve?
2. What are the types of Design Patterns?
3. What are Creational Design Patterns?
4. What are Structural Design Patterns?
5. What are Behavioral Design Patterns?

**Design Patterns** are standardized solutions to common problems that arise in software design. They provide a proven template or guideline for addressing specific design issues, helping developers create software that is more maintainable, scalable, and reusable. Design patterns encapsulate best practices that have been refined through experience and are documented for others to use.

## What Problems Do Design Patterns Solve?

1.  **Code Reusability**:

    - Design patterns encourage code reuse by providing standard solutions that can be applied across different projects. For example, using the **Factory Pattern** allows you to create objects without specifying the exact class of the object, making it easier to extend and modify your code later.

2.  **Maintainability**:

    - By following design patterns, developers create code that is easier to maintain and understand. Patterns help to structure code in a way that clarifies the relationships between classes and components, making it easier to spot issues and make changes. For instance, the **Observer Pattern** allows for easy management of state changes and notifications, simplifying the maintenance of interdependent objects.

3.  **Flexibility and Extensibility**:

    - Patterns promote flexibility in software design, allowing for changes and extensions without significant rewrites. For example, the **Strategy Pattern** allows for the dynamic selection of algorithms at runtime, enabling you to introduce new strategies without modifying the existing codebase.

4.  **Decoupling**:

    - Many design patterns focus on decoupling components in a system, reducing the dependencies between them. For example, the **Dependency Injection Pattern** helps to invert the control of object creation, making it easier to manage dependencies and test components in isolation.

5.  **Standardization**:

    - Design patterns provide a common vocabulary and framework for discussing design issues. This standardization helps teams communicate more effectively and understand each other's work. Patterns like **MVC (Model-View-Controller)** provide a clear separation of concerns, making it easier for team members to collaborate on different aspects of an application.

### Common Types of Design Patterns

1.  **Creational Patterns**: Concerned with object creation.

2.  **Structural Patterns**: Focused on object composition.

3.  **Behavioral Patterns**: Deal with object interaction and responsibilities.

Let's explore some common C# design patterns with examples:

**Creational Patterns** are design patterns that deal with object creation mechanisms. They help control the process of object creation to make it more flexible, reusable, and efficient. These patterns abstract the instantiation process and ensure that the right objects are created in the right manner, often avoiding excessive complexity or dependency on specific classes.

Let’s look at some commonly used **Creational Patterns** with simple explanations and examples.

### 1. Singleton Pattern

The **Singleton Pattern** ensures that a class has only one instance and provides a global point of access to that instance. This is useful when exactly one object is needed to coordinate actions across a system, like logging, configuration management, or database connections. The constructor of the Singleton class is made **private**, so it cannot be instantiated from outside the class. By adding the **sealed** keyword before the class declaration, you prevent any other class from inheriting from Singleton. This ensures that no subclass can create its own instance of the Singleton class, which could potentially violate the Singleton pattern by allowing multiple instances to exist. So, while it's not strictly necessary to seal a Singleton class, it can help reinforce the intent of the pattern and prevent unintended usage.

Ensuring **thread safety** in a Singleton implementation is crucial to prevent multiple threads from creating multiple instances of the Singleton class simultaneously. You can use a **lock** statement to ensure that only one thread can access the creation logic at a time.

**Lazy loading -** Lazy loading defers the creation of the Singleton instance until the first time it is requested. This approach is useful when the instantiation of the Singleton object is resource-intensive or when you want to delay the initialization until it's actually needed.

**Eager Loading** - Eager loading initializes the Singleton instance at the time the class is loaded or at application startup, regardless of whether it's immediately needed or not. This approach ensures that the Singleton instance is always available when the application starts.

**Static Class** - A static class is a class that cannot be instantiated, meaning you cannot create objects of that class. All members of a static class must be static, and the class itself is implicitly sealed, meaning you cannot inherit from it.

#### Using Lazy Initialization (Recommended):

```csharp
public class Singleton
{
// Private static readonly instance, initialized lazily
private static readonly Lazy<Singleton> _instance = new Lazy<Singleton>(() => new Singleton());
// Private constructor to prevent instantiation from outside
private Singleton()
{
// Initialization code here
}
// Public static property to get the instance
public static Singleton Instance
{
```

get

```csharp
{
return _instance.Value;
}
}
// Example method
public void SomeMethod()
{
Console.WriteLine("Method called on Singleton instance.");
}
}
// Usage
class Program
{
static void Main(string[] args)
{
Singleton singleton = Singleton.Instance;
singleton.SomeMethod();
}
}
```

### Explanation of the Code:

1.  **Lazy Initialization**:

    - The Lazy<T> type is used to ensure that the Singleton instance is created only when it is accessed for the first time. This approach is efficient and handles thread safety automatically.

2.  **Private Constructor**:

    - The constructor of the Singleton class is private, which prevents instantiation from outside the class. This ensures that no other instances can be created.

3.  **Static Instance Property**:

    - The Instance property provides a global point of access to the Singleton instance. The instance is accessed through the Lazy<Singleton> object, ensuring that it is created only once and is thread-safe.

4.  **Example Method**:

    - The SomeMethod() function demonstrates how you can add methods to the Singleton class.

### Benefits of This Implementation:

- **Thread Safety**: The use of Lazy<T> ensures that the instance is created in a thread-safe manner without requiring complex locking mechanisms.

- **Performance**: The Singleton instance is created only when it is first accessed, which can save resources if the instance is not always needed.

### Alternative Thread-Safe Implementation Using Double-Check Locking:

Here’s another way to implement a thread-safe Singleton using double-check locking:

```csharp
public class Singleton
{
private static Singleton _instance;
private static readonly object _lock = new object();
// Private constructor
private Singleton()
{
// Initialization code here
}
public static Singleton Instance
{
```

get

```csharp
{
// First check (no locking)
if (_instance == null)
{
// Locking to ensure thread safety
lock (_lock)
{
// Second check (with locking)
if (_instance == null)
{
_instance = new Singleton();
}
}
}
return _instance;
}
}
public void SomeMethod()
{
Console.WriteLine("Method called on Singleton instance.");
}
}
// Usage
class Program
{
static void Main(string[] args)
{
Singleton singleton = Singleton.Instance;
singleton.SomeMethod();
}
}
```

### Explanation of Double-Check Locking:

1.  **First Check (No Locking)**: The first if checks whether the instance is null without acquiring the lock. This is to avoid the overhead of locking every time the property is accessed once the instance is created.

2.  **Locking**: The lock statement ensures that only one thread can enter this section of code at a time, providing thread safety.

3.  **Second Check (With Locking)**: The second if check inside the lock ensures that the instance is still null before creating it, preventing multiple threads from creating multiple instances.

### 2. Factory Method Pattern

The **Factory Method Pattern** provides a way to delegate the creation of objects to subclasses. Instead of instantiating objects directly, a factory method is used to create them, which makes the code more flexible and easy to extend.

### Real-life Example

### Code Example

// Product Interface

```csharp
public interface IAnimal
{
void Speak();
}
// Concrete Product 1
public class Dog : IAnimal
{
public void Speak()
{
Console.WriteLine("Dog says: Woof!");
}
}
// Concrete Product 2
public class Cat : IAnimal
{
public void Speak()
{
Console.WriteLine("Cat says: Meow!");
}
}
// Factory Class
public abstract class AnimalFactory
{
public abstract IAnimal CreateAnimal();
}
// Concrete Factory for Dogs
public class DogFactory : AnimalFactory
{
public override IAnimal CreateAnimal()
{
return new Dog();
}
}
// Concrete Factory for Cats
public class CatFactory : AnimalFactory
{
public override IAnimal CreateAnimal()
{
return new Cat();
}
}
// Usage
var dogFactory = new DogFactory();
var dog = dogFactory.CreateAnimal();
dog.Speak(); // Output: Dog says: Woof!
var catFactory = new CatFactory();
var cat = catFactory.CreateAnimal();
cat.Speak(); // Output: Cat says: Meow!
```

Here, **AnimalFactory** uses a factory method to create different types of animals (Dog, Cat) without needing to know the specifics of how they’re created.

### 3. Abstract Factory Pattern

The **Abstract Factory Pattern** is like the Factory Method but is used to create families of related objects without specifying their exact classes. This pattern provides an interface for creating related or dependent objects without coupling the client to the specific classes.

### Real-life Example

Think of a **furniture store** that sells different styles of furniture like Victorian, Modern, or Rustic. The store offers complete sets of furniture (chairs, sofas, tables) that belong to a specific style. You can choose a style, and the store will provide the whole set of furniture.

### Code Example

// Abstract Product 1

```csharp
public interface IChair
{
void SitOn();
}
// Abstract Product 2
public interface ISofa
{
void LieOn();
}
// Concrete Product 1: Modern Chair
public class ModernChair : IChair
{
public void SitOn()
{
Console.WriteLine("Sitting on a modern chair.");
}
}
// Concrete Product 2: Modern Sofa
public class ModernSofa : ISofa
{
public void LieOn()
{
Console.WriteLine("Lying on a modern sofa.");
}
}
// Concrete Product 1: Victorian Chair
public class VictorianChair : IChair
{
public void SitOn()
{
Console.WriteLine("Sitting on a Victorian chair.");
}
}
// Concrete Product 2: Victorian Sofa
public class VictorianSofa : ISofa
{
public void LieOn()
{
Console.WriteLine("Lying on a Victorian sofa.");
}
}
// Abstract Factory
public interface IFurnitureFactory
{
IChair CreateChair();
ISofa CreateSofa();
}
// Concrete Factory for Modern Furniture
public class ModernFurnitureFactory : IFurnitureFactory
{
public IChair CreateChair()
{
return new ModernChair();
}
public ISofa CreateSofa()
{
return new ModernSofa();
}
}
// Concrete Factory for Victorian Furniture
public class VictorianFurnitureFactory : IFurnitureFactory
{
public IChair CreateChair()
{
return new VictorianChair();
}
public ISofa CreateSofa()
{
return new VictorianSofa();
}
}
// Usage
var modernFactory = new ModernFurnitureFactory();
var modernChair = modernFactory.CreateChair();
var modernSofa = modernFactory.CreateSofa();
modernChair.SitOn(); // Output: Sitting on a modern chair.
modernSofa.LieOn(); // Output: Lying on a modern sofa.
var victorianFactory = new VictorianFurnitureFactory();
var victorianChair = victorianFactory.CreateChair();
var victorianSofa = victorianFactory.CreateSofa();
victorianChair.SitOn(); // Output: Sitting on a Victorian chair.
victorianSofa.LieOn(); // Output: Lying on a Victorian sofa.
```

In this example, the **FurnitureFactory** creates an entire family of furniture objects (Chair, Sofa) based on the style, without knowing the specific class details.

### 4. Builder Pattern

The **Builder Pattern** is used to create complex objects step-by-step. Instead of a large constructor, the builder pattern allows you to construct objects by specifying only the parts you need. It is particularly useful for creating objects with many optional parameters.

### Real-life Example

Think of building a **burger** at a fast-food restaurant. You can customize it by choosing the bread, patty, toppings, and sauces, step by step.

### Code Example

// Product Class

```csharp
public class Burger
{
public string Bread { get; set; }
public string Patty { get; set; }
public string Toppings { get; set; }
public string Sauce { get; set; }
public void ShowDetails()
{
Console.WriteLine($"Burger with {Bread} bread, {Patty} patty, {Toppings}, and {Sauce}.");
}
}
// Builder Interface
public interface IBurgerBuilder
{
void AddBread(string bread);
void AddPatty(string patty);
void AddToppings(string toppings);
void AddSauce(string sauce);
Burger Build();
}
// Concrete Builder
public class BurgerBuilder : IBurgerBuilder
{
private Burger _burger = new Burger();
public void AddBread(string bread)
{
_burger.Bread = bread;
}
public void AddPatty(string patty)
{
_burger.Patty = patty;
}
public void AddToppings(string toppings)
{
_burger.Toppings = toppings;
}
public void AddSauce(string sauce)
{
_burger.Sauce = sauce;
}
public Burger Build()
{
return _burger;
}
}
// Director Class
public class Chef
{
private IBurgerBuilder _burgerBuilder;
public Chef(IBurgerBuilder burgerBuilder)
{
_burgerBuilder = burgerBuilder;
}
public void MakeCheeseBurger()
{
_burgerBuilder.AddBread("Sesame");
_burgerBuilder.AddPatty("Beef");
_burgerBuilder.AddToppings("Cheese, Lettuce");
_burgerBuilder.AddSauce("Ketchup");
}
public Burger GetBurger()
{
return _burgerBuilder.Build();
}
}
// Usage
var burgerBuilder = new BurgerBuilder();
var chef = new Chef(burgerBuilder);
chef.MakeCheeseBurger();
var burger = chef.GetBurger();
burger.ShowDetails(); // Output: Burger with Sesame bread, Beef patty, Cheese, Lettuce, and Ketchup.
```

In this example, the **Builder Pattern** allows you to build a **Burger** step by step, which is useful for creating complex products with different options.

### 5. Prototype Pattern

The **Prototype Pattern** is used to create new objects by copying existing objects, called prototypes. This is useful when object creation is costly, and you can make new objects by cloning an existing one instead of re-creating it from scratch.

### Real-life Example

Think of a **3D game** where trees are scattered around the environment. Instead of creating each tree from scratch, the game can clone a single tree model and place it in different locations.

### Code Example

// Prototype Interface

```csharp
public abstract class Shape
{
public abstract Shape Clone();
}
// Concrete Prototype 1
public class Circle : Shape
{
public int Radius { get; set; }
public Circle(int radius)
{
Radius = radius;
}
public override Shape Clone()
{
return new Circle(Radius);
}
public void Draw()
{
Console.WriteLine($"Circle with radius {Radius}");
}
}
// Concrete Prototype 2
public class Rectangle : Shape
{
public int Width { get; set; }
public int Height { get; set; }
public Rectangle(int width, int height)
{
Width = width;
Height = height;
}
public override Shape Clone()
{
return new Rectangle(Width, Height);
}
public void Draw()
{
Console.WriteLine($"Rectangle with width {Width} and height {Height}");
}
}
// Usage
var originalCircle = new Circle(10);
var clonedCircle = originalCircle.Clone();
var originalRectangle = new Rectangle(20, 30);
var clonedRectangle = originalRectangle.Clone();
originalCircle.Draw(); // Output: Circle with radius 10
clonedCircle.Draw(); // Output: Circle with radius 10
originalRectangle.Draw(); // Output: Rectangle with width 20 and height 30
clonedRectangle.Draw(); // Output: Rectangle with width 20 and height 30
```

In this example, **Prototype** allows cloning of objects (like **Circle** and **Rectangle**) without creating them from scratch.

### Summary

- **Singleton Pattern** ensures only one instance of a class.

- **Factory Method Pattern** creates objects using a method, allowing subclasses to alter the object creation.

- **Abstract Factory Pattern** creates families of related objects.

- **Builder Pattern** builds complex objects step by step.

- **Prototype Pattern** clones existing objects to create new ones.

**Structural Patterns** are design patterns that focus on how classes and objects are composed to form larger structures, ensuring that the system remains flexible and easy to maintain. These patterns help simplify the relationships between different objects, allowing them to work together even if their interfaces are incompatible or if they need additional functionality.

Let’s break down some common **Structural Patterns** in easy language, with examples.

### 1. Adapter Pattern

The **Adapter Pattern** acts as a bridge between two incompatible interfaces. It allows objects with different interfaces to work together by creating an "adapter" that converts one interface into another.

### Real-life Example

Imagine you have a phone charger that only fits the UK plug (three pins), but you are in Europe where the sockets are different (two pins). You use a plug **adapter** to convert the UK plug into the European socket. This adapter lets you use your charger without changing either the socket or the plug.

### Code Example

// Old system interface (ITarget)

```csharp
public interface ITarget
{
void Request();
}
// New system that doesn't match the old one (Adaptee)
public class Adaptee
{
public void SpecificRequest()
{
Console.WriteLine("Specific request in Adaptee");
}
}
// Adapter makes Adaptee's interface compatible with ITarget
public class Adapter : ITarget
{
private Adaptee _adaptee;
public Adapter(Adaptee adaptee)
{
_adaptee = adaptee;
}
public void Request()
{
_adaptee.SpecificRequest(); // Adapting to the new method
}
}
// Usage
ITarget adapter = new Adapter(new Adaptee());
adapter.Request(); // Calls the SpecificRequest method of Adaptee
```

The **Adapter** allows two incompatible systems (ITarget and Adaptee) to communicate without changing their code.

### 2. Decorator Pattern

The **Decorator Pattern** allows you to add new functionality to objects dynamically, without altering their structure. It "wraps" the original object in a new class that adds extra behavior.

### Real-life Example

Think of a gift box. You can add extra features to it—wrapping paper, a ribbon, a card—without changing the gift inside. These are "decorations" that enhance the gift.

### Code Example

```csharp
public interface IComponent
{
string Operation();
}
public class ConcreteComponent : IComponent
{
public string Operation() => "I am a plain component";
}
// The base decorator
public class Decorator : IComponent
{
protected IComponent _component;
public Decorator(IComponent component)
{
_component = component;
}
public virtual string Operation()
{
return _component.Operation(); // Pass-through
}
}
// A concrete decorator that adds extra behavior
public class ConcreteDecorator : Decorator
{
public ConcreteDecorator(IComponent component) : base(component) { }
public override string Operation()
{
return $"[Decorated] {base.Operation()}";
}
}
// Usage
IComponent component = new ConcreteComponent();
IComponent decoratedComponent = new ConcreteDecorator(component);
Console.WriteLine(decoratedComponent.Operation()); // Output: [Decorated] I am a plain component
```

Here, the **Decorator** adds extra functionality ("[Decorated]") to the component, but the original object (ConcreteComponent) remains unchanged.

### 3. Facade Pattern

The **Facade Pattern** provides a simplified interface to a complex system or set of classes. It hides the complexity of the system and makes it easier to use.

### Real-life Example

Imagine a home theater system. It has multiple components like a DVD player, projector, speakers, etc. Instead of interacting with each of them separately, you use a **remote control (Facade)** that simplifies the process by giving you a single interface to turn everything on or off.

### Code Example

// Complex system

```csharp
public class DVDPlayer
{
public void TurnOn() => Console.WriteLine("DVD Player is On");
public void Play() => Console.WriteLine("DVD is Playing");
}
public class Projector
{
public void TurnOn() => Console.WriteLine("Projector is On");
}
public class SoundSystem
{
public void TurnOn() => Console.WriteLine("Sound System is On");
}
// Facade that simplifies the operation of the entire system
public class HomeTheaterFacade
{
private DVDPlayer _dvdPlayer;
private Projector _projector;
private SoundSystem _soundSystem;
public HomeTheaterFacade(DVDPlayer dvdPlayer, Projector projector, SoundSystem soundSystem)
{
_dvdPlayer = dvdPlayer;
_projector = projector;
_soundSystem = soundSystem;
}
public void WatchMovie()
{
_dvdPlayer.TurnOn();
_projector.TurnOn();
_soundSystem.TurnOn();
_dvdPlayer.Play();
}
}
// Usage
var dvdPlayer = new DVDPlayer();
var projector = new Projector();
var soundSystem = new SoundSystem();
var homeTheater = new HomeTheaterFacade(dvdPlayer, projector, soundSystem);
homeTheater.WatchMovie(); // Simplified interaction
```

In this example, the **Facade** (HomeTheaterFacade) simplifies the operation of a complex home theater system by providing a single method (WatchMovie).

### 4. Composite Pattern

The **Composite Pattern** lets you treat individual objects and compositions of objects uniformly. It is useful when you want to represent a part-whole hierarchy.

### Real-life Example

A **folder** on your computer can contain files or other folders (which, in turn, contain files or more folders). You interact with all of them the same way—you can open, rename, or delete both individual files and entire folders.

### Code Example

// Component interface

```csharp
public interface IFileSystemComponent
{
void Display();
}
// Leaf (File)
public class File : IFileSystemComponent
{
private string _name;
public File(string name)
{
_name = name;
}
public void Display()
{
Console.WriteLine(_name);
}
}
// Composite (Folder)
public class Folder : IFileSystemComponent
{
private string _name;
private List<IFileSystemComponent> _components = new List<IFileSystemComponent>();
public Folder(string name)
{
_name = name;
}
public void AddComponent(IFileSystemComponent component)
{
_components.Add(component);
}
public void Display()
{
Console.WriteLine($"Folder: {_name}");
foreach (var component in _components)
{
component.Display(); // Calls Display of both files and sub-folders
}
}
}
// Usage
var file1 = new File("file1.txt");
var file2 = new File("file2.txt");
var folder = new Folder("MyFolder");
folder.AddComponent(file1);
folder.AddComponent(file2);
folder.Display(); // Displays the folder and its files
```

Here, both files and folders implement the same interface (IFileSystemComponent), allowing you to treat them the same way, even though folders can contain files.

### 5. Proxy Pattern

The **Proxy Pattern** provides a placeholder for another object to control access to it. The proxy can perform additional operations like controlling access or lazy loading before forwarding a request to the real object.

### Real-life Example

Think of a **credit card** as a proxy for cash. Instead of carrying cash, you use the card (proxy) to represent the money you have in the bank.

### Code Example

// Real Subject

```csharp
public class RealSubject : ISubject
{
public void Request()
{
Console.WriteLine("Real subject handling request.");
}
}
// Proxy that controls access to the real subject
public class Proxy : ISubject
{
private RealSubject _realSubject;
public void Request()
{
if (_realSubject == null)
{
_realSubject = new RealSubject(); // Lazy initialization
}
Console.WriteLine("Proxy checking access before forwarding the request.");
_realSubject.Request();
}
}
// Usage
ISubject proxy = new Proxy();
proxy.Request(); // Proxy controls access to RealSubject
```

In this example, the **Proxy** controls access to the RealSubject and can add extra behavior (like access control) before forwarding the request.

### Conclusion

**Structural Patterns** help organize your system's structure by dealing with object composition and simplifying relationships between classes. They ensure that even if the system grows or changes, the objects can still work together efficiently. By understanding these patterns, you can design more flexible and maintainable systems.

**Behavioral Patterns** are design patterns that focus on how objects interact with one another. These patterns help define the communication between objects in a flexible, efficient way, promoting loose coupling. They are concerned with how responsibilities are assigned and how objects delegate and cooperate to perform tasks.

Let’s go through some common **Behavioral Patterns** with simple explanations and examples.

### 1. Observer Pattern

The **Observer Pattern** defines a one-to-many relationship where multiple objects (observers) are notified of changes to a single object (subject). This is useful when changes in one object need to trigger updates in other dependent objects automatically.

### Real-life Example

Imagine a YouTube channel (subject) and its subscribers (observers). When the channel uploads a new video, all the subscribers are notified automatically.

### Code Example

// The Subject (YouTube Channel)

```csharp
public class YouTubeChannel
{
private List<ISubscriber> subscribers = new List<ISubscriber>();
public void Subscribe(ISubscriber subscriber)
{
subscribers.Add(subscriber);
}
public void NotifySubscribers(string videoTitle)
{
foreach (var subscriber in subscribers)
{
subscriber.Update(videoTitle);
}
}
public void UploadVideo(string title)
{
Console.WriteLine($"Uploaded video: {title}");
NotifySubscribers(title); // Notify all subscribers
}
}
// The Observer (Subscriber)
public interface ISubscriber
{
void Update(string videoTitle);
}
// Concrete Observer
public class Subscriber : ISubscriber
{
private string _name;
public Subscriber(string name)
{
_name = name;
}
public void Update(string videoTitle)
{
Console.WriteLine($"{_name} notified of new video: {videoTitle}");
}
}
// Usage
var channel = new YouTubeChannel();
var subscriber1 = new Subscriber("John");
var subscriber2 = new Subscriber("Jane");
channel.Subscribe(subscriber1);
channel.Subscribe(subscriber2);
```

channel.UploadVideo("Observer Pattern Tutorial"); // Notifies all subscribers

In this example, the **YouTubeChannel** is the subject that notifies its **Subscribers** whenever a new video is uploaded.

### 2. Strategy Pattern

The **Strategy Pattern** allows you to define a family of algorithms, encapsulate each one, and make them interchangeable. The client can choose which algorithm to use at runtime, without modifying the context class.

### Real-life Example

Think of a **navigation app**. It can offer different routes to reach a destination—by car, by bike, or walking. You can select the desired **strategy** based on your preference.

### Code Example

// Strategy Interface

```csharp
public interface IRouteStrategy
{
void BuildRoute(string startPoint, string endPoint);
}
// Concrete Strategy 1: Car Route
public class CarRouteStrategy : IRouteStrategy
{
public void BuildRoute(string startPoint, string endPoint)
{
Console.WriteLine($"Building car route from {startPoint} to {endPoint}");
}
}
// Concrete Strategy 2: Bike Route
public class BikeRouteStrategy : IRouteStrategy
{
public void BuildRoute(string startPoint, string endPoint)
{
Console.WriteLine($"Building bike route from {startPoint} to {endPoint}");
}
}
// Context: Navigation
public class Navigation
{
private IRouteStrategy _routeStrategy;
public void SetRouteStrategy(IRouteStrategy routeStrategy)
{
_routeStrategy = routeStrategy;
}
public void BuildRoute(string startPoint, string endPoint)
{
```

_routeStrategy.BuildRoute(startPoint, endPoint); // Delegate route building to the strategy

```csharp
}
}
// Usage
var navigation = new Navigation();
navigation.SetRouteStrategy(new CarRouteStrategy());
navigation.BuildRoute("Home", "Office");
navigation.SetRouteStrategy(new BikeRouteStrategy());
navigation.BuildRoute("Home", "Park");
```

Here, the **Navigation** class delegates the route-building task to the chosen **strategy** (car or bike) at runtime.

### 3. Command Pattern

The **Command Pattern** turns a request into a stand-alone object (command), allowing the system to log, queue, and execute requests at a later time. It decouples the sender of a request from its receiver.

### Real-life Example

Think of a **remote control** for a TV. Each button (command) encapsulates a specific operation (e.g., volume up, volume down), and the TV executes it when the button is pressed.

### Code Example

// Command Interface

```csharp
public interface ICommand
{
void Execute();
}
// Concrete Command 1: Turn TV On
public class TurnOnCommand : ICommand
{
private TV _tv;
public TurnOnCommand(TV tv)
{
_tv = tv;
}
public void Execute()
{
_tv.TurnOn();
}
}
// Concrete Command 2: Turn TV Off
public class TurnOffCommand : ICommand
{
private TV _tv;
public TurnOffCommand(TV tv)
{
_tv = tv;
}
public void Execute()
{
_tv.TurnOff();
}
}
// Receiver (TV)
public class TV
{
public void TurnOn()
{
Console.WriteLine("TV is now ON");
}
public void TurnOff()
{
Console.WriteLine("TV is now OFF");
}
}
// Invoker (Remote Control)
public class RemoteControl
{
private ICommand _command;
public void SetCommand(ICommand command)
{
_command = command;
}
public void PressButton()
{
_command.Execute();
}
}
// Usage
var tv = new TV();
var remote = new RemoteControl();
var turnOnCommand = new TurnOnCommand(tv);
var turnOffCommand = new TurnOffCommand(tv);
remote.SetCommand(turnOnCommand);
remote.PressButton(); // TV is now ON
remote.SetCommand(turnOffCommand);
remote.PressButton(); // TV is now OFF
```

In this example, the **RemoteControl** acts as the invoker, while **TurnOnCommand** and **TurnOffCommand** encapsulate the request to turn the TV on or off.

### 4. Chain of Responsibility Pattern

The **Chain of Responsibility Pattern** passes a request along a chain of handlers. Each handler either handles the request or passes it to the next handler in the chain. This pattern avoids coupling the sender of a request with its receiver.

### Code Example

// Handler Interface

```csharp
public abstract class SupportHandler
{
protected SupportHandler _nextHandler;
public void SetNext(SupportHandler handler)
{
_nextHandler = handler;
}
public abstract void HandleRequest(string issue);
}
// Concrete Handler 1: Basic Support
public class BasicSupportHandler : SupportHandler
{
public override void HandleRequest(string issue)
{
if (issue == "basic")
{
Console.WriteLine("Basic support handled the issue.");
}
```

else

```csharp
{
_nextHandler?.HandleRequest(issue);
}
}
}
// Concrete Handler 2: Senior Support
public class SeniorSupportHandler : SupportHandler
{
public override void HandleRequest(string issue)
{
if (issue == "intermediate")
{
Console.WriteLine("Senior support handled the issue.");
}
```

else

```csharp
{
_nextHandler?.HandleRequest(issue);
}
}
}
// Concrete Handler 3: Manager Support
public class ManagerSupportHandler : SupportHandler
{
public override void HandleRequest(string issue)
{
Console.WriteLine("Manager handled the issue.");
}
}
// Usage
var basicSupport = new BasicSupportHandler();
var seniorSupport = new SeniorSupportHandler();
var managerSupport = new ManagerSupportHandler();
basicSupport.SetNext(seniorSupport);
seniorSupport.SetNext(managerSupport);
```

basicSupport.HandleRequest("basic"); // Handled by Basic Support

basicSupport.HandleRequest("intermediate"); // Handled by Senior Support

basicSupport.HandleRequest("complex"); // Handled by Manager

Here, each support level tries to handle the issue. If it can't, it passes the request to the next handler in the chain.

### 5. Mediator Pattern

The **Mediator Pattern** reduces the communication complexity between objects by having them communicate through a mediator. The mediator is responsible for coordinating interactions between different objects, promoting loose coupling.

### Code Example

// Mediator Interface

```csharp
public interface IChatMediator
{
void SendMessage(string message, User user);
}
// Concrete Mediator
public class ChatMediator : IChatMediator
{
private List<User> _users = new List<User>();
public void AddUser(User user)
{
_users.Add(user);
}
public void SendMessage(string message, User user)
{
foreach (var u in _users)
{
if (u != user)
{
u.ReceiveMessage(message);
}
}
}
}
// User Class
public class User
{
private IChatMediator _mediator;
public string Name { get; }
public User(string name, IChatMediator mediator)
{
Name = name;
_mediator = mediator;
}
public void SendMessage(string message)
{
Console.WriteLine($"{Name} sends: {message}");
_mediator.SendMessage(message, this);
}
public void ReceiveMessage(string message)
{
Console.WriteLine($"{Name} receives: {message}");
}
}
// Usage
var mediator = new ChatMediator();
var user1 = new User("John", mediator);
var user2 = new User("Jane", mediator);
var user3 = new User("Bob", mediator);
mediator.AddUser(user1);
mediator.AddUser(user2);
mediator.AddUser(user3);
```

user1.SendMessage("Hello everyone!"); // Jane and Bob receive the message

In this example, the **ChatMediator** facilitates communication between users in the chat system, without them talking directly to each other.
