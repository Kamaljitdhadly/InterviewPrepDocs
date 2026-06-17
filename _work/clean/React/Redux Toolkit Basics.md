# Redux Toolkit Basics

## Questions Covered

1. What is Redux and why use Redux Toolkit over plain Redux?
2. What are the core pieces of a Redux Toolkit store?
3. How do you create a slice with createSlice?
4. What is immer and how does RTK use it?
5. How do you connect React components with useSelector and useDispatch?
6. What is configureStore and what does it provide?
7. How do you organize Redux Toolkit in a medium-sized app?

## What is Redux and why use Redux Toolkit over plain Redux?

**Redux** is a predictable state container for JavaScript apps. It enforces a unidirectional data flow: components dispatch **actions**, **reducers** compute the next state immutably, and components read state via **selectors**. The store is a single source of truth, which makes complex apps easier to reason about, test, and debug (especially with Redux DevTools).

**Plain Redux** requires a lot of boilerplate: manually writing action types and creators, switch-based reducers, immutable update patterns with spread syntax, and manual store setup (middleware, DevTools enhancer, combining reducers).

**Redux Toolkit (RTK)** is the official, opinionated way to write Redux. It wraps best practices into APIs that reduce boilerplate and common mistakes:

| Plain Redux pain | RTK solution |
|------------------|--------------|
| Verbose action/reducer setup | `createSlice` generates actions and reducers |
| Accidental mutations | Immer built into reducers |
| Manual store wiring | `configureStore` with defaults (thunk, DevTools, immutability checks) |
| Async boilerplate | `createAsyncThunk`, RTK Query |
| Inconsistent patterns | Official recommended structure |

**When to use Redux / RTK:** shared state across many features, complex update logic, need for predictable updates and DevTools time-travel, or server cache management (RTK Query). For simple local UI state, prefer `useState`; for light global reads, Context may suffice.

```typescript
// Plain Redux (verbose)
const INCREMENT = 'counter/increment';
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { ...state, value: state.value + 1 };
    default:
      return state;
  }
}

// Redux Toolkit (concise)
import { createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
  },
});
```

## What are the core pieces of a Redux Toolkit store?

A Redux Toolkit store is built from a few cooperating pieces:

1. **State** — a plain JavaScript object (often split into feature slices) representing the app at a point in time.
2. **Actions** — plain objects `{ type, payload? }` describing *what happened*. RTK's `createSlice` auto-generates action creators.
3. **Reducers** — pure functions `(state, action) => newState` that define how each action updates state. Combined into a root reducer.
4. **Store** — holds state, exposes `dispatch`, `getState`, and `subscribe`. Created with `configureStore`.
5. **Dispatch** — the only way to trigger state changes: `store.dispatch(action)`.
6. **Selectors** — functions that read and derive data from state, often memoized with `createSelector`.
7. **Middleware** — intercepts actions before they reach reducers (thunks, logging, listeners). RTK includes `redux-thunk` by default.

**Data flow:** UI event → `dispatch(action)` → middleware (e.g., thunk runs async work) → reducers → new state → selectors → UI re-renders.

```typescript
import { configureStore, createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: { items: [] as { id: string; text: string }[] },
  reducers: {
    added: (state, action: { payload: string }) => {
      state.items.push({ id: crypto.randomUUID(), text: action.payload });
    },
  },
});

export const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
});

// Types inferred from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Dispatch an action
store.dispatch(todosSlice.actions.added('Learn RTK'));
```

## How do you create a slice with createSlice?

`createSlice` is RTK's primary API for defining a feature's state and reducers. You pass a **name** (used as an action prefix), **initialState**, and a **reducers** object of functions that receive the current state and an action (with `payload`).

RTK automatically:

- Generates action creators (e.g., `counterSlice.actions.increment()`).
- Generates action types (e.g., `'counter/increment'`).
- Wraps reducers with Immer so you can write "mutating" logic safely.
- Returns `{ name, reducer, actions }` for use in the store and components.

Use **reducers** for synchronous state updates tied to the slice. Use **extraReducers** for handling actions from other slices or async thunks.

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((i) => i.id === action.payload);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ id: action.payload, qty: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
```

## What is immer and how does RTK use it?

**Immer** is a library that lets you write code that *looks* like it mutates state while actually producing an immutable copy under the hood. It uses a **Proxy** to track drafts; when the reducer finishes, Immer returns a new frozen state object (or the original reference if nothing changed).

**How RTK uses Immer:**

- Every reducer function inside `createSlice` (and `createReducer`) runs inside an Immer **produce** call.
- You can write `state.items.push(x)` or `state.user.name = 'Ada'` instead of spread-heavy immutable updates.
- Returning a value from the reducer **replaces** the entire state (useful for resets).
- Not returning anything keeps the Immer draft as the new state.

**Rules to remember in interviews:**

- Only "mutate" the `state` parameter inside reducers — never mutate state outside reducers.
- Immer only supports plain objects, arrays, `Map`, and `Set` — not class instances or nested non-draftable values without care.
- For large performance-critical reducers, you can still return a new object manually.

```typescript
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: { name: '', age: 0 }, tags: [] as string[] },
  reducers: {
    // Immer draft — looks like mutation, produces immutable update
    setName: (state, action: { payload: string }) => {
      state.profile.name = action.payload;
    },
    addTag: (state, action: { payload: string }) => {
      state.tags.push(action.payload);
    },
    // Return new state to replace entirely
    reset: () => ({ profile: { name: '', age: 0 }, tags: [] }),
  },
});

// Equivalent plain Redux (no Immer):
// setName: (state, action) => ({
//   ...state,
//   profile: { ...state.profile, name: action.payload },
// }),
```

## How do you connect React components with useSelector and useDispatch?

React Redux provides hooks that connect components to the store:

- **`useSelector(selector)`** — subscribes to the store and returns the selected slice of state. Re-renders when the selected value changes (shallow equality by default).
- **`useDispatch()`** — returns the stable `dispatch` function to send actions or thunks.

**Best practices:**

- Define typed hooks (`useAppDispatch`, `useAppSelector`) using `RootState` and `AppDispatch` for TypeScript safety.
- Keep selectors narrow — select only what the component needs to avoid extra re-renders.
- Use memoized selectors (`createSelector`) for derived or expensive computations.
- Wrap the app in `<Provider store={store}>` once at the root.

```tsx
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
  },
});

const store = configureStore({ reducer: { counter: counterSlice.reducer } });
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

const useAppDispatch = () => useDispatch<AppDispatch>();
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(counterSlice.actions.increment())}>+</button>
      <button onClick={() => dispatch(counterSlice.actions.decrement())}>-</button>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

## What is configureStore and what does it provide?

`configureStore` is RTK's replacement for Redux's `createStore`. It sets up a store with sensible defaults and less boilerplate.

**What it does automatically:**

1. **Combines reducers** — accepts a `reducer` object or single reducer function.
2. **Adds thunk middleware** — `redux-thunk` is included by default so you can dispatch functions.
3. **Enables Redux DevTools** — in development, wires up the DevTools extension enhancer.
4. **Adds development checks** — `immutableStateInvariantMiddleware` and `serializableStateInvariantMiddleware` catch accidental mutations and non-serializable values (configurable).
5. **Accepts custom middleware** — via `middleware` callback: `(getDefaultMiddleware) => getDefaultMiddleware().concat(...)`.
6. **Supports preloaded state** — for SSR hydration or tests.
7. **Returns a correctly typed store** — works well with TypeScript inference for `RootState` and `AppDispatch`.

```typescript
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import userReducer from './features/user/userSlice';
import { api } from './services/api';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // example: redux-persist
      },
    }).concat(api.middleware),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: undefined,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## How do you organize Redux Toolkit in a medium-sized app?

For a medium app (multiple features, some async, shared entities), use a **feature-folder** structure. Each feature owns its slice, selectors, and optionally thunks — API layers stay separate.

### Recommended layout

```
src/
  app/
    store.ts          # configureStore, typed hooks
    hooks.ts          # useAppDispatch, useAppSelector
  features/
    auth/
      authSlice.ts
      authSelectors.ts
      authThunks.ts   # if not using RTK Query
    todos/
      todosSlice.ts
      todosSelectors.ts
  services/
    api.ts            # createApi / base RTK Query slice
  components/         # presentational + container components
```

### Guidelines

- **One slice per feature domain** — `auth`, `cart`, `ui`, not one giant slice.
- **Colocate selectors** — export memoized selectors next to the slice; components should not reach into raw state shape.
- **Normalize entity data** when lists grow — use `createEntityAdapter` for CRUD collections.
- **Keep components thin** — dispatch actions; avoid business logic in JSX.
- **Use RTK Query for server state** — keep client UI state in slices; let RTK Query own fetch/cache/invalidate for HTTP.
- **Barrel exports sparingly** — import from feature modules directly to avoid circular deps.
- **Single store setup** — one `configureStore` in `app/store.ts`; lazy-load reducers only if you truly need code-splitting.

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import todosReducer from '../features/todos/todosSlice';
import { api } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    todos: todosReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (gDM) => gDM().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// app/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// features/todos/todosSlice.ts — feature owns its state
// features/todos/todosSelectors.ts — selectTodos, selectTodoById
// services/api.ts — RTK Query endpoints shared across features
```
