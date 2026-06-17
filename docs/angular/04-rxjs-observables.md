# RxJS Observables & Operators

## Concept Explanation

**RxJS** powers Angular's async handling. An **Observable** is a stream of values over time that you **subscribe** to. Unlike a Promise (single value, eager), an Observable can emit **many values**, is **lazy** (nothing happens until subscribed), and is **cancellable** (unsubscribe).

Key types:
- **`Subject`** — both an Observable and an Observer; multicasts to many subscribers. No initial value.
- **`BehaviorSubject`** — a Subject that holds a **current value** and emits it immediately to new subscribers (great for state).
- **`ReplaySubject`** — replays the last N values to new subscribers.

**Operators** (used in `.pipe()`) transform streams: `map`, `filter`, `switchMap`, `mergeMap`, `concatMap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `takeUntil`.

## Code Example(s)

```typescript
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// BehaviorSubject as simple state
const count$ = new BehaviorSubject<number>(0);
count$.subscribe(v => console.log('current', v)); // immediately logs 0
count$.next(1);  // logs 1
```

```typescript
// Typeahead search: debounce input, cancel stale requests with switchMap
this.searchControl.valueChanges.pipe(
  debounceTime(300),            // wait for typing to pause
  distinctUntilChanged(),       // ignore if value didn't change
  switchMap(term => this.api.search(term)), // cancel previous request
).subscribe(results => (this.results = results));
```

```typescript
// Unsubscribe pattern with takeUntil
private destroy$ = new Subject<void>();
ngOnInit() {
  this.service.data$.pipe(takeUntil(this.destroy$)).subscribe(/* ... */);
}
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

## Interview Q&A

**🟢 What is an Observable, and how does it differ from a Promise?**
An Observable is a lazy, cancellable stream that can emit multiple values over time. A Promise is eager, emits a single value, and can't be cancelled.

**🟢 What is a `Subject`?**
A special Observable that is also an Observer — you can call `.next()` to push values and it multicasts them to all current subscribers. Useful for cross-component communication and event buses.

**🟡 Difference between `Subject` and `BehaviorSubject`?**
`BehaviorSubject` requires an initial value and emits its current/last value immediately to new subscribers; a plain `Subject` has no initial value and only emits values produced after subscription. `BehaviorSubject` is ideal for state.

**🟡 Difference between `switchMap`, `mergeMap`, and `concatMap`?**
All flatten inner observables. `switchMap` cancels the previous inner observable when a new value arrives (good for search/autocomplete). `mergeMap` runs all concurrently. `concatMap` queues them in order, one after another.

**🔴 How do you avoid memory leaks from subscriptions?**
Unsubscribe in `ngOnDestroy` (store the `Subscription`), use `takeUntil(destroy$)`, use the `async` pipe (auto-unsubscribes), or `takeUntilDestroyed()` (Angular 16+). Leaked subscriptions keep running and can update destroyed components.

## ⚠️ Tricky / Gotchas

- **Observables are lazy** — defining one does nothing; the producer function runs only on `subscribe()`. Multiple subscriptions to a *cold* observable re-run it (e.g. an HTTP call fires per subscriber).
- **Cold vs hot:** cold observables (like `HttpClient`) produce data per subscriber; hot observables (Subjects, `fromEvent`) share one execution among subscribers.
- **`switchMap` for search, `concatMap`/`mergeMap` for writes** — using `switchMap` for a save operation can cancel an in-flight save. Pick the right flattening operator.
- **Forgetting to unsubscribe** leaks memory; the `async` pipe is the cleanest fix in templates.
- **Subscribing inside a subscribe (nested subscriptions)** is an anti-pattern — use a flattening operator instead.
- **`HttpClient` observables complete after one emission**, so they don't strictly need unsubscribing, but it's still safer to manage them.

## 📌 Quick Recap

- Observable = lazy, multi-value, cancellable stream; Promise = eager, single value.
- `Subject` (no initial value, multicast), `BehaviorSubject` (current value, great for state), `ReplaySubject` (replays N).
- Operators in `.pipe()`: `map`, `filter`, `debounceTime`, `switchMap` (cancel prev), `mergeMap` (concurrent), `concatMap` (queued).
- Avoid leaks: `async` pipe, `takeUntil(destroy$)`, `takeUntilDestroyed()`, or unsubscribe in `ngOnDestroy`.
- Cold = per-subscriber execution; hot = shared. Don't nest subscriptions.
