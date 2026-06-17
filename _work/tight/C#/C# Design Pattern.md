# C# Design Pattern

## Questions Covered

1. What are Design Pattern and what problem they solve?
2. What are the types of Design Patterns?
3. What are Creational Design Patterns?
4. What are Structural Design Patterns?
5. What are Behavioral Design Patterns?

## What are Design Pattern and what problem they solve?

**Design Patterns** are proven, reusable solutions to recurring software-design problems. They encode best practices so code is easier to maintain, extend, and reason about.

**Problems they solve:**

| Problem | How patterns help | Example |
|---------|-------------------|---------|
| Code reusability | Standard templates applied across projects | Factory — create objects without binding to concrete types |
| Maintainability | Clear structure and relationships between components | Observer — manage state changes and notifications |
| Flexibility | Extend behavior without large rewrites | Strategy — swap algorithms at runtime |
| Decoupling | Reduce dependencies between components | Dependency Injection — invert object creation |
| Standardization | Shared vocabulary for design discussions | MVC — separation of concerns |

## What are the types of Design Patterns?

Three categories (Gang of Four):

1. **Creational** — object creation mechanisms
2. **Structural** — object composition and relationships
3. **Behavioral** — object interaction and responsibility assignment

## What are Creational Design Patterns?

Creational patterns abstract instantiation so the right objects are created flexibly without tight coupling to concrete classes.

### Singleton

Ensures one instance with global access (logging, config, DB connections). Private constructor prevents external instantiation; `sealed` blocks subclassing that could create extra instances. Thread safety is critical — without it, multiple threads can create multiple instances.

- **Lazy loading** — create on first request; defers costly initialization
- **Eager loading** — create at class load / startup; always available immediately
- **Static class** — all members static; cannot instantiate or inherit (similar but not identical to Singleton)

**Lazy initialization (recommended):**

```csharp
public class Singleton
{
    private static readonly Lazy<Singleton> _instance = new Lazy<Singleton>(() => new Singleton());

    private Singleton() { }

    public static Singleton Instance => _instance.Value;

    public void SomeMethod() => Console.WriteLine("Method called on Singleton instance.");
}

// Usage
Singleton singleton = Singleton.Instance;
singleton.SomeMethod();
```

`Lazy<T>` is thread-safe and creates the instance only on first access.

**Double-check locking alternative:**

```csharp
public class Singleton
{
    private static Singleton _instance;
    private static readonly object _lock = new object();

    private Singleton() { }

    public static Singleton Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                        _instance = new Singleton();
                }
            }
            return _instance;
        }
    }

    public void SomeMethod() => Console.WriteLine("Method called on Singleton instance.");
}
```

First check avoids lock overhead after creation; second check inside lock prevents duplicate instances.

### Factory Method

Delegates object creation to subclasses via a factory method instead of `new` in client code. Client code depends on the abstract factory, not concrete product types — easy to add new products by adding a new factory subclass.

```csharp
public interface IAnimal { void Speak(); }

public class Dog : IAnimal
{
    public void Speak() => Console.WriteLine("Dog says: Woof!");
}

public class Cat : IAnimal
{
    public void Speak() => Console.WriteLine("Cat says: Meow!");
}

public abstract class AnimalFactory
{
    public abstract IAnimal CreateAnimal();
}

public class DogFactory : AnimalFactory
{
    public override IAnimal CreateAnimal() => new Dog();
}

public class CatFactory : AnimalFactory
{
    public override IAnimal CreateAnimal() => new Cat();
}

// Usage
var dog = new DogFactory().CreateAnimal();
dog.Speak(); // Dog says: Woof!
var cat = new CatFactory().CreateAnimal();
cat.Speak(); // Cat says: Meow!
```

### Abstract Factory

Creates **families** of related objects without coupling the client to concrete classes. Like a furniture store offering complete Victorian or Modern sets (chair + sofa) — pick a style factory and get matching pieces.

```csharp
public interface IChair { void SitOn(); }
public interface ISofa { void LieOn(); }

public class ModernChair : IChair
{
    public void SitOn() => Console.WriteLine("Sitting on a modern chair.");
}

public class ModernSofa : ISofa
{
    public void LieOn() => Console.WriteLine("Lying on a modern sofa.");
}

public class VictorianChair : IChair
{
    public void SitOn() => Console.WriteLine("Sitting on a Victorian chair.");
}

public class VictorianSofa : ISofa
{
    public void LieOn() => Console.WriteLine("Lying on a Victorian sofa.");
}

public interface IFurnitureFactory
{
    IChair CreateChair();
    ISofa CreateSofa();
}

public class ModernFurnitureFactory : IFurnitureFactory
{
    public IChair CreateChair() => new ModernChair();
    public ISofa CreateSofa() => new ModernSofa();
}

public class VictorianFurnitureFactory : IFurnitureFactory
{
    public IChair CreateChair() => new VictorianChair();
    public ISofa CreateSofa() => new VictorianSofa();
}

// Usage
var modern = new ModernFurnitureFactory();
modern.CreateChair().SitOn();
modern.CreateSofa().LieOn();
```

### Builder

Builds complex objects step-by-step instead of one large constructor — useful for many optional parameters. Like customizing a burger: bread, patty, toppings, sauce added incrementally. A **Director** (`Chef`) can define standard build sequences.

```csharp
public class Burger
{
    public string Bread { get; set; }
    public string Patty { get; set; }
    public string Toppings { get; set; }
    public string Sauce { get; set; }

    public void ShowDetails() =>
        Console.WriteLine($"Burger with {Bread} bread, {Patty} patty, {Toppings}, and {Sauce}.");
}

public interface IBurgerBuilder
{
    void AddBread(string bread);
    void AddPatty(string patty);
    void AddToppings(string toppings);
    void AddSauce(string sauce);
    Burger Build();
}

public class BurgerBuilder : IBurgerBuilder
{
    private Burger _burger = new Burger();

    public void AddBread(string bread) => _burger.Bread = bread;
    public void AddPatty(string patty) => _burger.Patty = patty;
    public void AddToppings(string toppings) => _burger.Toppings = toppings;
    public void AddSauce(string sauce) => _burger.Sauce = sauce;
    public Burger Build() => _burger;
}

public class Chef
{
    private readonly IBurgerBuilder _burgerBuilder;

    public Chef(IBurgerBuilder burgerBuilder) => _burgerBuilder = burgerBuilder;

    public void MakeCheeseBurger()
    {
        _burgerBuilder.AddBread("Sesame");
        _burgerBuilder.AddPatty("Beef");
        _burgerBuilder.AddToppings("Cheese, Lettuce");
        _burgerBuilder.AddSauce("Ketchup");
    }

    public Burger GetBurger() => _burgerBuilder.Build();
}

// Usage
var chef = new Chef(new BurgerBuilder());
chef.MakeCheeseBurger();
chef.GetBurger().ShowDetails();
```

### Prototype

Creates new objects by cloning existing prototypes — avoids costly re-creation. Useful when object construction is expensive (e.g., cloning tree models in a 3D game environment).

```csharp
public abstract class Shape
{
    public abstract Shape Clone();
}

public class Circle : Shape
{
    public int Radius { get; set; }
    public Circle(int radius) => Radius = radius;
    public override Shape Clone() => new Circle(Radius);
    public void Draw() => Console.WriteLine($"Circle with radius {Radius}");
}

public class Rectangle : Shape
{
    public int Width { get; set; }
    public int Height { get; set; }
    public Rectangle(int width, int height) { Width = width; Height = height; }
    public override Shape Clone() => new Rectangle(Width, Height);
    public void Draw() => Console.WriteLine($"Rectangle with width {Width} and height {Height}");
}

// Usage
var originalCircle = new Circle(10);
var clonedCircle = (Circle)originalCircle.Clone();
originalCircle.Draw();
clonedCircle.Draw();
```

**Creational summary:** Singleton (one instance) · Factory Method (subclass decides creation) · Abstract Factory (related object families) · Builder (step-by-step construction) · Prototype (clone existing objects)

## What are Structural Design Patterns?

Structural patterns compose classes/objects into larger structures while keeping the system flexible and maintainable.

### Adapter

Bridges incompatible interfaces so two systems work together without changing either. Like a plug adapter converting a UK three-pin plug to a European two-pin socket.

```csharp
public interface ITarget { void Request(); }

public class Adaptee
{
    public void SpecificRequest() => Console.WriteLine("Specific request in Adaptee");
}

public class Adapter : ITarget
{
    private readonly Adaptee _adaptee;
    public Adapter(Adaptee adaptee) => _adaptee = adaptee;
    public void Request() => _adaptee.SpecificRequest();
}

// Usage
ITarget adapter = new Adapter(new Adaptee());
adapter.Request();
```

### Decorator

Adds behavior dynamically by wrapping an object without altering its structure. Like adding wrapping paper and ribbon to a gift — the gift inside stays the same.

```csharp
public interface IComponent { string Operation(); }

public class ConcreteComponent : IComponent
{
    public string Operation() => "I am a plain component";
}

public class Decorator : IComponent
{
    protected readonly IComponent _component;
    public Decorator(IComponent component) => _component = component;
    public virtual string Operation() => _component.Operation();
}

public class ConcreteDecorator : Decorator
{
    public ConcreteDecorator(IComponent component) : base(component) { }
    public override string Operation() => $"[Decorated] {base.Operation()}";
}

// Usage
IComponent decorated = new ConcreteDecorator(new ConcreteComponent());
Console.WriteLine(decorated.Operation()); // [Decorated] I am a plain component
```

### Facade

Simplified interface over a complex subsystem. A home-theater remote turns on DVD, projector, and speakers with one `WatchMovie()` call instead of managing each component separately.

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

public class HomeTheaterFacade
{
    private readonly DVDPlayer _dvdPlayer;
    private readonly Projector _projector;
    private readonly SoundSystem _soundSystem;

    public HomeTheaterFacade(DVDPlayer dvd, Projector projector, SoundSystem sound)
    {
        _dvdPlayer = dvd;
        _projector = projector;
        _soundSystem = sound;
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
var homeTheater = new HomeTheaterFacade(new DVDPlayer(), new Projector(), new SoundSystem());
homeTheater.WatchMovie();
```

### Composite

Treats individual objects and compositions uniformly — part-whole hierarchies. Files and folders both implement the same interface; folders can contain files or sub-folders, all accessed the same way.

```csharp
public interface IFileSystemComponent { void Display(); }

public class File : IFileSystemComponent
{
    private readonly string _name;
    public File(string name) => _name = name;
    public void Display() => Console.WriteLine(_name);
}

public class Folder : IFileSystemComponent
{
    private readonly string _name;
    private readonly List<IFileSystemComponent> _components = new();

    public Folder(string name) => _name = name;
    public void AddComponent(IFileSystemComponent component) => _components.Add(component);

    public void Display()
    {
        Console.WriteLine($"Folder: {_name}");
        foreach (var component in _components)
            component.Display();
    }
}

// Usage
var folder = new Folder("MyFolder");
folder.AddComponent(new File("file1.txt"));
folder.AddComponent(new File("file2.txt"));
folder.Display();
```

### Proxy

Placeholder controlling access to a real object (lazy init, access control). Like a credit card acting as a proxy for cash — the card represents bank funds without carrying physical money.

```csharp
public interface ISubject { void Request(); }

public class RealSubject : ISubject
{
    public void Request() => Console.WriteLine("Real subject handling request.");
}

public class Proxy : ISubject
{
    private RealSubject _realSubject;

    public void Request()
    {
        if (_realSubject == null)
            _realSubject = new RealSubject();
        Console.WriteLine("Proxy checking access before forwarding the request.");
        _realSubject.Request();
    }
}

// Usage
ISubject proxy = new Proxy();
proxy.Request();
```

**Structural summary:** Adapter (interface bridge) · Decorator (wrap for extra behavior) · Facade (simplified API) · Composite (tree structures) · Proxy (controlled access)

## What are Behavioral Design Patterns?

Behavioral patterns define how objects communicate and distribute responsibilities with loose coupling.

### Observer

One-to-many: subject notifies observers on state change. A YouTube channel (subject) notifies all subscribers (observers) when a new video is uploaded.

```csharp
public class YouTubeChannel
{
    private readonly List<ISubscriber> _subscribers = new();

    public void Subscribe(ISubscriber subscriber) => _subscribers.Add(subscriber);

    public void NotifySubscribers(string videoTitle)
    {
        foreach (var subscriber in _subscribers)
            subscriber.Update(videoTitle);
    }

    public void UploadVideo(string title)
    {
        Console.WriteLine($"Uploaded video: {title}");
        NotifySubscribers(title);
    }
}

public interface ISubscriber { void Update(string videoTitle); }

public class Subscriber : ISubscriber
{
    private readonly string _name;
    public Subscriber(string name) => _name = name;
    public void Update(string videoTitle) =>
        Console.WriteLine($"{_name} notified of new video: {videoTitle}");
}

// Usage
var channel = new YouTubeChannel();
channel.Subscribe(new Subscriber("John"));
channel.Subscribe(new Subscriber("Jane"));
channel.UploadVideo("Observer Pattern Tutorial");
```

### Strategy

Encapsulates interchangeable algorithms; client picks at runtime without changing context. A navigation app offering car, bike, or walking routes — swap the strategy without changing the `Navigation` class.

```csharp
public interface IRouteStrategy
{
    void BuildRoute(string startPoint, string endPoint);
}

public class CarRouteStrategy : IRouteStrategy
{
    public void BuildRoute(string start, string end) =>
        Console.WriteLine($"Building car route from {start} to {end}");
}

public class BikeRouteStrategy : IRouteStrategy
{
    public void BuildRoute(string start, string end) =>
        Console.WriteLine($"Building bike route from {start} to {end}");
}

public class Navigation
{
    private IRouteStrategy _routeStrategy;

    public void SetRouteStrategy(IRouteStrategy routeStrategy) => _routeStrategy = routeStrategy;

    public void BuildRoute(string startPoint, string endPoint) =>
        _routeStrategy.BuildRoute(startPoint, endPoint);
}

// Usage
var navigation = new Navigation();
navigation.SetRouteStrategy(new CarRouteStrategy());
navigation.BuildRoute("Home", "Office");
navigation.SetRouteStrategy(new BikeRouteStrategy());
navigation.BuildRoute("Home", "Park");
```

### Command

Encapsulates a request as an object — enables logging, queuing, undo, and decoupling sender from receiver. A TV remote button encapsulates an operation; the remote (invoker) doesn't know how the TV (receiver) implements it.

```csharp
public interface ICommand { void Execute(); }

public class TV
{
    public void TurnOn() => Console.WriteLine("TV is now ON");
    public void TurnOff() => Console.WriteLine("TV is now OFF");
}

public class TurnOnCommand : ICommand
{
    private readonly TV _tv;
    public TurnOnCommand(TV tv) => _tv = tv;
    public void Execute() => _tv.TurnOn();
}

public class TurnOffCommand : ICommand
{
    private readonly TV _tv;
    public TurnOffCommand(TV tv) => _tv = tv;
    public void Execute() => _tv.TurnOff();
}

public class RemoteControl
{
    private ICommand _command;
    public void SetCommand(ICommand command) => _command = command;
    public void PressButton() => _command.Execute();
}

// Usage
var tv = new TV();
var remote = new RemoteControl();
remote.SetCommand(new TurnOnCommand(tv));
remote.PressButton();
remote.SetCommand(new TurnOffCommand(tv));
remote.PressButton();
```

### Chain of Responsibility

Passes a request along a handler chain; each handler processes or forwards. Support tickets escalate from basic → senior → manager until someone handles the issue.

```csharp
public abstract class SupportHandler
{
    protected SupportHandler _nextHandler;
    public void SetNext(SupportHandler handler) => _nextHandler = handler;
    public abstract void HandleRequest(string issue);
}

public class BasicSupportHandler : SupportHandler
{
    public override void HandleRequest(string issue)
    {
        if (issue == "basic")
            Console.WriteLine("Basic support handled the issue.");
        else
            _nextHandler?.HandleRequest(issue);
    }
}

public class SeniorSupportHandler : SupportHandler
{
    public override void HandleRequest(string issue)
    {
        if (issue == "intermediate")
            Console.WriteLine("Senior support handled the issue.");
        else
            _nextHandler?.HandleRequest(issue);
    }
}

public class ManagerSupportHandler : SupportHandler
{
    public override void HandleRequest(string issue) =>
        Console.WriteLine("Manager handled the issue.");
}

// Usage
var basic = new BasicSupportHandler();
var senior = new SeniorSupportHandler();
var manager = new ManagerSupportHandler();
basic.SetNext(senior);
senior.SetNext(manager);
basic.HandleRequest("basic");
basic.HandleRequest("intermediate");
basic.HandleRequest("complex");
```

### Mediator

Objects communicate through a mediator instead of directly — reduces coupling.

```csharp
public interface IChatMediator { void SendMessage(string message, User user); }

public class ChatMediator : IChatMediator
{
    private readonly List<User> _users = new();
    public void AddUser(User user) => _users.Add(user);

    public void SendMessage(string message, User user)
    {
        foreach (var u in _users)
            if (u != user)
                u.ReceiveMessage(message);
    }
}

public class User
{
    private readonly IChatMediator _mediator;
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

    public void ReceiveMessage(string message) =>
        Console.WriteLine($"{Name} receives: {message}");
}

// Usage
var mediator = new ChatMediator();
var user1 = new User("John", mediator);
var user2 = new User("Jane", mediator);
mediator.AddUser(user1);
mediator.AddUser(user2);
user1.SendMessage("Hello everyone!");
```

**Behavioral summary:** Observer (publish/subscribe) · Strategy (runtime algorithm swap) · Command (request as object) · Chain of Responsibility (handler pipeline) · Mediator (centralized coordination)
