# Angular Routing

## Questions Covered

1. What is Angular routing, and how is it implemented?
2. How can you define child routes?
3. Explain the difference between forRoot vs forChild.
4. Explain the difference between providedIn: 'root' vs providedIn: 'any'.
5. What are route guards, and what are the different types?
6. What is lazy loading, and how do you implement it in Angular?

## What is Angular routing, and how is it implemented?

Angular routing enables navigation between views/components in a Single Page Application by mapping URL paths to components, loading the relevant view without a full page reload. It's provided by the `@angular/router` module.

**Key building blocks:**

- **Routes** — map a URL path to a component.
- **`RouterModule`** — configures and manages navigation.
- **`RouterOutlet`** — a directive marking where the routed component is rendered.
- **`RouterLink`** — a directive that binds a clickable element to a route.

**Implementation steps:**

**1. Define routes** — an array of `{ path, component }` objects:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' } // wildcard for invalid paths
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**2. Add `<router-outlet>`** to the main template as a placeholder for routed components:

```html
<nav>
  <a routerLink="/home">Home</a>
  <a routerLink="/about">About</a>
</nav>
<router-outlet></router-outlet>
```

**3. Import `AppRoutingModule`** in `AppModule` to enable routing:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**4. Navigate programmatically** (optional) with the `Router` service:

```typescript
import { Router } from '@angular/router';
constructor(private router: Router) { }
goToHome() {
  this.router.navigate(['/home']);
}
```

**Key features:** lazy loading, route guards, child (nested) routes, and route parameters for capturing dynamic URL values.

## How can you define child routes?

Child routes enable nested routing — routes defined within a parent route — so a section of the app has its own routes displayed inside the parent's component.

**1. Configure child routes** with the `children` array in the parent route:

```typescript
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
```

**2. Add a `<router-outlet>` to the parent's template** to host child components:

```html
<h2>Dashboard</h2>
<nav>
  <a routerLink="profile">Profile</a>
  <a routerLink="settings">Settings</a>
</nav>
<router-outlet></router-outlet>
```

**3. Navigate to child routes** with `routerLink` using paths relative to the parent:

```html
<a routerLink="profile">Go to Profile</a>
<a routerLink="settings">Go to Settings</a>
```

**4. Navigate programmatically** (optional) using a relative path:

```typescript
import { Router } from '@angular/router';
constructor(private router: Router) { }
navigateToProfile() {
  this.router.navigate(['profile'], { relativeTo: this.route });
}
```

**Example:** visiting `/dashboard` shows `DashboardComponent`; navigating to `/dashboard/profile` renders `ProfileComponent` inside the dashboard's `<router-outlet>`.

**Key points:** child paths are relative to the parent; each route with children needs its own `<router-outlet>`; and routes can nest multiple levels deep (manage carefully for maintainability).

## Explain the difference between forRoot vs forChild.

`RouterModule.forRoot()` and `RouterModule.forChild()` configure routes differently depending on whether they're the app's main routes or a feature module's routes.

**`forRoot()`** — configures the **root-level** routes. Used **once**, in the root module (`AppModule`), it also sets up the singleton `Router` and `Location` providers available app-wide.

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // root module
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

**`forChild()`** — configures routes inside **feature modules**. Used **multiple times** across feature modules, it does **not** re-register the core routing services (already set up by `forRoot()`).

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureComponent } from './feature/feature.component';

const routes: Routes = [
  { path: 'feature', component: FeatureComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // feature module
  exports: [RouterModule]
})
export class FeatureRoutingModule { }
```

**Why the distinction?** It ensures core services like `Router` and `Location` are initialized only once (by `forRoot()` in the root module), while `forChild()` lets feature modules add routes without duplicating those services.

## Explain the difference between providedIn: 'root' vs providedIn: 'any'.

The `providedIn` metadata in `@Injectable()` controls a service's scope and lifecycle.

**`providedIn: 'root'`** — **application-wide singleton**. Registered in the root injector, so a single instance is shared everywhere it's injected. Best for globally shared services (authentication, logging, state). Angular tree-shakes it, including it in the bundle only if used.

```typescript
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // auth service logic
}
```

`AuthService` is created once and reused throughout the app.

**`providedIn: 'any'`** — a **separate instance per module** that injects it. In eagerly loaded modules it behaves like a singleton (the injector is created at startup), but each **lazy-loaded module** gets its **own instance**. Best when different modules/components should not share state. Also tree-shaken.

```typescript
@Injectable({
  providedIn: 'any',
})
export class FeatureService {
  // feature-specific service logic
}
```

`FeatureService` can have multiple instances — one per lazy-loaded module that injects it.

**Summary:**

| Aspect | `providedIn: 'root'` | `providedIn: 'any'` |
|----|----|----|
| Scope | Application-wide (singleton) | Module/component-wide |
| Instance count | One, shared across the app | Multiple (new per lazy-loaded module) |
| Use case | Shared services (auth, logging) | Module/feature-specific services |
| Lazy-loaded modules | Single instance even when lazy-loaded | New instance per lazy-loaded module |
| Tree-shaking | Included only if used | Included only if used |

Use `'root'` for a single shared instance; use `'any'` when you need distinct instances, especially across lazy-loaded modules.

## What are route guards, and what are the different types?

**Route guards** control navigation by allowing, blocking, or redirecting it based on conditions — used to secure routes, run checks, or manage entry/exit. Angular provides several types for different points in the routing lifecycle:

- **`CanActivate`** — can the user enter a route?
- **`CanDeactivate`** — can the user leave a route?
- **`CanActivateChild`** — can the user enter child routes?
- **`CanLoad`** — should a (lazy-loaded) module be loaded?
- **`Resolve`** — pre-fetch data before activating a route.

**1. `CanActivate`** — allow/block entry (e.g., require authentication):

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
```

```typescript
const routes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
];
```

**2. `CanDeactivate`** — confirm before leaving a route (e.g., unsaved changes):

```typescript
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
```

```typescript
const routes: Routes = [
  { path: 'edit', component: EditComponent, canDeactivate: [CanDeactivateGuard] },
];
```

The component implements the interface:

```typescript
export class EditComponent implements CanComponentDeactivate {
  canDeactivate(): boolean {
    return confirm('Do you want to discard changes?');
  }
}
```

**3. `CanActivateChild`** — protect child routes, similar to `CanActivate`:

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivateChild: [AuthGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];
```

**4. `CanLoad`** — prevent loading a lazy module unless a condition is met:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [AuthGuard],
  },
];
```

```typescript
// in AuthGuard
canLoad(): boolean {
  return this.authService.isLoggedIn();
}
```

**5. `Resolve`** — pre-fetch data so it's ready when the route activates:

```typescript
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class DataResolver implements Resolve<any> {
  constructor(private dataService: DataService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.dataService.getData();
  }
}
```

```typescript
const routes: Routes = [
  { path: 'data', component: DataComponent, resolve: { data: DataResolver } },
];
```

**How to use guards:** generate a guard (`ng generate guard auth`), implement the relevant interface, attach it to the route via `canActivate`/`canDeactivate`/`canLoad`/etc., and Angular allows or blocks navigation based on the guard's `true`/`false` result.

## What is lazy loading, and how do you implement it in Angular?

**Lazy loading** delays loading a module until it's needed instead of loading everything at startup, reducing the initial bundle size and improving load times — typically applied to **feature modules** required only by certain routes.

**Benefits:** faster initial load (only critical resources load first), better performance (smaller app at startup), and optimized resource usage (features a user never visits are never loaded).

**Implementation** uses route-level code splitting via `loadChildren` with a dynamic `import()`.

**1. Create a feature module** (the CLI can also wire up the lazy route):

```bash
ng generate module feature --route feature --module app.module
```

**2. Configure the route with `loadChildren`** so the module loads only when `/feature` is visited:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

**3. Configure the feature module's own routes** with `forChild`:

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeatureComponent } from './feature.component';

const routes: Routes = [
  { path: '', component: FeatureComponent } // default route for the feature module
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureRoutingModule {}
```

When the user navigates to `/feature`, Angular fetches and renders `FeatureModule` at that point.

**Preloading strategy** — optionally preload lazy modules in the background after the initial load to reduce later navigation delays:

```typescript
@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
```

In short, lazy loading via `loadChildren` keeps the initial bundle small and is especially valuable for large apps with many feature modules.

---

## Related Topics

- **Angular HTTP and Services** (`Angular/`)
