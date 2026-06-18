# JavaScript Functions & Scoping

## Questions Covered

1. Difference between named and anonymous functions?
2. What are callback functions? What is their use?
3. What are higher-order functions in JavaScript?
4. What is function currying in JavaScript?
5. What are pure and impure functions in JavaScript?
6. What is a closure?
7. Explain the concept of lexical scoping?
8. What is the concept of encapsulation in the context of closures?
9. Difference between a regular function and a closure?
10. What are IIFEs (Immediately Invoked Function Expressions) and why are they used?
11. What are call, apply, and bind methods in JavaScript?
12. What is the use of this keyword in the context of event handling?

## Difference between named and anonymous functions?

Named functions have an identifier; anonymous functions lack one and are typically assigned to variables or passed as arguments.

| | Named function | Anonymous function |
|---|----------------|-------------------|
| **Definition** | Has a function name | No name — assigned to variable or passed as arg |
| **Debugging** | Name appears in stack traces | Shows as "anonymous" |
| **Hoisting** | Declarations fully hoisted | Expressions not hoisted |
| **IIFE** | Requires explicit call | Can self-invoke `(function(){})()` |

```javascript
function namedFunction() {
  console.log("This is a named function.");
}
namedFunction(); // works before declaration (hoisted)

const anonymousFunction = function() {
  console.log("This is an anonymous function.");
};
// anonymousFunction(); // error if called before assignment

(function() {
  console.log("IIFE");
})();
```

Named declarations are hoisted entirely; anonymous expressions must be defined before use.

## What are callback functions? What is their use?

A **callback** is a function passed as an argument to another function, invoked after an operation or event completes. Callbacks are fundamental to async programming, event handling, and customizable behavior in JavaScript.

```javascript
function doSomething(callback) {
  console.log("Doing something...");
  callback();
}
doSomething(() => console.log("Operation complete!"));
```

**Uses:**

- **Async operations** — run code after delay/fetch

```javascript
function fetchData(callback) {
  setTimeout(() => callback("Fetched Data"), 1000);
}
fetchData((data) => console.log(data));
```

- **Event handling**

```javascript
document.getElementById("myButton").addEventListener("click", function() {
  alert("Button clicked!");
});
```

- **Customizable behavior**

```javascript
function processData(data, callback) {
  callback(data.toUpperCase());
}
processData("hello", (result) => console.log(result)); // "HELLO"
```

- **Control flow chaining**

```javascript
function step1(cb) { console.log("Step 1"); cb(); }
function step2() { console.log("Step 2"); }
step1(step2);
```

## What are higher-order functions in JavaScript?

A **higher-order function** either takes another function as an argument or returns a function. They enable functional programming patterns like `map`, `filter`, composition, and currying.

Functions that **take functions as arguments** and/or **return functions**.

```javascript
function map(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i]));
  }
  return result;
}
const doubled = map([1, 2, 3], num => num * 2); // [2, 4, 6]

function multiplier(factor) {
  return function(x) { return x * factor; };
}
const double = multiplier(2);
console.log(double(5)); // 10
```

**Built-in HOFs:** `map`, `filter`, `reduce`, `forEach`, `sort`, etc.

```javascript
[1, 2, 3].map(n => n * n);           // [1, 4, 9]
[1, 2, 3, 4, 5].filter(n => n % 2 === 0); // [2, 4]
[1, 2, 3, 4].reduce((a, c) => a + c, 0);  // 10
```

**Function composition:**

```javascript
const compose = (f, g) => x => f(g(x));
const add2ThenMul3 = compose(x => x * 3, x => x + 2);
add2ThenMul3(5); // 21
```

Built-in array methods (`map`, `filter`, `reduce`) are the most common higher-order functions in daily JS.

## What is function currying in JavaScript?

**Currying** transforms a multi-argument function into a chain of functions each taking one argument, enabling partial application.

Transforming a multi-arg function into a chain of single-arg functions.

```javascript
function add(a, b, c) { return a + b + c; }

function curriedAdd(a) {
  return function(b) {
    return function(c) { return a + b + c; };
  };
}
console.log(curriedAdd(1)(2)(3)); // 6

const curriedAddArrow = a => b => c => a + b + c;
const add5 = curriedAdd(5);
console.log(add5(2)(3)); // 10
```

**Benefits:** partial application, reusable specialized functions, composition.

```javascript
function greet(greeting) {
  return function(name) { return `${greeting}, ${name}!`; };
}
const greetHello = greet("Hello");
console.log(greetHello("Alice")); // "Hello, Alice!"

const handleEvent = type => event => console.log(`Event type: ${type}`, event);
document.addEventListener("click", handleEvent("click"));
```

Currying promotes reusable, specialized functions and cleaner composition.

## What are pure and impure functions in JavaScript?

**Pure functions** always return the same output for the same input with no side effects. **Impure functions** may depend on or modify external state.

| | Pure | Impure |
|---|------|--------|
| **Output** | Same input → same output always | May vary (external state) |
| **Side effects** | None | May mutate globals, I/O, DOM |
| **Testing** | Easy — input/output only | Harder — depends on environment |

```javascript
// Pure
function add(a, b) { return a + b; }
function square(x) { return x * x; }

// Impure
let globalCounter = 0;
function incrementCounter() {
  globalCounter += 1;
  return globalCounter;
}

function logToConsole(message) {
  console.log(message); // side effect
}
```

Prefer pure functions where possible; impure functions are necessary for I/O and user interaction.

## What is a closure?

A **closure** is a function that retains access to variables from its outer lexical scope even after the outer function has finished executing.

```javascript
function createCounter() {
  let count = 0;
  return function() {
    count += 1;
    return count;
  };
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

**Use cases:**

- **Private state / encapsulation**

```javascript
function Person(name) {
  let age = 0;
  this.name = name;
  this.getAge = () => age;
  this.setAge = (n) => { if (n >= 0) age = n; };
}
```

- **Function factories**

```javascript
const multiplyBy = x => y => x * y;
const double = multiplyBy(2);
double(5); // 10
```

- **Event handlers with state**

```javascript
function setupButton(buttonId) {
  const button = document.getElementById(buttonId);
  let clickCount = 0;
  button.addEventListener('click', function() {
    clickCount += 1;
    console.log(`Clicked ${clickCount} times`);
  });
}
```

Closures enable private state, function factories, and stateful event handlers.

## Explain the concept of lexical scoping?

**Lexical scoping** means a function's accessible variables are determined by where it is **written** in source code, not where it is called.

Scope is determined by **where code is written**, not where it is called. Inner functions access variables from enclosing scopes.

```javascript
function outerFunction() {
  const outerVariable = 'I am from the outer function';
  function innerFunction() {
    console.log(outerVariable);
  }
  return innerFunction;
}
const myInner = outerFunction();
myInner(); // 'I am from the outer function'
```

**Scope chain lookup:** local → enclosing scopes → global.

**Lexical vs dynamic scoping:** JS uses lexical (not dynamic, which would depend on call site).

JavaScript uses lexical (not dynamic) scoping — this is what makes closures possible.

## What is the concept of encapsulation in the context of closures?

Closures bundle private data with functions that operate on it, exposing only a controlled public interface.

Closures bundle data with functions while hiding internal state from outside access.

```javascript
function createCounter() {
  let count = 0; // private
  return {
    increment() { count += 1; return count; },
    getCount() { return count; }
  };
}
const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.getCount());  // 1
console.log(counter.count);         // undefined
```

Only exposed methods can interact with `count` — controlled access, data privacy, modular design.

## Difference between a regular function and a closure?

Every closure is a function, but a closure specifically **captures and retains** outer scope variables after the outer function returns.

| | Regular function | Closure |
|---|-----------------|---------|
| **Outer scope** | Access only while outer fn runs | Retains outer variables after outer fn returns |
| **State** | No memory between calls (local only) | Preserves state across invocations |
| **Use** | Simple computation | Counters, private data, factories |

```javascript
function regularFunction(x) {
  let y = 10;
  return x + y; // y gone after return
}

function createCounter() {
  let count = 0;
  return function() { count += 1; return count; }; // closure retains count
}
```

Every closure is a function; not every function is a closure — only those capturing outer scope.

## What are IIFEs (Immediately Invoked Function Expressions) and why are they used?

An **IIFE** defines and immediately executes a function, creating a private scope without polluting the global namespace.

```javascript
(function() {
  let message = "Hello, world!";
  console.log(message);
})();
```

**Why use:**

- **Encapsulation** — private scope, no global leaks
- **Avoid namespace pollution**
- **Module pattern** (pre-ES6 modules)
- **One-time initialization**

```javascript
const counter = (function() {
  let count = 0;
  return {
    increment() { count += 1; return count; },
    getCount() { return count; }
  };
})();
console.log(counter.increment()); // 1
```

Less common today with ES6 modules and block-scoped `let`/`const`.

## What are call, apply, and bind methods in JavaScript?

`call`, `apply`, and `bind` explicitly set the `this` context when invoking a function — essential for borrowing methods and partial application.

Control the `this` context when invoking a function.

| Method | Invokes immediately | Arguments |
|--------|--------------------|-----------| 
| `call(thisArg, arg1, arg2, ...)` | Yes | Individual |
| `apply(thisArg, [args])` | Yes | Array |
| `bind(thisArg, arg1, ...)` | No — returns new fn | Optional preset |

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}
const person = { name: 'Alice' };

greet.call(person, 'Hello', '!');    // "Hello, Alice!"
greet.apply(person, ['Hi', '?']);    // "Hi, Alice?"

const greetAlice = greet.bind(person, 'Greetings');
greetAlice('!!!'); // "Greetings, Alice!!!"
```

Use for borrowing methods, explicit `this` binding, and partial application.

## What is the use of this keyword in the context of event handling?

In a standard DOM event handler (non-arrow function), `this` refers to the **element that received the event** — allowing direct manipulation of that element.

In a standard event handler, `this` refers to the **element that triggered the event**.

```html
<button id="myButton">Click Me</button>
```

```javascript
document.getElementById('myButton').addEventListener('click', function() {
  this.textContent = 'Clicked!';
  this.style.backgroundColor = 'blue';
  this.classList.add('clicked');
});
```

**Multiple elements** — `this` is the specific clicked element:

```javascript
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', function() {
    console.log(`Button ${this.id} clicked`);
  });
});
```

**Event delegation** — `this` is the parent the listener is on; use `event.target` for the actual clicked child:

```javascript
document.getElementById('parent').addEventListener('click', function(event) {
  console.log(`Clicked: ${event.target.tagName}`);
});
```

**Note:** Arrow function handlers inherit lexical `this` and do **not** bind to the element.
