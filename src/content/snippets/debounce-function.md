---
title: "Debounce Function"
description: "A reusable debounce utility to limit function execution rate"
language: "typescript"
tags: ["utility", "performance", "events"]
date: 2025-12-09T00:00:00Z
---

Debounce delays function execution until after a pause in calls. Perfect for search inputs, resize handlers, and API calls.

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

## Usage

```typescript
// Search input - only fires 300ms after user stops typing
const handleSearch = debounce((query: string) => {
  fetch(`/api/search?q=${query}`);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

## When to Use

- **Search inputs**: Avoid API calls on every keystroke
- **Window resize**: Limit expensive layout calculations
- **Button clicks**: Prevent double submissions
- **Scroll events**: Throttle scroll-based animations
