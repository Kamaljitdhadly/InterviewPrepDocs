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

**Redux** is a predictable state container: components **dispatch actions** → **reducers** compute immutable state updates → **selectors** read state. Single source of truth, testable, DevTools-friendly.

**Plain Redux** = verbose boilerplate (action types, switch reducers, spread updates, manual store wiring).

**Redux Toolkit (RTK)** = official opinionated API wrapping best practices:

| Plain Redux pain | RTK solution |
|------------------|--------------|
| Verbose action/reducer setup | `createSlice` |
| Accidental mutations | Immer in reducers |
| Manual store wiring | `configureStore` (thunk, DevTools, checks) |
| Async boilerplate | `createAsyncThunk`, RTK Query |

**Use Redux/RTK** for shared cross-feature state, complex updates, DevTools needs, or server cache (RTK Query). Prefer `useState` for local UI; Context for light global reads.

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

1. **State** — plain object, often split into feature slices.
2. **Actions** — `{ type, payload? }` describing what happened; RTK auto-generates creators via `createSlice`.
3. **Reducers** — pure `(state, action) => newState`; combined into root reducer.
4. **Store** — holds state; exposes `dispatch`, `getState`, `subscribe` (`configureStore`).
5. **Dispatch** — only way to trigger changes.
6. **Selectors** — read/derive state (memoize with `createSelector`).
7. **Middleware** — intercepts actions (thunks, logging); `redux-thunk` included by default.

**Flow:** UI → `dispatch` → middleware → reducers → new state → selectors → UI.

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

Pass **name** (action prefix), **initialState**, and **reducers** (sync update functions). RTK generates action creators, action types, Immer-wrapped reducer, and returns `{ name, reducer, actions }`.

Use **reducers** for slice-owned sync actions; **extraReducers** for thunks or external actions.

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

**Immer** lets you write "mutating" code that produces immutable updates via a Proxy **draft**. RTK wraps every `createSlice` reducer in `produce`.

- Write `state.x = y` inside reducers safely.
- **Return** a value → replaces entire state (resets).
- **Return nothing** → Immer draft becomes new state.
- Only mutate the `state` param inside reducers; supports plain objects, arrays, Map, Set.

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

- **`useSelector(selector)`** — subscribes; re-renders on selected value change (shallow compare).
- **`useDispatch()`** — returns stable `dispatch`.

**Tips:** typed hooks (`useAppDispatch`, `useAppSelector`), narrow selectors, memoized `createSelector`, root `<Provider store={store}>`.

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

RTK replacement for `createStore` with sensible defaults:

1. Combines reducers (object or function).
2. Adds **redux-thunk** middleware.
3. Enables **Redux DevTools** in dev.
4. Adds immutability + serializability dev checks (configurable).
5. Custom middleware via `middleware: (gDM) => gDM().concat(...)`.
6. Supports `preloadedState` (SSR/tests).
7. Typed store for `RootState` / `AppDispatch`.

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

Use **feature folders** — each domain owns slice + selectors (+ thunks if needed); API layer separate.

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

**Guidelines:** one slice per domain; colocate memoized selectors; `createEntityAdapter` for normalized lists; thin components; RTK Query for server state, slices for client UI state; single `configureStore` in `app/store.ts`.

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

---

## Related Topics

- **NgRx Basics** (`Angular/`)
- **Interview Comparisons** (`Important Concepts/`)
