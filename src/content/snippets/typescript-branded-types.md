---
title: "TypeScript Branded Types for Type-Safe IDs"
description: "Prevent mixing up IDs and strings using branded types in TypeScript"
language: "typescript"
tags: ["type-safety", "patterns"]
date: 2026-01-25T00:00:00Z
draft: true
---

## The Problem

Plain strings are interchangeable — nothing stops you from passing a user ID where an order ID is expected:

```typescript
function getOrder(orderId: string): Order { /* ... */ }

const userId = "usr_abc123";
getOrder(userId); // No error — but this is a bug!
```

## Branded Types to the Rescue

Use a unique symbol to create nominal types that look like strings but can't be confused:

```typescript
// ---- Brand utility ----
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// ---- Domain IDs ----
type UserId  = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type SKU     = Brand<string, "SKU">;

// ---- Factory functions (the only way to create branded values) ----
function UserId(id: string): UserId {
  if (!id.startsWith("usr_")) {
    throw new Error(`Invalid UserId: ${id}`);
  }
  return id as UserId;
}

function OrderId(id: string): OrderId {
  if (!id.startsWith("ord_")) {
    throw new Error(`Invalid OrderId: ${id}`);
  }
  return id as OrderId;
}

function SKU(id: string): SKU {
  if (!/^[A-Z]{2,4}-\d{4,8}$/.test(id)) {
    throw new Error(`Invalid SKU: ${id}`);
  }
  return id as SKU;
}
```

## Compile-Time Safety

```typescript
function getUser(id: UserId): User { /* ... */ }
function getOrder(id: OrderId): Order { /* ... */ }
function getProduct(sku: SKU): Product { /* ... */ }

const userId  = UserId("usr_abc123");
const orderId = OrderId("ord_xyz789");

getUser(userId);    // OK
getOrder(orderId);  // OK

getUser(orderId);   // Compile error! OrderId is not assignable to UserId
getOrder(userId);   // Compile error! UserId is not assignable to OrderId
getUser("usr_abc"); // Compile error! string is not assignable to UserId
```

## Branded Numeric Types

The same pattern works for numbers:

```typescript
type Cents      = Brand<number, "Cents">;
type Percentage = Brand<number, "Percentage">;

function Cents(amount: number): Cents {
  if (!Number.isInteger(amount)) {
    throw new Error("Cents must be an integer");
  }
  return amount as Cents;
}

function Percentage(value: number): Percentage {
  if (value < 0 || value > 100) {
    throw new Error("Percentage must be 0–100");
  }
  return value as Percentage;
}

function applyDiscount(price: Cents, discount: Percentage): Cents {
  return Cents(Math.round(price * (1 - discount / 100)));
}

applyDiscount(Cents(2999), Percentage(15)); // OK
applyDiscount(Percentage(15), Cents(2999)); // Compile error!
```

## Generic Helper for API Responses

```typescript
// Parse and brand IDs coming from an API
interface ApiOrder {
  id: string;
  userId: string;
  items: Array<{ sku: string; qty: number }>;
}

function parseOrder(raw: ApiOrder) {
  return {
    id: OrderId(raw.id),
    userId: UserId(raw.userId),
    items: raw.items.map((item) => ({
      sku: SKU(item.sku),
      qty: item.qty,
    })),
  };
}
```

**Key takeaways:**

- Branded types are **zero-cost at runtime** — they compile down to plain strings/numbers.
- Factory functions serve as **validation boundaries** at the edges of your system.
- Catches ID mix-up bugs at **compile time** instead of production.
- Works with any primitive — strings, numbers, dates, etc.
