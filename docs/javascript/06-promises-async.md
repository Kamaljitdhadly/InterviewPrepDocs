# Promises & `async`/`await`

## Concept Explanation

A **Promise** represents the eventual result of an asynchronous operation. It has three states: **pending** → **fulfilled** (resolved with a value) or **rejected** (with an error). You consume it with `.then()`, `.catch()`, `.finally()`, or with **`async`/`await`** syntax that makes asynchronous code read synchronously.

`async` functions always return a Promise. `await` pauses the async function until the awaited promise settles, unwrapping its value (or throwing on rejection). Combinators handle multiple promises: `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`.

## Code Example(s)

```javascript
// Creating and consuming a promise
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

wait(100)
  .then(() => "done")
  .then((msg) => console.log(msg))
  .catch((err) => console.error(err))
  .finally(() => console.log("cleanup"));
```

```javascript
// async/await with error handling
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed:", err);
    throw err; // rethrow if caller should handle it
  }
}
```

```javascript
// Combinators
const [a, b] = await Promise.all([fetchA(), fetchB()]);   // parallel, fails fast
const results = await Promise.allSettled([fetchA(), fetchB()]); // never short-circuits
const fastest = await Promise.race([fetchA(), timeout(1000)]);  // first to settle
const firstOk = await Promise.any([fetchA(), fetchB()]);        // first to FULFILL
```

## Interview Q&A

**🟢 What is a Promise?**
An object representing the future result of an async operation, in one of three states: pending, fulfilled, or rejected.

**🟢 What's the relationship between `async`/`await` and Promises?**
`async`/`await` is syntactic sugar over promises. `async` functions return a promise; `await` waits for a promise to settle and unwraps its value.

**🟡 What's the difference between `Promise.all` and `Promise.allSettled`?**
`Promise.all` rejects as soon as any promise rejects (fail-fast) and resolves with all values otherwise. `Promise.allSettled` never rejects — it waits for all and returns each result's status (`fulfilled`/`rejected`).

**🟡 How do you run promises in parallel vs sequentially?**
Parallel: start them, then `await Promise.all([...])`. Sequential: `await` them one at a time in a loop (each waits for the previous).

**🔴 What's the difference between `Promise.race` and `Promise.any`?**
`race` settles with the first promise to *settle* (fulfill OR reject). `any` settles with the first to *fulfill*, ignoring rejections unless all reject (then it throws an `AggregateError`).

## ⚠️ Tricky / Gotchas

- **`await` in a loop is sequential** — a common performance mistake:

```javascript
for (const id of ids) await fetchUser(id);            // ❌ one after another
await Promise.all(ids.map((id) => fetchUser(id)));    // ✅ parallel
```

- **Forgetting to `await` or return** swallows errors and creates unhandled rejections:

```javascript
async function bad() { doAsync(); }   // ❌ not awaited → errors lost
async function good() { await doAsync(); }
```

- **`.then` callbacks always run async** (as microtasks) even if the promise is already resolved — order surprises (see Event Loop).
- **A `throw` inside an `async` function rejects its returned promise** — it doesn't throw synchronously to the caller.
- **Mixing `.then` and `await`** unnecessarily makes code hard to read; pick one style.
- **`Promise.all` fails fast** — if you need all results regardless, use `allSettled`.

## 📌 Quick Recap

- Promise states: pending → fulfilled / rejected.
- `async` returns a promise; `await` unwraps it (throws on rejection).
- `all` (fail-fast, all values), `allSettled` (all results), `race` (first settled), `any` (first fulfilled).
- `await` in a loop = sequential; use `Promise.all` for parallel.
- Always `await`/return async calls and handle rejections to avoid silent failures.
