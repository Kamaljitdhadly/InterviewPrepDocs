# Redux Toolkit Selectors and Patterns

## Questions Covered

1. What are selectors in Redux and why use createSelector?
2. How does memoization work with reselect/createSelector?
3. What are normalized state shapes and why do they matter?
4. How do you avoid unnecessary re-renders with useSelector?
5. What is the feature-slice pattern in Redux Toolkit?
6. What are Redux Toolkit best practices for scalable apps?

## What are selectors in Redux and why use createSelector?

**Selectors** are pure functions that read and derive data from the Redux store state. Components (via `useSelector`) and thunks use them to access state without reaching into nested objects directly in every file.

### Why selectors matter

- **Encapsulation** — hide state shape; refactor the store without touching every component.
- **Derived data** — compute filtered lists, totals, or lookups in one place.
- **Performance** — memoized selectors skip expensive recomputation when inputs are unchanged.
- **Reusability** — the same selector powers multiple components and tests.

A **basic selector** reads a slice directly. **`createSelector`** (from Reselect, re-exported by RTK) composes input selectors and memoizes the result function.

```typescript
import { createSelector } from '@reduxjs/toolkit';

// Root state type (inferred from configureStore in practice)
type RootState = {
  products: {
    ids: string[];
    entities: Record<string, { id: string; name: string; price: number; inStock: boolean }>;
  };
};

// Basic selector — direct slice access
const selectProductState = (state: RootState) => state.products;

// Memoized derived selector
export const selectAllProducts = createSelector(
  selectProductState,
  (productState) => productState.ids.map((id) => productState.entities[id])
);

export const selectInStockProducts = createSelector(
  [selectAllProducts],
  (products) => products.filter((p) => p.inStock)
);
```

```jsx
import { useSelector } from 'react-redux';
import { selectInStockProducts } from './productSelectors';

function ProductList() {
  const products = useSelector(selectInStockProducts);
  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

**Interview tip:** selectors are the query layer of Redux — keep them colocated with their slice and treat them as part of the public API of that feature.

## How does memoization work with reselect/createSelector?

Reselect's `createSelector` memoizes at two levels:

1. **Input selectors** — each input selector's result is compared to its last result (reference equality by default).
2. **Result function** — runs only when at least one input result changed; its return value is cached until inputs change again.

If inputs are referentially equal, the cached output is returned immediately — no re-filtering, no new array allocation.

### Composition chains memoization

When selectors are composed, a change deep in the tree only recomputes downstream selectors whose inputs actually changed.

```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectCartItems = (state: RootState) => state.cart.items;

const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((sum, item) => sum + item.price * item.qty, 0)
);

const selectTaxRate = (state: RootState) => state.settings.taxRate;

const selectCartTotal = createSelector(
  [selectCartSubtotal, selectTaxRate],
  (subtotal, taxRate) => subtotal * (1 + taxRate)
);

// Parametric selector — new memoization cache per category argument
export const selectProductsByCategory = (category: string) =>
  createSelector([selectAllProducts], (products) =>
    products.filter((p) => p.category === category)
  );
```

```jsx
function CartSummary() {
  // Re-renders only when selectCartTotal's cached value changes
  const total = useSelector(selectCartTotal);
  return <p>Total: ${total.toFixed(2)}</p>;
}
```

**Caveat:** memoization uses reference equality. If a reducer mutates nested data incorrectly or returns a new array reference on every action, memoization cannot help. Immer inside RTK reducers normally preserves unchanged references.

## What are normalized state shapes and why do they matter?

**Normalized state** stores collections as `{ ids: string[], entities: Record<string, Entity> }` instead of nested arrays of objects. Each entity appears once, keyed by ID.

### Benefits

| Benefit | Why it helps |
|---------|--------------|
| **Single source of truth** | Update one entity; all selectors see the change |
| **O(1) lookup** | `entities[id]` vs scanning an array |
| **Stable references** | Unchanged entities keep the same object reference → better memoization |
| **Easier updates** | Add/remove/update by ID without deep cloning arrays |
| **RTK synergy** | `createEntityAdapter` automates normalization |

```typescript
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';

const productsAdapter = createEntityAdapter({
  selectId: (product: Product) => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

const productsSlice = createSlice({
  name: 'products',
  initialState: productsAdapter.getInitialState({ status: 'idle' as const }),
  reducers: {
    productsReceived: productsAdapter.setAll,
    productUpdated: productsAdapter.updateOne,
    productRemoved: productsAdapter.removeOne,
  },
});

// Adapter generates memoized selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
} = productsAdapter.getSelectors(
  (state: RootState) => state.products
);
```

```typescript
// Anti-pattern — nested, duplicated, hard to update
const badState = {
  categories: [
    {
      id: 'c1',
      products: [
        { id: 'p1', name: 'Widget', price: 9.99 },
        { id: 'p2', name: 'Gadget', price: 14.99 },
      ],
    },
  ],
};

// Normalized — flat entities, explicit relationships
const goodState = {
  products: {
    ids: ['p1', 'p2'],
    entities: {
      p1: { id: 'p1', name: 'Widget', price: 9.99, categoryId: 'c1' },
      p2: { id: 'p2', name: 'Gadget', price: 14.99, categoryId: 'c1' },
    },
  },
  categories: {
    ids: ['c1'],
    entities: { c1: { id: 'c1', name: 'Electronics', productIds: ['p1', 'p2'] } },
  },
};
```

## How do you avoid unnecessary re-renders with useSelector?

`useSelector` subscribes a component to store updates. The component re-renders when the **selected value** changes (default: strict `===` comparison).

### Common pitfalls

- Selecting the entire slice when you need one field.
- Returning a new object/array literal inline → new reference every time → constant re-renders.
- Derived data computed inline without memoization.

### Patterns that work

1. **Select primitives** — strings, numbers, booleans compare by value.
2. **Use memoized selectors** — `createSelector` returns stable references when inputs are stable.
3. **`shallowEqual`** — when you must pick multiple fields into an object.
4. **Split components** — isolate frequent updaters.

```jsx
import { useSelector, shallowEqual } from 'react-redux';
import { selectCartTotal } from './cartSelectors';

// BAD — new object every render → always re-renders
function BadUserGreeting() {
  const { name, email } = useSelector((state) => ({
    name: state.user.name,
    email: state.user.email,
  }));
  return <p>{name} ({email})</p>;
}

// GOOD — separate primitive selectors
function GoodUserGreeting() {
  const name = useSelector((state) => state.user.name);
  const email = useSelector((state) => state.user.email);
  return <p>{name} ({email})</p>;
}

// GOOD — shallowEqual when grouping fields
function GroupedUserGreeting() {
  const { name, email } = useSelector(
    (state) => ({ name: state.user.name, email: state.user.email }),
    shallowEqual
  );
  return <p>{name} ({email})</p>;
}

// GOOD — memoized selector for derived data
function CartBadge() {
  const total = useSelector(selectCartTotal);
  return <span>${total.toFixed(2)}</span>;
}
```

**React-Redux v8+** also supports `useSelector` with an array of selectors via `useSelector.withTypes` patterns, but separate calls or `createSelector` remain the most common interview answers.

## What is the feature-slice pattern in Redux Toolkit?

The **feature-slice pattern** (popularized as "feature folders" / "ducks") colocates everything for one domain feature in a single module:

- Slice (`createSlice`) — state, reducers, actions
- Selectors — query and derive that slice
- Async logic — `createAsyncThunk` or RTK Query endpoints
- Types — feature-specific interfaces

Each slice owns its reducer; `configureStore` combines them. This mirrors NgRx feature states but with far less boilerplate.

```typescript
// features/cart/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem { id: string; name: string; price: number; qty: number }
interface CartState { items: CartItem[] }

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    itemAdded(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push(action.payload);
    },
    itemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
  },
});

export const { itemAdded, itemRemoved } = cartSlice.actions;
export default cartSlice.reducer;
```

```typescript
// features/cart/cartSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

const selectCartState = (state: RootState) => state.cart;

export const selectCartItems = createSelector(
  selectCartState,
  (cart) => cart.items
);

export const selectCartItemCount = createSelector(
  selectCartItems,
  (items) => items.reduce((sum, item) => sum + item.qty, 0)
);
```

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import productsReducer from '../features/products/productsSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```jsx
// features/cart/CartBadge.tsx
import { useSelector } from 'react-redux';
import { selectCartItemCount } from './cartSelectors';

export function CartBadge() {
  const count = useSelector(selectCartItemCount);
  return <span>{count}</span>;
}
```

## What are Redux Toolkit best practices for scalable apps?

### Structural practices

| Practice | Rationale |
|----------|-----------|
| **Feature folders** | Each domain owns slice, selectors, components, thunks |
| **Normalized entities** | `createEntityAdapter` for collections |
| **Typed hooks** | `useAppDispatch` / `useAppSelector` wrappers |
| **RTK Query for server state** | Caching, invalidation, deduplication built-in |
| **Colocate selectors** | Export from feature; avoid god-selector files |
| **Serializable checks** | Keep RTK middleware defaults in dev |

### Code organization

```typescript
// app/hooks.ts — typed hooks used everywhere
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

```typescript
// features/api/apiSlice.ts — server cache separate from UI state
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Product', 'Cart'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    addToCart: builder.mutation<void, string>({
      query: (productId) => ({
        url: '/cart',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const { useGetProductsQuery, useAddToCartMutation } = apiSlice;
```

```typescript
// app/store.ts — combine feature reducers + RTK Query
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/cartSlice';
import { apiSlice } from '../features/api/apiSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
```

### Rules of thumb

- **Keep client UI state in slices; put server cache in RTK Query** — avoids duplicating fetch/loading/error logic.
- **Never mutate outside reducers** — Immer only runs inside `createSlice` reducers.
- **Prefer selectors over inline `useSelector` logic** — testable and memoized.
- **Avoid storing derived data** — compute in selectors unless profiling proves otherwise.
- **One action = one intent** — keeps DevTools readable and reducers simple.

**Interview summary:** RTK scales when you treat each feature as a bounded module with its own slice, selectors, and async layer, and you let RTK Query own server-state caching.
