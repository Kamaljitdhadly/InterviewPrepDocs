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

A **Higher-Order Component (HOC)** is a function that takes a component and returns a new component with additional props or behavior. HOCs are a pattern for reusing component logic — they do not modify the original component; they wrap it.

### How HOCs Work

An HOC is a pure function: `(WrappedComponent) => EnhancedComponent`. The wrapper can inject props, subscribe to stores, or gate rendering based on authentication.

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

### When to Use HOCs

- **Cross-cutting concerns** — authentication, logging, analytics, or theme injection shared across many components.
- **Legacy codebases** — class components and older libraries still rely on HOC patterns.
- **Prop injection** — when you need to pass data or callbacks without every parent manually forwarding them.

### Drawbacks and Modern Alternatives

- **Wrapper hell** — nesting multiple HOCs makes the component tree hard to debug and DevTools harder to read.
- **Prop collisions** — injected prop names can clash with the wrapped component's own props.
- **Refs don't pass through** — you need `React.forwardRef` inside the HOC to forward refs correctly.

**Modern preference:** custom hooks (`useAuth`, `useTheme`) replace most HOC use cases with less nesting and clearer data flow. HOCs remain valid for library APIs and legacy integration.

## Explain the render props pattern and how it differs from HOCs.

The **render props** pattern shares code by passing a function as a prop (often named `render` or `children`) that receives data and returns JSX. The parent component owns the logic; the consumer decides how to render.

### Basic Example

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

### Children as a Function

Using `children` as a function is the same pattern with cleaner JSX:

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

### HOC vs Render Props

| Aspect | HOC | Render Props |
|--------|-----|--------------|
| Reuse mechanism | Wraps component | Function prop / children |
| Flexibility | Fixed wrapper structure | Consumer controls layout |
| Composition | Nesting wrappers | Inline composition |
| DevTools | Extra wrapper nodes | Fewer wrapper nodes |

Both solve logic reuse. **Custom hooks** are now the default for new code, but render props remain useful when the consumer needs full control over rendering (e.g., headless UI libraries).

## What are React portals, and what problems do they solve?

A **portal** renders children into a DOM node that exists outside the parent component's DOM hierarchy. React still treats portal content as a child for event bubbling and context, but the DOM placement is elsewhere — typically `document.body`.

### Creating a Portal

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

### Problems Portals Solve

1. **CSS overflow and z-index** — modals, tooltips, and dropdowns inside containers with `overflow: hidden` get clipped. Portals escape that stacking context.
2. **Semantic DOM structure** — overlays at the end of `<body>` match accessibility expectations and avoid invalid nesting (e.g., `<div>` inside `<p>`).
3. **Focus management** — pairing portals with focus traps (e.g., `focus-trap-react`) keeps keyboard navigation inside modals.

### Event Bubbling

Events from portal content bubble through the **React tree**, not the DOM tree. A click inside a portal still triggers handlers on React ancestors of the component that created the portal.

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

An **error boundary** is a class component (or a library wrapper) that catches JavaScript errors in its child tree during rendering, in lifecycle methods, and in constructors. It displays a fallback UI instead of crashing the whole app.

### Implementing an Error Boundary

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

### What Error Boundaries Catch

- Errors during **render**
- Errors in **lifecycle methods** (class components)
- Errors in **constructors** of child components

### What They Do NOT Catch

- Errors in **event handlers** — use `try/catch` inside the handler.
- Errors in **async code** — `setTimeout`, promises, `fetch` callbacks need their own handling.
- Errors during **server-side rendering** (unless using a framework boundary).
- Errors thrown in the **error boundary itself**.

Place boundaries around route segments, lazy-loaded chunks, and third-party widgets so one failure does not take down the entire application.

## How do `forwardRef` and `useImperativeHandle` work together?

By default, **refs** on function components do not work — refs attach to DOM nodes or class instances. `forwardRef` lets a component receive a ref from its parent and pass it to a child DOM element or expose a custom imperative API via `useImperativeHandle`.

### forwardRef — Passing Refs Through

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

### useImperativeHandle — Custom Imperative API

When you should not expose the entire DOM node, `useImperativeHandle` defines what the parent can call:

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

### Interview Talking Points

- Prefer **declarative props** over imperative handles when possible — they are easier to test and reason about.
- Use imperative handles for **focus management**, media controls, animations, or integrating non-React libraries.
- In React 19, `ref` can be passed as a regular prop on function components, reducing the need for `forwardRef` in some cases.

## Explain the compound components pattern and its benefits.

**Compound components** are a set of components that work together to share implicit state. The parent manages state; children consume it via Context without prop drilling. Users compose flexible UIs from named subcomponents.

### Example: Tabs

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

### Benefits

- **Flexible layout** — consumers reorder or style subcomponents without changing the API.
- **Encapsulation** — internal state and ARIA wiring stay inside the compound set.
- **Readable JSX** — mirrors HTML structure (`<select>` / `<option>`).

Libraries like Radix UI, Reach UI, and Headless UI popularized this pattern for accessible, composable primitives.

## How do you integrate controlled third-party libraries with React?

Many third-party widgets (maps, rich text editors, chart libraries) manage their own DOM and internal state. React integration requires deciding between **fully controlled**, **fully uncontrolled**, or **hybrid** patterns.

### Uncontrolled with Refs and useEffect

Initialize the library once on mount; clean up on unmount:

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

### Controlled Wrapper Pattern

Bridge imperative APIs to React state with event listeners:

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

### Key Principles

1. **Single source of truth** — React state drives the UI when possible; sync library state in `useEffect` when props change.
2. **Avoid double initialization** — guard effects so the library is not recreated on every render.
3. **Cleanup** — always destroy instances, remove listeners, and cancel animations in effect cleanup.
4. **Strict Mode** — React 18 Strict Mode double-mounts in development; ensure init/cleanup is idempotent.

## When should you use refs for DOM manipulation instead of state?

**Refs** provide mutable references to DOM nodes or arbitrary values that persist across renders without triggering re-renders. Use refs when you need imperative DOM access; use **state** when the UI must reflect a value.

### Appropriate Ref Use Cases

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

### Storing Non-UI Values in Refs

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

### When NOT to Use Refs

- **Displaying data** — if a value should appear in JSX, use state.
- **Deriving UI from user input** — controlled inputs (`value` + `onChange`) are the React way.
- **Replacing state to avoid re-renders** — hiding state in refs can cause stale UI bugs.

### Ref Callbacks

For dynamic lists or measuring after layout:

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

**React Server Components (RSC)** run only on the server. They can fetch data, access backend resources, and render to a serializable format sent to the client — without shipping their JavaScript to the browser.

### Server vs Client Components

| | Server Component | Client Component |
|---|----------------|------------------|
| Runs on | Server only | Server (SSR) + browser |
| JavaScript shipped | No | Yes |
| Can use hooks | No | Yes |
| Can use `useState`, effects | No | Yes |
| Can access DB / filesystem | Yes | No (directly) |

### Server Component Example (Next.js App Router)

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

### Client Component Boundary

Add `'use client'` at the top of files that need interactivity:

```jsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

### Composition Pattern

Server Components can import and render Client Components, passing serializable props:

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

### React 19 Highlights

- **Actions** — `useActionState` and form actions simplify server mutations with pending states.
- **Improved streaming** — partial rendering and Suspense boundaries deliver HTML incrementally.
- **RSC as default in frameworks** — Next.js 15+, and the React team continues refining the server/client split.
- **Not a replacement for SSR** — RSC complements SSR; client components still hydrate for interactivity.

**Interview summary:** RSC reduces bundle size and keeps data fetching on the server. Client Components handle interactivity. The boundary is explicit (`'use client'`) and framework-dependent.
