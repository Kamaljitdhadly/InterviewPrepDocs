# Angular Modern Features

## Questions Covered

1. What are Angular Signals and how do they differ from RxJS observables?
2. How do signal, computed, and effect work?
3. What are standalone components and why use them?
4. How does the new inject() function replace constructor DI?
5. What is the new control flow syntax (@if, @for, @switch)?
6. How does @defer work for lazy loading templates?
7. What is signal-based change detection and zoneless Angular?
8. How do you migrate from NgModules to standalone?
9. When should you still use RxJS alongside signals?
10. What are Angular's input()/output() signal APIs?

## What are Angular Signals and how do they differ from RxJS observables?

**Angular Signals** (introduced in Angular 16, stable in 17+) are a reactive primitive for managing synchronous state. A signal is a wrapper around a value that notifies consumers when the value changes. Signals integrate directly with Angular's template and change-detection system, so reading a signal in a template automatically tracks the dependency.

**RxJS Observables** are push-based streams designed for asynchronous, event-driven data over time. They support operators (`map`, `switchMap`, `debounceTime`, etc.), multicasting, and complex composition. Observables are lazy — nothing happens until you subscribe.

### Key Differences

| Aspect | Signals | Observables |
|--------|---------|-------------|
| Model | Pull (read current value with `()`) | Push (subscribe to receive values) |
| Sync vs async | Synchronous state | Async streams and events |
| Value access | Always has a current value | May not emit yet; needs subscription |
| Cleanup | Automatic via Angular runtime | Manual `unsubscribe` or `takeUntil` |
| Operators | `computed()` for derived state | Rich RxJS operator library |
| Change detection | Fine-grained, signal-aware | Requires `async` pipe or manual CD |

Signals excel at **local, synchronous UI state** (form values, toggles, derived counts). Observables excel at **async workflows** (HTTP, WebSockets, complex event pipelines). Angular's `toSignal()` and `toObservable()` bridge the two.

```typescript
import { Component, signal, computed } from '@angular/core';
import { interval } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
  <p>Signal count: {{ count() }}</p>
  <p>Double: {{ doubleCount() }}</p>
  <p>From observable: {{ ticks() }}</p>
  <button (click)="increment()">+1</button>
  `
})
export class CounterComponent {
  count = signal(0);
  doubleCount = computed(() => this.count() * 2);
  ticks = toSignal(interval(1000), { initialValue: 0 });

  increment() {
    this.count.update(v => v + 1);
  }
}
```

Use signals for component state you read in templates. Use observables when you need streaming, cancellation, or operator chains.

## How do signal, computed, and effect work?

Angular provides three core signal primitives:

### `signal(initialValue)`

Creates a writable signal. Read with `mySignal()`, write with `mySignal.set(value)` or `mySignal.update(fn)`. Each write notifies dependents.

### `computed(fn)`

Creates a read-only derived signal. The function re-runs only when signals read inside it change. Results are memoized — if inputs are unchanged, the cached value is returned without re-executing.

### `effect(fn)`

Runs a side-effect function whenever signals read inside it change. Effects run after the current change-detection cycle (in a microtask). Use for logging, local storage sync, or DOM manipulation outside templates. Avoid writing to signals inside effects (risk of infinite loops). Effects require an injection context (constructor, `runInInjectionContext`, or field initializer).

```typescript
import { Component, signal, computed, effect, inject } from '@angular/core';

interface User { id: number; name: string; }

@Component({
  selector: 'app-user-panel',
  standalone: true,
  template: `
  <input [value]="search()" (input)="onSearch($event)" />
  <p>Filtered: {{ filteredUsers().length }} of {{ users().length }}</p>
  <ul>
    @for (user of filteredUsers(); track user.id) {
      <li>{{ user.name }}</li>
    }
  </ul>
  `
})
export class UserPanelComponent {
  users = signal<User[]>([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
  ]);
  search = signal('');

  filteredUsers = computed(() => {
    const term = this.search().toLowerCase();
    return this.users().filter(u => u.name.toLowerCase().includes(term));
  });

  constructor() {
    effect(() => {
      console.log(`Search "${this.search()}" → ${this.filteredUsers().length} results`);
    });
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
```

**Rules of thumb:** `signal` holds state, `computed` derives state, `effect` reacts to state with side effects. Prefer `computed` over `effect` when the goal is a derived value for the template.

## What are standalone components and why use them?

**Standalone components** (Angular 14+, default in new projects from Angular 17) declare their own dependencies directly via the `imports` array on `@Component`, `@Directive`, or `@Pipe` — no enclosing `NgModule` required.

### Why use them

- **Simpler mental model** — each file lists exactly what it needs; no hunting through module `declarations`/`exports`.
- **Better tree-shaking** — unused standalone artifacts are easier for the bundler to eliminate.
- **Faster bootstrapping** — `bootstrapApplication()` replaces `platformBrowserDynamic().bootstrapModule()`.
- **Easier lazy loading** — route to a component directly with `loadComponent` instead of lazy-loading an entire module.
- **Incremental adoption** — standalone components can still be imported into existing NgModules during migration.

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HighlightDirective } from './highlight.directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, HighlightDirective],
  template: `
  <h1>Dashboard</h1>
  <a routerLink="/settings">Settings</a>
  <button mat-raised-button color="primary">Action</button>
  <p appHighlight>Highlighted text</p>
  `
})
export class DashboardComponent {}
```

Bootstrap a fully standalone app:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
  ]
});
```

NgModules are not deprecated, but new Angular code should default to standalone.

## How does the new inject() function replace constructor DI?

The **`inject()`** function (Angular 14+) retrieves dependencies from the current injection context without constructor parameters. It works in constructors, field initializers, factory functions, functional guards/resolvers, and `runInInjectionContext`.

### Advantages over constructor DI

- **Cleaner classes** — no boilerplate constructor parameters and `private` keyword repetition.
- **Composable providers** — use `inject()` inside `provideX()` factory functions.
- **Functional route guards** — guards as plain functions instead of injectable classes.
- **Base-class friendly** — inject in field initializers when inheritance makes constructor DI awkward.

`inject()` must be called in an **injection context** (constructor, field initializer, `runInInjectionContext`, or environment initializer). Calling it in arbitrary methods throws a runtime error.

```typescript
import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `<h1>{{ user()?.name }}</h1>`
})
export class ProfileComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  userId = this.route.snapshot.paramMap.get('id');
  user = toSignal(this.userService.getUser(this.userId!));
}
```

Functional guard example:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/login']);
};
```

Constructor DI still works and is not deprecated. Many teams use `inject()` for new code and keep constructors for classes that already use them.

## What is the new control flow syntax (@if, @for, @switch)?

Angular 17 introduced **built-in control flow** — block syntax in templates that replaces structural directives `*ngIf`, `*ngFor`, and `ngSwitch`. The new syntax is built into the compiler (not a directive), supports better type narrowing, and improves performance.

### `@if` / `@else if` / `@else`

Replaces `*ngIf`. Supports `@else` and `@else if` blocks inline without wrapper elements.

### `@for`

Replaces `*ngFor`. Requires an explicit `track` expression (like `track item.id`) for efficient DOM reconciliation. Supports `@empty` block when the collection has no items.

### `@switch` / `@case` / `@default`

Replaces `ngSwitch`. Cleaner syntax with `@case` and `@default` blocks.

```html
@if (isLoading()) {
  <app-spinner />
} @else if (error()) {
  <p class="error">{{ error() }}</p>
} @else {
  <h2>{{ title() }}</h2>

  @for (item of items(); track item.id) {
    <article>
      <h3>{{ item.name }}</h3>
      @switch (item.status) {
        @case ('active') {
          <span class="badge green">Active</span>
        }
        @case ('pending') {
          <span class="badge yellow">Pending</span>
        }
        @default {
          <span class="badge gray">Unknown</span>
        }
      }
    </article>
  } @empty {
    <p>No items found.</p>
  }
}
```

```typescript
import { Component, signal } from '@angular/core';

interface Item { id: number; name: string; status: string; }

@Component({
  selector: 'app-item-list',
  standalone: true,
  templateUrl: './item-list.component.html'
})
export class ItemListComponent {
  isLoading = signal(false);
  error = signal<string | null>(null);
  title = signal('My Items');
  items = signal<Item[]>([
    { id: 1, name: 'Widget', status: 'active' },
    { id: 2, name: 'Gadget', status: 'pending' },
  ]);
}
```

The Angular CLI schematic `ng generate @angular/core:control-flow` migrates existing `*ngIf`/`*ngFor`/`ngSwitch` templates automatically.

## How does @defer work for lazy loading templates?

**`@defer`** (Angular 17+) lazily loads a template block and its dependencies. The block's component imports are split into a separate JavaScript chunk, loaded only when the defer trigger fires. This reduces initial bundle size and improves Time to Interactive.

### Triggers

- **`on idle`** — when the browser is idle (default if no trigger specified).
- **`on viewport`** — when the block enters the viewport (Intersection Observer).
- **`on interaction`** — on click or keydown within a placeholder.
- **`on hover`** — on pointer hover over a placeholder.
- **`on immediate`** — load as soon as possible after initial render.
- **`on timer(delay)`** — after a specified delay.
- **`when condition`** — when a boolean expression becomes true.

### Placeholder, loading, and error blocks

Use `@placeholder` (shown before loading), `@loading` (shown during fetch), and `@error` (shown on failure) for progressive UX.

```html
@defer (on viewport) {
  <app-heavy-chart [data]="chartData()" />
} @placeholder {
  <div class="chart-skeleton">Chart loading soon…</div>
} @loading (minimum 300ms) {
  <app-spinner />
} @error {
  <p>Failed to load chart. <button (click)="retry()">Retry</button></p>
}

@defer (on interaction) {
  <app-admin-panel />
} @placeholder {
  <button>Load Admin Panel</button>
}

@defer (when showComments()) {
  <app-comments [postId]="postId()" />
}
```

```typescript
import { Component, signal } from '@angular/core';
import { HeavyChartComponent } from './heavy-chart.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [HeavyChartComponent],
  templateUrl: './analytics.component.html'
})
export class AnalyticsComponent {
  chartData = signal<number[]>([10, 25, 40, 30]);
  showComments = signal(false);
  postId = signal(42);

  retry() { /* re-trigger defer by toggling condition */ }
}
```

`@defer` is ideal for below-the-fold content, modals, tabs, and heavy third-party widgets that are not needed on first paint.

## What is signal-based change detection and zoneless Angular?

Traditional Angular change detection relies on **Zone.js** to monkey-patch async APIs (`setTimeout`, `Promise`, DOM events) and trigger a full application-wide check after every async task. This is simple but can be expensive in large apps.

### Signal-based change detection

When a template reads a signal (`{{ count() }}`), Angular records that component as a **consumer** of that signal. When the signal updates, only affected components are marked dirty — a **fine-grained**, targeted update instead of checking the entire tree. This works with both default and `OnPush` strategies and is the foundation for future optimizations.

### Zoneless Angular (developer preview in Angular 18+, evolving)

**Zoneless** mode removes the Zone.js dependency. Change detection runs only when:

- A signal value changes.
- An event handler runs in a template.
- `ChangeDetectorRef.markForCheck()` is called explicitly.
- An `async` pipe receives a new value.

Without Zone.js, untracked async callbacks (e.g., a raw `setTimeout` that mutates a plain property) will **not** update the view — you must use signals, `async` pipe, or manual `markForCheck()`.

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideExperimentalZonelessChangeDetection(),
  ]
});
```

```typescript
import { Component, signal, ChangeDetectorRef, inject } from '@angular/core';

@Component({
  selector: 'app-zoneless-demo',
  standalone: true,
  template: `
  <p>Signal value: {{ counter() }}</p>
  <button (click)="increment()">Increment (tracked)</button>
  <p>Plain property: {{ plainValue }}</p>
  <button (click)="updatePlain()">Update plain (needs manual CD in zoneless)</button>
  `
})
export class ZonelessDemoComponent {
  counter = signal(0);
  plainValue = 0;
  private cdr = inject(ChangeDetectorRef);

  increment() {
    this.counter.update(v => v + 1);
  }

  updatePlain() {
    this.plainValue++;
    this.cdr.markForCheck();
  }
}
```

Zoneless reduces bundle size (no Zone.js), improves debugging (no surprise CD cycles), and pairs naturally with signals. It is the direction Angular is heading for v19+.

## How do you migrate from NgModules to standalone?

Migration is incremental — you do not need to convert everything at once.

### Step 1: Run the standalone migration schematic

```bash
ng generate @angular/core:standalone
```

The schematic walks through phases: bootstrap conversion, removing unnecessary NgModules, and converting remaining declarations.

### Step 2: Convert components manually

Add `standalone: true` and move module imports to the component's `imports` array.

```typescript
// Before (NgModule)
@NgModule({
  declarations: [UserCardComponent],
  imports: [CommonModule, MatCardModule],
  exports: [UserCardComponent]
})
export class UserCardModule {}

// After (standalone)
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `<mat-card>{{ user().name }}</mat-card>`
})
export class UserCardComponent {
  user = input.required<User>();
}
```

### Step 3: Update routing

Replace `loadChildren` (module) with `loadComponent` (standalone component).

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadChildren: () => import('./users/user.routes').then(m => m.USER_ROUTES),
  },
];
```

### Step 4: Replace `bootstrapModule` with `bootstrapApplication`

Move module-level `providers` to the `providers` array in `bootstrapApplication` or `ApplicationConfig`.

### Step 5: Remove empty NgModules

After all declarations are standalone and imports are moved, delete the now-empty module files. Keep NgModules only where a library still requires them.

**Tip:** Convert leaf components first (no dependents), then feature modules, then `AppModule` last.

## When should you still use RxJS alongside signals?

Signals do not replace RxJS — they complement it. Continue using RxJS when:

1. **HTTP and streaming** — `HttpClient` returns `Observable`. Use `async` pipe or `toSignal()` to bridge into templates.
2. **Complex operator chains** — `switchMap`, `debounceTime`, `combineLatest`, `forkJoin` have no signal equivalent.
3. **Multicasting and hot streams** — `shareReplay`, `Subject`, WebSocket streams.
4. **Cancellation** — observables unsubscribe automatically with `switchMap`; signals have no built-in cancellation.
5. **Event composition** — merging multiple async sources over time.
6. **Existing NgRx/store** — `@ngrx/store` and `@ngrx/effects` are Observable-based.

```typescript
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchService } from './search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  template: `
  <input (input)="query$.next($any($event.target).value)" placeholder="Search…" />
  @if (loading()) { <span>Searching…</span> }
  @for (result of results(); track result.id) {
    <p>{{ result.title }}</p>
  }
  `
})
export class SearchComponent {
  private searchService = inject(SearchService);
  query$ = new Subject<string>();

  private searchResults$ = this.query$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(q => this.searchService.search(q))
  );

  results = toSignal(this.searchResults$, { initialValue: [] });
  loading = signal(false);
}
```

**Pattern:** Observable at the boundary (HTTP, events), `toSignal()` at the component edge, signals for template state. Use `toObservable()` when a signal must feed an RxJS pipeline.

## What are Angular's input()/output() signal APIs?

Angular 17.1+ introduced **signal inputs** and **signal outputs** as a modern alternative to `@Input()` / `@Output()` decorators.

### `input()` and `input.required()`

Creates a signal-based input. The value is read with `myInput()`. Supports `transform`, `alias`, and default values. `input.required()` enforces that the parent must provide the value.

### `output()` and `outputFromObservable()`

Creates an output emitter. Emit with `this.myOutput.emit(value)`. Replaces `@Output() myOutput = new EventEmitter()`.

### Benefits

- **Type-safe transforms** — coerce types at the input boundary.
- **Required inputs enforced at compile time** — `input.required()` vs optional `@Input()`.
- **Consistent signal model** — inputs are signals; use them inside `computed()` naturally.
- **Simpler testing** — set input values via `fixture.componentRef.setInput('name', value)`.

```typescript
import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  template: `
  <div class="card" [class.featured]="featured()">
    <h3>{{ displayName() }}</h3>
    <p>{{ price() | currency }}</p>
    <button (click)="addToCart.emit(productId())">Add to Cart</button>
  </div>
  `
})
export class ProductCardComponent {
  productId = input.required<number>();
  name = input.required<string>();
  price = input.required<number>();
  featured = input(false);
  label = input('', { alias: 'cardLabel' });

  addToCart = output<number>();
  selected = output<{ id: number; name: string }>();

  displayName = computed(() =>
    this.featured() ? `⭐ ${this.name()}` : this.name()
  );

  onSelect() {
    this.selected.emit({ id: this.productId(), name: this.name() });
  }
}
```

Parent usage (unchanged template syntax):

```html
<app-product-card
  [productId]="42"
  [name]="'Angular Signals Guide'"
  [price]="29.99"
  [featured]="true"
  (addToCart)="onAdd($event)"
/>
```

`@Input()` and `@Output()` decorators remain supported. New components should prefer `input()`/`output()` for consistency with the signal-based model. Angular 19+ continues expanding signal APIs (including signal-based view queries with `viewChild()`).
