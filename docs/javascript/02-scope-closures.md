# Scope & Closures

## Concept Explanation

**Scope** determines where variables are accessible. JavaScript has **global**, **function**, and **block** scope, and uses **lexical (static) scoping** — inner functions can access variables from their enclosing functions, determined by where they're *written*, not where they're *called*.

A **closure** is a function bundled together with references to its surrounding state (its lexical environment). When a function "remembers" variables from the scope it was created in — even after that outer function has returned — that's a closure. Closures power data privacy, function factories, memoization, and event handlers.

## Code Example(s)

```javascript
// Closure: makeCounter "remembers" count after it returns
function makeCounter() {
  let count = 0;                  // private to the closure
  return function () {
    count++;                      // still accessible
    return count;
  };
}
const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2  — state persists between calls
```

```javascript
// Data privacy / module pattern via closure
function createBankAccount(initial) {
  let balance = initial;          // cannot be accessed directly from outside
  return {
    deposit: (n) => (balance += n),
    getBalance: () => balance,
  };
}
const acc = createBankAccount(100);
acc.deposit(50);
console.log(acc.getBalance()); // 150
// acc.balance → undefined (truly private)
```

## Interview Q&A

**🟢 What is a closure?**
A function together with references to the variables in its lexical scope, allowing it to access those variables even after the outer function has finished executing.

**🟢 What is lexical scope?**
Scope determined by the physical location of code. Inner functions can access variables declared in their outer functions, based on where they are written.

**🟡 Give a practical use of closures.**
Data privacy (private variables via the module pattern), function factories (a function that returns customized functions), memoization/caching, maintaining state in event handlers and callbacks.

**🟡 Do closures capture the variable or its value?**
The variable (by reference), not a snapshot of its value. So if the variable changes later, the closure sees the new value — the root of the loop-variable gotcha.

**🔴 Can closures cause memory leaks?**
Yes — a closure keeps its referenced variables alive. If a closure is held by a long-lived object (e.g. an un-removed event listener) and captures large data, that data can't be garbage collected until the closure is released.

## ⚠️ Tricky / Gotchas

- **Loop closure with `var`** — all callbacks share the same variable:

```javascript
const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map((f) => f())); // [3, 3, 3]

// Fixes: use let, or an IIFE to capture per-iteration value
for (let i = 0; i < 3; i++) fns.push(() => i); // [0, 1, 2]
```

- **Closures capture by reference, not by value** — modifying the captured variable after creating the closure affects the result.
- **Each call to the outer function creates a NEW closure** with its own independent variables (two counters don't share `count`).
- **Accidental retention**: capturing a big object you don't need keeps it in memory. Capture only what you need.

## 📌 Quick Recap

- Scope: global / function / block; JS uses lexical (static) scope.
- Closure = function + remembered lexical environment; persists after outer returns.
- Uses: privacy, factories, memoization, stateful callbacks.
- Closures capture variables **by reference** → `var`-in-loop bug (fix with `let`/IIFE).
- Each outer-function call makes a fresh, independent closure.
