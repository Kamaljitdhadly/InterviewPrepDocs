# JavaScript Interview Scenarios

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

## How do you implement secure JWT logout in the browser?

**Scenario:** User clicks Logout; you `localStorage.removeItem('token')`. Attacker already exfiltrated token via XSS.

**90% miss:** Client logout is UX only. Real controls:

| Layer | Control |
|-------|---------|
| **Storage** | httpOnly Secure SameSite cookie for refresh token (not localStorage) |
| **XSS** | CSP, sanitize HTML, no inline scripts |
| **Server** | Revoke refresh token family |
| **Access TTL** | Short (5–15 min) |

```typescript
// Anti-pattern
localStorage.setItem('access_token', token);

// Better — refresh in httpOnly cookie (set by server)
// Access in memory only (variable, not storage)
let accessToken: string | null = null;

export async function logout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  accessToken = null;
  router.navigate('/login');
}
```

**CSRF on cookie:** Use SameSite=Strict/Lax + anti-forgery on state-changing endpoints.

## useEffect runs twice in React 18 Strict Mode — payment API charged twice. Why and fix?

**Scenario:** Dev sees double POST `/checkout` — "React is broken."

**Cause:** Strict Mode **double-invokes** effects in dev to surface missing cleanup.

```tsx
// Bug — no idempotency
useEffect(() => {
  chargeCard(orderId);
}, [orderId]);

// Fix 1 — idempotency key on server
// Fix 2 — guard with ref (dev only band-aid)
const charged = useRef(false);
useEffect(() => {
  if (charged.current) return;
  charged.current = true;
  chargeCard(orderId);
}, [orderId]);

// Fix 3 — user action triggers charge, not effect
```

**Production:** Server must accept same `Idempotency-Key` twice without double charge — client fixes are not enough.

## Closure in a loop — five buttons all alert "5". Production variant?

**Classic:**

```javascript
for (var i = 0; i < 5; i++) {
  buttons[i].onclick = () => alert(i);  // all print 5
}
```

**Production variant:** `setInterval`/`setTimeout` in batch job processing shares loop variable — processes wrong tenant id.

**Fix:** `let i`, IIFE, or `forEach` with parameter.

## Promise.all on four payment gateways — one fails. Money captured twice?

**Scenario:** Try Stripe, Adyen, PayPal in parallel with `Promise.all` — two succeed before first fails.

```typescript
// Dangerous
await Promise.all(providers.map(p => p.charge(amount)));

// Safer — sequential fallback
for (const provider of providers) {
  try {
    return await provider.charge(amount);
  } catch { continue; }
}

// Or Promise.any (first success) with explicit void on losers
```

**Interview:** Discuss **saga**, **idempotency**, **reconciliation** jobs for partial failure.

## Event loop: setTimeout(0) vs Promise — order matters for bug?

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 1, 4, 3, 2 — microtasks before macrotasks
```

**Bug scenario:** `history.replaceState` in promise microtask vs `setTimeout` navigation — analytics misses page view.

## fetch returns 401 — ten parallel requests, one refresh?

**Scenario:** Token expired; ten API calls get 401; ten refresh calls race; refresh token invalidated.

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

Queue failed requests and retry after refresh completes.

## Memory leak: WebSocket + interval after route change?

**Scenario:** React component opens WS, never closes on unmount; heap grows on SPA navigation.

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

Chrome DevTools → Memory → Detached nodes / Event listeners count.

## === vs Object.is — cache key with NaN or -0?

```javascript
const cache = new Map();
cache.set(NaN, 'value');
cache.get(NaN);           // works Map uses SameValueZero
Object.is(NaN, NaN);    // true
Object.is(-0, +0);      // false — === treats as equal
```

Financial rounding `-0` vs `+0` keys — edge case in dedup caches.

## Prototype pollution via merge?

```javascript
function merge(target, source) {
  for (const key in source) target[key] = source[key];
}
merge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
// Can pollute Object.prototype — auth bypass in naive code
```

**Fix:** `Object.create(null)` for maps, validate keys, use `structuredClone`, libraries patched for CVEs.

## Service Worker caches index.html forever — users on old JS?

**Scenario:** `cache-first` for all assets; deploy new API contract; old JS calls wrong endpoints.

**Fix:** `skipWaiting` + `clients.claim`, version cache name, **network-first for index.html**, `navigateFallback` in Workbox.

## postMessage without origin check?

```javascript
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://trusted-parent.com') return;
  processPayment(e.data);
});
```

Missing check → malicious iframe sends fake "paid" message.

## Debounced search fires on mount 100 times?

**Scenario:** `useEffect(() => debouncedSearch(query), [query])` — debounce recreated every render; never cancels.

**Fix:** stable debounce with `useMemo`/`useCallback`, or `useEffect` cleanup calling `debounce.cancel()`.

## Related Topics

- Interview Scenarios/Microservices Interview Scenarios.md
- Javascript/JavaScript Asynchronous Programming.md
- React/React HTTP and Data Fetching.md
- Security/Web Application Security.md
