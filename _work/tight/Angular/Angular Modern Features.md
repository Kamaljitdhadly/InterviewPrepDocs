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

**Signals** (Angular 16+, stable in 17) are synchronous reactive primitives that wrap a value and notify consumers on change. Reading a signal in a template registers a dependency for fine-grained updates.

**Observables** are push-based async streams with operators, multicasting, and lazy subscription. They excel at events and time-based data; signals excel at local synchronous UI state.

| Aspect | Signals | Observables |
|--------|---------|-------------|
| Model | Pull (`signal()`) | Push (subscribe) |
| Value | Always current | May not have emitted yet |
| Cleanup | Automatic | Manual unsubscribe |
| Operators | `computed()` | Full RxJS library |
| CD integration | Native, fine-grained | Needs `async` pipe or manual CD |

Use `toSignal()` / `toObservable()` from `@angular/core/rxjs-interop` to bridge them.

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

## How do signal, computed, and effect work?

- **`signal(value)`** — writable state. Read with `()`, write with `.set()` or `.update()`.
- **`computed(fn)`** — read-only derived signal; memoized, re-runs only when dependencies change.
- **`effect(fn)`** — side-effect runner triggered by signal changes (logging, storage sync). Runs after CD in a microtask. Avoid writing signals inside effects. Requires an injection context.

Prefer `computed` for derived template values; reserve `effect` for side effects.

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

## What are standalone components and why use them?

Standalone components (Angular 14+, default in new v17+ projects) declare dependencies via `imports` on the decorator — no `NgModule` wrapper needed.

**Benefits:** simpler dependency graph, better tree-shaking, `bootstrapApplication()` bootstrapping, direct `loadComponent` lazy routes, and incremental coexistence with existing modules.

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

## How does the new inject() function replace constructor DI?

**`inject()`** (Angular 14+) retrieves dependencies from the current injection context without constructor parameters. Works in constructors, field initializers, factory providers, and functional guards.

**Advantages:** less boilerplate, composable `provideX()` factories, functional route guards, easier base-class patterns.

Must be called in an **injection context** — arbitrary methods throw at runtime.

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

Constructor DI still works; use `inject()` for new code.

## What is the new control flow syntax (@if, @for, @switch)?

Angular 17 **built-in control flow** replaces `*ngIf`, `*ngFor`, and `ngSwitch` with compiler-native block syntax — better type narrowing and performance.

- **`@if` / `@else if` / `@else`** — conditional rendering.
- **`@for (item of items; track expr)`** — iteration with required `track`; `@empty` for empty collections.
- **`@switch` / `@case` / `@default`** — value matching.

Migrate with `ng generate @angular/core:control-flow`.

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

## How does @defer work for lazy loading templates?

**`@defer`** (Angular 17+) splits a template block and its imports into a separate chunk, loaded when a trigger fires — reducing initial bundle size.

**Triggers:** `on idle` (default), `on viewport`, `on interaction`, `on hover`, `on immediate`, `on timer(ms)`, `when condition`.

**Sub-blocks:** `@placeholder` (before load), `@loading` (during fetch), `@error` (on failure).

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

## What is signal-based change detection and zoneless Angular?

**Traditional CD** uses Zone.js to patch async APIs and trigger full-tree checks after every async task.

**Signal-based CD** records which components read which signals; updates mark only affected components dirty — fine-grained, not full-tree.

**Zoneless** (developer preview 18+) removes Zone.js. CD runs on signal changes, template events, `markForCheck()`, or `async` pipe emissions. Untracked async mutations (raw `setTimeout` on plain properties) won't update the view — use signals or manual CD.

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

## How do you migrate from NgModules to standalone?

Migration is incremental.

1. **Run schematic:** `ng generate @angular/core:standalone`
2. **Convert components:** add `standalone: true`, move module `imports` to component `imports`.
3. **Update routing:** `loadChildren` (module) → `loadComponent` (component).
4. **Bootstrap:** `bootstrapModule` → `bootstrapApplication` with `providers`.
5. **Delete empty modules** once all declarations are standalone.

Convert leaf components first, then features, then `AppModule` last.

```bash
ng generate @angular/core:standalone
```

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

## When should you still use RxJS alongside signals?

Signals complement RxJS; they don't replace it. Keep RxJS for:

1. **HTTP / streaming** — `HttpClient` returns `Observable`
2. **Operator chains** — `switchMap`, `debounceTime`, `combineLatest`
3. **Multicasting** — `shareReplay`, `Subject`, WebSockets
4. **Cancellation** — `switchMap` auto-unsubscribes
5. **Event composition** — merging multiple async sources
6. **NgRx** — store and effects are Observable-based

**Pattern:** Observable at the boundary, `toSignal()` at the component edge, signals in templates.

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

## What are Angular's input()/output() signal APIs?

Angular 17.1+ adds **signal inputs/outputs** as alternatives to `@Input()` / `@Output()`.

- **`input()` / `input.required()`** — signal-based inputs read with `()`. Supports `transform`, `alias`, defaults.
- **`output()`** — emit with `.emit(value)`. Replaces `EventEmitter`.

**Benefits:** compile-time required inputs, type-safe transforms, natural use in `computed()`, easier testing via `setInput()`.

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

`@Input()` / `@Output()` remain supported; prefer `input()` / `output()` in new code. Angular 19+ expands signal APIs (`viewChild()`, etc.).

---

## Related Topics

- **Angular Change Detection and Performance Optimization** (`Angular/`)
- **RxJS Basics** (`Angular/`)
