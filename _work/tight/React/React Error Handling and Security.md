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

Place **error boundaries** at root (last resort), route/page level (isolate broken pages), widget level (third-party embeds), and lazy-loaded chunks (with Suspense). Log in `componentDidCatch`, provide retry/navigation fallback, and don't over-wrap every component.

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

## What are the limits of try/catch in React?

`try/catch` handles **synchronous** errors in its own code path (event handlers, async functions). It cannot catch **render errors** in children — only error boundaries can. Effect/promise errors need `.catch` inside the effect. Rule: boundaries for render tree; try/catch for handlers and async.

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

```jsx
function Parent() {
  try {
    return <Child />; // if Child throws during render, Parent's try/catch won't catch it
  } catch (e) {
    return <Fallback />; // never reached
  }
}
```

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

## What are XSS risks in React, and when is `dangerouslySetInnerHTML` dangerous?

React escapes JSX interpolation by default. **`dangerouslySetInnerHTML`** opts out — untrusted HTML can execute scripts. Other vectors: `javascript:` URLs in `href`, raw API HTML, `eval`/`innerHTML` in refs. Sanitize with DOMPurify before rendering raw HTML.

```jsx
// Safe — React escapes the string
const userInput = '<img src=x onerror=alert(1)>';
return <div>{userInput}</div>; // rendered as text, not HTML
```

```jsx
// DANGEROUS — never do this with untrusted input
function Comment({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

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

## How should you sanitize user input in a React app?

Sanitize at every trust boundary: validate on input, re-validate on server, escape in JSX, sanitize before `dangerouslySetInnerHTML`, validate URLs, use CSP headers. Client sanitization is UX — server enforcement is security.

```jsx
import DOMPurify from 'dompurify';

function RichTextPreview({ content }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

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

## How do environment variables and secrets work in React, and what are common mistakes?

Bundled React apps embed `REACT_APP_*` / `VITE_*` / `NEXT_PUBLIC_*` vars at **build time** — they are public in the JS bundle. Never put API secrets, DB passwords, or Stripe secret keys in client env vars. Secrets belong on the server; the client calls your backend.

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

```js
// WRONG — this secret is visible in the browser bundle
VITE_STRIPE_SECRET_KEY=sk_live_abc123
REACT_APP_DATABASE_PASSWORD=supersecret
```

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

## What CSRF considerations apply to single-page applications?

**Cookie-based auth** is CSRF-vulnerable — browsers send cookies automatically. Mitigate with `SameSite` cookies, CSRF tokens in headers, and custom headers (blocked by CORS preflight on simple cross-origin forms). **Bearer tokens in memory** have lower CSRF risk but higher XSS risk. CORS prevents reading responses, not sending requests — don't rely on CORS alone.

```html
<!-- evil.com -->
<form action="https://bank.com/api/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="10000" />
</form>
<script>document.forms[0].submit();</script>
```

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

## What are secure patterns for storing authentication tokens in SPAs?

| Storage | XSS risk | Survives refresh | CSRF risk |
|---------|----------|------------------|-----------|
| localStorage | High | Yes | Low |
| Memory | Lower | No | Low |
| HttpOnly cookie | Not JS-accessible | Yes | Higher (mitigate) |

Avoid localStorage for JWTs. Prefer **HttpOnly Secure SameSite cookies** for refresh tokens (BFF pattern) and **in-memory access tokens** with short TTL and refresh rotation. Use PKCE for OAuth; never put tokens in URL query params.

```jsx
// Avoid for sensitive tokens — vulnerable to any XSS
localStorage.setItem('token', accessToken);
const token = localStorage.getItem('token');
```

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
