# NgRx Basics

## Questions Covered

1. What is NgRx, and why is it used in Angular applications?
2. Explain the core principles of NgRx.
3. What are the main building blocks of NgRx?
4. What are actions in NgRx?
5. What is a reducer, and how does it work in NgRx?
6. What is the @ngrx/store package?

## What is NgRx, and why is it used in Angular applications?

**NgRx** is a reactive state management library for Angular that implements the **Redux** pattern using **RxJS**. By centralizing application state, it makes complex apps more predictable, scalable, testable, and easier to debug.

**Key concepts:**

- **Store** — the centralized container holding global state.
- **Actions** — events describing a change or request to state.
- **Reducers** — pure functions that compute state changes from actions.
- **Selectors** — functions that retrieve slices of state.
- **Effects** — handle side effects (e.g., API calls) outside reducers using RxJS.

**Why use it:** centralized state, a predictable unidirectional flow (action → reducer → new state), enforced immutability, easier debugging (with NgRx DevTools for time-travel), scalability for large apps, separation of UI from state logic, and powerful RxJS integration for async work.

**When to use it:** apps with complex shared state across many components, a need to track and debug state over time, or significant async operations (HTTP requests, WebSocket events).

## Explain the core principles of NgRx.

NgRx's principles derive from the Redux pattern, giving state management a structured, predictable shape.

**1. Single source of truth (Store)** — the entire app state lives in one store, so all components read the same consistent data.

```typescript
interface AppState {
  user: UserState;
  products: ProductsState;
}
```

**2. State is read-only** — components never mutate state directly; they dispatch actions describing the desired change. This keeps changes predictable and traceable.

```typescript
store.dispatch({ type: '[Product] Add Product', payload: product });
```

**3. Actions describe state changes** — an action is an event with a `type` and optional payload; actions are the only way to initiate a change.

```typescript
export const login = createAction(
  '[Auth] Login',
  props<{ username: string, password: string }>()
);
```

**4. Reducers specify how state changes** — pure functions that take the current state and an action and return a new state.

```typescript
const authReducer = createReducer(
  initialState,
  on(login, (state, { username }) => ({
    ...state,
    isLoggedIn: true,
    username: username
  }))
);
```

**5. Selectors for accessing state** — pure, memoized functions that extract specific slices of state performantly.

```typescript
export const selectUser = (state: AppState) => state.auth.user;
```

**6. Side effects handled by Effects** — async work (HTTP requests, etc.) runs in effects, keeping reducers pure and synchronous.

```typescript
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      mergeMap(() => this.productService.getAll().pipe(
        map(products => loadProductsSuccess({ products })),
        catchError(error => of(loadProductsFailure({ error })))
      ))
    )
  );
}
```

**7. Unidirectional data flow** — actions are dispatched → reducers produce new state → selectors read state → components subscribe and re-render. This makes every change traceable.

**8. Immutability** — state is never modified in place; a new object is returned on each change, preserving history and enabling time-travel debugging.

```typescript
const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user: user
  }))
);
```

Together these principles provide a robust, predictable structure for Angular state management.

## What are the main building blocks of NgRx?

**1. Store** — the centralized state container and single source of truth; holds the current state and exposes it for reading, updating, and observing.

```typescript
interface AppState {
  user: UserState;
  products: ProductState;
}
```

**2. Actions** — payloads describing an event or intent to change state (a `type` plus optional payload), dispatched to signal a needed change.

```typescript
export const login = createAction(
  '[Auth] Login',
  props<{ username: string, password: string }>()
);
```

**3. Reducers** — pure functions that take state and an action and return a new state, keeping updates predictable and immutable.

```typescript
const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user: user,
    isLoggedIn: true
  }))
);
```

**4. Selectors** — functions to retrieve and derive specific slices of state in a performant, encapsulated way.

```typescript
export const selectUser = (state: AppState) => state.auth.user;
```

**5. Effects** — handle side effects such as HTTP requests; they listen for actions, perform the task, and dispatch new actions based on the outcome.

```typescript
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      mergeMap(() => this.productService.getAll().pipe(
        map(products => loadProductsSuccess({ products })),
        catchError(error => of(loadProductsFailure({ error })))
      ))
    )
  );
}
```

**6. Entities** — `@ngrx/entity` simplifies managing collections with utilities for add/update/delete in normalized form, reducing boilerplate.

```typescript
export interface ProductState extends EntityState<Product> {
  selectedProductId: string | null;
}
```

**7. DevTools** — the NgRx DevTools extension enables time-travel debugging and visualizing actions and state changes over time.

**8. Router Store** — integrates Angular's router with NgRx, putting router state (URL, params, query params) into the store.

```typescript
export const selectCurrentUrl = createSelector(
  selectRouterState,
  (router) => router.state.url
);
```

These blocks work together for a robust, scalable Redux-style approach to state management.

## What are actions in NgRx?

**Actions** are payloads of information representing events or intentions that trigger state changes — the primary way to interact with the store.

**Key characteristics:**

- **Descriptive events** — named after what occurred (e.g., "Login", "Load Data Success").
- **Immutable** — plain objects that don't change once created, making them predictable and easy to log/inspect.
- **Type and payload** — a `type` string uniquely identifies the action; an optional payload carries data needed for the change.

**Structure** — a type constant plus an optional payload:

```typescript
export const actionType = '[Feature] Action Name';
export const actionCreator = createAction(
  actionType,
  props<{ payloadProperty: string }>()
);
```

**Example** — a login action whose type is `[Auth] Login` and payload carries `username` and `password`:

```typescript
import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Auth] Login',
  props<{ username: string; password: string }>()
);
```

**How actions are used:**

- **Dispatching** — components or services dispatch an action to request a change.

```typescript
this.store.dispatch(login({ username: 'user', password: 'pass' }));
```

- **Reducers** — listen for specific actions and return a new state.

```typescript
const authReducer = createReducer(
  initialState,
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user: user,
    isLoggedIn: true
  }))
);
```

- **Effects** — react to actions that need async side effects, dispatching new actions with the result.

```typescript
@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      mergeMap(action => this.authService.login(action.username, action.password).pipe(
        map(user => loginSuccess({ user })),
        catchError(() => of(loginFailure()))
      ))
    )
  );
}
```

- **Selectors** — components read the updated state (resulting from actions) via selectors.

In short, actions are central to NgRx, enabling a clear, structured approach to state changes and side effects.

## What is a reducer, and how does it work in NgRx?

A **reducer** is a pure function that handles state changes in response to actions: it takes the current state and an action and returns a new state. Reducers define how application state updates for each dispatched action.

**Key characteristics:**

- **Pure functions** — no side effects; the same inputs always produce the same output.
- **Immutable updates** — never mutate current state; return a new state object.
- **Handle actions** — decide how state changes based on the action's type and payload.

**Signature:**

```typescript
(state: State, action: Action) => State
```

**How reducers work:**

**1. Define initial state** — the starting point before any actions:

```typescript
export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  isLoggedIn: false
};
```

**2. Create a reducer** with `createReducer` and `on` to map actions to state transformations:

```typescript
import { createReducer, on } from '@ngrx/store';
import { login, loginSuccess, logout } from './auth.actions';

const authReducer = createReducer(
  initialAuthState,
  on(login, state => ({
    ...state,
    isLoggedIn: false
  })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    user: user,
    isLoggedIn: true
  })),
  on(logout, state => ({
    ...state,
    user: null,
    isLoggedIn: false
  }))
);
```

`createReducer` defines the reducer declaratively, and each `on` specifies how state changes for a given action.

**3. Update the store** — when an action is dispatched, NgRx runs the reducer to compute and store the new state:

```typescript
this.store.dispatch(login({ username: 'user', password: 'pass' }));
```

**4. Combine multiple reducers** — manage different state slices with an `ActionReducerMap`:

```typescript
import { ActionReducerMap } from '@ngrx/store';
import { AuthState, authReducer } from './auth.reducer';
import { ProductState, productReducer } from './product.reducer';

export interface AppState {
  auth: AuthState;
  products: ProductState;
}

export const reducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  products: productReducer
};
```

Reducers keep state changes predictable and controlled, following functional-programming and immutability principles.

## What is the @ngrx/store package?

`@ngrx/store` is the core NgRx package providing Redux-style state management for Angular through a centralized store, actions, reducers, and selectors.

**Key features:** centralized state management, unidirectional data flow, immutability, selectors for performant querying, pure reducers for transitions, action dispatching, and DevTools integration for debugging.

**Key components:**

**Store** — the central state repository; components dispatch actions and select state from it.

```typescript
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { loadProducts } from './product.actions';

constructor(private store: Store<AppState>) {}

loadProducts() {
  this.store.dispatch(loadProducts());
}
```

**Actions** — signal that a change should happen; have a type and optional payload.

```typescript
import { createAction, props } from '@ngrx/store';

export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[] }>()
);
```

**Reducers** — pure functions returning new state from the current state and action.

```typescript
import { createReducer, on } from '@ngrx/store';
import { loadProductsSuccess } from './product.actions';

export const initialState: ProductState = {
  products: [],
};

const _productReducer = createReducer(
  initialState,
  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products
  }))
);

export function productReducer(state, action) {
  return _productReducer(state, action);
}
```

**Selectors** — extract specific parts of state, letting components subscribe only to what they need.

```typescript
import { createSelector } from '@ngrx/store';

export const selectProducts = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
  selectProducts,
  (state: ProductState) => state.products
);
```

**Effects** — not part of `@ngrx/store` itself (provided by `@ngrx/effects`); handle side effects and dispatch follow-up actions.

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProductService } from './product.service';
import { loadProducts, loadProductsSuccess } from './product.actions';
import { mergeMap, map } from 'rxjs/operators';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      mergeMap(() => this.productService.getProducts().pipe(
        map(products => loadProductsSuccess({ products }))
      ))
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

**Setup:**

**1. Install** the packages:

```bash
npm install @ngrx/store @ngrx/effects
```

**2. Configure the store** in your app module:

```typescript
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { productReducer } from './product.reducer';
import { ProductEffects } from './product.effects';

@NgModule({
  imports: [
    StoreModule.forRoot({ products: productReducer }),
    EffectsModule.forRoot([ProductEffects])
  ]
})
export class AppModule { }
```

**3. Use the store in components** — inject it to dispatch actions and select state:

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectAllProducts } from './product.selectors';
import { loadProducts } from './product.actions';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  products$ = this.store.select(selectAllProducts);
  constructor(private store: Store) {}
  ngOnInit() {
    this.store.dispatch(loadProducts());
  }
}
```

In short, `@ngrx/store` provides a centralized store, actions, reducers, and selectors (with effects from `@ngrx/effects`) for a clear, structured approach to managing complex state.
