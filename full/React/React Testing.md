# React Testing

## Questions Covered

1. What role does Jest play in a React testing stack?
2. What is the React Testing Library philosophy, and why does it matter?
3. How do you test components that fetch data?
4. How do you mock modules in Jest?
5. What is the difference between `user-event` and `fireEvent`?
6. How do you test custom hooks with `renderHook`?

## What role does Jest play in a React testing stack?

**Jest** is a JavaScript test runner and assertion library. In React projects it provides the infrastructure to discover tests, run them in parallel, mock dependencies, snapshot results, and report coverage — without requiring a browser for unit tests.

### Core Responsibilities

1. **Test runner** — finds `*.test.js` / `*.spec.js` files and executes them.
2. **Assertions** — `expect` API with matchers like `toBe`, `toEqual`, `toHaveBeenCalledWith`.
3. **Mocking** — `jest.fn()`, `jest.mock()`, `jest.spyOn()` for isolating units.
4. **Module transformation** — via `babel-jest` or `ts-jest` to compile JSX/TypeScript.
5. **Code coverage** — built-in Istanbul integration (`--coverage`).

### Typical React Stack

| Tool | Role |
|------|------|
| Jest | Runner, mocks, assertions |
| React Testing Library | Render components, query DOM |
| `@testing-library/jest-dom` | Custom matchers (`toBeInTheDocument`) |
| `@testing-library/user-event` | Realistic user interactions |
| MSW (optional) | Mock HTTP at the network layer |

### Basic Test Structure

```jsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Greeting from './Greeting';

describe('Greeting', () => {
  it('renders the name', () => {
    render(<Greeting name="Alice" />);
    expect(screen.getByText('Hello, Alice')).toBeInTheDocument();
  });
});
```

### Jest Configuration (excerpt)

```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
```

Jest does not render React itself — that is React Testing Library's job. Together they form the default testing foundation for Create React App, Vite (with plugin), and Next.js.

## What is the React Testing Library philosophy, and why does it matter?

React Testing Library (RTL) encourages testing components the way users interact with them — by **accessible roles, labels, and text** — rather than implementation details like internal state, class names, or component instances.

### Guiding Principles

1. **Test behavior, not implementation** — if you refactor internals without changing UX, tests should still pass.
2. **Query priority** — prefer queries that reflect accessibility:
   - `getByRole` (best)
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`
   - `getByTestId` (last resort)
3. **Avoid testing state directly** — assert what appears on screen after user actions.
4. **Async utilities** — use `findBy*` for elements that appear after async work; use `waitFor` for assertions on changing UI.

### Good vs Bad Queries

```jsx
// Good — mirrors how assistive tech and users find elements
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email address');

// Avoid — coupled to implementation
container.querySelector('.submit-btn');
component.state.isOpen;
```

### Example: Testing User Flow

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

test('shows error when submitting empty form', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
});
```

### Why It Matters in Interviews

Teams using RTL produce tests that survive refactors, catch real regressions, and encourage accessible markup. Mentioning query priority and "testing like a user" signals mature frontend testing practices.

## How do you test components that fetch data?

Components that fetch on mount require **mocking the data layer** and **waiting for async UI updates**. Never test the real API in unit tests.

### Approach 1: Mock `fetch` or the API Module

```jsx
import { render, screen, waitFor } from '@testing-library/react';
import UserList from './UserList';
import * as api from './api';

jest.mock('./api');

test('displays users after fetch', async () => {
  api.getUsers.mockResolvedValue([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);

  render(<UserList />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  expect(await screen.findByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
});
```

### Approach 2: MSW (Mock Service Worker)

Intercept network requests at the HTTP level for more realistic tests:

```jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'Alice' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads users from API', async () => {
  render(<UserList />);
  expect(await screen.findByText('Alice')).toBeInTheDocument();
});
```

### Testing Error and Loading States

```jsx
test('shows error message on fetch failure', async () => {
  api.getUsers.mockRejectedValue(new Error('Network error'));
  render(<UserList />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
});
```

### Key Practices

- Use `findBy*` or `waitFor` — never assert async content synchronously right after render.
- Reset mocks in `afterEach` to avoid test pollution.
- Test loading, success, and error paths separately.

## How do you mock modules in Jest?

Jest's module mocking replaces entire modules or specific exports so tests run in isolation without side effects from real implementations.

### Automatic Mock with `jest.mock`

```jsx
jest.mock('./analytics', () => ({
  trackEvent: jest.fn(),
}));

import { trackEvent } from './analytics';
import Checkout from './Checkout';

test('tracks purchase on submit', async () => {
  render(<Checkout />);
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));
  expect(trackEvent).toHaveBeenCalledWith('purchase', { amount: 99 });
});
```

### Partial Mock — `jest.requireActual`

```jsx
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  generateId: () => 'fixed-id',
}));
```

### Manual Mock File

Place `__mocks__/moduleName.js` next to `node_modules` or the module:

```js
// __mocks__/axios.js
module.exports = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
};
```

```jsx
jest.mock('axios');
```

### Spying on Existing Methods

```jsx
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  consoleSpy.mockRestore();
});
```

### Mocking ES Modules and Timers

```jsx
jest.useFakeTimers();

test('debounced search fires after delay', () => {
  render(<Search />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'react' } });
  jest.advanceTimersByTime(300);
  expect(mockSearch).toHaveBeenCalledWith('react');
});
```

**Important:** `jest.mock` calls are hoisted to the top of the file. Place them before imports or rely on hoisting behavior.

## What is the difference between `user-event` and `fireEvent`?

Both simulate DOM events, but they operate at different levels of fidelity.

### fireEvent — Low-Level Dispatch

`fireEvent` dispatches a single synthetic DOM event. It does not simulate the full sequence of events a real interaction produces.

```jsx
import { fireEvent, render, screen } from '@testing-library/react';

test('fireEvent click', () => {
  render(<button onClick={handleClick}>Click</button>);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

// Typing with fireEvent — must fire each event manually
fireEvent.change(input, { target: { value: 'hello' } });
```

### user-event — High-Level User Simulation

`@testing-library/user-event` simulates realistic user behavior: clicking focuses elements, typing fires `keydown`/`keypress`/`keyup`/`input`/`change` in order, and `pointer` events precede clicks.

```jsx
import userEvent from '@testing-library/user-event';

test('user-event types into input', async () => {
  const user = userEvent.setup();
  render(<input aria-label="Search" />);
  const input = screen.getByLabelText('Search');

  await user.type(input, 'react');
  expect(input).toHaveValue('react');
});

test('user-event clears and replaces text', async () => {
  const user = userEvent.setup();
  render(<input defaultValue="old" aria-label="Name" />);
  const input = screen.getByLabelText('Name');

  await user.clear(input);
  await user.type(input, 'new');
  expect(input).toHaveValue('new');
});
```

### Comparison

| | fireEvent | user-event |
|---|-----------|------------|
| Abstraction | Single DOM event | Full interaction sequence |
| Async | Synchronous | Async (`await`) |
| Realism | Low | High |
| Recommended for | Edge cases, legacy tests | Default for user interactions |

**Best practice:** use `userEvent.setup()` and `await user.click()` / `await user.type()` for all interaction tests. Reserve `fireEvent` for events `user-event` does not wrap or when you need precise low-level control.

## How do you test custom hooks with `renderHook`?

`renderHook` (from `@testing-library/react`) mounts a hook in a test harness component so you can assert return values and side effects without building a wrapper UI.

### Basic Usage

```jsx
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

test('increments count', () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);

  act(() => {
    result.current.increment();
  });

  expect(result.current.count).toBe(1);
});
```

### Hooks That Depend on Context

Wrap with a provider:

```jsx
import { AuthProvider } from './AuthContext';
import useAuth from './useAuth';

test('returns user from context', () => {
  const wrapper = ({ children }) => (
    <AuthProvider user={{ id: 1, name: 'Alice' }}>{children}</AuthProvider>
  );

  const { result } = renderHook(() => useAuth(), { wrapper });
  expect(result.current.user.name).toBe('Alice');
});
```

### Testing Effects and Async Hooks

```jsx
import { renderHook, waitFor } from '@testing-library/react';
import useFetch from './useFetch';

jest.mock('./api');

test('returns data after fetch', async () => {
  api.getData.mockResolvedValue({ title: 'Hello' });

  const { result } = renderHook(() => useFetch('/api/data'));

  expect(result.current.loading).toBe(true);

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.data.title).toBe('Hello');
});
```

### rerender and unmount

```jsx
test('reacts to prop changes', () => {
  const { result, rerender } = renderHook(
    ({ multiplier }) => useMultiplier(multiplier),
    { initialProps: { multiplier: 2 } }
  );

  expect(result.current.value).toBe(2);

  rerender({ multiplier: 5 });
  expect(result.current.value).toBe(5);
});
```

### When to Test Hooks Directly

- Complex reusable hooks with business logic.
- Hooks with edge cases hard to reach through components alone.

For simple hooks tightly coupled to one component, testing through the component with RTL is often sufficient and more representative of real usage.
