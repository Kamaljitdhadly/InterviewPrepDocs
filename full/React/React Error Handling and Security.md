# React Error Handling and Security

## Questions Covered

1. How and where should you use error boundaries in a React application?
2. What are the limits of try/catch in React?
3. What are XSS risks in React, and when is `dangerouslySetInnerHTML` dangerous?
4. How should you sanitize user input in a React app?
5. How do environment variables and secrets work in React, and what are common mistakes?
6. What CSRF considerations apply to single-page applications?
7. What are secure patterns for storing authentication tokens in SPAs?

## How and where should you use error boundaries in a React application?

**Error boundaries** isolate failures so one broken subtree does not crash the entire application. They catch render-time errors in children and show fallback UI while logging diagnostics.

### Strategic Placement

```jsx
function App() {
  return (
    <RootErrorBoundary>
      <Header />
      <MainErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes />
        </Suspense>
      </MainErrorBoundary>
      <Footer />
    </RootErrorBoundary>
  );
}
```

### Granular Boundaries

| Location | Purpose |
|----------|---------|
| Root | Last-resort catch; show generic error page |
| Route / page level | One broken page does not break navigation |
| Widget / third-party | Isolate ads, charts, or embeds |
| Lazy-loaded chunks | Pair with `React.lazy` + `Suspense` |

### Boundary with Recovery

```jsx
class RouteErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    reportError({ error, stack: info.componentStack, route: window.location.pathname });
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert">
          <p>This page failed to load.</p>
          <button onClick={this.handleRetry}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Best Practices

- Log errors to a monitoring service (Sentry, Datadog) in `componentDidCatch`.
- Provide actionable fallback UI with retry or navigation options.
- Do not wrap every single component — balance isolation with complexity.
- Combine with route-level code splitting so failures are scoped to loaded chunks.

## What are the limits of try/catch in React?

`try/catch` handles **synchronous** errors in the code path where it is written. React's rendering model introduces limits that error boundaries address instead.

### What try/catch CAN Handle

```jsx
function handleSubmit() {
  try {
    const result = parseFormData(formRef.current);
    submitOrder(result);
  } catch (error) {
    setFormError(error.message);
  }
}

async function handleFetch() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Request failed');
    setData(await res.json());
  } catch (error) {
    setFetchError(error.message);
  }
}
```

### What try/catch CANNOT Handle

1. **Errors during render** — throwing in a component body bypasses surrounding try/catch in parent components.

```jsx
function Parent() {
  try {
    return <Child />; // if Child throws during render, Parent's try/catch won't catch it
  } catch (e) {
    return <Fallback />; // never reached
  }
}
```

2. **Errors in child components** — only an error boundary above the throwing component catches render errors.

3. **Errors in event handlers** — unless you wrap the handler body itself (as shown above).

4. **Errors in useEffect / async callbacks** — must catch inside the effect or promise chain.

```jsx
useEffect(() => {
  let cancelled = false;
  fetchData()
    .then(setData)
    .catch((err) => {
      if (!cancelled) setError(err);
    });
  return () => { cancelled = true; };
}, []);
```

5. **Errors in Server Components** — handled by framework error files (`error.jsx` in Next.js), not client try/catch.

**Rule of thumb:** use **error boundaries** for render tree failures; use **try/catch** inside event handlers, async functions, and effects.

## What are XSS risks in React, and when is `dangerouslySetInnerHTML` dangerous?

**Cross-Site Scripting (XSS)** injects malicious scripts into pages viewed by other users. React escapes text in JSX by default, which prevents most injection through `{variable}` interpolation.

### React's Default Protection

```jsx
// Safe — React escapes the string
const userInput = '<img src=x onerror=alert(1)>';
return <div>{userInput}</div>; // rendered as text, not HTML
```

### dangerouslySetInnerHTML — The Risk

When you opt out of escaping, any HTML — including `<script>` tags and event handlers — can execute:

```jsx
// DANGEROUS — never do this with untrusted input
function Comment({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

An attacker submitting `<img src=x onerror="steal(document.cookie)">` would execute JavaScript in victims' browsers.

### Safer Usage with Sanitization

```jsx
import DOMPurify from 'dompurify';

function SafeHtml({ html }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p'],
    ALLOWED_ATTR: ['href'],
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Other XSS Vectors in React Apps

- **`href` with `javascript:` URLs** — validate URLs before rendering `<a href={userUrl}>`.
- **Rendering raw HTML from APIs** — treat all external HTML as untrusted.
- **Third-party scripts** — supply chain attacks via compromised npm packages.
- **`eval`, `new Function`, `innerHTML` in refs** — bypass React's protections entirely.

React reduces XSS risk but does not eliminate it when you render raw HTML or pass untrusted data to the DOM imperatively.

## How should you sanitize user input in a React app?

Sanitization belongs at **every layer** where untrusted data enters or is rendered. React handles output encoding in JSX; you must handle HTML rendering, URL construction, and server-side validation separately.

### Client-Side HTML Sanitization

```jsx
import DOMPurify from 'dompurify';

function RichTextPreview({ content }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### URL Sanitization

```jsx
function SafeLink({ href, children }) {
  const isSafe =
    href.startsWith('https://') ||
    href.startsWith('http://') ||
    href.startsWith('/');

  if (!isSafe) return <span>{children}</span>;
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children}
    </a>
  );
}
```

### Input Validation Before Submission

```jsx
import { z } from 'zod';

const commentSchema = z.object({
  body: z.string().min(1).max(500),
  email: z.string().email(),
});

function submitComment(raw) {
  const parsed = commentSchema.parse(raw);
  return api.post('/comments', parsed);
}
```

### Defense in Depth

| Layer | Action |
|-------|--------|
| Input | Validate format, length, allowed characters |
| Storage | Encode/sanitize before persisting rich text |
| Output | Escape in JSX; sanitize before `dangerouslySetInnerHTML` |
| Server | Re-validate and sanitize — never trust the client |
| CSP | Content-Security-Policy headers block inline script execution |

**Interview point:** client-side sanitization improves UX but is not security — attackers can bypass the browser. Always enforce rules on the server.

## How do environment variables and secrets work in React, and what are common mistakes?

In bundled React apps (CRA, Vite), **environment variables are embedded at build time** into the JavaScript sent to every user. Anything prefixed for exposure (e.g., `REACT_APP_`, `VITE_`) is **public**.

### Correct Usage — Public Config Only

```js
// .env
VITE_API_BASE_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-12345

// src/api.js
const baseUrl = import.meta.env.VITE_API_BASE_URL;
```

```jsx
// Create React App
const apiUrl = process.env.REACT_APP_API_URL;
```

### Common Mistakes

```js
// WRONG — this secret is visible in the browser bundle
VITE_STRIPE_SECRET_KEY=sk_live_abc123
REACT_APP_DATABASE_PASSWORD=supersecret
```

Anyone can open DevTools → Sources and read bundled env values.

### Where Secrets Belong

```jsx
// Client calls YOUR backend; backend holds the secret
async function createPayment(amount) {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}
```

```js
// server/api/payments.js — secret stays on server
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

### Next.js Server vs Client

- `NEXT_PUBLIC_*` — exposed to browser.
- Variables without the prefix — server-only (API routes, Server Components).

### Checklist

- Never commit `.env` files with secrets to git.
- Use `.env.example` with placeholder values for documentation.
- Rotate keys immediately if accidentally exposed.
- Use a secrets manager (AWS Secrets Manager, Vault) in production backends.

## What CSRF considerations apply to single-page applications?

**Cross-Site Request Forgery (CSRF)** tricks a logged-in user's browser into making unwanted requests to a site where they are authenticated. SPAs using token-based auth and CORS have different exposure than classic cookie-session apps.

### Cookie-Based Auth — Higher CSRF Risk

If the API uses session cookies that browsers send automatically, a malicious site can trigger state-changing requests:

```html
<!-- evil.com -->
<form action="https://bank.com/api/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="10000" />
</form>
<script>document.forms[0].submit();</script>
```

**Mitigations:**

- **SameSite cookies** — `SameSite=Strict` or `Lax` limits cross-site cookie sending.
- **CSRF tokens** — server issues a token; client sends it in a header on mutations.
- **Custom headers** — `X-Requested-With` or `X-CSRF-Token`; simple cross-origin forms cannot set arbitrary headers (CORS preflight blocks them).

```jsx
async function apiPost(url, body) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
  return fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(body),
  });
}
```

### Bearer Token in Memory / Header — Lower CSRF Risk

SPAs storing JWTs in memory and sending `Authorization: Bearer <token>` are less vulnerable to classic CSRF because attackers cannot read the token from another origin (same-origin policy). They face **XSS** risk instead — if script runs on your origin, it can steal the token.

### CORS Is Not CSRF Protection

CORS prevents **reading** cross-origin responses; it does not stop the browser from **sending** requests with cookies. Do not rely on CORS alone for CSRF defense.

### SPA Checklist

- Use `SameSite` cookies if relying on cookie auth.
- Require CSRF tokens or custom headers for state-changing cookie-authenticated endpoints.
- Prefer short-lived access tokens with refresh rotation.
- Validate `Origin` / `Referer` headers on the server for sensitive operations.

## What are secure patterns for storing authentication tokens in SPAs?

Token storage trades off **security** (XSS resistance) against **persistence** (surviving page refresh) and **SSR compatibility**.

### Storage Options Compared

| Storage | XSS risk | Survives refresh | CSRF risk |
|---------|----------|------------------|-----------|
| localStorage | High — any script can read | Yes | Low |
| sessionStorage | High | Per tab | Low |
| Memory (variable) | Lower — cleared on close | No | Low |
| HttpOnly cookie | Not accessible to JS | Yes | Higher (mitigate with SameSite + CSRF) |

### Anti-Pattern: localStorage for JWT

```jsx
// Avoid for sensitive tokens — vulnerable to any XSS
localStorage.setItem('token', accessToken);
const token = localStorage.getItem('token');
```

Any injected script can exfiltrate the token.

### Recommended: HttpOnly Secure Cookies (BFF Pattern)

Store refresh tokens in **HttpOnly, Secure, SameSite** cookies. The browser sends them automatically; JavaScript cannot read them.

```js
// Backend sets cookie
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/api/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

```jsx
// Client — access token in memory, refresh via cookie
let accessToken = null;

async function refreshAccessToken() {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  const { accessToken: newToken } = await res.json();
  accessToken = newToken;
  return newToken;
}
```

### In-Memory Access Token with Silent Refresh

```jsx
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const accessTokenRef = useRef(null);

  const login = async (credentials) => {
    const { accessToken } = await api.login(credentials);
    accessTokenRef.current = accessToken;
  };

  const getToken = () => accessTokenRef.current;

  const logout = async () => {
    accessTokenRef.current = null;
    await api.logout();
  };

  return (
    <AuthContext.Provider value={{ login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Additional Practices

- **Short-lived access tokens** (5–15 minutes) limit damage from theft.
- **Refresh token rotation** — invalidate old refresh tokens on each use.
- **PKCE** for OAuth authorization code flow in public clients.
- **Never store tokens in URL query params** — they leak via logs, history, and Referer headers.

**Interview summary:** prefer HttpOnly cookies for refresh tokens with a backend-for-frontend layer; keep access tokens in memory; treat XSS prevention as the primary front-end security goal when tokens are JS-accessible.
