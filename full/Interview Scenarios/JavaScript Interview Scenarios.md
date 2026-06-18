# JavaScript Interview Scenarios

**What this is:** Browser and Node.js production traps — **async races, security boundaries, React lifecycle, and storage choices**. Not "what is a closure" — instead: double payment in Strict Mode, token refresh stampedes, and prototype pollution in real merges.

**Why interviewers ask:** Front-end bugs often become **money and security** bugs (double charge, XSS session theft, stale service worker bundles).

## Questions Covered

1. JWT in localStorage — user "logs out" but XSS still owns the session. What do you do?
2. `useEffect` runs twice in React 18 Strict Mode — payment API charged twice. Why and fix?
3. Closure in a loop: five buttons all alert "5". Production variant with `setTimeout`?
4. `Promise.all` on four payment gateways — one fails. Money captured twice?
5. Event loop: `setTimeout(0)` vs `Promise.resolve().then` — order matters for bug?
6. `fetch` returns 401 — SPA should refresh token or redirect. Race with 10 parallel requests?
7. Memory leak: SPA navigates away but WebSocket + interval keep running. How to find?
8. `===` vs `Object.is` — `NaN` and `+0`/`-0` break cache key logic. Scenario?
9. Prototype pollution via `JSON.parse` merge — `__proto__` in query string. Impact?
10. Service Worker caches `index.html` forever — users stuck on old bundle after deploy. Fix?
11. `postMessage` from iframe without origin check — what can attacker do?
12. Debounced search still hits API 100 times on mount — subtle React bug?

## JWT in localStorage — logout doesn't end XSS session?

**Context:** User clicks Logout; app removes token from `localStorage`. Attacker who already exfiltrated the token via XSS **still has full access** until token expires.

**What trips people up:** Treating client-side logout as security; storing long-lived tokens in `localStorage`.

| Layer | Control |
|-------|---------|
| **Storage** | httpOnly `Secure` `SameSite` cookie for refresh token — JS cannot read it |
| **XSS prevention** | CSP, sanitize HTML, no inline scripts |
| **Server** | Revoke refresh token family on logout |
| **Access TTL** | Short (5–15 min); keep access token in **memory** only |

```typescript
let accessToken: string | null = null;  // memory, not localStorage

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  accessToken = null;
  router.navigate('/login');
}
```

**CSRF note:** Cookie-based refresh needs `SameSite` + anti-forgery token on state-changing POSTs.

**Strong close:** "XSS + localStorage = game over; httpOnly refresh + short in-memory access + CSP."

## useEffect twice in React 18 Strict Mode — double charge?

**Context:** Developer sees duplicate POST `/checkout` in dev only and blames React. In prod, retries or double-clicks cause the same financial risk.

**Cause:** Strict Mode **double-invokes** effects in development to expose missing cleanup — not a prod behavior, but reveals missing **idempotency**.

```tsx
// Bug — side effect without idempotency
useEffect(() => {
  chargeCard(orderId);
}, [orderId]);

// Fix — charge on explicit user action, not mount effect
// Server MUST accept Idempotency-Key duplicate without double charge
```

**Strong close:** "Never charge in `useEffect` on mount; server idempotency is the real fix."

## Closure in a loop — production variant?

**Classic interview:**

```javascript
for (var i = 0; i < 5; i++) {
  buttons[i].onclick = () => alert(i);  // all alert 5
}
```

**Production variant:** Batch job schedules `setTimeout` inside a `for` loop with shared `var tenantId` — all callbacks process the **last** tenant.

**Fix:** `let` in loop, IIFE with parameter, or `forEach((item, i) => ...)`.

**Strong close:** "`var` + async callback = shared binding — use `let` or pass parameter."

## Promise.all on four payment gateways?

**Context:** Team runs Stripe, Adyen, PayPal in parallel with `Promise.all` to "use whichever responds first" — **two can succeed** before any fails.

```typescript
// Dangerous — multiple captures possible
await Promise.all(providers.map(p => p.charge(amount)));

// Safer — sequential fallback
for (const provider of providers) {
  try { return await provider.charge(amount); }
  catch { continue; }
}
```

**Strong close:** "`Promise.all` is not 'first success' — use sequential fallback, `Promise.any` with void on losers, and idempotency keys."

## Event loop — setTimeout(0) vs Promise?

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2 — microtasks before macrotasks
```

**Bug scenario:** Analytics in `Promise.then` fires before `setTimeout` navigation — page view recorded for wrong URL.

**Strong close:** "Microtasks drain before next macrotask — order matters for analytics and DOM updates."

## fetch 401 — ten parallel requests, one refresh?

**Context:** Access token expired. Ten API calls return 401 simultaneously. Ten refresh calls race — refresh token rotation may **invalidate** all but one; others get 401 and log user out.

**Pattern — single-flight refresh:**

```typescript
let refreshPromise: Promise<string> | null = null;

async function getAccessToken(): Promise<string> {
  if (accessToken && !isExpired(accessToken)) return accessToken;
  if (!refreshPromise) {
    refreshPromise = refresh().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
```

Queue failed requests; retry all after single refresh completes.

**Strong close:** "One refresh in flight; queue and replay — never parallel refresh."

## Memory leak — WebSocket + interval after navigation?

**Context:** React route unmounts but component left WebSocket open and `setInterval` running — heap grows as user navigates SPA.

```tsx
useEffect(() => {
  const ws = new WebSocket(WS_URL);
  const id = setInterval(() => ws.send('ping'), 30000);
  return () => {
    clearInterval(id);
    ws.close();
  };
}, []);
```

**Find it:** Chrome DevTools → Memory → detached DOM nodes; Performance monitor → listener count.

**Strong close:** "Every subscription needs cleanup in effect return — WS, intervals, listeners."

## === vs Object.is — cache keys?

```javascript
const cache = new Map();
cache.set(NaN, 'value');
cache.get(NaN);        // works — Map uses SameValueZero
Object.is(NaN, NaN);   // true
Object.is(-0, +0);     // false — === treats them equal
```

**Scenario:** Financial dedup cache uses `===` — `-0` and `+0` collapse incorrectly in edge cases.

**Strong close:** "Know SameValueZero vs `Object.is` when keys are numeric or `NaN`."

## Prototype pollution via merge?

**Context:** Deep merge utility copies attacker-controlled JSON into target object:

```javascript
function merge(target, source) {
  for (const key in source) target[key] = source[key];
}
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
// Can pollute Object.prototype — naive auth checks break
```

**Fix:** Block `__proto__`, `constructor`, `prototype` keys; `Object.create(null)` for maps; use vetted libraries.

**Strong close:** "Never recursively merge untrusted objects without key blocklist."

## Service Worker caches index.html forever?

**Context:** `cache-first` strategy caches `index.html`. Deploy new API contract; users run **old JS** for days — mysterious 404s on new endpoints.

**Fix:** Version cache name (`app-v3`); **network-first for `index.html`**; `skipWaiting` + `clients.claim` on activate; Workbox `navigateFallback` with care.

**Strong close:** "HTML shell is the update channel — don't cache-first the entry point."

## postMessage without origin check?

```javascript
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://trusted-parent.com') return;
  processPayment(e.data);
});
```

**Without check:** Any iframe or opener can send fake `{ paid: true }`.

**Strong close:** "Always validate `event.origin` and message shape — `postMessage` is public API."

## Debounced search fires 100 times on mount?

**Context:**

```tsx
useEffect(() => {
  debouncedSearch(query);  // new debounce fn every render — never cancels prior
}, [query]);
```

**Fix:** Stable debounce via `useMemo`/`useCallback`, or `useEffect` cleanup calling `debounce.cancel()`.

**Strong close:** "Debounce instance must be stable across renders — or cancel on cleanup."

## Related Topics

- Interview Scenarios/Microservices Interview Scenarios.md
- Javascript/JavaScript Asynchronous Programming.md
- React/React HTTP and Data Fetching.md
- Security/Web Application Security.md
