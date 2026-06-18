# React State Management

## Questions Covered

1. When should you use local state vs global state in React?
2. What are the pros and cons of the Context API?
3. What is prop drilling, and how do you solve it?
4. How does Redux Toolkit organize store, slice, and reducer?
5. How does `createAsyncThunk` work in RTK?
6. What are the basics of Zustand?
7. How do Context, Redux, and Zustand compare?
8. What selector patterns help avoid unnecessary re-renders?

## When should you use local state vs global state in React?

**Local state** lives inside a single component (or a small subtree via `useState` / `useReducer`). Use it when the data is only relevant to that component's UI and does not need to be shared across distant parts of the tree.

**Global state** is shared across multiple unrelated components — authentication, shopping cart, theme, server-fetched reference data, or any value that many branches of the tree need to read or update.

### Decision guidelines

| Situation | Prefer |
|-----------|--------|
| Form input, toggle, hover, modal open/close | Local state |
| Data used by parent and immediate children | Local state + props |
| Data needed by distant cousins or unrelated routes | Global state |
| Server cache / normalized entity data | Global state (RTK Query, React Query, Zustand) |
| Infrequently changing theme or locale | Context or global store |

**Rule of thumb:** start local, lift state only when two siblings need it, and promote to global only when prop passing becomes painful or you need predictable cross-feature updates.

```jsx
// Local state — only this component cares about the count
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      {count}
    </button>
  );
}

// Lifted state — parent shares with siblings
function Parent() {
  const [filter, setFilter] = useState('');
  return (
    <>
      <SearchBox value={filter} onChange={setFilter} />
      <ItemList filter={filter} />
    </>
  );
}

// Global state — auth needed everywhere
function App() {
  return (
    <AuthProvider>
      <Header />   {/* reads user */}
      <Dashboard /> {/* reads user */}
    </AuthProvider>
  );
}
```

## What are the pros and cons of the Context API?

React Context lets you pass data through the component tree without manually threading props at every level. You create a context with `createContext`, provide a value with `<Provider>`, and consume it with `useContext`.

### Pros

- **Built into React** — no extra dependency.
- **Simple for low-frequency updates** — theme, locale, auth snapshot, feature flags.
- **Avoids prop drilling** for read-mostly values.
- **Composable** — multiple contexts for separate concerns.

### Cons

- **No built-in selectors** — any context value change re-renders all consumers of that context, even if they only use one field.
- **No middleware, devtools, or time-travel** out of the box.
- **Testing** requires wrapping components in providers.
- **Splitting context** is a manual optimization; easy to accidentally create one giant context.
- **Not ideal for high-frequency writes** (e.g., live cursor position, rapidly updating form state shared widely).

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext('light');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function Toolbar() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme}
    </button>
  );
}
```

**Interview tip:** Context is a dependency-injection mechanism, not a full state manager. Split read and write contexts or use `useMemo` on the provider value to reduce unnecessary re-renders.

## What is prop drilling, and how do you solve it?

**Prop drilling** is passing data through many intermediate components that do not use the data themselves — they only forward props to a deep child. It makes components harder to refactor, couples unrelated layers, and clutters signatures.

### Solutions

1. **Component composition** — pass `children` or render props so intermediate layers stay unaware of the data.
2. **Context** — for widely read, infrequently updated values.
3. **Global store** (Redux, Zustand) — for complex shared state with selectors.
4. **Colocate state** — move the stateful subtree closer to where it is needed.

```jsx
// Prop drilling — Layout and Sidebar don't use user
function App() {
  const user = { name: 'Ada' };
  return <Layout user={user} />;
}
function Layout({ user }) {
  return <Sidebar user={user} />;
}
function Sidebar({ user }) {
  return <UserBadge user={user} />;
}

// Composition — intermediate components stay clean
function App() {
  const user = { name: 'Ada' };
  return (
    <Layout sidebar={<UserBadge user={user} />} />
  );
}
function Layout({ sidebar }) {
  return <aside>{sidebar}</aside>;
}

// Context — skip intermediate forwarding
const UserContext = createContext(null);
function App() {
  const user = { name: 'Ada' };
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  );
}
function UserBadge() {
  const user = useContext(UserContext);
  return <span>{user.name}</span>;
}
```

## How does Redux Toolkit organize store, slice, and reducer?

Redux Toolkit (RTK) is the recommended way to write Redux. It reduces boilerplate with `configureStore`, `createSlice`, and Immer-powered reducers.

| Concept | Role |
|---------|------|
| **Store** | Single source of truth; holds the full state tree; created with `configureStore` |
| **Slice** | A feature module: initial state + reducers + auto-generated action creators |
| **Reducer** | Pure function `(state, action) => newState`; in RTK you write "mutating" logic safely via Immer inside `createSlice` |

```js
// store/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1; // Immer allows direct mutation syntax
    },
    incrementByAmount(state, action) {
      state.value += action.payload;
    },
  },
});

export const { increment, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
```

```js
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});
```

```jsx
// App usage
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store';
import { increment } from './store/counterSlice';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(increment())}>{count}</button>;
}

export default function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

`configureStore` also sets up Redux DevTools and sensible middleware (including checks for accidental mutations in development).

## How does `createAsyncThunk` work in RTK?

`createAsyncThunk` handles async logic (API calls) and dispatches lifecycle actions automatically: `pending`, `fulfilled`, and `rejected`. You define the async function; RTK generates the action types and pairs them with `extraReducers` in a slice.

### Flow

1. Dispatch the thunk → `pending` action fires.
2. Async function runs.
3. On success → `fulfilled` with `action.payload`.
4. On failure → `rejected` with `action.error`.

```js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (userId, { rejectWithValue }) => {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) return rejectWithValue('User not found');
    return res.json();
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: { data: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
```

```jsx
function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUser(userId));
  }, [dispatch, userId]);

  if (status === 'loading') return <p>Loading…</p>;
  if (status === 'failed') return <p>{error}</p>;
  return <h1>{data?.name}</h1>;
}
```

For data fetching at scale, **RTK Query** (`createApi`) layers caching, invalidation, and deduplication on top of the same patterns.

## What are the basics of Zustand?

Zustand is a minimal global state library. You create a store with a hook; components subscribe to slices of state without providers (unless you use the optional context pattern).

### Key ideas

- **Single store function** created with `create`.
- **Selectors** in the hook call: `useStore((s) => s.bears)` — component re-renders only when that slice changes (shallow compare by default).
- **Actions** live alongside state in the store definition.
- **No reducers required** — update with `set` (supports functional updates).
- **Middleware** available (`persist`, `devtools`, `immer`).

```js
import { create } from 'zustand';

const useBearStore = create((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  reset: () => set({ bears: 0 }),
}));
```

```jsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);
  return <button onClick={increase}>{bears} bears</button>;
}

// Subscribe to multiple fields with shallow compare
import { shallow } from 'zustand/shallow';

function BearStats() {
  const { bears, increase } = useBearStore(
    (s) => ({ bears: s.bears, increase: s.increase }),
    shallow
  );
  return <button onClick={increase}>{bears}</button>;
}
```

```js
// Async action — no special thunk API needed
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  fetchUser: async (id) => {
    set({ loading: true });
    const res = await fetch(`/api/users/${id}`);
    set({ user: await res.json(), loading: false });
  },
}));
```

Zustand shines for small-to-medium apps that want global state without Redux ceremony.

## How do Context, Redux, and Zustand compare?

| | Context | Redux (RTK) | Zustand |
|---|---------|-------------|---------|
| **Bundle / setup** | Built-in | Larger; more concepts | Tiny (~1 KB) |
| **Boilerplate** | Low | Medium (slices, store) | Very low |
| **Selectors** | Manual (`useMemo`, split contexts) | `useSelector`, `createSelector` | Built-in per-hook selectors |
| **DevTools** | None native | Excellent | Via middleware |
| **Async** | Manual in provider | `createAsyncThunk`, RTK Query | Plain async in store |
| **Re-render control** | Easy to get wrong | Good with selectors | Good with selectors |
| **Best for** | Theme, auth snapshot, DI | Large apps, complex flows, caching | Medium apps, quick global state |

### When to choose what

- **Context** — few updates, simple shared values, you want zero dependencies.
- **Redux Toolkit** — many features touching the same data, need predictable action logs, middleware, RTK Query caching, or large team conventions.
- **Zustand** — global state without Redux weight; rapid prototyping; colocated actions and state.

All three can coexist: e.g., Redux for server cache, Context for theme, local state for forms.

```jsx
// Context — theme only
<ThemeProvider>
  {/* Redux — app data */}
  <Provider store={store}>
  {/* Zustand — UI preferences, no provider needed */}
    <App />
  </Provider>
</ThemeProvider>
```

## What selector patterns help avoid unnecessary re-renders?

Unnecessary re-renders happen when a component subscribes to more state than it uses, or when selectors return new object/array references every render.

### Patterns

1. **Narrow subscriptions** — select only the fields you need.
2. **Memoized selectors** — `createSelector` (Reselect) caches derived data.
3. **Stable references** — avoid `useSelector(state => ({ a: state.a, b: state.b }))` without shallow equality.
4. **Split contexts** — separate state and dispatch contexts in React Context.
5. **Component boundaries** — isolate frequent updaters so siblings do not re-render.

```js
// Redux — memoized selector
import { createSelector } from '@reduxjs/toolkit';

const selectCartItems = (state) => state.cart.items;
const selectCartTotal = createSelector([selectCartItems], (items) =>
  items.reduce((sum, item) => sum + item.price * item.qty, 0)
);
```

```jsx
// Redux — BAD: new object every time → re-render always
const { name, email } = useSelector((state) => ({
  name: state.user.name,
  email: state.user.email,
}));

// Redux — GOOD: separate primitive selectors
const name = useSelector((state) => state.user.name);
const email = useSelector((state) => state.user.email);

// Redux — GOOD: shallowEqual for object picks
import { shallowEqual } from 'react-redux';
const { name, email } = useSelector(
  (state) => ({ name: state.user.name, email: state.user.email }),
  shallowEqual
);
```

```jsx
// Context — split state vs dispatch to limit re-renders
const CountStateContext = createContext(0);
const CountDispatchContext = createContext(() => {});

function CountProvider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <CountStateContext.Provider value={count}>
      <CountDispatchContext.Provider value={setCount}>
        {children}
      </CountDispatchContext.Provider>
    </CountStateContext.Provider>
  );
}

// Only consumers of count re-render when count changes;
// components that only call setCount subscribe to dispatch context.
function IncrementButton() {
  const setCount = useContext(CountDispatchContext);
  return <button onClick={() => setCount((c) => c + 1)}>+</button>;
}
```

```js
// Zustand — pick one field
const bears = useBearStore((s) => s.bears); // re-renders only when bears changes
```

**Interview summary:** measure first, then apply narrow subscriptions and memoized selectors before reaching for `React.memo` everywhere.
