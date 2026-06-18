# NgRx Selectors and State

## Questions Covered

1. What are selectors in NgRx, and how do they work?
2. What is the createSelector() function used for?
3. How do you structure the state in an NgRx application?
4. What is a feature state, and how do you create one in NgRx?
5. How does Store.select() work, and why is it used?
6. How do you combine multiple selectors?

## What are selectors in NgRx, and how do they work?

Selectors are pure functions used to query and derive slices of state from the store. They let components access only the state they need and compute derived values efficiently.

**Key features:**

- **Pure functions** — output depends only on inputs (state and optional props), with no side effects.
- **Efficient querying** — memoize results to avoid unnecessary recalculations.
- **Composition** — simpler selectors can be combined into more complex ones for reusability.
- **Derived state** — compute aggregated or filtered data from existing state.

**Basic selector** — extracts a direct slice of state:

```typescript
import { createSelector } from '@ngrx/store';

export const selectProducts = (state: AppState) => state.products;
```

**Advanced selector** — uses `createSelector` to build memoized selectors that derive new data from other selectors:

```typescript
import { createSelector } from '@ngrx/store';

export const selectProducts = (state: AppState) => state.products;

export const selectAvailableProducts = createSelector(
  selectProducts,
  (products) => products.filter(product => product.isAvailable)
);
```

**Use in components** — subscribe to the observable returned by `store.select(selector)`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAvailableProducts } from './product.selectors';
import { AppState } from './app.state';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  availableProducts$: Observable<Product[]>;
  constructor(private store: Store<AppState>) {
    this.availableProducts$ = this.store.select(selectAvailableProducts);
  }
  ngOnInit(): void {}
}
```

**Memoization** — `createSelector` caches a selector's result for a given input state; if the input is unchanged, the cached value is returned, which boosts performance with large or complex state:

```typescript
import { createSelector } from '@ngrx/store';

export const selectHighValueProducts = createSelector(
  selectProducts,
  (products) => products.filter(product => product.price > 100)
);
```

**Composition** — build complex selectors from simpler ones:

```typescript
import { createSelector } from '@ngrx/store';

export const selectProductEntities = (state: AppState) => state.products.entities;

export const selectProductById = (id: number) => createSelector(
  selectProductEntities,
  (entities) => entities[id]
);
```

In short, basic selectors extract state, advanced selectors derive memoized state via `createSelector`, and composition keeps querying logic modular and maintainable.

## What is the createSelector() function used for?

`createSelector()` creates **memoized selectors** that query and derive specific pieces of state efficiently.

**Purpose:**

- **Memoization** — caches results based on inputs; returns the cached value when inputs are unchanged.
- **Derived state** — computes new state from existing state, encapsulating transformation logic reusably.
- **Composition** — combines multiple selectors into more complex ones.

**Basic syntax** — input selectors feed a result function that returns the derived state:

```typescript
import { createSelector } from '@ngrx/store';

const selectFeatureState = (state: AppState) => state.feature;

export const selectSomeValue = createSelector(
  selectFeatureState,
  (featureState) => featureState.someValue
);
```

**Memoization example** — `selectUserAge` only recomputes when the `user` slice changes:

```typescript
import { createSelector } from '@ngrx/store';

export const selectUser = (state: AppState) => state.user;

export const selectUserAge = createSelector(
  selectUser,
  (user) => user.age
);
```

**Composing selectors:**

```typescript
import { createSelector } from '@ngrx/store';

export const selectProducts = (state: AppState) => state.products;

export const selectAvailableProducts = createSelector(
  selectProducts,
  (products) => products.filter(product => product.isAvailable)
);
```

**Using props** — create selectors that accept parameters to filter or compute state:

```typescript
import { createSelector } from '@ngrx/store';

export const selectProductsByCategory = (category: string) => createSelector(
  selectProducts,
  (products) => products.filter(product => product.category === category)
);
```

In short, `createSelector()` defines memoized, derived, composable selectors that can also accept props for flexible querying.

## How do you structure the state in an NgRx application?

Good state structure keeps an NgRx app predictable, scalable, and maintainable.

**1. Root state interface** — the top-level shape, composed of feature states:

```typescript
// app.state.ts
import { ProductState } from './product/product.state';
import { UserState } from './user/user.state';

export interface AppState {
  products: ProductState;
  user: UserState;
}
```

**2. Feature states** — each feature has its own interface, keeping related data together:

```typescript
// product.state.ts
export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}

// user.state.ts
export interface UserState {
  user: User | null;
  loggedIn: boolean;
  error: string | null;
}
```

**3. Initial state** — provides known default values per feature:

```typescript
// product.state.ts
export const initialProductState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null
};

// user.state.ts
export const initialUserState: UserState = {
  user: null,
  loggedIn: false,
  error: null
};
```

**4. Feature reducers** — each handles actions for its slice and returns new state:

```typescript
// product.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { ProductState, initialProductState } from './product.state';
import { loadProductsSuccess, loadProductsFailure } from './product.actions';

const _productReducer = createReducer(
  initialProductState,
  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),
  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

export function productReducer(state: ProductState, action: Action) {
  return _productReducer(state, action);
}
```

**5. Combine reducers** — map feature states to their reducers in a root reducer (`ActionReducerMap`):

```typescript
// app.reducer.ts
import { ActionReducerMap } from '@ngrx/store';
import { ProductState } from './product/product.state';
import { UserState } from './user/user.state';
import { productReducer } from './product/product.reducer';
import { userReducer } from './user/user.reducer';

export interface AppState {
  products: ProductState;
  user: UserState;
}

export const appReducer: ActionReducerMap<AppState> = {
  products: productReducer,
  user: userReducer
};
```

**6. Feature modules** — register each feature's reducer and effects with `StoreModule.forFeature`:

```typescript
// product.module.ts
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { productReducer } from './product.reducer';
import { ProductEffects } from './product.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('products', productReducer),
    EffectsModule.forFeature([ProductEffects])
  ],
  providers: [ProductService]
})
export class ProductModule {}
```

**7. Selectors** — keep them organized within feature files:

```typescript
// product.selectors.ts
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.state';

export const selectProductState = (state: AppState) => state.products;

export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedProduct
);
```

In summary: define a root state of feature states, give each feature its own interface, initial state, reducer, and selectors, combine reducers into a root reducer, and organize features into modules for scalability.

## What is a feature state, and how do you create one in NgRx?

A **feature state** is a slice of the overall application state dedicated to a particular feature or module. It promotes **modularity**, **encapsulation** of related data and logic, and **scalability**, since each feature manages its own slice.

**1. Define the feature state interface:**

```typescript
// product.state.ts
export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
}
```

**2. Create the initial state** with default values:

```typescript
// product.state.ts
export const initialProductState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null
};
```

**3. Implement the reducer** — a pure function mapping current state + action to new state:

```typescript
// product.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { ProductState, initialProductState } from './product.state';
import { loadProductsSuccess, loadProductsFailure, selectProduct } from './product.actions';

const _productReducer = createReducer(
  initialProductState,
  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),
  on(loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(selectProduct, (state, { product }) => ({
    ...state,
    selectedProduct: product
  }))
);

export function productReducer(state: ProductState | undefined, action: Action) {
  return _productReducer(state, action);
}
```

**4. Create actions** describing events that update the state:

```typescript
// product.actions.ts
import { createAction, props } from '@ngrx/store';
import { Product } from './product.model';

export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[] }>()
);
export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>()
);
export const selectProduct = createAction(
  '[Product] Select Product',
  props<{ product: Product }>()
);
```

**5. Create selectors** to query the feature state:

```typescript
// product.selectors.ts
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.state';

export const selectProductState = (state: AppState) => state.products;

export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedProduct
);
```

**6. Register the feature module** with `StoreModule.forFeature()` so NgRx knows about the slice:

```typescript
// product.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { productReducer } from './product.reducer';
import { ProductEffects } from './product.effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature('products', productReducer),
    EffectsModule.forFeature([ProductEffects])
  ],
  declarations: [ProductListComponent, ProductDetailComponent],
  providers: [ProductService]
})
export class ProductModule {}
```

This structure lets you manage complex state in a modular, scalable, and maintainable way.

## How does Store.select() work, and why is it used?

`Store.select()` retrieves slices of state from the store using selectors, returning an `Observable` that components and services can subscribe to.

**How it works:**

It takes a selector function — either a basic function that extracts state directly, or a memoized one built with `createSelector()`:

```typescript
// Basic selector function
import { AppState } from '../app.state';
export const selectProducts = (state: AppState) => state.products;
```

```typescript
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.state';

export const selectProductState = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);
```

Components subscribe to the returned `Observable`, which emits updated values automatically whenever the selected state changes — keeping the view in sync without manual intervention:

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectAllProducts } from './product.selectors';
import { AppState } from '../app.state';
import { Product } from './product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products$: Observable<Product[]>;
  constructor(private store: Store<AppState>) {
    this.products$ = this.store.select(selectAllProducts);
  }
  ngOnInit(): void {}
}
```

**Why it's used:**

- **Efficient state access** — query only the state you need.
- **Separation of concerns** — querying logic lives in selectors, not components.
- **Performance** — memoized selectors avoid unnecessary recomputation.
- **Reactive** — the returned `Observable` fits Angular's reactive model.
- **Decoupling & reusability** — components focus on display while multiple components reuse the same selectors for consistency.

## How do you combine multiple selectors?

`createSelector()` combines multiple input selectors to derive new state, with composition and memoization built in.

**1. Define individual selectors** to use as inputs:

```typescript
// product.selectors.ts
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.state';

export const selectProductState = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);
export const selectSelectedProductId = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedProductId
);
```

**2. Combine them** with `createSelector()` and a result function:

```typescript
// product.selectors.ts
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.state';
import { Product } from './product.model';

export const selectProductState = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);
export const selectSelectedProductId = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedProductId
);

export const selectSelectedProduct = createSelector(
  selectAllProducts,
  selectSelectedProductId,
  (products: Product[], selectedProductId: number) => {
    return products.find(product => product.id === selectedProductId) || null;
  }
);
```

**3. Use the combined selector** in a component:

```typescript
// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectSelectedProduct } from './product.selectors';
import { AppState } from '../app.state';
import { Product } from './product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  selectedProduct$: Observable<Product | null>;
  constructor(private store: Store<AppState>) {
    this.selectedProduct$ = this.store.select(selectSelectedProduct);
  }
  ngOnInit(): void {}
}
```

**Benefits:** memoization avoids recomputation when inputs are unchanged, complex state logic is encapsulated and reusable across components, and breaking queries into simpler selectors improves readability and maintainability.
