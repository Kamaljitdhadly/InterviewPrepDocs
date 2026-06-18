# JavaScript Objects and Classes

## Questions Covered

1. How do you clone or copy an object?
2. Difference between deep copy and shallow copy in JavaScript?
3. How does the new keyword work in JavaScript?
4. What is the difference between Object.create() and new for creating objects?
5. What is the concept of immutability in JavaScript, and how do you achieve it?
6. What is a Proxy object in JavaScript?
7. What is the Reflect object in ES6, and how does it complement Proxies?
8. What are Symbols in ES6? What are their use cases?
9. What are Mixins in JavaScript? How can they be implemented?
10. What is Object.freeze() and Object.seal()?
11. Example for prototype chaining?

## How do you clone or copy an object?

**Shallow copy** — new object with same top-level properties; nested objects are shared by reference.

```javascript
const original = { a: 1, b: 2, c: { d: 3 } };
const shallowCopy = Object.assign({}, original);
console.log(shallowCopy); // Outputs: { a: 1, b: 2, c: { d: 3 } }
```

```javascript
const original = { a: 1, b: 2, c: { d: 3 } };
const shallowCopy = { ...original };
console.log(shallowCopy); // Outputs: { a: 1, b: 2, c: { d: 3 } }
```

**Deep copy** — recursively copies nested properties so changes don't affect the original.

```javascript
const original = { a: 1, b: 2, c: { d: 3 } };
const deepCopy = JSON.parse(JSON.stringify(original));
console.log(deepCopy); // Outputs: { a: 1, b: 2, c: { d: 3 } }
```

`JSON.parse/stringify` limitations: no `undefined`, functions, `Date`, `RegExp`, `Map`; fails on circular refs.

**Custom deep copy:**

```javascript
function deepCopy(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(deepCopy);
  }
  const copy = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}
const original = { a: 1, b: 2, c: { d: 3 } };
const deepCopy = deepCopy(original);
console.log(deepCopy); // Outputs: { a: 1, b: 2, c: { d: 3 } }
```

**Lodash:**

```javascript
const _ = require('lodash');
const original = { a: 1, b: 2, c: { d: 3 } };
const deepCopy = _.cloneDeep(original);
console.log(deepCopy); // Outputs: { a: 1, b: 2, c: { d: 3 } }
```

## Difference between deep copy and shallow copy in JavaScript?

| | Shallow copy | Deep copy |
|---|-------------|-----------|
| Top-level | New object | New object |
| Nested objects | Shared reference | Independent copies |
| Methods | `Object.assign()`, spread `{...obj}` | `JSON.parse/stringify`, custom fn, `_.cloneDeep()` |
| Risk | Mutating `copy.c.d` affects original | Nested changes isolated |

Use shallow for flat objects; deep when nested structure must be independent.

## How does the new keyword work in JavaScript?

`new` creates an instance via four steps:

1. Create empty object
2. Set `[[Prototype]]` to constructor's `.prototype`
3. Call constructor with `this` bound to new object
4. Return the object (unless constructor explicitly returns a different object)

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
// Creating a new instance of Person using `new`
const person1 = new Person('Alice', 30);
console.log(person1.name); // Outputs: Alice
console.log(person1.age); // Outputs: 30
```

```javascript
function Car(make, model) {
  this.make = make;
  this.model = model;
}
// Create a new instance of Car
const myCar = new Car('Toyota', 'Corolla');
```

**Without `new`** — `this` is global (or `undefined` in strict mode):

```javascript
const car = Car('Toyota', 'Corolla'); // Not using `new`
console.log(car); // Outputs: undefined (in strict mode) or unexpected behavior
To avoid this, it's common to use a pattern that ensures new is used:
function Car(make, model) {
  if (!(this instanceof Car)) {
    return new Car(make, model);
  }
  this.make = make;
  this.model = model;
}
```

**Returning an object from constructor** overrides the new instance:

```javascript
function Person(name) {
  this.name = name;
  return { greeting: `Hello, ${name}` }; // This object will be returned
}
const person = new Person('Alice');
console.log(person); // Outputs: { greeting: 'Hello, Alice' }
```

## What is the difference between Object.create() and new for creating objects?

| | `Object.create(proto)` | `new Constructor()` |
|---|------------------------|---------------------|
| Prototype | Set directly | From constructor's `.prototype` |
| Initialization | No constructor runs | Constructor initializes `this` |
| Use case | Direct prototype linking | OOP with constructor logic |

**Object.create():**

```javascript
const personPrototype = {
  greet() {
    console.log(`Hello, my name is ${this.name}`);
  }
};
const person = Object.create(personPrototype, {
  name: { value: 'Alice', writable: true }
});
person.greet(); // Outputs: Hello, my name is Alice
console.log(person.name); // Outputs: Alice
```

**new:**

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  console.log(`Hello, my name is ${this.name}`);
};
const person = new Person('Alice');
person.greet(); // Outputs: Hello, my name is Alice
console.log(person.name); // Outputs: Alice
```

Choose `new` when constructor setup is needed; `Object.create()` for prototype-only inheritance without a constructor.

## What is the concept of immutability in JavaScript, and how do you achieve it?

**Immutability** — values/objects cannot change after creation; avoids unintended side effects.

- **Primitives** (number, string, boolean) are inherently immutable.
- **Objects/arrays** are mutable by default — require explicit techniques.

**Object.freeze()** — shallow; no add/delete/modify on top-level properties:

```javascript
const person = {
  name: 'Alice',
  age: 30
};
Object.freeze(person);
person.age = 31; // This will have no effect
console.log(person.age); // Outputs: 30
```

**Object.seal()** — no add/delete; existing properties can still be modified:

```javascript
const person = {
  name: 'Alice',
  age: 30
};
Object.seal(person);
person.age = 31; // This will work
person.country = 'USA'; // This will have no effect
console.log(person.country); // Outputs: undefined
```

**Immutable.js:**

```javascript
const { Map } = require('immutable');
const person = Map({ name: 'Alice', age: 30 });
const updatedPerson = person.set('age', 31);
console.log(person.get('age')); // Outputs: 30
console.log(updatedPerson.get('age')); // Outputs: 31
```

**Immer** — mutate a draft, produce new immutable state:

```javascript
const produce = require('immer').produce;
const person = { name: 'Alice', age: 30 };
const updatedPerson = produce(person, draft => {
  draft.age = 31;
});
console.log(person.age); // Outputs: 30
console.log(updatedPerson.age); // Outputs: 31
```

**Manual immutability** — methods return new instances:

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  withAge(newAge) {
    return new Person(this.name, newAge);
  }
}
const person = new Person('Alice', 30);
const updatedPerson = person.withAge(31);
console.log(person.age); // Outputs: 30
console.log(updatedPerson.age); // Outputs: 31
```

## What is a Proxy object in JavaScript?

A **Proxy** wraps a target object and intercepts operations (get, set, delete, function calls) via **traps** in a handler.

```javascript
const target = {
  message: 'Hello, world!'
};
const handler = {
  get(target, property, receiver) {
    if (property in target) {
      return `Intercepted: ${target[property]}`;
    } else {
      return 'Property does not exist';
    }
  }
};
const proxy = new Proxy(target, handler);
console.log(proxy.message); // Outputs: Intercepted: Hello, world!
console.log(proxy.nonexistent); // Outputs: Property does not exist
```

**Common traps:** `get`, `set`, `has`, `deleteProperty`, `apply`, `construct`, `ownKeys`.

```javascript
get(target, property, receiver)
```

```javascript
set(target, property, value, receiver)
```

```javascript
has(target, property)
```

```javascript
deleteProperty(target, property)
```

```javascript
apply(target, thisArg, argumentsList)
```

```javascript
construct(target, argumentsList, newTarget)
```

```javascript
ownKeys(target)
```

**Function proxy:**

```javascript
const targetFunction = function(x, y) {
  return x + y;
};
const handler = {
  apply(target, thisArg, argumentsList) {
    console.log(`Arguments: ${argumentsList}`);
    return Reflect.apply(target, thisArg, argumentsList);
  }
};
const proxyFunction = new Proxy(targetFunction, handler);
console.log(proxyFunction(1, 2)); // Logs: Arguments: 1,2
// Outputs: 3
```

**Property traps:**

```javascript
const target = {
  name: 'Alice',
  age: 25
};
const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property} to ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};
const proxy = new Proxy(target, handler);
console.log(proxy.name); // Logs: Getting name
// Outputs: Alice
```

proxy.age = 26; // Logs: Setting age to 26

Use cases: validation, logging, reactive data, virtual properties.

## What is the Reflect object in ES6, and how does it complement Proxies?

**Reflect** provides methods mirroring internal object operations — the default behavior proxy traps should delegate to.

| Method | Purpose |
|--------|---------|
| `Reflect.get` | Read property |
| `Reflect.set` | Write property |
| `Reflect.has` | `in` operator |
| `Reflect.deleteProperty` | Delete property |
| `Reflect.apply` | Call function |
| `Reflect.construct` | `new` without `new` keyword |
| `Reflect.ownKeys` | All own keys |

```javascript
const obj = { name: 'Alice' };
console.log(Reflect.get(obj, 'name')); // Outputs: Alice
```

```javascript
const obj = { name: 'Alice' };
Reflect.set(obj, 'name', 'Bob');
console.log(obj.name); // Outputs: Bob
```

```javascript
const obj = { name: 'Alice' };
console.log(Reflect.has(obj, 'name')); // Outputs: true
console.log(Reflect.has(obj, 'age')); // Outputs: false
```

```javascript
const obj = { name: 'Alice' };
Reflect.deleteProperty(obj, 'name');
console.log(obj.name); // Outputs: undefined
```

```javascript
function greet(name) {
  return `Hello, ${name}`;
}
console.log(Reflect.apply(greet, undefined, ['Alice'])); // Outputs: Hello, Alice
```

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }
}
const person = Reflect.construct(Person, ['Alice']);
console.log(person.name); // Outputs: Alice
```

```javascript
const obj = { name: 'Alice', age: 25 };
console.log(Reflect.ownKeys(obj)); // Outputs: ['name', 'age']
```

**With Proxy** — custom behavior + default forwarding:

```javascript
const target = {
  name: 'Alice'
};
const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(target, property, receiver);
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property} to ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};
const proxy = new Proxy(target, handler);
console.log(proxy.name); // Logs: Getting name
// Outputs: Alice
proxy.name = 'Bob'; // Logs: Setting name to Bob
console.log(proxy.name); // Logs: Getting name
// Outputs: Bob
```

## What are Symbols in ES6? What are their use cases?

**Symbols** are unique, immutable primitive identifiers — ideal for non-colliding property keys. Not enumerable via `for...in` or `Object.keys()`.

```javascript
const symbol1 = Symbol('description');
const symbol2 = Symbol('description');
console.log(symbol1 === symbol2); // Outputs: false
```

**Use cases:**

1. **Unique property keys:**

```javascript
const uniqueKey = Symbol('uniqueKey');
const obj = {};
obj[uniqueKey] = 'value';
console.log(obj[uniqueKey]); // Outputs: value
```

2. **Hidden (non-enumerable) properties:**

```javascript
const hiddenProp = Symbol('hidden');
const obj = {
  [hiddenProp]: 'hiddenValue'
};
console.log(obj[hiddenProp]); // Outputs: hiddenValue
console.log(Object.keys(obj)); // Outputs: []
```

3. **Custom iteration via `Symbol.iterator`:**

```javascript
class MyIterable {
  constructor() {
    this.items = ['a', 'b', 'c'];
  }
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        if (index < items.length) {
          return { value: items[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}
const iterable = new MyIterable();
for (const item of iterable) {
  console.log(item); // Outputs: a b c
}
```

4. **Well-known symbols** — `Symbol.iterator`, `Symbol.toStringTag`, `Symbol.hasInstance`:

```javascript
class CustomClass {
  get [Symbol.toStringTag]() {
    return 'CustomClass';
  }
}
const obj = new CustomClass();
console.log(Object.prototype.toString.call(obj)); // Outputs: [object CustomClass]
```

## What are Mixins in JavaScript? How can they be implemented?

**Mixins** compose reusable behavior onto classes/objects without multiple inheritance — composition over inheritance.

**1. Mixin function (copy prototype methods):**

```javascript
const sayHelloMixin = {
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
};
const sayGoodbyeMixin = {
  sayGoodbye() {
    console.log(`Goodbye from ${this.name}`);
  }
};
// Function to apply mixins to a class
function applyMixins(derivedCtor, baseCtors) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
// Define a class
class Person {
  constructor(name) {
    this.name = name;
  }
}
// Apply mixins to the class
applyMixins(Person, [sayHelloMixin, sayGoodbyeMixin]);
const person = new Person('Alice');
person.sayHello(); // Outputs: Hello, my name is Alice
person.sayGoodbye(); // Outputs: Goodbye from Alice
```

**2. Object.assign() on prototype:**

```javascript
const sayHelloMixin = {
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
};
const sayGoodbyeMixin = {
  sayGoodbye() {
    console.log(`Goodbye from ${this.name}`);
  }
};
// Define a class
class Person {
  constructor(name) {
    this.name = name;
  }
}
// Apply mixins to the class
Object.assign(Person.prototype, sayHelloMixin, sayGoodbyeMixin);
const person = new Person('Alice');
person.sayHello(); // Outputs: Hello, my name is Alice
person.sayGoodbye(); // Outputs: Goodbye from Alice
```

**3. ES6 class mixins:**

```javascript
class SayHelloMixin {
  sayHello() {
    console.log(`Hello, my name is ${this.name}`);
  }
}
class SayGoodbyeMixin {
  sayGoodbye() {
    console.log(`Goodbye from ${this.name}`);
  }
}
// Base class
class Person {
  constructor(name) {
    this.name = name;
  }
}
// Apply mixins to the class
Object.assign(Person.prototype, SayHelloMixin.prototype, SayGoodbyeMixin.prototype);
const person = new Person('Alice');
person.sayHello(); // Outputs: Hello, my name is Alice
person.sayGoodbye(); // Outputs: Goodbye from Alice
```

**4. Higher-order class mixins:**

```javascript
function withSayHello(Base) {
  return class extends Base {
    sayHello() {
      console.log(`Hello, my name is ${this.name}`);
    }
  };
}
function withSayGoodbye(Base) {
  return class extends Base {
    sayGoodbye() {
      console.log(`Goodbye from ${this.name}`);
    }
  };
}
// Define a base class
class Person {
  constructor(name) {
    this.name = name;
  }
}
// Create a class with mixins
class EnhancedPerson extends withSayGoodbye(withSayHello(Person)) {}
const person = new EnhancedPerson('Alice');
person.sayHello(); // Outputs: Hello, my name is Alice
person.sayGoodbye(); // Outputs: Goodbye from Alice
```

## What is Object.freeze() and Object.seal()?

| | `Object.freeze()` | `Object.seal()` |
|---|-------------------|-----------------|
| Modify values | No | Yes |
| Add/delete props | No | No |
| Configurable | All non-configurable | All non-configurable |
| Depth | Shallow | Shallow |

**Object.freeze():**

```javascript
const person = {
  name: 'Alice',
  age: 30
};
Object.freeze(person);
person.name = 'Bob'; // This will not work
person.job = 'Engineer'; // This will not work
delete person.age; // This will not work
console.log(person); // Outputs: { name: 'Alice', age: 30 }
```

**Object.seal():**

```javascript
const person = {
  name: 'Alice',
  age: 30
};
Object.seal(person);
person.name = 'Bob'; // This will work
person.job = 'Engineer'; // This will not work
delete person.age; // This will not work
console.log(person); // Outputs: { name: 'Bob', age: 30 }
```

## Example for prototype chaining?

Objects inherit methods via the prototype chain — lookup walks `[[Prototype]]` until found or `null`.

```javascript
function Animal(legs) {
  this.legs = legs;
}
// Adding a method to Animal's prototype
Animal.prototype.walk = function() {
  console.log(`Walking on ${this.legs} legs`);
};
// Derived object Bird
function Bird(legs, color) {
  Animal.call(this, legs); // Inheriting properties from Animal
  this.color = color;
}
// Inheriting methods from Animal's prototype
Bird.prototype = Object.create(Animal.prototype);
// Adding a method specific to Bird
Bird.prototype.fly = function() {
  console.log(`${this.color} bird is flying!`);
};
// Further derived object Parrot
function Parrot(legs, color, canTalk) {
  Bird.call(this, legs, color); // Inheriting properties from Bird
  this.canTalk = canTalk;
}
// Inheriting methods from Bird's prototype
Parrot.prototype = Object.create(Bird.prototype);
// Adding a method specific to Parrot
Parrot.prototype.speak = function() {
  if (this.canTalk) {
    console.log(`${this.color} parrot says: Hello!`);
  } else {
    console.log(`${this.color} parrot can't talk.`);
  }
};
// Creating instances and checking the prototype chain
const animal = new Animal(4);
animal.walk(); // Output: Walking on 4 legs
const bird = new Bird(2, 'blue');
bird.walk(); // Output: Walking on 2 legs (inherited from Animal)
bird.fly(); // Output: blue bird is flying! (specific to Bird)
const parrot = new Parrot(2, 'green', true);
parrot.walk(); // Output: Walking on 2 legs (inherited from Animal)
parrot.fly(); // Output: green bird is flying! (inherited from Bird)
parrot.speak(); // Output: green parrot says: Hello! (specific to Parrot)
```

**Chain lookup:** `parrot.walk()` → not on `Parrot.prototype` → not on `Bird.prototype` → found on `Animal.prototype`. `parrot.fly()` found on `Bird.prototype`. `parrot.speak()` found on `Parrot.prototype`.
