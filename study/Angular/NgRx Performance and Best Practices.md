# NgRx Performance and Best Practices

## Questions Covered

1. How do you optimize NgRx for performance in large applications?
2. What are some best practices for structuring NgRx applications?
3. How do you manage complex side effects in large NgRx applications?

## How do you optimize NgRx for performance in large applications?

Optimizing NgRx focuses on efficient state management, fewer re-renders, and minimized bottlenecks.

**1. Use OnPush change detection** — reduces how often Angular checks for changes.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  // Component logic
}
```

**2. Efficient selectors** — memoize with `createSelector` to avoid redundant re-computations and re-renders.

```typescript
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.model';

const selectProductState = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.ids.map(id => state.entities[id])
);
```

**3. Use `@ngrx/entity` for collections** — utilities for adding/updating/deleting entities in normalized form.

```typescript
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductState extends EntityState<Product> {
  loading: boolean;
}

export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>();
export const initialProductState: ProductState = productAdapter.getInitialState({
  loading: false
});
```

**4. Avoid dispatching unnecessary actions** — don't dispatch redundant actions or ones that don't change state.

**5. Optimize effects** — use `concatMap`, `mergeMap`, or `switchMap` appropriately to handle actions efficiently.

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mergeMap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { MyService } from './my.service';
import { loadItems, loadItemsSuccess, loadItemsFailure } from './my.actions';

@Injectable()
export class MyEffects {
  loadItems$ = createEffect(() => this.actions$.pipe(
    ofType(loadItems),
    mergeMap(() => this.myService.getItems().pipe(
      map(items => loadItemsSuccess({ items })),
      catchError(error => of(loadItemsFailure({ error })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private myService: MyService
  ) {}
}
```

**6. Use lazy loading and feature modules** — load only what the current view needs to cut initial load time.

```typescript
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
  }
];
```

**7. Optimize state with immutable data** — return new state objects instead of mutating, avoiding unnecessary re-renders.

```typescript
import { createReducer, on } from '@ngrx/store';
import { addProduct, updateProduct, deleteProduct } from './product.actions';

export const productReducer = createReducer(
  initialProductState,
  on(addProduct, (state, { product }) => ({
    ...state,
    entities: {
      ...state.entities,
      [product.id]: product
    }
  })),
  on(updateProduct, (state, { product }) => ({
    ...state,
    entities: {
      ...state.entities,
      [product.id]: product
    }
  })),
  on(deleteProduct, (state, { id }) => {
    const { [id]: removed, ...entities } = state.entities;
    return {
      ...state,
      entities
    };
  })
);
```

**8. Use `store-devtools` wisely** — useful for debugging, but enable only in development to avoid production overhead.

```typescript
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
  imports: [
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production })
  ]
})
export class AppModule { }
```

**9. Memoize component selectors** — keep selectors used in components memoized to avoid redundant calculations.

```typescript
export const selectItemsCount = createSelector(
  selectProductState,
  (state: ProductState) => state.ids.length
);
```

**10. Lazy load state** — for very large apps, dynamically load feature states when needed.

**In short:** combine OnPush, memoized selectors, `@ngrx/entity`, fewer actions, appropriate effect operators, lazy loading, immutable updates, dev-only DevTools, and memoized component selectors for smoother, more responsive apps.

## What are some best practices for structuring NgRx applications?

Good structure keeps NgRx apps clear, scalable, and maintainable.

**1. Follow a feature-based module structure** — group each feature's state management together.

```
src/
  app/
    core/                  # Core services and shared functionality
    features/
      user/
        store/
          actions/
          effects/
          reducers/
          selectors/
        user.module.ts
      products/
        store/
          actions/
          effects/
          reducers/
          selectors/
        products.module.ts
    app.module.ts
```

**2. Use consistent naming conventions:**

- **Actions** — `[Feature] ActionName` (e.g., `loadProducts`, `loadProductsSuccess`, `loadProductsFailure`).
- **Reducers** — descriptive name with a `reducer` suffix (e.g., `productReducer`).
- **Effects** — descriptive name with an `Effects` suffix (e.g., `ProductEffects`).
- **Selectors** — prefix with `select` (e.g., `selectAllProducts`, `selectProductById`).

**3. Keep reducers simple** — pure functions handling specific state slices; push complex logic to selectors or effects.

```typescript
import { createReducer, on } from '@ngrx/store';
import { loadProductsSuccess, addProduct, updateProduct } from './product.actions';
import { productAdapter, initialProductState } from './product.model';

export const productReducer = createReducer(
  initialProductState,
  on(loadProductsSuccess, (state, { products }) =>
    productAdapter.setAll(products, { ...state, loading: false })
  ),
  on(addProduct, (state, { product }) =>
    productAdapter.addOne(product, state)
  ),
  on(updateProduct, (state, { product }) =>
    productAdapter.updateOne({ id: product.id, changes: product }, state)
  )
);
```

**4. Use selectors for derived state** — derive and aggregate state to avoid duplicated query logic.

```typescript
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ProductState } from './product.model';

const { selectAll } = productAdapter.getSelectors();
export const selectProductState = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
  selectProductState,
  selectAll
);
```

**5. Centralize effects** — keep each feature's effects in one file/folder to stay organized and avoid duplication.

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
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

**6. Use `@ngrx/entity` for collection management** — simplifies collection state and operations.

```typescript
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductState extends EntityState<Product> {
  loading: boolean;
}

export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>();
export const initialProductState: ProductState = productAdapter.getInitialState({
  loading: false
});
```

**7. Modularize state management** — break large state into feature-specific slices managed within feature modules.

```typescript
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { productReducer } from './store/reducers/product.reducer';
import { ProductEffects } from './store/effects/product.effects';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  imports: [
    StoreModule.forFeature('products', productReducer),
    EffectsModule.forFeature([ProductEffects])
  ]
})
export class ProductsModule { }
```

**8. Handle error states** — define failure actions and state properties; catch errors in effects and update state.

```typescript
import { createAction, props } from '@ngrx/store';

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>()
);
```

**9. Use action creators** — `createAction` keeps actions consistent and type-safe, avoiding type mismatches.

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

**10. Implement lazy loading for feature modules** — load modules only when needed.

```typescript
const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then(m => m.ProductsModule)
  }
];
```

**11. Optimize store usage** — minimize frequent store reads/writes, and batch multiple actions into one where possible to reduce state updates.

**12. Document state structure and actions** — documenting state and actions improves readability and helps the team understand the state logic.

Together these practices promote maintainability, scalability, and performance.

## How do you manage complex side effects in large NgRx applications?

Managing complex side effects at scale requires an organized, maintainable approach.

**1. Organize effects by feature** — keep each domain's side effects together.

```
src/
  app/
    features/
      user/
        store/
          effects/
            user.effects.ts
          actions/
          reducers/
          selectors/
      products/
        store/
          effects/
            product.effects.ts
          actions/
          reducers/
          selectors/
```

**2. Use the `createEffect` function** — clearly specify the actions and side effects involved.

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { loadUsers, loadUsersSuccess, loadUsersFailure } from './user.actions';

@Injectable()
export class UserEffects {
  loadUsers$ = createEffect(() => this.actions$.pipe(
    ofType(loadUsers),
    mergeMap(() => this.userService.getAllUsers().pipe(
      map(users => loadUsersSuccess({ users })),
      catchError(error => of(loadUsersFailure({ error: error.message })))
    ))
  ));

  constructor(
    private actions$: Actions,
    private userService: UserService
  ) {}
}
```

**3. Choose the right mapping operator:** `mergeMap` (concurrent requests), `switchMap` (cancel previous when a new one arrives, e.g., search), `concatMap` (sequential/queued operations).

```typescript
import { switchMap } from 'rxjs/operators';

loadSearchResults$ = createEffect(() => this.actions$.pipe(
  ofType(searchQuery),
  switchMap(query => this.searchService.search(query).pipe(
    map(results => searchResultsSuccess({ results })),
    catchError(error => of(searchResultsFailure({ error: error.message })))
  ))
));
```

**4. Handle multiple actions** — use `concat` to combine several requests/dispatches.

```typescript
import { concat } from 'rxjs';

loadData$ = createEffect(() => this.actions$.pipe(
  ofType(loadData),
  mergeMap(() =>
    concat(
      this.dataService.getData1().pipe(map(data1 => loadData1Success({ data1 }))),
      this.dataService.getData2().pipe(map(data2 => loadData2Success({ data2 })))
    ).pipe(
      catchError(error => of(loadDataFailure({ error: error.message })))
    )
  )
));
```

**5. Coordinate multiple actions** — for complex flows, use separate effects or action creators (e.g., sequential processing with `concatMap`).

```typescript
import { concatMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

processData$ = createEffect(() => this.actions$.pipe(
  ofType(startProcess),
  concatMap(() =>
    this.dataService.process().pipe(
      map(result => processSuccess({ result })),
      catchError(error => of(processFailure({ error: error.message })))
    )
  )
));
```

**6. Use the `Actions` observable wisely** — react to multiple action types and manage subscriptions to avoid memory leaks.

```typescript
import { Actions, createEffect, ofType } from '@ngrx/effects';

@Injectable()
export class MyEffects {
  myEffect$ = createEffect(() => this.actions$.pipe(
    ofType(action1, action2)
    // handle actions
  ));
}
```

**7. Avoid overly complex effects** — break large effects into smaller ones, each with a single clear responsibility.

**8. Use error-handling strategies** — handle error scenarios gracefully and give user-friendly feedback.

```typescript
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

loadItems$ = createEffect(() => this.actions$.pipe(
  ofType(loadItems),
  mergeMap(() => this.itemService.getItems().pipe(
    map(items => loadItemsSuccess({ items })),
    catchError(error => of(loadItemsFailure({ error: error.message })))
  ))
));
```

**9. Test effects thoroughly** — write unit tests covering different scenarios using `@ngrx/effects/testing` to mock dependencies and actions.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { cold, hot } from 'jasmine-marbles';
import { UserEffects } from './user.effects';
import { UserService } from './user.service';
import { loadUsers, loadUsersSuccess, loadUsersFailure } from './user.actions';

describe('UserEffects', () => {
  let effects: UserEffects;
  let actions$: Observable<Action>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UserService', ['getAllUsers']);
    TestBed.configureTestingModule({
      providers: [
        UserEffects,
        provideMockActions(() => actions$),
        { provide: UserService, useValue: spy }
      ]
    });
    effects = TestBed.inject(UserEffects);
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should return a loadUsersSuccess action, with users, on success', () => {
    const users = [{ id: 1, name: 'User1' }];
    const action = loadUsers();
    const outcome = loadUsersSuccess({ users });
    actions$ = hot('-a-', { a: action });
    const response = cold('-b|', { b: users });
    userService.getAllUsers.and.returnValue(response);
    const expected = cold('--c', { c: outcome });
    expect(effects.loadUsers$).toBeObservable(expected);
  });
});
```

**10. Document and refactor** — document each effect's purpose and refactor regularly to avoid technical debt.

By organizing by feature, choosing the right operators, coordinating actions carefully, handling errors robustly, and testing thoroughly, you can manage complex side effects with maintainability, clarity, and scalability.
