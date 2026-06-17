# `this` Binding

## Concept Explanation

In JavaScript, `this` is **determined by how a function is called**, not where it's defined (except for arrow functions). There are four binding rules, in priority order:

1. **`new` binding** — `new Foo()` sets `this` to the newly created object.
2. **Explicit binding** — `call`, `apply`, `bind` set `this` explicitly.
3. **Implicit binding** — `obj.method()` sets `this` to `obj` (the object left of the dot).
4. **Default binding** — a standalone call sets `this` to the global object (`window`) or `undefined` in strict mode.

**Arrow functions** are the exception: they have **no own `this`**; they capture `this` lexically from the enclosing scope at definition time.

## Code Example(s)

```javascript
const user = {
  name: "Ada",
  greet() { return `Hi, ${this.name}`; }, // implicit: this = user
};
console.log(user.greet()); // "Hi, Ada"

const fn = user.greet;
console.log(fn()); // "Hi, undefined" — lost binding (default/global)
```

```javascript
// Explicit binding
function intro() { return this.name; }
console.log(intro.call({ name: "Grace" }));  // "Grace"
const bound = intro.bind({ name: "Linus" });
console.log(bound());                        // "Linus"
```

```javascript
// Arrow functions capture `this` lexically — great for callbacks
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => { this.seconds++; }, 1000); // arrow → `this` = the Timer instance
  }
}
// With a regular function, `this` inside setInterval would be the global object/undefined.
```

## Interview Q&A

**🟢 What determines the value of `this`?**
How the function is called: `new`, explicit (`call`/`apply`/`bind`), implicit (`obj.method()`), or default (global/`undefined`). Arrow functions are the exception — they inherit `this` lexically.

**🟢 What's the difference between `call`, `apply`, and `bind`?**
`call(thisArg, arg1, arg2)` invokes immediately with arguments listed. `apply(thisArg, [args])` invokes immediately with an array of arguments. `bind(thisArg)` returns a new function with `this` permanently bound (doesn't invoke).

**🟡 How does `this` behave in an arrow function?**
Arrow functions don't have their own `this`; they capture it from the surrounding lexical scope at definition. You can't change it with `call`/`apply`/`bind`.

**🟡 Why does `this` become `undefined` when you extract a method?**
Because `this` depends on the call site. `const f = obj.method; f();` is a standalone call, so implicit binding is lost and default binding applies (`undefined` in strict mode).

**🔴 What is `this` in a regular function callback passed to `setTimeout`?**
The global object (non-strict) or `undefined` (strict/modules), because it's invoked as a plain function. Use an arrow function or `bind` to preserve the intended `this`.

## ⚠️ Tricky / Gotchas

- **Lost `this` when passing methods as callbacks:**

```javascript
class Btn {
  constructor() { this.label = "OK"; }
  handle() { console.log(this.label); }
}
const b = new Btn();
document.addEventListener("click", b.handle);        // ❌ this = the element, not b
document.addEventListener("click", b.handle.bind(b)); // ✅ or use an arrow wrapper
```

- **Arrow functions as object methods are wrong** when you need `this` to be the object:

```javascript
const obj = { name: "X", greet: () => this.name }; // this = outer scope, NOT obj
obj.greet(); // undefined
```

- **`this` in a class method is strict-mode** (classes are always strict), so a lost binding gives `undefined`, not `window`.
- **`new` with an arrow function throws** — arrows can't be constructors.

## 📌 Quick Recap

- `this` = how a function is **called**: `new` > explicit (`call`/`apply`/`bind`) > implicit (`obj.m()`) > default (global/`undefined`).
- Arrow functions capture `this` lexically; can't be rebound; can't be `new`ed.
- `call`/`apply` invoke now (args list vs array); `bind` returns a bound copy.
- Extracting a method loses its `this` — use `bind` or an arrow wrapper.
- Don't use arrow functions for object/prototype methods that need `this`.
