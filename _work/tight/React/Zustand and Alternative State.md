# Zustand and Alternative State

## Questions Covered

1. What is Zustand and when should you choose it over Redux?
2. How do you create and use a Zustand store?
3. How does Zustand compare to React Context for global state?
4. What is Jotai and atomic state management?
5. What is Recoil and when might you use it?
6. How do you choose between Redux, Zustand, Jotai, and Context?

## What is Zustand and when should you choose it over Redux?

**Zustand** — minimal (~1 KB) global state via `create` + hook subscriptions. No providers, no mandatory reducers, actions colocated with state.

| Choose Zustand | Choose Redux Toolkit |
|----------------|----------------------|
| Small/medium app, fast setup | Large app, many features sharing data |
| Simple global UI state | Action logs, middleware, time-travel DevTools |
| Less ceremony | RTK / RTK Query conventions |
| Colocated state + actions | Complex async, normalized entity cache |
| Bundle size matters | Server-state caching at scale |

Middleware (`persist`, `devtools`, `immer`) is opt-in.

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

## How do you create and use a Zustand store?

1. `create((set, get) => ({ ... }))`
2. **`set`** — partial or functional update
3. **`get`** — read state inside actions
4. Hook + **selector** — re-render only when selected slice changes

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

Both avoid prop drilling; differ in **subscription granularity**.

| | React Context | Zustand |
|---|---------------|---------|
| Setup | `createContext` + `Provider` | `create` hook, no provider |
| Re-renders | All consumers on value change | Only selected slice subscribers |
| Selectors | Manual (`useMemo`, split contexts) | `useStore(s => s.field)` |
| DevTools | None | `devtools` middleware |
| Best for | Theme, locale, infrequent updates | Frequent/multi-field global state |

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

Split-context mitigates Context re-renders; Zustand gives selectors out of the box.

## What is Jotai and atomic state management?

**Jotai** — bottom-up **atomic** state: many small **atoms** instead of one store. Derived atoms compose others; fine-grained subscriptions; async + Suspense support.

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

**Best for:** composable local-to-global state, form field atoms, Suspense data fetching.

## What is Recoil and when might you use it?

**Recoil** (Meta) — atomic model: **atoms** hold state, **selectors** derive memoized values. Requires `<RecoilRoot>`.

> Recoil maintenance slowed after 2023; Jotai/Zustand preferred for greenfield. Still valid interview concept.

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

**Fits:** atom/selector model, fine-grained subscriptions, async selectors. For new projects, mention Jotai as the more actively maintained atomic alternative.

## How do you choose between Redux, Zustand, Jotai, and Context?

Match tool to **update frequency**, **team conventions**, **data shape**, **server-state needs**.

| | Context | Zustand | Jotai | Redux (RTK) |
|---|---------|---------|-------|-------------|
| Model | Provider value | Single store hook | Atoms | Slices + store |
| Boilerplate | Low | Very low | Low | Medium |
| Selectors | Manual | Per-hook | Derived atoms | `createSelector` |
| Re-render control | Easy to get wrong | Good | Excellent | Good |
| DevTools | None | Middleware | Package | Excellent |
| Server cache | Manual | Manual | Manual | RTK Query |
| Best for | Theme, rare updates | Quick global client state | Composable atoms | Large apps, complex flows |

**Decision flow:**

1. Theme/locale, few updates → **Context**
2. Simple global client state → **Zustand**
3. Independent composable pieces, Suspense → **Jotai**
4. Large app, audit trail, RTK Query → **Redux Toolkit**

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

**Summary:** simplest tool that meets re-render + scale needs; promote to Redux when conventions, middleware, and server-cache infrastructure justify overhead.
