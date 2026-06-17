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

Interfaces define the shape of an object — property names, their types, and optional modifiers. They are a core way to describe contracts for data structures, function parameters, and class implementations.

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

Interfaces can describe method signatures on objects and classes:

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

Interfaces are structural — if an object has the required properties, it satisfies the interface regardless of how it was created.

## How do you extend interfaces?

Use `extends` to inherit properties from one or more parent interfaces. This composes types without duplication.

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

Multiple inheritance is supported:

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

Interfaces can also extend type aliases (when the alias resolves to an object type) and vice versa using intersection (`&`).

## What are optional and readonly properties?

**Optional** (`?`) — property may be absent. **Readonly** — property cannot be reassigned after initialization.

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

`Readonly<T>` utility makes all properties readonly. `readonly` arrays prevent push/pop but allow reading:

```typescript
interface Point {
  readonly coords: readonly [number, number];
}

const p: Point = { coords: [10, 20] };
// p.coords[0] = 5;  // Error
// p.coords.push(30); // Error
```

Use optional for truly optional fields; use `| undefined` when you need to distinguish "missing" from "explicitly undefined."

## What are index signatures?

Index signatures allow objects with dynamic keys of a known value type. Useful for dictionaries, caches, and maps.

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

Rules:

- All properties must be assignable to the index signature type.
- Mixing specific known keys with an index signature requires the index type to be a supertype of known properties.

```typescript
interface Mixed {
  name: string;           // known key
  [key: string]: string;  // all values must be string
}
```

## What are function types?

Functions can be typed by their parameter and return types. Two equivalent syntaxes exist.

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

Function types are **contravariant** in parameters under `strictFunctionTypes` — important when assigning functions to typed variables.

```typescript
type Handler = (event: MouseEvent) => void;
// A function accepting Event is NOT assignable to Handler (parameter is narrower)
```

## What are callable interfaces?

A callable interface describes an object that can be called like a function while also having properties.

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

Common pattern — function with metadata:

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

Type assertions tell the compiler to treat a value as a specific type. They do not perform runtime conversion — they are compile-time only.

Two syntaxes (equivalent):

```typescript
const input = document.getElementById('email') as HTMLInputElement;
const input2 = <HTMLInputElement>document.getElementById('email');
```

Use when you know more than the compiler (DOM elements, narrowing after checks):

```typescript
function process(data: unknown) {
  const user = data as { name: string; age: number };
  console.log(user.name);
}
```

**Prefer type guards over assertions** when possible. Avoid `as any` — it silences all checking. Double assertions (`as unknown as T`) is a code smell for incompatible types.

`const` assertions (`as const`) narrow to literal types rather than widening.

## What is type narrowing?

Narrowing refines a broad type to a more specific type within a control-flow branch. TypeScript tracks narrowing through conditionals.

```typescript
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase()); // id is string
  } else {
    console.log(id.toFixed(2));      // id is number
  }
}
```

Common narrowing techniques:

```typescript
// typeof
if (typeof value === 'boolean') { /* ... */ }

// instanceof
if (error instanceof Error) { console.log(error.message); }

// in operator
if ('swim' in animal) { animal.swim(); }

// Equality
if (status === 'active') { /* status narrowed to 'active' */ }

// Truthiness (careful — doesn't distinguish 0, '', null)
if (value) { /* excludes falsy */ }

// Type predicates (user-defined guards)
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

Narrowing is essential for working with `unknown` and union types safely.

## What are discriminated unions?

A discriminated union (tagged union) uses a common literal property (the **discriminant**) to distinguish members of a union. TypeScript narrows based on the discriminant in `switch`/`if`.

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

After checking `shape.kind`, TypeScript knows which interface applies. This pattern models API responses, state machines, and AST nodes cleanly.

```typescript
type ApiResponse =
  | { status: 'success'; data: User }
  | { status: 'error'; message: string };
```

## What is exhaustiveness checking?

Exhaustiveness checking ensures every case in a union is handled. The `never` type signals unreachable code when a case is missed.

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

If you add a new variant to `Shape` without handling it, `shape` in `default` is no longer `never` — the compiler reports an error.

Alternative — assert function:

```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}
```

Exhaustiveness checking catches bugs at compile time when unions evolve — critical in large codebases and state management.
