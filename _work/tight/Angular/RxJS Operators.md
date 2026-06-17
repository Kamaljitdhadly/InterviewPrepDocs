# RxJS Operators

## Questions Covered

1. What are the different types of RxJS operators?
2. Explain the difference between pipeable and creation operators.
3. What does the map() operator do in RxJS?
4. Explain the difference between mergeMap(), switchMap(), concatMap(), and exhaustMap().
5. What is the purpose of the filter() operator?
6. What does the catchError() operator do?
7. Explain the difference between combineLatest() and forkJoin().
8. How do you debounce user input in RxJS?
9. What is the difference between merge() and concat() operators?
10. Explain the take() and takeUntil() operators.

## What are the different types of RxJS operators?

RxJS operators are functions that transform, filter, combine, and manipulate Observable streams. They are grouped by purpose.

**1. Creation operators** — create new Observables from various sources.

```typescript
import { of } from 'rxjs';
const observable = of(1, 2, 3); // emits the args as a sequence
```

```typescript
import { from } from 'rxjs';
const observable = from([1, 2, 3]); // from an array, promise, or iterable
```

```typescript
import { interval } from 'rxjs';
const observable = interval(1000); // sequential numbers every second
```

```typescript
import { timer } from 'rxjs';
const observable = timer(2000, 1000); // after 2s, then every second
```

```typescript
import { fromEvent } from 'rxjs';
const observable = fromEvent(document, 'click'); // from DOM events
```

**2. Transformation operators** — transform emitted values.

```typescript
import { map } from 'rxjs/operators';
const observable = of(1, 2, 3).pipe(map(x => x * 2)); // Emits: 2, 4, 6
```

```typescript
import { mergeMap } from 'rxjs/operators';
const observable = of(1, 2).pipe(mergeMap(x => of(x * 10))); // projects + merges
```

```typescript
import { switchMap } from 'rxjs/operators';
const observable = of(1, 2).pipe(switchMap(x => of(x * 10))); // projects + cancels previous
```

```typescript
import { concatMap } from 'rxjs/operators';
const observable = of(1, 2).pipe(concatMap(x => of(x * 10))); // projects + concatenates
```

**3. Filtering operators** — emit only values meeting some criteria.

```typescript
import { filter } from 'rxjs/operators';
const observable = of(1, 2, 3, 4).pipe(filter(x => x % 2 === 0)); // Emits: 2, 4
```

```typescript
import { take } from 'rxjs/operators';
const observable = interval(1000).pipe(take(3)); // Emits: 0, 1, 2
```

```typescript
import { takeUntil, interval, timer } from 'rxjs';
const notifier = timer(5000);
const observable = interval(1000).pipe(takeUntil(notifier)); // emits until notifier fires
```

**4. Combining operators** — combine multiple Observables.

```typescript
import { merge, of } from 'rxjs';
const observable = merge(of('A'), of('B', 'C')); // interleaves emissions
```

```typescript
import { concat, of } from 'rxjs';
const observable = concat(of('A'), of('B', 'C')); // emits in sequence
```

```typescript
import { combineLatest, of } from 'rxjs';
const observable = combineLatest([of('A'), of('B', 'C')]); // latest from each
```

```typescript
import { zip, of } from 'rxjs';
const observable = zip(of('A', 'B'), of(1, 2)); // Emits: ['A', 1], ['B', 2]
```

**5. Utility operators** — side effects and resource management.

```typescript
import { tap } from 'rxjs/operators';
const observable = of(1, 2, 3).pipe(tap(value => console.log('Value:', value)));
```

```typescript
import { finalize } from 'rxjs/operators';
const observable = of(1, 2, 3).pipe(finalize(() => console.log('Complete')));
```

```typescript
import { share } from 'rxjs/operators';
const observable = of(1, 2, 3).pipe(share()); // share one subscription
```

In short: **creation** operators build Observables, **transformation** operators reshape values, **filtering** operators select values, **combining** operators merge streams, and **utility** operators handle side effects — combine them to build complex pipelines.

## Explain the difference between pipeable and creation operators.

**Creation operators** create Observables from a source; they are the starting point of a stream and need no prior Observable. Examples:

```typescript
import { of, from, interval, timer, fromEvent } from 'rxjs';
of(1, 2, 3);                  // emits 1, 2, 3
from([1, 2, 3]);              // from array/promise/iterable
interval(1000);               // 0, 1, 2, ... every second
timer(2000, 1000);            // 0 after 2s, then every second
fromEvent(document, 'click'); // click events
```

**Pipeable operators** (formerly "lettable") transform, filter, or combine values of an *existing* Observable, applied through `.pipe()`. They don't create streams on their own. Examples:

```typescript
import { map, filter, mergeMap, switchMap, catchError } from 'rxjs/operators';
of(1, 2, 3).pipe(map(x => x * 2));            // Emits: 2, 4, 6
of(1, 2, 3, 4).pipe(filter(x => x % 2 === 0)); // Emits: 2, 4
of(1, 2).pipe(mergeMap(x => of(x * 10)));      // projects + merges
of(1, 2).pipe(switchMap(x => of(x * 10)));     // projects + cancels previous
throwError('An error').pipe(catchError(err => of('Fallback value')));
```

**Key differences:**

- **Purpose** — creation operators initialize a new stream; pipeable operators modify an existing one.
- **Usage** — creation operators are called directly (`of(1, 2, 3)`); pipeable operators run inside `.pipe()` (`observable.pipe(map(x => x * 2))`).
- **Effect** — creation operators start emitting based on input; pipeable operators enhance/transform an existing stream.

## What does the map() operator do in RxJS?

`map()` is a transformation operator that applies a function to each emitted value and returns a new Observable of the transformed values. It works by taking an input Observable, applying a projection function to every emission, and outputting a new Observable with the results.

**Example:**

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const source$ = of(1, 2, 3);
const doubled$ = source$.pipe(map(value => value * 2));

doubled$.subscribe({
  next: value => console.log('Emitted value:', value),
  complete: () => console.log('Completed')
});
```

**Output:** `2`, `4`, `6`, then `Completed`.

**Key points:** `map()` takes a single projection function, performs a **one-to-one** mapping (each input produces one output), preserves the Observable's other characteristics, and is immutable — source values aren't changed, new ones are emitted.

**Use cases:** formatting raw data for the UI, performing calculations (e.g., unit conversion), and reshaping data such as converting API responses to another structure.

## Explain the difference between mergeMap(), switchMap(), concatMap(), and exhaustMap().

All four are higher-order mapping operators that project each value to an inner Observable; they differ in how those inner Observables are subscribed to and emitted. The examples below share this setup, where the source emits `1, 2, 3` and each maps to a timed inner stream:

**`mergeMap()`** — subscribes to all inner Observables **concurrently** and merges (interleaves) their emissions. Use it for concurrent operations where order doesn't matter.

```typescript
import { of, interval } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
const source$ = of(1, 2, 3);
const result$ = source$.pipe(
  mergeMap(value => interval(1000).pipe(take(3)))
);
result$.subscribe(value => console.log(value));
```

**`switchMap()`** — switches to the newest inner Observable, **canceling** (unsubscribing) the previous one when a new source value arrives. Use it when only the most recent result matters (e.g., type-ahead search).

```typescript
import { of, interval } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
const source$ = of(1, 2, 3);
const result$ = source$.pipe(
  switchMap(value => interval(1000).pipe(take(3)))
);
result$.subscribe(value => console.log(value));
```

**`concatMap()`** — runs inner Observables **sequentially**, waiting for each to complete before subscribing to the next, preserving order.

```typescript
import { of, interval } from 'rxjs';
import { concatMap, take } from 'rxjs/operators';
const source$ = of(1, 2, 3);
const result$ = source$.pipe(
  concatMap(value => interval(1000).pipe(take(3)))
);
result$.subscribe(value => console.log(value));
```

**`exhaustMap()`** — **ignores** new source values while the current inner Observable is still active; only one inner stream runs at a time. Useful to prevent duplicate work, e.g., blocking repeated form submissions.

```typescript
import { of, interval } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
const source$ = of(1, 2, 3);
const result$ = source$.pipe(
  exhaustMap(value => interval(1000).pipe(take(3)))
);
result$.subscribe(value => console.log(value));
```

**Summary:** `mergeMap()` runs concurrently, `switchMap()` keeps only the latest (canceling others), `concatMap()` runs in order one at a time, and `exhaustMap()` ignores new values until the current one finishes.

## What is the purpose of the filter() operator?

`filter()` emits only the values that satisfy a predicate, dropping the rest. It's used for **selective emission** (passing only relevant data), **data validation** (checking against criteria), and **stream manipulation** based on dynamic conditions.

It works by running a predicate function on each emitted value; values for which it returns `true` pass through, and the order is preserved.

**Example:**

```typescript
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

const source$ = of(1, 2, 3, 4, 5);
const evenNumbers$ = source$.pipe(filter(value => value % 2 === 0));

evenNumbers$.subscribe(value => console.log('Even Number:', value));
```

**Output:** `Even Number: 2`, `Even Number: 4`.

**Key points:** the predicate returns a boolean per value; `filter()` is immutable (source values are unchanged) and preserves emission order.

**Use cases:** filtering user inputs/API responses, handling only specific events, and implementing search by excluding non-matching results.

## What does the catchError() operator do?

`catchError()` handles errors in an Observable stream, letting you recover or substitute a replacement Observable instead of letting the stream terminate. It's used for **error handling**, **error recovery** (providing a fallback), and **graceful degradation**.

It works by passing the caught error to a handler function that must return a new Observable to continue the stream; if it doesn't (or rethrows), the error propagates and terminates the stream.

**Example:**

```typescript
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const source$ = throwError('An error occurred!');
const result$ = source$.pipe(
  catchError(error => {
    console.error('Caught error:', error);
    return of('Fallback value');
  })
);

result$.subscribe(value => console.log('Emitted value:', value));
```

**Output:** `Caught error: An error occurred!`, then `Emitted value: Fallback value`.

**Key points:** the handler receives the error object and should return a fallback Observable (a value, another Observable, or a sequence); returning one keeps the stream alive, while not returning one lets the error propagate.

**Use cases:** handling HTTP/API errors with fallback data, showing user-friendly messages, and combining with retry logic for intermittent failures.

## Explain the difference between combineLatest() and forkJoin().

Both combine multiple Observables, but they differ in *when* they emit.

**`combineLatest()`** emits an array of the **latest** values from each source whenever **any** source emits — after every source has emitted at least once. It keeps emitting on every subsequent change, so it's ideal for continuously reacting to multiple streams.

```typescript
import { combineLatest, of } from 'rxjs';
const observable1$ = of('A', 'B', 'C');
const observable2$ = of(1, 2, 3);
const combined$ = combineLatest([observable1$, observable2$]);
combined$.subscribe(([val1, val2]) => console.log(`Latest values: ${val1}, ${val2}`));
```

**Output:** `Latest values: C, 3`.

**`forkJoin()`** waits for **all** sources to **complete**, then emits a single array of each source's **last** value. If a source completes without emitting, its slot is `undefined`. It's ideal for waiting on parallel operations (e.g., several HTTP requests) and using only their final results.

```typescript
import { forkJoin, of } from 'rxjs';
const observable1$ = of('A', 'B', 'C');
const observable2$ = of(1, 2, 3);
const combined$ = forkJoin([observable1$, observable2$]);
combined$.subscribe(([val1, val2]) => console.log(`Final values: ${val1}, ${val2}`));
```

**Output:** `Final values: C, 3`.

**Key differences:**

- **Emission timing** — `combineLatest()` emits on each source change; `forkJoin()` emits once, after all complete.
- **Completion** — `combineLatest()` only needs one emission per source; `forkJoin()` requires all sources to complete.
- **Use case** — `combineLatest()` for continuous reaction to live streams; `forkJoin()` for a one-time combination of final results.

## How do you debounce user input in RxJS?

Debouncing delays processing of high-frequency input (e.g., keystrokes) until the user pauses for a set time, improving performance and avoiding unnecessary work. The `debounceTime()` operator does this: it waits a given number of milliseconds after the last emission, then emits only the most recent value.

**Example** — debouncing a search field:

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

const inputElement = document.getElementById('searchInput') as HTMLInputElement;

const input$ = fromEvent(inputElement, 'input').pipe(
  map((event: Event) => (event.target as HTMLInputElement).value),
  debounceTime(300) // wait 300ms after the last input
);

input$.subscribe(value => {
  console.log('Debounced value:', value);
  // perform search or other actions here
});
```

Here `fromEvent()` streams input events, `map()` extracts the value, `debounceTime(300)` waits 300ms of inactivity before emitting the latest value, and `subscribe()` handles the result.

**Key points:** the debounce duration is the quiet time required after the last emission; only the most recent value is emitted, preventing rapid emissions from overwhelming the system.

**Use cases:** search inputs (avoid per-keystroke API calls), form validation after typing stops, and auto-completion that waits for a pause.

## What is the difference between merge() and concat() operators?

Both combine multiple Observables but handle emissions differently.

**`merge()`** runs sources **concurrently**, emitting values from all of them as they arrive (interleaved); order across sources isn't guaranteed. Use it for streams producing values simultaneously, like real-time data from multiple sources.

```typescript
import { merge, interval } from 'rxjs';
import { take } from 'rxjs/operators';
const observable1$ = interval(500).pipe(take(3));  // every 500ms
const observable2$ = interval(1000).pipe(take(3)); // every 1000ms
const merged$ = merge(observable1$, observable2$);
merged$.subscribe(value => console.log('Merged value:', value));
```

**Output:** `0, 0, 1, 1, 2, 2` — values from both streams interleave by timing.

**`concat()`** runs sources **sequentially**, fully completing one before subscribing to the next, preserving order. Use it when each Observable must finish before the next begins.

```typescript
import { concat, interval } from 'rxjs';
import { take } from 'rxjs/operators';
const observable1$ = interval(500).pipe(take(3));
const observable2$ = interval(1000).pipe(take(3));
const concatenated$ = concat(observable1$, observable2$);
concatenated$.subscribe(value => console.log('Concatenated value:', value));
```

**Output:** `0, 1, 2, 0, 1, 2` — the first stream finishes before the second starts.

**Key differences:** `merge()` is concurrent with interleaved, timing-dependent emissions; `concat()` is strictly sequential with order-preserving emissions.

## Explain the take() and takeUntil() operators.

Both limit emissions from an Observable, but with different stop conditions.

**`take(n)`** emits only the first **n** values, then automatically completes — regardless of whether the source completes. Use it to grab a fixed number of values.

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
const source$ = interval(500);
const taken$ = source$.pipe(take(3));
taken$.subscribe(value => console.log('Value:', value));
```

**Output:** `0`, `1`, `2`, then completes; later emissions are ignored.

**`takeUntil(notifier$)`** emits values until a **notifier** Observable emits, then completes the source. This gives dynamic, event-driven completion.

```typescript
import { interval, of } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
const source$ = interval(500);
const notifier$ = of(null).pipe(delay(2000)); // emits after 2 seconds
const takenUntil$ = source$.pipe(takeUntil(notifier$));
takenUntil$.subscribe(value => console.log('Value:', value));
```

**Output:** `0`, `1` — emissions stop when the notifier fires at 2 seconds.

**Key differences:** `take()` completes after a **fixed count**; `takeUntil()` completes when an **external notifier** emits. A common pattern is `takeUntil()` with a destroy subject to stop streams when a component is destroyed.
