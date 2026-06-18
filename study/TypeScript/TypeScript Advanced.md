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

Core object-type transforms — DTOs, update payloads, API layers.

| Utility | Effect |
|---------|--------|
| `Pick<T, K>` | select subset of keys |
| `Omit<T, K>` | exclude keys |
| `Partial<T>` | all optional |
| `Required<T>` | all required |

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

```typescript
type SafeUser = Omit<User, 'password'>;
// { id: number; name: string; email: string; }
```

```typescript
type UserUpdate = Partial<User>;
// every field optional

function updateUser(id: number, changes: Partial<User>) {
  // merge changes into existing user
}
```

```typescript
type FullConfig = Required<Partial<AppConfig>>;
// ensures every key from AppConfig is present
```

All four are mapped types over `keyof T`.

## What is the `infer` keyword?

Declares a type variable in a conditional type's **true** branch — extracts types from structure.

```typescript
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = MyReturnType<() => string>;           // string
type B = MyReturnType<(x: number) => boolean>; // boolean

type Flatten<T> = T extends (infer U)[] ? U : T;

type Item = Flatten<string[]>;  // string
type Raw = Flatten<number>;     // number

type Awaited<T> = T extends Promise<infer U> ? U : T;
```

Only valid inside conditional types.

## What are template literal types?

String types built from patterns — template strings at the type level.

```typescript
type EventName = 'click' | 'focus' | 'blur';
type HandlerName = `on${Capitalize<EventName>}`;
// 'onClick' | 'onFocus' | 'onBlur'

type Route = `/${string}`;
const home: Route = '/home';   // OK
// const bad: Route = 'home'; // Error

type Color = 'red' | 'blue';
type Size = 'sm' | 'lg';
type ColorSize = `${Color}-${Size}`;
// 'red-sm' | 'red-lg' | 'blue-sm' | 'blue-lg'
```

Built-ins: `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize`.

## What are decorators in TypeScript?

Annotations for classes/methods/properties — metadata or behavior modification. Enable via `experimentalDecorators` (legacy) or TC39 Stage 3 (TS 5.0+).

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

Used by **Angular** (`@Component`), **class-validator**, **TypeORM**. Adds runtime metadata.

## What is the difference between modules and namespaces?

| | ES Modules | Namespaces |
|---|-----------|------------|
| Syntax | `import`/`export` per file | `namespace` keyword |
| Scope | file-based | global / nested |
| Modern use | **preferred** | legacy only |

```typescript
// user.ts
export interface User { id: number; name: string; }
export function createUser(name: string): User {
  return { id: Date.now(), name };
}

// app.ts
import { User, createUser } from './user';
```

```typescript
namespace Geometry {
  export interface Point { x: number; y: number; }
  export function distance(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
  }
}

const p: Geometry.Point = { x: 0, y: 0 };
```

## What are declaration files (`.d.ts`)?

Type descriptions for JS — no implementation. Enables checking untyped libraries.

```typescript
declare module 'legacy-greeter' {
  export function greet(name: string): string;
  export const version: string;
}

import { greet } from 'legacy-greeter';
```

| Pattern | Purpose |
|---------|---------|
| `declare` | ambient (exists at runtime) |
| `declare module` | type untyped npm package |
| `@types/*` | DefinitelyTyped (`@types/lodash`) |
| `declaration: true` | emit `.d.ts` from your TS |

```typescript
declare global {
  interface Window {
    myApp: { version: string };
  }
}
```

Never compiled to JS — type info only.

## What are strict null checks?

`strictNullChecks` — `null`/`undefined` not assignable unless in union.

```typescript
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

```typescript
const email = user?.contact?.email ?? 'no-email@example.com';
```

Eliminates `Cannot read property of undefined` class of bugs.

## How do you integrate TypeScript with React and Angular?

### React

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>{label}</button>
);

const [count, setCount] = useState<number>(0);
const ref = useRef<HTMLInputElement>(null);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.value);
};
```

Setup: `.tsx`, `"jsx": "react-jsx"`, `@types/react`.

### Angular

TypeScript-first — typed components, services, DI.

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

Angular CLI + `strictTemplates` for template type-checking. RxJS fully generic.
