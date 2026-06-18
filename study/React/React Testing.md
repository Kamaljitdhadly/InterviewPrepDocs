# React Testing

## Questions Covered

1. What role does Jest play in a React testing stack?
2. What is the React Testing Library philosophy, and why does it matter?
3. How do you test components that fetch data?
4. How do you mock modules in Jest?
5. What is the difference between `user-event` and `fireEvent`?
6. How do you test custom hooks with `renderHook`?

## What role does Jest play in a React testing stack?

**Jest** is the test runner and assertion library: discovers tests, runs in parallel, provides `expect` matchers, mocks (`jest.fn`, `jest.mock`), transforms JSX via babel/ts-jest, and reports coverage. RTL renders components; Jest runs everything. Standard in CRA, Vite, and Next.js.

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

## What is the React Testing Library philosophy, and why does it matter?

RTL tests **behavior like a user** — query by accessible roles, labels, and text — not implementation details (state, class names, instances). Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`. Use `findBy*` for async UI. Tests survive refactors and encourage accessible markup.

```jsx
// Good — mirrors how assistive tech and users find elements
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email address');

// Avoid — coupled to implementation
container.querySelector('.submit-btn');
component.state.isOpen;
```

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

## How do you test components that fetch data?

Mock the data layer (module mock or MSW); never hit the real API in unit tests. Use `findBy*` or `waitFor` for async content. Test loading, success, and error paths separately. Reset mocks in `afterEach`.

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

```jsx
test('shows error message on fetch failure', async () => {
  api.getUsers.mockRejectedValue(new Error('Network error'));
  render(<UserList />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
});
```

## How do you mock modules in Jest?

`jest.mock` replaces modules (hoisted to file top). Use `jest.requireActual` for partial mocks, `__mocks__/` for manual mocks, `jest.spyOn` for spies, and `jest.useFakeTimers` for debounce/throttle tests.

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

```jsx
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  generateId: () => 'fixed-id',
}));
```

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

```jsx
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => {
  consoleSpy.mockRestore();
});
```

```jsx
jest.useFakeTimers();

test('debounced search fires after delay', () => {
  render(<Search />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'react' } });
  jest.advanceTimersByTime(300);
  expect(mockSearch).toHaveBeenCalledWith('react');
});
```

## What is the difference between `user-event` and `fireEvent`?

**fireEvent** dispatches a single synthetic DOM event (low-level, sync). **user-event** simulates full interaction sequences (focus, keydown/keyup, pointer events) — higher fidelity, async. Default to `userEvent.setup()` + `await user.click()` / `await user.type()`. Use fireEvent only for edge cases.

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

## How do you test custom hooks with `renderHook`?

`renderHook` from `@testing-library/react` mounts a hook in a test harness. Use `act` for state updates, a `wrapper` for Context providers, `waitFor` for async effects, and `rerender` for prop changes. Test complex reusable hooks directly; simple hooks can be tested through components.

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
