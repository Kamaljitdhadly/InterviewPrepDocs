# JavaScript Memory Management

## Questions Covered

1. What is garbage collection in JavaScript, and how does it work?
2. What is a memory leak in JavaScript, and how can it be avoided?
3. What are weak maps and weak sets, and how are they used in memory management?
4. What is memoization?

## What is garbage collection in JavaScript, and how does it work?

**Garbage collection (GC)** is the automatic process that reclaims memory occupied by objects no longer in use. Unlike languages requiring manual `free()`, JavaScript engines handle this for you — freeing unreachable objects so memory can be reused and leaks are less likely.

Engines historically used **reference counting** (reclaim when ref count hits zero) but modern runtimes primarily rely on **mark-and-sweep** combined with **generational garbage collection**. Reference counting struggles with circular references; mark-and-sweep handles them correctly.

### Mark-and-Sweep

The most common GC algorithm. Two phases:

1. **Mark** — start from **root objects** (global scope, local variables, function parameters, closures in scope). Traverse the object graph and mark everything reachable as "in use."
2. **Sweep** — scan memory; unmarked objects are garbage and their space is reclaimed.

```javascript
let obj1 = { name: 'Alice' };
let obj2 = { age: 30 };
// obj1 and obj2 are reachable from the root (global scope)
obj1 = null; // obj1 is no longer reachable
// At some point, the garbage collector will reclaim the memory occupied by the old obj1
```

### Generational GC

Most engines categorize objects by age to reduce GC overhead:

- **Young generation** — newly allocated objects. Minor collections run frequently because most short-lived objects (temp variables, request-scoped data) become unreachable quickly.
- **Old generation** — objects that survive several collection cycles. Major collections run less often but are more thorough.

**Benefits:** focusing on the young generation is efficient (most objects die young); long-lived objects aren't scanned on every minor pass, improving overall performance.

**Interview takeaway:** GC is automatic; an object is collectible when nothing reachable from roots references it. Developers rarely trigger GC manually but should understand reachability when debugging memory issues.

## What is a memory leak in JavaScript, and how can it be avoided?

A **memory leak** occurs when the program unintentionally keeps references to objects that are no longer needed. The garbage collector cannot reclaim them, so memory consumption grows and performance degrades over time — especially in long-running SPAs.

### Common causes

**1. Global variables** — undeclared assignments become globals:

```javascript
function createLeak() {
  leak = 'This will be a global variable'; // Global variable
}
```

**2. Closures** — outer scope vars kept alive:

```javascript
function createClosure() {
  let largeObject = new Array(1000000).fill('leak');
  return function() {
    console.log(largeObject[0]);
  };
}
// `largeObject` remains in memory due to closure
```

**3. Detached DOM nodes** — removed from DOM but still referenced:

```javascript
let detachedElement = document.getElementById('myElement');
document.body.removeChild(detachedElement);
// If `detachedElement` is still referenced, it will not be garbage collected
```

**4. Event listeners** — not removed when elements go away:

```javascript
function addEventListener() {
  let button = document.getElementById('myButton');
  button.addEventListener('click', () => {
    console.log('Button clicked');
  });
}
// If the button element is removed but the event listener is still attached, it can cause a memory leak
```

**5. Timers/intervals** — never cleared:

```javascript
let timer = setInterval(() => {
  console.log('Interval running');
}, 1000);
// If `timer` is not cleared, it can continue to run indefinitely
```

### Prevention

Match each cause with a fix: scope variables correctly, release closure-held data when done, null out DOM refs after removal, remove listeners before discarding elements, and always `clearInterval`/`clearTimeout`.

- Scope with `let`/`const`/`var` properly:

```javascript
function example() {
  let localVar = 'This is scoped to the function';
}
```

- Avoid closures holding large unused data.
- Null refs to removed DOM nodes:

```javascript
function removeElement() {
  let element = document.getElementById('myElement');
  if (element) {
    element.parentNode.removeChild(element);
    element = null; // Clear reference
  }
}
```

- Remove event listeners:

```javascript
function removeEventListener() {
  let button = document.getElementById('myButton');
  button.removeEventListener('click', handlerFunction);
}
```

- Clear timers:

```javascript
let timer = setInterval(() => {
  console.log('Running...');
}, 1000);
clearInterval(timer);
```

### Detection tools

- **Chrome DevTools** — Memory tab: take heap snapshots, compare allocations over time, find detached DOM trees.
- **Firefox DevTools** — similar Memory profiler.
- **Regular profiling** — monitor heap size during navigation and repeated actions to spot steady growth.

## What are weak maps and weak sets, and how are they used in memory management?

**WeakMap** and **WeakSet** are specialized collections that hold **weak references** to their keys (WeakMap) or values (WeakSet). When the referenced object has no other strong references, the entry is automatically removed during GC — unlike `Map`/`Set`, which keep keys alive.

**Shared limitations:** no iteration (`forEach`, `keys`, `values`); no `size` property — you cannot enumerate contents.

| Feature | WeakMap | WeakSet |
|---------|---------|---------|
| Stores | Key-value pairs | Unique objects |
| Keys/values | Keys must be objects | Values must be objects |
| GC behavior | Key collected → entry removed | Object collected → entry removed |
| Typical use | Private/metadata per object | Track object membership |

### WeakMap

Keys must be objects (not primitives). Values can be any type. Useful when you need to associate data with an object without preventing that object from being collected — e.g., caching DOM-node metadata or storing private fields.

```javascript
const weakMap = new WeakMap();
const obj = {};
weakMap.set(obj, 'value');
console.log(weakMap.get(obj)); // Output: 'value'
// The key `obj` can be garbage collected when no other references to it exist
```

### WeakSet

Stores unique object references only. Useful for tracking which objects have been processed (e.g., visited nodes in a graph walk) without extending their lifetime beyond normal program use.

```javascript
const weakSet = new WeakSet();
const obj = {};
weakSet.add(obj);
console.log(weakSet.has(obj)); // Output: true
// The object `obj` can be garbage collected when no other references to it exist
```

**Use cases:** WeakMap — per-object private data, DOM metadata; WeakSet — tracking processed/visited objects.

## What is memoization?

**Memoization** is an optimization technique that caches the results of expensive function calls keyed by their arguments. When the same inputs occur again, the cached result is returned instead of recomputing.

**How it works:**

1. On call, check if arguments already exist in the cache.
2. **Cache hit** — return stored result immediately.
3. **Cache miss** — run the function, store the result, return it.

The cache is typically a key-value store (`Map` or object) where keys are serialized arguments and values are results.

**Benefits:** reduces time complexity for functions with overlapping subproblems (Fibonacci, combinatorics); speeds up repeated expensive lookups or calculations.

**Trade-off:** uses extra memory for the cache — best for pure functions where the same inputs always produce the same output.

```javascript
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
const memoizedFib = memoize(fib);
console.log(memoizedFib(10)); // Output: 55
```

**Use when:** overlapping subproblems (Fibonacci, combinatorics), expensive pure functions, repeated identical calls.
