# TypeScript Generics

## Questions Covered

1. What are generic functions?
2. What are generic interfaces?
3. What are generic constraints?
4. What is the `keyof` operator?
5. What are generic default type parameters?
6. What are conditional types (intro)?
7. What are mapped types (intro)?
8. What is an overview of utility types?

## What are generic functions?

Generic functions use type parameters to write reusable code that works across types while preserving type relationships. The caller (or inference) supplies the concrete type.

```typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);       // T inferred as number
const str = identity('hello');  // T inferred as string

function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const p = pair('key', 100); // [string, number]
```

Generics avoid `any` while staying flexible — unlike overloads, one implementation serves all types.

```typescript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);     // number | undefined
const s = first(['a', 'b']);    // string | undefined
```

Explicit type arguments when inference is insufficient: `identity<string>('hello')`.

## What are generic interfaces?

Interfaces and type aliases can be parameterized by type variables — common for containers, API wrappers, and state shapes.

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };
```

Classes support generics too:

```typescript
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}

const numStack = new Stack<number>();
numStack.push(1);
```

## What are generic constraints?

Constraints limit which types a generic parameter can accept using `extends`. This lets you access properties or methods on `T`.

```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength('hello');     // OK — string has length
getLength([1, 2, 3]);   // OK — array has length
// getLength(42);       // Error — number has no length
```

Common patterns:

```typescript
// Constrain to object keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Constrain to constructor
function create<T extends new (...args: any[]) => any>(Ctor: T) {
  return new Ctor();
}

// Multiple constraints via intersection
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}
```

Constraints balance flexibility with safety — without them, `T` has no known structure.

## What is the `keyof` operator?

`keyof T` produces a union of all keys (string, number, or symbol) of type `T`. Essential for type-safe property access.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKeys = keyof User; // 'id' | 'name' | 'email'

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    result[key] = obj[key];
  }
  return result;
}

const user: User = { id: 1, name: 'Alice', email: 'a@b.com' };
const subset = pick(user, ['name', 'email']);
```

With index signatures, `keyof` includes string/number index types. `keyof` combined with generics powers many utility types (`Pick`, `Record`, mapped types).

## What are generic default type parameters?

Default type parameters provide fallback types when the caller omits a type argument — similar to default function parameters.

```typescript
interface Container<T = string> {
  value: T;
}

const c1: Container = { value: 'default' };       // T = string
const c2: Container<number> = { value: 42 };      // T = number

type ApiResult<T = unknown, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

// Partial defaults — later params can default while earlier are required
type State<TData, TError = Error> = {
  data: TData | null;
  error: TError | null;
};
```

Defaults improve ergonomics for common cases without sacrificing explicit typing when needed.

## What are conditional types (intro)?

Conditional types select one of two types based on a condition: `T extends U ? X : Y`. They enable type-level logic.

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Practical: unwrap array element type
type ElementType<T> = T extends (infer E)[] ? E : T;

type Item = ElementType<string[]>;  // string
type Raw = ElementType<number>;     // number
```

Distributive behavior — when `T` is a union, the conditional distributes over each member:

```typescript
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArray = ToArray<string | number>;
// string[] | number[]
```

Conditional types are the foundation for advanced utility types and library type definitions.

## What are mapped types (intro)?

Mapped types transform properties of an existing type by iterating over its keys with `[K in keyof T]`.

```typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Partial<T> = {
  [K in keyof T]?: T[K];
};

type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

Add modifiers or rename keys:

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];  // remove readonly
};

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

Mapped types + conditional types + `keyof` compose the advanced type system. Built-in utilities (`Pick`, `Omit`, `Record`) are implemented this way.

## What is an overview of utility types?

TypeScript ships built-in utility types for common transformations. They are generic and implemented via mapped/conditional types.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Pick — select properties
type UserPreview = Pick<User, 'id' | 'name'>;

// Omit — exclude properties
type UserWithoutEmail = Omit<User, 'email'>;

// Partial — all optional
type UserUpdate = Partial<User>;

// Required — all required (opposite of Partial)
type FullUser = Required<Partial<User>>;

// Record — construct object type from keys
type RoleMap = Record<'admin' | 'user', string[]>;

// Exclude / Extract — filter union members
type T1 = Exclude<'a' | 'b' | 'c', 'a'>;  // 'b' | 'c'
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;  // 'a'

// NonNullable — remove null | undefined
type T3 = NonNullable<string | null | undefined>;  // string

// ReturnType / Parameters — introspect functions
type Fn = (a: number, b: string) => boolean;
type Args = Parameters<Fn>;    // [number, string]
type Ret = ReturnType<Fn>;     // boolean
```

Utility types reduce boilerplate and keep derived types in sync with source interfaces.
