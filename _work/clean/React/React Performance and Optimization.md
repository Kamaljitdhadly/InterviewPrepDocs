# React Performance and Optimization

## Questions Covered

1. What is `React.memo` and when should you use it?
2. How do `useMemo` and `useCallback` improve performance?
3. How does code splitting work with `React.lazy`?
4. Why and how do you virtualize long lists?
5. Why should you avoid inline object and function props?
6. How does the `key` prop affect rendering?
7. How do you profile with React DevTools, and when should you NOT optimize prematurely?
8. What are React concurrent features — Suspense and `useTransition`?

## What is `React.memo` and when should you use it?

`React.memo` is a higher-order component that memoizes a functional component. React skips re-rendering the component if its props are shallowly equal to the previous render.

### When to use it

- **Expensive pure presentational components** that re-render often because a parent re-rendered but props did not change.
- **Large lists** of item components where parent state changes frequently (e.g., selected row) but most items are unchanged.
- **Leaf components** deep in the tree that receive stable props.

### When not to use it

- Cheap components — memo comparison cost can exceed render cost.
- Props that are always new references (inline objects/functions) — memo provides no benefit unless paired with stable props.
- Components that almost always receive changed props.

```jsx
import { memo } from 'react';

const ExpensiveChart = memo(function ExpensiveChart({ data, width, height }) {
  // heavy D3 / canvas work
  return <canvas width={width} height={height} />;
});

function Dashboard() {
  const [filter, setFilter] = useState('all');
  const chartData = useMemo(() => computeData(filter), [filter]);

  return (
    <>
      <FilterBar value={filter} onChange={setFilter} />
      <ExpensiveChart data={chartData} width={800} height={400} />
    </>
  );
}
```

```jsx
// Custom comparison — only re-render when item.id changes
const ListItem = memo(
  function ListItem({ item, onSelect }) {
    return <li onClick={() => onSelect(item.id)}>{item.label}</li>;
  },
  (prev, next) => prev.item.id === next.item.id
);
```

`React.memo` only does a shallow prop compare. For context or internal state changes, the component still re-renders normally.

## How do `useMemo` and `useCallback` improve performance?

Both hooks cache values between renders. They are **not** free — they add memory and comparison overhead. Use them when you have measured a problem or have a clear reference-stability need.

| Hook | Caches | Typical use |
|------|--------|-------------|
| `useMemo` | A computed **value** | Expensive calculations; stable object/array for deps or memoized children |
| `useCallback` | A **function** reference | Stable callbacks passed to `memo` children or dependency arrays |

```jsx
import { useMemo, useCallback, memo } from 'react';

function ProductList({ products, category }) {
  const filtered = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category]
  );

  const handleSelect = useCallback((id) => {
    console.log('selected', id);
  }, []);

  return (
    <ul>
      {filtered.map((p) => (
        <ProductRow key={p.id} product={p} onSelect={handleSelect} />
      ))}
    </ul>
  );
}

const ProductRow = memo(function ProductRow({ product, onSelect }) {
  return <li onClick={() => onSelect(product.id)}>{product.name}</li>;
});
```

```jsx
// useMemo for stable config object passed to memoized child
function MapView({ points }) {
  const mapOptions = useMemo(
    () => ({ center: [0, 0], zoom: 4, points }),
    [points]
  );
  return <MemoizedMap options={mapOptions} />;
}
```

**Interview distinction:** `useMemo`/`useCallback` do not prevent re-renders of the component that calls them — they preserve references so *children* or *effects* with those deps do not fire unnecessarily.

## How does code splitting work with `React.lazy`?

Code splitting breaks your bundle into smaller chunks loaded on demand, reducing initial parse and download time. `React.lazy` dynamically imports a component; it must be wrapped in `<Suspense>` with a fallback while the chunk loads.

```jsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading page…</div>}>
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

```jsx
// Named export — map to default for React.lazy
const Reports = lazy(() =>
  import('./Reports').then((mod) => ({ default: mod.Reports }))
);
```

```js
// Webpack / Vite magic comment — separate chunk name (optional)
const HeavyEditor = lazy(() =>
  import(/* webpackChunkName: "editor" */ './HeavyEditor')
);
```

**Best practices:** split by route or heavy feature (charts, editors, admin). Keep the shell and critical path eager. Preload on hover or intent for perceived speed:

```jsx
function AdminLink() {
  const preload = () => import('./AdminPanel');
  return (
    <Link to="/admin" onMouseEnter={preload}>
      Admin
    </Link>
  );
}
```

## Why and how do you virtualize long lists?

Rendering thousands of DOM nodes at once hurts layout, paint, and memory. **Virtualization** (windowing) renders only the visible rows plus a small buffer, recycling DOM nodes as the user scrolls.

Libraries: `@tanstack/react-virtual`, `react-window`, `react-virtuoso`.

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function VirtualList({ items }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={row.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${row.start}px)`,
              height: row.size,
              width: '100%',
            }}
          >
            {items[row.index].label}
          </div>
        ))}
      </div>
    </div>
  );
}
```

Use virtualization when lists exceed a few hundred visible items or when scroll jank appears in profiling. For small lists, normal `.map()` is simpler and faster overall.

## Why should you avoid inline object and function props?

Every render creates **new object and function references** for inline literals. Child components wrapped in `React.memo` see "changed" props every time and re-render anyway. Effects that list inline functions in dependency arrays also re-run unnecessarily.

```jsx
// BAD — new style object and arrow function every render
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <Child
      style={{ color: 'red' }}
      onClick={() => setCount(count + 1)}
    />
  );
}

const Child = memo(function Child({ style, onClick }) {
  return <button style={style} onClick={onClick}>Click</button>;
});
// Child re-renders on every Parent render despite memo
```

```jsx
// GOOD — stable references
const buttonStyle = { color: 'red' }; // module-level if truly static

function Parent() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => setCount((c) => c + 1), []);
  return <Child style={buttonStyle} onClick={handleClick} />;
}
```

**Pragmatic rule:** fix inline props when profiling shows wasted child renders or when passing to memoized/expensive children. Do not hoist every callback preemptively.

## How does the `key` prop affect rendering?

`key` tells React how to match elements across reconciliations. It affects **identity**, not CSS or DOM attributes.

### Rules and impact

- Keys must be **stable, unique among siblings** — prefer entity IDs over array index (index breaks on reorder, insert, delete).
- Changing a key **remounts** the component — state resets, effects re-run.
- Wrong keys cause incorrect state preservation, input cursor jumps, and poor animation.

```jsx
// BAD — index as key when list is reorderable
{items.map((item, index) => (
  <TodoItem key={index} item={item} />
))}

// GOOD — stable id
{items.map((item) => (
  <TodoItem key={item.id} item={item} />
))}
```

```jsx
// Forcing remount when user switches — intentional key use
function ChatPanel({ activeUserId }) {
  return <ChatThread key={activeUserId} userId={activeUserId} />;
  // New key → fresh local state and subscriptions per user
}
```

During reconciliation, React diffs by key and type. Duplicate keys among siblings cause unpredictable behavior and warnings in development.

## How do you profile with React DevTools, and when should you NOT optimize prematurely?

### Profiling with React DevTools

1. Install **React Developer Tools** browser extension.
2. Open the **Profiler** tab → click record, interact with the app, stop.
3. Inspect **flame graph** — tall/wide bars = slow or frequent renders.
4. Enable **"Highlight updates"** in Components tab to see what re-renders visually.
5. Use **"Why did this render?"** (React 18+) to see prop/state/context changes.
6. Combine with browser **Performance** panel for JS long tasks and layout thrashing.

```jsx
// Optional: programmatic profiler API
import { Profiler } from 'react';

function onRender(id, phase, actualDuration) {
  if (actualDuration > 16) {
    console.warn(`${id} ${phase} took ${actualDuration}ms`);
  }
}

<Profiler id="ProductList" onRender={onRender}>
  <ProductList />
</Profiler>
```

### When NOT to optimize prematurely

- **No measured problem** — 60 fps and fast interaction need no memoization sprawl.
- **Micro-optimizing cheap renders** — `useCallback` on every handler adds noise and bugs.
- **Before correct architecture** — fix unnecessary global subscriptions and huge trees before `memo` everywhere.
- **Guessing bottlenecks** — profile first; often the issue is network, bundle size, or unvirtualized lists, not missing `memo`.
- **Breaking readability** for hypothetical scale — optimize hot paths proven by data.

**Heuristic:** default to simple code → ship → profile under realistic load → fix the top offender (usually bundle size, data fetching, or list rendering).

## What are React concurrent features — Suspense and `useTransition`?

React 18+ **concurrent rendering** lets React interrupt, pause, and resume work to keep the UI responsive. You opt in via specific APIs rather than a global flag.

### Suspense

Declares a **fallback UI** while children are not ready (lazy-loaded components or data-fetching libraries that support Suspense boundaries).

```jsx
import { Suspense, lazy } from 'react';

const UserDetails = lazy(() => import('./UserDetails'));

function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserDetails userId={42} />
    </Suspense>
  );
}
```

Nested boundaries allow partial loading — shell stays visible while sections resolve.

### `useTransition`

Marks state updates as **non-urgent**. React keeps showing the old UI while preparing the new one, avoiding jank on heavy updates (filtering large lists, tab switches).

```jsx
import { useState, useTransition, memo } from 'react';

const SlowList = memo(function SlowList({ query }) {
  const items = filterMillionsOfRows(query); // expensive
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

function SearchPage() {
  const [query, setQuery] = useState('');
  const [deferredQuery, setDeferredQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value); // urgent — input stays snappy
    startTransition(() => {
      setDeferredQuery(value); // non-urgent — list can lag behind
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Updating…</span>}
      <SlowList query={deferredQuery} />
    </>
  );
}
```

### Related concurrent APIs (brief)

- **`useDeferredValue`** — defer a value derived from props/state (similar goal to transitions).
- **Automatic batching** — multiple `setState` calls in async handlers batch into one render (React 18+).

Concurrent features prioritize **user perception** — keep inputs responsive and show meaningful loading states instead of blocking the main thread on large updates.
