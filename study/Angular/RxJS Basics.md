# RxJS Basics

## Questions Covered

1. What is RxJS, and why is it used?
2. Explain the difference between Observables and Promises.
3. What are operators in RxJS, and why are they important?
4. What is an Observer in RxJS?
5. What is an Observable, and how do you create one in RxJS?
6. What are cold and hot Observables?
7. Explain how error handling works in RxJS.
8. What is the difference between subscribe() and forEach() methods in RxJS?

## What is RxJS, and why is it used?

**RxJS (Reactive Extensions for JavaScript)** is a library for reactive programming with Observables, used to compose asynchronous and event-based programs as observable sequences. It is widely used in modern JavaScript apps — especially Angular — to manage async data streams and events.

**Core concepts:**

- **Observables** — represent a stream of future values/events (HTTP responses, user input, WebSocket messages); can emit multiple values over time.
- **Observers** — subscribe to an Observable and define how emitted values are handled.
- **Operators** — functions that transform, filter, merge, or combine emitted data.
- **Subjects** — special Observables that act as both Observable and Observer, multicasting values to many subscribers.
- **Schedulers** — control the concurrency and timing of Observable execution.

**Why it's used:** consistent handling of async data streams, declarative (and thus readable) data flow, composability of complex pipelines, simplified event handling, robust error handling, and concurrency management (throttling, debouncing, merging).

**Basic Observable:**

```typescript
import { Observable } from 'rxjs';

const observable = new Observable(observer => {
  observer.next('Hello');
  observer.next('World');
  observer.complete();
});

observable.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});
```

**Using operators** — `filter` and `map` transform emitted values into a sequence of doubled even numbers:

```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

const numbers$ = of(1, 2, 3, 4, 5);
numbers$
  .pipe(
    filter(num => num % 2 === 0),
    map(num => num * 2)
  )
  .subscribe(result => console.log(result));
```

## Explain the difference between Observables and Promises.

Both handle asynchronous operations, but differ significantly in capability.

**1. Concept:** a **Promise** represents a single future value, resolved or rejected exactly once. An **Observable** represents a stream of values arriving over time, emitting multiple values, errors, and completion.

**2. Emission** — a Promise emits one value/error and cannot be reused; an Observable emits zero or more values and can be cancelled.

```typescript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Value'), 1000);
});
promise.then(value => console.log(value)); // 'Value'
```

```typescript
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next('Value 1');
  subscriber.next('Value 2');
  subscriber.complete();
});
observable.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Complete')
});
```

**3. Async data** — Promises suit a single async result; Observables suit ongoing streams like events.

```typescript
import { fromEvent } from 'rxjs';

const clickObservable = fromEvent(document, 'click');
clickObservable.subscribe(event => console.log('Clicked', event));
```

**4. Cancellation** — Promises have no native cancellation; Observables support it via `unsubscribe()`.

```typescript
import { interval } from 'rxjs';

const observable = interval(1000);
const subscription = observable.subscribe(value => console.log(value));
setTimeout(() => subscription.unsubscribe(), 5000);
```

**5. Composition** — Promises chain with `.then()`/`.catch()`; Observables compose with operators like `map`, `filter`, `merge`, `concat`.

```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
  .pipe(
    filter(num => num % 2 === 0),
    map(num => num * 2)
  )
  .subscribe(result => console.log(result)); // 4, 8
```

**6. Use cases** — Promises for one-off operations (API call, file read); Observables for multiple events or continuous streams (user interactions, real-time feeds). Their cancellation and composition make Observables the better choice for complex scenarios.

## What are operators in RxJS, and why are they important?

**Operators** are functions that transform, filter, combine, and manipulate data emitted by Observables, enabling declarative and composable handling of async streams. They are grouped by purpose.

**1. Creation operators** — build Observables from data sources.

```typescript
import { of } from 'rxjs';
const observable = of(1, 2, 3);
observable.subscribe(value => console.log(value)); // 1, 2, 3
```

```typescript
import { from } from 'rxjs';
const observable = from([1, 2, 3]); // also works with promises, iterables
observable.subscribe(value => console.log(value)); // 1, 2, 3
```

```typescript
import { interval } from 'rxjs';
const observable = interval(1000); // emits at intervals
observable.subscribe(value => console.log(value)); // 0, 1, 2, ...
```

**2. Transformation operators** — reshape emitted data. `map` applies a function to each value; `switchMap` maps each value to an Observable, unsubscribing from the previous one.

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
of(1, 2, 3).pipe(map(value => value * 2))
  .subscribe(value => console.log(value)); // 2, 4, 6
```

```typescript
import { of, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
of(1, 2, 3).pipe(switchMap(value => interval(1000)))
  .subscribe(value => console.log(value)); // 0, 1, 2, ...
```

**3. Filtering operators** — emit only values meeting a condition. `filter` passes matching values; `debounceTime` emits only after a quiet period.

```typescript
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';
of(1, 2, 3, 4, 5).pipe(filter(value => value % 2 === 0))
  .subscribe(value => console.log(value)); // 2, 4
```

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
const input = document.querySelector('input');
fromEvent(input, 'keyup').pipe(debounceTime(300))
  .subscribe(event => console.log(event));
```

**4. Combination operators** — merge multiple Observables. `merge` interleaves emissions; `concat` runs them sequentially.

```typescript
import { of, merge } from 'rxjs';
merge(of(1, 2, 3), of(4, 5, 6))
  .subscribe(value => console.log(value)); // 1, 2, 3, 4, 5, 6
```

```typescript
import { of, concat } from 'rxjs';
concat(of(1, 2, 3), of(4, 5, 6))
  .subscribe(value => console.log(value)); // 1, 2, 3, 4, 5, 6
```

**5. Utility operators** — e.g., `tap` performs side effects (logging) without altering the stream.

```typescript
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
of(1, 2, 3).pipe(tap(value => console.log(`Value: ${value}`)))
  .subscribe();
```

**Why they matter:** operators enable declarative programming, composable pipelines, reusable logic, built-in error handling, and the flexibility to address a wide range of async scenarios.

## What is an Observer in RxJS?

An **Observer** is an object that defines how to handle the values, errors, and completion notifications emitted by an Observable. It has three optional methods:

- **`next(value)`** — called for each emitted value.
- **`error(err)`** — called if the Observable errors (allows cleanup/reporting).
- **`complete()`** — called once when the Observable finishes emitting.

**Example:**

```typescript
import { Observable } from 'rxjs';

const observable = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

const observer = {
  next: (value: number) => console.log(`Next: ${value}`),
  error: (err: any) => console.log(`Error: ${err}`),
  complete: () => console.log('Complete')
};

observable.subscribe(observer);
```

When subscribing you can pass an Observer object directly, or supply individual handlers:

```typescript
observable.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.error(err),
  complete: () => console.log('Done')
});
```

```typescript
observable.subscribe(
  (value) => console.log(value), // next
  (err) => console.error(err),   // error
  () => console.log('Completed') // complete
);
```

In short, the Observer is the consumer side of an Observable — it reacts to the stream's values, errors, and completion.

## What is an Observable, and how do you create one in RxJS?

An **Observable** represents a stream of values or events arriving over time, providing a flexible, composable way to handle async data. Key characteristics:

- **Emits values** — zero or more over time.
- **Handles errors** — can emit an error notification.
- **Completion** — signals when finished.
- **Lazy** — doesn't emit until subscribed, enabling efficient resource use.
- **Unsubscription** — supports cancellation to stop emissions and free resources.

**Using the `Observable` constructor** — define emission logic via the subscriber object:

```typescript
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next('Hello');
  subscriber.next('World');
  subscriber.complete();
  // subscriber.error('An error occurred'); // optional error
});

observable.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Complete')
});
```

**Using creation operators** — build Observables from various sources:

```typescript
import { of } from 'rxjs';
of(1, 2, 3).subscribe(value => console.log(value)); // 1, 2, 3
```

```typescript
import { from } from 'rxjs';
from([1, 2, 3]).subscribe(value => console.log(value)); // arrays, promises, etc.
```

```typescript
import { interval } from 'rxjs';
interval(1000).subscribe(value => console.log(value)); // 0, 1, 2, ...
```

```typescript
import { fromEvent } from 'rxjs';
fromEvent(document, 'click').subscribe(event => console.log('Click event', event));
```

**Custom Observable** — emits numbers 1–5 at one-second intervals, then completes:

```typescript
import { Observable } from 'rxjs';

const numberObservable = new Observable<number>(subscriber => {
  let count = 1;
  const intervalId = setInterval(() => {
    if (count > 5) {
      subscriber.complete();
      clearInterval(intervalId);
    } else {
      subscriber.next(count++);
    }
  }, 1000);
});

numberObservable.subscribe({
  next: value => console.log(value), // 1, 2, 3, 4, 5
  complete: () => console.log('Completed')
});
```

## What are cold and hot Observables?

Cold and hot Observables differ in *when* they emit and *how* they share execution.

**Cold Observables** don't emit until subscribed, and each subscription triggers a new, independent execution — so every subscriber receives the same sequence from the start. They are lazy and well-suited to per-subscriber operations like HTTP requests or file reads.

```typescript
import { Observable } from 'rxjs';

const coldObservable = new Observable(subscriber => {
  console.log('Observable starts');
  subscriber.next('Hello');
  subscriber.next('World');
  subscriber.complete();
});

coldObservable.subscribe(value => console.log('Subscriber 1:', value));
// Observable starts / Subscriber 1: Hello / Subscriber 1: World
coldObservable.subscribe(value => console.log('Subscriber 2:', value));
// Observable starts / Subscriber 2: Hello / Subscriber 2: World
```

**Hot Observables** emit regardless of subscribers and share a single execution; subscribers receive only values emitted *after* they subscribe. They suit inherently shared sources like user input, WebSockets, or real-time streams.

```typescript
import { Subject } from 'rxjs';

const hotObservable = new Subject<string>(); // a hot Observable
hotObservable.next('Hello');
hotObservable.next('World');
hotObservable.subscribe(value => console.log('Subscriber 1:', value));
// Subscriber 1: World
hotObservable.next('New Value');
hotObservable.subscribe(value => console.log('Subscriber 2:', value));
// Subscriber 1: New Value / Subscriber 2: New Value
```

In short: cold = per-subscriber execution replaying the full sequence; hot = shared execution where late subscribers miss earlier emissions.

## Explain how error handling works in RxJS.

Error handling lets async streams recover gracefully from failures.

**1. Error emission** — an Observable signals an error by calling `subscriber.error(...)`, which propagates to the subscriber's `error` callback and stops further emissions.

```typescript
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next('Value 1');
  subscriber.error('An error occurred');
  subscriber.next('Value 2'); // not emitted
});

observable.subscribe({
  next: value => console.log('Next:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Complete')
});
```

**2. Error-handling operators**

`catchError` catches an error and returns a fallback Observable:

```typescript
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const observable = throwError('An error occurred').pipe(
  catchError(err => {
    console.error('Caught error:', err);
    return of('Default Value');
  })
);
observable.subscribe({
  next: value => console.log('Next:', value),
  complete: () => console.log('Complete')
});
```

`retry` re-subscribes a set number of times before passing the error through:

```typescript
import { throwError } from 'rxjs';
import { retry } from 'rxjs/operators';

const observable = throwError('An error occurred').pipe(retry(3));
observable.subscribe({
  next: value => console.log('Next:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Complete')
});
```

`retryWhen` gives full control over retry strategy (e.g., delayed retries):

```typescript
import { throwError, timer } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';

const observable = throwError('An error occurred').pipe(
  retryWhen(errors => errors.pipe(
    mergeMap((error, index) => index < 3 ? timer(1000) : throwError(error))
  ))
);
observable.subscribe({
  next: value => console.log('Next:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Complete')
});
```

**3. With higher-order mapping operators** — operators like `mergeMap`, `switchMap`, and `concatMap` propagate inner errors unless handled, typically by `catchError`:

```typescript
import { of, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

const observable = of('Start').pipe(
  mergeMap(() => throwError('An error occurred')),
  catchError(err => {
    console.error('Caught error in mergeMap:', err);
    return of('Fallback Value');
  })
);
observable.subscribe({
  next: value => console.log('Next:', value),
  complete: () => console.log('Complete')
});
```

In summary, handle errors via the subscriber's `error` callback for direct handling, or via `catchError`, `retry`, and `retryWhen` for declarative recovery — combinable with higher-order operators for complex flows.

## What is the difference between subscribe() and forEach() methods in RxJS?

Both consume values from an Observable but serve different purposes.

**`subscribe()`** is the primary consumption method. It handles multiple emissions, errors, and completion; stays active until you unsubscribe or the Observable completes; and lets you manage the subscription lifecycle. Ideal for ongoing operations like real-time streams.

```typescript
import { interval } from 'rxjs';

const observable = interval(1000);
const subscription = observable.subscribe({
  next: value => console.log('Value:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Completed')
});
setTimeout(() => subscription.unsubscribe(), 5000);
```

**`forEach()`** runs a function for each emitted value and returns a **Promise** that resolves on completion (and rejects on error). It cannot be unsubscribed — it processes values until the Observable completes. Best for simple, one-time processing.

```typescript
import { of } from 'rxjs';

const observable = of(1, 2, 3, 4, 5);
observable.forEach(value => {
  console.log('Value:', value);
}).then(() => {
  console.log('Completed');
}).catch(err => {
  console.error('Error:', err);
});
```

In short: use `subscribe()` for ongoing streams and full lifecycle/error control; use `forEach()` for simple, Promise-based one-time value handling without active subscription management.

---

## Related Topics

- **RxJS Operators** (`Angular/`)
- **NgRx Basics** (`Angular/`)
