# TypeScript Advanced

## Questions Covered

1. How do utility types `Pick`, `Omit`, `Partial`, and `Required` work?
2. What is the `infer` keyword?
3. What are template literal types?
4. What are decorators in TypeScript?
5. What is the difference between modules and namespaces?
6. What are declaration files (`.d.ts`)?
7. What are strict null checks?
8. How do you integrate TypeScript with React and Angular?

## How do utility types `Pick`, `Omit`, `Partial`, and `Required` work?

These four utilities transform object types — fundamental for DTOs, update payloads, and API layers.

**`Pick<T, K>`** — select a subset of properties:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type PublicUser = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }
```

**`Omit<T, K>`** — exclude properties (inverse of Pick):

```typescript
type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; email: string; }
```

**`Partial<T>`** — all properties optional (common for PATCH/update):

```typescript
type UserUpdate = Partial<User>;
// every field optional

function updateUser(id: number, changes: Partial<User>) {
  // merge changes into existing user
}
```

**`Required<T>`** — all properties required (removes `?`):

```typescript
type FullConfig = Required<Partial<AppConfig>>;
// ensures every key from AppConfig is present
```

All four are implemented as mapped types over `keyof T`. They preserve property types while changing optionality or membership.

## What is the `infer` keyword?

`infer` declares a type variable within a conditional type's **true** branch. It extracts (infers) a type from a structure — most common in conditional types.

```typescript
// Extract return type of a function
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = MyReturnType<() => string>;           // string
type B = MyReturnType<(x: number) => boolean>; // boolean

// Extract array element type
type Flatten<T> = T extends (infer U)[] ? U : T;

type Item = Flatten<string[]>;  // string
type Raw = Flatten<number>;     // number

// Extract promise resolved type
type Awaited<T> = T extends Promise<infer U> ? U : T;
```

`infer` can appear in multiple positions (function args, tuple positions). It only works inside conditional types — you cannot use `infer` in a regular type alias body.

## What are template literal types?

Template literal types build string types from patterns — like template strings at the type level.

```typescript
type EventName = 'click' | 'focus' | 'blur';
type HandlerName = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

type Route = `/${string}`;
const home: Route = '/home';   // OK
// const bad: Route = 'home'; // Error

// Combine with unions — distributes combinations
type Color = 'red' | 'blue';
type Size = 'sm' | 'lg';
type ColorSize = `${Color}-${Size}`;
// 'red-sm' | 'red-lg' | 'blue-sm' | 'blue-lg'
```

Built-in string manipulation types: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`. Template literals power typed CSS variables, route builders, and event handler naming.

## What are decorators in TypeScript?

Decorators are experimental annotations for classes, methods, properties, and parameters. They attach metadata or modify behavior. Enable with `"experimentalDecorators": true` (legacy) or the TC39 Stage 3 decorator proposal (TS 5.0+).

```typescript
function logged(target: any, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return target.apply(this, args);
  };
}

class Greeter {
  @logged
  greet(name: string) {
    return `Hello, ${name}`;
  }
}
```

Common uses:

- **Angular** — `@Component`, `@Injectable`, `@Input`
- **class-validator** — `@IsString()`, `@Min(0)`
- **TypeORM** — `@Entity`, `@Column`

Decorators add runtime metadata; they are not purely a type-system feature. Check your framework's decorator version (legacy vs standard).

## What is the difference between modules and namespaces?

**ES Modules** (modern standard) — file-based, `import`/`export`. Preferred for all new code.

```typescript
// user.ts
export interface User { id: number; name: string; }
export function createUser(name: string): User {
  return { id: Date.now(), name };
}

// app.ts
import { User, createUser } from './user';
```

**Namespaces** (legacy) — `namespace` keyword groups code in a single global scope. Used before ES modules were standard.

```typescript
namespace Geometry {
  export interface Point { x: number; y: number; }
  export function distance(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }
}

const p: Geometry.Point = { x: 0, y: 0 };
```

| | ES Modules | Namespaces |
|---|-----------|------------|
| Scope | per file | global / nested |
| Modern bundlers | native | discouraged |
| Use today | yes | legacy code only |

`namespace` can augment global types (`declare global`). Prefer modules; use namespaces only for declaration merging or legacy interop.

## What are declaration files (`.d.ts`)?

Declaration files describe the shape of JavaScript code for the TypeScript compiler — types without implementation. They enable type-checking for untyped JS libraries.

```typescript
// types/greeter.d.ts
declare module 'legacy-greeter' {
  export function greet(name: string): string;
  export const version: string;
}

// Now TypeScript understands imports from 'legacy-greeter'
import { greet } from 'legacy-greeter';
```

Patterns:

- **`declare`** — ambient declaration (exists at runtime, no emit)
- **`declare module`** — type an untyped npm package
- **`@types/*`** — DefinitelyTyped community types (`npm i -D @types/lodash`)
- **`declaration: true`** — emit `.d.ts` alongside your compiled JS

```typescript
// Global augmentation
declare global {
  interface Window {
    myApp: { version: string };
  }
}
```

`.d.ts` files are never compiled to JS — they are type information only.

## What are strict null checks?

`strictNullChecks` (part of `strict`) treats `null` and `undefined` as distinct types — not assignable to other types unless explicitly allowed.

```typescript
// Without strictNullChecks: string accepts null
// With strictNullChecks:
let name: string = null;        // Error
let maybe: string | null = null; // OK — explicit union

function findUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = findUser(1);
// user.name;  // Error: Object is possibly 'undefined'

if (user !== undefined) {
  console.log(user.name); // OK — narrowed
}
```

Optional chaining (`?.`) and nullish coalescing (`??`) pair naturally with strict null checks:

```typescript
const email = user?.contact?.email ?? 'no-email@example.com';
```

Strict null checks eliminate a huge class of runtime `Cannot read property of undefined` errors.

## How do you integrate TypeScript with React and Angular?

### React

```typescript
// Functional component with props
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>{label}</button>
);

// Hooks are fully typed
const [count, setCount] = useState<number>(0);
const ref = useRef<HTMLInputElement>(null);

// Event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
```

Setup: `tsx` extension, `"jsx": "react-jsx"` in tsconfig, `@types/react`. Vite/CRA/Next.js scaffold TS projects natively.

### Angular

Angular is TypeScript-first — components, services, and DI are typed by design.

```typescript
@Component({
  selector: 'app-user',
  template: `<h1>{{ user.name }}</h1>`,
})
export class UserComponent {
  @Input() user!: User;
  constructor(private userService: UserService) {}
}

@Injectable({ providedIn: 'root' })
export class UserService {
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
  constructor(private http: HttpClient) {}
}
```

Angular CLI generates typed projects. Strict templates (`strictTemplates`) add template type-checking. RxJS observables integrate with full generic typing.

Both frameworks benefit from shared model interfaces, strict mode, and path aliases in `tsconfig.json`.
