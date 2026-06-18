# React Advanced Topics

## Questions Covered

1. What are Higher-Order Components (HOCs), and when should you use them?
2. Explain the render props pattern and how it differs from HOCs.
3. What are React portals, and what problems do they solve?
4. What are error boundaries, and what errors do they not catch?
5. How do `forwardRef` and `useImperativeHandle` work together?
6. Explain the compound components pattern and its benefits.
7. How do you integrate controlled third-party libraries with React?
8. When should you use refs for DOM manipulation instead of state?
9. What are React Server Components, and how do they fit into React 19?

## What are Higher-Order Components (HOCs), and when should you use them?

A **HOC** is a function `(WrappedComponent) => EnhancedComponent` that injects props or behavior without modifying the original. Use for cross-cutting concerns (auth, logging, analytics), legacy class-component codebases, and prop injection. Drawbacks: wrapper hell, prop name collisions, refs need `forwardRef`. **Custom hooks** replace most HOC use cases today; HOCs remain valid for libraries and legacy integration.

```jsx
function withAuth(WrappedComponent) {
  return function WithAuth(props) {
    const user = useAuth();
    if (!user) return <LoginPrompt />;
    return <WrappedComponent {...props} user={user} />;
  };
}

function Dashboard({ user }) {
  return <h1>Welcome, {user.name}</h1>;
}

export default withAuth(Dashboard);
```

## Explain the render props pattern and how it differs from HOCs.

**Render props** share logic by passing a function (as `render` or `children`) that receives data and returns JSX. The parent owns logic; the consumer controls layout. Compared to HOCs: fewer wrapper nodes, more flexible composition, but callback nesting if overused. **Custom hooks** are the modern default; render props remain useful in headless UI libraries.

```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return render(position);
}

function App() {
  return (
    <MouseTracker
      render={({ x, y }) => (
        <p>Mouse position: {x}, {y}</p>
      )}
    />
  );
}
```

```jsx
function DataFetcher({ url, children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((json) => { setData(json); setLoading(false); });
  }, [url]);

  return children({ data, loading });
}

function UserList() {
  return (
    <DataFetcher url="/api/users">
      {({ data, loading }) =>
        loading ? <Spinner /> : <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>
      }
    </DataFetcher>
  );
}
```

## What are React portals, and what problems do they solve?

**Portals** render children into a DOM node outside the parent's hierarchy (usually `document.body`) while keeping React tree semantics for context and event bubbling. They fix `overflow: hidden` clipping, z-index stacking issues, and invalid DOM nesting for modals/tooltips/dropdowns.

```jsx
import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
```

Events bubble through the **React tree**, not the DOM tree — a portal click still reaches React ancestors of the component that created it.

```jsx
function App() {
  const handleClick = () => console.log('Bubbled to App');
  return (
    <div onClick={handleClick}>
      <Modal isOpen={true}>
        <button>Click me</button> {/* click bubbles to App in React */}
      </Modal>
    </div>
  );
}
```

## What are error boundaries, and what errors do they not catch?

**Error boundaries** (class components) catch render, lifecycle, and constructor errors in child trees and show fallback UI. They do **not** catch event handler errors (use `try/catch`), async errors (`setTimeout`, promises), SSR errors, or errors in the boundary itself. Place around routes, lazy chunks, and third-party widgets.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Router />
    </ErrorBoundary>
  );
}
```

## How do `forwardRef` and `useImperativeHandle` work together?

Function components don't accept refs by default. **`forwardRef`** passes a ref to a DOM child; **`useImperativeHandle`** exposes a custom imperative API instead of the raw DOM node. Prefer declarative props when possible; use for focus, media controls, and non-React library integration. React 19 allows `ref` as a regular prop in some cases.

```jsx
const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

```jsx
const VideoPlayer = forwardRef(function VideoPlayer({ src }, ref) {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    play() {
      videoRef.current.play();
    },
    pause() {
      videoRef.current.pause();
    },
    getCurrentTime() {
      return videoRef.current.currentTime;
    },
  }), []);

  return <video ref={videoRef} src={src} />;
});

function Controls() {
  const playerRef = useRef(null);
  return (
    <>
      <VideoPlayer ref={playerRef} src="/clip.mp4" />
      <button onClick={() => playerRef.current.play()}>Play</button>
    </>
  );
}
```

## Explain the compound components pattern and its benefits.

**Compound components** share implicit state via Context. A parent manages state; named children (`Tabs.List`, `Tabs.Tab`, `Tabs.Panel`) consume it. Benefits: flexible layout, encapsulated ARIA wiring, readable JSX mirroring HTML structure. Used by Radix, Reach, and Headless UI.

```jsx
const TabsContext = createContext(null);

function Tabs({ defaultIndex = 0, children }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div role="tablist">{children}</div>;
}

function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeIndex === index}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanel({ index, children }) {
  const { activeIndex } = useContext(TabsContext);
  if (activeIndex !== index) return null;
  return <div role="tabpanel">{children}</div>;
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

// Usage
function App() {
  return (
    <Tabs defaultIndex={0}>
      <Tabs.List>
        <Tabs.Tab index={0}>Home</Tabs.Tab>
        <Tabs.Tab index={1}>Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel index={0}>Home content</Tabs.Panel>
      <Tabs.Panel index={1}>Settings content</Tabs.Panel>
    </Tabs>
  );
}
```

## How do you integrate controlled third-party libraries with React?

Third-party widgets (maps, editors, charts) own their DOM. Patterns: **uncontrolled** (init on mount, sync props in effects) or **controlled wrapper** (bridge library events to React state). Key rules: single source of truth, guard against double init, always cleanup, handle Strict Mode double-mount.

```jsx
function MapView({ center, zoom }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapRef.current = new ThirdPartyMap(containerRef.current, { center, zoom });
    return () => mapRef.current.destroy();
  }, []);

  useEffect(() => {
    mapRef.current?.setCenter(center);
    mapRef.current?.setZoom(zoom);
  }, [center, zoom]);

  return <div ref={containerRef} style={{ height: 400 }} />;
}
```

```jsx
function DatePicker({ value, onChange }) {
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    pickerRef.current = new Flatpickr(inputRef.current, {
      defaultDate: value,
      onChange: (dates) => onChange(dates[0]),
    });
    return () => pickerRef.current.destroy();
  }, []);

  useEffect(() => {
    if (value && pickerRef.current) {
      pickerRef.current.setDate(value, false);
    }
  }, [value]);

  return <input ref={inputRef} readOnly />;
}
```

## When should you use refs for DOM manipulation instead of state?

**Refs** hold mutable values across renders without re-rendering. Use for focus, DOM measurement, timers, and imperative library handles. Use **state** when the UI must reflect the value. Don't hide display data in refs — that causes stale UI.

```jsx
function SearchForm() {
  const inputRef = useRef(null);

  // Focus without re-render
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  // Measure DOM dimensions
  const measure = () => {
    const { width, height } = inputRef.current.getBoundingClientRect();
    console.log(width, height);
  };

  return <input ref={inputRef} onBlur={measure} />;
}
```

```jsx
function Timer() {
  const intervalRef = useRef(null);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const start = () => {
    intervalRef.current = setInterval(() => console.log('tick'), 1000);
  };

  const stop = () => clearInterval(intervalRef.current);

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

```jsx
function MeasuredList({ items }) {
  const heights = useRef(new Map());

  return items.map((item) => (
    <div
      key={item.id}
      ref={(node) => {
        if (node) heights.current.set(item.id, node.offsetHeight);
      }}
    >
      {item.label}
    </div>
  ));
}
```

## What are React Server Components, and how do they fit into React 19?

**RSC** run only on the server — they fetch data and access backend resources without shipping component JS to the browser. **Client Components** (`'use client'`) handle hooks, state, and interactivity. Server Components can render Client Components with serializable props. React 19 adds Actions (`useActionState`), improved streaming/Suspense, and framework-level RSC defaults (Next.js 15+). RSC complements SSR; it does not replace client hydration.

```jsx
// app/users/page.jsx — Server Component by default
async function UsersPage() {
  const users = await db.query('SELECT * FROM users');
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```jsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

```jsx
// Server Component
import { Counter } from './Counter';

async function Dashboard() {
  const stats = await fetchStats();
  return (
    <div>
      <h1>Revenue: {stats.revenue}</h1>
      <Counter initialCount={stats.visits} />
    </div>
  );
}
```
