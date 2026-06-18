# RxJS Advanced Concepts

## Questions Covered

1. What is a Higher-Order Observable?
2. How does flatMap() (or mergeMap()) handle multiple inner Observables?
3. Explain backpressure in RxJS.
4. What is the role of Scheduler in RxJS?
5. How do you cancel an Observable subscription?
6. Explain the concept of "hot" and "cold" Observables and their usage.

## What is a Higher-Order Observable?

A **Higher-Order Observable** is an Observable that emits other Observables — an Observable of Observables. Because the inner values are themselves Observables, you usually need a **flattening operator** (`mergeMap`, `switchMap`, `concatMap`, `exhaustMap`) to work with their emitted values directly.

The four common flattening operators differ in how they manage inner Observables:

**`mergeMap`** — flattens by merging all inner Observables concurrently (parallel handling).

```typescript
import { of } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';

const higherOrder$ = of(
  of('A').pipe(delay(1000)),
  of('B').pipe(delay(2000)),
  of('C').pipe(delay(3000))
);
higherOrder$.pipe(
  mergeMap(inner$ => inner$)
).subscribe(value => console.log(value));
```

**`switchMap`** — switches to the latest inner Observable, unsubscribing from previous ones. Ideal for type-ahead search.

```typescript
import { of } from 'rxjs';
import { switchMap, delay } from 'rxjs/operators';

const higherOrder$ = of(
  of('A').pipe(delay(1000)),
  of('B').pipe(delay(2000)),
  of('C').pipe(delay(3000))
);
higherOrder$.pipe(
  switchMap(inner$ => inner$)
).subscribe(value => console.log(value));
```

**`concatMap`** — concatenates inner Observables sequentially, preserving order.

```typescript
import { of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';

const higherOrder$ = of(
  of('A').pipe(delay(1000)),
  of('B').pipe(delay(2000)),
  of('C').pipe(delay(3000))
);
higherOrder$.pipe(
  concatMap(inner$ => inner$)
).subscribe(value => console.log(value));
```

**`exhaustMap`** — ignores new inner Observables while one is still processing.

```typescript
import { of } from 'rxjs';
import { exhaustMap, delay } from 'rxjs/operators';

const higherOrder$ = of(
  of('A').pipe(delay(1000)),
  of('B').pipe(delay(2000)),
  of('C').pipe(delay(3000))
);
higherOrder$.pipe(
  exhaustMap(inner$ => inner$)
).subscribe(value => console.log(value));
```

**Use cases:** handling a stream of HTTP requests (each returning an Observable), managing complex/real-time data streams, and type-ahead search (where `switchMap` ensures only the latest result is processed). Choosing the right flattening operator controls how inner Observables are combined.

## How does flatMap() (or mergeMap()) handle multiple inner Observables?

`flatMap()` is an alias for `mergeMap()`. It projects each source value into an inner Observable and **merges** all their emissions into a single output Observable, handling them concurrently.

**How it works:**

1. **Projection** — each source value is transformed into an inner Observable via a projection function.
2. **Subscription** — `mergeMap` subscribes to every inner Observable.
3. **Merging** — emissions from all active inner Observables are interleaved into one output stream.
4. **Concurrency** — by default all inner Observables run concurrently; an optional concurrency parameter caps how many are active at once.

```typescript
import { of, interval } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';

const higherOrder$ = of(
  interval(1000).pipe(delay(1000)), // emits 0, 1, 2, ...
  interval(2000).pipe(delay(2000)), // emits 0, 1, 2, ...
  interval(3000).pipe(delay(3000))  // emits 0, 1, 2, ...
);
higherOrder$.pipe(
  mergeMap(inner$ => inner$)
).subscribe(value => console.log('Merged value:', value));
```

**Output:**

```text
Merged value: 0
Merged value: 1
Merged value: 2
...
```

Here `higherOrder$` emits three inner Observables, each with its own interval; `mergeMap` subscribes to all concurrently and interleaves their emissions.

**Concurrency control** — pass a limit as the second argument to cap simultaneous inner subscriptions; once one completes, the next in the queue starts:

```typescript
import { of, interval } from 'rxjs';
import { mergeMap, delay } from 'rxjs/operators';

const higherOrder$ = of(
  interval(1000).pipe(delay(1000)),
  interval(2000).pipe(delay(2000)),
  interval(3000).pipe(delay(3000))
);
higherOrder$.pipe(
  mergeMap(inner$ => inner$, 2) // at most 2 inner Observables concurrently
).subscribe(value => console.log('Merged value:', value));
```

In short, `mergeMap`/`flatMap` flattens and merges multiple inner Observables concurrently, with an optional concurrency cap — ideal for handling multiple data streams simultaneously.

## Explain backpressure in RxJS.

**Backpressure** occurs when an Observable (producer) emits values faster than the subscriber (consumer) can process them. This imbalance can cause memory overflows, slowdowns, or dropped values.

**Key terms:** the **producer** emits the stream; the **consumer** processes it; **overproduction** happens when emission outpaces consumption; a **slow consumer** can't keep up. It typically arises with rapid sources (events, input, WebSockets, APIs) combined with time-consuming processing.

RxJS provides several strategies to control the flow:

**1. Buffering** — collect values and emit them together as an array. `bufferTime` buffers over a time window:

```typescript
import { interval } from 'rxjs';
import { bufferTime } from 'rxjs/operators';

const source$ = interval(100); // every 100ms
source$.pipe(
  bufferTime(1000)
).subscribe(buffer => console.log(buffer));
```

This buffers values for 1 second and emits them as an array.

**2. Windowing** — like buffering, but emits each group as a new Observable. `windowTime` splits the source into time-based windows:

```typescript
import { interval } from 'rxjs';
import { windowTime, mergeAll } from 'rxjs/operators';

const source$ = interval(100); // every 100ms
source$.pipe(
  windowTime(1000),
  mergeAll() // flatten windowed Observables back into one stream
).subscribe(value => console.log(value));
```

This opens a new window every 1 second, each emitting its values as a separate Observable.

**3. Throttling** — emit one value then ignore others during a window. `throttleTime` allows one emission per period:

```typescript
import { interval } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

const source$ = interval(100); // every 100ms
source$.pipe(
  throttleTime(500)
).subscribe(value => console.log(value));
```

Only one value passes every 500ms.

**4. Debouncing** — emit only after a pause in activity. `debounceTime` waits for inactivity before emitting the last value:

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const input = document.querySelector('input');
fromEvent(input, 'input').pipe(
  debounceTime(500)
).subscribe(event => console.log((event.target as HTMLInputElement).value));
```

This waits 500ms of inactivity before emitting input, preventing backpressure from rapid typing.

**5. Sampling** — periodically emit the most recent value. `sampleTime` snapshots at regular intervals:

```typescript
import { interval } from 'rxjs';
import { sampleTime } from 'rxjs/operators';

const source$ = interval(100); // every 100ms
source$.pipe(
  sampleTime(1000)
).subscribe(value => console.log(value));
```

This emits the latest value every 1 second, reducing emission frequency.

**Summary:** buffering (`bufferTime`) and windowing (`windowTime`) group emissions; throttling (`throttleTime`), debouncing (`debounceTime`), and sampling (`sampleTime`) reduce their frequency. The right choice depends on the data stream and use case.

## What is the role of Scheduler in RxJS?

A **Scheduler** controls the timing and context of when asynchronous tasks (Observables and operators) execute, managing concurrency. It determines **when** a task runs (immediately, after a delay, or periodically) and **in what context** (current thread, future event loop, etc.).

**Key roles:** task scheduling (immediate or deferred), concurrency handling, and execution context.

**Built-in schedulers:**

**`asyncScheduler`** — runs tasks asynchronously (like `setTimeout`), in a future event loop.

```typescript
import { asyncScheduler, of } from 'rxjs';
import { observeOn } from 'rxjs/operators';

of(1, 2, 3).pipe(
  observeOn(asyncScheduler)
).subscribe(value => console.log(value));
```

The values emit asynchronously in the next event loop.

**`queueScheduler`** — runs tasks synchronously in FIFO order, preventing recursion issues.

```typescript
import { of, queueScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

of(1, 2, 3).pipe(
  observeOn(queueScheduler)
).subscribe(value => console.log(value));
```

**`asapScheduler`** — runs as soon as possible, after current synchronous code but before the next event loop (high priority, non-blocking).

```typescript
import { of, asapScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

of(1, 2, 3).pipe(
  observeOn(asapScheduler)
).subscribe(value => console.log(value));
```

**`animationFrameScheduler`** — schedules tasks within the next browser animation frame (~60fps), ideal for animations synced to rendering.

```typescript
import { interval, animationFrameScheduler } from 'rxjs';

const animation$ = interval(0, animationFrameScheduler);
animation$.subscribe(frame => console.log(`Frame: ${frame}`));
```

**Applying schedulers:** `observeOn` sets the Scheduler on which notifications (`next`/`error`/`complete`) are emitted; `subscribeOn` sets where the subscription/work itself runs.

```typescript
import { of, asyncScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

of(1, 2, 3).pipe(observeOn(asyncScheduler))
  .subscribe(value => console.log(value));
```

```typescript
import { of, asyncScheduler } from 'rxjs';
import { subscribeOn } from 'rxjs/operators';

of(1, 2, 3).pipe(subscribeOn(asyncScheduler))
  .subscribe(value => console.log(value));
```

**Why they matter:** schedulers handle async tasks (delays, deferral, concurrency), manage performance for heavy tasks or animations, prevent stack overflows and infinite recursion, and let you switch between synchronous and asynchronous execution.

## How do you cancel an Observable subscription?

Subscribing returns a **Subscription** object; calling its **`unsubscribe()`** method stops emissions and releases resources.

**1. Subscribe** — the subscription stays active until completion, error, or unsubscribe:

```typescript
import { interval } from 'rxjs';

const observable$ = interval(1000);
const subscription = observable$.subscribe(value => console.log(value));
```

**2. Unsubscribe** — call `unsubscribe()` on the subscription:

```typescript
setTimeout(() => {
  subscription.unsubscribe();
  console.log('Unsubscribed');
}, 5000); // unsubscribes after 5 seconds
```

**Why it matters:** prevents memory leaks from long-running Observables (intervals, WebSockets, event listeners), stops unnecessary processing/side effects, and frees resources like sockets and timers.

**Full example:**

```typescript
import { fromEvent } from 'rxjs';

const clicks$ = fromEvent(document, 'click');
const subscription = clicks$.subscribe(event => console.log(event));
setTimeout(() => {
  subscription.unsubscribe();
  console.log('Unsubscribed from click events');
}, 10000);
```

**Multiple subscriptions** — group with `Subscription.add()` so unsubscribing the parent cancels children:

```typescript
const sub1 = observable1$.subscribe();
const sub2 = observable2$.subscribe();
sub1.add(sub2); // sub2 unsubscribed along with sub1
sub1.unsubscribe();
```

**Automatic unsubscription with `takeUntil()`** — unsubscribe when another Observable emits:

```typescript
import { fromEvent, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const clicks$ = fromEvent(document, 'click');
const timer$ = interval(1000);
timer$.pipe(
  takeUntil(clicks$) // unsubscribe on first click
).subscribe(value => console.log(value));
```

In short, cancel with `unsubscribe()` to avoid leaks and wasted resources, and use operators like `takeUntil()` to automate it.

## Explain the concept of "hot" and "cold" Observables and their usage.

Observables are **cold** or **hot** depending on how they emit values when multiple subscribers subscribe.

**Cold Observables** start producing values only on subscription, giving each subscriber its own independent execution — so values can differ per subscriber. Examples: HTTP requests, file reads, AJAX calls.

```typescript
import { Observable } from 'rxjs';

const cold$ = new Observable(observer => {
  console.log('Observable started');
  observer.next(Math.random());
  observer.complete();
});

cold$.subscribe(value => console.log(`Subscriber 1: ${value}`));
cold$.subscribe(value => console.log(`Subscriber 2: ${value}`));
```

Each subscription re-executes the Observable, so the two subscribers log different random values.

**Hot Observables** produce values regardless of subscribers; all subscribers share one execution and receive the same values in real time, so late subscribers may miss earlier emissions. Examples: event streams, WebSocket connections, mouse movements.

```typescript
import { interval } from 'rxjs';
import { share } from 'rxjs/operators';

const hot$ = interval(1000).pipe(share());
setTimeout(() => {
  hot$.subscribe(value => console.log(`Subscriber 1: ${value}`));
}, 1000);
setTimeout(() => {
  hot$.subscribe(value => console.log(`Subscriber 2: ${value}`));
}, 3000);
```

Both subscribers share the same stream; Subscriber 2 misses values emitted before it subscribed.

**Key differences:**

| Cold Observable | Hot Observable |
|----|----|
| Starts emitting when a subscriber subscribes. | Emits regardless of subscribers. |
| Each subscriber gets its own independent execution. | All subscribers share the same execution. |
| Subscribers receive the full sequence from the start. | Subscribers may miss values if they subscribe late. |
| Example: HTTP requests, file reading, AJAX calls. | Example: UI events, WebSocket streams, intervals. |

**When to use cold:** when each subscriber should get a fresh sequence produced on demand (querying APIs, reading files, per-subscription operations).

**When to use hot:** when a stream should be shared among subscribers, or data is produced independently of them (real-time feeds, UI events, WebSockets, stock prices).

**Converting cold to hot** — use `share()` or `publish()` so all subscribers share one execution:

```typescript
import { interval } from 'rxjs';
import { share } from 'rxjs/operators';

const cold$ = interval(1000).pipe(share()); // now hot
```

In short, cold Observables re-execute per subscription (ideal for one-off sources like HTTP), while hot Observables share a single execution (ideal for real-time, shared streams).
