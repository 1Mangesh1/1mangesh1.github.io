---
title: "TypeScript const Assertions for Literal Types"
date: 2026-01-20T00:00:00Z
tags: ["typescript", "types"]
category: "javascript"
draft: true
---

TypeScript's `as const` assertion tells the compiler to infer the **narrowest possible type** — literal values instead of general types. This is incredibly useful for configuration objects, discriminated unions, and type-safe constants.

## Without vs With `as const`

```typescript
// Without — types are widened
const config = {
  endpoint: "/api/users",
  method: "GET",
  retries: 3
};
// Type: { endpoint: string; method: string; retries: number }

// With as const — types are literal and readonly
const config = {
  endpoint: "/api/users",
  method: "GET",
  retries: 3
} as const;
// Type: { readonly endpoint: "/api/users"; readonly method: "GET"; readonly retries: 3 }
```

## Arrays Become Tuples

```typescript
const colors = ["red", "green", "blue"] as const;
// Type: readonly ["red", "green", "blue"]

// Without as const: string[]
// With as const: you can derive a union type:
type Color = typeof colors[number]; // "red" | "green" | "blue"
```

## Practical Use: Discriminated Unions

```typescript
const ACTIONS = {
  increment: { type: "INCREMENT" },
  decrement: { type: "DECREMENT" },
  reset: { type: "RESET", payload: 0 },
} as const;

type Action = typeof ACTIONS[keyof typeof ACTIONS];
// { readonly type: "INCREMENT" } | { readonly type: "DECREMENT" } | { readonly type: "RESET"; readonly payload: 0 }

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "INCREMENT": return state + 1;
    case "DECREMENT": return state - 1;
    case "RESET": return 0; // TypeScript knows this branch exists
  }
}
```

## Deriving Types from Constants

```typescript
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
type HttpMethod = typeof HTTP_METHODS[number];
// "GET" | "POST" | "PUT" | "DELETE"

function fetchData(method: HttpMethod, url: string) { /* ... */ }
fetchData("PATCH", "/api"); // Error: "PATCH" is not assignable
```

The pattern of defining a const value and extracting a type from it (`typeof X[number]` or `keyof typeof X`) eliminates the need to maintain parallel type definitions and runtime values.
