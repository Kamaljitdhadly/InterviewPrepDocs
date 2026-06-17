# React Routing

## Questions Covered

1. What is the purpose of React Router?
2. How do you define routes in React Router?
3. How do nested routes work in React Router?
4. How do route params and useParams work?
5. How do you implement protected routes / route guards?
6. How do you lazy load routes with React.lazy and Suspense?

## What is the purpose of React Router?

React Router is the standard routing library for React SPAs. It synchronizes the UI with the URL so users can bookmark, share, and navigate with the browser back/forward buttons without full page reloads.

**Key responsibilities:**

- **Declarative routing** — map URL paths to components.
- **Client-side navigation** — update the view without requesting a new HTML document.
- **Nested layouts** — render parent/child route hierarchies.
- **Dynamic segments** — read values like `:id` from the URL.
- **Guards and redirects** — protect routes and handle unknown paths.

React Router v6+ uses a data-router API (`createBrowserRouter`, `RouterProvider`) or component-based routing (`BrowserRouter`, `Routes`, `Route`). Both approaches keep URL and component tree in sync.

```jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## How do you define routes in React Router?

Routes are declared with `Routes` and `Route` components (or via `createBrowserRouter`). Each `Route` pairs a `path` with an `element` to render when the URL matches.

**Common patterns:**

- **Index route** — default child at a parent path (`index` prop or `path=""`).
- **Catch-all / 404** — `path="*"` for unmatched URLs.
- **Redirects** — `<Navigate to="/login" replace />` as the route element.
- **Programmatic navigation** — `useNavigate()` hook.

```jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import NotFound from './NotFound';

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/old-home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
```

**Data router alternative** — define routes as a configuration object:

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';
import About from './About';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
]);

function App() {
  return <RouterProvider router={router} />;
}
```

## How do nested routes work in React Router?

Nested routes let a parent component render a shared layout while child routes fill a nested `<Outlet />`. The parent `Route` wraps child `Route` elements; child paths are relative to the parent unless they start with `/`.

**Steps:**

1. Nest `Route` components inside a parent `Route`.
2. Render `<Outlet />` in the parent layout where children appear.
3. Use relative `Link` paths (`to="settings"`) or absolute paths (`to="/dashboard/settings"`).

```jsx
import { Routes, Route, Link, Outlet } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div>
      <h1>Dashboard</h1>
      <nav>
        <Link to="profile">Profile</Link>
        <Link to="settings">Settings</Link>
      </nav>
      <Outlet />
    </div>
  );
}

function Profile() {
  return <h2>Profile</h2>;
}

function Settings() {
  return <h2>Settings</h2>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Profile />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

The URL `/dashboard/settings` renders `DashboardLayout` with `Settings` inside `<Outlet />`. An index route renders at `/dashboard` without an extra path segment.

## How do route params and useParams work?

Dynamic URL segments use a `:` prefix in the path (e.g. `:id`, `:slug`). React Router exposes matched values through the `useParams` hook.

**Interview points:**

- Params are always strings — coerce to numbers when needed.
- Optional params can use `?` in some setups; v6 commonly uses separate routes or search params for optional values.
- `useSearchParams` reads query strings (`?page=2`).

```jsx
import { Routes, Route, Link, useParams, useSearchParams } from 'react-router-dom';

function UserList() {
  return (
    <ul>
      <li><Link to="/users/1">User 1</Link></li>
      <li><Link to="/users/2">User 2</Link></li>
    </ul>
  );
}

function UserDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'overview';

  return (
    <div>
      <h2>User {id}</h2>
      <p>Active tab: {tab}</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/users" element={<UserList />} />
      <Route path="/users/:id" element={<UserDetail />} />
    </Routes>
  );
}
```

For programmatic access outside components, route loaders (data router) or `useMatch` can read the current pattern.

## How do you implement protected routes / route guards?

Protected routes restrict access based on auth state (logged in, role, permissions). In React Router v6, wrap the guarded element in a component that checks auth and redirects unauthenticated users.

**Common approaches:**

- **Wrapper component** — render children or `<Navigate to="/login" />`.
- **Layout route** — guard an entire branch of nested routes.
- **Loader guards** (data router) — redirect in `loader` before render.

```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function useAuth() {
  // Replace with real auth context / token check
  const user = JSON.parse(localStorage.getItem('user'));
  return { user, isAuthenticated: Boolean(user) };
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ?? <Outlet />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user?.roles?.includes('admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage in route config
// <Route element={<ProtectedRoute />}>
//   <Route path="/dashboard" element={<Dashboard />} />
// </Route>
// <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminPanel /></AdminRoute></ProtectedRoute>} />
```

After login, read `location.state.from` to redirect back to the originally requested page.

## How do you lazy load routes with React.lazy and Suspense?

Code-splitting routes reduces initial bundle size by loading route components only when navigated to. Combine `React.lazy` (dynamic `import()`) with `<Suspense>` for a loading fallback.

**Best practices:**

- Lazy-load at the route level, not every small component.
- Provide a meaningful fallback (spinner, skeleton).
- Handle errors with an error boundary around `Suspense`.
- Works with both component and data router patterns.

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function PageLoader() {
  return <p>Loading page...</p>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
```

With `createBrowserRouter`, lazy components work the same way — wrap `RouterProvider` (or individual routes) in `Suspense`. Some teams colocate lazy imports in a `routes.jsx` file for clarity.
