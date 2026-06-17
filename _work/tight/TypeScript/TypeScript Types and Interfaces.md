# TypeScript Types and Interfaces

## Questions Covered

1. What are interfaces in TypeScript?
2. How do you extend interfaces?
3. What are optional and readonly properties?
4. What are index signatures?
5. What are function types?
6. What are callable interfaces?
7. What are type assertions?
8. What is type narrowing?
9. What are discriminated unions?
10. What is exhaustiveness checking?

## What are interfaces in TypeScript?

Interfaces define object shapes — property names, types, and modifiers. Core tool for data contracts, params, and class implementations.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function sendWelcome(user: User): void {
  console.log(`Welcome, ${user.name}!`);
}

const alice: User = { id: 1, name: 'Alice', email: 'alice@example.com' };
sendWelcome(alice);
```

Method signatures on objects/classes:

```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
  error(message: string) { console.error(message); }
}
```

Interfaces are **structural** — matching shape satisfies the contract.

## How do you extend interfaces?

`extends` inherits properties from parent interface(s) — composes without duplication.

```typescript
interface Animal {
  name: string;
  age: number;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

const rex: Dog = {
  name: 'Rex',
  age: 3,
  breed: 'Labrador',
  bark() { console.log('Woof!'); },
};
```

Multiple inheritance:

```typescript
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

interface Duck extends Animal, Flyable, Swimmable {
  quack(): void;
}
```

## What are optional and readonly properties?

| Modifier | Syntax | Effect |
|----------|--------|--------|
| Optional | `prop?: T` | may be absent |
| Readonly | `readonly prop: T` | no reassignment after init |

```typescript
interface Config {
  readonly apiUrl: string;   // cannot reassign
  timeout?: number;          // optional
  retries?: number;
}

const config: Config = { apiUrl: 'https://api.example.com' };
// config.apiUrl = 'other';  // Error: cannot assign to readonly
config.timeout = 5000;       // OK — was undefined, now set
```

Readonly arrays:

```typescript
interface Point {
  readonly coords: readonly [number, number];
}

const p: Point = { coords: [10, 20] };
// p.coords[0] = 5;  // Error
// p.coords.push(30); // Error
```

## What are index signatures?

Allow dynamic keys with a known value type — dictionaries, caches, maps.

```typescript
interface StringMap {
  [key: string]: string;
}

const colors: StringMap = {
  primary: '#007bff',
  secondary: '#6c757d',
};

interface NumberRecord {
  [id: number]: User;
}

// Readonly index signature
interface ReadonlyDict {
  readonly [key: string]: number;
}
```

All properties must match the index type:

```typescript
interface Mixed {
  name: string;           // known key
  [key: string]: string;  // all values must be string
}
```

## What are function types?

Type functions by params and return — two equivalent syntaxes.

```typescript
// Function type expression
type AddFn = (a: number, b: number) => number;

// Call signature in an interface
interface MultiplyFn {
  (a: number, b: number): number;
}

const add: AddFn = (a, b) => a + b;
const multiply: MultiplyFn = (a, b) => a * b;

// Optional and rest parameters
type LogFn = (message: string, level?: 'info' | 'warn') => void;
type SumFn = (...nums: number[]) => number;
```

Under `strictFunctionTypes`, params are **contravariant**:

```typescript
type Handler = (event: MouseEvent) => void;
// A function accepting Event is NOT assignable to Handler (parameter is narrower)
```

## What are callable interfaces?

Object callable as a function **plus** properties/methods.

```typescript
interface Counter {
  (start: number): void;  // call signature
  interval: number;        // property
  reset(): void;           // method
}

function createCounter(): Counter {
  const fn = (start: number) => { /* ... */ };
  fn.interval = 1000;
  fn.reset = () => { /* ... */ };
  return fn as Counter;
}
```

Function with metadata:

```typescript
interface SearchFn {
  (query: string): Result[];
  cache: Map<string, Result[]>;
}

const search = ((query: string) => {
  return search.cache.get(query) ?? [];
}) as SearchFn;
search.cache = new Map();
```

## What are type assertions?

Tell the compiler to treat a value as a type — **compile-time only**, no runtime conversion.

```typescript
const input = document.getElementById('email') as HTMLInputElement;
const input2 = <HTMLInputElement>document.getElementById('email');
```

```typescript
function process(data: unknown) {
  const user = data as { name: string; age: number };
  console.log(user.name);
}
```

Prefer type guards over assertions. Avoid `as any`. `as const` narrows to literals.

## What is type narrowing?

Refine a broad type in control-flow branches.

```typescript
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase()); // id is string
  } else {
    console.log(id.toFixed(2));      // id is number
  }
}
```

| Technique | Example |
|-----------|---------|
| `typeof` | `typeof v === 'boolean'` |
| `instanceof` | `e instanceof Error` |
| `in` | `'swim' in animal` |
| Equality | `status === 'active'` |
| Type predicate | `pet is Fish` |

```typescript
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

## What are discriminated unions?

Union members share a **discriminant** literal — compiler narrows on it.

```typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

type Shape = Circle | Rectangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
  }
}
```

```typescript
type ApiResponse =
  | { status: 'success'; data: User }
  | { status: 'error'; message: string };
```

## What is exhaustiveness checking?

`never` in `default` catches unhandled union members at compile time.

```typescript
type Shape = Circle | Rectangle | Triangle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}
```

Adding a variant without a `case` → compile error.

---

## Related Topics

- **TypeScript Generics** (`TypeScript/`)
- **Angular Basics** (`Angular/`)
- **React Basics** (`React/`)
