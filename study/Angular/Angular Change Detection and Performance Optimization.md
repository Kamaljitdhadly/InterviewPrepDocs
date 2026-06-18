# Angular Change Detection and Performance Optimization

## Questions Covered

1. What is change detection in Angular, and how does it work?
2. What is the difference between default and OnPush change detection strategy?
3. How can you manually trigger change detection in Angular?
4. What is the difference between detectChanges and markForCheck?
5. How do you improve the performance of an Angular application?
6. What are some best practices for performance optimization?
7. What is Ahead-of-Time (AOT) compilation, and how does it differ from Just-in-Time (JIT) compilation?
8. How does Angular handle lazy loading of modules?

## What is change detection in Angular, and how does it work?

Change detection is the mechanism Angular uses to determine whether the application's data has changed and to keep the DOM in sync with the underlying model.

**How it works:**

- **Component tree and templates** — Angular builds a tree of components, each with a view whose template is bound to the component's properties.
- **Trigger** — an event (user input, HTTP response, timer, etc.) triggers a change-detection pass over the component tree.
- **Checking** — Angular compares each component's bound properties against their previous values (dirty checking) and updates the DOM where changes are found.
- **Zones** — Angular uses **Zone.js** to intercept asynchronous activities (HTTP calls, DOM events, `setTimeout`) and run change detection when they complete.

The pass has two phases: a **check phase** (compare bindings, mark changed components for re-rendering) and an **update phase** (apply changes to the view).

**Change detection strategies:**

- **Default** — uses dirty checking and is *eager*: after every event, Angular checks every component starting from the root.

```typescript
@Component({
  selector: 'app-default',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `<div>{{ data }}</div>`
})
export class DefaultComponent {
  data = 'Default strategy';
}
```

- **OnPush** — only checks a component (and its children) when an `@Input()` binding changes, an event originates inside the component, or change detection is triggered manually. This reduces unnecessary checks in large apps.

```typescript
@Component({
  selector: 'app-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ data }}</div>`
})
export class OnPushComponent {
  @Input() data: string;
}
```

**When Angular triggers change detection:** DOM events (click, keyup), HTTP responses, resolved/rejected promises, timers (`setTimeout`/`setInterval`), and changes to `@Input()` values.

**Manual control via `ChangeDetectorRef`** — trigger a check with `detectChanges()`:

```typescript
import { ChangeDetectorRef } from '@angular/core';

export class MyComponent {
  constructor(private cd: ChangeDetectorRef) {}
  someMethod() {
    this.cd.detectChanges();
  }
}
```

Or detach a component from change detection and reattach it when needed:

```typescript
import { ChangeDetectorRef } from '@angular/core';

export class MyComponent {
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit() {
    this.cd.detach();
  }
  reattachChangeDetection() {
    this.cd.reattach();
    this.cd.detectChanges();
  }
}
```

**Optimization tips:** use `OnPush` for components that change infrequently, use `trackBy` in `*ngFor` to avoid recreating DOM elements, and detach change detection where frequent checks are unnecessary.

```html
<div *ngFor="let item of items; trackBy: trackByFn">{{ item.name }}</div>
```

```typescript
trackByFn(index: number, item: any) {
  return item.id;
}
```

## What is the difference between default and OnPush change detection strategy?

The difference lies in **when** and **how** change detection runs for a component.

**Default strategy** — *eager*: runs after every event anywhere in the app (user interaction, HTTP response, `setTimeout`, any bound-property change), dirty-checking the entire component tree from root to leaves even where nothing changed. Simple but less efficient for large apps.

```typescript
@Component({
  selector: 'app-default',
  changeDetection: ChangeDetectionStrategy.Default,
  template: `<div>{{ data }}</div>`
})
export class DefaultComponent {
  data = 'Default Change Detection';
}
```

**OnPush strategy** — *lazy*: Angular runs change detection for the component only when an `@Input()` receives a new value, an event fires inside the component, or you trigger it manually (`detectChanges()` / `markForCheck()`). It assumes data changes only under these conditions, avoiding unnecessary checks. Best for performance-critical apps and immutable data flows.

```typescript
@Component({
  selector: 'app-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ data }}</div>`
})
export class OnPushComponent {
  @Input() data: string;
}
```

**Key differences:**

| Aspect | Default | OnPush |
|----|----|----|
| Trigger | Every event, anywhere in the app | Only on input change or internal event |
| Efficiency | Less efficient (checks all components) | More efficient (checks only when needed) |
| Use case | Small apps, frequently changing data | Large, performance-sensitive apps, predictable data |
| Input changes | Reacts to any bound data | Reacts only to `@Input()` changes |
| Manual detection | Automatic | Can trigger via `markForCheck`/`detectChanges` |

## How can you manually trigger change detection in Angular?

Angular's `ChangeDetectorRef` (and a couple of other services) lets you control change detection manually — useful with `OnPush` or when changes happen outside Angular's awareness.

**1. `ChangeDetectorRef.detectChanges()`** — immediately checks the component and its children and updates the view. Use it after data changes from outside Angular's mechanism (a third-party library, `setTimeout`/`setInterval`).

```typescript
import { Component, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-manual-detect',
  template: `<div>{{ data }}</div>`
})
export class ManualDetectComponent {
  data = 'Initial value';
  constructor(private cd: ChangeDetectorRef) {}
  someMethod() {
    this.data = 'Updated value';
    this.cd.detectChanges();
  }
}
```

**2. `ChangeDetectorRef.markForCheck()`** — marks the component and its ancestors to be checked on the *next* cycle. Especially useful with `OnPush` to reflect changes Angular wouldn't detect automatically (e.g., a service or async update).

```typescript
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-mark-for-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ data }}</div>`
})
export class MarkForCheckComponent {
  data = 'Initial value';
  constructor(private cd: ChangeDetectorRef) {}
  updateData() {
    this.data = 'Updated value';
    this.cd.markForCheck();
  }
}
```

**3. `ApplicationRef.tick()`** — runs a full change-detection cycle across the whole component tree. Mainly for debugging or rare cases; avoid in normal flow due to performance cost.

```typescript
import { Component, ApplicationRef } from '@angular/core';

@Component({
  selector: 'app-tick-example',
  template: `<div>{{ data }}</div>`
})
export class TickExampleComponent {
  data = 'Initial value';
  constructor(private appRef: ApplicationRef) {}
  updateAndTick() {
    this.data = 'Updated value';
    this.appRef.tick();
  }
}
```

**4. `NgZone.run()`** — re-enters Angular's zone after running code with `runOutsideAngular()` (which suppresses automatic change detection). Useful for performance-sensitive async work like animations or third-party code.

```typescript
import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-ng-zone',
  template: `<div>{{ data }}</div>`
})
export class NgZoneComponent {
  data = 'Initial value';
  constructor(private ngZone: NgZone) {}
  runOutsideAngular() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.data = 'Updated value';
        this.ngZone.run(() => {
          console.log('Change detection triggered');
        });
      }, 2000);
    });
  }
}
```

**Summary:**

| Method | Description | Use case |
|----|----|----|
| `detectChanges()` | Checks current component and children now | Immediate update of the current component |
| `markForCheck()` | Marks component and ancestors for next cycle | `OnPush` updates from non-input data changes |
| `ApplicationRef.tick()` | Full app-wide cycle | Rare cases / debugging |
| `NgZone.run()` | Re-enters Angular's zone | Async or third-party code run outside Angular |

## What is the difference between detectChanges and markForCheck?

Both control manual change detection (typically with `OnPush`) but differ in **timing** and **scope**.

**`detectChanges()`** — runs change detection **immediately** on the component and **its descendants**, updating the DOM right away. Use it when async data (timeouts, observables, promises) changes and you want the view updated at once.

```typescript
@Component({
  selector: 'app-child',
  template: `<div>{{data}}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent implements OnInit {
  @Input() data: string;
  constructor(private cd: ChangeDetectorRef) {}
  ngOnInit() {
    setTimeout(() => {
      this.data = 'New Data';
      this.cd.detectChanges();
    }, 2000);
  }
}
```

**`markForCheck()`** — does **not** check immediately; it marks the component and its **ancestors** (up to the root) as dirty so they're checked on the **next** change-detection cycle. Angular picks up the change during its normal lifecycle (e.g., the next tick).

```typescript
@Component({
  selector: 'app-child',
  template: `<div>{{data}}</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildComponent {
  @Input() data: string;
  constructor(private cd: ChangeDetectorRef) {}
  someMethod() {
    this.data = 'New Data';
    this.cd.markForCheck();
  }
}
```

In short: `detectChanges()` is immediate and works *downward* (component + children); `markForCheck()` is deferred to the next cycle and works *upward* (component + ancestors).

## How do you improve the performance of an Angular application?

Performance tuning spans both your code and Angular's built-in capabilities.

**1. OnPush change detection** — limits checks to input changes and internal events.

```typescript
@Component({
  selector: 'app-on-push',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>{{ data }}</div>`
})
export class OnPushComponent {
  @Input() data: string;
}
```

**2. Lazy loading modules** — load feature modules on demand to shrink the initial bundle.

```typescript
const routes: Routes = [
  { path: 'feature', loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule) }
];
```

**3. AOT compilation** — compile templates at build time for faster rendering and smaller bundles.

```json
"build": {
  "options": {
    "aot": true
  }
}
```

**4. Tree shaking / bundle optimization** — import only what you need so unused code is dropped.

```typescript
// instead of: import * as _ from 'lodash';
import { debounce } from 'lodash';
```

**5. `trackBy` in `*ngFor`** — track items by a stable id to avoid recreating DOM elements.

```html
<div *ngFor="let item of items; trackBy: trackById">{{ item.name }}</div>
```

```typescript
trackById(index: number, item: any): number {
  return item.id;
}
```

**6. Pure pipes** — recalculated only when inputs change (unlike impure pipes, which run every cycle).

```typescript
@Pipe({ name: 'purePipe', pure: true })
export class PurePipe implements PipeTransform {
  transform(value: any): any {
    // transformation logic
  }
}
```

**7. Detach change detection** — detach where constant checking is unneeded and trigger it manually.

```typescript
constructor(private cd: ChangeDetectorRef) {}

ngOnInit() {
  this.cd.detach();
}
update() {
  this.cd.detectChanges();
}
```

**8. Minimize third-party libraries** — prefer lightweight alternatives and load heavy scripts dynamically.

```typescript
import('./lazy-loaded-lib').then(module => {
  const lib = module.default;
});
```

**9. Efficient DOM access** — use `Renderer2` instead of direct DOM manipulation.

```typescript
// instead of: document.getElementById('element').style.display = 'none';
this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
```

**10. Avoid memory leaks** — unsubscribe in `ngOnDestroy` (or use the `async` pipe).

```typescript
private subscription: Subscription;
ngOnInit() {
  this.subscription = this.myObservable.subscribe(data => {
    // handle data
  });
}
ngOnDestroy() {
  this.subscription.unsubscribe();
}
```

**11. Preload lazy modules** — load likely-needed modules in the background after startup.

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
})
export class AppModule {}
```

**12. Service workers (PWA)** — cache assets for faster loads and offline support: `ng add @angular/pwa`.

**13. Web workers** — offload CPU-heavy work to a background thread to keep the UI responsive.

```typescript
if (typeof Worker !== 'undefined') {
  const worker = new Worker('./app.worker', { type: 'module' });
  worker.onmessage = ({ data }) => {
    console.log(`Data from worker: ${data}`);
  };
  worker.postMessage('Hello from Angular');
}
```

## What are some best practices for performance optimization?

Beyond the techniques above, follow these practices across code, network, and rendering:

- **Optimize change detection** — prefer `OnPush`; detach or manually trigger via `ChangeDetectorRef` for finer control.
- **Lazy load modules** — load only essential modules at startup, the rest on demand.
- **AOT compilation** — precompile templates to improve startup time and shrink bundles.
- **Enable tree shaking** — avoid importing entire libraries when only parts are needed.
- **`trackBy` in `*ngFor`** — prevent unnecessary DOM recreation when rendering lists.
- **Pure pipes** — avoid recalculation on every change-detection cycle.
- **Avoid memory leaks** — unsubscribe from observables/events in `ngOnDestroy`, or use the `async` pipe.
- **Reduce bundle size** — use dynamic imports for big libraries, code-split with lazy loading/preloading, and enable Gzip/Brotli compression.
- **Minimize DOM manipulation** — use `Renderer2` instead of `ElementRef`/`document`.
- **Web workers** — offload CPU-intensive tasks off the main thread.
- **Service workers (PWA)** — cache assets and API responses for faster repeat visits and offline support.
- **Preload lazy modules** — improve navigation while keeping lazy-loading benefits.
- **Debounce/throttle user input** — for typing, scrolling, or resizing that triggers heavy work or network calls.
- **Optimize images** — lazy-load images and serve appropriately sized, compressed files.
- **Efficient event handling** — bind events at the component level; avoid unnecessary `document`/`window` listeners.
- **Smart caching** — set HTTP cache headers and cache responses via `localStorage`, `IndexedDB`, or service workers.
- **Limit `ngClass`/`ngStyle`** — minimize for frequently changing styles to reduce re-rendering.
- **Optimize forms** — prefer Reactive Forms for large/complex forms; use async validators to avoid recalculating on every cycle.
- **Efficient component design** — favor stateless components driven by inputs; break large components into smaller, focused ones.
- **Reduce HTTP calls** — combine requests and use RxJS operators like `forkJoin`, `combineLatest`, or `mergeMap`.
- **Use a CDN** — serve static assets (images, fonts, scripts) via a CDN to cut latency.

## What is Ahead-of-Time (AOT) compilation, and how does it differ from Just-in-Time (JIT) compilation?

Both compile Angular templates and components into JavaScript, but at different stages of the lifecycle.

**Just-in-Time (JIT)** — compiles templates and components **in the browser at runtime**, just before rendering. It's the traditional development mode.

- Faster build times (templates compiled in the browser), but the Angular compiler ships with the app, producing a **larger bundle** and **slower runtime** (compilation overhead delays the first render).
- Good for development: rapid changes, easy debugging, quick reloads.

**Ahead-of-Time (AOT)** — compiles templates and components **at build time**, before the browser downloads the app, producing optimized JavaScript.

- Slower build times, but the compiler is excluded from the bundle, giving a **smaller bundle** and **faster runtime** (templates already compiled, so it renders immediately).
- Ideal for production.

**Key differences:**

| Aspect | AOT | JIT |
|----|----|----|
| Compilation time | Build time (before serving) | Runtime (in the browser) |
| Bundle size | Smaller (compiler excluded) | Larger (compiler included) |
| Load time | Faster (pre-compiled) | Slower (runtime compilation) |
| Build time | Slower | Faster |
| Debugging | Less flexible | Easier, quick rebuilds |
| Usage | Production | Development |
| Error detection | At build time | At runtime |

**AOT benefits:** faster rendering, smaller payload, early (build-time) error detection, and better security against template-injection attacks. **JIT benefits:** faster development builds and more flexible debugging.

Use **JIT** for development and **AOT** for production. Angular CLI uses AOT by default for production builds; you can also enable it explicitly:

```bash
ng build --prod --aot
```

## How does Angular handle lazy loading of modules?

Lazy loading defers loading feature modules until they're needed, splitting the app into smaller bundles to speed up the initial load. It's configured in routing via the `loadChildren` property using dynamic `import()`, so a module is fetched and compiled only when its route is accessed.

**Step-by-step example:**

**1. Create a feature module** with its own routing:

```bash
ng generate module feature --routing
```

**2. Define routes in the feature module** (`feature-routing.module.ts`):

```typescript
const routes: Routes = [
  { path: '', component: FeatureComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureRoutingModule { }
```

**3. Configure lazy loading in the root routing module** (`app-routing.module.ts`):

```typescript
const routes: Routes = [
  { path: 'feature', loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**4. Define the feature module**, importing its routing module:

```typescript
@NgModule({
  declarations: [FeatureComponent],
  imports: [CommonModule, FeatureRoutingModule]
})
export class FeatureModule { }
```

**Key concepts:**

- **Dynamic import** — the module loads asynchronously only when the route is visited.

```typescript
loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
```

- **Code splitting** — the app is divided into multiple bundles; only needed code is loaded.
- **Preloading strategies** — preload lazy modules in the background after startup (e.g., `PreloadAllModules`, or `NoPreloading`).

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**Benefits:** faster initial load (smaller startup bundle), improved performance (less JS to parse on load), and a more responsive experience as features load on demand.
