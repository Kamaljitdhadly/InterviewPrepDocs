# React HTTP and Data Fetching

## Questions Covered

1. How do you fetch data with fetch in useEffect?
2. How do you use axios in React?
3. What are the basics of TanStack Query (React Query)?
4. What is the loading/error states pattern?
5. How do you cancel requests with AbortController?

## How do you fetch data with fetch in useEffect?

The standard pattern loads data after mount (or when dependencies change) inside `useEffect`. Use async logic inside the effect (either an inner async function or `.then()` chains), track loading/error/data in state, and clean up to avoid setting state after unmount.

**Interview points:**

- `fetch` does not reject on HTTP 4xx/5xx — check `response.ok`.
- Include dependency array values that the fetch uses (e.g. `userId`).
- Return a cleanup function for abort or ignore stale responses.

```jsx
import { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) setUser(data);
      } catch (err) {
        if (err.name !== 'AbortError' && !cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">Error: {error}</p>;
  return <h1>{user?.name}</h1>;
}
```

## How do you use axios in React?

Axios is a promise-based HTTP client with interceptors, automatic JSON transforms, and request cancellation via `AbortController` (v1+) or legacy `CancelToken`.

**Typical setup:** create an axios instance with base URL and shared headers; call it inside `useEffect` or event handlers; handle errors in `catch` (axios rejects on 4xx/5xx by default).

```jsx
import axios from 'axios';
import { useEffect, useState } from 'react';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function PostList() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get('/posts', { signal: controller.signal })
      .then((res) => setPosts(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) setError(err.message);
      });

    return () => controller.abort();
  }, []);

  if (error) return <p>{error}</p>;
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## What are the basics of TanStack Query (React Query)?

TanStack Query manages server state: caching, background refetch, deduplication, pagination, and mutations. It removes boilerplate `useEffect` fetch logic and provides `isLoading`, `isError`, `data`, and `refetch` out of the box.

**Core concepts:**

- **Query** — read server data (`useQuery`).
- **Mutation** — write server data (`useMutation`).
- **Query key** — unique cache identifier (array).
- **Stale time / gcTime** — control freshness and garbage collection.

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function Todos() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then((r) => r.json()),
    staleTime: 60_000,
  });

  const createTodo = useMutation({
    mutationFn: (title) =>
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      }).then((r) => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>{error.message}</p>;

  return (
    <div>
      <ul>
        {data.map((todo) => (
          <li key={todo.id}>{todo.title}</li>
        ))}
      </ul>
      <button onClick={() => createTodo.mutate('New task')}>Add</button>
    </div>
  );
}
```

Wrap the app in `QueryClientProvider` with a `QueryClient` instance.

## What is the loading/error states pattern?

Async UI should represent three (or four) explicit states: **idle/loading**, **success**, **error**, and optionally **empty**. Render mutually exclusive UI for each — avoid showing stale data alongside a spinner without intent.

**Patterns:**

- Separate booleans: `loading`, `error`, `data`.
- Status enum: `'idle' | 'loading' | 'success' | 'error'`.
- Early returns or a small `switch` on status.
- Skeleton screens instead of spinners for layout stability.

```jsx
import { useEffect, useState } from 'react';

const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

function ProductList() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus(STATUS.LOADING);

    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setStatus(STATUS.SUCCESS);
      })
      .catch((err) => {
        setError(err.message);
        setStatus(STATUS.ERROR);
      });
  }, []);

  switch (status) {
    case STATUS.LOADING:
      return <p aria-busy="true">Loading products...</p>;
    case STATUS.ERROR:
      return (
        <div role="alert">
          <p>Something went wrong: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      );
    case STATUS.SUCCESS:
      if (products.length === 0) return <p>No products found.</p>;
      return (
        <ul>
          {products.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
```

Libraries like TanStack Query encode these states in `isLoading`, `isFetching`, `isError`, and `isSuccess`.

## How do you cancel requests with AbortController?

`AbortController` lets you abort one or more `fetch` requests. Pass `signal` to `fetch`; call `controller.abort()` in the `useEffect` cleanup when the component unmounts or dependencies change. Aborted fetches throw an `AbortError` — ignore it in `catch`.

**Why it matters:** prevents race conditions (slow request overwriting newer data) and memory leaks from `setState` on unmounted components.

```jsx
import { useEffect, useState } from 'react';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [query]);

  return (
    <div>
      {loading && <p>Searching...</p>}
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}
```

Axios v1+ accepts the same `signal` option. TanStack Query automatically cancels in-flight queries when the query key changes or the component unmounts (when using `fetch` with signal in `queryFn`).
