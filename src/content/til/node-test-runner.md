---
title: "Node.js Has a Built-In Test Runner"
date: 2026-02-20T00:00:00Z
tags: ["node", "testing"]
category: "javascript"
draft: true
---

Since Node.js 18 (stable in 20+), there's a built-in test runner — no Jest, Mocha, or Vitest needed for simple cases. Import from `node:test` and you're good to go.

## Basic Usage

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Math utilities', () => {
  it('should add numbers correctly', () => {
    assert.strictEqual(1 + 2, 3);
  });

  it('should handle negative numbers', () => {
    assert.strictEqual(-1 + -2, -3);
  });
});
```

Run it with:

```bash
node --test math.test.js

# Or run all test files in a directory
node --test **/*.test.js
```

## Async Tests and Subtests

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('fetch user data', async (t) => {
  const user = await getUser(1);

  await t.test('has correct name', () => {
    assert.strictEqual(user.name, 'Alice');
  });

  await t.test('has valid email', () => {
    assert.match(user.email, /@/);
  });
});
```

## Mocking

```javascript
import { test, mock } from 'node:test';

test('mocks a function', () => {
  const fn = mock.fn(() => 42);
  assert.strictEqual(fn(), 42);
  assert.strictEqual(fn.mock.calls.length, 1);
});
```

## Why Use It?

- **Zero dependencies** — ships with Node
- **Fast startup** — no framework overhead
- **TAP output** — integrates with CI tooling
- **Built-in coverage** via `--experimental-test-coverage`

For small projects, scripts, or libraries, this eliminates the "which test framework?" decision entirely.
