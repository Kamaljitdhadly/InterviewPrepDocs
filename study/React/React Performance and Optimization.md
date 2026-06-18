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

`React.memo` memoizes a component — skips re-render if props are **shallowly equal**.

| Use | Skip |
|-----|------|
| Expensive pure presentational children | Cheap components |
| Large lists where most items unchanged | Props always new references |
| Leaf components with stable props | Props change every render anyway |

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

Shallow compare only — context/internal state changes still re-render.

## How do `useMemo` and `useCallback` improve performance?

Cache values between renders. **Not free** — use when measured or for reference stability.

| Hook | Caches | Use for |
|------|--------|---------|
| `useMemo` | Computed value | Expensive calc; stable object/array |
| `useCallback` | Function ref | Stable callbacks for `memo` children / effect deps |

Does **not** skip re-render of the caller — preserves refs so children/effects don't fire unnecessarily.

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

## How does code splitting work with `React.lazy`?

Splits bundle into on-demand chunks. `React.lazy` + `<Suspense fallback>` required.

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

Split by route / heavy feature. Preload on intent:

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

Thousands of DOM nodes hurt layout/paint/memory. **Windowing** renders visible rows + buffer only.

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

Use for hundreds+ items or scroll jank in profiling. Small lists → plain `.map()`.

## Why should you avoid inline object and function props?

Inline literals create **new references every render** → `memo` children always re-render; effects with inline deps re-fire.

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

Fix when profiling shows wasted child renders — don't hoist every callback preemptively.

## How does the `key` prop affect rendering?

`key` = element **identity** for reconciliation (not a DOM attribute).

| Rule | Effect |
|------|--------|
| Stable unique ID among siblings | Correct state preservation |
| Array index on reorderable lists | Broken state, cursor jumps |
| Changed key | **Remount** — state reset, effects re-run |

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

Duplicate keys among siblings → unpredictable behavior + dev warnings.

## How do you profile with React DevTools, and when should you NOT optimize prematurely?

### Profiling

1. React DevTools → **Profiler** → record → interact → stop
2. **Flame graph** — tall/wide = slow/frequent renders
3. **Highlight updates** — visual re-render map
4. **"Why did this render?"** (React 18+)
5. Browser **Performance** panel for long tasks / layout

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

### When NOT to optimize

| Avoid | Why |
|-------|-----|
| No measured problem | 60 fps needs no memo sprawl |
| Micro-optimizing cheap renders | `useCallback` everywhere adds noise |
| Before fixing architecture | Global subscriptions / huge trees first |
| Guessing | Bottleneck is often bundle, network, lists |
| Readability for hypothetical scale | Profile → fix top offender |

**Heuristic:** simple code → ship → profile realistic load → fix #1 issue.

## What are React concurrent features — Suspense and `useTransition`?

React 18+ **concurrent rendering** — interruptible work for responsive UI.

### Suspense

Fallback UI while children aren't ready (lazy routes, Suspense-aware data).

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

Nested boundaries → partial loading.

### `useTransition`

Marks updates **non-urgent** — old UI stays visible during heavy work.

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

**Also:** `useDeferredValue` (defer derived values) · automatic batching in async handlers (React 18+).

Concurrent APIs prioritize **perceived responsiveness** over blocking on large updates.
