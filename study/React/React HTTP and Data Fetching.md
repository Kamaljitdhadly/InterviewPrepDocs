# React HTTP and Data Fetching

## Questions Covered

1. How do you fetch data with fetch in useEffect?
2. How do you use axios in React?
3. What are the basics of TanStack Query (React Query)?
4. What is the loading/error states pattern?
5. How do you cancel requests with AbortController?

## How do you fetch data with fetch in useEffect?

Load data in `useEffect` with an inner async function or `.then()`. Track `loading`/`error`/`data` in state; check `response.ok` (fetch doesn't reject on 4xx/5xx); include dependencies; clean up on unmount.

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

Axios provides interceptors, auto JSON parsing, and rejects on HTTP errors by default. Create an instance with `baseURL`; call in `useEffect` or handlers; pass `signal` for cancellation.

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

TanStack Query manages server state — caching, refetch, deduplication, mutations. `useQuery` reads; `useMutation` writes; `queryKey` identifies cache entries. Wrap app in `QueryClientProvider`.

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

## What is the loading/error states pattern?

Model async UI as explicit states: loading, success, error (and empty). Use early returns, a status enum, or library flags (`isLoading`, `isError`). Avoid showing stale data and spinners unintentionally.

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

## How do you cancel requests with AbortController?

Pass `controller.signal` to `fetch`; call `controller.abort()` in effect cleanup on unmount or dependency change. Ignore `AbortError` in catch — prevents race conditions and setState-after-unmount.

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

Axios v1+ accepts `signal`; TanStack Query cancels in-flight queries when keys change if `queryFn` passes the query `signal`.
