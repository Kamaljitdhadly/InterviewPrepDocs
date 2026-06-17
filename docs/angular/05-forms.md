# Forms: Template-Driven vs Reactive

## Concept Explanation

Angular offers two approaches to forms:

- **Template-driven forms** — logic lives in the **template** using directives (`ngModel`, `ngForm`). Simple, declarative, good for small forms. Asynchronous model setup, harder to unit test.
- **Reactive forms** — the form model is defined in the **component class** (`FormControl`, `FormGroup`, `FormArray`). Explicit, synchronous, type-safe, easily testable, and better for complex/dynamic forms and validation.

Both track control **state**: `valid`/`invalid`, `touched`/`untouched`, `dirty`/`pristine`, and provide `valueChanges`/`statusChanges` observables.

## Code Example(s)

```html
<!-- Template-driven (needs FormsModule) -->
<form #f="ngForm" (ngSubmit)="save(f.value)">
  <input name="email" ngModel required email #email="ngModel" />
  <div *ngIf="email.invalid && email.touched">Invalid email</div>
  <button [disabled]="f.invalid">Save</button>
</form>
```

```typescript
// Reactive (needs ReactiveFormsModule)
import { FormBuilder, Validators } from '@angular/forms';

@Component({ /* ... */ })
export class SignupComponent {
  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(private fb: FormBuilder) {}

  save() {
    if (this.form.invalid) return;
    console.log(this.form.value);   // synchronously available, typed
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="save()">
  <input formControlName="email" />
  <input formControlName="password" type="password" />
  <button [disabled]="form.invalid">Sign up</button>
</form>
```

## Interview Q&A

**🟢 What are the two types of forms in Angular?**
Template-driven (logic in the template via `ngModel`) and reactive (form model defined in the component class with `FormControl`/`FormGroup`).

**🟡 When would you use reactive forms over template-driven?**
For complex, dynamic, or large forms; when you need robust, custom, or cross-field validation; type safety; and easy unit testing. Template-driven suits simple forms.

**🟡 How does validation differ between the two?**
Template-driven uses directive-based validators in the template (`required`, `email`). Reactive defines validators in code (`Validators.required`, custom validator functions) attached to controls — more explicit and testable.

**🟡 What are the form/control states?**
`valid`/`invalid`, `pristine`/`dirty` (whether the value changed), `touched`/`untouched` (whether it was focused/blurred). Used to control when to show error messages.

**🔴 How do you implement a custom and a cross-field validator?**
A custom validator is a function `(control) => ValidationErrors | null`. A cross-field validator is attached at the `FormGroup` level so it can compare multiple controls (e.g. password === confirmPassword) and set errors on the group.

## ⚠️ Tricky / Gotchas

- **Forgetting the right module:** template-driven needs `FormsModule`; reactive needs `ReactiveFormsModule`. Mixing them up causes "can't bind to formGroup/ngModel" errors.
- **Template-driven form values are set asynchronously** — reading `ngModel` values too early (e.g. right after init) can give stale/undefined data.
- **Showing errors immediately** annoys users — gate error display on `touched`/`dirty`.
- **`patchValue` vs `setValue`:** `setValue` requires *all* controls; `patchValue` updates a subset. Using `setValue` with missing keys throws.
- **Disabled controls are excluded from `form.value`** — use `getRawValue()` to include them.

## 📌 Quick Recap

- Template-driven (`FormsModule`, `ngModel`) = simple, declarative, async, harder to test.
- Reactive (`ReactiveFormsModule`, `FormGroup`/`FormControl`) = explicit, synchronous, type-safe, testable; best for complex forms.
- States: valid/invalid, pristine/dirty, touched/untouched — gate error display on touched/dirty.
- Validators: built-in (`Validators.required`), custom functions, group-level for cross-field.
- `setValue` (all controls) vs `patchValue` (subset); disabled controls excluded from `value` (use `getRawValue`).
