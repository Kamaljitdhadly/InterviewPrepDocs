# JavaScript Basics

## Questions Covered

1. What is JavaScript? What is the role of the JavaScript engine?
2. What are data types in JavaScript?
3. Difference between primitive and non-primitive data types?
4. Difference between undefined, undeclared, and null?
5. What is NaN in JavaScript? How does it behave?
6. What is type coercion in JavaScript?
7. Difference between == and ===?
8. What is the use of the typeof operator?
9. What is Hoisting in JavaScript?
10. What is the Temporal Dead Zone in JavaScript?
11. What is strict mode in JavaScript? How do you enable it?
12. Difference between slice() and splice() methods of an array?
13. Difference between map() and forEach() methods of an array?
14. What is the find() method in arrays introduced in ES6? How does it differ from filter()?
15. What is Array.from() in ES6, and when would you use it?
16. What is the includes() method in arrays in ES6, and how does it differ from indexOf()?
17. What is Array Destructuring and Object Destructuring in JavaScript?
18. What is the difference between the Spread and Rest operators in JavaScript?
19. What is the purpose of the Object.entries() and Object.values() methods in ES6?
20. Difference between for and for...of loops in JavaScript?
21. Difference between for...of and for...in loops?
22. What is the difference between synchronous and asynchronous iterators in JavaScript?
23. What are Prototypes in JavaScript? How does prototypal inheritance work?

## What is JavaScript? What is the role of the JavaScript engine?

JavaScript is a high-level, dynamic, interpreted language used for interactive web pages alongside HTML and CSS. It enables form validation, animations, and real-time updates in browsers, and runs server-side through environments like Node.js.

**JavaScript engine** — a program embedded in browsers and runtimes that parses, compiles, and executes JS code:

- **Parser** — source → AST
- **Interpreter/Compiler** — modern engines (V8) compile to machine code
- **Garbage Collector** — reclaims unused memory

Popular engines: **V8** (Chrome, Node.js), **SpiderMonkey** (Firefox), **JavaScriptCore** (Safari). The engine ensures code runs efficiently and correctly across platforms.

## What are data types in JavaScript?

JavaScript values fall into **primitive** and **reference** categories. Understanding them is essential for avoiding type-coercion bugs.

### Primitive

| Type | Description |
|------|-------------|
| **Number** | Integers and floats (`42`, `3.14`) |
| **String** | Character sequences (`'hello'`) |
| **Boolean** | `true` / `false` |
| **Undefined** | Declared but not assigned |
| **Null** | Intentional absence of value |
| **Symbol** | Unique immutable identifier (`Symbol('id')`) |
| **BigInt** | Arbitrary-precision integers (`123n`) |

### Reference (non-primitive)

- **Object** — key-value pairs (`{ name: 'Alice', age: 30 }`)
- **Array** — ordered collections (`[1, 2, 3]`)
- **Function** — callable first-class objects

JS performs automatic **type coercion** in operations — e.g., adding a number to a string converts the number to a string (`'5' + 2` → `'52'`).

## Difference between primitive and non-primitive data types?

Data types are broadly **primitive** (stored by value) or **non-primitive/reference** (stored by reference).

| | Primitive | Non-primitive (reference) |
|---|-----------|---------------------------|
| **Mutability** | Immutable | Mutable (objects, arrays, functions) |
| **Storage** | By value (copy) | By reference (shared) |
| **Types** | Number, String, Boolean, Undefined, Null, Symbol, BigInt | Object, Array, Function |

```javascript
let num = 10;
let str = 'Hello';
let isTrue = true;

let obj = { name: 'Alice', age: 30 };
let arr = [1, 2, 3];
let fn = function(x, y) { return x + y; };
```

When a primitive is assigned or passed, a **copy** is made. When a non-primitive is assigned or passed, variables share a **reference** — mutations affect all references. Primitives are **immutable**; objects, arrays, and functions are **mutable**.

## Difference between undefined, undeclared, and null?

These three represent different kinds of absence or non-existence in JavaScript.

| | undefined | undeclared | null |
|---|-----------|------------|------|
| **Meaning** | Declared, no value assigned | Never declared in scope | Explicit empty/absent value |
| **Access** | Returns `undefined` | `ReferenceError` | Returns `null` |

```javascript
let a;
console.log(a); // undefined

console.log(b); // ReferenceError: b is not defined

let c = null;
console.log(c); // null
```

- **undefined** — auto-assigned to declared-but-uninitialized variables; also returned by functions with no `return`.
- **undeclared** — variable never declared; access throws `ReferenceError`.
- **null** — explicit assignment meaning "no object value"; `typeof null` is `"object"` (historical quirk).

## What is NaN in JavaScript? How does it behave?

**NaN** ("Not-a-Number") is a global `Number` property representing a value that is not a legal number. It results from invalid math operations.

```javascript
let result = 0 / 0;              // NaN
let invalidNumber = Math.sqrt(-1); // NaN
console.log(typeof NaN);         // "number"
```

**Behavior:**

- `NaN === NaN` → `false`; use `Number.isNaN()` (preferred over global `isNaN()` which coerces)
- Propagates: `NaN + 1` → `NaN`
- Not equal to zero or any other number

```javascript
console.log(NaN === NaN);           // false
console.log(Number.isNaN(NaN));     // true
console.log(isNaN('text'));         // true (coerces 'text' to NaN)
let value = 'abc' * 2;              // NaN
console.log(Number.isNaN(value));   // true
```

Handling NaN correctly matters for debugging. Prefer `Number.isNaN()` over `isNaN()` because the global version coerces its argument first.

## What is type coercion in JavaScript?

**Type coercion** is the automatic or explicit conversion of values from one data type to another when operations involve mixed types.

### Implicit

```javascript
let result = 'The number is ' + 5;  // "The number is 5"
let sum = '5' - 2;                    // 3
let value = 0;
if (value) { /* skipped */ } else { console.log('0 is falsy'); }
```

### Explicit

```javascript
String(123);    // "123"
Number('123');  // 123
Boolean('hello'); // true
```

### Common traps

```javascript
console.log('5' * 2);   // 10
console.log('5' + 2);   // '52'
console.log(5 == '5');  // true
console.log(5 === '5'); // false
console.log(!!'text');  // true
console.log(!!0);       // false
```

Implicit coercion can produce surprising results. Use `String()`, `Number()`, `Boolean()` for explicit conversion when types matter.

## Difference between == and ===?

Both compare values, but `==` performs type coercion while `===` checks value **and** type without conversion.

| | `==` (loose) | `===` (strict) |
|---|-------------|----------------|
| **Coercion** | Yes — converts types | No — value and type must match |
| **Example** | `5 == '5'` → `true` | `5 === '5'` → `false` |
| **Example** | `null == undefined` → `true` | `null === undefined` → `false` |

Use `==` only when you intentionally want coercion. In practice, **`===` is the default** for reliable comparisons.

## What is the use of the typeof operator?

`typeof` returns a string indicating the operand's type. Useful for debugging and type-dependent logic.

**Syntax:** `typeof operand`

| Returns | Operand |
|---------|---------|
| `"undefined"` | `undefined` |
| `"boolean"` | boolean |
| `"number"` | number |
| `"bigint"` | BigInt |
| `"string"` | string |
| `"symbol"` | Symbol |
| `"object"` | object, array, **null** (quirk) |
| `"function"` | function (special case) |

```javascript
let a;
console.log(typeof a);        // "undefined"
console.log(typeof null);     // "object" (historical quirk)
console.log(typeof [1,2,3]);  // "object" — use Array.isArray()
```

```javascript
function checkType(value) {
  if (typeof value === 'string') console.log('string');
  else if (typeof value === 'number') console.log('number');
  else console.log('other');
}
```

**Limitations:** `typeof null` returns `"object"`; arrays also return `"object"` — use `Array.isArray()` to distinguish.

## What is Hoisting in JavaScript?

**Hoisting** moves variable and function declarations to the top of their scope during compilation, before execution. This allows referencing declarations before their line in source — with important caveats.

### `var` — declaration hoisted, init is not

```javascript
console.log(x); // undefined
var x = 5;
console.log(x); // 5
// Interpreted as:
// var x;
// console.log(x);
// x = 5;
```

### Function declarations — fully hoisted

```javascript
greet(); // "Hello, World!"
function greet() {
  console.log("Hello, World!");
}
```

### Function expressions — only variable hoisted

```javascript
try {
  greet(); // TypeError: greet is not a function
} catch (e) {
  console.log(e.message);
}
var greet = function() {
  console.log("Hello, World!");
};
```

### `let` / `const` — hoisted but in TDZ until declaration

```javascript
console.log(x); // ReferenceError
let x = 5;
```

Hoisting can cause unexpected results with `var` (undefined before assignment). Declare at the top of scope; prefer `let`/`const`.

## What is the Temporal Dead Zone in JavaScript?

The **Temporal Dead Zone (TDZ)** is the period from the start of a block until a `let`/`const` variable is declared and initialized. Access during the TDZ throws `ReferenceError`.

```javascript
{
  console.log(x); // ReferenceError
  let x = 10;
}

function example() {
  console.log(a); // ReferenceError
  console.log(b); // ReferenceError
  let a = 1;
  const b = 2;
  console.log(a); // 1
  console.log(b); // 2
}
```

`let`/`const` are block-scoped and hoisted but not initialized — unlike `var`, which is initialized to `undefined`. The TDZ enforces safer variable usage.

## What is strict mode in JavaScript? How do you enable it?

**Strict mode** enforces stricter parsing and error handling, catching common mistakes and preventing unsafe patterns.

**Features:**

- Undeclared variables → `ReferenceError`
- Cannot assign to read-only properties
- `this` is `undefined` in plain function calls (not bound to global)
- Duplicate parameter names → `SyntaxError`
- Restricted `eval` scope; reserved keywords protected
- ES modules are always strict — no directive needed

Advantages: catches errors early, improves performance potential, reduces accidental globals.

**Enable:**

```javascript
"use strict"; // file scope

function strictFunction() {
  "use strict"; // function scope
}
```

```javascript
"use strict";
function testStrictMode() {
  x = 10; // ReferenceError: x is not defined
}
testStrictMode();
```

```javascript
"use strict";
const obj = {};
Object.defineProperty(obj, 'prop', { value: 1, writable: false });
obj.prop = 2; // TypeError
```

## Difference between slice() and splice() methods of an array?

Both work on arrays but serve different purposes — `slice` extracts without mutating; `splice` modifies in place.

| | `slice(start, end)` | `splice(start, deleteCount, ...items)` |
|---|---------------------|----------------------------------------|
| **Purpose** | Shallow copy of portion | Remove/replace/add elements |
| **Mutates original** | No | Yes |
| **Returns** | New array | Array of removed elements |

```javascript
let arr = [1, 2, 3, 4, 5];
let newArr = arr.slice(1, 4);
console.log(newArr); // [2, 3, 4]
console.log(arr);    // [1, 2, 3, 4, 5]

let removed = arr.splice(2, 2, 'a', 'b');
console.log(arr);     // [1, 2, 'a', 'b', 5]
console.log(removed); // [3, 4]
```

`slice()` supports negative indices counting from the end. Use `slice` for sub-arrays; `splice` when you need to add, remove, or replace in the original.

## Difference between map() and forEach() methods of an array?

Both iterate over every element, but differ in purpose and return value.

| | `map()` | `forEach()` |
|---|---------|-------------|
| **Returns** | New transformed array | `undefined` |
| **Mutates original** | No | No (by itself) |
| **Use** | Transform data | Side effects (log, mutate external state) |

```javascript
let arr = [1, 2, 3];
let doubled = arr.map(x => x * 2);
console.log(doubled); // [2, 4, 6]

arr.forEach(x => console.log(x * 2)); // 2, 4, 6
```

Choose `map` when you need a transformed array; `forEach` for side effects only.

## What is the find() method in arrays introduced in ES6? How does it differ from filter()?

`find()` (ES6) returns the **first** element matching a predicate, or `undefined`. `filter()` returns **all** matches as a new array.

| | `find()` | `filter()` |
|---|----------|------------|
| **Returns** | First matching element or `undefined` | New array of all matches (or `[]`) |
| **Stops early** | Yes | No — scans entire array |

```javascript
let numbers = [4, 9, 16, 25];
console.log(numbers.find(num => num > 10));   // 16
console.log(numbers.filter(num => num > 10)); // [16, 25]
```

`find()` stops at the first match — more efficient when you only need one result.

## What is Array.from() in ES6, and when would you use it?

`Array.from()` creates a new shallow-copied array from an array-like or iterable object, optionally applying a mapping function during conversion.

**Syntax:** `Array.from(arrayLike[, mapFn[, thisArg]])`

```javascript
// Array-like (arguments)
function example() {
  let args = Array.from(arguments);
  console.log(args); // [1, 2, 3]
}
example(1, 2, 3);

// Iterables (Set)
let arr = Array.from(new Set([1, 2, 3, 4]));

// With mapFn
let upper = Array.from('hello', char => char.toUpperCase());
// ['H', 'E', 'L', 'L', 'O']

// Generate range
let range = Array.from({ length: 5 }, (_, i) => i + 1);
// [1, 2, 3, 4, 5]
```

Use when converting `arguments`, DOM `NodeList`, `Set`, `Map`, or strings to real arrays so array methods (`map`, `filter`) are available.

## What is the includes() method in arrays in ES6, and how does it differ from indexOf()?

`includes()` (ES6) checks existence with a boolean return. `indexOf()` returns the first index or `-1`.

| | `includes(value, fromIndex?)` | `indexOf(searchElement, fromIndex?)` |
|---|--------------------------------|--------------------------------------|
| **Returns** | `true` / `false` | Index or `-1` |
| **NaN** | Finds `NaN` correctly | Cannot find `NaN` |
| **Comparison** | Strict (`===`) | Strict (`===`) |

```javascript
let arr = [1, 2, 3, 4, 5];
console.log(arr.includes(3));      // true
console.log(arr.includes(6));      // false
console.log(arr.indexOf(3));     // 2

let nanArr = [NaN];
console.log(nanArr.includes(NaN)); // true
console.log(nanArr.indexOf(NaN));  // -1
```

`includes()` is more readable for existence checks and correctly handles `NaN`.

## What is Array Destructuring and Object Destructuring in JavaScript?

**Destructuring** unpacks values from arrays or properties from objects into distinct variables — making code concise when working with complex data.

### Array

```javascript
let [a, b, c] = [1, 2, 3];
let [x = 1, y = 2] = [10];       // defaults
let [first, , third] = [1, 2, 3]; // skip
let [head, ...tail] = [1, 2, 3, 4];
```

### Object

```javascript
let { name, age } = { name: "Alice", age: 25 };
let { name = "Unknown", age = 0 } = { name: "Bob" };
let { name: firstName, age: years } = { name: "Charlie", age: 30 };

let { name, grades: { math, science } } = {
  name: "Dave", grades: { math: 90, science: 85 }
};

Supports defaults, skipping elements, renaming (`{ name: firstName }`), nesting, and rest (`...rest`).

## What is the difference between the Spread and Rest operators in JavaScript?

Both use `...` syntax but serve opposite purposes depending on context.

### Spread — expand iterables

```javascript
let numbers = [1, 2, 3];
let more = [0, ...numbers, 4, 5]; // [0, 1, 2, 3, 4, 5]

function add(x, y, z) { return x + y + z; }
add(...numbers); // 6

let obj2 = { ...{ a: 1, b: 2 }, c: 3 }; // { a: 1, b: 2, c: 3 }
```

### Rest — collect into array/object

```javascript
function sum(...numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}
let [first, ...rest] = [1, 2, 3, 4];
**Spread** expands iterables into individual elements. **Rest** collects remaining elements into an array or object.

## What is the purpose of the Object.entries() and Object.values() methods in ES6?

ES6 added utilities to extract key-value pairs and values from objects for iteration and transformation.

### `Object.entries(obj)` — array of `[key, value]` pairs

```javascript
let obj = { a: 1, b: 2, c: 3 };
Object.entries(obj); // [['a', 1], ['b', 2], ['c', 3]]

Object.entries(obj).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

let transformed = Object.entries(obj).map(([k, v]) => [k.toUpperCase(), v * 2]);
```

### `Object.values(obj)` — array of values

```javascript
Object.values(obj); // [1, 2, 3]
let sum = Object.values(obj).reduce((acc, v) => acc + v, 0); // 6
```

Pair with `forEach`, `map`, or `reduce` to iterate or transform object data.

## Difference between for and for...of loops in JavaScript?

The classic `for` loop offers full control over initialization, condition, and iteration. `for...of` (ES6) iterates values of any iterable directly.

| | `for` | `for...of` (ES6) |
|---|-------|------------------|
| **Control** | Init/condition/iteration — full control | Iterates iterable values directly |
| **Index access** | Yes | No (values only) |
| **Use** | Custom logic, counted loops | Arrays, strings, Maps, Sets |

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i); // 0 1 2 3 4
}

let array = [10, 20, 30];
for (const value of array) {
  console.log(value); // 10 20 30
}
```

Use `for` when you need indices or custom step logic; `for...of` for cleaner iteration over collections.

## Difference between for...of and for...in loops?

`for...of` iterates **values** of iterables (arrays, strings, Map, Set). `for...in` iterates enumerable **keys** of objects (including inherited — filter with `hasOwnProperty()`).

| | `for...of` | `for...in` |
|---|-----------|-----------|
| **Iterates** | Values of iterables | Enumerable **keys** of objects |
| **Arrays** | Element values | Indices (strings) — usually wrong choice |
| **Inherited props** | N/A | Included — filter with `hasOwnProperty()` |

```javascript
let array = [10, 20, 30];
for (const value of array) { console.log(value); } // 10 20 30

let obj = { a: 1, b: 2, c: 3 };
for (const key in obj) {
  console.log(key, obj[key]); // a 1, b 2, c 3
}
```

Avoid `for...in` on arrays — it iterates index strings, not values.

## What is the difference between synchronous and asynchronous iterators in JavaScript?

Iterators let you traverse data structures. **Sync** iterators handle immediately available data; **async** iterators handle data that arrives over time (APIs, streams).

| | Synchronous | Asynchronous |
|---|-------------|--------------|
| **Protocol** | `Symbol.iterator` | `Symbol.asyncIterator` |
| **`next()` returns** | `{ value, done }` | Promise → `{ value, done }` |
| **Loop** | `for...of` | `for await...of` |
| **Data** | Immediately available | Fetched/processed async |

```javascript
// Sync
let iterable = {
  *[Symbol.iterator]() {
    yield 1; yield 2; yield 3;
  }
};
for (let value of iterable) { console.log(value); }

// Async
async function* asyncIterable() {
  yield 1; yield 2; yield 3;
}
(async () => {
  for await (let value of asyncIterable()) {
    console.log(value);
  }
})();
```

Async iterators use `Symbol.asyncIterator` and `for await...of`; each `next()` returns a Promise.

## What are Prototypes in JavaScript? How does prototypal inheritance work?

**Prototypes** are the foundation of JS's object model. Every object has an internal `[[Prototype]]` link; property lookup walks the **prototype chain** when a property isn't found on the object itself.

```javascript
let parent = {
  greet() { console.log('Hello from parent!'); }
};
let child = Object.create(parent);
child.greet(); // 'Hello from parent!'
```

### Constructor pattern

```javascript
function Person(name) { this.name = name; }
Person.prototype.sayHello = function() {
  console.log(`Hello, my name is ${this.name}`);
};
let person1 = new Person('Alice');
person1.sayHello(); // Hello, my name is Alice
```

### Key methods

- **`Object.create(proto)`** — new object with given prototype
- **Constructor + `.prototype`** — shared methods on instances
- **ES6 `class`** — syntactic sugar over prototypes

```javascript
class Animal {
  speak() { console.log('Animal speaks'); }
}
class Dog extends Animal {
  bark() { console.log('Woof Woof'); }
}
let myDog = new Dog();
myDog.speak(); // Animal speaks
ES6 `class` syntax is syntactic sugar over this prototype mechanism — inheritance still works through the chain.

---

## Related Topics

- **JavaScript ES6 Features and Syntax** (`Javascript/`)
- **TypeScript Basics** (`TypeScript/`)
