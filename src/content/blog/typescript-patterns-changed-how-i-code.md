---
title: "TypeScript Patterns That Changed How I Code"
description: "Advanced TypeScript patterns and techniques that will level up your type safety game"
pubDate: 2026-02-25T00:00:00Z
tags: ["typescript", "patterns", "type-safety", "javascript"]
draft: true
---

I've been writing TypeScript for years now, and every few months I discover a pattern that makes me think: "How did I live without this?" Here are the patterns that genuinely changed how I approach type safety — not academic curiosities, but techniques I reach for daily.

## 1. Discriminated Unions

This is the gateway pattern that unlocks TypeScript's real power. Instead of optional fields everywhere, model your domain with tagged unions.

**Before — optional property soup:**

```typescript
interface ApiResponse {
  status: "loading" | "success" | "error";
  data?: User[];
  error?: string;
  retryAfter?: number;
}

function handleResponse(res: ApiResponse) {
  if (res.status === "success") {
    // TypeScript doesn't know data exists here
    console.log(res.data!.length); // Dangerous !
  }
}
```

**After — discriminated union:**

```typescript
type ApiResponse =
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: string; retryAfter?: number };

function handleResponse(res: ApiResponse) {
  switch (res.status) {
    case "loading":
      showSpinner();
      break;
    case "success":
      // TypeScript KNOWS data exists here
      console.log(res.data.length); // No assertion needed
      break;
    case "error":
      showError(res.error);
      break;
  }
}
```

The discriminant field (`status`) lets TypeScript narrow the type in each branch automatically. No type assertions, no optional chaining on required data.

## 2. Exhaustive Switch with `never`

Pair discriminated unions with exhaustiveness checking and you'll catch missing cases at compile time:

```typescript
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}

function getStatusColor(res: ApiResponse): string {
  switch (res.status) {
    case "loading":
      return "gray";
    case "success":
      return "green";
    case "error":
      return "red";
    default:
      return assertNever(res); // Compile error if a case is missing
  }
}
```

If you add a new status like `"retrying"` to the union, every switch statement using `assertNever` will light up red until you handle it. This is massive for maintainability.

## 3. Branded Types

Primitive types are too permissive. A `string` userId and a `string` orderId are interchangeable at the type level, but mixing them up is a bug.

```typescript
type Brand<T, B extends string> = T & { __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }

// Create branded values through validated constructors
function toUserId(id: string): UserId {
  if (!id.startsWith("usr_")) throw new Error("Invalid user ID");
  return id as UserId;
}

const userId = toUserId("usr_abc123");
const orderId = "ord_xyz789" as OrderId;

getUser(userId);  // ✅ Works
getUser(orderId); // ❌ Compile error! OrderId is not UserId
```

I use this pattern for IDs, currency amounts, validated emails, file paths — anywhere primitives silently interchange but shouldn't.

## 4. Template Literal Types

TypeScript can manipulate string types at the type level. This is incredibly powerful for API contracts:

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiVersion = "v1" | "v2";
type Resource = "users" | "orders" | "products";

// Generate all valid route patterns
type ApiRoute = `/${ApiVersion}/${Resource}`;
// Result: "/v1/users" | "/v1/orders" | "/v1/products" | "/v2/users" | ...

type EventName = `${"click" | "hover" | "focus"}:${string}`;

function on(event: EventName, handler: () => void) { /* ... */ }

on("click:submit-btn", () => {});  // ✅
on("scroll:header", () => {});      // ❌ "scroll" not in the union
```

Combine with `infer` for parsing:

```typescript
type ExtractRouteParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : T extends `${string}:${infer Param}`
    ? Param
    : never;

type Params = ExtractRouteParams<"/users/:userId/posts/:postId">;
// Result: "userId" | "postId"
```

## 5. The `satisfies` Operator

Added in TypeScript 4.9, `satisfies` validates that an expression matches a type without widening it.

```typescript
type Theme = Record<string, [number, number, number]>;

// With type annotation — loses specific key information
const colors: Theme = {
  primary: [59, 130, 246],
  danger: [239, 68, 68],
};
colors.primary; // type is [number, number, number] ✅
colors.prinary; // no error — any string key is valid! 😱

// With satisfies — validates AND preserves literal types
const colors2 = {
  primary: [59, 130, 246],
  danger: [239, 68, 68],
} satisfies Theme;

colors2.primary; // type is [number, number, number] ✅
colors2.prinary; // ❌ Compile error! Did you mean 'primary'?
```

I use `satisfies` everywhere now for configuration objects, route maps, and theme definitions.

## 6. Conditional Types for API Responses

Shape return types based on input parameters:

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  preferences: { theme: string; language: string };
}

type UserField = keyof User;

// Return type changes based on the fields parameter
function getUser<T extends UserField[]>(
  id: string,
  fields?: T
): Pick<User, T[number]> {
  // Implementation...
}

const full = getUser("123");
// Type: Pick<User, "id" | "name" | "email" | "preferences">

const partial = getUser("123", ["name", "email"]);
// Type: Pick<User, "name" | "email">
partial.name;        // ✅
partial.preferences; // ❌ Not in the selected fields
```

## 7. Builder Pattern with Generics

Accumulate type information across chained calls:

```typescript
class QueryBuilder<TSelected = {}> {
  private query: string[] = [];

  from(table: string): this {
    this.query.push(`FROM ${table}`);
    return this;
  }

  select<K extends string>(
    ...columns: K[]
  ): QueryBuilder<TSelected & Record<K, unknown>> {
    this.query.push(`SELECT ${columns.join(", ")}`);
    return this as any;
  }

  where(condition: string): this {
    this.query.push(`WHERE ${condition}`);
    return this;
  }

  execute(): TSelected[] {
    // Execute the query...
    return [] as TSelected[];
  }
}

const results = new QueryBuilder()
  .from("users")
  .select("name", "email")
  .where("active = true")
  .execute();

// results is { name: unknown; email: unknown }[]
results[0].name;   // ✅ Exists
results[0].avatar; // ❌ Not selected
```

## 8. Type-Safe Event Emitter

Combine mapped types with generics for perfectly typed events:

```typescript
type EventMap = {
  userLogin: { userId: string; timestamp: number };
  pageView: { path: string; referrer?: string };
  error: { code: number; message: string };
};

class TypedEmitter<T extends Record<string, any>> {
  private listeners = new Map<keyof T, Set<Function>>();

  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  emit<K extends keyof T>(event: K, payload: T[K]): void {
    this.listeners.get(event)?.forEach((fn) => fn(payload));
  }
}

const emitter = new TypedEmitter<EventMap>();

emitter.on("userLogin", (data) => {
  console.log(data.userId);    // ✅ string
  console.log(data.timestamp); // ✅ number
});

emitter.emit("pageView", { path: "/home" }); // ✅
emitter.emit("pageView", { count: 5 });       // ❌ Wrong payload shape
emitter.emit("unknown", {});                   // ❌ Unknown event
```

## The Mindset Shift

These patterns share a common philosophy: **make illegal states unrepresentable**. Instead of runtime checks and defensive coding, push your constraints into the type system. Let the compiler catch bugs before they reach production.

Start with discriminated unions — they're the easiest win. From there, branded types and `satisfies` will naturally follow. Before you know it, you'll be writing code where entire categories of bugs simply can't compile.

The best TypeScript code doesn't just use types as documentation — it uses them as guardrails that physically prevent incorrect usage. That's the shift that changed how I code.
