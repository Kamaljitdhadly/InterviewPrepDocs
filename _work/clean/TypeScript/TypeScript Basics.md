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

TypeScript is a strongly typed superset of JavaScript developed by Microsoft. It adds optional static typing, interfaces, generics, and compile-time checks on top of standard JavaScript syntax. TypeScript code compiles (transpiles) to plain JavaScript so it runs anywhere JavaScript runs — browsers, Node.js, Deno, etc.

Key benefits for interviews:

- **Catch errors early** — type mismatches surface at compile time, not in production.
- **Better tooling** — autocomplete, refactoring, and navigation in IDEs.
- **Self-documenting code** — types serve as inline contracts for functions and data shapes.
- **Gradual adoption** — you can mix typed and untyped code; `.js` files can coexist.

```typescript
// TypeScript adds type annotations to JavaScript
function greet(name: string): string {
  return `Hello, ${name}`;
}

const message = greet('Alice'); // OK
// greet(42); // Error: Argument of type 'number' is not assignable to 'string'
```

TypeScript does not change runtime behavior — all type information is erased during compilation.

## How does TypeScript differ from JavaScript?

| Aspect | JavaScript | TypeScript |
|--------|-----------|------------|
| Typing | Dynamic, optional | Static, optional annotations |
| Execution | Runs directly (or via bundler) | Must compile to JS first |
| Errors | Mostly runtime | Many caught at compile time |
| Syntax | ECMAScript standard | Superset — all valid JS is valid TS |
| Tooling | Basic in editors | Rich IntelliSense, refactoring |

TypeScript is **not** a replacement for JavaScript — it is JavaScript with a type layer. At runtime there is no TypeScript; only the emitted JavaScript executes.

```typescript
// Valid in both JS and TS
const nums = [1, 2, 3].map(n => n * 2);

// TS-only: explicit types
const nums: number[] = [1, 2, 3];
function double(n: number): number {
  return n * 2;
}
```

TypeScript also supports features like enums, namespaces, and advanced type operators that have no direct JS equivalent (they compile away or become JS patterns).

## How does TypeScript compilation work?

The TypeScript compiler (`tsc`) reads `.ts`/`.tsx` files, type-checks them, and emits `.js` (and optionally `.d.ts` declaration files). Modern setups often use `tsc` only for type-checking while **esbuild**, **swc**, or **Babel** handle fast transpilation.

Compilation pipeline:

1. **Lexer/Parser** — source → AST
2. **Binder** — resolves symbols and scopes
3. **Type checker** — validates types, reports errors
4. **Emitter** — outputs JavaScript (target set by `target` in tsconfig)

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

Source maps (`sourceMap: true`) map emitted JS back to TS for debugging.

## What are types in TypeScript?

Types describe the shape and allowed values of variables, parameters, and return values. They exist only at compile time.

### Primitive types

```typescript
let name: string = 'Alice';
let age: number = 30;
let active: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;
let id: symbol = Symbol('id');
let big: bigint = 100n;
```

### Object and array types

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

Types enable the compiler to verify that operations are valid before the code runs.

## What is the difference between `any` and `unknown`?

Both accept any value, but they differ in **type safety**.

**`any`** — disables type checking. You can read, call, or assign without compiler complaints. Use sparingly; it defeats the purpose of TypeScript.

**`unknown`** — accepts any value but requires you to narrow or assert the type before using it. Safer default for values from external sources (APIs, `JSON.parse`, user input).

```typescript
let a: any = 'hello';
a.toFixed();        // No error — might crash at runtime

let u: unknown = 'hello';
// u.toFixed();     // Error: Object is of type 'unknown'

if (typeof u === 'string') {
  u.toUpperCase();  // OK — narrowed to string
}
```

| | `any` | `unknown` |
|---|-------|-----------|
| Assignable to | anything | only `unknown` and `any` |
| Operations | unrestricted | requires narrowing |
| Safety | none | enforced |

Prefer `unknown` over `any` when the type is genuinely unknown.

## What is type inference?

Type inference lets the compiler deduce types automatically when you omit annotations. TypeScript infers from initializers, return statements, and contextual usage.

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

**Contextual typing** — the compiler infers types from where a value is used:

```typescript
window.addEventListener('click', (e) => {
  // e inferred as MouseEvent
  console.log(e.clientX);
});
```

Use explicit annotations when inference is too wide or unclear. `const` assertions narrow literals:

```typescript
const config = { mode: 'strict' } as const;
// config.mode is 'strict', not string
```

## What are union and intersection types?

**Union types** (`A | B`) — a value can be one of several types. Use when a variable holds alternatives.

**Intersection types** (`A & B`) — a value must satisfy all types simultaneously. Use to combine shapes.

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

Unions are central to modeling optional states, API responses, and discriminated unions. Intersections merge object types — interfaces use `extends` for similar effect.

## What are literal types?

Literal types are specific values used as types — not just `string`, but the exact string `'admin'`.

```typescript
type Direction = 'north' | 'south' | 'east' | 'west';
let heading: Direction = 'north';
// heading = 'up'; // Error

type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 4;

// Boolean literals
type Success = true;
```

Literal types combine with unions to model finite sets of allowed values — common for status codes, roles, and config flags.

```typescript
type Status = 'pending' | 'active' | 'archived';

function setStatus(s: Status) {
  console.log(s);
}

setStatus('active'); // OK
// setStatus('deleted'); // Error
```

`as const` on objects/arrays produces readonly literal types:

```typescript
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number]; // 'admin' | 'user' | 'guest'
```

## What is the difference between type aliases and interfaces?

Both define object shapes, but they have different capabilities and conventions.

**Interfaces** — best for object/class contracts; support declaration merging; use `extends` for inheritance.

**Type aliases** — can name any type (unions, tuples, primitives); no merging; use `&` for intersections.

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

| | Interface | Type alias |
|---|-----------|------------|
| Object shapes | yes | yes |
| Unions/tuples | no | yes |
| Declaration merging | yes | no |
| `extends` | yes | use `&` |
| Convention | classes, public APIs | unions, utility types |

For equivalent object types, either works. Teams often use interfaces for extensible object contracts and type aliases for unions and computed types.

## What are enums in TypeScript?

Enums define a set of named constants. TypeScript supports numeric and string enums.

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

**Const enums** are inlined at compile time (no runtime object):

```typescript
const enum Direction {
  Up,
  Down,
}
const d = Direction.Up; // compiles to: const d = 0;
```

Many codebases prefer **union literals** over enums to avoid runtime overhead and enable better tree-shaking:

```typescript
type Status = 'pending' | 'active' | 'archived';
```

## What are the basics of `tsconfig.json`?

`tsconfig.json` configures the TypeScript compiler for a project. It defines what to compile and how.

Common `compilerOptions`:

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

Key concepts:

- **`include`/`exclude`** — which files `tsc` processes
- **`extends`** — inherit from a base config (`"extends": "@tsconfig/node20/tsconfig.json"`)
- **Project references** — split large monorepos into composable sub-projects

Run `npx tsc --init` to scaffold a default config.

## What is strict mode in TypeScript?

`"strict": true` in `tsconfig.json` enables a family of strict type-checking options. It is the recommended default for new projects.

Strict mode includes (among others):

| Flag | Effect |
|------|--------|
| `strictNullChecks` | `null`/`undefined` not assignable to other types |
| `noImplicitAny` | error on expressions with implied `any` |
| `strictFunctionTypes` | stricter function parameter checking |
| `strictBindCallApply` | type-check `bind`/`call`/`apply` |
| `strictPropertyInitialization` | class properties must be initialized |
| `noImplicitThis` | error on `this` with implicit `any` |
| `alwaysStrict` | emit `"use strict"` in JS output |

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

Enable strict mode from day one — retrofitting onto a large JS codebase is harder than starting strict and loosening specific flags if needed.
