# Services & Dependency Injection

## Concept Explanation

A **service** is a class with reusable logic (data access, business logic, state) that's independent of any view. **Dependency Injection (DI)** is how Angular provides instances of services to components/other services that ask for them via the constructor — promoting reuse and testability.

Angular has a **hierarchical injector** system. Where you *provide* a service determines its **scope** and whether it's a singleton:

- **`providedIn: 'root'`** — a single app-wide singleton (tree-shakable, recommended).
- **Provided in a component's `providers`** — a new instance per component instance (and its children).
- **Provided in a (lazy-loaded) module/route** — scoped to that module/route.

## Code Example(s)

```typescript
// App-wide singleton service
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}
  getUsers() { return this.http.get<User[]>('/api/users'); }
}

// Inject via constructor
@Component({ selector: 'app-users', template: `...` })
export class UsersComponent {
  constructor(private userService: UserService) {}  // Angular supplies the instance
}
```

```typescript
// Component-scoped instance (NOT a singleton) — fresh per component
@Component({
  selector: 'app-widget',
  providers: [WidgetStateService],  // new instance for each WidgetComponent
  template: `...`,
})
export class WidgetComponent {}
```

```typescript
// Modern inject() function (Angular 14+) — alternative to constructor injection
import { inject } from '@angular/core';
export class ReportComponent {
  private userService = inject(UserService);
}
```

## Interview Q&A

**🟢 What is a service and why use one?**
A reusable class for logic/data not tied to the view (e.g. HTTP calls, shared state). Services keep components lean and enable code reuse and testability.

**🟢 What is dependency injection in Angular?**
A pattern where Angular's injector creates and supplies a class's dependencies (declared in the constructor) instead of the class creating them itself.

**🟡 What does `providedIn: 'root'` mean?**
The service is registered with the root injector as an app-wide singleton and is tree-shakable (removed from the bundle if unused). It's the recommended default.

**🟡 How do you get a non-singleton (per-component) service?**
Provide it in a component's `providers` array. Each instance of that component (and its child injectors) gets its own instance.

**🔴 Explain Angular's hierarchical injector.**
Injectors form a tree mirroring the component/module tree. When a token is requested, Angular walks up from the component injector toward the root until it finds a provider. Where you provide a service decides its lifetime and how many instances exist.

## ⚠️ Tricky / Gotchas

- **Providing a service in a component's `providers` breaks the singleton** — you get one instance per component, which surprises people expecting shared state. For shared state use `providedIn: 'root'`.
- **Two components each providing the same service don't share state** — separate injectors, separate instances.
- **Lazy-loaded modules get their own child injector** — a service provided in a lazy module is NOT the same instance as one provided in root (can cause "two instances" bugs).
- **Circular dependencies** between services throw at injection; refactor or use `forwardRef` as a last resort.
- **`inject()` must run in an injection context** (field initializer, constructor, factory) — calling it later (e.g. in a callback) throws.

## 📌 Quick Recap

- Service = reusable, view-independent logic; injected via constructor (or `inject()`).
- DI = injector creates/supplies dependencies → reuse + testability.
- `providedIn: 'root'` = app-wide singleton (tree-shakable, default choice).
- Component `providers` = new instance per component (not shared).
- Hierarchical injectors: Angular walks up the tree to resolve a token.
- Lazy modules have their own injector — watch for duplicate instances.
