# React Routing

## Questions Covered

1. What is the purpose of React Router?
2. How do you define routes in React Router?
3. How do nested routes work in React Router?
4. How do route params and useParams work?
5. How do you implement protected routes / route guards?
6. How do you lazy load routes with React.lazy and Suspense?

## What is the purpose of React Router?

React Router syncs UI with the URL in React SPAs — bookmarkable paths, browser back/forward, and client-side navigation without full page reloads. It maps paths to components, supports nested layouts, dynamic segments, guards, and redirects. v6+ offers component routing (`BrowserRouter`, `Routes`, `Route`) or data routing (`createBrowserRouter`, `RouterProvider`).

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

Declare routes with `Routes` / `Route` (or `createBrowserRouter`). Each route pairs `path` with `element`. Use index routes for defaults, `path="*"` for 404s, `<Navigate>` for redirects, and `useNavigate()` for programmatic navigation.

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

Nest `Route` inside a parent route; the parent layout renders `<Outlet />` where child routes appear. Child paths are relative to the parent unless prefixed with `/`.

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

`/dashboard/settings` renders `DashboardLayout` + `Settings` in the outlet; the index route handles `/dashboard`.

## How do route params and useParams work?

Dynamic segments use `:name` in the path. `useParams()` returns matched values (always strings). Use `useSearchParams` for query strings.

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

## How do you implement protected routes / route guards?

Wrap guarded content in a component that checks auth and returns `<Navigate to="/login" />` when unauthorized. Use layout routes to guard entire branches; data-router `loader` functions can redirect before render.

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

After login, redirect to `location.state.from` to restore the original destination.

## How do you lazy load routes with React.lazy and Suspense?

Use `React.lazy(() => import('./Page'))` for route-level code splitting; wrap routes in `<Suspense fallback={...}>`. Pair with error boundaries for failed chunk loads.

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
