# Angular Forms & Pipes

## Questions Covered

1. What are the two types of forms in Angular? Explain Reactive Forms and Template-driven Forms.
2. How do you validate forms in Angular?
3. Explain custom validators.
4. Explain how you can handle form submission and error handling in Angular.
5. What are pipes in Angular, and what are they used for?
6. How do you create a custom pipe?
7. Explain the difference between a pure and impure pipe.
8. How does the async pipe work in Angular?

## What are the two types of forms in Angular? Explain Reactive Forms and Template-driven Forms.

In Angular, there are two main types of forms for managing user inputs: **Reactive Forms** and **Template-driven Forms**. Both approaches are used to handle form inputs, validation, and submission, but they differ in how they are built and managed.

### 1. Template-driven Forms

Template-driven forms rely heavily on Angular's directives within the template (HTML), where most of the logic resides. The form controls and validations are defined using standard HTML input elements and Angular directives like ngModel. This approach is simple and declarative, and it suits smaller forms or less complex scenarios.

### Key Features of Template-driven Forms

- **Simple and Declarative**: Form structure is mainly defined in the HTML template.

- **Two-way Data Binding**: Uses the [(ngModel)] directive for two-way data binding between the component and the view.

- **Validation via Directives**: Angular directives (required, minlength, maxlength, etc.) are used for form validation.

- **Automatic Creation of FormControl Instances**: Angular automatically creates FormControl instances under the hood based on the ngModel directive.

- **Best for Small Forms**: Ideal for smaller, simple forms with limited interactivity.

### Example of Template-driven Form

```typescript
<form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)">
<label for="name">Name:</label>
<input type="text" id="name" name="name" [(ngModel)]="user.name" required minlength="3">
<div *ngIf="userForm.controls.name?.invalid && userForm.controls.name?.touched">
<small *ngIf="userForm.controls.name?.errors?.required">Name is required.</small>
<small *ngIf="userForm.controls.name?.errors?.minlength">Name must be at least 3 characters long.</small>
</div>
<button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

In this example:

- [(ngModel)] binds the form input to the user.name property in the component.

- Angular automatically creates form control objects for each input field and performs validation based on the HTML attributes like required and minlength.

### Component Class (Template-driven Form)

```typescript
export class AppComponent {
user = { name: '' };
onSubmit(form: any): void {
console.log('Form Submitted!', form.value);
}
}
```

### 2. Reactive Forms

Reactive Forms (also called Model-driven Forms) are built around the **FormControl**, **FormGroup**, and **FormArray** classes in Angular. The form logic and validation are defined in the component class, giving you greater control and flexibility. The form is defined in a programmatic way using Angular's reactive API.

### Key Features of Reactive Forms

- **Programmatic and Explicit**: Form structure and logic are defined in the component class rather than in the template.

- **More Flexible and Scalable**: Suited for complex forms with dynamic form fields and more complex validation logic.

- **FormControl Instances Explicitly Created**: You define form controls, form groups, and form arrays explicitly in the component class.

- **Synchronous and Predictable Validation**: Reactive forms offer more precise control over validations, which are handled synchronously.

- **Best for Large and Complex Forms**: Ideal for large forms or when you need dynamic form manipulation.

### Example of Reactive Form

```typescript
<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
<label for="name">Name:</label>
<input type="text" id="name" formControlName="name">
<div *ngIf="userForm.controls.name.invalid && userForm.controls.name.touched">
<small *ngIf="userForm.controls.name.errors?.required">Name is required.</small>
<small *ngIf="userForm.controls.name.errors?.minlength">Name must be at least 3 characters long.</small>
</div>
<button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

In this example:

- The form is bound to a FormGroup instance using [formGroup] directive.

- formControlName is used to bind individual controls to their corresponding form control in the component class.

### Component Class (Reactive Form)

```typescript
import { FormGroup, FormControl, Validators } from '@angular/forms';
export class AppComponent {
userForm = new FormGroup({
name: new FormControl('', [Validators.required, Validators.minLength(3)])
});
onSubmit(): void {
if (this.userForm.valid) {
console.log('Form Submitted!', this.userForm.value);
}
}
}
```

- The form is created programmatically using the FormGroup and FormControl classes.

- Validation rules are applied directly within the component (Validators.required, Validators.minLength(3)).

### Comparison: Template-driven Forms vs. Reactive Forms

| **Feature** | **Template-driven Forms** | **Reactive Forms** |
|----|----|----|
| **Form Creation** | Mostly in the template using directives | Programmatically in the component |
| **Two-way Data Binding** | Yes (ngModel) | No (data flows from component to view) |
| **Validation** | Via directives in the template | Synchronous, defined in the component |
| **Form Control Creation** | Automatically created by Angular | Explicitly created using FormControl |
| **Best for** | Simple, small forms | Complex, large, and dynamic forms |
| **Dynamic Forms** | Not very suitable | Great for dynamic form fields |
| **Data Handling** | Implicit (via two-way binding) | Explicit (more control and tracking) |
| **Form Testing** | Harder to unit test | Easier to unit test due to component control |

### When to Use Each Approach

- **Template-driven forms** are best for simple, small forms where you don’t need much dynamic behavior or custom validations.

- **Reactive forms** are better suited for complex forms with dynamic form control creation, custom validators, and more complex validation logic.

Both approaches are powerful in their own right and can be used depending on the complexity of the form and the level of control you need. Angular allows you to choose either or even mix both approaches within the same application.

## How do you validate forms in Angular?

In Angular, form validation can be implemented in two primary ways: using **template-driven forms** or **reactive forms**. Both approaches offer validation capabilities, but the process and control differ slightly between the two.

### Form Validation in Angular

1.  **Template-driven Form Validation** (using Angular directives in templates)

2.  **Reactive Form Validation** (using Angular’s FormControl and FormGroup in the component class)

Let’s explore both in detail.

### 1. Template-driven Form Validation

Template-driven forms rely on Angular's built-in directives for validation. Most of the logic is in the template, and Angular automatically tracks the validity of form controls.

### How to Implement Validation

- Use HTML5 attributes like required, minlength, maxlength, pattern, etc., in the form controls.

- Use Angular's directives like ngModel, ngForm, ngModelGroup, and template variables to manage the form’s state and validations.

- Angular automatically sets the classes (ng-valid, ng-invalid, ng-touched, etc.) based on the validation status.

### Example

```typescript
<form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)">
```

<!-- Name Field -->

```typescript
<label for="name">Name:</label>
<input type="text" id="name" name="name" [(ngModel)]="user.name" required minlength="3">
<div *ngIf="userForm.controls.name?.invalid && userForm.controls.name?.touched">
<small *ngIf="userForm.controls.name?.errors?.required">Name is required.</small>
<small *ngIf="userForm.controls.name?.errors?.minlength">Name must be at least 3 characters long.</small>
</div>
```

<!-- Email Field -->

```typescript
<label for="email">Email:</label>
<input type="email" id="email" name="email" [(ngModel)]="user.email" required email>
<div *ngIf="userForm.controls.email?.invalid && userForm.controls.email?.touched">
<small *ngIf="userForm.controls.email?.errors?.required">Email is required.</small>
<small *ngIf="userForm.controls.email?.errors?.email">Invalid email format.</small>
</div>
<button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

In this example:

- **Validation rules** are added via HTML attributes (required, minlength, email).

- **Error messages** are shown conditionally based on the validation state (using invalid and touched properties).

- Angular will automatically handle validation status based on user input.

### 2. Reactive Form Validation

Reactive form validation gives you more control and flexibility over your form logic, as all the validation rules are defined in the component class. This is more suitable for complex forms or scenarios where you need dynamic form control creation and custom validation logic.

### How to Implement Validation

- Create a FormGroup and define FormControl instances for each field.

- Attach built-in validators (like Validators.required, Validators.minLength, Validators.email, etc.) directly in the component class.

- Custom validators can be defined as functions and passed into the form controls.

- Validation messages can be conditionally shown in the template based on the form control state.

### Example

**Component Class**:

```typescript
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
selector: 'app-reactive-form',
templateUrl: './reactive-form.component.html'
})
export class ReactiveFormComponent {
userForm: FormGroup;
constructor() {
this.userForm = new FormGroup({
name: new FormControl('', [Validators.required, Validators.minLength(3)]),
email: new FormControl('', [Validators.required, Validators.email])
});
}
onSubmit() {
if (this.userForm.valid) {
console.log('Form submitted:', this.userForm.value);
}
}
}
```

**Template**:

```typescript
<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
```

<!-- Name Field -->

```typescript
<label for="name">Name:</label>
<input id="name" type="text" formControlName="name">
<div *ngIf="userForm.controls.name.invalid && userForm.controls.name.touched">
<small *ngIf="userForm.controls.name.errors?.required">Name is required.</small>
<small *ngIf="userForm.controls.name.errors?.minlength">Name must be at least 3 characters long.</small>
</div>
```

<!-- Email Field -->

```typescript
<label for="email">Email:</label>
<input id="email" type="email" formControlName="email">
<div *ngIf="userForm.controls.email.invalid && userForm.controls.email.touched">
<small *ngIf="userForm.controls.email.errors?.required">Email is required.</small>
<small *ngIf="userForm.controls.email.errors?.email">Invalid email format.</small>
</div>
<button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

In this example:

- **Validation logic** is defined inside the component class using Validators in the FormControl objects.

- **Error messages** are conditionally displayed in the template based on the validity of each form control.

- The form status (valid, invalid, touched, dirty) is tracked explicitly by the reactive form system.

### Custom Validators

Angular allows you to define custom validators if the built-in ones don't meet your requirements.

### Example of a Custom Validator

Here’s a custom validator that checks whether the input contains the word "Angular".

```typescript
import { AbstractControl, ValidatorFn } from '@angular/forms';
export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
return (control: AbstractControl): { [key: string]: any } | null => {
const forbidden = nameRe.test(control.value);
return forbidden ? { forbiddenName: { value: control.value } } : null;
};
}
```

**Using the Custom Validator**:

```typescript
this.userForm = new FormGroup({
name: new FormControl('', [Validators.required, forbiddenNameValidator(/angular/i)]),
});
```

### Displaying Validation States in Angular

Angular attaches CSS classes to form elements to help in styling based on form control states:

- **ng-valid**: The control is valid.

- **ng-invalid**: The control is invalid.

- **ng-touched**: The control has been visited (blurred).

- **ng-dirty**: The control has a changed value.

These classes can be used to visually indicate validation states to the user.

### Example with Conditional Classes

```typescript
<input id="name" type="text" formControlName="name" [class.is-invalid]="userForm.controls.name.invalid && userForm.controls.name.touched">
```

### Comparison Between Template-driven and Reactive Form Validation

| **Feature** | **Template-driven Forms** | **Reactive Forms** |
|----|----|----|
| **Form Creation** | Mainly in the template with directives like ngModel | Programmatically in the component with FormGroup |
| **Validation Setup** | Validation defined via HTML attributes (required) | Validation rules defined in the component (Validators) |
| **Form Control** | Automatically created based on ngModel directive | Explicitly created and managed using FormControl |
| **Custom Validation** | Harder to implement custom validation logic | Easily create and integrate custom validators |
| **Best for** | Simple forms with minimal logic | Complex forms with dynamic controls and advanced validation logic |

### Conclusion

Angular provides a comprehensive form validation system, with built-in support for both simple and complex scenarios. You can choose **template-driven forms** for simple, declarative form handling or go for **reactive forms** for more control, especially in complex scenarios. Both methods support built-in and custom validators, and the form’s validation state can be easily managed and reflected in the UI.

## Explain how you can handle form submission and error handling in Angular.

Handling form submission and error handling in Angular involves several steps. Here’s a comprehensive overview of how you can manage both in an Angular application:

### Form Submission

1.  **Reactive Forms**: Use Angular’s Reactive Forms module to manage form submissions in a structured way. Reactive forms provide more control and scalability compared to Template-driven forms.

```typescript
**Steps:**
```

- Import ReactiveFormsModule in your Angular module.

- Create a FormGroup in your component class and define form controls.

- Bind the FormGroup to your form in the template using [formGroup].

- Handle form submission by calling a method on form submit.

```typescript
**Example:**
// Import necessary modules
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
selector: 'app-my-form',
templateUrl: './my-form.component.html'
})
export class MyFormComponent {
myForm: FormGroup;
constructor(private fb: FormBuilder) {
this.myForm = this.fb.group({
name: ['', Validators.required],
email: ['', [Validators.required, Validators.email]]
});
}
onSubmit(): void {
if (this.myForm.valid) {
console.log(this.myForm.value);
// Handle form submission (e.g., send data to a server)
} else {
console.log('Form is invalid');
}
}
}
**Template:**
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
<label for="name">Name:</label>
<input id="name" formControlName="name">
<label for="email">Email:</label>
<input id="email" formControlName="email">
<button type="submit">Submit</button>
</form>
```

2.  **Template-Driven Forms**: Use Template-driven forms for simpler scenarios. They rely on Angular’s forms API to bind the form controls and handle validation.

```typescript
**Steps:**
```

- Import FormsModule in your Angular module.

- Define form controls in the template and bind them using ngModel.

- Handle form submission in the component.

```typescript
**Example:**
// Import necessary modules
import { Component } from '@angular/core';
@Component({
selector: 'app-my-form',
templateUrl: './my-form.component.html'
})
export class MyFormComponent {
onSubmit(form: any): void {
if (form.valid) {
console.log(form.value);
// Handle form submission
} else {
console.log('Form is invalid');
}
}
}
**Template:**
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
<label for="name">Name:</label>
<input id="name" name="name" ngModel required>
<label for="email">Email:</label>
<input id="email" name="email" ngModel required email>
<button type="submit">Submit</button>
</form>
```

### Error Handling

1.  **Validation Error Handling**: You can handle validation errors by using Angular’s built-in validators and displaying error messages conditionally.

```typescript
**Reactive Forms Example:**
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
<label for="name">Name:</label>
<input id="name" formControlName="name">
<div *ngIf="myForm.get('name').invalid && (myForm.get('name').dirty || myForm.get('name').touched)">
<div *ngIf="myForm.get('name').errors.required">Name is required.</div>
</div>
<label for="email">Email:</label>
<input id="email" formControlName="email">
<div *ngIf="myForm.get('email').invalid && (myForm.get('email').dirty || myForm.get('email').touched)">
<div *ngIf="myForm.get('email').errors.required">Email is required.</div>
<div *ngIf="myForm.get('email').errors.email">Enter a valid email.</div>
</div>
<button type="submit">Submit</button>
</form>
**Template-Driven Forms Example:**
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
<label for="name">Name:</label>
<input id="name" name="name" ngModel required #name="ngModel">
<div *ngIf="name.invalid && (name.dirty || name.touched)">
<div *ngIf="name.errors.required">Name is required.</div>
</div>
<label for="email">Email:</label>
<input id="email" name="email" ngModel required email #email="ngModel">
<div *ngIf="email.invalid && (email.dirty || email.touched)">
<div *ngIf="email.errors.required">Email is required.</div>
<div *ngIf="email.errors.email">Enter a valid email.</div>
</div>
<button type="submit">Submit</button>
</form>
```

2.  **Server-Side Error Handling**: Handle errors returned from a server (e.g., validation errors or server-side issues) by subscribing to HTTP responses in your service.

```typescript
**Service Example:**
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
@Injectable({
providedIn: 'root'
})
export class MyService {
constructor(private http: HttpClient) {}
submitForm(data: any) {
return this.http.post('/api/submit', data)
.pipe(
catchError(error => {
console.error('Error occurred:', error);
return throwError(() => new Error('Server error'));
})
);
}
}
**Component Example:**
import { Component } from '@angular/core';
import { MyService } from './my-service.service';
@Component({
selector: 'app-my-form',
templateUrl: './my-form.component.html'
})
export class MyFormComponent {
constructor(private myService: MyService) {}
onSubmit(form: any): void {
if (form.valid) {
this.myService.submitForm(form.value).subscribe({
next: (response) => console.log('Success:', response),
error: (error) => console.error('Error:', error)
});
}
}
}
```

In summary, managing form submission and error handling in Angular involves using reactive or template-driven forms, providing appropriate validation feedback, and handling server-side errors effectively.

## What are pipes in Angular, and what are they used for?

In Angular, pipes are a powerful feature used to transform data in your templates. They allow you to format and manipulate data before it is displayed to the user. Pipes are used within Angular templates to display data in a specific format or to filter and sort data.

### Key Aspects of Pipes

1.  **Transformation**: Pipes can transform data by converting it into a different format. For example, you might use a pipe to format a date, currency, or percentage.

2.  **Declarative Syntax**: Pipes are used in Angular templates with a simple and intuitive syntax. They are applied using the pipe operator (|).

```typescript
**Example:**
{{ today | date:'shortDate' }}
In this example, the date pipe is used to format the today variable to a short date format.
```

3.  **Built-in Pipes**: Angular provides several built-in pipes for common transformations:

    - **DatePipe**: Formats dates.

```typescript
{{ birthday | date:'longDate' }}
```

- **CurrencyPipe**: Formats numbers as currency.

```typescript
{{ amount | currency:'USD' }}
```

- **DecimalPipe**: Formats numbers with a specified number of decimal places.

```typescript
{{ pi | number:'1.2-2' }}
```

- **PercentPipe**: Formats numbers as percentages.

```typescript
{{ fraction | percent }}
```

- **JsonPipe**: Converts an object to a JSON string.

```typescript
{{ user | json }}
```

4.  **Custom Pipes**: You can create your own pipes to handle specific data transformations that are not covered by built-in pipes.

```typescript
**Creating a Custom Pipe:**
```

1.  **Generate the Pipe**: Use Angular CLI to generate a new pipe.

```typescript
ng generate pipe my-custom
```

2.  **Implement the Pipe**: Define the logic in the generated pipe class.

```typescript
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
name: 'myCustom'
})
export class MyCustomPipe implements PipeTransform {
transform(value: string, ...args: any[]): string {
// Custom transformation logic
return value.toUpperCase(); // Example: Converts text to uppercase
}
}
```

3.  **Use the Pipe**: Apply your custom pipe in a template.

```typescript
{{ 'hello world' | myCustom }}
```

1.  **Pure vs. Impure Pipes**:

    - **Pure Pipes**: By default, pipes are pure. They only execute when the input data changes. This makes them efficient for performance.

    - **Impure Pipes**: An impure pipe runs on every change detection cycle, even if the input data hasn't changed. You can create an impure pipe by setting the pure property to false in the @Pipe decorator.

```typescript
@Pipe({
name: 'myCustom',
pure: false
})
```

### Use Cases for Pipes

- **Formatting Data**: Formatting dates, numbers, or currencies for better readability.

- **Filtering Data**: Displaying subsets of data based on certain criteria.

- **Sorting Data**: Ordering data according to specific rules.

- **Transforming Data**: Changing data formats or content before display.

Pipes make it easy to handle data transformations directly within Angular templates, keeping your component logic clean and focused on business logic.

## How do you create a custom pipe?

Creating a custom pipe in Angular involves several steps. Here’s a step-by-step guide to help you create your own custom pipe:

### Step 1: Generate the Pipe

Use Angular CLI to generate a new pipe. This will create the pipe class and update the appropriate module.

ng generate pipe myCustom

or

ng g pipe myCustom

### Step 2: Implement the Pipe

After generating the pipe, Angular CLI will create two files: my-custom.pipe.ts and my-custom.pipe.spec.ts (for testing). The primary file to edit is my-custom.pipe.ts.

Here’s a basic example of what the pipe file might look like:

```typescript
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
```

name: 'myCustom'

```typescript
})
export class MyCustomPipe implements PipeTransform {
transform(value: string, ...args: any[]): string {
// Custom transformation logic
return value.toUpperCase(); // Example: Converts text to uppercase
}
}
```

### Step 3: Register the Pipe

Ensure the pipe is declared in your module so Angular recognizes it. Open your module file (e.g., app.module.ts) and add the pipe to the declarations array.

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MyCustomPipe } from './my-custom.pipe'; // Import the pipe
@NgModule({
declarations: [
AppComponent,
```

MyCustomPipe // Declare the pipe

],

imports: [

BrowserModule

],

providers: [],

bootstrap: [AppComponent]

```typescript
})
export class AppModule { }
```

### Step 4: Use the Pipe in Templates

Once the pipe is created and declared, you can use it in your Angular templates. Apply the pipe using the pipe operator (|).

```typescript
<p>{{ 'hello world' | myCustom }}</p>
```

In this example, the myCustom pipe will transform 'hello world' to uppercase.

### Additional Considerations

1.  **Arguments**: Pipes can accept additional arguments. You can access these in the transform method via the args parameter.

```typescript
transform(value: string, uppercase: boolean): string {
return uppercase ? value.toUpperCase() : value.toLowerCase();
}
**Usage:**
<p>{{ 'hello world' | myCustom:true }}</p>
```

2.  **Pure vs. Impure Pipes**:

    - **Pure Pipes**: These are the default and are executed only when their input values change.

    - **Impure Pipes**: If you need the pipe to be executed on every change detection cycle, set pure: false in the @Pipe decorator.

```typescript
@Pipe({
name: 'myCustom',
pure: false
})
```

## Explain the difference between a pure and impure pipe.

In Angular, pipes are used to transform data in templates. Understanding the difference between pure and impure pipes is crucial for optimizing performance and ensuring that your application behaves as expected. Here's a breakdown of each type:

### Pure Pipes

- **Definition**: A pure pipe is one that only executes when its input values change. Angular determines if a pure pipe needs to be executed by checking whether the input data to the pipe has changed.

- **Characteristics**:

  - **Efficiency**: Pure pipes are more efficient because they are executed only when Angular detects changes to their input values. This is typically done through change detection cycles.

  - **Use Case**: Pure pipes are ideal for cases where the data transformation is based solely on the input data and does not depend on any external factors or side effects.

- **Implementation**: By default, pipes in Angular are pure. You don’t need to specify anything extra in the @Pipe decorator to make them pure.

```typescript
@Pipe({
name: 'purePipe'
})
export class PurePipe implements PipeTransform {
transform(value: string): string {
return value.toUpperCase(); // Example transformation
}
}
```

### Impure Pipes

- **Definition**: An impure pipe executes on every change detection cycle, regardless of whether its input values have changed. This means that the pipe runs frequently, even if the input data remains the same.

- **Characteristics**:

  - **Performance**: Impure pipes can have a performance impact if the transformation logic is complex or if the pipe is used frequently, as they are recalculated on every change detection cycle.

  - **Use Case**: Impure pipes are useful when the transformation depends on external factors or side effects that are not directly tied to the input data. For example, if the pipe relies on state changes outside its input parameters, it may need to be impure.

- **Implementation**: To make a pipe impure, set the pure property to false in the @Pipe decorator.

```typescript
@Pipe({
name: 'impurePipe',
pure: false // Mark the pipe as impure
})
export class ImpurePipe implements PipeTransform {
transform(value: string): string {
// Example transformation that might depend on external state
return value.toUpperCase(); // Example transformation
}
}
```

### Summary of Differences

- **Execution**:

  - **Pure Pipe**: Executes only when its input values change.

  - **Impure Pipe**: Executes on every change detection cycle, regardless of input value changes.

- **Performance**:

  - **Pure Pipe**: Generally more performant, as it reduces unnecessary calculations by relying on input value changes.

  - **Impure Pipe**: Potentially less performant due to frequent executions.

- **Use Cases**:

  - **Pure Pipe**: Best for simple data transformations that only rely on the input data.

  - **Impure Pipe**: Useful when the transformation depends on factors outside of the input values or when the transformation needs to react to external changes.

Understanding these differences helps you choose the right type of pipe based on your performance needs and the nature of the data transformation you’re implementing.

## How does the async pipe work in Angular?

The async pipe in Angular is a powerful tool for handling asynchronous data streams directly within Angular templates. It simplifies the process of subscribing to observables or promises and updating the view with the latest values. Here's a detailed look at how the async pipe works:

### How the async Pipe Works

1.  **Automatic Subscription**: The async pipe subscribes to an observable or promise when the template is rendered. It automatically manages the subscription and unsubscription process, ensuring that there are no memory leaks from lingering subscriptions.

2.  **Data Binding**: Once the observable or promise emits a new value, the async pipe updates the view with this new value. This makes it easy to work with dynamic data that changes over time.

3.  **Error Handling**: The async pipe handles errors from observables or promises and can also work with error handling in conjunction with other techniques.

### Usage

1.  **With Observables**:

```typescript
**Component:**
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
@Component({
selector: 'app-async-example',
templateUrl: './async-example.component.html'
})
export class AsyncExampleComponent implements OnInit {
data$: Observable<string>;
ngOnInit(): void {
this.data$ = of('Hello, world!').pipe(
delay(2000) // Simulate delay
);
}
}
**Template:**
<p>{{ data$ | async }}</p>
In this example, the data$ observable is subscribed to by the async pipe, and the emitted value is displayed in the template. The value is updated when the observable emits a new value.
```

2.  **With Promises**:

```typescript
**Component:**
import { Component, OnInit } from '@angular/core';
@Component({
selector: 'app-async-example',
templateUrl: './async-example.component.html'
})
export class AsyncExampleComponent implements OnInit {
promise: Promise<string>;
ngOnInit(): void {
this.promise = new Promise((resolve) => {
setTimeout(() => resolve('Hello, world!'), 2000);
});
}
}
**Template:**
<p>{{ promise | async }}</p>
In this example, the promise is handled by the async pipe, and the resolved value is displayed in the template once the promise is fulfilled.
```

### Key Features

1.  **Automatic Unsubscription**: The async pipe automatically unsubscribes from observables when the component is destroyed, which helps prevent memory leaks.

2.  **Change Detection**: The async pipe triggers Angular's change detection automatically whenever a new value is emitted by the observable or promise. This ensures that the view is always in sync with the latest data.

3.  **Simplified Code**: By using the async pipe, you avoid having to manually subscribe and unsubscribe from observables or promises in your component code, leading to cleaner and more maintainable code.

### Summary

The async pipe is a useful tool in Angular for working with asynchronous data. It simplifies the process of subscribing to observables or promises, updating the view with the latest values, and managing subscriptions. This reduces boilerplate code and helps ensure that your application remains efficient and free from memory leaks.
