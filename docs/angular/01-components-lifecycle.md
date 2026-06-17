# Components & Lifecycle Hooks

## Concept Explanation

A **component** is the basic UI building block in Angular: a TypeScript class with an `@Component` decorator that ties together a **template** (HTML), **styles**, and **logic**. Components form a tree.

Angular calls **lifecycle hooks** at key moments. The main ones, in order:

1. **`constructor`** — DI happens; inputs not yet set.
2. **`ngOnChanges`** — when an `@Input()` changes (called before `ngOnInit` and on every input change).
3. **`ngOnInit`** — once, after first inputs are set; do initialization/data fetching here.
4. **`ngDoCheck`** — custom change detection.
5. **`ngAfterContentInit` / `ngAfterContentChecked`** — projected content (`<ng-content>`).
6. **`ngAfterViewInit` / `ngAfterViewChecked`** — child views/`@ViewChild` available.
7. **`ngOnDestroy`** — cleanup (unsubscribe, clear timers).

## Code Example(s)

```typescript
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  template: `<h2>{{ user?.name }}</h2>`,
})
export class UserComponent implements OnInit, OnDestroy {
  @Input() userId!: number;       // input is NOT available in the constructor
  user?: { name: string };
  private sub?: Subscription;

  constructor(private userService: UserService) {} // DI only

  ngOnInit(): void {
    // inputs are set now — safe to use userId & fetch data
    this.sub = this.userService.get(this.userId)
      .subscribe(u => (this.user = u));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();      // prevent memory leaks
  }
}
```

## Interview Q&A

**🟢 What is a component in Angular?**
A class decorated with `@Component` that controls a view — combining a template, styles, and logic. Components compose into a tree.

**🟢 What is the difference between `constructor` and `ngOnInit`?**
The constructor is a TypeScript feature used mainly for dependency injection; `@Input()` values aren't set yet. `ngOnInit` runs after Angular sets the inputs, so it's the right place for initialization and data fetching.

**🟡 When does `ngOnChanges` fire vs `ngOnInit`?**
`ngOnChanges` fires whenever a bound `@Input()` changes, including before the first `ngOnInit`. `ngOnInit` fires once after the first `ngOnChanges`. Use `ngOnChanges` to react to ongoing input changes.

**🟡 What do you do in `ngOnDestroy`?**
Cleanup: unsubscribe from observables, clear intervals/timeouts, detach event listeners — to avoid memory leaks when the component is destroyed.

**🔴 What's the difference between `ngAfterViewInit` and `ngAfterContentInit`?**
`ngAfterContentInit` fires after projected content (`<ng-content>`) is initialized; `ngAfterViewInit` fires after the component's own view and child components (`@ViewChild`) are initialized. `@ViewChild` references are only reliably available in/after `ngAfterViewInit`.

## ⚠️ Tricky / Gotchas

- **Don't fetch data or use `@Input()` in the constructor** — inputs are `undefined` there. Use `ngOnInit`.
- **Modifying a value bound to the view inside `ngAfterViewInit`** can throw `ExpressionChangedAfterItHasBeenCheckedError` in dev mode — defer with `setTimeout`/`Promise.resolve()` or restructure.
- **Forgetting to unsubscribe** in `ngOnDestroy` leaks memory and can cause callbacks to fire on destroyed components. (Or use the `async` pipe / `takeUntilDestroyed`.)
- **`ngOnChanges` only fires for `@Input()`-bound properties**, and only when the reference changes — mutating an object/array in place won't trigger it.
- **`@ViewChild` is undefined in `ngOnInit`** for view children — it's set by `ngAfterViewInit`.

## 📌 Quick Recap

- Component = `@Component` class + template + styles + logic; forms a tree.
- Constructor = DI only (no inputs). `ngOnInit` = init/data fetch (inputs ready).
- Order: constructor → ngOnChanges → ngOnInit → ngAfterContentInit → ngAfterViewInit → ngOnDestroy.
- `ngOnChanges` reacts to `@Input()` reference changes.
- Clean up in `ngOnDestroy` (unsubscribe) to avoid leaks.
- `@ViewChild` ready in `ngAfterViewInit`, not `ngOnInit`.
