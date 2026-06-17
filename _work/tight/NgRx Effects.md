# NgRx Effects

## Questions Covered

1. What are Effects in NgRx, and why are they important?
2. How does the @ngrx/effects package work?
3. What is the purpose of the Actions observable in NgRx Effects?
4. How do you handle side effects in NgRx?
5. What is the difference between Actions and Effects in NgRx?
6. How do you handle asynchronous operations in NgRx using Effects?
7. Explain how you can cancel or debounce actions in Effects.

## What are Effects in NgRx, and why are they important?

**Effects** handle side effects in NgRx applications. They are injectable services that listen for actions dispatched to the store, perform tasks that interact with external resources (e.g., HTTP requests, logging, local storage), and then dispatch new actions based on the results. This keeps components focused on the UI and reducers focused on pure state transitions.

**Key concepts:**

- **Side effects** — operations that touch external systems or run asynchronously.
- **Effect class** — a `@Injectable()` class that uses the `Actions` service and RxJS operators to listen for actions and run side effects.
- **Actions** — effects react to dispatched actions and can dispatch new ones with results or errors.
- **RxJS operators** — `mergeMap`, `switchMap`, `catchError`, etc. manage the async streams.

**Why they matter:** effects enforce separation of concerns (UI, state, side effects), provide a consistent way to handle async work, decouple complex logic from components, centralize error handling, and keep a clear flow of action dispatching → state updates.

**Example** — fetching data from an API.

First, **define the actions**:

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
```

Then **create the effect**:

```typescript
// product.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProductService } from './product.service';
import { loadProducts, loadProductsSuccess, loadProductsFailure } from './product.actions';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(loadProducts),
    mergeMap(() => this.productService.getAll().pipe(
      map(products => loadProductsSuccess({ products })),
      catchError(error => of(loadProductsFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

Finally, **register the effect**:

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

In short, effects manage side effects cleanly, leading to a more organized and maintainable codebase.

## How does the @ngrx/effects package work?

`@ngrx/effects` provides a structured way to handle side effects in response to actions dispatched to the store. Its core pieces work together as follows.

**Effect classes** — `@Injectable()` classes that listen for specific actions, perform side effects, and dispatch follow-up actions.

```typescript
// product.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProductService } from './product.service';
import { loadProducts, loadProductsSuccess, loadProductsFailure } from './product.actions';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(loadProducts),
    mergeMap(() => this.productService.getAll().pipe(
      map(products => loadProductsSuccess({ products })),
      catchError(error => of(loadProductsFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

**Actions** — represent events or requests that trigger side effects (e.g., a request to load data).

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
```

**Effect creation** — `createEffect()` takes a function returning an `Observable` that listens for actions via the `Actions` service and performs side effects. It registers the effect with the store and handles subscription/unsubscription automatically.

**Operators** — effects use RxJS operators to manage async streams: `mergeMap()` (flatten/parallel async), `switchMap()` (cancel previous, keep latest), `map()` (transform payloads), `catchError()` (dispatch failure actions).

**Error handling** — typically catch errors and dispatch a failure action with the error details:

```typescript
catchError(error => of(loadProductsFailure({ error: error.message })))
```

**Registering effects** — register effect classes with `EffectsModule.forFeature()` (or `forRoot()`):

```typescript
import { EffectsModule } from '@ngrx/effects';
import { ProductEffects } from './product.effects';

@NgModule({
  imports: [EffectsModule.forFeature([ProductEffects])]
})
export class ProductModule {}
```

**Workflow:** action dispatched → effect listens → side effect performed → new success/failure action dispatched → reducers update the store. This keeps components and reducers focused on their primary responsibilities.

## What is the purpose of the Actions observable in NgRx Effects?

The `Actions` observable is a stream of *all* actions dispatched to the store. Effects subscribe to it to react to the specific actions they care about and run associated side effects.

**Listening for actions** — inject `Actions` and filter with `ofType`:

```typescript
import { Actions } from '@ngrx/effects';

@Injectable()
export class ProductEffects {
  constructor(private actions$: Actions) {}
}
```

**Handling side effects** — when a matching action arrives, the effect runs the side effect (HTTP request, storage, logging) using the action's type and payload for context:

```typescript
loadProducts$ = createEffect(() => this.actions$.pipe(
  ofType(loadProducts),
  mergeMap(() => this.productService.getAll().pipe(
    map(products => loadProductsSuccess({ products })),
    catchError(error => of(loadProductsFailure({ error: error.message })))
  ))
));
```

**Dispatching new actions** — after the side effect, the effect dispatches a result action (e.g., a success action carrying the fetched data) via `map(...)`.

**Error handling** — `catchError` catches failures from the async operation and dispatches a failure action with error details.

**How it fits the architecture:** effects subscribe to `Actions` to listen for action types, perform side effects, and dispatch new actions; those actions are processed by reducers to update the store — creating a feedback loop. This keeps a clear separation between business logic, UI components, and state management.

## How do you handle side effects in NgRx?

Handle side effects with the `@ngrx/effects` package by following these steps.

**1. Define actions** — including success and failure states:

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
```

**2. Create an effect** with `@Injectable()` and `createEffect()` that listens for actions, performs the side effect, and dispatches result actions:

```typescript
// product.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProductService } from './product.service';
import { loadProducts, loadProductsSuccess, loadProductsFailure } from './product.actions';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(loadProducts),
    mergeMap(() => this.productService.getAll().pipe(
      map(products => loadProductsSuccess({ products })),
      catchError(error => of(loadProductsFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

**3. Register the effects** with `EffectsModule.forFeature()` (feature) or `forRoot()` (root):

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

**4. Use RxJS operators** to manage async streams: `mergeMap()` (merge concurrent inner observables), `switchMap()` (cancel previous, keep latest), `map()` (transform results), `catchError()` (handle errors, dispatch failure).

**5. Handle errors** with `catchError()`:

```typescript
catchError(error => of(loadProductsFailure({ error: error.message })))
```

**6. Dispatch new actions** based on the result:

```typescript
map(products => loadProductsSuccess({ products }))
```

Following these steps keeps side effects organized and your codebase maintainable.

## What is the difference between Actions and Effects in NgRx?

**Actions** and **Effects** play complementary roles.

**Actions** are payloads of information that describe *what happened or needs to happen*. They carry data from the app to the store, defined with `createAction` (a type plus optional payload):

```typescript
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
```

Actions are dispatched by components, services, or effects, and are processed by reducers to update state:

```typescript
this.store.dispatch(loadProducts());
```

**Effects** *handle the side effects* triggered by actions. Defined as `@Injectable()` classes using `createEffect()` and RxJS operators, they listen for actions, perform async work (e.g., HTTP requests), and dispatch new actions based on the results:

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProductService } from './product.service';
import { loadProducts, loadProductsSuccess, loadProductsFailure } from './product.actions';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(loadProducts),
    mergeMap(() => this.productService.getAll().pipe(
      map(products => loadProductsSuccess({ products })),
      catchError(error => of(loadProductsFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

**Summary:**

- **Actions** — represent events/requests; created with `createAction`; dispatched to trigger state changes; focus on *what* happened.
- **Effects** — handle side effects and async operations; defined with `createEffect` and RxJS; listen for actions and dispatch new ones; focus on *managing* side effects.

## How do you handle asynchronous operations in NgRx using Effects?

Manage async work (HTTP requests, timers, etc.) with effects using these steps.

**1. Define actions** for start, success, and failure:

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
```

**2. Create an effect** that listens for the action, runs the async operation, and dispatches result actions:

```typescript
// product.effects.ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ProductService } from './product.service';
import { loadProducts, loadProductsSuccess, loadProductsFailure } from './product.actions';

@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() => this.actions$.pipe(
    ofType(loadProducts),
    mergeMap(() => this.productService.getAll().pipe(
      map(products => loadProductsSuccess({ products })),
      catchError(error => of(loadProductsFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

**3. Use RxJS operators:** `mergeMap()` (run inner observables in parallel), `switchMap()` (cancel previous, keep latest — ideal for search), `map()` (turn results into a new action), `catchError()` (handle errors and dispatch a failure action).

**4. Register the effects** with `EffectsModule.forFeature()` (feature) or `forRoot()` (global):

```typescript
// app.module.ts or feature module
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { productReducer } from './product.reducer';
import { ProductEffects } from './product.effects';
import { ProductService } from './product.service';

@NgModule({
  imports: [
    StoreModule.forFeature('products', productReducer),
    EffectsModule.forFeature([ProductEffects])
  ],
  providers: [ProductService]
})
export class ProductModule {}
```

**5. Handle errors** with `catchError()`:

```typescript
catchError(error => of(loadProductsFailure({ error: error.message })))
```

**6. Dispatch actions** based on the result:

```typescript
map(products => loadProductsSuccess({ products }))
```

**Workflow:** dispatch `loadProducts` → effect listens and triggers the HTTP request → RxJS manages the request → effect dispatches `loadProductsSuccess` (with data) or `loadProductsFailure` (with error) → reducers update the store.

## Explain how you can cancel or debounce actions in Effects.

You can control action timing in effects with RxJS operators — useful for ignoring rapid actions or canceling in-flight operations.

**Canceling actions** — use `switchMap()` to cancel any previous observable when a new action arrives, so only the latest result is processed (e.g., search inputs where only the latest query matters):

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { SearchService } from './search.service';
import { search, searchSuccess, searchFailure } from './search.actions';

@Injectable()
export class SearchEffects {
  search$ = createEffect(() => this.actions$.pipe(
    ofType(search),
    switchMap(action => this.searchService.search(action.query).pipe(
      map(results => searchSuccess({ results })),
      catchError(error => of(searchFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private searchService: SearchService
  ) {}
}
```

If a new `search` action is dispatched before the previous request finishes, the ongoing request is canceled and only the latest is processed.

**Debouncing actions** — use `debounceTime()` to delay processing until dispatching pauses, reducing the number of requests (e.g., wait 300 ms after the user stops typing):

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, debounceTime, map, switchMap } from 'rxjs/operators';
import { SearchService } from './search.service';
import { search, searchSuccess, searchFailure } from './search.actions';

@Injectable()
export class SearchEffects {
  search$ = createEffect(() => this.actions$.pipe(
    ofType(search),
    debounceTime(300),
    switchMap(action => this.searchService.search(action.query).pipe(
      map(results => searchSuccess({ results })),
      catchError(error => of(searchFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private searchService: SearchService
  ) {}
}
```

Here `debounceTime(300)` triggers the search only after a 300 ms pause, so only the last of several rapid actions runs.

**In short:** `switchMap()` cancels ongoing operations to process only the latest action, and `debounceTime()` delays processing until input settles — together improving performance and user experience.
