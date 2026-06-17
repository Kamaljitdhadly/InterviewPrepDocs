# Change Detection (Default vs OnPush) & Signals

## Concept Explanation

**Change detection (CD)** is how Angular keeps the DOM in sync with component data. Angular uses **Zone.js** to detect async events (clicks, HTTP, timers) and then runs CD, walking the component tree to check bindings and update the DOM.

Two strategies:
- **`Default`** — checks **every** component on each CD cycle. Simple but can be wasteful in large apps.
- **`OnPush`** — a component is checked only when: its `@Input()` **reference** changes, an event fires inside it, an observable bound via `async` pipe emits, or you manually mark it. This prunes large subtrees → big performance win.

**Signals** (Angular 16+) are a new reactivity primitive: a `signal()` holds a value; reading it tracks dependencies; updating it notifies consumers, enabling **fine-grained** change detection without Zone.js (zoneless).

## Code Example(s)

```typescript
// OnPush component — relies on immutable input changes
@Component({
  selector: 'app-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@for (item of items; track item.id) { <li>{{ item.name }}</li> }`,
})
export class ListComponent {
  @Input() items: Item[] = [];
}

// To update with OnPush, replace the reference (don't mutate in place):
this.items = [...this.items, newItem];   // ✅ new reference → CD runs
// this.items.push(newItem);             // ❌ same reference → OnPush won't update
```

```typescript
// Signals: fine-grained reactivity (Angular 16+)
import { signal, computed, effect } from '@angular/core';

count = signal(0);
double = computed(() => this.count() * 2);   // recomputes when count changes

increment() { this.count.update(c => c + 1); } // or this.count.set(5)

constructor() {
  effect(() => console.log('count is', this.count())); // runs on change
}
```

```html
<!-- Reading signals in a template (call them like functions) -->
<p>{{ count() }} → {{ double() }}</p>
```

## Interview Q&A

**🟢 What is change detection in Angular?**
The process by which Angular checks component data bindings and updates the DOM to reflect the latest state, triggered by async events via Zone.js.

**🟡 What's the difference between Default and OnPush change detection?**
Default checks every component on each cycle. OnPush checks a component only when its input *references* change, an event originates in it, an async-piped observable emits, or it's manually marked — improving performance by skipping unchanged subtrees.

**🟡 With OnPush, why didn't my view update after changing an array?**
OnPush detects input changes by reference. Mutating the array in place (`push`) keeps the same reference, so Angular skips it. Assign a new reference (`[...arr, x]`) or use immutable updates.

**🟡 What triggers change detection?**
Zone.js-patched async operations: DOM events, `setTimeout`/`setInterval`, HTTP/XHR, promises. You can also trigger manually via `ChangeDetectorRef.detectChanges()`/`markForCheck()`.

**🔴 What are Signals and how do they change CD?**
Signals are reactive values that track their readers. Updating a signal notifies exactly the computations/views that depend on it, enabling fine-grained, targeted updates and paving the way for zoneless Angular (no Zone.js full-tree checks).

## ⚠️ Tricky / Gotchas

- **OnPush + object mutation = stale view.** The #1 OnPush gotcha — always use immutable updates (new references) or call `markForCheck()`.
- **`detectChanges()` vs `markForCheck()`:** `detectChanges()` runs CD now for this component/subtree; `markForCheck()` marks the component (and ancestors) to be checked in the *next* cycle — the right tool with OnPush + observables.
- **`ExpressionChangedAfterItHasBeenCheckedError`** (dev only): a bound value changed after CD already checked it (often from `ngAfterViewInit`). Fix by setting values earlier or deferring with `Promise.resolve()`.
- **Heavy work in getters/template expressions** runs on every CD cycle — keep template expressions cheap; use `pure` pipes or signals/`computed`.
- **Read signals as functions** (`count()`), not as properties — forgetting the parentheses is a common mistake.

## 📌 Quick Recap

- CD syncs data → DOM; triggered by Zone.js-patched async events.
- Default checks everything; OnPush checks only on input-reference change, internal event, async-pipe emit, or manual mark.
- OnPush requires immutable updates (new references) — mutating in place won't update.
- `detectChanges()` (now) vs `markForCheck()` (next cycle).
- Signals = fine-grained reactivity (`signal`/`computed`/`effect`); read with `()`; enable zoneless CD.
- Keep template expressions cheap to avoid per-cycle cost.
