---
title: "Optional Chaining vs Nullish Coalescing"
date: 2023-12-09T00:00:00Z
tags: ["javascript", "es2020"]
category: "javascript"
draft: true
---

Today I learned the difference between `?.` and `??` in JavaScript:

**Optional Chaining (`?.`)** - Safely access nested properties:
```javascript
const name = user?.profile?.name; // undefined if any part is null/undefined
```

**Nullish Coalescing (`??`)** - Default only for null/undefined:
```javascript
const count = data.count ?? 0; // 0 only if count is null/undefined
// Unlike ||, this preserves falsy values like 0 or ""
```

Combine them for powerful defaults:
```javascript
const theme = user?.settings?.theme ?? 'dark';
```
