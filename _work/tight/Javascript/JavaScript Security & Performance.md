# JavaScript Security & Performance

## Questions Covered

1. What is the eval() function in JavaScript?
2. What are some best practices for security in JavaScript?
3. What are the best practices for improving performance in JavaScript?
4. How does lazy loading work in JavaScript?
5. What are web workers, and how do they improve performance?
6. How do you handle large datasets efficiently in JavaScript?

## What is the eval() function in JavaScript?

The built-in `eval(string)` function parses and executes a string as JavaScript code **in the current lexical scope**. If the string is an expression, `eval` returns its value; if it contains statements, they execute for side effects.

**Syntax:** `eval(string)` — `string` is the code to run.

```javascript
const result = eval('2 + 2');
console.log(result); // Output: 4
eval('console.log("Hello, World!");'); // Output: Hello, World!
```

**Risks:**

- **Security** — if the evaluated string includes user input, attackers can inject arbitrary code (XSS-style execution). Never pass untrusted data to `eval`.
- **Performance** — engines optimize static code at parse/compile time. Dynamic `eval` code cannot be optimized the same way, hurting JIT performance.
- **Scope** — `eval` can read and modify variables in the enclosing scope; careless use creates globals and hard-to-trace side effects.
- **Debugging** — dynamically generated code is harder to trace in stack traces and source maps.

**Safer alternatives** — prefer these over `eval` for dynamic behavior:

```javascript
const jsonString = '{"name": "Alice", "age": 25}';
const obj = JSON.parse(jsonString);
console.log(obj); // Output: { name: 'Alice', age: 25 }
```

```javascript
const func = new Function('a', 'b', 'return a + b');
console.log(func(2, 3)); // Output: 5
```

```javascript
const name = 'Bob';
console.log(`Hello, ${name}!`); // Output: Hello, Bob!
```

Avoid `eval()` unless absolutely necessary.

## What are some best practices for security in JavaScript?

Treat the browser as untrusted — client-side code is fully visible. Never rely on client-only validation for security.

- **Sanitize inputs** — escape/strip HTML in user content (DOMPurify) to prevent XSS.
- **Validate inputs** — check format/length/type on client and server; use regex or validator.js.
- **HTTPS** — encrypt all traffic; protects cookies and tokens from MITM.
- **No inline JS** — external scripts + **CSP** headers to restrict script sources.
- **Auth** — OAuth/JWT with short expiry; enforce least-privilege authorization.
- **Secure cookies** — `Secure`, `HttpOnly`, `SameSite` attributes.
- **Hide secrets** — API keys belong server-side or in env vars, never in bundles.
- **Generic errors** — safe user messages; log details server-side only.
- **Update dependencies** — `npm audit`, Snyk for CVE patches.
- **Safe code** — avoid `eval()`/`new Function()`; use `"use strict"`.
- **CSRF tokens** — on forms and state-changing API calls.
- **API hardening** — authentication + rate limiting.

## What are the best practices for improving performance in JavaScript?

Measure first (Lighthouse, Performance tab), then optimize the main thread and network:

**DOM & rendering** — batch reads/writes; `DocumentFragment` for off-DOM builds; batch style changes; prefer CSS animations over per-frame JS.

**Events & main thread** — debounce/throttle scroll/resize; event delegation; Web Workers for CPU-heavy tasks; chunk long sync work with `rAF`/`setTimeout`.

**Loading & network** — minify/compress (gzip/Brotli); `async`/`defer` scripts; HTTP caching; fewer/batched API calls; lazy-load images and routes.

**Code-level** — efficient loops; `Map`/`Set` for lookups; native methods over custom; remove listeners/timers; audit third-party scripts.

## How does lazy loading work in JavaScript?

**Lazy loading** defers loading resources (images, scripts, components) until they are needed — typically when they enter the viewport or when the user triggers an action. This cuts initial page weight, speeds first paint, and saves bandwidth on content users never see.

**Common targets:** below-the-fold images, non-critical JS modules, tab panels, and route-level code splits.

### Images

**Native `loading="lazy"`** — browser handles deferral with no JS:

```javascript
<img src="image.jpg" loading="lazy" alt="Description">
```

**Intersection Observer API** — swap `data-src` for `src` when the element crosses into the viewport. More control over thresholds and root margins:

```javascript
function lazyLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      observer.unobserve(img);
    }
  });
}
const observer = new IntersectionObserver(lazyLoad, {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
});
document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### Scripts & modules

**`async` / `defer` attributes** on `<script>` tags control when downloaded scripts execute relative to HTML parsing:

```javascript
<script src="script.js" async></script>
```

```javascript
<script src="script.js" defer></script>
```

- `async` — download in parallel, execute immediately when ready.
- `defer` — download in parallel, execute after HTML parse.

**Dynamic `import()`** — ES module syntax that returns a Promise; ideal for loading feature code on user interaction (e.g., chart library on button click):

```javascript
button.addEventListener('click', () => {
  import('./module.js').then(module => {
    module.loadFunction();
  });
});
```

**Considerations:** provide placeholder/skeleton UI while content loads; ensure above-the-fold SEO-critical content is in the initial HTML (lazy images below fold are fine); test on slow networks to avoid layout shift.

## What are web workers, and how do they improve performance?

**Web Workers** let you run JavaScript on a **background thread** parallel to the main UI thread. The main thread stays free for rendering, input, and animations while workers handle CPU-intensive tasks.

Because workers have **no DOM access** and run in an isolated global (`self`), they communicate with the main thread exclusively via **`postMessage`** / **`onmessage`** — structured cloning transfers data between threads.

### Why they improve performance

1. **Non-blocking** — heavy computation (sorting large arrays, parsing files, crypto) won't freeze the UI.
2. **Parallelism** — modern CPUs have multiple cores; workers can utilize them simultaneously.
3. **Separation of concerns** — keep the main thread focused on user interaction and rendering.

### Basic usage

```javascript
// main.js
const worker = new Worker('worker.js');
```

**Worker script:**

```javascript
// worker.js
self.onmessage = function(e) {
  console.log('Message received from main thread:', e.data);
  const result = e.data * 2;
  self.postMessage(result);
};
```

**Communication:**

```javascript
// main.js
worker.postMessage(5);
worker.onmessage = function(e) {
  console.log('Message received from worker:', e.data);
};
```

### Worker types

- **Dedicated Worker** — created by one script; cannot be shared. Most common for app-specific background tasks.
- **Shared Worker** — accessible from multiple browsing contexts (tabs, iframes) on the same origin.
- **Service Worker** — event-driven proxy for caching, push notifications, and offline support; intercepts network requests independently of any page.

**Limitations:** no `document`, `window`, or DOM APIs; cannot directly share variables with the main thread; check browser support for older environments.

## How do you handle large datasets efficiently in JavaScript?

Large in-browser datasets risk memory exhaustion and UI jank. Pick strategies based on data shape and UX:

- **Pagination / infinite scroll** — load fixed chunks on demand.
- **Virtualization** — render only visible rows (react-virtualized, Angular CDK); essential for 10k+ tables.
- **Lazy loading & streaming** — fetch on scroll; SSE/Streams API for incremental server data.
- **Web Workers** — sort/filter/transform off the main thread.
- **Batch processing** — N items per frame via `rAF`/`setTimeout`.
- **Typed arrays** — compact numeric storage; mutate in place to avoid copies.
- **Compression & caching** — gzip/Brotli payloads; IndexedDB for repeat access.
- **Libraries** — Lodash utilities; D3 for large visualizations.
- **Memory** — DevTools heap snapshots; dereference on unmount.

```javascript
<div id="data-container"></div>
<button id="load-more" style="display: none;">Load More</button>
const container = document.getElementById('data-container');
const loadMoreButton = document.getElementById('load-more');
function fetchData(start, limit) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Array.from({ length: limit }, (_, i) => `Item ${start + i + 1}`));
    }, 1000);
  });
}
function appendItems(items) {
  items.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item;
    container.appendChild(div);
  });
}
async function loadMoreItems() {
  const currentCount = container.children.length;
  const newItems = await fetchData(currentCount, 20);
  appendItems(newItems);
}
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadMoreItems();
  }
}, {
  rootMargin: '100px',
});
observer.observe(loadMoreButton);
```
