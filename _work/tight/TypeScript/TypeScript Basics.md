# TypeScript Basics

## Questions Covered

1. What is TypeScript?
2. How does TypeScript differ from JavaScript?
3. How does TypeScript compilation work?
4. What are types in TypeScript?
5. What is the difference between `any` and `unknown`?
6. What is type inference?
7. What are union and intersection types?
8. What are literal types?
9. What is the difference between type aliases and interfaces?
10. What are enums in TypeScript?
11. What are the basics of `tsconfig.json`?
12. What is strict mode in TypeScript?

## What is TypeScript?

**TypeScript** is a strongly typed superset of JavaScript (Microsoft) that adds static typing, interfaces, and generics. It compiles to plain JS and runs anywhere JS runs.

| Benefit | Detail |
|---------|--------|
| Early errors | Type mismatches caught at compile time |
| Tooling | Autocomplete, refactoring, navigation |
| Self-documenting | Types as inline contracts |
| Gradual adoption | Mix `.ts` and `.js` in one project |

```typescript
// TypeScript adds type annotations to JavaScript
function greet(name: string): string {
  return `Hello, ${name}`;
}

const message = greet('Alice'); // OK
// greet(42); // Error: Argument of type 'number' is not assignable to 'string'
```

All type information is **erased** at compile time — no runtime type enforcement.

## How does TypeScript differ from JavaScript?

| Aspect | JavaScript | TypeScript |
|--------|-----------|------------|
| Typing | Dynamic | Static (optional annotations) |
| Execution | Direct | Compile to JS first |
| Errors | Runtime | Compile time |
| Syntax | ECMAScript | Superset of JS |

```typescript
// Valid in both JS and TS
const nums = [1, 2, 3].map(n => n * 2);

// TS-only: explicit types
const nums: number[] = [1, 2, 3];
function double(n: number): number {
  return n * 2;
}
```

At runtime only the emitted JavaScript executes — TS features like enums compile to JS patterns or are erased.

## How does TypeScript compilation work?

`tsc` reads `.ts`/`.tsx`, type-checks, and emits `.js` (and optionally `.d.ts`). Modern setups often use `tsc --noEmit` for checking while **esbuild**/**swc**/**Babel** transpile.

**Pipeline:** Lexer → AST → Binder → Type checker → Emitter

```bash
# Compile a single file
npx tsc app.ts

# Compile project using tsconfig.json
npx tsc

# Type-check only (no emit) — common in CI
npx tsc --noEmit
```

```json
// tsconfig.json (minimal)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

`sourceMap: true` maps emitted JS back to TS for debugging.

## What are types in TypeScript?

Types describe allowed shapes/values — compile-time only.

### Primitives

```typescript
let name: string = 'Alice';
let age: number = 30;
let active: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
let id: symbol = Symbol('id');
let big: bigint = 100n;
```

### Objects & arrays

```typescript
let user: { name: string; age: number } = { name: 'Bob', age: 25 };
let scores: number[] = [90, 85, 92];
let tuple: [string, number] = ['Alice', 30]; // fixed-length, typed positions
```

### Special types

```typescript
let anything: any = 'could be anything';       // opt out of checking
let safe: unknown = getExternalData();         // must narrow before use
let impossible: never = throwError();          // unreachable / always throws
let absent: void = logMessage();               // no return value
```

## What is the difference between `any` and `unknown`?

Both accept any value; differ in **safety**.

| | `any` | `unknown` |
|---|-------|-----------|
| Operations | unrestricted | requires narrowing |
| Assignable to | anything | only `unknown` / `any` |
| Use case | legacy escape hatch | external/untrusted data |

```typescript
let a: any = 'hello';
a.toFixed();        // No error — might crash at runtime

let u: unknown = 'hello';
// u.toFixed();     // Error: Object is of type 'unknown'

if (typeof u === 'string') {
  u.toUpperCase();  // OK — narrowed to string
}
```

Prefer `unknown` over `any`.

## What is type inference?

Compiler deduces types from initializers, returns, and context when annotations are omitted.

```typescript
// Inferred as string
const title = 'TypeScript Basics';

// Inferred as number[]
const nums = [1, 2, 3];

// Return type inferred as number
function add(a: number, b: number) {
  return a + b;
}

// Best common type for arrays
const mixed = [1, 'two']; // (string | number)[]
```

**Contextual typing:**

```typescript
window.addEventListener('click', (e) => {
  // e inferred as MouseEvent
  console.log(e.clientX);
});
```

`as const` narrows to literal types:

```typescript
const config = { mode: 'strict' } as const;
// config.mode is 'strict', not string
```

## What are union and intersection types?

| Operator | Meaning | Use |
|----------|---------|-----|
| `A \| B` (union) | one of several types | alternatives, optional states |
| `A & B` (intersection) | all types at once | merge shapes |

```typescript
// Union — id can be string OR number
type ID = string | number;
let userId: ID = 'abc-123';
userId = 42; // also valid

function format(input: string | number): string {
  if (typeof input === 'string') return input.toUpperCase();
  return input.toFixed(2);
}

// Intersection — must have all properties
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;

const person: Person = { name: 'Alice', age: 30 };
```

## What are literal types?

Specific values as types — `'admin'` not just `string`.

```typescript
type Direction = 'north' | 'south' | 'east' | 'west';
let heading: Direction = 'north';
// heading = 'up'; // Error

type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 4;

// Boolean literals
type Success = true;
```

```typescript
type Status = 'pending' | 'active' | 'archived';

function setStatus(s: Status) {
  console.log(s);
}

setStatus('active'); // OK
// setStatus('deleted'); // Error
```

`as const` produces readonly literal types:

```typescript
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'
```

## What is the difference between type aliases and interfaces?

| | Interface | Type alias |
|---|-----------|------------|
| Object shapes | yes | yes |
| Unions/tuples | no | yes |
| Declaration merging | yes | no |
| Inheritance | `extends` | `&` intersection |
| Convention | classes, public APIs | unions, utilities |

```typescript
// Interface
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// Type alias
type Point = { x: number; y: number };
type Result = Success | Failure;
type Success = { ok: true; data: string };
type Failure = { ok: false; error: string };
```

## What are enums in TypeScript?

Named constant sets — numeric (auto-increment) or string (explicit).

```typescript
// Numeric enum (default — auto-incrementing)
enum Status {
  Pending,    // 0
  Active,     // 1
  Archived,   // 2
}

// String enum (explicit values)
enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST',
}

function isAdmin(role: Role): boolean {
  return role === Role.Admin;
}
```

**Const enums** — inlined at compile time (no runtime object):

```typescript
const enum Direction {
  Up,
  Down,
}
const d = Direction.Up; // compiles to: const d = 0;
```

Many teams prefer **union literals** (no runtime overhead, better tree-shaking):

```typescript
type Status = 'pending' | 'active' | 'archived';
```

## What are the basics of `tsconfig.json`?

Project-level compiler config — what to compile and how.

```json
{
  "compilerOptions": {
    "target": "ES2020",           // JS version to emit
    "module": "ESNext",             // module system (CommonJS, ESNext, etc.)
    "lib": ["ES2020", "DOM"],       // available type definitions
    "outDir": "./dist",             // output directory
    "rootDir": "./src",             // source root
    "strict": true,                 // enable all strict checks
    "esModuleInterop": true,        // better CJS/ESM interop
    "skipLibCheck": true,           // skip .d.ts checking (faster builds)
    "moduleResolution": "bundler",  // how to resolve imports
    "jsx": "react-jsx",             // JSX handling (React)
    "declaration": true,            // emit .d.ts files
    "sourceMap": true               // generate source maps
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- **`include`/`exclude`** — file scope
- **`extends`** — inherit base config
- **`npx tsc --init`** — scaffold defaults

## What is strict mode in TypeScript?

`"strict": true` enables all strict checks — recommended for new projects.

| Flag | Effect |
|------|--------|
| `strictNullChecks` | `null`/`undefined` not assignable to other types |
| `noImplicitAny` | error on implied `any` |
| `strictFunctionTypes` | stricter function params |
| `strictPropertyInitialization` | class props must be initialized |
| `alwaysStrict` | emit `"use strict"` |

```typescript
// With strictNullChecks
let name: string = null; // Error without strict; Error with strictNullChecks

function getUser(id: number): User | undefined {
  return users.find(u => u.id === id);
}

const user = getUser(1);
// user.name; // Error: Object is possibly 'undefined'
if (user) {
  console.log(user.name); // OK — narrowed
}
```

Enable strict from day one — easier than retrofitting a large codebase.

---

## Related Topics

- **JavaScript Basics** (`Javascript/`)
- **TypeScript Types and Interfaces** (`TypeScript/`)
