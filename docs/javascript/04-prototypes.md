# Prototypes & Inheritance

## Concept Explanation

JavaScript uses **prototypal inheritance**. Every object has an internal link (`[[Prototype]]`, accessible via `Object.getPrototypeOf()` or the legacy `__proto__`) to another object — its **prototype**. When you access a property, JS looks on the object itself, then walks up the **prototype chain** until it finds it or reaches `null`.

Functions have a `prototype` property used when called with `new`: the new object's `[[Prototype]]` is set to that function's `prototype`. **ES6 `class`** is **syntactic sugar** over this prototype mechanism — it's not classical (Java/C#-style) inheritance under the hood.

## Code Example(s)

```javascript
// Prototype chain in action
const animal = { eats: true };
const dog = Object.create(animal); // dog.[[Prototype]] = animal
dog.barks = true;

console.log(dog.barks); // true (own property)
console.log(dog.eats);  // true (found up the chain on animal)
console.log(Object.getPrototypeOf(dog) === animal); // true
```

```javascript
// Constructor function + shared methods on prototype
function Person(name) { this.name = name; }
Person.prototype.greet = function () { return `Hi, ${this.name}`; };

const p = new Person("Ada");
console.log(p.greet()); // "Hi, Ada" — method shared via prototype, not per-instance
```

```javascript
// ES6 class = sugar over prototypes
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}
class Dog extends Animal {
  speak() { return `${this.name} barks`; } // override
}
console.log(new Dog("Rex").speak()); // "Rex barks"
```

## Interview Q&A

**🟢 What is prototypal inheritance?**
Objects inherit directly from other objects via a prototype link. Property lookups traverse the prototype chain until found or `null`.

**🟢 What is the prototype chain?**
The series of linked prototype objects JS searches when resolving a property. It ends at `Object.prototype` whose prototype is `null`.

**🟡 Is `class` in JavaScript real classical inheritance?**
No. `class` is syntactic sugar over prototypes and constructor functions. Methods defined in a class live on the prototype; `extends` sets up the prototype chain.

**🟡 Difference between `__proto__` and `prototype`?**
`prototype` is a property of constructor *functions*, used to set the `[[Prototype]]` of instances created with `new`. `__proto__` (now `Object.getPrototypeOf`) is the actual prototype link on an *instance*.

**🔴 Why define methods on the prototype instead of inside the constructor?**
Prototype methods are shared by all instances (one function in memory). Defining methods inside the constructor creates a new function per instance — wasteful for memory and breaks reference equality of the method.

## ⚠️ Tricky / Gotchas

- **`hasOwnProperty` vs `in`** — `in` checks the whole prototype chain; `hasOwnProperty` checks only the object itself:

```javascript
const o = Object.create({ inherited: 1 });
o.own = 2;
console.log("inherited" in o);            // true
console.log(o.hasOwnProperty("inherited")); // false
```

- **Modifying built-in prototypes** (`Array.prototype.foo = ...`) is dangerous — it leaks into every array and can break libraries/`for...in`.
- **Arrow functions have no `prototype`** and can't be constructors.
- **`for...in` iterates inherited enumerable properties too** — use `Object.keys()` or `hasOwnProperty` guards.
- **Class fields (`field = value`) are per-instance**, but class methods are on the prototype — a common source of confusion.

## 📌 Quick Recap

- JS = prototypal inheritance; lookups walk the prototype chain to `null`.
- `prototype` is on constructor functions; `[[Prototype]]`/`__proto__` is the instance link.
- `class` is sugar over prototypes; methods live on the prototype (shared).
- `in` checks the chain; `hasOwnProperty` checks own properties only.
- Don't modify built-in prototypes; arrow functions can't be constructors.
