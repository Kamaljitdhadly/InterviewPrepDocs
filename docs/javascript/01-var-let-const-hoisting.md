# `var` / `let` / `const` & Hoisting

## Concept Explanation

The three ways to declare variables differ in **scope**, **hoisting**, and **reassignment**:

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | function | block `{}` | block `{}` |
| Hoisting | hoisted, initialized `undefined` | hoisted but in **TDZ** | hoisted but in **TDZ** |
| Reassign | ✅ | ✅ | ❌ |
| Redeclare in same scope | ✅ | ❌ | ❌ |

**Hoisting** is JavaScript moving declarations to the top of their scope during compilation. `var` declarations are hoisted and initialized to `undefined`. `let`/`const` are hoisted too, but live in the **Temporal Dead Zone (TDZ)** — accessing them before the declaration line throws a `ReferenceError`.

## Code Example(s)

```javascript
// var is hoisted and initialized to undefined
console.log(a); // undefined (not an error)
var a = 1;

// let/const are in the TDZ until declared
console.log(b); // ❌ ReferenceError: Cannot access 'b' before initialization
let b = 2;
```

```javascript
// Scope difference
function scopeDemo() {
  if (true) {
    var x = "function-scoped";
    let y = "block-scoped";
  }
  console.log(x); // "function-scoped"
  console.log(y); // ❌ ReferenceError — y not visible here
}
```

```javascript
// const prevents REASSIGNMENT, not MUTATION
const arr = [1, 2];
arr.push(3);      // ✅ allowed — mutating contents
// arr = [4];     // ❌ TypeError — reassigning the binding
```

## Interview Q&A

**🟢 What is the difference between `var`, `let`, and `const`?**
`var` is function-scoped and hoisted as `undefined`; `let` and `const` are block-scoped and in the TDZ until declared. `const` can't be reassigned; `var`/`let` can.

**🟢 What is hoisting?**
JavaScript moves declarations to the top of their scope before execution. `var` is initialized to `undefined`; function declarations are fully hoisted; `let`/`const` are hoisted but not initialized (TDZ).

**🟡 Does `const` make an object immutable?**
No. `const` only prevents reassigning the variable. The object's properties can still be mutated. Use `Object.freeze()` for shallow immutability.

**🟡 What is the Temporal Dead Zone?**
The period between entering a scope and the `let`/`const` declaration being initialized. Accessing the variable in that window throws a `ReferenceError`.

**🔴 Are function declarations and function expressions hoisted the same way?**
Function *declarations* are fully hoisted (callable before their definition). Function *expressions* assigned to `var` are not — only the `var` is hoisted as `undefined`, so calling it early throws "not a function".

## ⚠️ Tricky / Gotchas

- **`var` in loops + closures** — classic bug because `var` is function-scoped, so all closures share one variable:

```javascript
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2 (let = new binding per iteration)
```

- **`typeof` on a TDZ variable still throws** — unlike undeclared variables where `typeof undeclared === "undefined"`.
- **Function declaration vs expression hoisting:**

```javascript
foo(); // ✅ works — declaration hoisted
function foo() {}
bar(); // ❌ TypeError: bar is not a function
var bar = function () {};
```

- **Redeclaring with `let` in the same scope is a SyntaxError**, but `var` silently allows it.

## 📌 Quick Recap

- `var` = function-scoped, hoisted as `undefined`; `let`/`const` = block-scoped, TDZ.
- `const` blocks reassignment, not mutation (use `Object.freeze` for immutability).
- Hoisting: declarations move up; function declarations fully hoisted, expressions not.
- Use `let`/`const` in modern code; the `var`-in-loop closure bug is fixed by `let`.
