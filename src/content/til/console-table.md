---
title: "console.table() for Arrays and Objects"
date: 2025-11-05T00:00:00Z
tags: ["javascript", "debugging"]
category: "javascript"
---

Stop using `console.log()` for arrays! Use `console.table()` instead:

```javascript
const users = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
  { name: 'Charlie', age: 35, city: 'Chicago' }
];

console.table(users);
// Displays a beautiful formatted table!

// Show only specific columns
console.table(users, ['name', 'city']);
```

Also works with objects, Maps, and Sets. Game changer for debugging!
