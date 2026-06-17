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

| Situation | Prefer |
|-----------|--------|
| Form input, toggle, hover, modal | **Local** (`useState`) |
| Parent + immediate children | **Lifted** state + props |
| Distant cousins / cross-route data | **Global** (Context, Redux, Zustand) |
| Server cache / normalized entities | **Global** (RTK Query, React Query) |
| Theme, locale | Context or global store |

**Rule:** start local → lift when siblings need it → go global when prop passing hurts or cross-feature updates need structure.

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

Context passes data through the tree without manual prop threading (`createContext` → `Provider` → `useContext`).

| Pros | Cons |
|------|------|
| Built into React, no dependency | No built-in selectors — all consumers re-render on value change |
| Simple for read-mostly values (theme, locale) | No middleware / DevTools / time-travel |
| Avoids prop drilling | Easy to create one giant context |
| Multiple contexts composable | Poor fit for high-frequency writes |

**Tip:** Context is dependency injection, not a full state manager. Split read/write contexts; memoize provider value.

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

## What is prop drilling, and how do you solve it?

**Prop drilling** — passing data through intermediate components that only forward props to a deep child. Clutters signatures and couples layers.

| Solution | When |
|----------|------|
| **Composition** (`children`, render props) | Intermediate layers should stay unaware |
| **Context** | Widely read, infrequent updates |
| **Global store** (Redux, Zustand) | Complex shared state + selectors |
| **Colocate state** | Move subtree closer to consumers |

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

| Concept | Role |
|---------|------|
| **Store** | Single state tree; `configureStore` |
| **Slice** | Feature module: state + reducers + auto action creators (`createSlice`) |
| **Reducer** | `(state, action) => newState`; Immer allows "mutating" syntax in RTK |

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

## How does `createAsyncThunk` work in RTK?

Auto-dispatches **`pending` → `fulfilled` / `rejected`** lifecycle actions. Pair with `extraReducers` in a slice.

1. Dispatch thunk → `pending`
2. Async runs → success = `fulfilled` + `payload`; failure = `rejected` + `error`

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

At scale use **RTK Query** (`createApi`) for caching and invalidation.

## What are the basics of Zustand?

Minimal global store via `create` hook — **no provider required**. Selectors limit re-renders; actions colocated with state.

| Feature | Detail |
|---------|--------|
| Subscribe | `useStore((s) => s.field)` |
| Update | `set()` — functional or partial |
| Multi-field | `shallow` compare from `zustand/shallow` |
| Async | Plain async in store — no thunk API |

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

## How do Context, Redux, and Zustand compare?

| | Context | Redux (RTK) | Zustand |
|---|---------|-------------|---------|
| Setup | Built-in | Heavier | ~1 KB |
| Boilerplate | Low | Medium | Very low |
| Selectors | Manual | `useSelector`, `createSelector` | Per-hook |
| DevTools | None | Excellent | Middleware |
| Async | Manual | `createAsyncThunk`, RTK Query | Plain async |
| Best for | Theme, DI | Large apps, caching | Quick global state |

**Choose:** Context = zero deps, rare updates · Redux = complex flows, team conventions · Zustand = lightweight global state.

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

Re-renders spike when components subscribe to too much state or selectors return new references each render.

| Pattern | How |
|---------|-----|
| Narrow subscriptions | Select primitives, not whole slices |
| Memoized selectors | `createSelector` (Reselect) |
| Stable references | Avoid inline object selectors without `shallowEqual` |
| Split contexts | Separate state vs dispatch providers |
| Boundaries | Isolate frequent updaters |

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

**Summary:** measure → narrow subscriptions → memoized selectors → then `React.memo`.

---

## Related Topics

- **Redux Toolkit Basics** (`React/`)
- **Zustand and Alternative State** (`React/`)
