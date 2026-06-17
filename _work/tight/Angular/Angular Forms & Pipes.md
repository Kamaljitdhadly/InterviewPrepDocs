# Angular Forms & Pipes

## Questions Covered

1. What are the two types of forms in Angular? Explain Reactive Forms and Template-driven Forms.
2. How do you validate forms in Angular?
3. Explain how you can handle form submission and error handling in Angular.
4. What are pipes in Angular, and what are they used for?
5. How do you create a custom pipe?
6. Explain the difference between a pure and impure pipe.
7. How does the async pipe work in Angular?

## What are the two types of forms in Angular? Explain Reactive Forms and Template-driven Forms.

Angular offers two approaches for managing user input: **Template-driven Forms** and **Reactive Forms**. Both handle input, validation, and submission, but differ in how they're built and managed.

**Template-driven Forms** keep most logic in the HTML template, using directives like `ngModel`. They're simple, declarative, and best for small, less complex forms.

Key traits: form structure lives in the template; `[(ngModel)]` provides two-way data binding; validation comes from directives (`required`, `minlength`, `maxlength`); Angular creates `FormControl` instances automatically.

```html
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

```typescript
export class AppComponent {
  user = { name: '' };
  onSubmit(form: any): void {
    console.log('Form Submitted!', form.value);
  }
}
```

**Reactive Forms** (model-driven) are built around the `FormControl`, `FormGroup`, and `FormArray` classes, with structure and validation defined programmatically in the component class. They're more flexible, scalable, synchronously validated, and best for large, dynamic, or complex forms.

```html
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

The form binds to a `FormGroup` via `[formGroup]`, and `formControlName` links each input to its control.

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

**Comparison:**

| Feature | Template-driven | Reactive |
|---------|-----------------|----------|
| Form creation | In template via directives | Programmatically in component |
| Two-way binding | Yes (`ngModel`) | No (component → view) |
| Validation | Directives in template | Synchronous, in component |
| Control creation | Automatic | Explicit via `FormControl` |
| Best for | Simple, small forms | Complex, large, dynamic forms |
| Dynamic forms | Not well-suited | Excellent |
| Testing | Harder to unit test | Easier to unit test |

Use **template-driven** for simple forms with little dynamic behavior, and **reactive** for complex forms with dynamic controls and custom validation. You can even mix both in one app.

## How do you validate forms in Angular?

Validation works in both form types, with slightly different control.

**Template-driven validation** relies on built-in directives. Add HTML5 attributes (`required`, `minlength`, `maxlength`, `pattern`, `email`) and Angular tracks validity automatically, applying state classes (`ng-valid`, `ng-invalid`, `ng-touched`, etc.).

```html
<form #userForm="ngForm" (ngSubmit)="onSubmit(userForm)">
  <label for="name">Name:</label>
  <input type="text" id="name" name="name" [(ngModel)]="user.name" required minlength="3">
  <div *ngIf="userForm.controls.name?.invalid && userForm.controls.name?.touched">
    <small *ngIf="userForm.controls.name?.errors?.required">Name is required.</small>
    <small *ngIf="userForm.controls.name?.errors?.minlength">Name must be at least 3 characters long.</small>
  </div>

  <label for="email">Email:</label>
  <input type="email" id="email" name="email" [(ngModel)]="user.email" required email>
  <div *ngIf="userForm.controls.email?.invalid && userForm.controls.email?.touched">
    <small *ngIf="userForm.controls.email?.errors?.required">Email is required.</small>
    <small *ngIf="userForm.controls.email?.errors?.email">Invalid email format.</small>
  </div>
  <button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

Error messages display conditionally based on `invalid` and `touched`.

**Reactive validation** defines all rules in the component class, giving more control for complex forms. Create a `FormGroup` with `FormControl`s, attach built-in validators (`Validators.required`, `Validators.minLength`, `Validators.email`), and conditionally show messages in the template.

```typescript
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({ selector: 'app-reactive-form', templateUrl: './reactive-form.component.html' })
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

```html
<form [formGroup]="userForm" (ngSubmit)="onSubmit()">
  <label for="name">Name:</label>
  <input id="name" type="text" formControlName="name">
  <div *ngIf="userForm.controls.name.invalid && userForm.controls.name.touched">
    <small *ngIf="userForm.controls.name.errors?.required">Name is required.</small>
    <small *ngIf="userForm.controls.name.errors?.minlength">Name must be at least 3 characters long.</small>
  </div>

  <label for="email">Email:</label>
  <input id="email" type="email" formControlName="email">
  <div *ngIf="userForm.controls.email.invalid && userForm.controls.email.touched">
    <small *ngIf="userForm.controls.email.errors?.required">Email is required.</small>
    <small *ngIf="userForm.controls.email.errors?.email">Invalid email format.</small>
  </div>
  <button type="submit" [disabled]="userForm.invalid">Submit</button>
</form>
```

**Custom validators** cover cases the built-in ones don't. This one rejects values matching a forbidden pattern:

```typescript
import { AbstractControl, ValidatorFn } from '@angular/forms';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  };
}
```

```typescript
this.userForm = new FormGroup({
  name: new FormControl('', [Validators.required, forbiddenNameValidator(/angular/i)]),
});
```

**State classes** Angular attaches for styling: `ng-valid` / `ng-invalid` (validity), `ng-touched` (blurred), `ng-dirty` (value changed). Bind them for visual feedback:

```html
<input id="name" type="text" formControlName="name" [class.is-invalid]="userForm.controls.name.invalid && userForm.controls.name.touched">
```

**Comparison:**

| Feature | Template-driven | Reactive |
|---------|-----------------|----------|
| Form creation | Template with `ngModel` | Component with `FormGroup` |
| Validation setup | HTML attributes | `Validators` in component |
| Control | Auto-created via `ngModel` | Explicit `FormControl` |
| Custom validation | Harder | Easy to integrate |
| Best for | Simple forms | Complex, dynamic forms |

Both support built-in and custom validators, and validation state is easily reflected in the UI.

## Explain how you can handle form submission and error handling in Angular.

**Form submission with Reactive Forms** — import `ReactiveFormsModule`, build a `FormGroup` (e.g., with `FormBuilder`), bind it via `[formGroup]`, and handle submit:

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({ selector: 'app-my-form', templateUrl: './my-form.component.html' })
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
      console.log(this.myForm.value); // send data to a server
    } else {
      console.log('Form is invalid');
    }
  }
}
```

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <label for="name">Name:</label>
  <input id="name" formControlName="name">
  <label for="email">Email:</label>
  <input id="email" formControlName="email">
  <button type="submit">Submit</button>
</form>
```

**Form submission with Template-driven Forms** — import `FormsModule`, bind controls with `ngModel`, and handle submit in the component:

```typescript
import { Component } from '@angular/core';

@Component({ selector: 'app-my-form', templateUrl: './my-form.component.html' })
export class MyFormComponent {
  onSubmit(form: any): void {
    if (form.valid) {
      console.log(form.value);
    } else {
      console.log('Form is invalid');
    }
  }
}
```

```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
  <label for="name">Name:</label>
  <input id="name" name="name" ngModel required>
  <label for="email">Email:</label>
  <input id="email" name="email" ngModel required email>
  <button type="submit">Submit</button>
</form>
```

**Validation error handling** — show messages conditionally based on control state.

Reactive:

```html
<form [formGroup]="myForm" (ngSubmit)="onSubmit()">
  <input id="name" formControlName="name">
  <div *ngIf="myForm.get('name').invalid && (myForm.get('name').dirty || myForm.get('name').touched)">
    <div *ngIf="myForm.get('name').errors.required">Name is required.</div>
  </div>
  <input id="email" formControlName="email">
  <div *ngIf="myForm.get('email').invalid && (myForm.get('email').dirty || myForm.get('email').touched)">
    <div *ngIf="myForm.get('email').errors.required">Email is required.</div>
    <div *ngIf="myForm.get('email').errors.email">Enter a valid email.</div>
  </div>
  <button type="submit">Submit</button>
</form>
```

Template-driven (using `#name="ngModel"` references):

```html
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
  <input id="name" name="name" ngModel required #name="ngModel">
  <div *ngIf="name.invalid && (name.dirty || name.touched)">
    <div *ngIf="name.errors.required">Name is required.</div>
  </div>
  <input id="email" name="email" ngModel required email #email="ngModel">
  <div *ngIf="email.invalid && (email.dirty || email.touched)">
    <div *ngIf="email.errors.required">Email is required.</div>
    <div *ngIf="email.errors.email">Enter a valid email.</div>
  </div>
  <button type="submit">Submit</button>
</form>
```

**Server-side error handling** — catch errors from HTTP responses in a service with `catchError`, and handle the `error` callback when subscribing:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private http: HttpClient) {}
  submitForm(data: any) {
    return this.http.post('/api/submit', data).pipe(
      catchError(error => {
        console.error('Error occurred:', error);
        return throwError(() => new Error('Server error'));
      })
    );
  }
}
```

```typescript
import { Component } from '@angular/core';
import { MyService } from './my-service.service';

@Component({ selector: 'app-my-form', templateUrl: './my-form.component.html' })
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

In short, handle submission via reactive or template-driven forms, give validation feedback in the template, and process server errors with RxJS operators.

## What are pipes in Angular, and what are they used for?

**Pipes** transform data directly in templates for display — formatting, filtering, or sorting — keeping component logic clean. They use the pipe operator (`|`):

```html
{{ today | date:'shortDate' }}
```

**Built-in pipes** cover common transformations:

```html
{{ birthday | date:'longDate' }}
{{ amount | currency:'USD' }}
{{ pi | number:'1.2-2' }}
{{ fraction | percent }}
{{ user | json }}
```

`DatePipe` formats dates, `CurrencyPipe` formats currency, `DecimalPipe` (`number`) controls decimal places, `PercentPipe` formats percentages, and `JsonPipe` serializes objects.

**Custom pipes** handle transformations the built-ins don't. Generate with `ng generate pipe my-custom`, then implement `transform`:

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'myCustom' })
export class MyCustomPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    return value.toUpperCase();
  }
}
```

```html
{{ 'hello world' | myCustom }}
```

**Pure vs. impure:** pipes are **pure** by default — they run only when the input changes, making them efficient. An **impure** pipe runs on every change-detection cycle; enable it with `pure: false`:

```typescript
@Pipe({ name: 'myCustom', pure: false })
```

Common use cases: formatting dates/numbers/currency, filtering subsets, sorting, and otherwise transforming data before display.

## How do you create a custom pipe?

**1. Generate it** with the CLI (creates the pipe class and a spec file, and registers it in the module):

```bash
ng generate pipe myCustom
# or: ng g pipe myCustom
```

**2. Implement** the `transform` method in `my-custom.pipe.ts`:

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'myCustom' })
export class MyCustomPipe implements PipeTransform {
  transform(value: string, ...args: any[]): string {
    return value.toUpperCase();
  }
}
```

**3. Register it** in a module's `declarations` (the CLI usually does this):

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MyCustomPipe } from './my-custom.pipe';

@NgModule({
  declarations: [AppComponent, MyCustomPipe],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

**4. Use it** in a template with the `|` operator:

```html
<p>{{ 'hello world' | myCustom }}</p>
```

**Arguments** — pipes can accept extra parameters via the `transform` signature:

```typescript
transform(value: string, uppercase: boolean): string {
  return uppercase ? value.toUpperCase() : value.toLowerCase();
}
```

```html
<p>{{ 'hello world' | myCustom:true }}</p>
```

**Pure vs. impure** — pipes are pure by default (run only on input change); set `pure: false` to run on every change-detection cycle:

```typescript
@Pipe({ name: 'myCustom', pure: false })
```

## Explain the difference between a pure and impure pipe.

**Pure pipes** execute only when their input value changes (Angular checks for changes during change detection). They're the default — no extra configuration needed — and are efficient since they avoid unnecessary recalculation. Ideal when the transformation depends solely on the input.

```typescript
@Pipe({ name: 'purePipe' })
export class PurePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

**Impure pipes** execute on every change-detection cycle, regardless of whether the input changed. Set `pure: false` to enable. They can hurt performance if the logic is heavy or the pipe runs often, but they're useful when the transformation depends on external factors or side effects not tied to the input.

```typescript
@Pipe({ name: 'impurePipe', pure: false })
export class ImpurePipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}
```

**Summary:** pure pipes run on input change and are more performant (best for simple, input-only transformations); impure pipes run on every cycle (best when transformation reacts to external state).

## How does the async pipe work in Angular?

The **`async` pipe** handles asynchronous data — observables and promises — directly in templates. It subscribes when the template renders, updates the view as new values arrive, and **automatically unsubscribes** when the component is destroyed, preventing memory leaks. It also triggers change detection on each emission and removes boilerplate subscription code.

**With observables:**

```typescript
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Component({ selector: 'app-async-example', templateUrl: './async-example.component.html' })
export class AsyncExampleComponent implements OnInit {
  data$: Observable<string>;
  ngOnInit(): void {
    this.data$ = of('Hello, world!').pipe(delay(2000));
  }
}
```

```html
<p>{{ data$ | async }}</p>
```

**With promises:**

```typescript
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-async-example', templateUrl: './async-example.component.html' })
export class AsyncExampleComponent implements OnInit {
  promise: Promise<string>;
  ngOnInit(): void {
    this.promise = new Promise((resolve) => {
      setTimeout(() => resolve('Hello, world!'), 2000);
    });
  }
}
```

```html
<p>{{ promise | async }}</p>
```

In short, the `async` pipe subscribes, updates the view, and cleans up automatically — keeping code cleaner and free from manual subscription management.
