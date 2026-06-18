# React Forms

## Questions Covered

1. What is the difference between controlled and uncontrolled components?
2. How do you handle form submission in React?
3. What are common validation approaches in React forms?
4. What are the basics of React Hook Form?
5. How do you manage form state with useReducer?
6. What is lifting form state in React?
7. How do you handle accessibility in forms?

## What is the difference between controlled and uncontrolled components?

**Controlled components** store form values in React state. The input's `value` is driven by state, and `onChange` updates state — React is the single source of truth.

**Uncontrolled components** store values in the DOM. You read them via refs (`inputRef.current.value`) when needed, typically on submit.

| Aspect | Controlled | Uncontrolled |
|--------|-----------|--------------|
| Source of truth | React state | DOM |
| Real-time validation | Easy | Harder |
| Re-renders | On every keystroke | Minimal |
| Default values | `value` + state | `defaultValue` |

Use controlled inputs when you need live validation, conditional fields, or formatting. Use uncontrolled for simple forms or integrating with non-React libraries.

```jsx
import { useRef, useState } from 'react';

function ControlledInput() {
  const [email, setEmail] = useState('');

  return (
    <input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="you@example.com"
    />
  );
}

function UncontrolledInput() {
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    console.log(inputRef.current.value);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} type="email" defaultValue="" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## How do you handle form submission in React?

Attach `onSubmit` to `<form>` and call `event.preventDefault()` to stop the browser's default full-page POST. Gather values from state (controlled), refs (uncontrolled), or `FormData`, then validate and send to an API.

**Key points:**

- Use `type="submit"` on the submit button; `type="button"` for actions that should not submit.
- Disable the submit button while `isSubmitting` to prevent double submits.
- Reset with `setState` (controlled) or `form.reset()` (uncontrolled).

```jsx
import { useState } from 'react';

function SignupForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Signup failed');
      setForm({ name: '', email: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Sign up'}
      </button>
    </form>
  );
}
```

## What are common validation approaches in React forms?

**1. Inline / on-change validation** — validate as the user types; good UX for immediate feedback.

**2. On-blur validation** — validate when a field loses focus; fewer re-renders than on-change.

**3. On-submit validation** — validate all fields at once before sending; simplest to implement.

**4. Schema validation (Zod, Yup)** — define a schema once, reuse on client and server.

**5. HTML5 constraint validation** — `required`, `minLength`, `pattern`; check `form.checkValidity()`.

```jsx
import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  function validate(values) {
    const next = {};
    if (!values.email) next.email = 'Email is required';
    else if (!EMAIL_RE.test(values.email)) next.email = 'Invalid email';
    if (!values.password) next.password = 'Password is required';
    else if (values.password.length < 8) next.password = 'Min 8 characters';
    return next;
  }

  function handleBlur(field) {
    setErrors((prev) => ({ ...prev, ...validate({ email, password }) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    // submit...
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
      </label>
      {errors.email && <span id="email-error">{errors.email}</span>}

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => handleBlur('password')}
          aria-invalid={Boolean(errors.password)}
        />
      </label>
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Log in</button>
    </form>
  );
}
```

## What are the basics of React Hook Form?

React Hook Form (RHF) minimizes re-renders by registering inputs via refs instead of wiring `value`/`onChange` on every field. `useForm` returns `register`, `handleSubmit`, `formState`, and helpers like `watch` and `reset`.

**Why interviewers ask:** performance on large forms, less boilerplate, easy integration with schema validators via `resolver`.

```jsx
import { useForm } from 'react-hook-form';

function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { name: '', bio: '' },
  });

  async function onSubmit(data) {
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'Name is required', minLength: 2 })}
      />
      {errors.name && <span>{errors.name.message}</span>}

      <textarea
        {...register('bio', { maxLength: { value: 200, message: 'Max 200 chars' } })}
      />
      {errors.bio && <span>{errors.bio.message}</span>}

      <button type="submit" disabled={isSubmitting}>Save</button>
    </form>
  );
}
```

With Zod/Yup, pass `resolver: zodResolver(schema)` to `useForm` for schema-driven validation.

## How do you manage form state with useReducer?

`useReducer` suits complex forms with many fields, interdependent values, or multi-step wizards. A reducer centralizes update logic in one function instead of many `setState` calls.

**Pattern:** action types like `SET_FIELD`, `SET_ERRORS`, `RESET`; derive next state immutably in the reducer.

```jsx
import { useReducer } from 'react';

const initialState = {
  values: { name: '', plan: 'free' },
  errors: {},
  step: 0,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'NEXT_STEP':
      return { ...state, step: state.step + 1 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function WizardForm() {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const { values, errors, step } = state;

  function handleSubmit(e) {
    e.preventDefault();
    if (step < 2) {
      dispatch({ type: 'NEXT_STEP' });
      return;
    }
    // final submit with values
  }

  return (
    <form onSubmit={handleSubmit}>
      {step === 0 && (
        <input
          value={values.name}
          onChange={(e) =>
            dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })
          }
        />
      )}
      {step === 1 && (
        <select
          value={values.plan}
          onChange={(e) =>
            dispatch({ type: 'SET_FIELD', field: 'plan', value: e.target.value })
          }
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
      )}
      <button type="submit">{step < 2 ? 'Next' : 'Submit'}</button>
    </form>
  );
}
```

## What is lifting form state in React?

Lifting state moves shared form data to the closest common ancestor so sibling components can read or update it. Common when a summary panel, wizard stepper, or parent submit button needs access to fields defined in children.

**Approaches:**

- Pass `values` and `onChange` props down (controlled pattern).
- Use React Context for deeply nested forms.
- Use a form library (RHF `FormProvider`, Formik context).

```jsx
import { useState } from 'react';

function NameField({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Name"
    />
  );
}

function FormSummary({ name }) {
  return <p>Preview: {name || '(empty)'}</p>;
}

function RegistrationForm() {
  const [name, setName] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); console.log({ name }); }}>
      <NameField value={name} onChange={setName} />
      <FormSummary name={name} />
      <button type="submit">Register</button>
    </form>
  );
}
```

Lifting keeps a single source of truth and avoids syncing duplicate state between components.

## How do you handle accessibility in forms?

Accessible forms ensure screen readers and keyboard users can complete inputs without confusion.

**Essentials:**

- **Labels** — every input has a `<label htmlFor="id">` or wrapping label; never rely on placeholder alone.
- **Error association** — `aria-invalid="true"` and `aria-describedby` pointing to error element `id`.
- **Focus management** — move focus to first error on submit; preserve logical tab order.
- **Grouping** — `<fieldset>` + `<legend>` for related radios/checkboxes.
- **Live regions** — `role="alert"` or `aria-live="polite"` for dynamic error/success messages.
- **Autocomplete** — `autoComplete="email"` etc. helps users and password managers.

```jsx
function AccessibleForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Enter a valid email address');
      document.getElementById('email-error')?.focus();
      return;
    }
    setError('');
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="form-title">
      <h2 id="form-title">Contact us</h2>

      <label htmlFor="contact-email">Email address</label>
      <input
        id="contact-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'email-error' : undefined}
        autoComplete="email"
        required
      />
      {error && (
        <span id="email-error" role="alert" tabIndex={-1}>
          {error}
        </span>
      )}

      <button type="submit">Send</button>
    </form>
  );
}
```
