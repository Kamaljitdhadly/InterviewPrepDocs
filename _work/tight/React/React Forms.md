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

**Controlled:** value in React state; `value` + `onChange` — React is source of truth. **Uncontrolled:** value in the DOM; read via refs on submit. Controlled suits live validation/formatting; uncontrolled suits simple forms and fewer re-renders.

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

Use `onSubmit` on `<form>` with `e.preventDefault()`. Read values from state, refs, or `FormData`; disable submit while `isSubmitting`; reset via state or `form.reset()`.

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

**On-change** (immediate feedback), **on-blur** (fewer renders), **on-submit** (simplest), **schema** (Zod/Yup, shared client/server), and **HTML5** (`required`, `pattern`, `checkValidity()`).

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

RHF registers inputs via refs to avoid per-keystroke re-renders. `useForm` provides `register`, `handleSubmit`, `formState`, `watch`, `reset`. Add `resolver: zodResolver(schema)` for schema validation.

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

## How do you manage form state with useReducer?

`useReducer` centralizes complex/multi-step form logic. Dispatch actions like `SET_FIELD`, `SET_ERRORS`, `RESET` instead of many `useState` calls.

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

Lift shared form state to the nearest common ancestor so siblings (summary panels, steppers, parent submit) share one source of truth via props, Context, or form-library providers.

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

## How do you handle accessibility in forms?

Use `<label htmlFor>`, `aria-invalid` + `aria-describedby` for errors, `role="alert"` for live messages, `<fieldset>`/`<legend>` for groups, logical tab order, and `autoComplete`.

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
