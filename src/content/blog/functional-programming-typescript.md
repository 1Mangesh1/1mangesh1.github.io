---
title: "Functional Programming Patterns in TypeScript"
description: "Write cleaner, more predictable code by applying functional programming concepts in TypeScript"
pubDate: 2026-02-03T00:00:00Z
tags: ["functional-programming", "typescript", "patterns", "clean-code"]
draft: true
---

Functional programming (FP) isn't about abandoning everything you know about TypeScript — it's about adding powerful tools to your toolkit. By embracing pure functions, immutability, and composition, you can write code that's easier to test, reason about, and maintain.

Let's explore practical FP patterns you can start using in TypeScript today.

## Pure Functions

A pure function always returns the same output for the same input and produces no side effects. This makes them incredibly predictable and testable.

```typescript
// Impure — depends on external state
let taxRate = 0.2;
function calculateTotal(price: number): number {
  return price + price * taxRate;
}

// Pure — all dependencies are explicit
function calculateTotal(price: number, taxRate: number): number {
  return price + price * taxRate;
}
```

The pure version is trivially testable — no mocking global state, no setup/teardown. Pass inputs, assert outputs.

## Immutability with `readonly` and `Readonly<T>`

TypeScript gives us compile-time immutability enforcement. Use it aggressively.

```typescript
// Mark individual properties
interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

// Make an entire type readonly
type ImmutableConfig = Readonly<{
  apiUrl: string;
  timeout: number;
  retries: number;
}>;

// Deep readonly for nested structures
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// Readonly arrays
function processItems(items: readonly string[]): string[] {
  // items.push("new"); // Compile error!
  return [...items, "new"]; // Create a new array instead
}
```

Immutability eliminates an entire class of bugs — shared mutable state. When nothing mutates, you never have to wonder "who changed this?"

## Function Composition

Composition is the heart of FP: build complex operations by combining simple ones.

```typescript
type Fn<A, B> = (a: A) => B;

function compose<A, B, C>(f: Fn<B, C>, g: Fn<A, B>): Fn<A, C> {
  return (x: A) => f(g(x));
}

const trim = (s: string) => s.trim();
const toLower = (s: string) => s.toLowerCase();
const split = (sep: string) => (s: string) => s.split(sep);

const normalizeAndSplit = compose(split(" "), compose(toLower, trim));

normalizeAndSplit("  Hello World  "); // ["hello", "world"]
```

## Pipe and Flow Utilities

`compose` reads right-to-left, which can feel unnatural. `pipe` reads left-to-right — the way data actually flows.

```typescript
function pipe<A>(value: A): A;
function pipe<A, B>(value: A, fn1: Fn<A, B>): B;
function pipe<A, B, C>(value: A, fn1: Fn<A, B>, fn2: Fn<B, C>): C;
function pipe<A, B, C, D>(value: A, fn1: Fn<A, B>, fn2: Fn<B, C>, fn3: Fn<C, D>): D;
function pipe(value: unknown, ...fns: Function[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), value);
}

// Clean, readable data transformation
const result = pipe(
  users,
  (users) => users.filter((u) => u.active),
  (users) => users.map((u) => u.email),
  (emails) => emails.join(", ")
);
```

Libraries like **fp-ts** provide type-safe `pipe` and `flow` with excellent generics — highly recommended for production use.

## Monadic Error Handling: Result / Either Type

Throwing exceptions breaks functional purity. Instead, encode failure in the return type.

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Usage: parsing that can fail
function parseJSON<T>(input: string): Result<T, string> {
  try {
    return ok(JSON.parse(input));
  } catch (e) {
    return err(`Invalid JSON: ${(e as Error).message}`);
  }
}

function parseConfig(raw: string): Result<Config, string> {
  const json = parseJSON<Config>(raw);
  if (!json.ok) return json;

  if (!json.value.apiUrl) return err("Missing apiUrl");
  return ok(json.value);
}

// Chain operations cleanly
function map<T, U, E>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

function flatMap<T, U, E>(result: Result<T, E>, fn: (val: T) => Result<U, E>): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}
```

Now errors are **values** — they compose, they type-check, and they never surprise you at runtime.

## Currying

Currying transforms a multi-argument function into a chain of single-argument functions. This enables partial application and reuse.

```typescript
const curry =
  <A, B, C>(fn: (a: A, b: B) => C) =>
  (a: A) =>
  (b: B): C =>
    fn(a, b);

const add = curry((a: number, b: number) => a + b);
const increment = add(1);
const addTen = add(10);

increment(5); // 6
addTen(5); // 15

// Practical example: configurable filter
const filterBy = <T>(predicate: (item: T) => boolean) => (items: T[]) =>
  items.filter(predicate);

const activeOnly = filterBy<User>((u) => u.active);
const adminsOnly = filterBy<User>((u) => u.role === "admin");

const activeUsers = activeOnly(users);
const adminUsers = adminsOnly(users);
```

## Point-Free Style

Point-free means defining functions without explicitly mentioning their arguments. It reduces noise and highlights data flow.

```typescript
// Pointed (explicit argument)
const getNames = (users: User[]) => users.map((u) => u.name);

// Point-free building blocks
const prop = <T, K extends keyof T>(key: K) => (obj: T): T[K] => obj[key];
const map = <A, B>(fn: (a: A) => B) => (arr: A[]): B[] => arr.map(fn);

const getName = prop<User, "name">("name");
const getNames = map(getName);

// Compose point-free
const getActiveUserNames = flow(
  filterBy<User>((u) => u.active),
  map(prop<User, "name">("name"))
);
```

Use point-free style when it **improves** clarity — don't force it when a lambda is clearer.

## Algebraic Data Types

ADTs model data as a union of distinct shapes. TypeScript's discriminated unions are perfect for this.

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

// Exhaustive pattern matching
function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return 0.5 * shape.base * shape.height;
  }
}

// The compiler ensures you handle every case.
// Adding a new variant to Shape forces you to update area().
```

Combine ADTs with the Result type, and you have a powerful, type-safe way to model your entire domain.

## Wrapping Up

You don't need to go "full Haskell" to benefit from FP in TypeScript. Start with:

1. **Pure functions** — eliminate hidden dependencies
2. **Immutability** — use `readonly` everywhere
3. **Result types** — stop throwing exceptions
4. **Composition** — build complexity from simplicity

Each pattern compounds. Code that's pure is easy to compose. Code that's immutable is safe to parallelize. Code with explicit error types is safe to refactor.

Pick one pattern, apply it to your next PR, and watch the readability improve.
