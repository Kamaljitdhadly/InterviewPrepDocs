# Redux Toolkit Selectors and Patterns

## Questions Covered

1. What are selectors in Redux and why use createSelector?
2. How does memoization work with reselect/createSelector?
3. What are normalized state shapes and why do they matter?
4. How do you avoid unnecessary re-renders with useSelector?
5. What is the feature-slice pattern in Redux Toolkit?
6. What are Redux Toolkit best practices for scalable apps?

## What are selectors in Redux and why use createSelector?

Selectors are **pure functions** that read/derive store state. Use them for encapsulation, reusable derived data, and performance via memoization.

- **Basic selector** — direct slice access
- **`createSelector`** (Reselect, re-exported by RTK) — composes inputs + memoizes the result

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

**Tip:** selectors are the query layer — colocate with the slice; they're part of the feature's public API.

## How does memoization work with reselect/createSelector?

`createSelector` memoizes at two levels:

1. **Input selectors** — results compared by reference (`===`)
2. **Result function** — runs only when an input changed; output cached until then

Composed selectors only recompute downstream when their inputs actually change.

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

**Caveat:** reference equality — bad reducers that always return new array refs defeat memoization. Immer in RTK preserves unchanged references.

## What are normalized state shapes and why do they matter?

**Normalized state:** `{ ids: string[], entities: Record<string, Entity> }` — each entity stored once by ID.

| Benefit | Why |
|---------|-----|
| Single source of truth | Update once, all selectors see it |
| O(1) lookup | `entities[id]` vs array scan |
| Stable references | Unchanged entities → better memoization |
| Easier updates | Add/remove by ID |
| RTK synergy | `createEntityAdapter` automates it |

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

`useSelector` re-renders when the selected value changes (`===` by default).

**Pitfalls:** selecting whole slices; inline object literals (new ref every time); unmemoized derived data.

**Fixes:** select primitives; use `createSelector`; `shallowEqual` for multi-field objects; split components.

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

## What is the feature-slice pattern in Redux Toolkit?

The **feature-slice pattern** colocates per domain: slice (state + reducers + actions), selectors, async logic, types. `configureStore` combines reducers — like NgRx feature states with less boilerplate.

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

| Practice | Why |
|----------|-----|
| Feature folders | Domain owns slice, selectors, thunks |
| Normalized entities | `createEntityAdapter` for collections |
| Typed hooks | `useAppDispatch` / `useAppSelector` |
| RTK Query for server state | Built-in cache, invalidation, dedup |
| Colocate selectors | Avoid god-selector files |
| Serializable checks | Keep RTK dev middleware defaults |

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

**Rules:** client UI in slices, server cache in RTK Query; never mutate outside reducers; prefer selectors over inline logic; avoid storing derived data; one action = one intent.
