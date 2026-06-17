# RxJS Throttling and Debouncing

## Questions Covered

1. What is the difference between throttleTime and debounceTime in RxJS?
2. When would you use throttleTime vs debounceTime?

## What is the difference between throttleTime and debounceTime in RxJS?

Both `throttleTime` and `debounceTime` control the rate of emissions from an Observable, but in opposite ways.

**`throttleTime`** limits the rate by allowing only one emission per time window: it **emits the first** value, then ignores subsequent values for the throttle duration. This spaces emissions out at a fixed interval, regardless of how often the source fires.

```typescript
import { interval } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

const source$ = interval(100);                     // emits every 100ms
const throttled$ = source$.pipe(throttleTime(500)); // one value per 500ms
throttled$.subscribe(value => console.log('Throttled value:', value));
```

**Output:** `0`, `5`, `10`, ... — one value every 500ms even though the source emits every 100ms.

**`debounceTime`** delays emission until the source has been **quiet** for the specified duration, then **emits the last** value. Any new value within the window resets the timer.

```typescript
import { interval } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const source$ = interval(100);                       // emits every 100ms
const debounced$ = source$.pipe(debounceTime(500));  // last value after 500ms of silence
debounced$.subscribe(value => console.log('Debounced value:', value));
```

**Output:** with a continuously emitting source, the timer keeps resetting so values are emitted only after a pause.

**Key differences:**

- **Emission timing** — `throttleTime` emits the first value then ignores the rest of the window (fixed intervals); `debounceTime` emits the last value after a period of inactivity.
- **Use case** — `throttleTime` for limiting frequency at a regular rate (e.g., capping API calls); `debounceTime` for acting on the final value after a burst (e.g., search after typing stops).
- **Behavior** — `throttleTime` guarantees a steady emission rate; `debounceTime` only emits once the stream goes quiet, and only the last value.

## When would you use throttleTime vs debounceTime?

The choice depends on whether you want to **cap frequency** or **react to the final value after a pause**.

**Use `throttleTime`** when you need actions at a regular, controlled rate:

- **Rate limiting** — throttle high-frequency events like scroll, resize, or mouse movement so you don't overload the server/system.
- **Performance optimization** — run expensive operations (UI updates, calculations) at a fixed interval rather than on every interaction.
- **Event handling** — process clicks or key presses at a predictable, controlled pace.

```typescript
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

const mouseMove$ = fromEvent(document, 'mousemove').pipe(
  throttleTime(500) // process at most once every 500ms
);
mouseMove$.subscribe(event => console.log('Throttled MouseMove:', event));
```

**Use `debounceTime`** when you only care about the final value after activity subsides:

- **Search input** — fire a search only after the user stops typing, reducing requests and improving UX.
- **Form validation** — validate or show messages after typing pauses instead of on every keystroke.
- **API requests** — send a request only once input has settled, avoiding redundant calls.

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

const input$ = fromEvent(document.querySelector('input'), 'input').pipe(
  debounceTime(500),
  map(event => (event.target as HTMLInputElement).value)
);
input$.subscribe(value => console.log('Debounced Input Value:', value));
```

In short: **`throttleTime`** ensures emissions occur at a fixed rate (rate limiting, performance, frequent events), while **`debounceTime`** waits for a pause and emits the final value (search, validation, avoiding redundant work).
