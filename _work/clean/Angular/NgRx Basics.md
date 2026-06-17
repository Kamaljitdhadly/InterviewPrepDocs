# NgRx Basics

## Questions Covered

1. What is NgRx, and why is it used in Angular applications?
2. Explain the core principles of NgRx.
3. What are the main building blocks of NgRx?
4. What is the role of the Store in NgRx?
5. How does NgRx handle state management in Angular?
6. What are actions in NgRx?
7. What is a reducer, and how does it work in NgRx?
8. What is the @ngrx/store package?
9. How do you dispatch an action in NgRx?
10. Explain the flow of data in an NgRx application.

## What is NgRx, and why is it used in Angular applications?

**NgRx** is a reactive state management library for Angular applications that implements the **Redux** pattern using **RxJS**. It helps manage application state in a predictable and maintainable way by centralizing state, making it easier to scale, test, and debug complex applications.

### Key Concepts of NgRx

1.  **Store**: The centralized state container that holds the application's global state.

2.  **Actions**: Events that represent a change or request to the state (e.g., user interaction, API call results).

3.  **Reducers**: Functions that handle how the state changes in response to actions.

4.  **Selectors**: Functions to retrieve slices of the state from the store.

5.  **Effects**: Manage side effects like asynchronous operations (e.g., API calls) by handling actions outside of reducers using RxJS.

### Why NgRx is Used

1.  **Centralized State Management**: NgRx centralizes the application's state in one store, making it easier to manage and track state changes.

2.  **Predictable State Flow**: NgRx follows a strict unidirectional data flow (action → reducer → new state), making it easy to predict and understand how state changes occur.

3.  **Immutability**: NgRx enforces immutable updates, ensuring the state is not mutated directly, which helps maintain data integrity.

4.  **Easier Debugging**: The use of actions and reducers makes it easier to trace state changes. Tools like NgRx DevTools also allow you to visualize state transitions and time travel through state changes.

5.  **Scalability**: In large applications, managing state across components can become complex. NgRx provides a scalable structure to handle large stateful applications.

6.  **Separation of Concerns**: NgRx allows developers to separate UI logic from state management logic, promoting cleaner code and better maintainability.

7.  **RxJS Integration**: NgRx leverages RxJS for handling asynchronous operations, enabling powerful reactive programming patterns.

### When to Use NgRx

- For applications with complex state requirements, such as multiple components sharing and interacting with the same data.

- When you need to track the state over time and debug state transitions.

- When managing asynchronous operations like HTTP requests or WebSocket events.

By using NgRx, Angular developers can maintain a clean, consistent, and scalable approach to handling state in their applications.

## Explain the core principles of NgRx.

The core principles of **NgRx** are based on the **Redux** pattern, which provides a structured and predictable way to manage state in Angular applications. These principles help ensure that state management is organized, scalable, and maintainable. The key principles of NgRx are:

### 1. Single Source of Truth (Store)

NgRx uses a single store to hold the entire application’s state. This global state is a plain JavaScript object (or collection of objects) that represents the state of your application at any given time.

- **Purpose**: The centralized state ensures that all components in the application access the same, consistent data, which makes state management predictable and traceable.

- **Example**: Instead of each component holding its own data, all data is stored in a single state object in the store, making it easy to manage the application’s state in one place.

```typescript
interface AppState {
user: UserState;
products: ProductsState;
}
```

### 2. State is Read-Only

State in NgRx is immutable, meaning that the state can only be modified by dispatching actions. Components and services do not directly modify the state; instead, they dispatch actions that describe what should change.

- **Purpose**: This guarantees that all changes to the state are predictable and traceable. It also simplifies debugging and ensures that accidental state mutations are avoided.

- **Example**: If you want to update a product list, you dispatch an action like AddProduct instead of directly mutating the state.

```typescript
store.dispatch({ type: '[Product] Add Product', payload: product });
```

### 3. Actions Describe State Changes

An **action** is an event that describes something that happened in the application, such as a user interaction or an API request. Actions contain a type and optional payload. These actions tell the store that the state needs to be changed.

- **Purpose**: Actions serve as the only way to initiate state changes, providing a clear structure for how changes occur.

- **Example**: A user login action might look like this:

```typescript
export const login = createAction(
'[Auth] Login',
props<{ username: string, password: string }>()
);
```

### 4. Reducers Specify How the State Changes

A **reducer** is a pure function that takes the current state and an action as inputs and returns a new state. Reducers define how the state should change in response to actions, but they do not directly modify the existing state.

- **Purpose**: Reducers ensure that the state transitions are predictable and based on the type of action dispatched.

- **Example**: If the login action is dispatched, the reducer will update the state accordingly:

```typescript
const authReducer = createReducer(
initialState,
on(login, (state, { username }) => ({
```

...state, // spread the previous state

isLoggedIn: true,

username: username

```typescript
}))
);
```

### 5. Selectors for Accessing State

**Selectors** are pure functions used to select and retrieve slices of the store’s state. They provide a way to extract the necessary state for a specific component or service in a performant way.

- **Purpose**: Selectors encapsulate logic for accessing specific pieces of the state and improve performance by memoizing the state selection.

- **Example**: A selector to get the authenticated user might look like this:

```typescript
export const selectUser = (state: AppState) => state.auth.user;
```

### 6. Side Effects Handled by Effects

In NgRx, side effects such as HTTP requests or other asynchronous operations are handled by **Effects**. Effects listen for actions and, when triggered, perform tasks outside of the reducers (such as fetching data from an API), then dispatch new actions based on the results of those operations.

- **Purpose**: This separation ensures that side effects (like HTTP requests) are handled outside of reducers, keeping reducers pure and synchronous.

- **Example**: An effect to load products from an API might look like this:

```typescript
@Injectable()
export class ProductEffects {
loadProducts$ = createEffect(() =>
this.actions$.pipe(
ofType(loadProducts),
mergeMap(() => this.productService.getAll()
.pipe(
map(products => loadProductsSuccess({ products })),
catchError(error => of(loadProductsFailure({ error })))
)
)
)
);
}
```

### 7. Unidirectional Data Flow

NgRx enforces a **unidirectional data flow**, meaning that the state flows in a single direction through the application:

1.  **Actions** are dispatched in response to events or user interactions.

2.  **Reducers** receive the actions and generate new state.

3.  **Selectors** are used to retrieve the current state from the store.

4.  Components subscribe to these selectors to get the current state and reflect the changes in the UI.

- **Purpose**: Unidirectional data flow makes state changes predictable and easier to trace, as each state change can be tracked through the dispatching of actions.

- **Example**: When a user clicks a button to fetch data, an action is dispatched, reducers update the state, selectors retrieve the updated state, and the component re-renders based on the new state.

### 8. Immutability

State in NgRx is immutable, meaning it cannot be modified directly. Instead, a new copy of the state is created whenever a change occurs. This ensures that the application’s state history is preserved and changes are easy to track.

- **Purpose**: Immutability helps avoid accidental mutations of the state and allows time-travel debugging (undo/redo of state changes).

- **Example**: When updating the state in a reducer, instead of modifying the state directly, a new state object is returned:

```typescript
const authReducer = createReducer(
initialState,
on(loginSuccess, (state, { user }) => ({
```

...state, // Spread the previous state

user: user // Create a new state with the updated user

```typescript
}))
);
```

### Summary of NgRx Core Principles

- **Single Source of Truth**: The entire application state is stored in a single store.

- **State is Read-Only**: State changes only via actions, ensuring immutability.

- **Actions Describe Changes**: All state changes are triggered by actions.

- **Reducers Change State**: Reducers handle how state updates occur based on actions.

- **Selectors Access State**: Selectors are used to read specific parts of the state efficiently.

- **Effects Handle Side Effects**: Asynchronous operations and side effects are managed by effects, outside of reducers.

- **Unidirectional Data Flow**: The flow of data is one-directional, ensuring predictability.

- **Immutability**: State is immutable, preserving the history of state changes and enabling time-travel debugging.

These principles provide a robust and predictable structure for state management in Angular applications using NgRx.

## What are the main building blocks of NgRx?

The main building blocks of **NgRx** are the core components that enable state management following the **Redux** pattern within Angular applications. These building blocks help structure and manage state, actions, and side effects effectively. The key building blocks are:

### 1. Store

The **store** is the centralized state container that holds the application’s global state. It represents the "single source of truth" for the application's data and serves as the interface to interact with the state.

- **Purpose**: The store maintains the current state of the application and allows access to the state for reading, updating, and observing changes.

- **Example**: The store could contain states such as user data, product lists, or application settings.

```typescript
interface AppState {
user: UserState;
products: ProductState;
}
```

### 2. Actions

**Actions** are payloads of information that describe events or intent to change the state. They consist of a type (a string representing the action) and optionally a payload (data associated with the action). Actions are dispatched to signal the store that a state change is needed.

- **Purpose**: Actions describe what happened in the application (e.g., a user logs in, or data is fetched) and trigger state updates via reducers.

- **Example**: An action for user login might look like this:

```typescript
export const login = createAction(
'[Auth] Login',
props<{ username: string, password: string }>()
);
```

### 3. Reducers

A **reducer** is a pure function that defines how the state changes in response to an action. It takes the current state and an action as inputs and returns a new state. Reducers ensure that the state updates are predictable and follow the immutability principle.

- **Purpose**: Reducers handle how the state changes based on dispatched actions. They guarantee that state changes are pure, predictable, and traceable.

- **Example**: A reducer for handling user login might look like this:

```typescript
const authReducer = createReducer(
initialState,
on(loginSuccess, (state, { user }) => ({
```

...state, // Copy the previous state

user: user, // Update the user in the new state

isLoggedIn: true

```typescript
}))
);
```

### 4. Selectors

**Selectors** are functions used to retrieve specific slices of state from the store. They allow components and services to access the state in a performant and organized way. Selectors can also combine and compute derived state based on the store’s data.

- **Purpose**: Selectors make it easy to access specific parts of the state and promote separation of concerns by keeping state query logic encapsulated.

- **Example**: A selector to get the current user might look like this:

```typescript
export const selectUser = (state: AppState) => state.auth.user;
```

### 5. Effects

**Effects** handle side effects, such as asynchronous operations like HTTP requests or other external services. Effects listen for dispatched actions and, when triggered, perform the required task (e.g., fetching data from an API) before dispatching new actions based on the outcome (e.g., success or failure).

- **Purpose**: Effects manage complex asynchronous operations while keeping reducers pure and focused on state transitions.

- **Example**: An effect that loads products from an API might look like this:

```typescript
@Injectable()
export class ProductEffects {
loadProducts$ = createEffect(() =>
this.actions$.pipe(
ofType(loadProducts),
mergeMap(() => this.productService.getAll()
.pipe(
map(products => loadProductsSuccess({ products })),
catchError(error => of(loadProductsFailure({ error })))
)
)
)
);
}
```

### 6. Entities

**NgRx Entity** is an additional feature that simplifies handling collections of data within the store. It provides utility functions for managing collections of entities, including common operations such as adding, updating, and deleting entities.

- **Purpose**: NgRx Entity helps standardize and simplify the handling of large sets of data in the store, reducing boilerplate code.

- **Example**: An entity state for products might look like this:

```typescript
export interface ProductState extends EntityState<Product> {
selectedProductId: string | null;
}
```

### 7. DevTools

The **NgRx DevTools** extension provides tools for time-travel debugging and visualizing state changes over time. It allows developers to inspect actions, state changes, and re-run past actions to debug the application effectively.

- **Purpose**: DevTools improve debugging and offer a clear way to trace state transitions, replay actions, and track performance.

- **Example**: DevTools help track the sequence of actions dispatched in the application and visualize the state changes in a timeline.

### 8. Router Store

The **Router Store** module integrates Angular’s router with NgRx. It allows the router state (the URL, route parameters, query parameters, etc.) to be managed within the NgRx store, giving easy access to routing information.

- **Purpose**: Router Store synchronizes the router state with the NgRx store, allowing developers to react to navigation events within the NgRx flow.

- **Example**: Router selectors can access the router state for route-based logic or guards.

```typescript
export const selectCurrentUrl = createSelector(
selectRouterState,
(router) => router.state.url
);
```

### Summary of NgRx Building Blocks

1.  **Store**: Holds the entire application state, providing a single source of truth.

2.  **Actions**: Describe events that trigger changes in the state.

3.  **Reducers**: Pure functions that define how state changes based on actions.

4.  **Selectors**: Functions to retrieve specific parts of the state in a performant way.

5.  **Effects**: Handle side effects like API calls and other asynchronous tasks.

6.  **Entities**: Simplifies the handling of collections of entities in the state.

7.  **DevTools**: A tool for debugging, time-traveling, and visualizing state changes.

8.  **Router Store**: Synchronizes Angular’s router state with the NgRx store.

These building blocks work together to provide a robust and scalable approach to state management in Angular applications using the Redux pattern.

## What are actions in NgRx?

In NgRx, **actions** are a fundamental concept used to represent events or intentions that trigger changes in the application state. Actions are payloads of information that describe what happened in the application, and they serve as the primary mechanism for interacting with the store. Here's a detailed explanation of actions in NgRx:

### Key Characteristics of Actions

1.  **Descriptive Events**

    - Actions describe what occurred in the application. They are often named based on the type of event, such as user interactions (e.g., "Login", "Add Item") or system events (e.g., "Load Data Success", "Update Error").

2.  **Immutable**

    - Actions are plain objects and are typically immutable. Once created, they do not change. This immutability ensures that actions are predictable and can be easily logged and inspected.

3.  **Type and Payload**

    - Actions have a type property, which is a string that uniquely identifies the action. Optionally, actions can also include a payload property, which carries additional data required to perform a state change.

### Structure of an Action

An action in NgRx typically has the following structure:

- **Type**: A string constant representing the action's type.

- **Payload** (optional): Additional data that provides context for the action.

```typescript
export const actionType = '[Feature] Action Name';
export const actionCreator = createAction(
actionType,
props<{ payloadProperty: string }>()
);
```

### Example of an Action

For a login action, you might define it like this:

```typescript
import { createAction, props } from '@ngrx/store';
export const login = createAction(
'[Auth] Login',
props<{ username: string; password: string }>()
);
```

In this example:

- The type is "[Auth] Login", which describes the action.

- The payload is an object containing username and password, which are required for the login process.

### How Actions Are Used

1.  **Dispatching Actions**

    - Actions are dispatched to the store to signal that something has happened or that a change should be made. Components or services dispatch actions when they need to request a state update.

```typescript
this.store.dispatch(login({ username: 'user', password: 'pass' }));
```

2.  **Handling Actions in Reducers**

    - Reducers listen for specific actions and determine how the state should change in response to those actions. The reducer receives the current state and the action as arguments and returns a new state based on the action.

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

3.  **Effects for Asynchronous Actions**

    - Actions can trigger side effects, such as asynchronous operations (e.g., API calls). **Effects** listen for actions and perform these side effects, dispatching new actions based on the result.

```typescript
@Injectable()
export class AuthEffects {
login$ = createEffect(() =>
this.actions$.pipe(
ofType(login),
mergeMap(action => this.authService.login(action.username, action.password)
.pipe(
map(user => loginSuccess({ user })),
catchError(() => of(loginFailure()))
)
)
)
);
}
```

4.  **Selectors and Actions**

    - Components can use **selectors** to get specific parts of the state in response to actions. Selectors retrieve and present data from the state that has been updated as a result of actions.

### Summary of Actions in NgRx

- **Description**: Actions represent events or intentions that trigger state changes.

- **Immutable**: Actions are plain objects that do not change once created.

- **Type and Payload**: Actions include a type to identify them and an optional payload for additional data.

- **Dispatch**: Actions are dispatched to signal that something has happened.

- **Reducers**: Reducers handle state changes based on the actions dispatched.

- **Effects**: Effects manage side effects triggered by actions.

- **Selectors**: Components use selectors to access updated state based on actions.

Actions are central to NgRx's architecture, enabling a clear, structured approach to managing state changes and handling side effects in Angular applications.

## What is a reducer, and how does it work in NgRx?

In NgRx, a **reducer** is a pure function responsible for handling state changes in response to actions. It takes the current state and an action as inputs and returns a new state. Reducers are central to the NgRx architecture, as they define how the application state should be updated based on the actions dispatched.

### Key Characteristics of Reducers

1.  **Pure Functions**

    - Reducers are pure functions, meaning they do not have side effects, and their output is determined solely by their input. Given the same inputs, a reducer will always produce the same output.

2.  **Immutable State Updates**

    - Reducers do not modify the current state directly. Instead, they return a new state object with the updated values. This approach adheres to the immutability principle, ensuring that the state remains predictable and traceable.

3.  **Handle Actions**

    - Reducers process actions by determining how the state should change based on the type of the action and any associated payload.

### Structure of a Reducer

A reducer function typically has the following signature:

```typescript
(state: State, action: Action) => State
```

- **State**: The current state of the application or feature.

- **Action**: The action dispatched to indicate that something has happened.

- **Returns**: A new state object reflecting the changes based on the action.

### How Reducers Work in NgRx

1.  **Define Initial State**

    - The initial state represents the starting point for the state before any actions are processed. It's typically defined as a constant or part of the module setup.

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

2.  **Create a Reducer Function**

    - The reducer function is created using NgRx’s createReducer function, which allows you to specify how the state should change for different actions using the on function.

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

- **createReducer**: A function that helps define the reducer in a more declarative way.

- **on**: A function that maps actions to state transformations. Each on call specifies how the state should change when a specific action is dispatched.

3.  **Update the Store**

    - When an action is dispatched, NgRx uses the reducer to compute the new state. The store updates its state with the new object returned by the reducer.

```typescript
this.store.dispatch(login({ username: 'user', password: 'pass' }));
```

- The reducer will handle this action and produce a new state, which the store then updates.

4.  **Combine Multiple Reducers**

    - In a large application, you might have multiple reducers managing different slices of the state. You can combine these reducers using combineReducers to create a root reducer that manages the overall state.

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

### Summary of Reducers in NgRx

- **Definition**: A reducer is a pure function that takes the current state and an action and returns a new state.

- **Immutability**: Reducers do not mutate the current state but return a new state object.

- **Handling Actions**: Reducers process actions to update the state based on the action's type and payload.

- **Initial State**: The starting point of the state before any actions are processed.

- **Create Reducer**: Use createReducer and on to define how state should change in response to actions.

- **Combining Reducers**: Use combineReducers to manage multiple state slices in a large application.

Reducers ensure that state changes are predictable and controlled, adhering to the principles of functional programming and immutability in state management.

## What is the @ngrx/store package?

The @ngrx/store package is a core part of the NgRx library, which provides a robust state management solution for Angular applications. It implements the Redux pattern, enabling predictable state management through a centralized store, actions, reducers, and selectors. Here's an overview of what @ngrx/store offers and how it integrates with Angular:

### Key Features of @ngrx/store

1.  **Centralized State Management**

    - @ngrx/store maintains the application's state in a single, immutable store, making state management more predictable and easier to debug.

2.  **Unidirectional Data Flow**

    - It enforces a unidirectional data flow where state changes are triggered by actions, processed by reducers, and observed through selectors.

3.  **Immutability**

    - State is immutable, meaning changes result in new state objects rather than modifying existing state. This makes state changes predictable and easier to trace.

4.  **Selectors**

    - Selectors are functions used to query and derive pieces of the state. They help components access only the data they need, improving performance and reducing unnecessary re-renders.

5.  **Reducers**

    - Reducers are pure functions that handle state transitions based on the actions dispatched. They compute and return the new state without mutating the existing one.

6.  **Action Dispatching**

    - Actions are dispatched to signal that something has happened in the application. Reducers use these actions to update the state.

7.  **DevTools Integration**

    - @ngrx/store integrates with NgRx DevTools for debugging and inspecting state changes, which is valuable for development and debugging.

### Key Components of @ngrx/store

1.  **Store**

    - The central repository for the application’s state. It allows components to dispatch actions and select pieces of the state.

```typescript
import { Store } from '@ngrx/store';
import { AppState } from './app.state';
import { loadProducts } from './product.actions';
constructor(private store: Store<AppState>) {}
loadProducts() {
this.store.dispatch(loadProducts());
}
```

2.  **Actions**

    - Actions are dispatched to indicate that a change needs to happen. They have a type and an optional payload.

```typescript
import { createAction, props } from '@ngrx/store';
export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction(
'[Product] Load Products Success',
props<{ products: Product[] }>()
);
```

3.  **Reducers**

    - Reducers handle state changes in response to actions. They are pure functions that return a new state based on the current state and the action.

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

4.  **Selectors**

    - Selectors are used to extract specific parts of the state. They help optimize performance by allowing components to subscribe to only the data they need.

```typescript
import { createSelector } from '@ngrx/store';
export const selectProducts = (state: AppState) => state.products;
export const selectAllProducts = createSelector(
selectProducts,
(state: ProductState) => state.products
);
```

5.  **Effects**

    - While not part of @ngrx/store itself, **Effects** are a related concept provided by the @ngrx/effects package. They handle side effects (such as API calls) and dispatch additional actions based on the results.

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
mergeMap(() => this.productService.getProducts()
.pipe(
map(products => loadProductsSuccess({ products }))
)
)
)
);
constructor(
private actions$: Actions,
private productService: ProductService
) {}
}
```

### How to Set Up @ngrx/store

1.  **Install the Package**

    - Install @ngrx/store and related packages via npm.

```typescript
npm install @ngrx/store @ngrx/effects
```

2.  **Configure the Store**

    - Import and configure the store module in your Angular application’s module.

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
],
...
})
export class AppModule { }
```

3.  **Use the Store in Components**

    - Inject the store into your components and use it to dispatch actions and select state.

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

### Summary

- **@ngrx/store** provides a state management solution for Angular applications by implementing the Redux pattern.

- **Store**: Centralized repository for application state.

- **Actions**: Represent events or intentions to change the state.

- **Reducers**: Pure functions that handle state transitions based on actions.

- **Selectors**: Functions to query and derive state.

- **Effects**: Handle side effects and asynchronous operations (from @ngrx/effects).

@ngrx/store helps maintain a clear, structured approach to state management, making it easier to manage complex state logic in Angular applications.
