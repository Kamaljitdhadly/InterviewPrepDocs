# React Hooks

## Questions Covered

1. What are React Hooks and why were they introduced?
2. Explain the useState hook
3. Explain the useEffect hook and its cleanup function
4. What are the Rules of Hooks?
5. Explain the useContext hook
6. Explain the useReducer hook
7. When should you use useState vs useReducer?
8. Explain the useRef hook
9. Explain useMemo and when to use it
10. Explain useCallback and when to use it
11. What is the difference between useMemo and useCallback?
12. How do you create custom hooks?

## What are React Hooks and why were they introduced?

**React Hooks** are functions that let you "hook into" React features — state, lifecycle, context, refs, and more — from **function components**. Before Hooks (React 16.8), those capabilities lived almost exclusively in **class components** (`this.state`, `componentDidMount`, etc.). Hooks brought the same power to functions with a simpler mental model and better composition.

### Why Hooks were introduced

| Problem with classes | How Hooks address it |
|---|---|
| Hard to reuse stateful logic (HOCs, render props) | Extract logic into **custom hooks** |
| Complex components mix unrelated lifecycle code | Split effects by concern with multiple `useEffect` calls |
| `this` binding confusion | No `this`; closures capture values directly |
| Wrapper hell from patterns like HOCs | Flat component trees; share logic via hooks |

Hooks do **not** replace React — they are the recommended way to write new components. Class components still work but are legacy for most new code.

### Class vs function component (before and after Hooks)

```jsx
// Before Hooks — state in a class
class Counter extends React.Component {
  state = { count: 0 };

  increment = () => this.setState({ count: this.state.count + 1 });

  render() {
    return (
      <button onClick={this.increment}>
        Count: {this.state.count}
      </button>
    );
  }
}
```

```jsx
// After Hooks — same behavior in a function
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### Built-in hooks at a glance

| Hook | Purpose |
|---|---|
| `useState` | Local component state |
| `useEffect` | Side effects (fetch, subscriptions, DOM sync) |
| `useContext` | Read context without a Consumer wrapper |
| `useReducer` | Complex state transitions |
| `useRef` | Mutable ref (DOM node or any value) |
| `useMemo` | Memoize a computed value |
| `useCallback` | Memoize a function reference |
| `useLayoutEffect` | Like `useEffect`, runs before paint |
| `useId` | Stable unique IDs (SSR-safe) |

## Explain the useState hook

`useState` is the most fundamental Hook. It returns a **state value** and a **setter function**. Calling the setter schedules a re-render with the new state.

### Syntax and behavior

```jsx
const [state, setState] = useState(initialValue);
```

- **Initial value** — used only on the **first render** (lazy init supported via a function).
- **Setter** — merges are **not** automatic for objects; spread previous state when updating objects.
- Updates are **asynchronous** and may be **batched** in event handlers.

### Basic counter

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  );
}
```

### Functional updates (when next state depends on previous)

When the new state depends on the previous value — especially inside closures, intervals, or rapid clicks — pass an **updater function**:

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  const incrementTwice = () => {
    // Wrong if batched: setCount(count + 1); setCount(count + 1);
    setCount((prev) => prev + 1);
    setCount((prev) => prev + 1);
  };

  return <button onClick={incrementTwice}>{count}</button>;
}
```

### Object state

```jsx
function ProfileForm() {
  const [user, setUser] = useState({ name: '', email: '' });

  const updateField = (field, value) => {
    setUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <input
        value={user.name}
        onChange={(e) => updateField('name', e.target.value)}
      />
      <input
        value={user.email}
        onChange={(e) => updateField('email', e.target.value)}
      />
    </>
  );
}
```

### Lazy initial state

Pass a function when computing the initial value is expensive:

```jsx
const [items, setItems] = useState(() => {
  const stored = localStorage.getItem('items');
  return stored ? JSON.parse(stored) : [];
});
```

## Explain the useEffect hook and its cleanup function

`useEffect` runs **side effects** after React paints the DOM. It replaces class lifecycle methods like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount` with a single, declarative API.

### Signature

```jsx
useEffect(() => {
  // effect body
  return () => {
    // optional cleanup
  };
}, [dependencies]);
```

| Dependency array | When effect runs |
|---|---|
| Omitted | After **every** render |
| `[]` | Once after **mount** |
| `[a, b]` | After mount and when `a` or `b` change |

### Fetching data on mount

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (!cancelled) {
        setUser(data);
        setLoading(false);
      }
    }

    loadUser();

    return () => {
      cancelled = true; // ignore stale responses if userId changes
    };
  }, [userId]);

  if (loading) return <p>Loading...</p>;
  return <h1>{user?.name}</h1>;
}
```

### Cleanup: subscriptions and timers

Cleanup runs **before** the effect re-runs and **on unmount**. Use it to unsubscribe, clear timers, or remove listeners.

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    return () => {
      connection.disconnect(); // cleanup on roomId change or unmount
    };
  }, [roomId]);

  return <div>Chat: {roomId}</div>;
}
```

```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return <p>Elapsed: {seconds}s</p>;
}
```

### Document title sync

```jsx
function Page({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <h1>{title}</h1>;
}
```

**Interview tip:** `useLayoutEffect` runs synchronously after DOM mutations but **before** the browser paints — use it when you must measure DOM or avoid visual flicker.

## What are the Rules of Hooks?

Hooks rely on a **stable call order** on every render. React tracks which state belongs to which Hook by position. Breaking the rules causes bugs like state mismatches or crashes.

### Rule 1 — Only call Hooks at the top level

Do **not** call Hooks inside loops, conditions, or nested functions.

```jsx
// WRONG — conditional hook
function Bad({ show }) {
  if (show) {
    const [value, setValue] = useState(0); // violates Rules of Hooks
  }
  return null;
}
```

```jsx
// CORRECT — hook always runs; branch inside
function Good({ show }) {
  const [value, setValue] = useState(0);

  if (!show) return null;
  return <button onClick={() => setValue(value + 1)}>{value}</button>;
}
```

### Rule 2 — Only call Hooks from React functions

Call Hooks from:

- React **function components**
- Custom **hooks** (functions whose names start with `use`)

Do **not** call them from regular JavaScript functions, class components, or event handlers.

```jsx
// WRONG — hook inside a plain helper
function saveData() {
  const [data, setData] = useState(null); // not a component or custom hook
}
```

```jsx
// CORRECT — custom hook
function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

function App() {
  useDocumentTitle('My App');
  return <main>...</main>;
}
```

### ESLint enforcement

The `eslint-plugin-react-hooks` package enforces these rules via `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps`.

## Explain the useContext hook

`useContext` reads the **nearest** value from a React Context Provider above the component. It avoids prop drilling and replaces the older `Context.Consumer` render-prop pattern.

### Creating and providing context

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Consuming with useContext

```jsx
function ThemedButton() {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <button
      className={theme}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Toggle theme ({theme})
    </button>
  );
}
```

### App wiring

```jsx
function App() {
  return (
    <ThemeProvider>
      <ThemedButton />
    </ThemeProvider>
  );
}
```

**Note:** When the Provider `value` changes, **all** consumers re-render. Split contexts (e.g., `ThemeContext` vs `AuthContext`) or memoize the value object to limit unnecessary renders.

```jsx
const value = useMemo(() => ({ theme, setTheme }), [theme]);
return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
```

## Explain the useReducer hook

`useReducer` manages state with a **reducer function** `(state, action) => newState`, similar to Redux. It is ideal when state transitions are complex or depend on the previous state in structured ways.

### Syntax

```jsx
const [state, dispatch] = useReducer(reducer, initialState, init?);
```

### Todo list example

```jsx
import { useReducer } from 'react';

const initialState = { items: [], filter: 'all' };

function todoReducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, items: [...state.items, action.payload] };
    case 'toggle':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload
            ? { ...item, done: !item.done }
            : item
        ),
      };
    case 'set_filter':
      return { ...state, filter: action.payload };
    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(todoReducer, initialState);

  return (
    <div>
      <button onClick={() => dispatch({ type: 'add', payload: { id: Date.now(), done: false } })}>
        Add todo
      </button>
      <ul>
        {state.items.map((item) => (
          <li key={item.id} onClick={() => dispatch({ type: 'toggle', payload: item.id })}>
            {item.done ? '✓' : '○'} Todo {item.id}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Lazy initialization

```jsx
function init(initialCount) {
  return { count: initialCount };
}

function counterReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter({ start }) {
  const [state, dispatch] = useReducer(counterReducer, start, init);
  return (
    <>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

## When should you use useState vs useReducer?

Both store local state. Choose based on **complexity** and **update patterns**.

| Factor | Prefer `useState` | Prefer `useReducer` |
|---|---|---|
| State shape | Single value or simple object | Nested or multi-field state |
| Updates | Independent field updates | Many related transitions |
| Logic location | Inline in event handlers | Centralized in reducer |
| Next state | Often replaces or shallow-updates | Depends on previous state + action type |
| Testing | Trivial | Reducer is a pure function — easy to unit test |
| Multiple actions | Few setters | Many action types |

### useState — simple, independent fields

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) setError('Email required');
    // ...
  };

  return (/* form */);
}
```

### useReducer — coordinated transitions

```jsx
function formReducer(state, action) {
  switch (action.type) {
    case 'field_change':
      return { ...state, [action.field]: action.value, error: '' };
    case 'submit_start':
      return { ...state, loading: true, error: '' };
    case 'submit_success':
      return { ...state, loading: false, submitted: true };
    case 'submit_error':
      return { ...state, loading: false, error: action.message };
    default:
      return state;
  }
}
```

**Rule of thumb:** start with `useState`; move to `useReducer` when you have multiple interdependent fields, a state machine, or the same update logic duplicated in several places.

## Explain the useRef hook

`useRef` returns a **mutable object** `{ current: value }` that persists for the full lifetime of the component. Updating `ref.current` does **not** trigger a re-render.

### Two common uses

1. **DOM references** — focus, measure, integrate with non-React libraries
2. **Mutable instance variables** — store previous values, timers IDs, or any value that should survive renders without causing them

### DOM ref — focus input

```jsx
import { useRef } from 'react';

function SearchBox() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} type="search" placeholder="Search..." />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
```

### Mutable value — previous prop tracking

```jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

function PriceDisplay({ price }) {
  const prevPrice = usePrevious(price);
  const direction = price > prevPrice ? 'up' : 'down';

  return (
    <p>
      ${price} {prevPrice != null && <span>({direction})</span>}
    </p>
  );
}
```

### Storing interval ID without re-renders

```jsx
function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsed((t) => t + 1);
    }, 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  return (
    <>
      <p>{elapsed}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

**vs state:** use `useRef` when you need a box that survives renders but changes should not repaint the UI.

## Explain useMemo and when to use it

`useMemo` **memoizes the result** of an expensive calculation between renders. It recomputes only when dependencies change.

```jsx
const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);
```

### Filtering a large list

```jsx
import { useMemo, useState } from 'react';

function ProductList({ products }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>
        {filtered.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </>
  );
}
```

### Referential stability for context / effects

```jsx
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### When to use `useMemo`

| Use it when | Skip it when |
|---|---|
| Computation is measurably expensive | Calculation is cheap |
| You need stable **object/array** reference for child memoization | Premature optimization |
| Dependencies are well-defined | You are unsure — profile first |

**Interview tip:** `useMemo` is not a semantic guarantee — React may discard the cache. Do not use it for correctness, only performance.

## Explain useCallback and when to use it

`useCallback` **memoizes a function** so its reference stays the same between renders unless dependencies change.

```jsx
const memoizedFn = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

It is equivalent to `useMemo(() => fn, deps)` but reads more clearly for functions.

### Preventing child re-renders with `React.memo`

```jsx
import { useState, useCallback, memo } from 'react';

const ExpensiveChild = memo(function ExpensiveChild({ onClick, label }) {
  console.log('render', label);
  return <button onClick={onClick}>{label}</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [other, setOther] = useState(0);

  // Without useCallback, handleClick is new every render → child re-renders
  const handleClick = useCallback(() => {
    setCount((c) => c + 1);
  }, []);

  return (
    <>
      <ExpensiveChild onClick={handleClick} label="Increment" />
      <button onClick={() => setOther(other + 1)}>Other: {other}</button>
      <p>Count: {count}</p>
    </>
  );
}
```

### Stable callback for effect dependencies

```jsx
function DataLoader({ endpoint }) {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const res = await fetch(endpoint);
    setData(await res.json());
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### When to use `useCallback`

| Use it when | Skip it when |
|---|---|
| Passing callbacks to `memo`ized children | Child is not memoized — no benefit |
| Function is a dependency of `useEffect` | Function is only used in JSX of same component |
| Library APIs require stable references | Creating the function is trivial and profiling shows no issue |

## What is the difference between useMemo and useCallback?

Both cache values between renders when dependencies are unchanged. The difference is **what** they return.

| | `useMemo` | `useCallback` |
|---|---|---|
| Caches | A **computed value** (any type) | A **function** |
| Returns | Result of the factory function | The function itself |
| Typical use | Expensive calculations, stable objects/arrays | Stable event handlers passed to memoized children |
| Equivalent | `useMemo(() => value, deps)` | `useMemo(() => fn, deps)` |

```jsx
// useMemo — caches the RESULT of the function call
const total = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items]);

// useCallback — caches the FUNCTION reference
const handleAdd = useCallback((item) => {
  setItems((prev) => [...prev, item]);
}, []);
```

```jsx
// These are conceptually similar:
const fn = useCallback(() => doWork(a), [a]);
const fn = useMemo(() => () => doWork(a), [a]);
```

**Memory trade-off:** both consume memory to avoid work. Use only when profiling or clear child memoization requires it.

## How do you create custom hooks?

A **custom hook** is a JavaScript function whose name starts with `use` and that may call other Hooks. It lets you extract and reuse **stateful logic** — not JSX — across components.

### Rules

- Name must start with `use` (e.g., `useFetch`, `useLocalStorage`)
- Can call any built-in or other custom hooks
- Each component that calls a custom hook gets its **own isolated state**

### `useLocalStorage` — sync state with localStorage

```jsx
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(stored));
  }, [key, stored]);

  return [stored, setStored];
}

function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### `useFetch` — data fetching with loading and error

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

function UserList() {
  const { data, loading, error } = useFetch('/api/users');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Composing hooks

Custom hooks can call other custom hooks, building layers of reusable logic:

```jsx
function useAuth() {
  const { data: user, loading } = useFetch('/api/me');
  const isLoggedIn = Boolean(user);
  return { user, loading, isLoggedIn };
}
```

Custom hooks are the primary mechanism for sharing stateful behavior in modern React — cleaner than HOCs and render props for most cases.
