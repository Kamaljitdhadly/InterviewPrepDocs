# JavaScript Design Patterns

## Questions Covered

1. JavaScript Best Practices and Patterns
2. What are design patterns in JavaScript?
3. Discuss common patterns like Singleton, Observer, and Module.
4. What is the Revealing Module Pattern?
5. What is the Factory Pattern, and how is it used in JavaScript?
6. How do you implement the Observer Pattern in JavaScript?
7. What is the Prototype Design Pattern?
8. What is the Constructor Design Pattern?
9. What is the Chain of Responsibility Pattern in JavaScript?

## JavaScript Best Practices and Patterns

Following established practices and patterns leads to maintainable, testable JavaScript. Patterns solve recurring structural problems; best practices keep day-to-day code clean.

**Best practices summary:**

- **Readable code** — descriptive names for variables, functions, and classes; enforce style with Prettier/ESLint.
- **Modern JS** — ES6+ (arrow functions, destructuring, `let`/`const`, classes); modularize with `import`/`export`.
- **Error handling** — wrap risky code in `try/catch`; validate inputs before use to prevent bugs and injection.
- **Performance** — debounce/throttle scroll/resize handlers; batch DOM reads/writes to minimize reflows.
- **Security** — sanitize user input against XSS; serve over HTTPS.
- **Modularity** — small single-purpose functions; avoid polluting the global scope.
- **Async** — Promises and `async`/`await` for readable async flow; always attach `.catch` or try/catch.
- **Browser APIs** — Performance API for metrics; LocalStorage/IndexedDB for client persistence.
- **Memory** — remove event listeners and null out refs to large objects when done.

**Common design patterns** (detailed in later sections):

#### Singleton — one instance, global access

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
  }
}
```

#### Factory — create objects without exposing construction logic

```javascript
class Car {
  constructor(model) {
    this.model = model;
  }
}
class CarFactory {
  static createCar(model) {
    return new Car(model);
  }
}
```

#### Module — encapsulate private/public members

```javascript
const Module = (function() {
  let privateVar = 'I am private';
  return {
    publicMethod() {
      console.log('Accessing privateVar:', privateVar);
    }
  };
})();
```

#### Observer — notify dependents on state change

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  notifyObservers(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}
class Observer {
  update(data) {
    console.log('Observer received data:', data);
  }
}
```

#### Prototype — clone from a template object

```javascript
const carPrototype = {
  init(model) {
    this.model = model;
  },
  getModel() {
    return this.model;
  }
};
function createCar(model) {
  const car = Object.create(carPrototype);
  car.init(model);
  return car;
}
```

#### Decorator — add behavior without altering structure

```javascript
class Car {
  drive() {
    console.log('Driving a car');
  }
}
function enhanceCar(car) {
  car.fly = function() {
    console.log('Flying');
  };
  return car;
}
```

#### Strategy — interchangeable algorithms

```javascript
class Context {
  constructor(strategy) {
    this.strategy = strategy;
  }
  executeStrategy(a, b) {
    return this.strategy.execute(a, b);
  }
}
class AdditionStrategy {
  execute(a, b) {
    return a + b;
  }
}
class SubtractionStrategy {
  execute(a, b) {
    return a - b;
  }
}
```

#### Command — encapsulate a request as an object

```javascript
class Command {
  execute() {}
}
class LightOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  execute() {
    this.light.turnOn();
  }
}
```

#### Chain of Responsibility — pass request along handlers

```javascript
class Handler {
  constructor(successor = null) {
    this.successor = successor;
  }
  handle(request) {
    if (this.successor) {
      this.successor.handle(request);
    }
  }
}
```

## What are design patterns in JavaScript?

**Design patterns** are proven, reusable templates for structuring code. They address common problems — object creation, communication between modules, and behavior composition — without tying you to a specific implementation.

In JavaScript, patterns are often implemented with functions, closures, classes, or modules. Below are the nine most frequently discussed patterns with usage examples.

### Singleton

Ensures only one instance exists and provides global access — useful for shared config, logging, or connection pools.

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
    // Initialization code here
  }
}
// Usage
const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true
```

### Factory

Defines an interface for creating objects without specifying the exact class. The factory method picks the right constructor based on input.

```javascript
class Car {
  constructor(model) {
    this.model = model;
  }
}
class CarFactory {
  static createCar(model) {
    return new Car(model);
  }
}
// Usage
const myCar = CarFactory.createCar('Tesla Model S');
console.log(myCar.model); // Tesla Model S
```

### Prototype

Creates new objects by cloning a prototype template via `Object.create` — efficient when setup is expensive or objects share most behavior.

```javascript
const carPrototype = {
  init(model) {
    this.model = model;
  },
  getModel() {
    return this.model;
  }
};
function createCar(model) {
  const car = Object.create(carPrototype);
  car.init(model);
  return car;
}
// Usage
const myCar = createCar('Honda Accord');
console.log(myCar.getModel()); // Honda Accord
```

### Module

Encapsulates private state inside a closure or ES module scope; exposes only a deliberate public API.

```javascript
const Module = (function() {
  let privateVar = 'I am private';
  return {
    publicMethod() {
      console.log('Accessing privateVar:', privateVar);
    }
  };
})();
// Usage
Module.publicMethod(); // Accessing privateVar: I am private
```

### Observer

Subject maintains a list of observers and notifies them on state change — foundation of event systems, pub/sub, and reactive UI.

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  notifyObservers(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}
class Observer {
  update(data) {
    console.log('Observer received data:', data);
  }
}
// Usage
const subject = new Subject();
const observer = new Observer();
subject.addObserver(observer);
subject.notifyObservers('Some data'); // Observer received data: Some data
```

### Decorator

Adds responsibilities to an object dynamically without subclassing — wrap or extend in place.

```javascript
class Car {
  drive() {
    console.log('Driving a car');
  }
}
function enhanceCar(car) {
  car.fly = function() {
    console.log('Flying');
  };
  return car;
}
// Usage
const myCar = new Car();
const enhancedCar = enhanceCar(myCar);
enhancedCar.drive(); // Driving a car
enhancedCar.fly(); // Flying
```

### Strategy

Encapsulates interchangeable algorithms behind a common interface; swap behavior at runtime without changing the client.

```javascript
class Context {
  constructor(strategy) {
    this.strategy = strategy;
  }
  executeStrategy(a, b) {
    return this.strategy.execute(a, b);
  }
}
class AdditionStrategy {
  execute(a, b) {
    return a + b;
  }
}
class SubtractionStrategy {
  execute(a, b) {
    return a - b;
  }
}
// Usage
const context = new Context(new AdditionStrategy());
console.log(context.executeStrategy(5, 3)); // 8
context.strategy = new SubtractionStrategy();
console.log(context.executeStrategy(5, 3)); // 2
```

### Command

Encapsulates a request as an object — enables undo queues, macro recording, and deferred execution.

```javascript
class Command {
  execute() {}
}
class LightOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  execute() {
    this.light.turnOn();
  }
}
class Light {
  turnOn() {
    console.log('Light is on');
  }
}
const light = new Light();
const lightOn = new LightOnCommand(light);
lightOn.execute(); // Light is on
```

### Chain of Responsibility

Passes a request along a chain of handlers; each handler either processes it or forwards to the next link.

```javascript
class Handler {
  constructor(successor = null) {
    this.successor = successor;
  }
  handle(request) {
    if (this.successor) {
      this.successor.handle(request);
    }
  }
}
class ConcreteHandlerA extends Handler {
  handle(request) {
    if (request === 'A') {
      console.log('Handled by ConcreteHandlerA');
    } else if (this.successor) {
      this.successor.handle(request);
    }
  }
}
class ConcreteHandlerB extends Handler {
  handle(request) {
    if (request === 'B') {
      console.log('Handled by ConcreteHandlerB');
    } else if (this.successor) {
      this.successor.handle(request);
    }
  }
}
// Usage
const handlerB = new ConcreteHandlerB();
const handlerA = new ConcreteHandlerA(handlerB);
handlerA.handle('B'); // Handled by ConcreteHandlerB
```

## Discuss common patterns like Singleton, Observer, and Module.

These three patterns appear constantly in production JavaScript — for shared state, event-driven updates, and namespace isolation.

### Singleton

**Purpose:** guarantee a single instance for global state or shared resources (database connection wrapper, app config, logger).

**Key features:** only one instance ever exists; global access point via `getInstance()` or constructor guard.

**Classic:**

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
    // Initialization code here
  }
  getValue() {
    return 'Singleton Instance';
  }
}
// Usage
const instance1 = new Singleton();
const instance2 = new Singleton();
console.log(instance1 === instance2); // true
console.log(instance1.getValue()); // Singleton Instance
```

**Modern (ES module):**

```javascript
const Singleton = (function() {
  let instance;
  function createInstance() {
    return { /* Singleton instance properties */ };
  }
  return {
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();
export default Singleton;
// Usage
import Singleton from './singleton';
const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true
```

### Observer

**Purpose:** when a subject's state changes, all registered observers are notified automatically — decouples publisher from subscribers.

**Key features:** loose coupling; observers can be added/removed at runtime; supports one-to-many relationships.

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  notifyObservers(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}
class Observer {
  update(data) {
    console.log('Observer received data:', data);
  }
}
// Usage
const subject = new Subject();
const observer1 = new Observer();
const observer2 = new Observer();
subject.addObserver(observer1);
subject.addObserver(observer2);
subject.notifyObservers('New Data'); // Observer received data: New Data
```

**With `EventTarget`:**

```javascript
class Subject extends EventTarget {
  notifyObservers(data) {
    const event = new CustomEvent('update', { detail: data });
    this.dispatchEvent(event);
  }
}
class Observer {
  constructor(subject) {
    this.subject = subject;
    this.subject.addEventListener('update', (event) => {
      this.update(event.detail);
    });
  }
  update(data) {
    console.log('Observer received data:', data);
  }
}
// Usage
const subject = new Subject();
const observer1 = new Observer(subject);
const observer2 = new Observer(subject);
subject.notifyObservers('New Data'); // Observer received data: New Data
```

### Module

**Purpose:** organize code into self-contained units with private internals and a public API — prevents global namespace pollution.

**Key features:** closure-based or ES-module privacy; explicit exports; related logic grouped together.

**Classic IIFE:**

```javascript
const Module = (function() {
  let privateVar = 'I am private';
  function privateMethod() {
    console.log('I am private');
  }
  return {
    publicMethod() {
      console.log('Accessing privateVar:', privateVar);
      privateMethod();
    }
  };
})();
// Usage
Module.publicMethod(); // Accessing privateVar: I am private
```

**ES6 module:**

```javascript
const privateVar = 'I am private';
function privateMethod() {
  console.log('I am private');
}
export function publicMethod() {
  console.log('Accessing privateVar:', privateVar);
  privateMethod();
}
// Usage
import { publicMethod } from './module';
publicMethod(); // Accessing privateVar: I am private
```

## What is the Revealing Module Pattern?

A **variation of the Module Pattern** that makes the public API explicit. All functions are defined inside an IIFE; the return object lists exactly which members are public — often using shorthand property names (`{ publicMethod }`).

**Why use it:** clearer than mixing `return { publicMethod: function() {...} }` inline; easier to see the module's contract at a glance; private helpers stay truly private.

**How it works:**

1. Define private variables and functions inside the IIFE.
2. Define public functions that call private ones as needed.
3. Return an object revealing only the public function references.

```javascript
const RevealingModule = (function() {
  // Private variables and functions
  let privateVar = 'I am private';
  function privateMethod() {
    console.log('I am a private method');
  }
  // Public variables and functions
  function publicMethod() {
    console.log('Accessing privateVar:', privateVar);
    privateMethod();
  }
  function anotherPublicMethod() {
    console.log('This is another public method');
  }
  // Revealing the public API
  return {
    publicMethod,
    anotherPublicMethod
  };
})();
// Usage
RevealingModule.publicMethod(); // Accessing privateVar: I am private
// I am a private method
RevealingModule.anotherPublicMethod(); // This is another public method
```

**vs Classic Module Pattern:** the classic pattern can define public methods inline in the return object. Revealing Module names all members first, then selectively exposes them — improving readability and maintainability when the module grows.

## What is the Factory Pattern, and how is it used in JavaScript?

A **creational pattern** that centralizes object creation behind a factory method. Callers request an object by type/key; the factory decides which constructor to invoke — hiding `new` calls and conditional logic from client code.

**Benefits:**

- **Encapsulation** — creation complexity lives in one place.
- **Decoupling** — clients depend on the factory interface, not concrete classes.
- **Extensibility** — add new product types by extending the factory switch/map without changing callers.

**Use when:** object type is chosen at runtime, construction involves multiple steps, or you have a family of related classes (vehicles, UI components, parsers).

**Constructor functions:**

```javascript
function Car(model) {
  this.model = model;
  this.type = 'Car';
}
function Truck(model) {
  this.model = model;
  this.type = 'Truck';
}
// Factory function
function VehicleFactory() {}
VehicleFactory.createVehicle = function(type, model) {
  switch(type) {
    case 'car':
      return new Car(model);
    case 'truck':
      return new Truck(model);
    default:
      throw new Error('Vehicle type not supported');
  }
};
// Usage
const myCar = VehicleFactory.createVehicle('car', 'Toyota Corolla');
console.log(myCar); // Car { model: 'Toyota Corolla', type: 'Car' }
const myTruck = VehicleFactory.createVehicle('truck', 'Ford F-150');
console.log(myTruck); // Truck { model: 'Ford F-150', type: 'Truck' }
```

**ES6 classes:**

```javascript
class Car {
  constructor(model) {
    this.model = model;
    this.type = 'Car';
  }
}
class Truck {
  constructor(model) {
    this.model = model;
    this.type = 'Truck';
  }
}
class VehicleFactory {
  static createVehicle(type, model) {
    switch(type) {
      case 'car':
        return new Car(model);
      case 'truck':
        return new Truck(model);
      default:
        throw new Error('Vehicle type not supported');
    }
  }
}
// Usage
const myCar = VehicleFactory.createVehicle('car', 'Tesla Model S');
console.log(myCar); // Car { model: 'Tesla Model S', type: 'Car' }
const myTruck = VehicleFactory.createVehicle('truck', 'Chevrolet Silverado');
console.log(myTruck); // Truck { model: 'Chevrolet Silverado', type: 'Truck' }
```

**Use when:** creation is complex, multiple related subclasses exist, or you need to decouple client code from concrete types.

## How do you implement the Observer Pattern in JavaScript?

The **Observer Pattern** defines a one-to-many dependency: a **Subject** (publisher) maintains a list of **Observers** (subscribers) and calls `update()` on each when its state changes. This is the basis of custom event buses, MVC view updates, and reactive state management.

**Advantages:** subjects and observers are loosely coupled; observers can be added/removed dynamically; no subject modification needed when new observer types appear.

**Common use cases:** DOM event systems, data-binding in frameworks, cross-component messaging.

### Step-by-step implementation

**1. Subject** — add, remove, notify:

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  addObserver(observer) {
    this.observers.push(observer);
  }
  removeObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  notifyObservers(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}
```

**2. Observer** — `update` callback:

```javascript
class Observer {
  update(data) {
    console.log('Observer received data:', data);
  }
}
```

**3. Concrete observers:**

```javascript
class ConcreteObserverA extends Observer {
  update(data) {
    console.log('ConcreteObserverA received:', data);
  }
}
class ConcreteObserverB extends Observer {
  update(data) {
    console.log('ConcreteObserverB received:', data);
  }
}
```

**4. Usage:**

```javascript
const subject = new Subject();
const observerA = new ConcreteObserverA();
const observerB = new ConcreteObserverB();
subject.addObserver(observerA);
subject.addObserver(observerB);
subject.notifyObservers('New update available');
// ConcreteObserverA received: New update available
// ConcreteObserverB received: New update available
subject.removeObserver(observerA);
subject.notifyObservers('Another update');
// ConcreteObserverB received: Another update
```

**With `EventTarget`:**

```javascript
class Subject extends EventTarget {
  notifyObservers(data) {
    const event = new CustomEvent('update', { detail: data });
    this.dispatchEvent(event);
  }
}
class Observer {
  constructor(subject) {
    this.subject = subject;
    this.subject.addEventListener('update', (event) => {
      this.update(event.detail);
    });
  }
  update(data) {
    console.log('Observer received data:', data);
  }
}
const subject = new Subject();
const observer = new Observer(subject);
subject.notifyObservers('Event data');
// Observer received data: Event data
```

## What is the Prototype Design Pattern?

A **creational pattern** that creates objects by cloning an existing **prototype** rather than invoking a constructor from scratch. In JavaScript, `Object.create(prototype)` is the native mechanism.

**When to use:** object creation is expensive; many instances share the same methods; you need runtime variation by cloning and tweaking a base object.

**Key concepts:** prototype object holds shared methods; factory/clone function creates instances; optional `clone()` method on classes for deep copies.

**`Object.create` approach:**

```javascript
const carPrototype = {
  init(model, year) {
    this.model = model;
    this.year = year;
    return this;
  },
  getDetails() {
    return `${this.year} ${this.model}`;
  }
};
function createCar(model, year) {
  const car = Object.create(carPrototype);
  car.init(model, year);
  return car;
}
const car1 = createCar('Toyota Corolla', 2020);
console.log(car1.getDetails()); // 2020 Toyota Corolla
const car2 = createCar('Honda Civic', 2021);
console.log(car2.getDetails()); // 2021 Honda Civic
```

**ES6 class with `clone()`:**

```javascript
class Car {
  constructor(model, year) {
    this.model = model;
    this.year = year;
  }
  getDetails() {
    return `${this.year} ${this.model}`;
  }
  clone() {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
const car1 = new Car('Toyota Corolla', 2020);
console.log(car1.getDetails()); // 2020 Toyota Corolla
const car2 = car1.clone();
car2.model = 'Honda Civic';
car2.year = 2021;
console.log(car2.getDetails()); // 2021 Honda Civic
```

**Use when:** customizing from a template, expensive construction, or object pooling.

## What is the Constructor Design Pattern?

A **creational pattern** focused on **consistent object initialization**. The constructor (function or class) sets up properties, validates inputs, and ensures the instance is in a valid state before use.

In JavaScript this maps directly to **constructor functions** (`new Car()`) or **ES6 classes** (`constructor()` method).

**Benefits:** initialization logic in one place; `new` guarantees a fresh instance; easy to extend via prototypes or `class` inheritance.

**Use when:** objects require setup parameters, validation on creation, or shared initialization across many instances.

**Constructor function:**

```javascript
function Car(model, year) {
  this.model = model;
  this.year = year;
  this.details = function() {
    return `${this.year} ${this.model}`;
  };
}
const car1 = new Car('Toyota Corolla', 2020);
console.log(car1.details()); // 2020 Toyota Corolla
const car2 = new Car('Honda Civic', 2021);
console.log(car2.details()); // 2021 Honda Civic
```

**ES6 class:**

```javascript
class Car {
  constructor(model, year) {
    this.model = model;
    this.year = year;
  }
  details() {
    return `${this.year} ${this.model}`;
  }
}
const car1 = new Car('Toyota Corolla', 2020);
console.log(car1.details()); // 2020 Toyota Corolla
const car2 = new Car('Honda Civic', 2021);
console.log(car2.details()); // 2021 Honda Civic
```

**Use when:** objects need controlled initialization, complex setup, or encapsulated construction logic.

## What is the Chain of Responsibility Pattern in JavaScript?

A **behavioral pattern** that passes a request along a **chain of handlers**. Each handler either processes the request or forwards it to `nextHandler`. The sender doesn't know which handler will ultimately respond.

**Benefits:**

- **Decoupling** — sender is independent of specific handlers.
- **Flexibility** — add, remove, or reorder handlers at runtime.
- **Single Responsibility** — each handler handles one condition or concern.

**Use cases:** middleware pipelines (Express/Koa), UI event bubbling, multi-step validation, logging filters.

**1. Base handler:**

```javascript
class Handler {
  constructor() {
    this.nextHandler = null;
  }
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }
  handleRequest(request) {
    if (this.nextHandler) {
      this.nextHandler.handleRequest(request);
    }
  }
}
```

**2. Concrete handlers:**

```javascript
class ConcreteHandlerA extends Handler {
  handleRequest(request) {
    if (request === 'A') {
      console.log('ConcreteHandlerA handled the request');
    } else if (this.nextHandler) {
      this.nextHandler.handleRequest(request);
    }
  }
}
class ConcreteHandlerB extends Handler {
  handleRequest(request) {
    if (request === 'B') {
      console.log('ConcreteHandlerB handled the request');
    } else if (this.nextHandler) {
      this.nextHandler.handleRequest(request);
    }
  }
}
class ConcreteHandlerC extends Handler {
  handleRequest(request) {
    if (request === 'C') {
      console.log('ConcreteHandlerC handled the request');
    } else if (this.nextHandler) {
      this.nextHandler.handleRequest(request);
    }
  }
}
```

**3. Chain setup:**

```javascript
const handlerA = new ConcreteHandlerA();
const handlerB = new ConcreteHandlerB();
const handlerC = new ConcreteHandlerC();
handlerA.setNext(handlerB).setNext(handlerC);
handlerA.handleRequest('B'); // ConcreteHandlerB handled the request
handlerA.handleRequest('C'); // ConcreteHandlerC handled the request
handlerA.handleRequest('A'); // ConcreteHandlerA handled the request
handlerA.handleRequest('D'); // (No handler for 'D')
```

**Use cases:** UI event pipelines, middleware, sequential logging/validation.
