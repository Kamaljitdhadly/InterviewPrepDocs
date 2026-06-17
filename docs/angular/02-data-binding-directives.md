# Data Binding & Directives

## Concept Explanation

**Data binding** connects the component class and the template. Four kinds:

| Binding | Syntax | Direction |
|---|---|---|
| Interpolation | `{{ value }}` | class → view |
| Property | `[prop]="value"` | class → view |
| Event | `(click)="handler()"` | view → class |
| Two-way | `[(ngModel)]="value"` | both |

**Directives** add behavior to the DOM:
- **Components** — directives with a template (a special case).
- **Structural directives** — change DOM layout by adding/removing elements: `*ngIf`, `*ngFor`, `*ngSwitch` (prefixed with `*`). Modern Angular also has built-in control flow `@if`, `@for`, `@switch`.
- **Attribute directives** — change appearance/behavior of an element: `ngClass`, `ngStyle`, or custom directives.

## Code Example(s)

```html
<!-- Interpolation + property + event + two-way -->
<h1>{{ title }}</h1>
<img [src]="imageUrl" [alt]="title" />
<button (click)="onSave()">Save</button>
<input [(ngModel)]="name" />              <!-- requires FormsModule -->
<p>Hello {{ name }}</p>
```

```html
<!-- Structural directives -->
<p *ngIf="isLoggedIn; else guest">Welcome back!</p>
<ng-template #guest><p>Please log in</p></ng-template>

<li *ngFor="let item of items; let i = index; trackBy: trackById">
  {{ i }}: {{ item.name }}
</li>

<!-- Modern built-in control flow (Angular 17+) -->
@if (isLoggedIn) { <p>Welcome</p> } @else { <p>Log in</p> }
@for (item of items; track item.id) { <li>{{ item.name }}</li> }
```

```typescript
// Custom attribute directive
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input() appHighlight = 'yellow';
  constructor(private el: ElementRef) {}
  @HostListener('mouseenter') onEnter() {
    this.el.nativeElement.style.backgroundColor = this.appHighlight;
  }
}
```

## Interview Q&A

**🟢 What are the types of data binding in Angular?**
Interpolation (`{{}}`), property binding (`[]`), event binding (`()`), and two-way binding (`[()]`, the "banana in a box").

**🟢 What's the difference between structural and attribute directives?**
Structural directives change the DOM structure by adding/removing elements (`*ngIf`, `*ngFor`). Attribute directives change the look or behavior of an existing element (`ngClass`, `ngStyle`, custom).

**🟡 How does two-way binding actually work?**
`[(ngModel)]` is syntactic sugar combining property binding `[ngModel]` and event binding `(ngModelChange)`. Any `[(x)]` works if the component exposes an `@Input() x` and an `@Output() xChange`.

**🟡 What is `trackBy` in `*ngFor` and why use it?**
A function that tells Angular how to identify items, so when the list changes it re-uses existing DOM nodes for unchanged items instead of re-rendering everything — a major performance optimization for large/changing lists.

**🔴 Why can't you use two structural directives on one element?**
Each structural directive needs its own `<ng-template>`; Angular doesn't allow two on one element (e.g. `*ngIf` and `*ngFor` together). Use a wrapper `<ng-container>`, or the new `@if`/`@for` control flow.

## ⚠️ Tricky / Gotchas

- **`*ngIf` removes the element from the DOM**, whereas hiding with `[hidden]`/CSS keeps it (and its component state/subscriptions). Big difference in behavior and performance.
- **Two structural directives on one element won't compile** — use `<ng-container>`:

```html
<ng-container *ngIf="show">
  <li *ngFor="let x of items">{{ x }}</li>
</ng-container>
```

- **Forgetting `FormsModule`** makes `[(ngModel)]` silently fail / throw.
- **`*ngFor` without `trackBy`** re-creates DOM nodes on every change when object references change — slow and loses focus/state.
- **Property binding vs attribute:** `[disabled]="false"` correctly removes the attribute, but `disabled="false"` (string attribute) still disables the element — a classic confusion.

## 📌 Quick Recap

- Bindings: `{{}}` (interpolate), `[]` (property), `()` (event), `[()]` (two-way).
- `[(ngModel)]` = `[ngModel]` + `(ngModelChange)`; needs `FormsModule`.
- Structural (`*ngIf`/`*ngFor`/`@if`/`@for`) change DOM; attribute (`ngClass`/`ngStyle`) change element.
- Use `trackBy` (or `track`) with lists for performance.
- One structural directive per element — use `<ng-container>`.
- `*ngIf` removes from DOM; `[hidden]` just hides.
