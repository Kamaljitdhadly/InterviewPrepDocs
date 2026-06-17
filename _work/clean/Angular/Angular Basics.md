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
10. What are the types of data binding?
11. What are directives in Angular, and how are they categorized?
12. How does ngFor directive work?
13. Explain the ngIf directive.
14. How do you create a custom directive in Angular?
15. What are template reference variables in Angular?
16. Explain the role of ng-content and content projection.
17. What is content projection, and how does ng-content work?
18. What is the difference between ViewChild and ContentChild and ViewChildren?
19. How do you communicate between parent and child components?
20. How do you use the EventEmitter class for component interaction?
21. What is the purpose of the angular.json file in Angular projects?
22. How do you dynamically load components in Angular?
23. Explain ComponentFactoryResolver and ViewContainerRef.
24. What are ViewEncapsulation options in Angular, and how do they affect styling?

## What is Angular, and how does it differ from AngularJS?

Angular and AngularJS are both front-end frameworks developed by Google, but they are fundamentally different in terms of architecture, features, and usage. Here's a breakdown of the two:

### 1. AngularJS

- **Version**: AngularJS refers to versions 1.x (released in 2010).

- **Language**: Written in **JavaScript**.

- **Architecture**: Based on the **Model-View-Controller (MVC)** architecture.

- **Two-Way Data Binding**: AngularJS provides **two-way data binding**, meaning changes in the UI reflect in the model and vice versa.

- **Directives**: It uses **ng-directives** for extending HTML functionality (e.g., ng-model, ng-repeat).

- **Templating**: Templates in AngularJS are based on HTML and embedded with custom attributes and directives.

- **Mobile Support**: AngularJS was not optimized for mobile devices.

- **Dependency Injection (DI)**: Supports DI, but the mechanism is less sophisticated compared to Angular.

- **Performance**: Slower compared to Angular due to its dynamic nature and digest cycles.

### 2. Angular

- **Version**: Refers to versions **2 and later** (Angular 2+). This is a complete rewrite of AngularJS.

- **Language**: Written in **TypeScript** (a superset of JavaScript).

- **Architecture**: Uses a **Component-Based** architecture. Everything in Angular is a component, making it easier to manage the UI and code structure.

- **One-Way Data Binding**: Angular primarily uses **one-way data binding** for better performance, though two-way data binding is still possible using ngModel.

- **Directives**: The concept of directives still exists but is used differently (structural and attribute directives like `*ngIf`, `*ngFor`).

- **Templating**: Angular uses **TypeScript** with HTML-based templates, which are easier to write and more powerful with advanced features like **async pipes**.

- **Mobile Support**: Angular is optimized for mobile-first development.

- **Dependency Injection**: DI is more advanced and easier to manage, allowing services to be injected across the application.

- **Performance**: Angular is faster than AngularJS, using techniques like **AOT (Ahead-of-Time) compilation** and **lazy loading** for better performance.

- **Modularity**: Angular is modular, allowing developers to organize code in feature modules, making the application more maintainable.

### Key Differences

| **Aspect**               | **AngularJS** | **Angular**                    |
|--------------------------|---------------|--------------------------------|
| **Language**             | JavaScript    | TypeScript                     |
| **Architecture**         | MVC           | Component-Based                |
| **Data Binding**         | Two-way       | One-way (default)              |
| **Mobile Support**       | Not optimized | Optimized                      |
| **Dependency Injection** | Basic         | Advanced                       |
| **Performance**          | Slower        | Faster (AOT, Lazy Loading)     |
| **Templating**           | Based on HTML | TypeScript with HTML templates |
| **Release**              | 2010          | Angular 2 (2016+)              |

In summary, **Angular** is a more modern, modular, and efficient framework than **AngularJS**, with a strong focus on performance and scalability.

## What are Angular modules?

In Angular, **modules** are a way to organize and group related parts of an application, such as components, services, directives, pipes, and other modules. Modules help structure the app into cohesive blocks and provide a way to manage dependencies between different parts of the app.

### Key Points about Angular Modules

1.  **NgModule Decorator**: Angular modules are defined using the @NgModule decorator. This decorator takes metadata to describe how the module should behave and which parts it manages.

```typescript
@NgModule({
declarations: [ /* Components, Directives, Pipes */ ],
imports: [ /* Other Modules */ ],
providers: [ /* Services */ ],
bootstrap: [ /* Root Component (for root module) */ ]
})
export class AppModule { }
```

2.  **Purpose of Modules**:

    - **Organization**: Breaks the app into logical pieces, making it easier to manage large applications.

    - **Reusability**: Modules allow related code (like a group of components and services) to be reused across different parts of the app or even in different apps.

    - **Separation of Concerns**: Modules help maintain a clear separation of functionality. For example, you can have a module for user management, authentication, or shared utilities.

    - **Dependency Management**: Helps in managing services and dependencies within the module. It controls which services are available globally or within a particular module.

3.  **Root Module**: Every Angular application has at least one module called the **root module**. It bootstraps the application, and by convention, it is typically named AppModule.

```typescript
@NgModule({
declarations: [AppComponent],
imports: [BrowserModule],
bootstrap: [AppComponent]
})
export class AppModule {}
```

4.  **Feature Modules**: In addition to the root module, an Angular app can have multiple **feature modules**, each encapsulating a specific feature or functionality. For example, a user management module or an admin module. Feature modules are imported into the root module or other feature modules as needed.

```typescript
@NgModule({
declarations: [UserComponent],
imports: [CommonModule],
})
export class UserModule {}
```

5.  **Shared Modules**: A **shared module** is used to declare and export components, directives, and pipes that will be used across multiple modules. It helps avoid redundancy by centralizing reusable pieces.

```typescript
@NgModule({
declarations: [SharedComponent],
exports: [SharedComponent]
})
export class SharedModule {}
```

6.  **Core Module**: A **core module** typically includes services and singleton components that should only be instantiated once and used across the entire application, like an AuthService or HttpInterceptor.

7.  **Lazy-Loading Modules**: Angular allows feature modules to be **lazy-loaded** to optimize performance. Lazy-loaded modules are only loaded when the user navigates to a particular route that requires them, reducing the initial load time.

8.  **Imports and Exports**:

    - **imports[]**: Specifies other modules that the current module depends on. These could be Angular built-in modules or other feature/shared modules.

    - **exports[]**: Specifies components, directives, or pipes that the module wants to make available to other modules.

```typescript
@NgModule({
declarations: [SomeComponent],
imports: [CommonModule],
exports: [SomeComponent]
})
export class SomeModule {}
```

### Example of an Angular Module Structure

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
@NgModule({
declarations: [UserComponent], // Declare components, directives, and pipes
imports: [CommonModule], // Import other Angular or custom modules
exports: [UserComponent], // Export components so other modules can use them
})
export class UserModule {}
```

### Summary

- **Angular Modules** are a way to organize and manage the different building blocks of an application (components, services, directives, etc.).

- The **root module** is required to bootstrap the application.

- **Feature modules** encapsulate functionality.

- **Shared modules** contain reusable parts that can be used across multiple modules.

- **Core modules** contain singleton services and other essentials used globally.

- Modules enable lazy-loading and help reduce code redundancy and improve application scalability.

## Explain the role of @NgModule and how it helps in structuring an application.

The @NgModule decorator is a key feature in Angular that defines an **Angular module**. It provides metadata to tell Angular how to compile the module, which components, directives, or pipes belong to the module, and how other modules and services should be integrated. It plays a central role in **organizing** and **structuring** an Angular application by grouping related components and services.

### Key Parts of @NgModule and How They Help Structure an Application:

#### 1. **declarations[]**:

- **Purpose**: Lists all the components, directives, and pipes that belong to this module.

- **How It Helps**: Declaring components and directives helps Angular know what parts of the application belong to this module. It enforces modularity by ensuring that components are scoped to their respective modules, making the application easier to maintain and scale.

- **Example**:

```typescript
@NgModule({
declarations: [AppComponent, HeaderComponent, FooterComponent]
})
export class AppModule {}
```

#### 2. **imports[]**:

- **Purpose**: Lists other modules whose exported classes are needed by components in this module.

- **How It Helps**: Angular modules can import other modules (like Angular’s built-in CommonModule, FormsModule, or custom modules). This makes it possible to split large applications into smaller feature modules and share common functionalities across different modules without duplicating code.

- **Example**:

```typescript
@NgModule({
imports: [BrowserModule, FormsModule, SharedModule]
})
export class AppModule {}
```

#### 3. **exports[]**:

- **Purpose**: Exports components, directives, or pipes so that they can be used in other modules.

- **How It Helps**: By exporting specific components or pipes, Angular allows them to be shared across modules. This makes it easier to reuse commonly used components or directives (e.g., a button component or a custom pipe) throughout the application.

- **Example**:

```typescript
@NgModule({
declarations: [SharedComponent],
exports: [SharedComponent] // Makes SharedComponent available to other modules
})
export class SharedModule {}
```

#### 4. **providers[]**:

- **Purpose**: Registers services that will be available to the whole application or this specific module.

- **How It Helps**: Services listed in providers[] are instantiated and made available through **Dependency Injection (DI)**. This allows modules to register services either globally or locally. If registered in a feature module, the service will be scoped to that module only.

- **Example**:

```typescript
@NgModule({
providers: [AuthService]
})
export class AuthModule {}
```

#### 5. **bootstrap[]**:

- **Purpose**: Specifies the **root component** that Angular should bootstrap when it starts the application.

- **How It Helps**: This is only used in the **root module** (usually AppModule) to define the entry point of the application. Angular starts by rendering the root component and recursively renders the child components.

- **Example**:

```typescript
@NgModule({
declarations: [AppComponent],
imports: [BrowserModule],
bootstrap: [AppComponent]
})
export class AppModule {}
```

#### 6. **entryComponents[]** (Deprecated in Angular 9+):

- **Purpose**: Lists components that should be compiled even though they are not referenced in any template (e.g., dynamically loaded components).

- **How It Helps**: Before Angular 9 (when Ivy became the default rendering engine), entryComponents[] was required for components loaded dynamically. Ivy now eliminates the need for this.

### Role of @NgModule in Structuring an Angular Application:

1.  **Modular Organization**:

    - Angular modules allow you to break down an application into smaller, more manageable parts (feature modules), each responsible for a distinct feature or functionality. This creates a cleaner, more maintainable structure.

    - For example, an application can have separate modules for authentication, user management, admin functionalities, etc., each containing its own components and services.

2.  **Encapsulation and Reusability**:

    - Each module encapsulates its components, pipes, and services, preventing conflicts with other parts of the application.

    - By using the exports[] array, you can make components reusable across modules, improving code reuse and reducing duplication.

3.  **Dependency Management**:

    - The imports[] array allows a module to declare its dependencies on other modules. This helps in managing external dependencies and avoiding the duplication of code, improving maintainability.

    - For example, a SharedModule can provide commonly used components or directives like buttons, modals, and forms across the application.

4.  **Lazy Loading and Performance**:

    - Angular modules can be lazy-loaded, meaning they are only loaded when needed. This reduces the initial load time and enhances application performance.

    - For example, if an admin dashboard is rarely accessed, it can be placed in a separate module and loaded only when a user navigates to that route.

5.  **Separation of Concerns**:

    - Each module is responsible for a specific concern (e.g., UserModule for user-related components, AuthModule for authentication). This separation helps in better code management and debugging.

    - Shared functionality, such as commonly used pipes or services, can be placed in shared or core modules, promoting the DRY (Don't Repeat Yourself) principle.

6.  **Testability**:

    - With modules, testing becomes more straightforward. You can isolate modules and test them independently without affecting the entire application.

    - Since services can be provided at the module level, you can mock dependencies and services when testing specific modules.

### Example of Structuring an Angular Application with @NgModule:

// app.module.ts

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
@NgModule({
declarations: [AppComponent],
imports: [BrowserModule, UserModule, AuthModule, SharedModule], // Feature and shared modules
bootstrap: [AppComponent]
})
export class AppModule {}
```

In this structure:

- The UserModule handles user-related features.

- The AuthModule manages authentication.

- The SharedModule contains common components like buttons, forms, and utilities that are used across the app.

### Conclusion:

@NgModule plays a central role in structuring Angular applications by organizing the application into cohesive blocks (modules). It enables modularization, encapsulation, dependency management, lazy loading, and reusability, making applications more maintainable, scalable, and efficient.

## What are components in Angular?

In Angular, **components** are the fundamental building blocks of the user interface (UI). They are responsible for controlling a portion of the view in an Angular application and encapsulate the template (HTML), logic (TypeScript), and styling (CSS) into a cohesive unit. A component essentially defines a small part of the application's UI, and the entire UI is built by assembling multiple components together.

### Key Parts of an Angular Component

1.  **Template**:

    - The **HTML** that defines the UI for that particular component. It tells Angular how the component should be rendered.

    - It can be defined inline or in a separate HTML file.

```typescript
Example:
<h1>{{ title }}</h1>
<button (click)="handleClick()">Click Me</button>
```

2.  **TypeScript Class (Component Class)**:

    - This is the **logic** behind the component. The class contains data (properties) and methods (functions) that define the behavior of the component.

    - It handles user interactions, data processing, and communicates with services for business logic.

```typescript
Example:
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

3.  **Styles**:

    - Components can have their own **CSS** or **SCSS** styles that are scoped to that component, ensuring that they don't interfere with styles from other components.

    - Styles can be defined inline in the component file or in separate CSS/SCSS files.

```typescript
Example:
h1 {
color: blue;
}
```

4.  **Metadata** (@Component decorator):

    - The @Component decorator is used to define the **metadata** for the component, such as its selector (used to embed it in HTML), the template, and style files.

```typescript
Example:
@Component({
selector: 'app-example', // Defines how to use the component in HTML
templateUrl: './example.component.html', // HTML for the component
styleUrls: ['./example.component.css'] // CSS for the component
})
```

### Structure of a Component

An Angular component is made up of the following parts:

1.  **Selector**:

    - A **custom HTML tag** used to insert the component into the DOM. This tag is defined in the @Component metadata.

    - For example, if the selector is app-example, you can use <app-example></app-example> in another component’s template to render this component.

```typescript
@Component({
selector: 'app-example', // This is how the component is referenced
})
```

2.  **Template**:

    - The **HTML** that defines the layout and structure of the component.

    - You can bind data to the template using Angular's **data binding** features (e.g., {{ title }}, [property], (event)).

3.  **Component Class**:

    - A **TypeScript class** that defines the properties and methods of the component.

    - It contains the business logic, handles user interactions, and communicates with services.

4.  **Styles**:

    - The **CSS** that applies only to this component, helping to keep the styles encapsulated.

### Example of a Complete Angular Component

```typescript
import { Component } from '@angular/core';
@Component({
selector: 'app-example', // The component's HTML tag
templateUrl: './example.component.html', // External HTML file for the template
styleUrls: ['./example.component.css'] // External CSS file for styles
})
export class ExampleComponent {
title = 'Hello, Angular!';
handleClick() {
console.log('Button clicked!');
}
}
```

<!-- example.component.html -->

```typescript
<h1>{{ title }}</h1>
<button (click)="handleClick()">Click Me</button>
```

/* example.component.css */

```typescript
h1 {
color: green;
}
```

### Core Features of Angular Components

1.  **Component Lifecycle Hooks**: Angular components have lifecycle methods that allow developers to hook into key moments during a component’s existence, such as:

    - ngOnInit(): Called once the component is initialized.

    - ngOnDestroy(): Called just before the component is destroyed.

    - ngOnChanges(): Called when data-bound properties change.

```typescript
These hooks allow developers to run custom logic at different stages of the component's lifecycle.
```

2.  **Data Binding**: Angular provides different forms of **data binding** in components:

    - **Interpolation**: {{ title }} is used to bind a property in the TypeScript class to the HTML.

    - **Property Binding**: [property]="value" is used to bind component properties to DOM element attributes.

    - **Event Binding**: (event)="method()" is used to capture user events like clicks and key presses.

3.  **Input and Output**:

    - Components can **communicate** with each other through **@Input()** and **@Output()** properties.

    - **@Input()**: Allows a parent component to pass data to a child component.

    - **@Output()**: Allows a child component to send data or events to the parent component.

```typescript
Example:
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

4.  **Component Hierarchy**:

    - Angular applications are typically made up of a **hierarchy of components**. The root component (usually AppComponent) contains other child components, and these components may further contain other components.

    - Parent-child relationships are key for structuring complex UIs, with data flowing between components via **Input/Output bindings**.

5.  **View Encapsulation**:

    - By default, Angular components use **ViewEncapsulation** to ensure that styles defined in a component are scoped to that component and do not leak outside of it.

    - Angular uses mechanisms like **Shadow DOM** or **Emulated Encapsulation** to achieve this.

### Summary

- **Components** in Angular are the building blocks of the application UI.

- Each component contains:

  - **Template** (HTML) for the UI structure.

  - **Component class** (TypeScript) for logic and behavior.

  - **Styles** (CSS/SCSS) for design and presentation.

- Components are organized in a **hierarchical structure**, where parent components can pass data to child components and vice versa using **@Input()** and **@Output()**.

- The @Component decorator defines metadata for the component, including the selector, template, and styles.

- Components make it easier to manage, reuse, and maintain the UI and logic of the application.

## How do components interact with each other?

In Angular, components can interact with each other in several ways. The most common patterns involve **parent-child communication**, **sharing services**, and **event binding**. Let’s explore these interaction methods:

### 1. **Parent-to-Child Communication (via @Input)**

A parent component can pass data to a child component using **@Input()** properties. This allows the parent to provide values to the child component, which can then use those values in its template or logic.

#### Steps:

- **Child component**: Define an @Input() property that the parent can bind to.

- **Parent component**: Bind a value to the child component’s input property.

#### Example:

**Child component** (child.component.ts):

```typescript
import { Component, Input } from '@angular/core';
@Component({
selector: 'app-child',
template: `<p>Message from parent: {{ message }}</p>`
})
export class ChildComponent {
@Input() message: string = ''; // Receives data from parent
}
```

**Parent component** (parent.component.ts):

```typescript
import { Component } from '@angular/core';
@Component({
selector: 'app-parent',
template: `
<app-child [message]="parentMessage"></app-child> <!-- Passes value to child -->
```

`

```typescript
})
export class ParentComponent {
parentMessage: string = 'Hello from the parent!';
}
```

In this example, the parent component passes the parentMessage to the child component through the @Input() binding.

### 2. **Child-to-Parent Communication (via @Output and EventEmitter)**

A child component can send data or events to its parent using **@Output()** and **EventEmitter**. This allows the child component to notify the parent of certain actions (e.g., button clicks).

#### Steps:

- **Child component**: Define an @Output() property with an EventEmitter to emit events.

- **Parent component**: Listen for the event and handle it.

#### Example:

**Child component** (child.component.ts):

```typescript
import { Component, Output, EventEmitter } from '@angular/core';
@Component({
selector: 'app-child',
template: `<button (click)="sendMessage()">Click Me</button>`
})
export class ChildComponent {
@Output() messageEvent = new EventEmitter<string>();
sendMessage() {
this.messageEvent.emit('Hello from the child!'); // Emit an event with data
}
}
```

**Parent component** (parent.component.ts):

```typescript
import { Component } from '@angular/core';
@Component({
selector: 'app-parent',
template: `
<app-child (messageEvent)="receiveMessage($event)"></app-child> <!-- Listens for event -->
<p>{{ receivedMessage }}</p>
```

`

```typescript
})
export class ParentComponent {
receivedMessage: string = '';
receiveMessage(message: string) {
this.receivedMessage = message; // Handle event from child
}
}
```

In this example, when the button in the child component is clicked, the child sends a message to the parent using @Output(). The parent listens for the messageEvent and updates its local data.

### 3. **Sharing Data Between Components (via Services)**

When components need to communicate without a direct parent-child relationship, services can be used to share data. Services in Angular are singleton objects, and their state can be shared across components through **Dependency Injection (DI)**.

#### Steps:

- **Service**: Create a service with shared data or logic.

- **Components**: Inject the service and use it to communicate.

#### Example:

**Service** (shared.service.ts):

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
```

providedIn: 'root'

```typescript
})
export class SharedService {
private messageSource = new BehaviorSubject<string>('Initial Message');
currentMessage = this.messageSource.asObservable();
changeMessage(message: string) {
this.messageSource.next(message); // Update the message
}
}
```

**Component A** (component-a.component.ts):

```typescript
import { Component } from '@angular/core';
import { SharedService } from './shared.service';
@Component({
selector: 'app-component-a',
template: `<button (click)="newMessage()">Send Message</button>`
})
export class ComponentA {
constructor(private sharedService: SharedService) {}
newMessage() {
this.sharedService.changeMessage('Message from Component A'); // Update message in service
}
}
```

**Component B** (component-b.component.ts):

```typescript
import { Component, OnInit } from '@angular/core';
import { SharedService } from './shared.service';
@Component({
selector: 'app-component-b',
template: `<p>{{ message }}</p>`
})
export class ComponentB implements OnInit {
message: string = '';
constructor(private sharedService: SharedService) {}
ngOnInit() {
this.sharedService.currentMessage.subscribe(message => this.message = message); // Subscribe to message updates
}
}
```

In this example, ComponentA changes the message via the SharedService, and ComponentB listens for updates and displays the message.

### 4. **Using ViewChild for Direct Parent-Child Communication**

Another way for a parent to interact directly with a child component is by using the **@ViewChild()** decorator. This allows the parent to access the child’s methods and properties.

#### Steps:

- **Parent component**: Use @ViewChild() to reference the child component and access its methods or properties.

#### Example:

**Child component** (child.component.ts):

```typescript
import { Component } from '@angular/core';
@Component({
selector: 'app-child',
template: `<p>Child Component</p>`
})
export class ChildComponent {
childMethod() {
console.log('Child method called!');
}
}
```

**Parent component** (parent.component.ts):

```typescript
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ChildComponent } from './child.component';
@Component({
selector: 'app-parent',
template: `
<app-child></app-child>
<button (click)="callChildMethod()">Call Child Method</button>
```

`

```typescript
})
export class ParentComponent implements AfterViewInit {
@ViewChild(ChildComponent) childComponent!: ChildComponent;
ngAfterViewInit() {
// Access child's method or properties after the view has been initialized
}
callChildMethod() {
this.childComponent.childMethod(); // Calling child method from parent
}
}
```

In this example, the parent component calls the child component’s childMethod() using @ViewChild().

### 5. **Content Projection (ng-content)**

Sometimes a parent component may need to pass content (HTML) to a child component. Angular provides **content projection** using <ng-content>. This allows the child component to display dynamic content provided by the parent.

#### Steps:

- **Child component**: Use <ng-content> in the template where the parent’s content should be displayed.

- **Parent component**: Provide the content inside the child component’s selector.

#### Example:

**Child component** (child.component.ts):

```typescript
@Component({
selector: 'app-child',
template: `<p>Child Component:</p><ng-content></ng-content>`
})
export class ChildComponent {}
```

**Parent component** (parent.component.ts):

```typescript
@Component({
selector: 'app-parent',
template: `
<app-child>
<p>This is projected content from the parent.</p>
</app-child>
```

`

```typescript
})
export class ParentComponent {}
```

In this example, the child component uses <ng-content> to display the content provided by the parent, allowing for flexible and dynamic content projection.

### Summary:

- **Parent-to-child communication** is achieved using @Input() to pass data down.

- **Child-to-parent communication** uses @Output() and EventEmitter to emit events.

- **Services** are used for sharing data across components that don’t have a direct relationship.

- **@ViewChild()** enables direct access to a child component's methods or properties from the parent.

- **Content projection** (<ng-content>) allows dynamic content to be passed from parent to child.

These interaction methods enable Angular components to work together, making it possible to build complex, dynamic applications.

## What are Angular lifecycle hooks, and why are they important?

Angular **lifecycle hooks** are special methods that allow developers to tap into key phases of a component’s lifecycle, from creation to destruction. These hooks are important because they provide opportunities to run custom logic at specific moments, such as initializing data, responding to changes, or cleaning up resources before a component is destroyed.

Lifecycle hooks enhance control over a component’s behavior and are crucial for managing state, resources, and side effects efficiently.

### Key Angular Lifecycle Hooks

1.  **ngOnChanges()**:

    - **Trigger**: Called whenever data-bound input properties change.

    - **Purpose**: React to changes in @Input() properties, useful when you need to respond to incoming data updates.

    - **Usage**: Best for tracking input changes and updating internal state accordingly.

    - **Called Before**: ngOnInit() (if changes occur before the component initialization).

```typescript
ngOnChanges(changes: SimpleChanges) {
console.log('Input property changed:', changes);
}
```

2.  **ngOnInit()**:

    - **Trigger**: Called once after the component's data-bound properties have been initialized (after the first ngOnChanges()).

    - **Purpose**: Perform initialization tasks such as fetching data or setting up state after the component is constructed but before it appears in the view.

    - **Usage**: Ideal for any logic that needs to run once, after the component has been created.

```typescript
ngOnInit() {
console.log('Component initialized');
}
```

3.  **ngDoCheck()**:

    - **Trigger**: Called during every change detection cycle (when Angular checks for changes in the component).

    - **Purpose**: Detect and act upon changes that Angular might not automatically catch, such as changes to object or array properties that aren't captured by @Input().

    - **Usage**: Typically used when you need fine control over change detection.

```typescript
ngDoCheck() {
console.log('Change detection run');
}
```

4.  **ngAfterContentInit()**:

    - **Trigger**: Called once after Angular projects external content into the component’s view (content projection via <ng-content>).

    - **Purpose**: Respond when the content inside a component (e.g., from a parent component) is initialized.

    - **Usage**: Useful when the component relies on projected content.

```typescript
ngAfterContentInit() {
console.log('Projected content initialized');
}
```

5.  **ngAfterContentChecked()**:

    - **Trigger**: Called after every check of projected content (after each change detection cycle for projected content).

    - **Purpose**: Respond to changes in the projected content.

    - **Usage**: Allows developers to react to updates in the content passed to the component.

```typescript
ngAfterContentChecked() {
console.log('Projected content checked');
}
```

6.  **ngAfterViewInit()**:

    - **Trigger**: Called once after the component’s view and its child views (if any) have been initialized.

    - **Purpose**: Respond to the view being fully rendered, including all child components.

    - **Usage**: Typically used to perform operations that require the DOM to be fully rendered, such as accessing child component elements with @ViewChild.

```typescript
ngAfterViewInit() {
console.log('View initialized');
}
```

7.  **ngAfterViewChecked()**:

    - **Trigger**: Called after every check of the component’s view and child views.

    - **Purpose**: Respond to changes in the view or child components after the view has been updated.

    - **Usage**: This hook can be used for post-view modifications, though it’s often not needed unless detailed control is required.

```typescript
ngAfterViewChecked() {
console.log('View checked');
}
```

8.  **ngOnDestroy()**:

    - **Trigger**: Called just before Angular destroys the component.

    - **Purpose**: Cleanup resources (e.g., unsubscribe from observables, detach event handlers) to avoid memory leaks.

    - **Usage**: Crucial for freeing up resources when the component is removed from the DOM.

```typescript
ngOnDestroy() {
console.log('Component destroyed');
}
```

### Why Lifecycle Hooks Are Important

1.  **Managing Component Initialization**: Hooks like ngOnInit() are essential for setting up a component's state after its creation. For example, you can fetch data from an API or initialize forms in this hook.

2.  **Responding to Changes**: With hooks like ngOnChanges() and ngDoCheck(), you can respond to changes in input data and trigger updates to the component accordingly.

3.  **Projecting Content**: Hooks like ngAfterContentInit() and ngAfterContentChecked() allow you to handle content that is projected into your component from its parent, ensuring that the projected content is properly initialized and checked for changes.

4.  **DOM Interaction**: Hooks like ngAfterViewInit() and ngAfterViewChecked() are used for interacting with the component’s view and DOM elements after Angular has fully initialized them. These are particularly useful when using @ViewChild() or manipulating the DOM directly.

5.  **Cleanup and Resource Management**: The ngOnDestroy() hook is crucial for preventing memory leaks by cleaning up resources when a component is removed. For example, if you have active subscriptions to observables, you should unsubscribe in ngOnDestroy().

### Lifecycle Flow

The typical flow of the lifecycle hooks is as follows:

1.  ngOnChanges()

2.  ngOnInit()

3.  ngDoCheck()

4.  ngAfterContentInit()

5.  ngAfterContentChecked()

6.  ngAfterViewInit()

7.  ngAfterViewChecked()

8.  ngOnDestroy()

### Example Using Multiple Hooks

```typescript
import { Component, Input, OnInit, OnChanges, OnDestroy } from '@angular/core';
@Component({
selector: 'app-lifecycle-demo',
template: `<p>{{ message }}</p>`
})
export class LifecycleDemoComponent implements OnInit, OnChanges, OnDestroy {
@Input() message: string = '';
constructor() {
console.log('Constructor: Component instantiated');
}
ngOnChanges(changes: SimpleChanges) {
console.log('ngOnChanges: Input changed', changes);
}
ngOnInit() {
console.log('ngOnInit: Component initialized');
}
ngOnDestroy() {
console.log('ngOnDestroy: Component is about to be destroyed');
}
}
```

In this example:

- **ngOnChanges()**: Reacts when the message input changes.

- **ngOnInit()**: Executes initialization logic after the component is constructed.

- **ngOnDestroy()**: Cleans up when the component is destroyed.

### Summary

- Angular **lifecycle hooks** provide critical points during a component's existence to hook into, allowing developers to perform initialization, respond to changes, handle view rendering, and perform cleanup.

- Hooks like **ngOnInit()** and **ngOnDestroy()** are among the most commonly used to manage component state and resources.

- By leveraging lifecycle hooks, developers can write more maintainable, efficient, and responsive applications.

## Can you name the most commonly used lifecycle hooks?

The most commonly used lifecycle hooks in Angular are:

1.  **ngOnInit()**: Called once after the component’s data-bound properties have been initialized. It's often used to perform initialization tasks such as fetching data or setting up component state.

2.  **ngOnChanges()**: Called whenever one or more data-bound input properties change. This is useful for reacting to changes in @Input() properties.

3.  **ngDoCheck()**: Called during every change detection run. It allows developers to manually check for changes that Angular may not automatically detect.

4.  **ngAfterViewInit()**: Called once after the component’s view (and its child views) has been fully initialized. It’s commonly used for interacting with the DOM or child components.

5.  **ngAfterViewChecked()**: Called after every check of the component’s view and child views. This is useful for responding to updates in the view.

6.  **ngOnDestroy()**: Called just before Angular destroys the component. This hook is critical for cleaning up resources such as unsubscribing from observables or detaching event handlers.

These hooks are most frequently used because they provide essential control over component initialization, updates, and cleanup, which are key phases in an Angular component’s lifecycle.

## What is the difference between constructor and ngOnInit in Angular?

In Angular, both the **constructor** and **ngOnInit()** methods are used during a component’s initialization phase, but they serve different purposes and are used at different points in the lifecycle of a component.

### Constructor

1.  **Purpose**:

    - The **constructor** is a standard TypeScript class method used to create and initialize an instance of the class. In Angular, it is used primarily for dependency injection.

2.  **Usage**:

    - The constructor is used to inject services or perform simple setup tasks. It’s a place to initialize component properties, but it’s not suitable for performing complex logic or accessing component’s input properties since those might not be initialized yet.

3.  **Timing**:

    - The constructor is called when the component class is instantiated, which is before Angular initializes any input properties or runs any lifecycle hooks.

4.  **Code Example**:

```typescript
import { Component, OnInit } from '@angular/core';
import { MyService } from './my.service';
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit {
constructor(private myService: MyService) {
// Dependency injection happens here
console.log('Constructor called');
}
ngOnInit() {
// Initialization logic
console.log('ngOnInit called');
}
}
```

### ngOnInit()

1.  **Purpose**:

    - **ngOnInit()** is a lifecycle hook method provided by Angular’s OnInit interface. It’s specifically designed for component initialization after Angular has finished setting up the component’s data-bound properties (e.g., input properties).

2.  **Usage**:

    - Use **ngOnInit()** to perform initialization logic that requires access to input properties or other Angular features such as services. This is the appropriate place to fetch data, initialize form controls, or perform setup operations that depend on the component being fully initialized.

3.  **Timing**:

    - **ngOnInit()** is called once Angular has completed the component’s input property bindings and initialization. This happens after the constructor is executed and before the component’s view is rendered.

4.  **Code Example**:

```typescript
import { Component, OnInit } from '@angular/core';
import { MyService } from './my.service';
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit {
constructor(private myService: MyService) {}
ngOnInit() {
// Perform initialization logic here, e.g., data fetching
console.log('ngOnInit called');
this.myService.getData().subscribe(data => {
console.log('Data fetched:', data);
});
}
}
```

In summary, use the **constructor** for basic setup and dependency injection, and **ngOnInit()** for initialization tasks that rely on the component being fully set up and its inputs being available.

## Explain the concept of data binding in Angular.

Data binding in Angular is a fundamental concept that allows synchronization between the model (data) and the view (user interface). It ensures that changes in the model are reflected in the view and vice versa, making it easier to manage and update the user interface dynamically. Angular provides several forms of data binding to handle different scenarios efficiently.

### Types of Data Binding in Angular

1.  **Interpolation (One-Way Binding)**

```typescript
Interpolation is used to bind data from the component class to the view. It allows you to display component data within the HTML template.
```

- **Syntax**: {{ expression }}

- **Example**:

```typescript
<p>{{ message }}</p>
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
message: string = 'Hello, Angular!';
}
```

2.  **Property Binding (One-Way Binding)**

```typescript
Property binding allows you to bind data from the component to an HTML element property, such as setting the src attribute of an <img> tag or the value of an <input>.
```

- **Syntax**: [property]="expression"

- **Example**:

```typescript
<img [src]="imageUrl" alt="Angular Logo">
<input [value]="inputValue">
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
imageUrl: string = 'https://angular.io/assets/images/logos/angular/angular.png';
inputValue: string = 'Initial Value';
}
```

3.  **Event Binding (One-Way Binding)**

```typescript
Event binding allows you to listen to events (e.g., click events) from the view and execute methods in the component class.
```

- **Syntax**: (event)="method()"

- **Example**:

```typescript
<button (click)="handleClick()">Click Me</button>
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
handleClick() {
console.log('Button clicked!');
}
}
```

4.  **Two-Way Data Binding**

```typescript
Two-way data binding allows for the synchronization of data between the component and the view. Changes in the view update the component data, and changes in the component data update the view. This is commonly used with form controls.
```

- **Syntax**: [(ngModel)]="property"

- **Example**:

```typescript
<input [(ngModel)]="name">
<p>Hello, {{ name }}!</p>
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
name: string = 'Angular';
}
```

- **Note**: For two-way binding with ngModel, you need to import the FormsModule in your module.

5.  **Attribute Binding (One-Way Binding)**

```typescript
Attribute binding allows you to bind data to the attributes of HTML elements that are not standard properties.
```

- **Syntax**: [attr.attributeName]="expression"

- **Example**:

```typescript
<div [attr.aria-label]="label">Content</div>
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
label: string = 'Accessible label';
}
```

6.  **Class Binding (One-Way Binding)**

```typescript
Class binding allows you to dynamically add or remove CSS classes on an element based on component data.
```

- **Syntax**: [class.className]="expression"

- **Example**:

```typescript
<div [class.active]="isActive">Content</div>
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
isActive: boolean = true;
}
```

7.  **Style Binding (One-Way Binding)**

```typescript
Style binding allows you to dynamically set CSS styles on an element based on component data.
```

- **Syntax**: [style.styleName]="expression"

- **Example**:

```typescript
<div [style.color]="color">Styled Text</div>
@Component({
selector: 'app-example',
templateUrl: './example.component.html'
})
export class ExampleComponent {
color: string = 'blue';
}
```

### Summary of Data Binding

- **Interpolation**: Binds component data to HTML text content.

- **Property Binding**: Binds component data to element properties.

- **Event Binding**: Listens to events and executes component methods.

- **Two-Way Binding**: Synchronizes data between component and view, typically used with form elements.

- **Attribute Binding**: Binds data to non-standard HTML attributes.

- **Class Binding**: Dynamically adds or removes CSS classes based on component data.

- **Style Binding**: Dynamically sets CSS styles based on component data.

Data binding in Angular helps in creating dynamic, interactive user interfaces by ensuring that changes in the component’s data model are automatically reflected in the view, and vice versa, without requiring manual DOM manipulation.

## What are directives in Angular, and how are they categorized?

In Angular, **directives** are special markers in the DOM that tell Angular to do something to that DOM element or its children. They can be used to add behavior to elements, modify their appearance, or handle events. Directives are a core feature of Angular and play a crucial role in creating reusable, modular components and applications.

### Types of Directives in Angular

Directives in Angular are categorized into three main types:

1.  **Components**:

    - **Description**: Technically, components are a special kind of directive. They are directives with a template. Components are the building blocks of an Angular application and include both the view and the logic for that view.

    - **Example**:

```typescript
@Component({
selector: 'app-my-component',
template: `<p>Hello, World!</p>`,
styles: [`p { color: blue; }`]
})
export class MyComponent { }
```

2.  **Structural Directives**:

    - **Description**: Structural directives change the structure of the DOM by adding or removing elements. They typically modify the layout of the view and are responsible for the addition or removal of DOM elements.

    - **Examples**:

      - **`*ngIf`**: Conditionally includes or excludes an element from the DOM.

```typescript
<div *ngIf="isVisible">This is visible</div>
```

- **`*ngFor`**: Iterates over a list and creates a template for each item.

```typescript
<ul>
<li *ngFor="let item of items">{{ item }}</li>
</ul>
```

- ***ngSwitch**: Conditionally displays one of many possible elements based on the value of an expression.

```typescript
<div [ngSwitch]="value">
<div *ngSwitchCase="'A'">A</div>
<div *ngSwitchCase="'B'">B</div>
<div *ngSwitchDefault>Default</div>
</div>
```

3.  **Attribute Directives**:

    - **Description**: Attribute directives change the appearance or behavior of an element, component, or another directive. Unlike structural directives, they do not change the DOM structure but modify the behavior or styling of existing elements.

    - **Examples**:

      - **ngClass**: Adds or removes CSS classes based on expressions.

```typescript
<div [ngClass]="{'active': isActive}">Styled Div</div>
```

- **ngStyle**: Adds or removes inline styles based on expressions.

```typescript
<div [ngStyle]="{color: textColor}">Styled Text</div>
```

- **Custom Attribute Directive**: An example of a custom attribute directive that changes the background color of an element.

```typescript
@Directive({
selector: '[appHighlight]'
})
export class HighlightDirective {
constructor(private el: ElementRef) {
el.nativeElement.style.backgroundColor = 'yellow';
}
}
<p appHighlight>This text has a yellow background.</p>
```

### Summary of Directives

- **Components**: Directives with templates that represent a view. They are the primary building blocks of Angular applications.

- **Structural Directives**: Change the DOM layout by adding or removing elements. Examples include `*ngIf`, `*ngFor`, and *ngSwitch.

- **Attribute Directives**: Change the appearance or behavior of an element. They do not alter the DOM structure but modify existing elements. Examples include ngClass, ngStyle, and custom directives.

### How Directives Are Used

1.  **Creating Directives**:

    - You create a directive by defining a class with the @Directive decorator for attribute directives or @Component for components.

2.  **Applying Directives**:

    - **Structural Directives**: Applied to elements using an asterisk (*) prefix.

    - **Attribute Directives**: Applied directly to elements without any prefix.

3.  **Combining Directives**:

    - You can combine multiple directives on a single element to achieve complex behaviors. For example, applying both ngClass and ngStyle on an element.

4.  **Custom Directives**:

    - Custom directives allow you to encapsulate reusable behavior and apply it across different parts of your application.

Directives are a powerful feature in Angular that enable you to build dynamic and reusable components and templates by manipulating the DOM and adding custom behavior.

## How does ngFor directive work?

The `*ngFor` directive in Angular is a structural directive used to iterate over a list or collection and generate a template for each item in the list. It dynamically creates a set of DOM elements based on the data provided, making it essential for displaying collections of items in a repeatable format.

### How *ngFor Works

1.  **Syntax**: The basic syntax for using `*ngFor` is:

```typescript
<element *ngFor="let item of items">
<!-- Template content -->
</element>
```

2.  **Usage**:

    - **let item of items**: item represents each element in the items array or collection. The items is the array or iterable that you want to loop through.

    - Inside the `*ngFor` loop, you can use the item to bind to the properties of each individual item.

3.  **Example**:

```typescript
Suppose you have a list of names that you want to display in an unordered list. Here’s how you could use *ngFor to achieve this:
**Component Class**:
import { Component } from '@angular/core';
@Component({
selector: 'app-name-list',
templateUrl: './name-list.component.html'
})
export class NameListComponent {
names: string[] = ['Alice', 'Bob', 'Charlie', 'Diana'];
}
**Template**:
<ul>
<li *ngFor="let name of names">{{ name }}</li>
</ul>
In this example, *ngFor iterates over the names array and creates an <li> element for each name in the array.
```

### Advanced Features of *ngFor

1.  **Index**: You can access the index of the current item in the loop using the index keyword.

```typescript
<ul>
<li *ngFor="let name of names; let i = index">
{{ i + 1 }}. {{ name }}
</li>
</ul>
```

2.  **First, Last, Even, and Odd**: Angular provides additional variables to access the position of the item in the loop:

    - first: true if the item is the first in the collection.

    - last: true if the item is the last in the collection.

    - even: true if the item’s index is even.

    - odd: true if the item’s index is odd.

```typescript
**Example**:
<ul>
<li *ngFor="let name of names; let i = index; let isFirst = first; let isLast = last">
<span *ngIf="isFirst">First Item: </span>
<span *ngIf="isLast">Last Item: </span>
{{ name }} (Index: {{ i }})
</li>
</ul>
```

3.  **Track By**: To improve performance, especially with large lists or when the list data changes frequently, you can use the trackBy function. This function helps Angular track which items have changed, added, or removed.

```typescript
**Usage**:
<ul>
<li *ngFor="let name of names; trackBy: trackByFn">
{{ name }}
</li>
</ul>
**Component Class**:
import { Component } from '@angular/core';
@Component({
selector: 'app-name-list',
templateUrl: './name-list.component.html'
})
export class NameListComponent {
names: string[] = ['Alice', 'Bob', 'Charlie', 'Diana'];
trackByFn(index: number, item: string): number {
return index; // or use a unique identifier if the items are objects
}
}
```

### Summary

- **Basic Usage**: `*ngFor` iterates over a collection and renders a template for each item.

- **Index Access**: Use index to get the current index in the loop.

- **State Variables**: Access first, last, even, and odd to get positional information.

- **Performance Optimization**: Use trackBy to improve performance by tracking items efficiently.

The `*ngFor` directive is a powerful tool for dynamically generating content based on data in Angular, making it a staple for creating dynamic and interactive user interfaces.

## Explain the ngIf directive.

The `*ngIf` directive in Angular is a structural directive that conditionally includes or excludes a part of the DOM based on a Boolean expression. It allows you to control the rendering of elements based on certain conditions, effectively showing or hiding content.

### How *ngIf Works

1.  **Basic Syntax**: The basic syntax of `*ngIf` is:

```typescript
<element *ngIf="condition">
<!-- Content to display if the condition is true -->
</element>
```

- condition is an expression that evaluates to true or false.

2.  **Usage Example**:

```typescript
Suppose you want to display a message only if a certain condition is met. Here’s how you can use *ngIf:
**Component Class**:
import { Component } from '@angular/core';
@Component({
selector: 'app-conditional-message',
templateUrl: './conditional-message.component.html'
})
export class ConditionalMessageComponent {
isVisible: boolean = true; // This could be dynamically changed
}
**Template**:
<p *ngIf="isVisible">This message is visible.</p>
In this example, the <p> element will only be rendered if isVisible is true. If isVisible is false, the element will not be included in the DOM.
```

### *ngIf with else

You can use `*ngIf` with an else clause to conditionally display alternative content when the condition is false.

- **Syntax**:

```typescript
<ng-template #templateName>
<!-- Content to display if the condition is false -->
</ng-template>
<element *ngIf="condition; else templateName">
<!-- Content to display if the condition is true -->
</element>
```

- **Example**:

```typescript
<ng-template #elseContent>
<p>The condition is false.</p>
</ng-template>
<p *ngIf="isVisible; else elseContent">The condition is true.</p>
In this example, if isVisible is true, the message "The condition is true." will be shown. If isVisible is false, the content inside the <ng-template> with the reference #elseContent will be displayed instead.
```

### *ngIf with then

The then clause is used to specify an alternative template to render when the condition is true. This is useful when you have more complex templates or need to render different content based on the condition.

- **Syntax**:

```typescript
<ng-template #thenContent>
<!-- Content to display if the condition is true -->
</ng-template>
<ng-template #elseContent>
<!-- Content to display if the condition is false -->
</ng-template>
<element *ngIf="condition; then thenContent; else elseContent"></element>
```

- **Example**:

```typescript
<ng-template #thenTemplate>
<p>The condition is true.</p>
</ng-template>
<ng-template #elseTemplate>
<p>The condition is false.</p>
</ng-template>
<ng-container *ngIf="isVisible; then thenTemplate; else elseTemplate"></ng-container>
In this example, if isVisible is true, the <p> element with the text "The condition is true." will be displayed. If isVisible is false, the content in the elseTemplate will be displayed.
```

### Summary

- **Basic Usage**: `*ngIf` conditionally includes or excludes content from the DOM based on a Boolean expression.

- **else Clause**: Provides an alternative template to render when the condition is false.

- **then Clause**: Specifies a template to render when the condition is true and is used with `*ngIf`.

The `*ngIf` directive is useful for managing conditional rendering of elements in Angular applications, allowing you to create dynamic and responsive user interfaces based on different conditions.

## How do you create a custom directive in Angular?

Creating a custom directive in Angular allows you to encapsulate reusable behavior and apply it to different elements across your application. Here's a step-by-step guide to creating a custom directive in Angular:

### Steps to Create a Custom Directive

1.  **Generate the Directive**

```typescript
Use Angular CLI to generate a new directive. Run the following command in your Angular project directory:
ng generate directive directiveName
For example, to create a directive called highlight, you would run:
ng generate directive highlight
This command creates two files:
```

- highlight.directive.ts (the TypeScript file with the directive logic)

- highlight.directive.spec.ts (the testing file)

2.  **Define the Directive**

```typescript
Open the generated highlight.directive.ts file and define the directive. You need to import the necessary Angular core classes and use the @Directive decorator to define your custom directive.
**Example**: Creating a directive that highlights an element by changing its background color.
import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';
@Directive({
selector: '[appHighlight]' // This is the selector you use in HTML to apply the directive
})
export class HighlightDirective {
@Input('appHighlight') highlightColor: string = 'yellow'; // Input property to set the highlight color
constructor(private el: ElementRef, private renderer: Renderer2) {
// Optionally, initialize directive logic here
}
@HostListener('mouseenter') onMouseEnter() {
this.highlight(this.highlightColor);
}
@HostListener('mouseleave') onMouseLeave() {
this.highlight(null);
}
private highlight(color: string | null) {
this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', color);
}
}
```

- **@Directive**: Decorator that defines the directive. The selector specifies how to apply the directive in the template.

- **ElementRef**: Provides access to the DOM element the directive is applied to.

- **Renderer2**: Allows you to modify the DOM in a platform-independent way.

- **@HostListener**: Decorator to listen to events on the host element. In this example, it listens for mouseenter and mouseleave events.

3.  **Use the Directive in Templates**

```typescript
Once the directive is defined, you can use it in your Angular templates. Make sure the directive is declared in an Angular module.
**Example**: Applying the appHighlight directive to an element.
**Component Template**:
<p [appHighlight]="'lightblue'">Hover over me to see the highlight effect!</p>
In this example, the appHighlight directive changes the background color of the <p> element when the mouse enters or leaves.
```

4.  **Declare the Directive in a Module**

```typescript
Make sure the directive is declared in an Angular module so that Angular can recognize and use it.
**Module Declaration**:
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HighlightDirective } from './highlight.directive'; // Import the custom directive
@NgModule({
declarations: [
AppComponent,
HighlightDirective // Declare the custom directive here
],
imports: [
BrowserModule
],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule { }
```

Custom directives are a powerful feature in Angular that allow you to create reusable and modular code for manipulating DOM elements and adding custom behaviors.

## What are template reference variables in Angular?

Template reference variables in Angular are a way to reference elements or directives within a template. They provide a way to interact with DOM elements and components in your Angular templates, making it easier to access and manipulate them directly from the template.

### How Template Reference Variables Work

1.  **Definition**: Template reference variables are defined in the template using the # symbol followed by a variable name. These variables can be used to access the corresponding DOM element or component instance within the template.

```typescript
**Syntax**:
<element #variableName></element>
```

- #variableName is the template reference variable name.

2.  **Accessing Elements**: You can use the template reference variable to access and manipulate the corresponding DOM element or component instance.

```typescript
**Example**:
<input #myInput type="text">
<button (click)="logValue(myInput.value)">Log Value</button>
In this example, #myInput is a reference to the <input> element. The logValue method is called when the button is clicked, and it logs the current value of the input element.
```

3.  **Accessing Component Instances**: Template reference variables can also be used to access component instances. This allows you to call methods or access properties of the component.

```typescript
**Example**:
<app-my-component #myComponent></app-my-component>
<button (click)="myComponent.doSomething()">Call Component Method</button>
Here, #myComponent is a reference to the app-my-component instance. The doSomething method of MyComponent will be called when the button is clicked.
```

4.  **Accessing Directives**: You can use template reference variables to access directives applied to elements.

```typescript
**Example**:
<div *ngIf="isVisible" #myDiv="ngIf"></div>
<button (click)="logNgIfStatus(myDiv)">Log ngIf Status</button>
In this example, #myDiv="ngIf" allows you to access the ngIf directive instance and its properties.
```

5.  **Form Control Access**: Template reference variables are commonly used with Angular forms to access form controls and their properties.

```typescript
**Example**:
<form #myForm="ngForm">
<input name="name" ngModel>
<button (click)="logForm(myForm)">Log Form</button>
</form>
Here, #myForm="ngForm" provides a reference to the form instance, allowing you to interact with the form's state and controls.
```

### Summary

- **Definition**: Template reference variables are declared using the # symbol and allow you to reference DOM elements, components, or directives in the template.

- **Access Elements**: Use the variable to access and manipulate the DOM element.

- **Access Components**: Reference a component instance to call methods or access properties.

- **Access Directives**: Reference directive instances to access their properties or methods.

- **Form Controls**: Access form control instances to manage form state and values.

Template reference variables are a powerful feature in Angular that enable you to interact with elements, components, and directives directly from the template, facilitating more dynamic and interactive user interfaces.

## What is content projection, and how does ng-content work?

**Content projection** in Angular is a technique that allows you to insert or project content from a parent component into a child component's template. This enables you to create reusable and flexible components that can display varying content based on their usage context.

### How Content Projection Works

**Content projection** allows you to pass HTML content from a parent component and display it inside a child component. This technique helps in creating components that can adapt to different contexts without altering their internal template logic.

### How ng-content Works

**ng-content** is the directive used for content projection. It acts as a placeholder in the child component's template where content from the parent component will be inserted. Here's how it works:

1.  **Basic Content Projection**:

    - You define an ng-content element in the child component's template.

    - Content provided by the parent component is projected into the ng-content placeholder.

```typescript
**Example**:
**Child Component Template (child.component.html)**:
<div class="content">
<ng-content></ng-content>
</div>
**Parent Component Template (parent.component.html)**:
<app-child>
<p>This content is projected into the child component.</p>
</app-child>
In this example, the <p> element from the parent component is inserted into the ng-content placeholder in the child component's template.
```

2.  **Named Content Projection**: You can use multiple ng-content elements with selectors to project different content into specific areas of the child component's template.

```typescript
**Example**:
**Child Component Template (child.component.html)**:
<div class="header">
<ng-content select="[header]"></ng-content>
</div>
<div class="body">
<ng-content select="[body]"></ng-content>
</div>
**Parent Component Template (parent.component.html)**:
<app-child>
<h1 header>Header Content</h1>
<p body>Body Content</p>
</app-child>
In this example, the header and body attributes are used to target different sections of the child component’s template.
```

3.  **Fallback Content**: You can provide fallback content in case no content is projected into the ng-content placeholder.

```typescript
**Example**:
**Child Component Template (child.component.html)**:
<div class="content">
<ng-content></ng-content>
<ng-template #fallback>
<p>No content provided.</p>
</ng-template>
</div>
**Parent Component Template (parent.component.html)**:
<app-child></app-child>
In this case, "No content provided." will be displayed if no other content is projected into the child component.
```

### How to Use ng-content

- **Single ng-content**: Projects all content into the single ng-content element.

- **Multiple ng-content**: Allows projection of different parts of content into specific areas of the template using selectors.

### Summary

- **Content Projection**: A technique to insert content from a parent component into a child component, making the child component adaptable and reusable.

- **ng-content Directive**: Acts as a placeholder in the child component’s template where the parent component's content will be inserted.

- **Basic Usage**: Projects all content into a single placeholder.

- **Named Projection**: Uses selectors to project content into specific areas of the child component’s template.

- **Fallback Content**: Provides default content if no content is projected.

Content projection and ng-content are powerful tools for creating dynamic, reusable components in Angular, allowing you to design components that are flexible and adaptable to different scenarios.

## What is the difference between ViewChild and ContentChild and ViewChildren?

In Angular, **ViewChild**, **ContentChild**, and **ViewChildren** are decorators used to access elements or components within a component's view or content. They serve different purposes based on the type of content and elements you want to access.

### @ViewChild

**@ViewChild** is used to get a reference to a single DOM element or component within the component's own view. It allows you to access a child component, directive, or element that is part of the current view of the component.

#### **Usage**

1.  **Accessing a DOM Element**:

```typescript
import { Component, ViewChild, ElementRef } from '@angular/core';
@Component({
selector: 'app-example',
template: `<input #myInput>`
})
export class ExampleComponent {
@ViewChild('myInput') inputElement: ElementRef;
ngAfterViewInit() {
this.inputElement.nativeElement.focus();
}
}
In this example, #myInput is a template reference variable, and @ViewChild('myInput') allows you to access the DOM element directly.
```

2.  **Accessing a Child Component**:

```typescript
import { Component, ViewChild } from '@angular/core';
import { ChildComponent } from './child.component';
@Component({
selector: 'app-parent',
template: `<app-child></app-child>`
})
export class ParentComponent {
@ViewChild(ChildComponent) child: ChildComponent;
ngAfterViewInit() {
this.child.someMethod();
}
}
Here, @ViewChild(ChildComponent) provides access to the ChildComponent instance within the parent component's view.
```

### @ContentChild

**@ContentChild** is used to get a reference to a single DOM element or component projected into the component via content projection. It allows you to access elements or components that are passed into the component via ng-content.

#### **Usage**

1.  **Accessing Projected Content**:

```typescript
import { Component, ContentChild, ElementRef } from '@angular/core';
@Component({
selector: 'app-parent',
template: `<ng-content></ng-content>`
})
export class ParentComponent {
@ContentChild('projectedContent') content: ElementRef;
ngAfterContentInit() {
console.log(this.content.nativeElement.textContent);
}
}
**Parent Component Template**:
<app-parent>
<p #projectedContent>Content to project</p>
</app-parent>
In this example, #projectedContent is a reference variable used in the projected content, and @ContentChild('projectedContent') allows access to it within the parent component.
```

### @ViewChildren

**@ViewChildren** is used to get a reference to multiple DOM elements or components within the component's own view. It allows you to query and access multiple instances of elements or components.

#### **Usage**

1.  **Accessing Multiple Elements**:

```typescript
import { Component, ViewChildren, QueryList, AfterViewInit, ElementRef } from '@angular/core';
@Component({
selector: 'app-example',
template: `
<input #input1>
<input #input2>
`
})
export class ExampleComponent implements AfterViewInit {
@ViewChildren('input1, input2') inputs: QueryList<ElementRef>;
ngAfterViewInit() {
this.inputs.forEach(input => console.log(input.nativeElement.value));
}
}
In this example, @ViewChildren is used to get a QueryList of all inputs with the reference variables input1 and input2.
```

2.  **Accessing Multiple Components**:

```typescript
import { Component, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ChildComponent } from './child.component';
@Component({
selector: 'app-parent',
template: `<app-child *ngFor="let item of items"></app-child>`
})
export class ParentComponent implements AfterViewInit {
@ViewChildren(ChildComponent) children: QueryList<ChildComponent>;
ngAfterViewInit() {
this.children.forEach(child => child.someMethod());
}
}
In this case, @ViewChildren(ChildComponent) provides access to all instances of ChildComponent within the parent component's view.
```

### **Summary**

- **@ViewChild**:

  - Used to access a single DOM element or component within the component's view.

  - Works with both native elements and Angular components/directives.

- **@ContentChild**:

  - Used to access a single DOM element or component projected into the component using ng-content.

  - Useful for accessing content passed from the parent component.

- **@ViewChildren**:

  - Used to access multiple DOM elements or components within the component's view.

  - Returns a QueryList of elements/components, allowing you to iterate over them.

These decorators provide powerful ways to interact with components and elements in Angular, facilitating more dynamic and flexible component interactions and manipulations.

## What is the purpose of the angular.json file in Angular projects?

The **angular.json** file in Angular projects is a configuration file used by the Angular CLI to manage various settings related to the build and development process of Angular applications. It plays a crucial role in defining how Angular applications are built, served, and tested. Here's a detailed look at its purpose and key features:

### Purpose of angular.json

1.  **Configuration Management**:

    - **angular.json** centralizes the configuration for Angular projects, including build and development settings. This file is automatically generated when you create an Angular project using the Angular CLI.

2.  **Build and Serve Settings**:

    - It contains settings for how Angular applications are built, served, and tested. This includes specifying the configurations for different environments and how assets should be handled.

3.  **Project Structure**:

    - The file defines the structure and configurations for multiple projects (e.g., applications and libraries) within an Angular workspace.

### Key Sections in angular.json

Here's an overview of the main sections and their purposes:

1.  **projects**:

    - Contains configuration settings for each project in the Angular workspace. This can include multiple applications and libraries.

    - **Example**:

```typescript
"projects": {
"my-app": {
"projectType": "application",
...
},
"my-lib": {
"projectType": "library",
...
}
}
```

2.  **architect**:

    - Inside each project, the architect section specifies the targets (such as build, serve, test) and their configurations.

    - **Example**:

```typescript
"architect": {
"build": {
"builder": "@angular-devkit/build-angular:browser",
"options": {
"outputPath": "dist/my-app",
"index": "src/index.html",
"main": "src/main.ts",
"polyfills": "src/polyfills.ts",
...
}
},
"serve": {
"builder": "@angular-devkit/build-angular:dev-server",
"options": {
"browserTarget": "my-app:build"
}
}
}
```

3.  **build**:

    - Contains settings for the build process, including output paths, file replacements, and optimization options.

    - **Example**:

```typescript
"build": {
"options": {
"outputPath": "dist/my-app",
"index": "src/index.html",
"main": "src/main.ts",
"polyfills": "src/polyfills.ts",
"tsConfig": "src/tsconfig.app.json",
"assets": [
"src/favicon.ico",
"src/assets"
],
"styles": [
"src/styles.css"
],
"scripts": []
}
}
```

4.  **serve**:

    - Contains settings for serving the application during development, including configuration for the development server.

    - **Example**:

```typescript
"serve": {
"options": {
"port": 4200,
"open": true,
"proxyConfig": "src/proxy.conf.json"
}
}
```

5.  **test**:

    - Contains settings for running tests, including configurations for the test runner and code coverage options.

    - **Example**:

```typescript
"test": {
"options": {
"main": "src/test.ts",
"tsConfig": "src/tsconfig.spec.json",
"karmaConfig": "src/karma.conf.js"
}
}
```

6.  **lint**:

    - Contains settings for linting the application code, specifying linting rules and configuration files.

    - **Example**:

```typescript
"lint": {
"options": {
"tsConfig": [
"src/tsconfig.app.json",
"src/tsconfig.spec.json"
],
"exclude": [
"**/node_modules/**"
]
}
}
```

7.  **defaultProject**:

    - Specifies the default project to use when running Angular CLI commands without specifying a project name.

    - **Example**:

```typescript
"defaultProject": "my-app"
```

### Summary

- **angular.json** is a critical configuration file for Angular projects managed by the Angular CLI.

- It defines settings for building, serving, testing, and linting Angular applications and libraries.

- The file includes sections for configuring different projects within a workspace, handling assets, specifying build options, and setting up the development server.

Understanding and configuring angular.json helps tailor the Angular CLI to fit the specific needs of your project, optimizing the build and development process.

## How do you dynamically load components in Angular?

Dynamically loading components in Angular allows you to load components at runtime rather than at compile-time. This is useful for scenarios where you need to load components based on user interactions, conditions, or other runtime criteria. Here’s how you can dynamically load components in Angular:

### **1. Using** ComponentFactoryResolver

The ComponentFactoryResolver service provides a way to create and inject components dynamically. This approach is suitable for loading components at runtime based on conditions or user interactions.

#### **Steps**

1.  **Create a Directive to Mark the Insertion Point**: Define a directive that acts as a placeholder for the dynamically loaded component.

```typescript
**Directive (dynamic-host.directive.ts)**:
import { Directive, ViewContainerRef } from '@angular/core';
@Directive({
selector: '[appDynamicHost]'
})
export class DynamicHostDirective {
constructor(public viewContainerRef: ViewContainerRef) { }
}
```

- **ViewContainerRef** provides access to the container where the component will be inserted.

2.  **Create a Component to Load Dynamically**: Define the component that you want to load dynamically.

```typescript
**Dynamic Component (dynamic.component.ts)**:
import { Component } from '@angular/core';
@Component({
selector: 'app-dynamic',
template: `<p>Dynamic Component Loaded!</p>`
})
export class DynamicComponent { }
```

3.  **Inject the Component Dynamically**: Use ComponentFactoryResolver to create and insert the component into the view.

```typescript
**Host Component (host.component.ts)**:
import { Component, OnInit, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { DynamicHostDirective } from './dynamic-host.directive';
import { DynamicComponent } from './dynamic.component';
@Component({
selector: 'app-host',
template: `
<ng-template appDynamicHost></ng-template>
<button (click)="loadComponent()">Load Component</button>
`
})
export class HostComponent implements OnInit {
@ViewChild(DynamicHostDirective, { static: true }) dynamicHost: DynamicHostDirective;
constructor(private componentFactoryResolver: ComponentFactoryResolver) { }
ngOnInit() { }
loadComponent() {
const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DynamicComponent);
const viewContainerRef = this.dynamicHost.viewContainerRef;
viewContainerRef.clear(); // Clear any existing components
viewContainerRef.createComponent(componentFactory);
}
}
```

- **ComponentFactoryResolver** is used to get a factory for the component you want to create.

- **ViewContainerRef** is used to insert the new component into the view.

### **2. Using Angular Elements**

Angular Elements allow you to create Angular components as custom elements (web components) that can be used in any HTML page or framework.

#### **Steps**

1.  **Create an Angular Element**: Convert an Angular component into a custom element.

```typescript
**Angular Element Component (angular-element.component.ts)**:
import { Component, Input, Inject } from '@angular/core';
@Component({
selector: 'app-angular-element',
template: `<p>{{ message }}</p>`
})
export class AngularElementComponent {
@Input() message: string;
}
```

2.  **Register the Component as a Custom Element**: Register the component with the Angular Elements API.

```typescript
**Module (app.module.ts)**:
import { NgModule, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AngularElementComponent } from './angular-element.component';
import { createCustomElement } from '@angular/elements';
@NgModule({
declarations: [
AppComponent,
AngularElementComponent
],
imports: [
BrowserModule
],
entryComponents: [AngularElementComponent],
providers: [],
bootstrap: [AppComponent]
})
export class AppModule {
constructor(private injector: Injector) {
const angularElement = createCustomElement(AngularElementComponent, { injector });
customElements.define('app-angular-element', angularElement);
}
ngDoBootstrap() {}
}
```

- **createCustomElement** creates a custom element from the Angular component.

- **customElements.define** registers the custom element with the browser.

3.  **Use the Custom Element**: Use the custom element in any HTML file or other frameworks.

```typescript
**HTML Usage**:
<app-angular-element message="Hello from Angular Element!"></app-angular-element>
```

### **Summary**

- **ComponentFactoryResolver**: Use this service to dynamically load Angular components into the DOM based on user interactions or conditions.

- **Angular Elements**: Convert Angular components into custom elements (web components) that can be used outside Angular applications or in different frameworks.

Both methods allow for flexible and dynamic component loading, enhancing the capabilities and modularity of Angular applications.

## Explain ComponentFactoryResolver and ViewContainerRef.

**ComponentFactoryResolver** and **ViewContainerRef** are two important services in Angular that facilitate dynamic component loading. They are used together to create and insert components at runtime, which is useful for scenarios where components need to be added or removed based on user interactions or other conditions.

### **ComponentFactoryResolver**

**ComponentFactoryResolver** is a service that provides a way to create a component factory. This factory can then be used to create instances of components dynamically.

#### **Key Points**

1.  **Purpose**:

    - To obtain a factory for a specific component class. This factory is used to create instances of the component.

2.  **Usage**:

    - **resolveComponentFactory**: This method is called to get the factory for a specific component.

#### **Example**

**Dynamic Component (dynamic.component.ts)**:

```typescript
import { Component } from '@angular/core';
@Component({
selector: 'app-dynamic',
template: `<p>Dynamic Component Loaded!</p>`
})
export class DynamicComponent { }
```

**Host Component (host.component.ts)**:

```typescript
import { Component, ComponentFactoryResolver, ViewChild } from '@angular/core';
import { DynamicHostDirective } from './dynamic-host.directive';
import { DynamicComponent } from './dynamic.component';
@Component({
selector: 'app-host',
template: `
<ng-template appDynamicHost></ng-template>
<button (click)="loadComponent()">Load Component</button>
```

`

```typescript
})
export class HostComponent {
@ViewChild(DynamicHostDirective, { static: true }) dynamicHost: DynamicHostDirective;
constructor(private componentFactoryResolver: ComponentFactoryResolver) { }
loadComponent() {
const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DynamicComponent);
const viewContainerRef = this.dynamicHost.viewContainerRef;
viewContainerRef.clear(); // Clear any existing components
viewContainerRef.createComponent(componentFactory);
}
}
```

In this example:

- **resolveComponentFactory**: Used to get a factory for the DynamicComponent.

- **createComponent**: Creates an instance of DynamicComponent using the factory.

### **ViewContainerRef**

**ViewContainerRef** is a service that provides access to the view container, which is where dynamic components are inserted. It represents a container where views or components can be added, removed, or manipulated.

#### **Key Points**

1.  **Purpose**:

    - To manage a container where views (or components) are inserted dynamically.

2.  **Usage**:

    - **createComponent**: Creates a component and inserts it into the view container.

    - **clear**: Removes all views (or components) from the container.

    - **insert**: Adds a view to the container at a specified index.

#### **Example**

**Directive (dynamic-host.directive.ts)**:

```typescript
import { Directive, ViewContainerRef } from '@angular/core';
@Directive({
selector: '[appDynamicHost]'
})
export class DynamicHostDirective {
constructor(public viewContainerRef: ViewContainerRef) { }
}
```

In this example:

- **ViewContainerRef** is injected into the directive, which will be used as a placeholder for dynamically loaded components.

**Host Component (host.component.ts)**:

```typescript
import { Component, ViewChild } from '@angular/core';
import { DynamicHostDirective } from './dynamic-host.directive';
import { DynamicComponent } from './dynamic.component';
@Component({
selector: 'app-host',
template: `
<ng-template appDynamicHost></ng-template>
<button (click)="loadComponent()">Load Component</button>
```

`

```typescript
})
export class HostComponent {
@ViewChild(DynamicHostDirective, { static: true }) dynamicHost: DynamicHostDirective;
loadComponent() {
const viewContainerRef = this.dynamicHost.viewContainerRef;
viewContainerRef.clear(); // Clear any existing components
const componentFactory = this.componentFactoryResolver.resolveComponentFactory(DynamicComponent);
viewContainerRef.createComponent(componentFactory);
}
}
```

In this example:

- **viewContainerRef.createComponent**: Creates and inserts DynamicComponent into the view container defined by appDynamicHost.

### **Summary**

- **ComponentFactoryResolver**:

  - Provides a way to obtain a factory for a component class.

  - Use resolveComponentFactory to get the factory and createComponent to create an instance of the component.

- **ViewContainerRef**:

  - Represents a container where views or components can be dynamically added or removed.

  - Use createComponent, clear, and insert methods to manage components in the container.

Together, ComponentFactoryResolver and ViewContainerRef enable flexible and dynamic component management in Angular applications, making it possible to load and manipulate components based on runtime conditions.

## What are ViewEncapsulation options in Angular, and how do they affect styling?

In Angular, **ViewEncapsulation** is a mechanism used to control how styles are applied and scoped to components. It determines how the styles defined in a component affect its view and whether they influence other components or the global styles.

Angular provides four options for **ViewEncapsulation**:

### **1. Emulated**

**Emulated** is the default view encapsulation mode in Angular. It emulates the behavior of native Shadow DOM by adding scoped styles to components.

#### **How It Works**

- Angular generates unique attribute selectors for each component's styles.

- These unique attributes are added to the component's elements and styles, ensuring that the styles apply only to the component they belong to.

- This emulation helps prevent styles from leaking into other components or affecting global styles.

#### **Example**

**Component Styles (component.css)**:

```typescript
:host {
display: block;
background-color: lightblue;
}
```

**Component (component.ts)**:

```typescript
import { Component, ViewEncapsulation } from '@angular/core';
@Component({
selector: 'app-example',
template: `<p>Emulated View Encapsulation Example</p>`,
styleUrls: ['./component.css'],
```

encapsulation: ViewEncapsulation.Emulated

```typescript
})
export class ExampleComponent { }
```

In this mode, Angular's style encapsulation ensures that styles defined in component.css apply only to ExampleComponent, not affecting other components or the global styles.

### **2. ShadowDom**

**ShadowDom** uses the native Shadow DOM to encapsulate styles. It leverages the browser's Shadow DOM capabilities to create a real shadow tree.

#### **How It Works**

- Angular applies styles directly into the shadow root of the component's DOM.

- This results in true style encapsulation where styles do not bleed into or from other components.

- This mode is supported only in browsers that implement native Shadow DOM.

#### **Example**

**Component (component.ts)**:

```typescript
import { Component, ViewEncapsulation } from '@angular/core';
@Component({
selector: 'app-example',
template: `<p>Shadow DOM View Encapsulation Example</p>`,
styleUrls: ['./component.css'],
```

encapsulation: ViewEncapsulation.ShadowDom

```typescript
})
export class ExampleComponent { }
```

**Component Styles (component.css)**:

```typescript
p {
color: green;
}
```

In this mode, component.css styles are scoped to the shadow root, and styles defined elsewhere will not affect or be affected by these styles.

### **3. None**

**None** does not provide any encapsulation. It means that styles defined in the component's style files are global and can affect other components and the entire application.

#### **How It Works**

- The component’s styles are added to the global stylesheet.

- Styles can potentially conflict with other components or styles in the application.

#### **Example**

**Component (component.ts)**:

```typescript
import { Component, ViewEncapsulation } from '@angular/core';
@Component({
selector: 'app-example',
template: `<p>None View Encapsulation Example</p>`,
styleUrls: ['./component.css'],
```

encapsulation: ViewEncapsulation.None

```typescript
})
export class ExampleComponent { }
```

**Component Styles (component.css)**:

```typescript
p {
color: red;
}
```

In this mode, component.css styles will apply globally, affecting other components and potentially causing style conflicts.

### **4. ShadowDom with** ::ng-deep

While not an encapsulation mode per se, **::ng-deep** (deprecated and to be avoided) is used to apply styles to child components or styles that penetrate the encapsulation. It allows you to style child components from the parent component's styles.

#### **How It Works**

- **::ng-deep** can be used to apply styles to deeply nested components or to override encapsulated styles.

#### **Example**

**Parent Component (parent.component.css)**:

```typescript
::ng-deep .child-class {
color: blue;
}
```

**Child Component (child.component.css)**:

```typescript
.child-class {
color: red;
}
```

In this example, using ::ng-deep ensures that .child-class in the child component is styled with color: blue even though styles are encapsulated.

### **Summary**

- **ViewEncapsulation.Emulated** (default): Styles are scoped to the component using attribute selectors, preventing them from affecting other components or global styles.

- **ViewEncapsulation.ShadowDom**: Uses native Shadow DOM to encapsulate styles, ensuring true encapsulation.

- **ViewEncapsulation.None**: Styles are global and affect the entire application, leading to potential conflicts.

- **::ng-deep** (deprecated): Allows styles to penetrate encapsulated components, though its usage is discouraged.

Choosing the appropriate ViewEncapsulation mode depends on your specific use case and whether you need to ensure strict style encapsulation or prefer global styling.
