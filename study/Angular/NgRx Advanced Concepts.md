# NgRx Advanced Concepts

## Questions Covered

1. What is Entity State in NgRx, and how is it managed?
2. What are NgRx Schematics, and how can they help in building applications?
3. How do you use @ngrx/entity to manage collections in the state?
4. What is the role of the combineReducers() function in NgRx?
5. How do you handle error states in NgRx?

## What is Entity State in NgRx, and how is it managed?

**Entity State** is a pattern for managing collections of entities (items, records) in a normalized, efficient way — especially useful for large datasets or frequent collection operations.

**An entity state typically contains:**

- **Entities** — the data items.
- **Entity IDs** — a unique identifier per entity.
- **Entity collection** — an object keyed by entity ID with the entity as the value.
- **Metadata** — optional fields like loading status or pagination.

**1. Entity Adapter** — the `@ngrx/entity` package provides `createEntityAdapter`, which supplies methods (`setAll`, `addOne`, `updateOne`, `removeOne`) and selectors for normalized collections:

```typescript
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Product } from './product.model';
import { addProduct, loadProductsSuccess } from './product.actions';

export interface ProductState extends EntityState<Product> {
  loading: boolean;
}

export const productAdapter: EntityAdapter<Product> = createEntityAdapter<Product>();

export const initialProductState: ProductState = productAdapter.getInitialState({
  loading: false
});

export const productReducer = createReducer(
  initialProductState,
  on(loadProductsSuccess, (state, { products }) =>
    productAdapter.setAll(products, { ...state, loading: false })
  ),
  // Other cases...
);
```

**2. Selectors** — the adapter's `getSelectors()` provides `selectAll` (array of entities) and `selectEntities` (ID-keyed object); you can compose custom selectors like `selectProductById`:

```typescript
import { createSelector } from '@ngrx/store';
import { productAdapter, ProductState } from './product.reducer';

const { selectAll, selectEntities } = productAdapter.getSelectors();

export const selectProductsState = (state: AppState) => state.products;

export const selectAllProducts = createSelector(
  selectProductsState,
  selectAll
);
export const selectProductEntities = createSelector(
  selectProductsState,
  selectEntities
);
export const selectProductById = (id: number) => createSelector(
  selectProductEntities,
  entities => entities[id]
);
```

**3. Reducers** — use adapter methods to update state efficiently; e.g., `setAll` replaces the whole collection and `addOne` adds an entity:

```typescript
export const productReducer = createReducer(
  initialProductState,
  on(loadProductsSuccess, (state, { products }) =>
    productAdapter.setAll(products, { ...state, loading: false })
  ),
  on(addProduct, (state, { product }) =>
    productAdapter.addOne(product, state)
  ),
  // Other cases...
);
```

**Benefits:** normalized data makes updates and queries efficient, performance improves for large collections, and the adapter's predefined methods ensure consistent access and manipulation.

## What are NgRx Schematics, and how can they help in building applications?

NgRx Schematics are Angular CLI code generators that scaffold NgRx boilerplate — actions, reducers, effects, selectors, and feature modules — streamlining setup and reducing manual coding.

**How they help:**

- **Automate boilerplate** — generate actions (with types/payloads), reducers (structure + initial state), effects, selectors, and feature modules.
- **Consistent structure** — enforce uniform code organization and naming, valuable in large projects and teams.
- **Reduce manual configuration** — add NgRx dependencies and wire up `StoreModule`/`EffectsModule` in `AppModule`, cutting configuration errors.
- **Simplify state setup** — scaffold a complete feature's state management at once.
- **Improve efficiency** — free developers to focus on application logic instead of boilerplate.

**Common commands:**

```bash
ng generate @ngrx/schematics:action [name] --creators
ng generate @ngrx/schematics:reducer [name]
ng generate @ngrx/schematics:effect [name]
ng generate @ngrx/schematics:selector [name]
ng generate @ngrx/schematics:feature [name] --module [module]
```

`action --creators` generates action creators, `reducer` sets up a reducer with initial state, `effect` scaffolds side-effect handling, `selector` creates a selector file, and `feature` sets up a full feature module (actions, reducers, effects).

**Example** — scaffolding NgRx for a "Products" feature:

```bash
ng generate @ngrx/schematics:action loadProducts --creators
ng generate @ngrx/schematics:reducer products
ng generate @ngrx/schematics:effect products
ng generate @ngrx/schematics:selector products
```

In short, NgRx Schematics ensure consistency, reduce manual configuration, and improve development efficiency when integrating NgRx.

## How do you use @ngrx/entity to manage collections in the state?

`@ngrx/entity` manages collections in a normalized, efficient way, providing utilities for add, update, remove, and query operations.

**1. Set up state** — extend `EntityState` and create an adapter:

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

**2. Create actions** for the collection operations:

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
export const addProduct = createAction(
  '[Product] Add Product',
  props<{ product: Product }>()
);
export const updateProduct = createAction(
  '[Product] Update Product',
  props<{ product: Product }>()
);
export const deleteProduct = createAction(
  '[Product] Delete Product',
  props<{ id: number }>()
);
```

**3. Create the reducer** using adapter methods (`setAll`, `addOne`, `updateOne`, `removeOne`):

```typescript
import { createReducer, on } from '@ngrx/store';
import { productAdapter, ProductState, initialProductState } from './product.model';
import { loadProductsSuccess, addProduct, updateProduct, deleteProduct } from './product.actions';

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
  ),
  on(deleteProduct, (state, { id }) =>
    productAdapter.removeOne(id, state)
  )
);
```

**4. Create selectors** from the adapter's default selectors plus custom ones:

```typescript
import { createSelector } from '@ngrx/store';
import { productAdapter, ProductState } from './product.model';

const { selectAll, selectEntities } = productAdapter.getSelectors();

export const selectProductState = (state: AppState) => state.products;

export const selectAllProducts = createSelector(
  selectProductState,
  selectAll
);
export const selectProductEntities = createSelector(
  selectProductState,
  selectEntities
);
export const selectProductById = (id: number) => createSelector(
  selectProductEntities,
  entities => entities[id]
);
```

**5. Use in effects** — handle side effects like HTTP loads, then dispatch success/failure:

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
    mergeMap(() => this.productService.getAll()
      .pipe(
        map(products => loadProductsSuccess({ products })),
        catchError(error => of(loadProductsFailure({ error: error.message })))
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

Using `@ngrx/entity` yields cleaner, more maintainable code and better performance when managing collections.

## What is the role of the combineReducers() function in NgRx?

`combineReducers()` merges multiple reducers — each managing a slice of state — into a single root reducer that delegates updates to the appropriate reducer based on the state slice.

**Its role:**

- **Combines reducers** into one function.
- **Organizes state management** by splitting state into smaller, maintainable slices instead of one large reducer.
- **Creates a root reducer** that can be passed to `StoreModule.forRoot()` to manage the whole state tree.

**1. Define reducers per slice:**

```typescript
// products.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { ProductState, productAdapter, initialProductState } from './product.model';
import { addProduct, loadProductsSuccess } from './product.actions';

export const productReducer = createReducer(
  initialProductState,
  on(loadProductsSuccess, (state, { products }) => productAdapter.setAll(products, state)),
  on(addProduct, (state, { product }) => productAdapter.addOne(product, state))
);

// user.reducer.ts
import { createReducer, on } from '@ngrx/store';
import { UserState, initialUserState } from './user.model';
import { setUser, clearUser } from './user.actions';

export const userReducer = createReducer(
  initialUserState,
  on(setUser, (state, { user }) => ({ ...state, user })),
  on(clearUser, (state) => ({ ...state, user: null }))
);
```

**2. Combine them** into a root reducer (typically via an `ActionReducerMap`):

```typescript
import { ActionReducerMap, combineReducers } from '@ngrx/store';
import { productReducer } from './products.reducer';
import { userReducer } from './user.reducer';

export interface AppState {
  products: ProductState;
  user: UserState;
}

export const reducers: ActionReducerMap<AppState> = {
  products: productReducer,
  user: userReducer
};
```

**3. Provide it to `StoreModule.forRoot()`:**

```typescript
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { reducers } from './app.state';

@NgModule({
  imports: [
    StoreModule.forRoot(reducers)
  ],
})
export class AppModule { }
```

In short, `combineReducers()` keeps state management modular and maintainable, making complex apps easier to scale.

## How do you handle error states in NgRx?

Error handling in NgRx means capturing errors during async operations, recording them in state, and surfacing messages to users.

**1. Define error actions** carrying the error payload:

```typescript
import { createAction, props } from '@ngrx/store';

export const loadItemsFailure = createAction(
  '[Items] Load Items Failure',
  props<{ error: any }>()
);
```

**2. Add an error field to state** and handle error actions in the reducer:

```typescript
import { EntityState } from '@ngrx/entity';
import { Item } from './item.model';

export interface ItemState extends EntityState<Item> {
  loading: boolean;
  error: string | null;
}

export const initialItemState: ItemState = {
  ids: [],
  entities: {},
  loading: false,
  error: null
};
```

```typescript
import { createReducer, on } from '@ngrx/store';
import { loadItemsFailure, loadItemsSuccess } from './item.actions';
import { ItemState, initialItemState } from './item.model';

export const itemReducer = createReducer(
  initialItemState,
  on(loadItemsSuccess, (state, { items }) => ({
    ...state,
    loading: false,
    error: null,
    entities: items.reduce((entities, item) => {
      entities[item.id] = item;
      return entities;
    }, {})
  })),
  on(loadItemsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error: error
  }))
);
```

**3. Catch errors in effects** and dispatch the failure action:

```typescript
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ItemService } from './item.service';
import { loadItems, loadItemsFailure, loadItemsSuccess } from './item.actions';

@Injectable()
export class ItemEffects {
  loadItems$ = createEffect(() => this.actions$.pipe(
    ofType(loadItems),
    mergeMap(() => this.itemService.getAll()
      .pipe(
        map(items => loadItemsSuccess({ items })),
        catchError(error => of(loadItemsFailure({ error: error.message })))
      )
    )
  ));

  constructor(
    private actions$: Actions,
    private itemService: ItemService
  ) {}
}
```

**4. Select and display the error** via a selector and the `async` pipe:

```typescript
import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ItemState } from './item.model';

export const selectItemState = (state: AppState) => state.items;
export const selectError = createSelector(
  selectItemState,
  (state: ItemState) => state.error
);
```

```typescript
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectError } from './item.selectors';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html'
})
export class ItemListComponent implements OnInit {
  error$ = this.store.select(selectError);
  constructor(private store: Store) {}
  ngOnInit() {}
}
```

```html
<div *ngIf="error$ | async as error">
  <p>Error: {{ error }}</p>
</div>
```

Together — error actions, error state in reducers, error catching in effects, and selectors for display — these strategies provide robust error management and a better user experience.
