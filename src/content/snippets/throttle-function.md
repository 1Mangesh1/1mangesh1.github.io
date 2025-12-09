---
title: "Throttle Function"
description: "Limit function execution to at most once per time period"
language: "typescript"
tags: ["utility", "performance", "events"]
date: 2025-10-08T00:00:00Z
---

Throttle ensures a function runs at most once per specified interval. Unlike debounce, it guarantees regular execution during continuous calls.

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

## Usage

```typescript
// Scroll handler - fires at most every 100ms
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 100);

window.addEventListener('scroll', handleScroll);
```

## Debounce vs Throttle

| Scenario | Use |
|----------|-----|
| Search input | Debounce |
| Scroll position | Throttle |
| Window resize | Throttle |
| Form validation | Debounce |
| Game loop | Throttle |
