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

**React** is an open-source JavaScript library (Meta) for building user interfaces. It handles the **view layer** only — routing, global state, and HTTP come from companion libraries. React uses a **component-based** architecture where reusable pieces describe UI for a given state.

React does not prescribe full app structure. You choose router (React Router), state (Redux, Zustand, Context), and data-fetching. Flexibility is intentional.

**Comparison:**

| Aspect | React | Angular | Vue |
|--------|-------|---------|-----|
| **Type** | UI library | Full framework | Progressive framework |
| **Language** | JavaScript / JSX (TypeScript common) | TypeScript (default) | JavaScript / TypeScript |
| **Learning curve** | Moderate; ecosystem adds complexity | Steeper; many built-in concepts | Gentler; single-file components |
| **Architecture** | Component + one-way data flow | Modules, components, services, DI | Components + reactivity system |
| **Templating** | JSX (JavaScript in markup) | HTML templates + directives | HTML templates + directives |
| **State management** | `useState`, Context, external libs | Services, RxJS, NgRx | `ref`, `reactive`, Pinia |
| **Change detection** | Reconciliation via Virtual DOM | Zone.js or Signals | Proxy-based reactivity |
| **Bundled features** | Minimal (routing, forms are separate) | Router, HTTP, forms, DI built in | Router, state, devtools built in |
| **Mobile** | React Native (separate ecosystem) | Ionic, NativeScript | NativeScript, Quasar |
| **Corporate backing** | Meta | Google | Independent (originally Evan You) |

**Key differences:** React treats UI as `UI = f(state)` — declarative, composition over inheritance, unidirectional flow. Angular is opinionated with DI, `ngModel`, and modules built in. Vue offers template syntax with fine-grained reactivity; Vue 3 Composition API mirrors React Hooks.

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

React is a **library for UIs**, not a full framework. Next.js, Remix, and React Router fill gaps Angular/Vue cover natively.

## What is the Virtual DOM and how does React use it?

The **Virtual DOM (VDOM)** is a lightweight in-memory tree of UI elements (plain JS objects). React uses it to compute the **minimum DOM changes** on each update.

**Why:** Direct DOM manipulation causes costly reflows/repaints. The VDOM lets React batch and optimize updates declaratively.

**How React uses it:**

1. **Render** — component functions produce a new virtual tree.
2. **Diff (reconciliation)** — compare new vs previous tree (O(n) heuristic).
3. **Commit** — apply patches to the real DOM.

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

| Approach | Pros | Cons |
|----------|------|------|
| **Virtual DOM (React)** | Declarative; batched updates; predictable | Memory overhead; diff cost each render |
| **Direct DOM** | Full control; no diff | Imperative; hard to maintain |
| **Fine-grained reactivity (Vue, Solid)** | Targeted updates; no full-tree diff | Different mental model |

**Interview nuance:** VDOM is not always fastest. React's value is DX and predictability. React 18+ **concurrent rendering** prioritizes urgent updates (typing) over non-urgent ones (fetching).

## What is JSX and how does it work?

**JSX** is a syntax extension for HTML-like markup in JavaScript. Browsers don't parse it — Babel/esbuild/SWC transpiles to `React.createElement()` (or automatic JSX runtime in React 17+).

**Rules:** one root (or Fragment); camelCase attributes (`className`, `onClick`); expressions in `{}`; close all tags; no `if`/`for` in JSX — use ternaries/map.

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

| Feature | JSX | Angular/Vue templates |
|---------|-----|----------------------|
| Logic | Inline JavaScript | Directives / expressions |
| Type safety | TypeScript on props | Template type-checking |
| Flexibility | Full JS in `{}` | Limited syntax |

JSX is sugar over `React.createElement`. Capitalized names = components; lowercase = HTML. Use `className`, not `class`.

## What are React components and how are they defined?

A **component** is a reusable UI unit accepting **props** and returning JSX (or `createElement`). Building blocks of React apps.

**Types:** function components (modern standard); class components extending `React.Component` (legacy).

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// Arrow function style
const Welcome = ({ name }) => <h1>Hello, {name}</h1>;

// Usage
<Welcome name="Alice" />
```

```jsx
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

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

**Conventions:** capitalized names (`UserList`); file names match component; one component per file is common.

## What is the difference between functional and class components?

Both render UI and manage state/effects. Since React 16.8 (Hooks), **function components are recommended** for new code.

| Feature | Function Component | Class Component |
|---------|-------------------|-----------------|
| **Syntax** | Function returning JSX | Class extending `React.Component` |
| **State** | `useState`, `useReducer` | `this.state` + `setState` |
| **Lifecycle** | `useEffect` | `componentDidMount`, etc. |
| **`this`** | Not needed | Required; error-prone |
| **Boilerplate** | Minimal | Verbose |
| **Future** | Primary API | Maintenance mode |

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

Classes remain in legacy code and error boundaries (until React 19+). Hooks replace classes with less boilerplate and no `this` issues.

## What are props in React?

**Props** are read-only inputs from parent to child. They configure reusable components.

- Immutable from child's perspective.
- Flow parent → child.
- Any JS value: strings, objects, functions, elements.

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

```jsx
import PropTypes from 'prop-types';

Button.propTypes = {
  label: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['primary', 'success', 'danger']),
  onClick: PropTypes.func,
};
```

Same props → same output. Props configure; they don't change from within the child.

## What is state in React?

**State** is mutable component-owned data. Updates trigger re-renders — forms, toggles, fetched data, visibility.

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

**Rules:** never mutate directly; use setter; batching in React 18; functional updates when depending on prior state; reads after set may be stale.

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

| Scope | Mechanism | Use case |
|-------|-----------|----------|
| **Local** | `useState`, `useReducer` | Form, toggle, component UI |
| **Shared** | Lifted state, Context, Redux | Auth, theme, cart |
| **Server** | React Query, SWR | Cached API data |

State changes over time; props configure from outside.

## What is the difference between props and state?

Both influence rendering but serve different roles.

| Aspect | Props | State |
|--------|-------|-------|
| **Source** | Parent | Component itself |
| **Mutability** | Read-only in child | Updated via setter |
| **Purpose** | Configure component | Track changing data |
| **Re-render** | Parent passes new props | Setter called |
| **Direction** | Down | Internal (or lifted) |

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

**Avoid:** storing derivable values in state; copying props to state without sync; mutating props. Pattern: **props down, events up**.

## What is one-way data flow in React?

Data flows **parent → child via props**. Children request changes through **callback props**, not direct parent mutation.

**Benefits:** predictable data paths, easier debugging, fewer hidden side effects.

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

```
[Parent State]
      ↓ props (data)
   [Child Component]
      ↑ callback props (events)
[Parent updates state]
      ↓ re-render with new props
   [Child reflects change]
```

Angular `[(ngModel)]` and Vue `v-model` are two-way at template level. React uses **controlled components** — still architecturally one-way:

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

Context/Redux preserve the model: dispatch setters, don't mutate shared objects in place.

## How does React rendering and reconciliation work?

**Rendering** calls components to build an element tree. **Reconciliation** diffs trees and patches the DOM.

1. **Trigger** — state/props change or parent re-renders.
2. **Render** — pure tree construction (no DOM writes).
3. **Reconcile** — diff against fiber tree.
4. **Commit** — DOM mutations, effects, paint.

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

**Heuristics:** different element types → new subtree; **keys** stabilize list children.

```jsx
// Different type → full subtree replacement
{loggedIn ? <Dashboard /> : <LoginPage />}

// Same type, different props → update in place
<Avatar size={loggedIn ? 'large' : 'small'} />
```

Re-render ≠ DOM update. **`React.memo`** skips render when props unchanged:

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

React 18: automatic batching, `useTransition`, Suspense for lazy/data loading.

## What is the difference between React element and component?

Often confused — different layers of React's model.

**Element:** immutable plain object describing UI (JSX/`createElement` output).

**Component:** function or class that **returns** elements; holds logic, state, effects.

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

```jsx
// Component (function)
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

// Element referencing a component
const element = <Button onClick={handleClick}>Click me</Button>;
// type is the Button function, not the string 'button'
```

| Aspect | Element | Component |
|--------|---------|-----------|
| **What** | UI description (object) | Producer of elements |
| **Mutable** | Immutable | Has state/effects |
| **`type`** | `'div'` or component ref | N/A |

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

Components are **recipes**; elements are **instructions** for the DOM.

## What are keys in React lists and why are they important?

Lists need unique **`key`** props so React tracks insertions, deletions, and reordering.

Index keys break when order changes — wrong instances keep stale state.

```jsx
// Avoid index as key when list can change order
{items.map((item, index) => (
  <li key={index}>{item.name}</li>
))}
```

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

| Scenario | Correct keys | Index keys (reordered) |
|----------|--------------|------------------------|
| Removed | Unmounts correct node | Wrong row content |
| Reordered | Efficient move | Stale internal state |
| Added | Inserts new node | OK if append-only |

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

**Rules:** stable IDs; no `Math.random()` per render; keys aren't props — pass `id` separately; unique among siblings only.

## What are React fragments?

**Fragments** group children without an extra DOM node — avoids invalid HTML and layout wrappers.

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

Shorthand `<>` can't take keys; use explicit `Fragment` when mapping:

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

| Approach | Extra DOM | Valid tables | Keys |
|----------|-----------|--------------|------|
| `<div>` | Yes | Can break | On wrapper |
| `Fragment` / `<>` | No | Preserves structure | Explicit only |

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

Fragments exist only in the React tree, not the DOM.

## What is conditional rendering in React?

Show different UI based on state/props using JS patterns (not `*ngIf`).

**Early return:**

```jsx
function Greeting({ isLoggedIn, username }) {
  if (!isLoggedIn) {
    return <p>Please sign in.</p>;
  }
  return <p>Welcome back, {username}!</p>;
}
```

**Ternary:**

```jsx
function Status({ isOnline }) {
  return (
    <span className={isOnline ? 'online' : 'offline'}>
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
}
```

**Logical AND:**

```jsx
function Notifications({ count }) {
  return (
    <div>
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}
```

**Variable assignment:**

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

| Pattern | Best for | Caution |
|---------|----------|---------|
| Early return | Whole-component branch | Multiple exits |
| Ternary | Two options inline | Deep nesting |
| `&&` | Show/hide | `0 && <X />` renders `0` |
| Object map | Many variants | More boilerplate |

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

## What is lifting state up?

Move shared state to the **closest common ancestor**. Parent owns state; children get props + callbacks.

**Problem — isolated sibling state:**

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

**Solution — parent owns state:**

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

| Situation | Action |
|-----------|--------|
| Siblings share data | Lift to parent |
| Single-component use | Keep local |
| App-wide data | Context or store |
| Server data | React Query / SWR |

Single source of truth — primary pattern for sibling coordination.

## What is composition vs inheritance in React?

React favors **composition** (nesting + props/children) over **class inheritance**. Inheritance is rarely right for UI reuse.

**`children` containment:**

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

**Specialization via props:**

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

| Pattern | Mechanism | Example |
|---------|-----------|---------|
| **Containment** | `children` | Cards, layouts |
| **Specialization** | Different props | `ConfirmDialog` |
| **Render props** | Function prop | `<DataFetcher render={...} />` |
| **Hooks** | Logic without hierarchy | `useAuth` |

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

**Avoid inheritance** — fragile base classes, poor multi-behavior composition. Hooks + composition replace class hierarchies.

```jsx
// Avoid — fragile base class problem
class FancyButton extends Button {
  render() {
    return <button className="fancy">{super.render()}</button>;
  }
}
```

## How do you set up a new React project with Vite?

**Vite** provides fast dev server and optimized builds — preferred over CRA for new projects.

**Prerequisites:** Node.js 18+; npm/yarn/pnpm/bun.

```bash
npm create vite@latest my-react-app -- --template react

# With TypeScript
npm create vite@latest my-react-app -- --template react-ts
```

```bash
npm create vite@latest
# Follow prompts: project name → React → JavaScript or TypeScript
```

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

```bash
cd my-react-app
npm install
npm run dev      # Start dev server (default http://localhost:5173)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

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

| Feature | Vite | Create React App |
|---------|------|------------------|
| Dev speed | Fast (native ESM) | Slower (webpack) |
| Build | Rollup / esbuild | Webpack |
| Maintenance | Active | Deprecated |
| Config | `vite.config.js` | Eject for control |

Know: scaffold command, `main.jsx`/`App.jsx`, native ESM + HMR in dev.

## What is React Strict Mode?

**`<StrictMode>`** is a dev-only wrapper activating extra checks on descendants. Renders no visible UI.

| Check | Purpose |
|-------|---------|
| Unsafe lifecycles | Warn deprecated class APIs |
| Legacy string refs | Push `useRef` / callback refs |
| Side effects | Double-invoke in dev for impure effects |
| Deprecated APIs | `findDOMNode`, legacy context |
| Missing keys | Catch list issues |

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

React 18 dev **mount → unmount → remount** to verify effect cleanup:

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

Not a bug — exposes missing cleanup before production leaks.

**Strict Mode does NOT:** run checks in production; auto-fix issues; affect prod performance.

Wrap root in dev (Vite default). Remove only for incompatible third-party libs.

Development aid for pure renders, effect cleanup, and modern APIs.

---

## Related Topics

- **React Hooks** (`React/`)
- **TypeScript Basics** (`TypeScript/`)
