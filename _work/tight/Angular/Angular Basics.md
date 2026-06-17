# Angular Basics

## Questions Covered

1. What is Angular, and how does it differ from AngularJS?
2. What are Angular modules?
3. Explain the role of @NgModule and how it helps in structuring an application.
4. What are components in Angular?
5. How do components interact with each other?
6. What are Angular lifecycle hooks, and why are they important?
7. Can you name the most commonly used lifecycle hooks?
8. What is the difference between constructor and ngOnInit in Angular?
9. Explain the concept of data binding in Angular.
10. What are directives in Angular, and how are they categorized?
11. How does ngFor directive work?
12. Explain the ngIf directive.
13. How do you create a custom directive in Angular?
14. What are template reference variables in Angular?
15. What is content projection, and how does ng-content work?
16. What is the difference between ViewChild, ContentChild, and ViewChildren?
17. What is the purpose of the angular.json file in Angular projects?
18. How do you dynamically load components in Angular?
19. Explain ComponentFactoryResolver and ViewContainerRef.
20. What are ViewEncapsulation options in Angular, and how do they affect styling?

## What is Angular, and how does it differ from AngularJS?

Angular and AngularJS are both Google front-end frameworks, but they are fundamentally different in architecture and tooling.

**AngularJS (v1.x, 2010):**

- Written in **JavaScript**, based on the **MVC** architecture.
- Uses **two-way data binding** by default and **ng-directives** (e.g., `ng-model`, `ng-repeat`) to extend HTML.
- Not optimized for mobile; basic dependency injection; slower due to its digest-cycle change detection.

**Angular (v2+, 2016 — a complete rewrite):**

- Written in **TypeScript**, based on a **component-based** architecture.
- Defaults to **one-way data binding** (two-way still available via `ngModel`) and uses structural/attribute directives like `*ngIf` and `*ngFor`.
- Mobile-first, advanced DI, and faster thanks to **AOT compilation** and **lazy loading**. Modular by design for maintainability.

**Key differences:**

| Aspect               | AngularJS     | Angular                        |
|----------------------|---------------|--------------------------------|
| Language             | JavaScript    | TypeScript                     |
| Architecture         | MVC           | Component-Based                |
| Data Binding         | Two-way       | One-way (default)              |
| Mobile Support       | Not optimized | Optimized                      |
| Dependency Injection | Basic         | Advanced                       |
| Performance          | Slower        | Faster (AOT, lazy loading)     |
| Templating           | HTML-based    | TypeScript with HTML templates |
| Release              | 2010          | Angular 2 (2016+)              |

In short, Angular is a more modern, modular, and performant framework than AngularJS.

## What are Angular modules?

In Angular, **modules** group related components, services, directives, and pipes into cohesive blocks and manage dependencies between them. They are defined with the `@NgModule` decorator:

```typescript
@NgModule({
  declarations: [ /* Components, Directives, Pipes */ ],
  imports: [ /* Other Modules */ ],
  providers: [ /* Services */ ],
  bootstrap: [ /* Root Component (root module only) */ ]
})
export class AppModule { }
```

**Why modules matter:** they organize large apps into logical pieces, enable reuse, enforce separation of concerns, and manage which services and dependencies are available where.

**Common module types:**

- **Root module** — every app has one (conventionally `AppModule`); it bootstraps the application.
- **Feature modules** — encapsulate a specific feature (e.g., user management, admin) and are imported where needed.

```typescript
@NgModule({
  declarations: [UserComponent],
  imports: [CommonModule],
})
export class UserModule {}
```

- **Shared modules** — declare and `export` reusable components/directives/pipes to avoid redundancy.
- **Core module** — holds singleton services and app-wide essentials (e.g., `AuthService`, an `HttpInterceptor`).
- **Lazy-loaded modules** — loaded only when their route is visited, reducing initial load time.

**`imports[]` vs `exports[]`:** `imports[]` lists other modules this module depends on; `exports[]` lists the components/directives/pipes this module makes available to others.

```typescript
@NgModule({
  declarations: [SomeComponent],
  imports: [CommonModule],
  exports: [SomeComponent]
})
export class SomeModule {}
```

In summary, modules organize an app's building blocks, enable lazy loading, reduce redundancy, and improve scalability.

## Explain the role of @NgModule and how it helps in structuring an application.

The `@NgModule` decorator defines an Angular module by providing metadata that tells Angular how to compile it, which declarables belong to it, and how it integrates with other modules and services. It is central to **organizing** and **structuring** an application.

**Key metadata properties:**

- **`declarations[]`** — the components, directives, and pipes that belong to this module. Scoping declarables to a module keeps the app modular and maintainable.

```typescript
@NgModule({ declarations: [AppComponent, HeaderComponent, FooterComponent] })
export class AppModule {}
```

- **`imports[]`** — other modules whose exports this module needs (e.g., `CommonModule`, `FormsModule`, or custom modules). Enables splitting an app into feature modules and sharing common functionality.

```typescript
@NgModule({ imports: [BrowserModule, FormsModule, SharedModule] })
export class AppModule {}
```

- **`exports[]`** — declarables this module exposes to other modules, enabling reuse of common components/pipes.

```typescript
@NgModule({ declarations: [SharedComponent], exports: [SharedComponent] })
export class SharedModule {}
```

- **`providers[]`** — services registered for DI, either globally or scoped to a feature module.

```typescript
@NgModule({ providers: [AuthService] })
export class AuthModule {}
```

- **`bootstrap[]`** — the **root component** Angular renders at startup; used only in the root module.

```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

- **`entryComponents[]`** *(deprecated in Angular 9+)* — previously required for dynamically loaded components; the Ivy renderer made it unnecessary.

**How it structures an app:** `@NgModule` enables modular organization (feature modules), encapsulation and reusability (via `exports[]`), dependency management (via `imports[]`), lazy loading for performance, separation of concerns, and easier testing of isolated modules.

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, UserModule, AuthModule, SharedModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Here `UserModule` handles user features, `AuthModule` handles authentication, and `SharedModule` holds common UI used across the app.

## What are components in Angular?

**Components** are the fundamental building blocks of an Angular UI. Each controls a portion of the view and bundles a template (HTML), logic (TypeScript class), and styling (CSS) into one cohesive unit; the full UI is assembled from many components.

**Key parts:**

- **Template** — the HTML that defines the component's view (inline or in a separate file).

```html
<h1>{{ title }}</h1>
<button (click)="handleClick()">Click Me</button>
```

- **Class** — the logic: properties, methods, user interactions, and communication with services.
- **Styles** — component-scoped CSS/SCSS that won't interfere with other components.
- **Metadata** — the `@Component` decorator declaring the `selector`, template, and styles.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent {
  title = 'Hello, Angular!';
  handleClick() {
    alert('Button Clicked!');
  }
}
```

**Structure:** the **selector** is a custom HTML tag (e.g., `<app-example></app-example>`) used to place the component in another template; the **template** binds data via interpolation, property, and event binding; the **class** holds state and behavior; and **styles** stay encapsulated to the component.

**Core features:**

- **Lifecycle hooks** — e.g., `ngOnInit()` (initialization), `ngOnChanges()` (input changes), `ngOnDestroy()` (cleanup) let you run logic at key moments.
- **Data binding** — interpolation `{{ }}`, property binding `[property]`, and event binding `(event)`.
- **`@Input()` / `@Output()`** — pass data from parent to child and emit events from child to parent.

```typescript
@Component({
  selector: 'app-child',
  template: '<button (click)="notifyParent()">Click Me</button>',
})
export class ChildComponent {
  @Output() notify = new EventEmitter<string>();
  notifyParent() {
    this.notify.emit('Child button clicked!');
  }
}
```

- **Component hierarchy** — apps form a tree rooted at `AppComponent`, with data flowing through Input/Output bindings.
- **View encapsulation** — styles are scoped to the component by default (via emulated encapsulation or Shadow DOM).

In short, components combine template, class, and styles into reusable, hierarchically organized building blocks, configured through the `@Component` decorator.

## How do components interact with each other?

Angular components interact through several patterns, depending on their relationship.

**1. Parent-to-child (via `@Input()`):** the child declares an input the parent binds to.

```typescript
// child.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `<p>Message from parent: {{ message }}</p>`
})
export class ChildComponent {
  @Input() message: string = '';
}
```

```typescript
// parent.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `<app-child [message]="parentMessage"></app-child>`
})
export class ParentComponent {
  parentMessage: string = 'Hello from the parent!';
}
```

**2. Child-to-parent (via `@Output()` + `EventEmitter`):** the child emits an event the parent listens for.

```typescript
// child.component.ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-child',
  template: `<button (click)="sendMessage()">Click Me</button>`
})
export class ChildComponent {
  @Output() messageEvent = new EventEmitter<string>();
  sendMessage() {
    this.messageEvent.emit('Hello from the child!');
  }
}
```

```typescript
// parent.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <app-child (messageEvent)="receiveMessage($event)"></app-child>
    <p>{{ receivedMessage }}</p>
  `
})
export class ParentComponent {
  receivedMessage: string = '';
  receiveMessage(message: string) {
    this.receivedMessage = message;
  }
}
```

**3. Unrelated components (via a shared service):** a singleton service shares state through DI, typically with an RxJS subject.

```typescript
// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SharedService {
  private messageSource = new BehaviorSubject<string>('Initial Message');
  currentMessage = this.messageSource.asObservable();
  changeMessage(message: string) {
    this.messageSource.next(message);
  }
}
```

```typescript
// component-a.component.ts — updates the shared message
export class ComponentA {
  constructor(private sharedService: SharedService) {}
  newMessage() {
    this.sharedService.changeMessage('Message from Component A');
  }
}
```

```typescript
// component-b.component.ts — reacts to updates
export class ComponentB implements OnInit {
  message: string = '';
  constructor(private sharedService: SharedService) {}
  ngOnInit() {
    this.sharedService.currentMessage.subscribe(message => this.message = message);
  }
}
```

**4. Direct access (via `@ViewChild()`):** a parent can call a child's methods/properties directly.

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChildComponent } from './child.component';

@Component({
  selector: 'app-parent',
  template: `
    <app-child></app-child>
    <button (click)="callChildMethod()">Call Child Method</button>
  `
})
export class ParentComponent implements AfterViewInit {
  @ViewChild(ChildComponent) childComponent!: ChildComponent;
  ngAfterViewInit() {}
  callChildMethod() {
    this.childComponent.childMethod();
  }
}
```

**5. Content projection (via `<ng-content>`):** a parent passes HTML into a child's template.

```typescript
@Component({
  selector: 'app-child',
  template: `<p>Child Component:</p><ng-content></ng-content>`
})
export class ChildComponent {}
```

```html
<app-child>
  <p>This is projected content from the parent.</p>
</app-child>
```

Together these patterns — `@Input()`/`@Output()`, shared services, `@ViewChild()`, and content projection — let components collaborate to build complex, dynamic applications.

## What are Angular lifecycle hooks, and why are they important?

**Lifecycle hooks** are methods that let you tap into key phases of a component's life — from creation to destruction — so you can initialize data, respond to changes, interact with the rendered view, and clean up resources. They are essential for managing state, resources, and side effects efficiently.

**The hooks, in execution order:**

1. **`ngOnChanges(changes)`** — runs whenever a data-bound `@Input()` changes (before the first `ngOnInit()`). Use it to react to input updates.

```typescript
ngOnChanges(changes: SimpleChanges) { console.log('Input changed:', changes); }
```

2. **`ngOnInit()`** — runs once after inputs are initialized. Ideal for initialization like data fetching or form setup.

```typescript
ngOnInit() { console.log('Component initialized'); }
```

3. **`ngDoCheck()`** — runs on every change-detection cycle; for custom change detection Angular wouldn't catch automatically.
4. **`ngAfterContentInit()`** — runs once after projected content (`<ng-content>`) is initialized.
5. **`ngAfterContentChecked()`** — runs after every check of projected content.
6. **`ngAfterViewInit()`** — runs once after the component's view and child views are initialized; use it for DOM access (e.g., `@ViewChild`).
7. **`ngAfterViewChecked()`** — runs after every check of the view and child views.
8. **`ngOnDestroy()`** — runs just before the component is destroyed; use it to unsubscribe and release resources to avoid memory leaks.

```typescript
ngOnDestroy() { console.log('Component destroyed'); }
```

**Why they matter:** they let you manage initialization (`ngOnInit`), respond to input changes (`ngOnChanges`, `ngDoCheck`), handle projected content (`ngAfterContent*`), interact with the DOM after rendering (`ngAfterView*`), and clean up (`ngOnDestroy`).

**Example using several hooks:**

```typescript
import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

@Component({ selector: 'app-lifecycle-demo', template: `<p>{{ message }}</p>` })
export class LifecycleDemoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() message: string = '';
  constructor() { console.log('Constructor: instantiated'); }
  ngOnChanges(changes: SimpleChanges) { console.log('ngOnChanges', changes); }
  ngOnInit() { console.log('ngOnInit'); }
  ngOnDestroy() { console.log('ngOnDestroy'); }
}
```

The most commonly used are `ngOnInit()` and `ngOnDestroy()`. Leveraging hooks leads to more maintainable, efficient, and responsive applications.

## Can you name the most commonly used lifecycle hooks?

The most frequently used hooks are:

1. **`ngOnInit()`** — runs once after inputs are initialized; used for setup like data fetching.
2. **`ngOnChanges()`** — runs when data-bound `@Input()` properties change.
3. **`ngDoCheck()`** — runs on every change-detection cycle for manual change checks.
4. **`ngAfterViewInit()`** — runs once after the view and child views initialize; used for DOM/child access.
5. **`ngAfterViewChecked()`** — runs after every view check.
6. **`ngOnDestroy()`** — runs before destruction; critical for cleanup (e.g., unsubscribing).

These cover the key phases — initialization, updates, and cleanup — of a component's lifecycle.

## What is the difference between constructor and ngOnInit in Angular?

Both run during initialization but serve different purposes.

**Constructor** — a standard TypeScript class method called when the component is instantiated, *before* Angular sets up inputs or runs any hooks. Use it mainly for **dependency injection** and simple setup, not for logic that depends on inputs.

**`ngOnInit()`** — an Angular lifecycle hook (from the `OnInit` interface) called once *after* inputs are bound, after the constructor and before the view renders. Use it for initialization that needs inputs or services, such as fetching data or initializing forms.

```typescript
import { Component, OnInit } from '@angular/core';
import { MyService } from './my.service';

@Component({ selector: 'app-example', templateUrl: './example.component.html' })
export class ExampleComponent implements OnInit {
  constructor(private myService: MyService) {
    // dependency injection happens here
  }
  ngOnInit() {
    // initialization that relies on inputs/services
    this.myService.getData().subscribe(data => console.log('Data fetched:', data));
  }
}
```

In short: use the **constructor** for DI and basic setup, and **`ngOnInit()`** for initialization that depends on the component being fully set up.

## Explain the concept of data binding in Angular.

Data binding synchronizes the model (data) and the view (UI), so changes flow between them without manual DOM manipulation. Angular offers several binding types.

**1. Interpolation** (one-way, class → view) — displays component data as text. Syntax: `{{ expression }}`

```html
<p>{{ message }}</p>
```

**2. Property binding** (one-way, class → element property) — e.g., an image `src` or input `value`. Syntax: `[property]="expression"`

```html
<img [src]="imageUrl" alt="Angular Logo">
<input [value]="inputValue">
```

**3. Event binding** (one-way, view → class) — runs a method on a DOM event. Syntax: `(event)="method()"`

```html
<button (click)="handleClick()">Click Me</button>
```

**4. Two-way binding** — keeps view and class in sync, typically for form controls (requires `FormsModule`). Syntax: `[(ngModel)]="property"`

```html
<input [(ngModel)]="name">
<p>Hello, {{ name }}!</p>
```

**5. Attribute binding** — for non-standard HTML attributes. Syntax: `[attr.attributeName]="expression"`

```html
<div [attr.aria-label]="label">Content</div>
```

**6. Class binding** — toggles a CSS class. Syntax: `[class.className]="expression"`

```html
<div [class.active]="isActive">Content</div>
```

**7. Style binding** — sets a CSS style dynamically. Syntax: `[style.styleName]="expression"`

```html
<div [style.color]="color">Styled Text</div>
```

In summary, interpolation and property/attribute/class/style bindings push data into the view, event binding sends user actions back to the class, and two-way binding combines both — together creating dynamic, interactive UIs.

## What are directives in Angular, and how are they categorized?

**Directives** are markers on DOM elements that tell Angular to attach behavior, change appearance, or modify structure. They fall into three categories.

**1. Components** — technically directives *with a template*; the primary building blocks.

```typescript
@Component({
  selector: 'app-my-component',
  template: `<p>Hello, World!</p>`,
  styles: [`p { color: blue; }`]
})
export class MyComponent {}
```

**2. Structural directives** — change DOM layout by adding/removing elements (prefixed with `*`):

```html
<div *ngIf="isVisible">This is visible</div>

<ul>
  <li *ngFor="let item of items">{{ item }}</li>
</ul>

<div [ngSwitch]="value">
  <div *ngSwitchCase="'A'">A</div>
  <div *ngSwitchCase="'B'">B</div>
  <div *ngSwitchDefault>Default</div>
</div>
```

**3. Attribute directives** — change appearance/behavior without altering DOM structure:

```html
<div [ngClass]="{'active': isActive}">Styled Div</div>
<div [ngStyle]="{color: textColor}">Styled Text</div>
```

A custom attribute directive uses the `@Directive` decorator:

```typescript
@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  constructor(private el: ElementRef) {
    el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```

**Usage notes:** define directives with `@Directive` (or `@Component`); apply structural directives with the `*` prefix and attribute directives directly; you can combine multiple directives on one element; and custom directives let you encapsulate reusable behavior across the app.

## How does ngFor directive work?

`*ngFor` is a structural directive that iterates over a collection and renders a template for each item, dynamically generating DOM elements.

**Syntax:**

```html
<element *ngFor="let item of items">
  <!-- template content using {{ item }} -->
</element>
```

`item` is the current element and `items` is the iterable.

**Example:**

```typescript
@Component({ selector: 'app-name-list', templateUrl: './name-list.component.html' })
export class NameListComponent {
  names: string[] = ['Alice', 'Bob', 'Charlie', 'Diana'];
}
```

```html
<ul>
  <li *ngFor="let name of names">{{ name }}</li>
</ul>
```

**Advanced features:**

- **Index** — capture the loop index with `let i = index`.

```html
<li *ngFor="let name of names; let i = index">{{ i + 1 }}. {{ name }}</li>
```

- **Positional variables** — `first`, `last`, `even`, `odd`.

```html
<li *ngFor="let name of names; let i = index; let isFirst = first; let isLast = last">
  <span *ngIf="isFirst">First Item: </span>
  <span *ngIf="isLast">Last Item: </span>
  {{ name }} (Index: {{ i }})
</li>
```

- **`trackBy`** — improves performance on large/changing lists by letting Angular track items by a stable key instead of re-rendering everything.

```html
<li *ngFor="let name of names; trackBy: trackByFn">{{ name }}</li>
```

```typescript
trackByFn(index: number, item: string): number {
  return index; // or a unique id when items are objects
}
```

In short, `*ngFor` renders collections, exposes `index` and positional state variables, and supports `trackBy` for efficient updates.

## Explain the ngIf directive.

`*ngIf` is a structural directive that includes or excludes a DOM element based on a Boolean expression — effectively showing or hiding content (the element is actually added/removed from the DOM, not just hidden).

**Basic syntax:**

```html
<element *ngIf="condition">
  <!-- shown only when condition is true -->
</element>
```

**Example:** with `isVisible = true`, the paragraph renders; when false it is removed from the DOM.

```html
<p *ngIf="isVisible">This message is visible.</p>
```

**`*ngIf` with `else`** — render alternative content via a template reference:

```html
<ng-template #elseContent>
  <p>The condition is false.</p>
</ng-template>
<p *ngIf="isVisible; else elseContent">The condition is true.</p>
```

**`*ngIf` with `then` and `else`** — specify both branches as templates, useful for more complex content:

```html
<ng-template #thenTemplate>
  <p>The condition is true.</p>
</ng-template>
<ng-template #elseTemplate>
  <p>The condition is false.</p>
</ng-template>
<ng-container *ngIf="isVisible; then thenTemplate; else elseTemplate"></ng-container>
```

In short, `*ngIf` handles conditional rendering, with optional `else` and `then` clauses for alternative templates.

## How do you create a custom directive in Angular?

A custom directive encapsulates reusable behavior you can apply to elements across your app.

**1. Generate it** with the CLI (creates the directive and its spec file):

```bash
ng generate directive highlight
```

**2. Define it** with the `@Directive` decorator. This example highlights an element on hover:

```typescript
import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input('appHighlight') highlightColor: string = 'yellow';
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() { this.highlight(this.highlightColor); }
  @HostListener('mouseleave') onMouseLeave() { this.highlight(null); }

  private highlight(color: string | null) {
    this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
  }
}
```

Key pieces: `@Directive` (the selector used in templates), `ElementRef` (access to the host DOM element), `Renderer2` (platform-safe DOM changes), and `@HostListener` (listen to host events).

**3. Use it** in a template:

```html
<p [appHighlight]="'lightblue'">Hover over me to see the highlight effect!</p>
```

**4. Declare it** in a module so Angular recognizes it:

```typescript
@NgModule({
  declarations: [AppComponent, HighlightDirective],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

Custom directives provide a clean way to reuse DOM manipulation and behavior throughout an application.

## What are template reference variables in Angular?

Template reference variables let you reference an element, component, or directive directly within a template. They are declared with `#` followed by a name.

**Syntax:**

```html
<element #variableName></element>
```

**Access a DOM element** — read its properties (e.g., an input's value):

```html
<input #myInput type="text">
<button (click)="logValue(myInput.value)">Log Value</button>
```

**Access a component instance** — call its methods/properties:

```html
<app-my-component #myComponent></app-my-component>
<button (click)="myComponent.doSomething()">Call Component Method</button>
```

**Access a directive** — by assigning its exported name:

```html
<div *ngIf="isVisible" #myDiv="ngIf"></div>
<button (click)="logNgIfStatus(myDiv)">Log ngIf Status</button>
```

**Access form state** — commonly used with `ngForm`:

```html
<form #myForm="ngForm">
  <input name="name" ngModel>
  <button (click)="logForm(myForm)">Log Form</button>
</form>
```

In short, template reference variables (`#name`) give templates direct, readable access to elements, components, directives, and form controls.

## What is content projection, and how does ng-content work?

**Content projection** lets a parent insert HTML into a child component's template, so the child can render different content depending on where it's used — making it flexible and reusable. The `<ng-content>` element is the placeholder where projected content appears.

**1. Basic projection** — a single `<ng-content>` receives all projected content:

```html
<!-- child.component.html -->
<div class="content">
  <ng-content></ng-content>
</div>
```

```html
<!-- parent.component.html -->
<app-child>
  <p>This content is projected into the child component.</p>
</app-child>
```

**2. Named projection** — multiple `<ng-content>` elements with `select` route content to specific slots:

```html
<!-- child.component.html -->
<div class="header"><ng-content select="[header]"></ng-content></div>
<div class="body"><ng-content select="[body]"></ng-content></div>
```

```html
<!-- parent.component.html -->
<app-child>
  <h1 header>Header Content</h1>
  <p body>Body Content</p>
</app-child>
```

**3. Fallback content** — provide default content when nothing is projected.

In short, `<ng-content>` enables a single placeholder (basic), multiple targeted slots via `select` (named), and optional fallback content — key tools for building adaptable, reusable components.

## What is the difference between ViewChild, ContentChild, and ViewChildren?

These decorators query elements/components, differing in *what* they target (the component's own view vs. projected content) and *how many* they return.

**`@ViewChild`** — a reference to a *single* element/component in the component's **own view**.

```typescript
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({ selector: 'app-example', template: `<input #myInput>` })
export class ExampleComponent implements AfterViewInit {
  @ViewChild('myInput') inputElement!: ElementRef;
  ngAfterViewInit() { this.inputElement.nativeElement.focus(); }
}
```

It also works with child components:

```typescript
@ViewChild(ChildComponent) child!: ChildComponent;
ngAfterViewInit() { this.child.someMethod(); }
```

**`@ContentChild`** — a reference to a *single* element/component **projected** into the component via `<ng-content>` (available in `ngAfterContentInit`).

```typescript
import { Component, ContentChild, ElementRef, AfterContentInit } from '@angular/core';

@Component({ selector: 'app-parent', template: `<ng-content></ng-content>` })
export class ParentComponent implements AfterContentInit {
  @ContentChild('projectedContent') content!: ElementRef;
  ngAfterContentInit() { console.log(this.content.nativeElement.textContent); }
}
```

```html
<app-parent>
  <p #projectedContent>Content to project</p>
</app-parent>
```

**`@ViewChildren`** — a `QueryList` of *multiple* elements/components in the component's own view.

```typescript
import { Component, ViewChildren, QueryList, AfterViewInit, ElementRef } from '@angular/core';

@Component({ selector: 'app-example', template: `<input #input1><input #input2>` })
export class ExampleComponent implements AfterViewInit {
  @ViewChildren('input1, input2') inputs!: QueryList<ElementRef>;
  ngAfterViewInit() { this.inputs.forEach(i => console.log(i.nativeElement.value)); }
}
```

**Summary:**

- **`@ViewChild`** — single item from the component's own view.
- **`@ContentChild`** — single item projected in via `<ng-content>`.
- **`@ViewChildren`** — multiple items from the view, returned as an iterable `QueryList`.

(There is also `@ContentChildren` for *multiple* projected items.)

## What is the purpose of the angular.json file in Angular projects?

`angular.json` is the workspace configuration file used by the Angular CLI to control how applications and libraries are built, served, and tested. It is generated automatically when you create a project and centralizes settings for one or more projects in the workspace.

**Key sections:**

- **`projects`** — configuration for each app/library in the workspace.

```json
"projects": {
  "my-app": { "projectType": "application" },
  "my-lib": { "projectType": "library" }
}
```

- **`architect`** — defines build targets (`build`, `serve`, `test`, etc.) and their builders/options.

```json
"architect": {
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": { "outputPath": "dist/my-app", "index": "src/index.html", "main": "src/main.ts" }
  },
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": { "browserTarget": "my-app:build" }
  }
}
```

- **`build`** — output path, assets, styles, scripts, file replacements, and optimization.

```json
"build": {
  "options": {
    "outputPath": "dist/my-app",
    "assets": ["src/favicon.ico", "src/assets"],
    "styles": ["src/styles.css"],
    "scripts": []
  }
}
```

- **`serve`** — dev-server settings (port, auto-open, proxy config).

```json
"serve": { "options": { "port": 4200, "open": true, "proxyConfig": "src/proxy.conf.json" } }
```

- **`test`** — test runner and coverage config; **`lint`** — lint config; **`defaultProject`** — the project used when no name is given.

In short, `angular.json` is the central CLI configuration that defines build/serve/test/lint behavior across the projects in a workspace.

## How do you dynamically load components in Angular?

Dynamic loading creates components at runtime (rather than compile time), useful when the component depends on user interaction or runtime conditions.

**1. Using `ComponentFactoryResolver`** (classic approach)

First, a directive marks the insertion point and exposes its `ViewContainerRef`:

```typescript
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appDynamicHost]' })
export class DynamicHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
```

Define the component to load:

```typescript
@Component({ selector: 'app-dynamic', template: `<p>Dynamic Component Loaded!</p>` })
export class DynamicComponent {}
```

Then resolve a factory and insert the component into the container:

```typescript
import { Component, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { DynamicHostDirective } from './dynamic-host.directive';
import { DynamicComponent } from './dynamic.component';

@Component({
  selector: 'app-host',
  template: `
    <ng-template appDynamicHost></ng-template>
    <button (click)="loadComponent()">Load Component</button>
  `
})
export class HostComponent {
  @ViewChild(DynamicHostDirective, { static: true }) dynamicHost!: DynamicHostDirective;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  loadComponent() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicComponent);
    const viewContainerRef = this.dynamicHost.viewContainerRef;
    viewContainerRef.clear();
    viewContainerRef.createComponent(factory);
  }
}
```

*(In Angular 13+, `ViewContainerRef.createComponent(DynamicComponent)` can be used directly, without `ComponentFactoryResolver`.)*

**2. Using Angular Elements** — package a component as a custom element (web component) usable in any HTML page or framework.

```typescript
@Component({ selector: 'app-angular-element', template: `<p>{{ message }}</p>` })
export class AngularElementComponent {
  @Input() message!: string;
}
```

Register it as a custom element:

```typescript
import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AppComponent } from './app.component';
import { AngularElementComponent } from './angular-element.component';

@NgModule({
  declarations: [AppComponent, AngularElementComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {
    const el = createCustomElement(AngularElementComponent, { injector });
    customElements.define('app-angular-element', el);
  }
  ngDoBootstrap() {}
}
```

```html
<app-angular-element message="Hello from Angular Element!"></app-angular-element>
```

In short: use **`ComponentFactoryResolver`** / `ViewContainerRef` to load components inside an Angular app, and **Angular Elements** to expose components as reusable web components outside Angular.

## Explain ComponentFactoryResolver and ViewContainerRef.

These two services work together to create and insert components at runtime.

**`ComponentFactoryResolver`** provides a factory for a component class via `resolveComponentFactory(...)`; the factory then creates component instances. *(It is deprecated as of Angular 13, where `ViewContainerRef.createComponent` accepts the component type directly.)*

```typescript
@Component({ selector: 'app-dynamic', template: `<p>Dynamic Component Loaded!</p>` })
export class DynamicComponent {}
```

```typescript
import { Component, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { DynamicHostDirective } from './dynamic-host.directive';
import { DynamicComponent } from './dynamic.component';

@Component({
  selector: 'app-host',
  template: `
    <ng-template appDynamicHost></ng-template>
    <button (click)="loadComponent()">Load Component</button>
  `
})
export class HostComponent {
  @ViewChild(DynamicHostDirective, { static: true }) dynamicHost!: DynamicHostDirective;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  loadComponent() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(DynamicComponent);
    const viewContainerRef = this.dynamicHost.viewContainerRef;
    viewContainerRef.clear();
    viewContainerRef.createComponent(factory);
  }
}
```

**`ViewContainerRef`** represents the container where views/components are inserted. Its key methods are `createComponent` (create and insert), `clear` (remove all views), and `insert` (add a view at an index). It is typically injected into a host directive that marks the insertion point:

```typescript
import { Directive, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appDynamicHost]' })
export class DynamicHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
```

**Summary:** `ComponentFactoryResolver` obtains a factory for a component, and `ViewContainerRef` is the container into which the resulting component is inserted, cleared, or repositioned — together enabling flexible runtime component management.

## What are ViewEncapsulation options in Angular, and how do they affect styling?

**ViewEncapsulation** controls how a component's styles are scoped — whether they stay local to the component or affect others. Angular provides three modes.

**1. `Emulated` (default)** — Angular emulates Shadow DOM by adding unique attribute selectors to a component's elements and styles, so the styles apply only to that component and don't leak out.

```css
:host { display: block; background-color: lightblue; }
```

```typescript
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-example',
  template: `<p>Emulated View Encapsulation Example</p>`,
  styleUrls: ['./component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class ExampleComponent {}
```

**2. `ShadowDom`** — uses the browser's native Shadow DOM, attaching styles to the component's shadow root for true encapsulation (no styles bleed in or out). Requires browser support for Shadow DOM.

```typescript
@Component({
  selector: 'app-example',
  template: `<p>Shadow DOM Example</p>`,
  styleUrls: ['./component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ExampleComponent {}
```

**3. `None`** — no encapsulation; the component's styles are added to the global stylesheet and can affect (or be affected by) the whole application.

```typescript
@Component({
  selector: 'app-example',
  template: `<p>None Example</p>`,
  styleUrls: ['./component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ExampleComponent {}
```

**Summary:** `Emulated` (default) scopes styles via generated attributes; `ShadowDom` provides native, true isolation; and `None` makes styles global. Choose based on how much style isolation a component needs.

---

## Related Topics

- **Angular Modern Features** (`Angular/`)
- **Angular Routing** (`Angular/`)
- **TypeScript Basics** (`TypeScript/`)
