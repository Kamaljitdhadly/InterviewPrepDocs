# Zustand and Alternative State

## Questions Covered

1. What is Zustand and when should you choose it over Redux?
2. How do you create and use a Zustand store?
3. How does Zustand compare to React Context for global state?
4. What is Jotai and atomic state management?
5. What is Recoil and when might you use it?
6. How do you choose between Redux, Zustand, Jotai, and Context?

## What is Zustand and when should you choose it over Redux?

**Zustand** is a minimal (~1 KB) global state library for React. You define a store with `create`; components subscribe via a hook. No providers required, no reducers mandatory, and actions live beside state.

### When Zustand over Redux

| Choose Zustand | Choose Redux Toolkit |
|----------------|----------------------|
| Small-to-medium app, fast setup | Large app with many features sharing data |
| Simple global UI state (cart, modals, prefs) | Need action logs, middleware, time-travel DevTools |
| Team wants less ceremony | Team already standardized on RTK / RTK Query |
| Colocated state + actions in one file | Complex async flows, normalized entity cache |
| Bundle size matters | RTK Query for server-state caching at scale |

Zustand supports middleware (`persist`, `devtools`, `immer`) when you outgrow the basics — but it stays opt-in.

```js
import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...product, qty: 1 }] };
    }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));
```

```jsx
function CartIcon() {
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.qty, 0)
  );
  return <span>{itemCount}</span>;
}
```

**Interview tip:** Zustand is not "anti-Redux" — it's a lighter default for global client state when you do not need Redux's full ecosystem.

## How do you create and use a Zustand store?

### Store anatomy

1. Call `create` with a state creator `(set, get) => ({ ... })`.
2. **`set`** — partial update or functional updater.
3. **`get`** — read current state inside actions (e.g., compute before/after).
4. Components call the hook with a **selector** — re-render only when that slice changes (shallow compare by default).

```js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useBearStore = create(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        fish: 0,
        increase: () => set((s) => ({ bears: s.bears + 1 }), false, 'bears/increase'),
        feed: (amount) => set({ fish: amount }),
      }),
      { name: 'bear-storage' }
    )
  )
);
```

```jsx
import { shallow } from 'zustand/shallow';

function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increase = useBearStore((state) => state.increase);
  return <button onClick={increase}>{bears} bears</button>;
}

// Multiple fields — use shallow to avoid re-renders when unrelated fields change
function BearPanel() {
  const { bears, increase } = useBearStore(
    (s) => ({ bears: s.bears, increase: s.increase }),
    shallow
  );
  return <button onClick={increase}>{bears}</button>;
}
```

```js
// Async actions — no special thunk API
const useUserStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Not found');
      set({ user: await res.json(), loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
}));
```

```jsx
function UserProfile({ userId }) {
  const { user, loading, error, fetchUser } = useUserStore(
    (s) => ({
      user: s.user,
      loading: s.loading,
      error: s.error,
      fetchUser: s.fetchUser,
    }),
    shallow
  );

  useEffect(() => {
    fetchUser(userId);
  }, [userId, fetchUser]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  return <h1>{user?.name}</h1>;
}
```

## How does Zustand compare to React Context for global state?

Both solve "shared state without prop drilling," but they differ in **subscription granularity** and **ergonomics**.

| | React Context | Zustand |
|---|---------------|---------|
| **Setup** | `createContext` + `Provider` wrapper | `create` hook, no provider |
| **Re-renders** | All consumers re-render when context value changes | Only subscribers whose selected slice changed |
| **Selectors** | Manual (`useMemo`, split contexts) | Built into hook: `useStore(s => s.field)` |
| **Updates** | `useState` in provider | `set` in store |
| **DevTools** | None native | `devtools` middleware |
| **Best for** | Theme, locale, DI, infrequent updates | Frequently updated or multi-field global state |

```jsx
// Context — every consumer re-renders when theme OR locale changes
const AppContext = createContext(null);

function AppProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [locale, setLocale] = useState('en');
  const value = { theme, setTheme, locale, setLocale };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

function ThemeToggle() {
  const { theme, setTheme } = useContext(AppContext); // re-renders on locale change too
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
```

```jsx
// Zustand — fine-grained subscriptions
import { create } from 'zustand';

const useAppStore = create((set) => ({
  theme: 'light',
  locale: 'en',
  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale }),
}));

function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
// Locale changes do NOT re-render ThemeToggle
```

**Split-context pattern** can mitigate Context re-render issues, but Zustand gives selector behavior out of the box.

## What is Jotai and atomic state management?

**Jotai** takes a bottom-up **atomic** approach: state is many small **atoms** (primitive units) instead of one monolithic store. Components subscribe to individual atoms; derived atoms compose other atoms (like spreadsheet cells).

### Key concepts

- **Atom** — `atom(initialValue)` or `atom(get => derived)`.
- **No provider required** (default store), but `<Provider>` scopes atoms per subtree.
- **Fine-grained updates** — changing one atom does not re-render unrelated atom subscribers.
- **Async atoms** — built-in support for promises and Suspense integration.

```jsx
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// Primitive atom
const countAtom = atom(0);

// Derived atom — recomputes when countAtom changes
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// Write-only derived atom
const incrementAtom = atom(null, (get, set) => {
  set(countAtom, get(countAtom) + 1);
});

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const double = useAtomValue(doubleCountAtom);
  const increment = useSetAtom(incrementAtom);

  return (
    <div>
      <p>{count} (double: {double})</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={increment}>increment atom</button>
    </div>
  );
}
```

```jsx
// Async atom with Suspense
const userAtom = atom(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

function UserCard() {
  const user = useAtomValue(userAtom); // suspends until resolved
  return <h1>{user.name}</h1>;
}
```

**When Jotai shines:** highly composable local-to-global state, form field atoms, avoiding prop drilling without a central store shape, React Suspense data fetching.

## What is Recoil and when might you use it?

**Recoil** (developed at Meta) is another **atomic** state library. Atoms hold state; **selectors** derive read-only (or read-write) computed values. It requires a `<RecoilRoot>` and integrates with React's concurrent features.

> **Note:** Recoil's maintenance slowed after 2023; many teams choose Jotai or Zustand for new projects. It remains fair game in interviews as a concept.

### Core pieces

- **`atom`** — unit of state with a unique `key`.
- **`selector`** — derives from atoms (sync or async); memoized.
- **`useRecoilState` / `useRecoilValue` / `useSetRecoilState`** — hooks per atom/selector.

```jsx
import { atom, selector, useRecoilState, useRecoilValue } from 'recoil';

const cartItemsState = atom({
  key: 'cartItems',
  default: [],
});

const cartTotalState = selector({
  key: 'cartTotal',
  get: ({ get }) => {
    const items = get(cartItemsState);
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },
});

function CartSummary() {
  const total = useRecoilValue(cartTotalState);
  return <p>Total: ${total.toFixed(2)}</p>;
}

function AddToCartButton({ product }) {
  const [items, setItems] = useRecoilState(cartItemsState);
  const add = () => setItems([...items, { ...product, qty: 1 }]);
  return <button onClick={add}>Add</button>;
}
```

### When Recoil might fit

- You want atom/selector mental model with explicit keys and DevTools.
- Fine-grained subscriptions across a large tree.
- Async selectors with dependency tracking (similar to Jotai derived atoms).

For greenfield work, interviewers often expect you to mention Jotai as the more actively maintained atomic alternative.

## How do you choose between Redux, Zustand, Jotai, and Context?

There is no universal winner — match the tool to **update frequency**, **team conventions**, **data shape**, and **server-state needs**.

| | Context | Zustand | Jotai | Redux (RTK) |
|---|---------|---------|-------|-------------|
| **Model** | Provider value | Single store hook | Atoms | Slices + store |
| **Boilerplate** | Low | Very low | Low | Medium |
| **Selectors** | Manual | Per-hook | Derived atoms | `createSelector` |
| **Re-render control** | Easy to get wrong | Good | Excellent (atomic) | Good |
| **DevTools** | None | Middleware | Devtools package | Excellent |
| **Server cache** | Manual | Manual / external | Manual / external | RTK Query |
| **Best for** | Theme, DI, rare updates | Quick global client state | Composable atoms, forms | Large apps, complex flows |

### Decision flow

1. **Only theme/locale/auth snapshot, few updates?** → **Context** (maybe split read/write contexts).
2. **Simple global client state, small team, fast delivery?** → **Zustand**.
3. **Many independent pieces of state, heavy composition, Suspense?** → **Jotai** (or atoms pattern).
4. **Large app, many features, audit trail, RTK Query, established Redux patterns?** → **Redux Toolkit**.

```jsx
// Coexistence is common
import { Provider } from 'react-redux';
import { store } from './app/store';

function App() {
  return (
  <ThemeProvider>           {/* Context — theme */}
    <Provider store={store}> {/* Redux — server cache + domain state */}
      <AppRoutes />          {/* Zustand/Jotai — no provider needed */}
    </Provider>
  </ThemeProvider>
  );
}
```

```js
// Zustand — UI preferences
const useUiStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

// Jotai — form field atoms
const emailAtom = atom('');
const passwordAtom = atom('');
const canSubmitAtom = atom(
  (get) => get(emailAtom).includes('@') && get(passwordAtom).length >= 8
);
```

**Interview summary:** start with the simplest tool that meets re-render and scalability needs; promote to Redux when cross-feature conventions, middleware, and server-cache infrastructure justify the overhead.
