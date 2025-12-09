---
title: "TypeScript 'satisfies' Operator"
date: 2025-11-03T00:00:00Z
tags: ["typescript", "types"]
category: "javascript"
---

`satisfies` validates a type while preserving the narrower inferred type:

```typescript
type Colors = Record<string, string | number[]>;

// With 'as' - loses specific type info
const colorsAs = {
  red: '#ff0000',
  blue: [0, 0, 255]
} as Colors;
colorsAs.red.toUpperCase(); // Error! Type is string | number[]

// With 'satisfies' - keeps narrow types
const colors = {
  red: '#ff0000',
  blue: [0, 0, 255]
} satisfies Colors;
colors.red.toUpperCase(); // Works! Type is string
colors.blue.map(x => x); // Works! Type is number[]
```

Best of both worlds: validation + inference.
