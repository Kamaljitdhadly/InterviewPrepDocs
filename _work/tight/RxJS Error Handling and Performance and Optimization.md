# RxJS Error Handling and Performance and Optimization

## Questions Covered

1. How do you handle errors in RxJS using catchError() and retry() operators?
2. Explain how to recover from an error in RxJS.
3. How do you optimize RxJS performance in an Angular application?
4. What strategies can you use to avoid memory leaks when working with RxJS?

## How do you handle errors in RxJS using catchError() and retry() operators?

Error handling keeps data streams flowing instead of breaking the app. The two most common operators are `catchError()` and `retry()`.

**`catchError()`** catches an error from the stream and lets you handle it gracefully — either returning a fallback Observable or re-throwing after logging.

```typescript
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const source$ = throwError('An error occurred!');
const handled$ = source$.pipe(
  catchError(err => {
    console.error('Caught error:', err);
    return of('Fallback value');
  })
);
handled$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error:', err),
  complete: () => console.log('Completed')
});
```

**Output:**

```text
Caught error: An error occurred!
Fallback value
Completed
```

**`retry()`** automatically re-subscribes to the Observable on error, up to the specified number of attempts, before finally throwing.

```typescript
import { of, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

let attempt = 1;
const source$ = throwError(() => {
  console.log(`Attempt ${attempt}`);
  attempt++;
  return 'Error after retry!';
});
const handled$ = source$.pipe(
  retry(3), // retry up to 3 times
  catchError(err => {
    console.error('Caught error after retries:', err);
    return of('Recovered after retry');
  })
);
handled$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error:', err),
  complete: () => console.log('Completed')
});
```

**Output:**

```text
Attempt 1
Attempt 2
Attempt 3
Attempt 4
Caught error after retries: Error after retry!
Recovered after retry
Completed
```

**Combining them** — `retry()` attempts the operation, and if it still fails, `catchError()` handles the final error:

```typescript
source$.pipe(
  retry(3),
  catchError(err => {
    console.error('Final error after retries:', err);
    return of('Handled error after retries');
  })
);
```

## Explain how to recover from an error in RxJS.

Recovery means keeping the stream alive (or substituting a fallback) instead of terminating it. The main tools are `catchError()`, `retry()`, and `retryWhen()`.

**1. `catchError()` with a fallback value** — intercepts the error and returns a new Observable so the stream continues:

```typescript
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const source$ = throwError('An error occurred!');
const recovered$ = source$.pipe(
  catchError(err => {
    console.error('Error caught:', err);
    return of('Fallback value');
  })
);
recovered$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error:', err),
  complete: () => console.log('Stream completed')
});
```

**Output:**

```text
Error caught: An error occurred!
Fallback value
Stream completed
```

**2. `retry()` then recover** — re-executes a set number of times before `catchError()` provides a fallback:

```typescript
import { of, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

let attempt = 1;
const source$ = throwError(() => {
  console.log(`Attempt ${attempt}`);
  attempt++;
  return 'Error occurred!';
});
const recovered$ = source$.pipe(
  retry(2), // retry up to 2 times
  catchError(err => {
    console.error('Error after retries:', err);
    return of('Recovered after retries');
  })
);
recovered$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error:', err),
  complete: () => console.log('Stream completed')
});
```

**Output:**

```text
Attempt 1
Attempt 2
Attempt 3
Error after retries: Error occurred!
Recovered after retries
Stream completed
```

**3. `retryWhen()` for custom retry logic** — define conditions such as delays or specific error types:

```typescript
import { throwError, timer, of } from 'rxjs';
import { retryWhen, catchError, delayWhen } from 'rxjs/operators';

let attempt = 1;
const source$ = throwError(() => {
  console.log(`Attempt ${attempt}`);
  attempt++;
  return 'Error occurred!';
});
const recovered$ = source$.pipe(
  retryWhen(errors => errors.pipe(
    delayWhen(() => timer(2000)), // retry after a 2s delay
    catchError(() => of('Failed after retries'))
  )),
  catchError(err => {
    console.error('Final error:', err);
    return of('Recovered after retries');
  })
);
recovered$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error:', err),
  complete: () => console.log('Stream completed')
});
```

**Output:**

```text
Attempt 1
Attempt 2
Attempt 3
Final error: Error occurred!
Recovered after retries
Stream completed
```

**4. Resuming with a fallback Observable** — instead of retrying, switch to an entirely new stream on error:

```typescript
import { throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

const source$ = throwError('Critical error!');
const recovered$ = source$.pipe(
  catchError(err => {
    console.log('Recovering with a new stream after error:', err);
    return of('Recovered and continuing...');
  })
);
recovered$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error:', err),
  complete: () => console.log('Stream completed')
});
```

**Output:**

```text
Recovering with a new stream after error: Critical error!
Recovered and continuing...
Stream completed
```

**Summary:** `catchError()` returns a fallback value/Observable; `retry()` re-attempts a fixed number of times; `retryWhen()` adds custom retry logic like delays; and switching to a fallback Observable keeps the stream running.

## How do you optimize RxJS performance in an Angular application?

Several techniques keep RxJS efficient in complex, stream-heavy apps.

**1. Use the correct creation operators.** Prefer lightweight `of()`/`from()` over `interval()`/`timer()` when you don't need timing. Use hot Observables (`Subject`, `BehaviorSubject`) to share one stream across subscribers and avoid re-executing logic.

```typescript
const httpRequest$ = this.http.get('url').pipe(shareReplay(1));
```

**2. Use `takeUntil()` to avoid memory leaks** — automatically unsubscribe when a component is destroyed:

```typescript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({...})
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  ngOnInit() {
    this.myObservable$.pipe(takeUntil(this.destroy$)).subscribe(...);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**3. Use `debounceTime()` to reduce emissions** from high-frequency events like typing, cutting unnecessary API calls:

```typescript
this.searchInput$.pipe(
  debounceTime(300),
  distinctUntilChanged()
).subscribe(searchTerm => {
  this.search(searchTerm);
});
```

**4. Use `distinctUntilChanged()` to prevent redundant emissions** — only emit when the value actually changes, avoiding needless re-renders:

```typescript
this.myObservable$.pipe(
  distinctUntilChanged()
).subscribe(value => {
  // handle value
});
```

**5. Use `switchMap()` for dependent streams with side effects** — cancels the previous inner Observable so only the latest matters (e.g., search requests):

```typescript
this.searchInput$.pipe(
  debounceTime(300),
  switchMap(searchTerm => this.http.get(`searchUrl?query=${searchTerm}`))
).subscribe(result => {
  this.searchResults = result;
});
```

**6. Use `shareReplay()` to cache and share results**, avoiding redundant executions across multiple subscribers:

```typescript
const cachedHttpRequest$ = this.http.get('url').pipe(shareReplay(1));
cachedHttpRequest$.subscribe(...);
cachedHttpRequest$.subscribe(...);
```

**7. Avoid overusing `forkJoin`/`combineLatest` for heavy streams** — they require all sources to emit/complete and can be costly on large data sets. Prefer lighter alternatives like `withLatestFrom()` when you only need the latest value of one stream when another emits.

**8. Use `throttleTime()` or `auditTime()` for rate-limiting** rapid events like scroll or mouse movement:

```typescript
fromEvent(window, 'scroll').pipe(
  throttleTime(100)
).subscribe(event => {
  // handle scroll event
});
```

**9. Lazy-load Observables in large components** — initialize streams only when needed:

```typescript
loadData$ = this.buttonClick$.pipe(
  switchMap(() => this.http.get('api/data'))
);
```

**10. Use `bufferTime()` or `bufferCount()` for event batching** — process multiple emissions together rather than one at a time:

```typescript
fromEvent(window, 'click').pipe(
  bufferTime(1000)
).subscribe(clickEvents => {
  console.log(`${clickEvents.length} clicks received`);
});
```

**11. Optimize change detection with the `async` pipe** — it manages subscriptions and unsubscribes automatically:

```html
<div *ngIf="data$ | async as data">
  {{ data }}
</div>
```

**12. Use `tap()` for debugging without side effects** on the stream:

```typescript
this.myObservable$.pipe(
  tap(value => console.log('Value emitted:', value))
).subscribe(...);
```

**Summary:** use `takeUntil()` for cleanup; `debounceTime()`/`distinctUntilChanged()` to limit emissions; `switchMap()` for latest-only streams; `shareReplay()` to cache; rate-limiters like `throttleTime()`/`auditTime()`; and the `async` pipe plus batching for efficient change detection.

## What strategies can you use to avoid memory leaks when working with RxJS?

Leaks occur when subscriptions aren't cleaned up, so manage them deliberately.

**1. `takeUntil()` for subscription cleanup** — unsubscribe when a component is destroyed:

```typescript
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({...})
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  ngOnInit() {
    this.myObservable$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      // handle data
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**2. `async` pipe in templates** — Angular subscribes and unsubscribes automatically:

```html
<div *ngIf="data$ | async as data">
  {{ data }}
</div>
```

**3. Unsubscribe manually** in `ngOnDestroy()` when you need fine-grained control:

```typescript
@Component({...})
export class MyComponent implements OnDestroy {
  private subscription: Subscription;
  ngOnInit() {
    this.subscription = this.myObservable$.subscribe(data => {
      // handle data
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
```

**4. `take()` or `first()` for a single emission** — auto-completes after the first value:

```typescript
this.myObservable$.pipe(
  take(1)
).subscribe(data => {
  // handle data only once
});
```

**5. `takeWhile()` for conditional subscription** — stays active only while a condition holds:

```typescript
let isAlive = true;
this.myObservable$.pipe(
  takeWhile(() => isAlive)
).subscribe(data => {
  // handle data while isAlive is true
});
isAlive = false; // automatically unsubscribes
```

**6. `shareReplay()` to avoid multiple subscriptions** — subscribers share one execution, so there's a single subscription to manage:

```typescript
const sharedObservable$ = this.myService.getData().pipe(
  shareReplay(1)
);
sharedObservable$.subscribe(data => { /* first subscriber */ });
sharedObservable$.subscribe(data => { /* second subscriber */ });
```

**7. `switchMap()` for dependent streams** — cancels the previous inner subscription when new data arrives:

```typescript
this.searchInput$.pipe(
  switchMap(searchTerm => this.http.get(`search?query=${searchTerm}`))
).subscribe(result => {
  // handle search result
});
```

**8. `finalize()` for cleanup actions** — runs when the Observable completes or is unsubscribed:

```typescript
this.myObservable$.pipe(
  finalize(() => {
    console.log('Observable completed or unsubscribed');
  })
).subscribe(data => {
  // handle data
});
```

**9. `Subscription.add()` to group subscriptions** — unsubscribe from many at once:

```typescript
@Component({...})
export class MyComponent implements OnDestroy {
  private subscriptions = new Subscription();
  ngOnInit() {
    this.subscriptions.add(this.observableOne$.subscribe());
    this.subscriptions.add(this.observableTwo$.subscribe());
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
```

**10. Be careful subscribing in services** — services are long-lived, so use `takeUntil()` or `shareReplay()` to prevent leaks:

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private destroy$ = new Subject<void>();
  fetchData() {
    this.http.get('url').pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      // handle data
    });
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Summary:** use `takeUntil()` and the `async` pipe for automatic cleanup, manual unsubscription when needed, `take(1)`/`first()` for single emissions, `switchMap()` to cancel stale inner streams, `Subscription.add()` to group, and `finalize()` for cleanup logic.
