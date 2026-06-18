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

Type parameters let one implementation work across types while preserving relationships.

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

```typescript
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);     // number | undefined
const s = first(['a', 'b']);    // string | undefined
```

Explicit when needed: `identity<string>('hello')`.

## What are generic interfaces?

Parameterized interfaces — containers, API wrappers, state shapes.

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

Generic classes:

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

`extends` limits acceptable types — enables property access on `T`.

```typescript
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength('hello');     // OK — string has length
getLength([1, 2, 3]);   // OK — array has length
// getLength(42);       // Error — number has no length
```

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

function create<T extends new (...args: any[]) => any>(Ctor: T) {
  return new Ctor();
}

function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}
```

## What is the `keyof` operator?

`keyof T` → union of all keys of `T`.

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

Powers `Pick`, `Record`, and mapped types.

## What are generic default type parameters?

Fallback types when caller omits type argument.

```typescript
interface Container<T = string> {
  value: T;
}

const c1: Container = { value: 'default' };       // T = string
const c2: Container<number> = { value: 42 };      // T = number

type ApiResult<T = unknown, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

type State<TData, TError = Error> = {
  data: TData | null;
  error: TError | null;
};
```

## What are conditional types (intro)?

`T extends U ? X : Y` — type-level branching.

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

type ElementType<T> = T extends (infer E)[] ? E : T;

type Item = ElementType<string[]>;  // string
type Raw = ElementType<number>;     // number
```

**Distributive** over unions:

```typescript
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArray = ToArray<string | number>;
// string[] | number[]
```

## What are mapped types (intro)?

Transform properties via `[K in keyof T]`.

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

Modifiers & key remapping:

```typescript
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];  // remove readonly
};

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

## What is an overview of utility types?

Built-in type transformations — implemented via mapped/conditional types.

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

Keeps derived types in sync with source interfaces.

---

## Related Topics

- **TypeScript Advanced** (`TypeScript/`)
- **C# Generics & Collections** (`C#/`)
