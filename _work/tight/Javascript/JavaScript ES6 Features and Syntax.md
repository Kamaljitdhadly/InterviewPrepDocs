# JavaScript ES6 Features and Syntax

## Questions Covered

1. What is ES6? What are some new features introduced by it?
2. What is the difference between let, var, and const?
3. What are Template Literals in ES6, and how do they differ from regular strings?
4. What are Default Parameters in ES6? How do they work?
5. What are Arrow Functions in ES6? What are their benefits and limitations?
6. What is the difference between a regular function and an arrow function in JavaScript?
7. What is the class syntax in ES6? How does it compare to constructor functions in earlier versions of JavaScript?
8. How does inheritance work in ES6 classes?
9. What is the super keyword in ES6 classes, and how does it work with inheritance?
10. What are getters and setters in ES6 classes?
11. What are modules in ES6?
12. What is the role of the import and export keywords in ES6 modules?
13. What is the difference between named exports and default exports?
14. What is the difference between static and dynamic imports in ES6?
15. What is the purpose of the Object.assign() method in ES6, and how is it used?
16. What is Object.is() in ES6, and how does it differ from ===?

## What is ES6? What are some new features introduced by it?

**ES6 (ECMAScript 2015)** is a major update to the JavaScript language specification. It introduced features that improve expressiveness, readability, and maintainability. Key additions:

1. **Arrow Functions** — concise syntax; lexical `this`

```javascript
function add(a, b) { return a + b; }
const add = (a, b) => a + b;
```

2. **Classes** — OOP syntax over prototypes

```javascript
class Person {
  constructor(name) { this.name = name; }
  greet() { console.log(`Hello, my name is ${this.name}`); }
}
```

3. **Template Literals** — backticks, `${}` interpolation, multiline

```javascript
const message = `Hello, ${name}!`;
```

4. **Destructuring** — unpack arrays/objects

```javascript
const [a, b] = [1, 2];
const { name, age } = { name: 'John', age: 30 };
```

5. **Default Parameters**

```javascript
function greet(name = 'Guest') { console.log(`Hello, ${name}`); }
```

6. **Rest/Spread** (`...`)

```javascript
function sum(...numbers) { return numbers.reduce((a, n) => a + n, 0); }
const arr2 = [...arr1, 4, 5];
```

7. **Promises** — native async handling

```javascript
new Promise((resolve) => setTimeout(() => resolve('Done!'), 1000))
  .then(result => console.log(result));
```

8. **Modules** — `import` / `export`

```javascript
export const PI = 3.14;
import { PI } from './module.js';
```

9. **Enhanced Object Literals** — shorthand properties/methods

```javascript
const person = { name, greet() { console.log('Hello'); } };
```

10. **Map and Set**

```javascript
new Set([1, 2, 3, 3]); // Set { 1, 2, 3 }
new Map([['key1', 'value1']]).get('key1'); // 'value1'
```

These features form the foundation of modern JavaScript development.

## What is the difference between let, var, and const?

`let`, `var`, and `const` all declare variables but differ in scope, hoisting, and reassignment rules.

| | `var` | `let` | `const` |
|---|-------|-------|---------|
| **Scope** | Function (or global) | Block | Block |
| **Hoisting** | Hoisted, init → `undefined` | Hoisted, TDZ until declaration | Hoisted, TDZ until declaration |
| **Re-declare** | Allowed in same scope | Not allowed | Not allowed |
| **Reassign** | Yes | Yes | No (object contents mutable) |

```javascript
function example() {
  console.log(x); // undefined
  var x = 10;

  console.log(y); // ReferenceError (TDZ)
  let y = 10;

  const z = 10;
  // z = 20; // TypeError
}
const arr = [1, 2, 3];
arr.push(4); // OK — mutating contents
```

**Use `const` by default, `let` when reassignment needed; avoid `var`** due to function-scoping and hoisting quirks.

## What are Template Literals in ES6, and how do they differ from regular strings?

Template literals use backticks and provide interpolation, multiline support, and tagged-template processing — features regular strings lack.

| | Template literals (`` ` ``) | Regular strings (`'` / `"`) |
|---|------------------------------|-------------------------------|
| **Interpolation** | `${expr}` embedded | `+` concatenation |
| **Multiline** | Native | `\n` or concatenation |
| **Tagged templates** | Custom tag functions | Not supported |

```javascript
const greeting = `Hello, ${name}!`;
const result = `The sum of ${a} and ${b} is ${a + b}.`;
const multi = `Line 1
Line 2`;

function tag(strings, ...values) {
  return strings.raw[0] + values.join('');
}
const message = tag`My name is ${name} and I am ${age} years old.`;

// Regular string equivalent
const old = 'Hello, ' + name + '!';
```

Regular strings require `+` concatenation and `\n` for multiline text.

## What are Default Parameters in ES6? How do they work?

Default parameters let you specify fallback values in the function signature when arguments are omitted or `undefined`.

Default values apply when argument is `undefined` or omitted (not when `null`).

```javascript
function greet(name = 'Guest') {
  console.log(`Hello, ${name}!`);
}
greet();           // Hello, Guest!
greet('John');     // Hello, John!
greet(undefined);  // Hello, Guest!
greet(null);       // Hello, null!

function multiply(a, b = a) { return a * b; }
multiply(5);    // 25
multiply(5, 3); // 15

function display({ name = 'Anonymous', age = 0 } = {}) {
  console.log(`Name: ${name}, Age: ${age}`);
}
display();              // Name: Anonymous, Age: 0
display({ name: 'Alice' }); // Name: Alice, Age: 0
```

Defaults are evaluated at call time and can reference earlier parameters or use destructuring.

## What are Arrow Functions in ES6? What are their benefits and limitations?

Arrow functions provide concise syntax via `=>` and inherit `this` from the enclosing lexical scope.

**Syntax:** `(params) => expression` or `(params) => { statements }`

```javascript
const add = (a, b) => a + b;
const multiply = (a, b) => { const r = a * b; return r; };
const square = x => x * x;
const greet = () => 'Hello, World!';
```

### Benefits

- Concise syntax
- **Lexical `this`** — inherits from enclosing scope (great for callbacks)

```javascript
function Counter() {
  this.value = 0;
  setInterval(() => { this.value++; console.log(this.value); }, 1000);
}
```

### Limitations

- No own `this`, `arguments`, `super`, or `new.target`
- Cannot be constructors (`new ArrowFn()` → TypeError)
- Unsuitable as object/class methods needing dynamic `this` or `super`

```javascript
const obj = {
  value: 10,
  method: () => console.log(this.value) // `this` is NOT obj
};
```

## What is the difference between a regular function and an arrow function in JavaScript?

The main differences are syntax, `this` binding, constructor capability, and `arguments`/`super` support.

| | Regular function | Arrow function |
|---|-----------------|----------------|
| **`this`** | Dynamic — depends on call site | Lexical — from enclosing scope |
| **Constructor** | Yes (`new`) | No |
| **`arguments`** | Yes | No — use rest `...args` |
| **`super`** | Yes (in classes) | No |
| **Methods** | Suitable | Unsuitable when `this`/`super` needed |

```javascript
const obj = {
  value: 10,
  method: function() { console.log(this.value); } // 10
};
obj.method();

function Counter() {
  this.value = 0;
  setInterval(() => { this.value++; }, 1000); // lexical this works
}
new Counter();

function Person(name) { this.name = name; }
new Person('John'); // OK

const PersonArrow = (name) => { this.name = name; };
// new PersonArrow('John'); // TypeError
```

## What is the class syntax in ES6? How does it compare to constructor functions in earlier versions of JavaScript?

ES6 `class` provides cleaner OOP syntax but is **syntactic sugar** over JavaScript's prototype-based inheritance.

### ES6 class

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  greet() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
  }
  static species() { console.log('Homo sapiens'); }
}
const john = new Person('John', 30);
john.greet();
Person.species();
```

### Pre-ES6 constructor

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.greet = function() {
  console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`);
};
Person.species = function() { console.log('Homo sapiens'); };
```

| | Class | Constructor function |
|---|-------|---------------------|
| **Syntax** | Cleaner, familiar OOP | Verbose prototype setup |
| **Inheritance** | `extends` + `super` | Manual prototype chain |
| **Methods** | In class body | On `.prototype` |
| **Static methods** | `static` keyword | On constructor directly |

## How does inheritance work in ES6 classes?

Use `extends` to create a child class that inherits properties and methods from a parent class. Call `super()` in the child constructor before using `this`.

```javascript
class Animal {
  constructor(name) { this.name = name; }
  speak() { console.log(`${this.name} makes a noise.`); }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  speak() {
    super.speak();
    console.log(`${this.name} barks.`);
  }
}

const myDog = new Dog('Rex', 'Labrador');
myDog.speak();
```

```javascript
class Vehicle {
  static description() { console.log('A vehicle transports people or goods.'); }
}
class Car extends Vehicle {
  static description() {
    super.description();
    console.log('A car is a type of vehicle.');
  }
}
Car.description();
```

**Rules:** call `super()` before `this` in derived constructors; use `super.method()` to extend parent behavior.

## What is the super keyword in ES6 classes, and how does it work with inheritance?

`super` references the parent class — for calling its constructor, instance methods, or static methods.

1. **`super(args)`** — calls parent constructor (required before `this` in derived class)

```javascript
class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
}
```

2. **`super.methodName()`** — calls parent instance method

```javascript
class Dog extends Animal {
  speak() {
    super.speak();
    console.log('Dog barks');
  }
}
```

3. **`super.staticMethod()`** — calls parent static method

```javascript
class Car extends Vehicle {
  static type() {
    super.type();
    console.log('This is a car');
  }
}
```

Using `this` before `super()` in a derived constructor throws `ReferenceError`.

## What are getters and setters in ES6 classes?

Getters and setters control property access — read like properties but execute methods behind the scenes.

```javascript
class Rectangle {
  constructor(width, height) {
    this._width = width;
    this._height = height;
  }
  get area() { return this._width * this._height; }
  get width() { return this._width; }
  set width(value) {
    if (value <= 0) { console.log('Width must be positive.'); return; }
    this._width = value;
  }
}
const rect = new Rectangle(10, 5);
console.log(rect.area); // 50
rect.width = 7;
console.log(rect.area); // 35
```

```javascript
class User {
  constructor(name) { this._name = name; }
  get name() { return this._name.toUpperCase(); }
  set name(value) {
    if (value.length < 3) { console.log('Name is too short.'); return; }
    this._name = value;
  }
}
```

Useful for validation, computed properties, and encapsulation (often with `_` prefixed backing fields).

## What are modules in ES6?

ES6 modules split code into self-contained files that export and import functionality. They run in strict mode, scope variables to the module, and use **live bindings** for exports.

### Named exports (multiple per module)

```javascript
// math.js
export const PI = 3.1416;
export function add(a, b) { return a + b; }
export class Calculator {
  multiply(a, b) { return a * b; }
}
```

### Default export (one per module)

```javascript
// utils.js
export default function subtract(a, b) { return a - b; }
```

### Importing

```javascript
import { PI, add, Calculator } from './math.js';
import subtract from './utils.js';
import subtract, { add, PI } from './math.js';
import * as math from './math.js';
```

### Re-exporting

```javascript
export { add, subtract } from './math.js';
```

### Dynamic import

```javascript
import('./math.js').then(module => {
  console.log(module.add(2, 3));
});
```

## What is the role of the import and export keywords in ES6 modules?

`export` exposes module members; `import` brings them into another file — enabling modular, reusable code organization.

**`export`** — exposes module members for other files.

```javascript
export const PI = 3.1416;
export function add(a, b) { return a + b; }
export default function subtract(a, b) { return a - b; }
```

**`import`** — brings in exported members.

```javascript
import { PI, add } from './math.js';           // named
import subtract from './utils.js';               // default
import subtract, { add, PI } from './math.js';  // both
import * as math from './math.js';              // namespace
import('./math.js').then(m => m.add(2, 3));     // dynamic
```

| Export type | Export syntax | Import syntax |
|-------------|---------------|---------------|
| Named | `export { x }` / `export const x` | `import { x } from '...'` |
| Default | `export default fn` | `import fn from '...'` |

## What is the difference between named exports and default exports?

Named exports expose multiple members by exact name; default exports expose one primary member importable under any name.

| | Named | Default |
|---|-------|---------|
| **Per module** | Multiple | One |
| **Import** | `import { name }` — exact name (rename: `as`) | `import anyName` — no braces |
| **Use case** | Multiple utilities | Single primary export |

```javascript
// math.js
export const PI = 3.1416;
export function add(a, b) { return a + b; }
export default function subtract(a, b) { return a - b; }

// main.js
import subtract, { PI, add } from './math.js';
import { add as sum } from './math.js';
```

## What is the difference between static and dynamic imports in ES6?

Static imports resolve at compile time; dynamic imports load modules at runtime via `import()` returning a Promise.

| | Static import | Dynamic import |
|---|--------------|----------------|
| **When resolved** | Compile time (eager) | Runtime (lazy) |
| **Syntax** | `import { x } from './m.js'` | `import('./m.js').then(...)` |
| **Conditional** | No — top level only | Yes — inside functions/blocks |
| **Returns** | Bindings immediately | Promise |
| **Tree-shaking** | Yes | Limited |
| **Use** | Known dependencies | Code splitting, lazy loading |

```javascript
// Static
import { add, subtract } from './math.js';
console.log(add(5, 3));

// Dynamic
function loadMathModule() {
  import('./math.js').then(math => {
    console.log(math.add(5, 3));
  });
}
loadMathModule();
```

Use static imports for known dependencies; dynamic for code splitting and conditional loading.

## What is the purpose of the Object.assign() method in ES6, and how is it used?

`Object.assign()` copies enumerable own properties from one or more sources onto a target object. It performs a **shallow** copy only.

**Syntax:** `Object.assign(target, ...sources)`

```javascript
// Merge
const result = Object.assign({}, { a: 1, b: 2 }, { b: 3, c: 4 });
// { a: 1, b: 3, c: 4 } — later source wins

// Clone (shallow)
const copy = Object.assign({}, original);

// Nested — shared reference
const obj = { a: 1, b: { c: 2 } };
const shallow = Object.assign({}, obj);
shallow.b.c = 3;
console.log(obj.b.c); // 3

// Config override
const final = Object.assign({}, defaultSettings, userSettings);
```

Skips non-enumerable properties. For deep cloning use `structuredClone()` or a library.

## What is Object.is() in ES6, and how does it differ from ===?

`Object.is()` performs same-value equality — like `===` except for `NaN` and signed zero edge cases.

| Case | `Object.is()` | `===` |
|------|---------------|-------|
| `NaN === NaN` | `true` | `false` |
| `+0 === -0` | `false` | `true` |
| Other values | Same as `===` | Strict equality |

```javascript
Object.is(NaN, NaN);  // true
NaN === NaN;          // false
Object.is(+0, -0);    // false
+0 === -0;            // true
Object.is(5, 5);      // true
```

Use `Object.is()` when `NaN` self-equality or `±0` distinction matters; otherwise `===` suffices.
