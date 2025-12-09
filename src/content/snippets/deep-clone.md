---
title: "Deep Clone Object"
description: "Create a true deep copy of nested objects and arrays"
language: "typescript"
tags: ["utility", "objects", "clone"]
date: 2025-12-07T00:00:00Z
---

Multiple ways to deep clone objects in JavaScript/TypeScript:

## Modern: structuredClone (Best)

```typescript
const original = { a: 1, b: { c: 2 }, d: [1, 2, 3] };
const clone = structuredClone(original);
```

Handles nested objects, arrays, Maps, Sets, Dates, and more. Available in all modern browsers and Node 17+.

## JSON Method (Simple but Limited)

```typescript
const clone = JSON.parse(JSON.stringify(original));
```

**Limitations:**
- Loses functions, undefined, symbols
- Fails on circular references
- Converts Dates to strings

## Custom Recursive (Full Control)

```typescript
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj) as T;
  if (obj instanceof Map) return new Map(obj) as T;
  if (obj instanceof Set) return new Set(obj) as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as T;

  const clone = {} as T;
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  return clone;
}
```

## Recommendation

Use `structuredClone()` for most cases. It's native, fast, and handles edge cases.
