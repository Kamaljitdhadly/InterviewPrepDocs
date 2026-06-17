# Array Methods: `map`/`filter`/`reduce` & Functional Patterns

## Concept Explanation

JavaScript arrays have higher-order methods that enable a **declarative, functional** style:

- **`map`** — transform each element → returns a **new array of the same length**.
- **`filter`** — keep elements that pass a predicate → returns a **new (possibly shorter) array**.
- **`reduce`** — fold the array into a single accumulated value (sum, object, grouped data, etc.).
- Others: `forEach` (side effects, returns nothing), `find`/`findIndex`, `some`/`every`, `flatMap`, `sort`.

These methods **don't mutate** the original array (except `sort`, `reverse`, `splice`, etc.) and encourage immutable data flow. Plus utilities like **debounce** and **throttle** control how often a function runs.

## Code Example(s)

```javascript
const nums = [1, 2, 3, 4, 5];

const doubled = nums.map((n) => n * 2);          // [2,4,6,8,10]
const evens = nums.filter((n) => n % 2 === 0);   // [2,4]
const sum = nums.reduce((acc, n) => acc + n, 0); // 15

// Chaining: sum of squares of even numbers
const result = nums
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .reduce((a, b) => a + b, 0); // 4 + 16 = 20
```

```javascript
// reduce to group objects (very common in interviews)
const people = [
  { name: "A", dept: "eng" },
  { name: "B", dept: "sales" },
  { name: "C", dept: "eng" },
];
const byDept = people.reduce((acc, p) => {
  (acc[p.dept] ??= []).push(p.name); // init array if missing
  return acc;
}, {});
// { eng: ["A","C"], sales: ["B"] }
```

```javascript
// Debounce: run only after activity stops (e.g. search input)
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Throttle: run at most once per interval (e.g. scroll handler)
function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) { last = now; fn(...args); }
  };
}
```

## Interview Q&A

**🟢 What's the difference between `map` and `forEach`?**
`map` returns a new transformed array; `forEach` returns `undefined` and is used purely for side effects. Use `map` when you need the result.

**🟢 What does `reduce` do?**
It reduces an array to a single value by repeatedly applying a reducer function with an accumulator. It can build numbers, strings, objects, or arrays.

**🟡 Do `map`/`filter` mutate the original array?**
No — they return new arrays. (Methods like `sort`, `reverse`, `splice`, `push` mutate in place; `sort` notably sorts the original.)

**🟡 What's the difference between debounce and throttle?**
Debounce delays execution until activity stops (good for search-as-you-type). Throttle limits execution to once per time interval regardless of how often it's triggered (good for scroll/resize).

**🔴 What's the difference between `find`/`some`/`every` and filtering?**
`find` returns the first matching element (or `undefined`); `some` returns `true` if any match; `every` returns `true` if all match. They **short-circuit** (stop early), unlike `filter` which always scans the whole array.

## ⚠️ Tricky / Gotchas

- **`reduce` without an initial value** uses the first element as the seed and starts at index 1 — and **throws on an empty array**. Always pass an initial value.

```javascript
[].reduce((a, b) => a + b);     // ❌ TypeError: Reduce of empty array with no initial value
[].reduce((a, b) => a + b, 0);  // ✅ 0
```

- **`sort` is lexicographic by default** — it sorts numbers as strings:

```javascript
[10, 2, 1].sort();              // [1, 10, 2]  ❌
[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10] ✅
```

- **`sort` mutates the original array** — copy first (`[...arr].sort()`) if you need to preserve it.
- **`map` over sparse arrays / using it for side effects** is an anti-pattern — use `forEach` or `for...of`.
- **`forEach` can't be `break`-ed or awaited properly** — use `for...of` when you need early exit or sequential `await`.

## 📌 Quick Recap

- `map` → new array (transform); `filter` → new array (subset); `reduce` → single value.
- These don't mutate; `sort`/`reverse`/`splice`/`push` do (`sort` is in-place + lexicographic).
- `reduce` needs an initial value (throws on empty array otherwise).
- `find`/`some`/`every` short-circuit; `filter` scans everything.
- Debounce = wait until idle; Throttle = at most once per interval.
- Use `for...of` for early exit / sequential `await`, not `forEach`.
