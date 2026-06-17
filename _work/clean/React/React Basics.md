# React Basics

## Questions Covered

1. What is React and how does it differ from Angular and Vue?
2. What is the Virtual DOM and how does React use it?
3. What is JSX and how does it work?
4. What are React components and how are they defined?
5. What is the difference between functional and class components?
6. What are props in React?
7. What is state in React?
8. What is the difference between props and state?
9. What is one-way data flow in React?
10. How does React rendering and reconciliation work?
11. What is the difference between React element and component?
12. What are keys in React lists and why are they important?
13. What are React fragments?
14. What is conditional rendering in React?
15. What is lifting state up?
16. What is composition vs inheritance in React?
17. How do you set up a new React project with Vite?
18. What is React Strict Mode?

## What is React and how does it differ from Angular and Vue?

**React** is an open-source JavaScript library (maintained by Meta) for building user interfaces. It focuses on the **view layer** — rendering UI from data — and leaves routing, global state, and HTTP to companion libraries or frameworks. React uses a **component-based** architecture where the UI is broken into reusable, composable pieces that describe what should appear on screen for a given state.

Unlike full frameworks, React does not prescribe a complete application structure. You choose your own router (React Router), state manager (Redux, Zustand, Context), and data-fetching approach. This flexibility is a core design choice.

### How React compares to Angular and Vue

| Aspect | React | Angular | Vue |
|--------|-------|---------|-----|
| **Type** | UI library | Full framework | Progressive framework |
| **Language** | JavaScript / JSX (TypeScript common) | TypeScript (default) | JavaScript / TypeScript |
| **Learning curve** | Moderate; ecosystem choices add complexity | Steeper; many built-in concepts | Gentler; single-file components |
| **Architecture** | Component + one-way data flow | Modules, components, services, DI | Components + reactivity system |
| **Templating** | JSX (JavaScript in markup) | HTML templates + directives | HTML templates + directives |
| **State management** | `useState`, Context, external libs | Services, RxJS, NgRx | `ref`, `reactive`, Pinia |
| **Change detection** | Reconciliation via Virtual DOM | Zone.js or Signals | Proxy-based reactivity |
| **Bundled features** | Minimal (routing, forms are separate) | Router, HTTP, forms, DI built in | Router, state, devtools built in |
| **Mobile** | React Native (separate ecosystem) | Ionic, NativeScript | NativeScript, Quasar |
| **Corporate backing** | Meta | Google | Independent (originally Evan You) |

### Key philosophical differences

**React** treats UI as a **function of state**: `UI = f(state)`. You declare what the UI should look like; React figures out how to update the DOM efficiently. It favors **composition** over inheritance and **unidirectional data flow**.

**Angular** is an opinionated, batteries-included framework. It provides dependency injection, two-way binding (`ngModel`), structural directives (`*ngIf`, `*ngFor`), and a module system out of the box. Angular apps tend to be more structured but require learning more framework-specific APIs.

**Vue** sits between the two: it offers a template syntax similar to Angular but with a gentler learning curve, and a fine-grained reactivity system that tracks dependencies automatically. Vue 3's Composition API (`setup`, `ref`) is conceptually close to React Hooks.

```jsx
// React: UI as a function of props/state
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

```javascript
// Vue 3 (Composition API) — similar mental model
// export default { setup() { return () => h('h1', `Hello, ${name}!`); } }
```

In interviews, emphasize that React is a **library for building UIs**, not a full application framework. Its ecosystem (Next.js, Remix, React Router) fills the gaps Angular and Vue cover natively.

## What is the Virtual DOM and how does React use it?

The **Virtual DOM (VDOM)** is a lightweight, in-memory representation of the real DOM. React keeps a virtual tree of UI elements (plain JavaScript objects) and uses it to determine the **minimum set of changes** needed to update the actual browser DOM.

### Why the Virtual DOM exists

Direct DOM manipulation is slow and error-prone. Reading layout properties, inserting nodes, and repainting cause **reflows** and **repaints**. When state changes frequently (forms, lists, animations), manually syncing the DOM is tedious. The Virtual DOM lets React batch and optimize updates.

### How React uses it

1. **Render phase** — React calls your component functions and builds a new Virtual DOM tree (a tree of React elements).
2. **Diffing (reconciliation)** — React compares the new tree with the previous one using a heuristic O(n) algorithm.
3. **Commit phase** — React applies only the identified differences (patches) to the real DOM.

```javascript
// Simplified Virtual DOM node (conceptual)
const virtualNode = {
  type: 'div',
  props: { className: 'container', children: 'Hello' },
};
```

```jsx
function Counter({ count }) {
  return (
    <div className="counter">
      <span>{count}</span>
    </div>
  );
}

// When count changes from 0 to 1, React:
// 1. Re-renders Counter → new virtual tree
// 2. Diffs old vs new → only the <span> text changed
// 3. Updates that single text node in the real DOM
```

### Virtual DOM vs direct DOM updates

| Approach | Pros | Cons |
|----------|------|------|
| **Virtual DOM (React)** | Declarative UI; batched, optimized updates; predictable | Memory overhead; diffing cost on every render |
| **Direct DOM** | Maximum control; no diff overhead | Imperative; hard to maintain; easy to miss updates |
| **Fine-grained reactivity (Vue, Solid)** | Updates only what changed; no full-tree diff | Different mental model; framework-specific |

### Important interview nuance

The Virtual DOM is **not always faster** than direct DOM manipulation or fine-grained reactivity. React's value is **developer experience and predictability** — you describe UI declaratively, and React handles efficient updates. React 18+ also uses **concurrent rendering** to prioritize urgent updates (typing) over non-urgent ones (data fetching).

## What is JSX and how does it work?

**JSX (JavaScript XML)** is a syntax extension that lets you write HTML-like markup inside JavaScript. It is **not** understood by browsers directly — a build tool (Babel, esbuild, SWC) transpiles JSX into `React.createElement()` calls (or the automatic JSX runtime in React 17+).

### JSX rules

- Return **one root element** (or use a Fragment).
- Use **camelCase** for DOM attributes (`className`, `htmlFor`, `onClick`).
- Embed JavaScript expressions inside **curly braces** `{}`.
- Close all tags, including self-closing ones (`<img />`).
- `if`, `for`, and `while` cannot be used directly in JSX — use expressions, ternaries, or map.

```jsx
const element = <h1 className="title">Hello, World!</h1>;

// Transpiles to (classic runtime):
// React.createElement('h1', { className: 'title' }, 'Hello, World!');

// React 17+ automatic runtime:
// import { jsx as _jsx } from 'react/jsx-runtime';
// const element = _jsx('h1', { className: 'title', children: 'Hello, World!' });
```

```jsx
function UserCard({ user }) {
  const greeting = `Welcome, ${user.name}`;

  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} />
      <h2>{greeting}</h2>
      {user.isAdmin && <span className="badge">Admin</span>}
    </div>
  );
}
```

### JSX vs templates

| Feature | JSX | Angular/Vue templates |
|---------|-----|----------------------|
| Logic location | Inline JavaScript | Template directives / expressions |
| Type safety | TypeScript checks props | Angular/Vue template type-checking |
| Flexibility | Full JS power in `{}` | Limited template syntax |
| Learning | Requires JS comfort | Familiar HTML + directives |

JSX is syntactic sugar over `React.createElement(type, props, ...children)`. Understanding this helps explain why component names must be **capitalized** (React treats lowercase tags as HTML elements) and why you cannot use reserved words like `class` (use `className`).

## What are React components and how are they defined?

A **React component** is a reusable piece of UI that accepts inputs (props) and returns a description of what to render (JSX or `React.createElement`). Components are the fundamental building blocks of React applications.

### Types of components

1. **Function components** — JavaScript functions that return JSX (modern standard).
2. **Class components** — ES6 classes extending `React.Component` (legacy, still supported).

### Defining a function component

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// Arrow function style
const Welcome = ({ name }) => <h1>Hello, {name}</h1>;

// Usage
<Welcome name="Alice" />
```

### Defining a class component

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Component composition

Components can render other components, forming a tree. The root component (typically `App`) is mounted into a DOM node:

```jsx
function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}

// Entry point (React 18+)
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### Naming conventions

- Component names must start with a **capital letter** (`UserList`, not `userList`).
- File names often match the component (`UserList.jsx`).
- One component per file is a common convention for maintainability.

Components encapsulate markup, behavior, and styling. They promote reuse — a `<Button>` used across an app ensures consistent UI and behavior.

## What is the difference between functional and class components?

Both functional and class components can render UI, manage state, and handle side effects. Since React 16.8 (Hooks), **function components are the recommended approach** for new code.

### Comparison

| Feature | Function Component | Class Component |
|---------|-------------------|-----------------|
| **Syntax** | Function returning JSX | Class extending `React.Component` |
| **State** | `useState`, `useReducer` hooks | `this.state` + `this.setState()` |
| **Lifecycle** | `useEffect` hook | `componentDidMount`, `componentDidUpdate`, etc. |
| **`this` binding** | Not needed | Required; easy to get wrong |
| **Boilerplate** | Minimal | More verbose |
| **Performance** | Slightly lighter | Slightly heavier (class instances) |
| **Future** | Primary API (Server Components, etc.) | Maintenance mode; no new features |

### Function component with Hooks

```jsx
import { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <p>Elapsed: {seconds}s</p>;
}
```

### Equivalent class component

```jsx
class Timer extends React.Component {
  state = { seconds: 0 };

  componentDidMount() {
    this.intervalId = setInterval(() => {
      this.setState((prev) => ({ seconds: prev.seconds + 1 }));
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  render() {
    return <p>Elapsed: {this.state.seconds}s</p>;
  }
}
```

### When class components still appear

- Legacy codebases not yet migrated to Hooks.
- Error boundaries (until React 19+, where function component error boundaries are supported).

For interviews: function components with Hooks replaced the need for classes in virtually all new React code. Hooks provide the same capabilities with less boilerplate and no `this` confusion.

## What are props in React?

**Props** (short for properties) are read-only inputs passed from a parent component to a child. They let components be configurable and reusable — the same `Button` can render different labels, colors, or click handlers depending on props.

### Key characteristics

- **Immutable from the child's perspective** — a child must never modify its own props.
- **Flow downward** — parent → child (one-way data flow).
- Can be any JavaScript value: strings, numbers, objects, arrays, functions, even other React elements.

```jsx
function Button({ label, variant = 'primary', onClick, disabled = false }) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function App() {
  const handleSave = () => console.log('Saved!');

  return (
    <Button
      label="Save"
      variant="success"
      onClick={handleSave}
    />
  );
}
```

### Passing different prop types

```jsx
function Profile({ user, children, renderBadge }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Age: {user.age}</p>
      {renderBadge && renderBadge(user)}
      {children}
    </div>
  );
}

// Usage
<Profile
  user={{ name: 'Bob', age: 30 }}
  renderBadge={(u) => <span>{u.age >= 18 ? 'Adult' : 'Minor'}</span>}
>
  <p>Additional content via children prop</p>
</Profile>
```

### Props vs attributes

In JSX, props map to component parameters, not always to DOM attributes. Spread props onto DOM elements carefully:

```jsx
function Input({ label, ...inputProps }) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}

<Input label="Email" type="email" placeholder="you@example.com" />
```

### PropTypes and TypeScript

Runtime validation with PropTypes (optional) or compile-time checks with TypeScript improve maintainability:

```jsx
import PropTypes from 'prop-types';

Button.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'danger']),
  onClick: PropTypes.func,
};
```

Props make components **pure and predictable**: given the same props, a component should render the same output.

## What is state in React?

**State** is data that belongs to a component and can change over time. When state updates, React re-renders the component (and typically its children) to reflect the new UI. State enables interactivity — form inputs, toggles, fetched data, and UI visibility all rely on state.

### `useState` hook (function components)

```jsx
import { useState } from 'react';

function LikeButton() {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setLiked(true);
    setCount((prev) => prev + 1);
  };

  return (
    <button onClick={handleClick}>
      {liked ? 'Liked' : 'Like'} ({count})
    </button>
  );
}
```

### State update rules

1. **Never mutate state directly** — always use the setter (`setCount`, `setState`).
2. **Updates may be batched** — multiple setters in one event handler may result in a single re-render (React 18 automatic batching).
3. **Functional updates** — when new state depends on previous state, pass a function: `setCount(prev => prev + 1)`.
4. **State is asynchronous** — reading state immediately after setting it may show the old value.

```jsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  const addTodo = (text) => {
    // Wrong: todos.push(text); setTodos(todos);
    // Right: create a new array
    setTodos((prev) => [...prev, { id: Date.now(), text }]);
  };

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

### Local vs global state

| Scope | Mechanism | Use case |
|-------|-----------|----------|
| **Local** | `useState`, `useReducer` | Form input, toggle, component-specific UI |
| **Shared** | Lifted state, Context, Redux/Zustand | Auth user, theme, cart across many components |
| **Server** | React Query, SWR, `useEffect` + fetch | Remote API data with caching |

State represents **data that changes** and drives what the user sees. Props represent **configuration from outside**.

## What is the difference between props and state?

Props and state are both plain JavaScript objects that influence rendering, but they serve different roles and follow different rules.

### Side-by-side comparison

| Aspect | Props | State |
|--------|-------|-------|
| **Source** | Passed by parent | Managed within the component |
| **Mutability** | Read-only for the receiving component | Mutable via setter functions |
| **Purpose** | Configure / customize a component | Track changing data over time |
| **Triggers re-render** | When parent re-renders with new props | When `setState` / setter is called |
| **Initial value** | Provided by parent | Defined in `useState(initial)` or constructor |
| **Direction** | Downward (parent → child) | Internal to component (or lifted up) |

```jsx
function TemperatureConverter({ unit }) {
  // `unit` is a prop — read-only, set by parent
  const [celsius, setCelsius] = useState(0);

  // `celsius` is state — owned and updated here
  const display =
    unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;

  return (
    <div>
      <input
        type="number"
        value={celsius}
        onChange={(e) => setCelsius(Number(e.target.value))}
      />
      <p>{display.toFixed(1)}°{unit}</p>
    </div>
  );
}

// Parent controls the unit prop
function App() {
  const [unit, setUnit] = useState('C');
  return (
    <>
      <button onClick={() => setUnit(unit === 'C' ? 'F' : 'C')}>
        Toggle unit
      </button>
      <TemperatureConverter unit={unit} />
    </>
  );
}
```

### Common interview mistakes to avoid

- **Don't put everything in state** — if a value can be derived from props or other state, compute it during render instead of storing it.
- **Don't copy props into state unnecessarily** — `useState(props.value)` creates a one-time snapshot; the state won't update when props change unless you add an effect or key.
- **Props down, events up** — child receives data via props and notifies parent of changes via callback props.

Understanding this distinction is foundational for designing React component hierarchies correctly.

## What is one-way data flow in React?

**One-way data flow** (unidirectional data flow) means data moves in a single direction: from parent components down to children via **props**. Children do not directly modify parent data; instead, they invoke **callback functions** passed as props to request changes.

### Why one-way flow matters

- **Predictability** — you can trace where data comes from and how it changes.
- **Easier debugging** — state changes happen in known locations (usually the component that owns the state).
- **Fewer side effects** — child components cannot silently mutate shared parent state.

```jsx
function Parent() {
  const [message, setMessage] = useState('Hello');

  return (
    <div>
      <p>Parent says: {message}</p>
      <Child
        message={message}
        onMessageChange={setMessage}
      />
    </div>
  );
}

function Child({ message, onMessageChange }) {
  return (
    <input
      value={message}
      onChange={(e) => onMessageChange(e.target.value)}
    />
  );
}
```

### Data flow diagram (conceptual)

```
[Parent State]
      ↓ props (data)
   [Child Component]
      ↑ callback props (events)
[Parent updates state]
      ↓ re-render with new props
   [Child reflects change]
```

### Contrast with two-way binding

Angular's `[(ngModel)]` and Vue's `v-model` provide two-way binding — the template and model stay in sync automatically. React achieves similar UX with explicit **controlled components**:

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

The input's `value` comes from state (down), and `onChange` updates state (up). This is still one-way flow at the architecture level — just with a tight parent-child loop for form controls.

### Context and global state

Even with Context or Redux, the principle holds: components **dispatch actions** or call setters; they don't mutate shared objects in place. Immutability preserves the one-way mental model.

## How does React rendering and reconciliation work?

**Rendering** is the process of calling component functions to produce a description of the UI (React elements). **Reconciliation** is React's algorithm for comparing the new element tree with the previous one and updating the DOM accordingly.

### The render-commit cycle

1. **Trigger** — state or props change, or parent re-renders.
2. **Render** — React calls components recursively, building a new element tree (pure, no DOM writes yet).
3. **Reconciliation** — React diffs the new tree against the previous fiber tree.
4. **Commit** — React applies DOM mutations, runs layout effects, and paints.

```jsx
function List({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}

// items changes → List re-renders → React diffs <ul> children
// Only changed <li> nodes are updated in the DOM
```

### Reconciliation heuristics

React's diff algorithm makes two assumptions for O(n) performance:

1. **Elements of different types** produce different trees — switching `<div>` to `<span>` tears down and rebuilds.
2. **Keys** identify stable children across renders — critical for lists (see keys section).

```jsx
// Different type → full subtree replacement
{loggedIn ? <Dashboard /> : <LoginPage />}

// Same type, different props → update in place
<Avatar size={loggedIn ? 'large' : 'small'} />
```

### Re-renders vs DOM updates

Not every re-render touches the DOM. React may re-run a component function but skip DOM changes if the output is identical. **`React.memo`** prevents re-renders when props are unchanged:

```jsx
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
  console.log('ExpensiveList rendered');
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

### React 18 concurrent features

- **Automatic batching** — multiple state updates in async code batch into one render.
- **Transitions** — mark updates as non-urgent with `useTransition`.
- **Suspense** — coordinate loading states for lazy components and data.

Understanding rendering vs reconciliation helps explain performance optimizations and why immutability and keys matter.

## What is the difference between React element and component?

These terms are often confused but refer to different concepts in React's architecture.

### React Element

A **React element** is a plain JavaScript object describing what you want to appear on screen. It is immutable and lightweight — the output of JSX or `createElement`.

```javascript
const element = {
  type: 'button',
  props: { className: 'btn', children: 'Click me' },
  key: null,
  ref: null,
};

// Created via JSX:
const element = <button className="btn">Click me</button>;
```

### React Component

A **component** is a function or class that **returns** React elements. Components encapsulate logic, state, and effects.

```jsx
// Component (function)
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

// Element referencing a component
const element = <Button onClick={handleClick}>Click me</Button>;
// type is the Button function, not the string 'button'
```

### Comparison table

| Aspect | React Element | React Component |
|--------|--------------|-----------------|
| **What it is** | Description of UI (object) | Function or class that produces elements |
| **Mutable** | Immutable | Has state/effects that change over time |
| **Created by** | JSX, `createElement` | Developer-defined |
| **`type` field** | String (`'div'`) or component reference | N/A (components create elements) |
| **Lifecycle** | None | Hooks / class lifecycle methods |

```jsx
// DOM element — type is a string
<div>Hello</div>

// Component element — type is a function
<Welcome name="Alice" />

// Element stored in a variable
const icons = {
  home: <HomeIcon />,
  settings: <SettingsIcon />,
};

function NavBar({ active }) {
  return <nav>{icons[active]}</nav>;
}
```

**Rule of thumb:** Components are the **recipes**; elements are the **instructions** React uses to build and update the DOM.

## What are keys in React lists and why are they important?

When rendering lists, each child needs a unique **`key`** prop so React can identify which items changed, were added, or removed during reconciliation.

### Without stable keys

Using array index as key can cause bugs when items are reordered, inserted, or deleted — React may reuse the wrong component instance and preserve stale state.

```jsx
// Avoid index as key when list can change order
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}
```

### With stable, unique keys

```jsx
function TodoList({ todos, onToggle }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => onToggle(todo.id)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

### What keys do during reconciliation

| Scenario | With correct keys | With index keys (reordered list) |
|----------|-------------------|----------------------------------|
| Item removed | React unmounts that item's DOM | May update wrong row's content |
| Item reordered | React moves DOM nodes efficiently | May keep wrong internal state |
| Item added | React inserts new node | Often works if only appending |

```jsx
// Keys must be unique among siblings, not globally
function App() {
  const [users, setUsers] = useState([
    { id: 'u1', name: 'Alice' },
    { id: 'u2', name: 'Bob' },
  ]);

  return (
    <section>
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </section>
  );
}
```

### Key rules

- Keys should be **stable** across renders (database IDs, UUIDs).
- Don't generate keys with `Math.random()` on each render.
- Keys are **not** passed as props to the component — use `id` prop if the child needs it.
- Keys only need to be unique **among siblings**, not the entire app.

Keys are a reconciliation hint, not a feature for your component logic — but they are essential for correct list behavior.

## What are React fragments?

A **Fragment** lets you group multiple children without adding an extra DOM node. This avoids invalid HTML (e.g., `<tr>` inside `<div>`) and unnecessary wrapper elements that affect CSS layout.

### Syntax options

```jsx
import { Fragment } from 'react';

function TableRow({ data }) {
  return (
    <Fragment>
      <td>{data.name}</td>
      <td>{data.score}</td>
    </Fragment>
  );
}

// Shorthand syntax (no import needed)
function TableRow({ data }) {
  return (
    <>
      <td>{data.name}</td>
      <td>{data.score}</td>
    </>
  );
}
```

### Fragment with key (list of fragments)

The shorthand `<>...</>` does not accept keys. When mapping fragments, use the explicit form:

```jsx
function Glossary({ terms }) {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>
          <dt>{term.word}</dt>
          <dd>{term.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

### Fragments vs wrapper divs

| Approach | Extra DOM node | Valid table markup | Key support |
|----------|---------------|---------------------|-------------|
| `<div>` wrapper | Yes | Can break (`tr` in `div`) | On wrapper |
| `<Fragment>` / `<>` | No | Preserves structure | Explicit `Fragment` only |

```jsx
function Columns() {
  return (
    <div className="row">
      <>
        <div className="col">Left</div>
        <div className="col">Right</div>
      </>
    </div>
  );
}
```

Fragments are invisible to the DOM — they exist only in the React element tree.

## What is conditional rendering in React?

**Conditional rendering** displays different UI based on state, props, or other conditions. Because JSX is JavaScript, you use standard JS patterns rather than template directives like `*ngIf`.

### Common patterns

**1. `if` / early return (outside JSX)**

```jsx
function Greeting({ isLoggedIn, username }) {
  if (!isLoggedIn) {
    return <p>Please sign in.</p>;
  }
  return <p>Welcome back, {username}!</p>;
}
```

**2. Ternary operator (inline)**

```jsx
function Status({ isOnline }) {
  return (
    <span className={isOnline ? 'online' : 'offline'}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
```

**3. Logical AND (`&&`)**

```jsx
function Notifications({ count }) {
  return (
    <div>
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}
```

**4. Variable assignment**

```jsx
function Toolbar({ mode }) {
  let button;
  if (mode === 'edit') {
    button = <EditButton />;
  } else if (mode === 'view') {
    button = <ViewButton />;
  } else {
    button = <DefaultButton />;
  }
  return <div className="toolbar">{button}</div>;
}
```

### Pattern comparison

| Pattern | Best for | Caution |
|---------|----------|---------|
| Early return | Entire component branches | Multiple exit points |
| Ternary | Two alternatives inline | Nesting hurts readability |
| `&&` | Show/hide single element | `count && <X />` fails when `count` is `0` |
| Switch / object map | Many variants | Slightly more boilerplate |

```jsx
// Safer && when value can be 0
{count > 0 && <span>{count}</span>}

// Object map for multiple conditions
const VIEWS = {
  loading: <Spinner />,
  error: <ErrorMessage />,
  success: <DataTable />,
};

function Content({ status }) {
  return VIEWS[status] ?? <EmptyState />;
}
```

Conditional rendering keeps UI declarative: describe what to show for each state, and React handles DOM updates.

## What is lifting state up?

**Lifting state up** means moving shared state from child components to their closest common ancestor. The parent owns the state and passes it down as props; children receive callback props to request updates.

### Problem: siblings need shared data

```jsx
// Before lifting — each child has its own temperature (wrong)
function CelsiusInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}

function FahrenheitInput() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

### Solution: lift state to parent

```jsx
function Calculator() {
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');

  const celsius = scale === 'f' ? ((temperature - 32) * 5) / 9 : temperature;
  const fahrenheit = scale === 'c' ? (temperature * 9) / 5 + 32 : temperature;

  return (
    <div>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={setTemperature}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={setTemperature}
      />
    </div>
  );
}

function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  return (
    <fieldset>
      <legend>Enter temperature in {scale === 'c' ? 'Celsius' : 'Fahrenheit'}:</legend>
      <input
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
}
```

### When to lift state

| Situation | Action |
|-----------|--------|
| Two siblings display/edit the same data | Lift to common parent |
| State only used in one component | Keep local |
| Many components need the same data | Consider Context or state library |
| Server data shared widely | React Query, SWR, or global store |

Lifting state preserves **single source of truth** — one component owns the data, others react to prop changes. This is the primary pattern for coordinating sibling components in React.

## What is composition vs inheritance in React?

React strongly favors **composition** (building complex UIs by nesting components and passing props/children) over **class inheritance** (extending base component classes). The React team has stated that inheritance is rarely the right model for UI reuse.

### Composition with `children`

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Card title="User Profile">
      <Avatar src="/user.jpg" />
      <p>Jane Doe</p>
      <button>Edit</button>
    </Card>
  );
}
```

### Specialization via props (not extends)

```jsx
function Dialog({ title, children, footer }) {
  return (
    <div className="dialog">
      <header>{title}</header>
      <main>{children}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Dialog
      title="Confirm"
      footer={
        <>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>OK</button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}
```

### Composition patterns

| Pattern | Mechanism | Example |
|---------|-----------|---------|
| **Containment** | `children` prop | Layout wrappers, cards |
| **Specialization** | Pass different props/elements | `ConfirmDialog` wraps `Dialog` |
| **Render props** | Pass a function as prop | `<DataFetcher render={data => ...} />` |
| **Hooks** | Share logic without UI hierarchy | `useAuth`, `useFetch` |

```jsx
// Render prop pattern
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return render(position);
}

// Usage
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

### Why not inheritance?

```jsx
// Avoid — fragile base class problem
class FancyButton extends Button {
  render() {
    return <button className="fancy">{super.render()}</button>;
  }
}
```

Inheritance couples components tightly, makes refactoring hard, and doesn't compose well (what if you need `FancyButton` AND `LoadingButton`?). Composition and hooks solve reuse flexibly without class hierarchies.

## How do you set up a new React project with Vite?

**Vite** is a fast build tool that provides instant dev server startup and optimized production builds. It is the recommended way to scaffold new React projects (replacing Create React App for most greenfield work).

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- npm, yarn, pnpm, or bun

### Create a new project

```bash
npm create vite@latest my-react-app -- --template react

# With TypeScript
npm create vite@latest my-react-app -- --template react-ts
```

### Interactive setup

```bash
npm create vite@latest
# Follow prompts: project name → React → JavaScript or TypeScript
```

### Project structure (default)

```
my-react-app/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── App.jsx          # Root component
│   ├── main.jsx         # Entry point
│   └── index.css
├── index.html           # HTML shell (Vite injects scripts here)
├── package.json
└── vite.config.js
```

### Entry point

```jsx
// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

```jsx
// src/App.jsx
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Vite + React</h1>
      <button onClick={() => setCount((c) => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;
```

### Common commands

```bash
cd my-react-app
npm install
npm run dev      # Start dev server (default http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

### Optional `vite.config.js` customization

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});
```

### Vite vs Create React App

| Feature | Vite | Create React App |
|---------|------|------------------|
| Dev server speed | Fast (native ESM) | Slower (webpack bundle) |
| Build tool | Rollup (prod) / esbuild | Webpack |
| Maintenance | Actively maintained | Deprecated / low activity |
| Config | `vite.config.js` — easy to extend | Eject required for full control |

For interviews: know the scaffold command, entry files (`main.jsx`, `App.jsx`), and that Vite uses native ES modules in development for near-instant HMR.

## What is React Strict Mode?

**`<StrictMode>`** is a development-only wrapper component that activates additional checks and warnings to help identify potential problems in your application. It renders no visible UI — it only affects its descendants.

### What Strict Mode checks

| Check | Purpose |
|-------|---------|
| **Unsafe lifecycle methods** | Warns about deprecated class lifecycle APIs |
| **Legacy string refs** | Encourages callback or `useRef` refs |
| **Unexpected side effects** | Double-invokes certain functions in dev to surface impure effects |
| **Deprecated APIs** | Flags `findDOMNode`, legacy context, etc. |
| **Missing keys** | Helps catch list rendering issues |

### Usage

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### Double rendering in development

In React 18 Strict Mode (development only), React intentionally **mounts, unmounts, and remounts** components to verify that effects clean up properly:

```jsx
function Example() {
  useEffect(() => {
    console.log('Effect mounted');
    return () => console.log('Effect cleaned up');
  }, []);

  // In Strict Mode dev: mount → cleanup → mount again
  // In production: mount once
  return <p>Hello</p>;
}
```

This is **not a bug** — it exposes missing cleanup in `useEffect` (subscriptions, timers, listeners) before they cause production leaks.

### Strict Mode does NOT

- Run in production builds (checks are stripped or no-op).
- Fix problems automatically — it only surfaces warnings.
- Affect performance in production.

### When to use it

Wrap your root app in Strict Mode during development (Vite template does this by default). Remove it only if a third-party library is incompatible and you accept the risk — prefer fixing or replacing the library.

Strict Mode is a **development aid** that reinforces React best practices: pure renders, proper effect cleanup, and modern APIs.
