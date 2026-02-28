---
title: "structuredClone() is the Deep Copy You Always Wanted"
date: 2026-01-30T00:00:00Z
tags: ["javascript", "api"]
category: "javascript"
draft: true
---

Deep copying objects in JavaScript has always been awkward. The old hacks each have problems — `structuredClone()` finally gives us a proper built-in solution.

## The Old Ways (and Their Flaws)

```javascript
const original = {
  date: new Date(),
  set: new Set([1, 2, 3]),
  nested: { a: { b: 1 } }
};

// Spread — shallow copy only
const shallow = { ...original };
shallow.nested.a.b = 99;
console.log(original.nested.a.b); // 99 — oops, shared reference

// JSON round-trip — loses types
const jsonCopy = JSON.parse(JSON.stringify(original));
console.log(jsonCopy.date);       // string, not Date
console.log(jsonCopy.set);        // {} — Set is gone
```

## `structuredClone()` Handles It All

```javascript
const clone = structuredClone(original);

clone.nested.a.b = 99;
console.log(original.nested.a.b); // 1 — independent copy

console.log(clone.date instanceof Date); // true
console.log(clone.set instanceof Set);   // true
console.log(clone.set.has(2));           // true
```

## It Even Handles Circular References

```javascript
const obj = { name: "self" };
obj.self = obj; // circular reference

// JSON.stringify would throw
const cloned = structuredClone(obj);
console.log(cloned.self.self.name); // "self" — works fine
```

## What It Can't Clone

- Functions
- DOM nodes
- Property descriptors (getters/setters)
- Prototype chain

```javascript
structuredClone({ fn: () => {} });
// DOMException: () => {} could not be cloned
```

## Browser & Runtime Support

Available in all modern browsers, Node.js 17+, Deno, and Bun. There's no reason to reach for `JSON.parse(JSON.stringify())` or lodash `cloneDeep` anymore for most use cases.
