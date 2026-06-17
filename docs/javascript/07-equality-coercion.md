# `==` vs `===` & Type Coercion

## Concept Explanation

- **`===` (strict equality)** compares value **and** type, with no conversion. `1 === "1"` is `false`.
- **`==` (loose equality)** performs **type coercion** before comparing, applying a set of conversion rules. `1 == "1"` is `true`.

**Type coercion** is JavaScript automatically converting values between types (e.g. string ↔ number ↔ boolean). It happens in comparisons, arithmetic (`+` is special — string concatenation if either side is a string), and boolean contexts (truthy/falsy).

**Best practice:** always use `===` unless you specifically want the coercion behavior (e.g. `== null` to catch both `null` and `undefined`).

## Code Example(s)

```javascript
// Strict vs loose
console.log(1 === "1"); // false (different types)
console.log(1 == "1");  // true  (string coerced to number)
console.log(0 == false);    // true  (false → 0)
console.log("" == false);   // true  ("" → 0, false → 0)
console.log(null == undefined); // true (special rule)
console.log(null === undefined); // false
```

```javascript
// The `+` operator: concatenation vs addition
console.log(1 + 2 + "3"); // "33"  (1+2=3, then 3 + "3" → "33")
console.log("1" + 2 + 3); // "123" (left-to-right, all string)
console.log(1 + true);    // 2     (true → 1)
```

```javascript
// Truthy / falsy
// Falsy values: false, 0, -0, 0n, "", null, undefined, NaN
if (!"" && !0 && !null && !undefined && !NaN) console.log("all falsy");
if ("0" && [] && {}) console.log("all truthy"); // "0", [], {} are truthy!
```

## Interview Q&A

**🟢 What is the difference between `==` and `===`?**
`===` checks value and type with no coercion; `==` coerces types before comparing. Prefer `===`.

**🟢 What are falsy values in JavaScript?**
`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, and `NaN`. Everything else is truthy — including `"0"`, `[]`, and `{}`.

**🟡 When is using `==` actually acceptable?**
`x == null` is a common idiom to check for both `null` and `undefined` in one comparison. Otherwise, prefer `===`.

**🟡 Why does `NaN === NaN` return `false`?**
`NaN` is defined as not equal to anything, including itself. Use `Number.isNaN(x)` (or `Object.is(x, NaN)`) to test for it.

**🔴 Explain how `[] == ![]` evaluates to `true`.**
`![]` is `false` (arrays are truthy, negated → false). Then `[] == false`: `false` → `0`, and `[]` → `""` → `0`. So `0 == 0` → `true`. A classic coercion brain-teaser.

## ⚠️ Tricky / Gotchas

- **`+` with strings concatenates; other operators (`-`, `*`, `/`) coerce to numbers:**

```javascript
console.log("5" + 1); // "51" (concatenation)
console.log("5" - 1); // 4    (numeric coercion)
```

- **`NaN` is never equal to anything** — `NaN === NaN` is `false`. Use `Number.isNaN`.
- **`[]`, `{}`, `"0"` are truthy** but `0` and `""` are falsy — a frequent confusion point.
- **Object coercion** calls `valueOf`/`toString`: `[] + []` → `""`, `[] + {}` → `"[object Object]"`, `{}` + `[]` can be `0` in some contexts (statement vs expression).
- **`Object.is`** is like `===` but treats `NaN` as equal to `NaN` and distinguishes `+0` from `-0`.

## 📌 Quick Recap

- `===` = value + type (no coercion); `==` = coerces first. Default to `===`.
- Falsy: `false, 0, -0, 0n, "", null, undefined, NaN`. `"0"`, `[]`, `{}` are truthy.
- `== null` catches both `null` and `undefined` (acceptable use of `==`).
- `+` concatenates with strings; `-`/`*`/`/` coerce to numbers.
- `NaN !== NaN` — use `Number.isNaN`; `Object.is` handles `NaN`/`±0` edge cases.
