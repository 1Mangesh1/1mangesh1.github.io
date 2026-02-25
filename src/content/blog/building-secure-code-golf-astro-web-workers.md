---
title: "Building a Secure Code Golf Engine in Astro with Web Workers"
description: "How I refactored a naive `eval` implementation into a secure, sandboxed Web Worker environment that prevents browser freezes and protects user data."
pubDate: 2026-02-25T00:00:00Z
tags: ["Astro", "Web Workers", "Security", "TypeScript", "Performance"]
draft: false
---

When I first built the **Code Golf** feature for this site, I took the easy way out.

I wanted users to write JavaScript to solve problems like "FizzBuzz" or "Fibonacci" in as few characters as possible. To execute their code, I used the nuclear option:

```javascript
// The "naive" approach
const solution = new Function(`"use strict"; ${userCode}; return solve;`)();
const result = solution(args);
```

It worked. I could write code, run it, and see the output instantly.

But then I typed `while(true){}`.

The browser froze. The UI became unresponsive. I couldn't even close the tab gracefully. I had to force-quit the process.

And then I realized: if I can crash my own browser with a simple infinite loop, a malicious user could do much worse. They could access `document.cookie`, read `localStorage`, or inject scripts to redirect visitors.

I needed a sandbox. I needed **Web Workers**.

## The Problem with Main Thread Execution

JavaScript is single-threaded. When you run heavy computation (or an infinite loop) on the main thread, the browser stops painting updates. Buttons don't click, animations don't play, and the user gets frustrated.

Worse, code running on the main thread has access to the **DOM** and the **Window** object. This means user-submitted code isn't just a logic puzzle—it's a potential Cross-Site Scripting (XSS) vulnerability if you ever decide to persist or share solutions.

## The Solution: Web Workers

Web Workers allow you to run JavaScript in a background thread, separate from the main execution thread of your web application.

This gives us two massive benefits:
1.  **Performance:** Heavy calculations don't block the UI.
2.  **Security:** Workers have no access to the DOM (`document`, `window`, `localStorage` are undefined).

It's a natural sandbox.

## The Implementation

Here is how I refactored the Code Golf engine to use Web Workers.

### 1. The Worker Script

I created a standalone file `public/game-scripts/codegolf-worker.js`. This script listens for messages, creates the function from the user's string, and executes it safely.

```javascript
// public/game-scripts/codegolf-worker.js
let userFunction = null;

self.onmessage = function(e) {
  const { type, payload, id } = e.data;

  try {
    if (type === 'init') {
      // Create the function from user code
      // We wrap it to ensure strict mode
      const createFunction = new Function(`
        "use strict";
        ${payload};
        return typeof solve !== 'undefined' ? solve : null;
      `);

      userFunction = createFunction();

      if (typeof userFunction !== 'function') {
         throw new Error("Code must define a function named 'solve'");
      }

      self.postMessage({ type: 'success', id });
    } else if (type === 'run') {
      if (!userFunction) throw new Error("No function initialized.");

      const result = userFunction(...(payload || []));
      self.postMessage({ type: 'result', payload: result, id });
    }
  } catch (err) {
    self.postMessage({ type: 'error', payload: err.message, id });
  }
};
```

### 2. The Main Thread Controller

In my Astro component (`codegolf.astro`), I needed a way to talk to this worker. Since `postMessage` is event-based, I wrapped it in a Promise to make it feel like a normal async function call.

I also added a **Timeout Mechanism**. If the worker doesn't respond within 2 seconds (likely due to an infinite loop), we terminate it and reject the promise.

```typescript
// src/pages/codegolf.astro logic

let worker: Worker | null = null;
let currentJobId = 0;
// Maps to store resolve/reject functions for pending promises
let pendingResolves = {};
let pendingRejects = {};

function sendWorkerMessage(type, payload) {
  return new Promise((resolve, reject) => {
    const id = ++currentJobId;
    pendingResolves[id] = resolve;
    pendingRejects[id] = reject;

    // The Safety Valve: 2-second timeout
    setTimeout(() => {
      if (pendingResolves[id]) {
          pendingRejects[id](new Error("Execution timed out (2s limit). Infinite loop?"));
          terminateAndRestartWorker(); // Kill the frozen worker
      }
    }, 2000);

    worker.postMessage({ type, payload, id });
  });
}
```

### 3. Refactoring from Sync to Async

The hardest part wasn't the worker itself—it was my test suite.

Originally, my tests were synchronous:

```typescript
// Old Synchronous Test
test: (fn) => fn(5) === 120
```

But communicating with a worker is inherently asynchronous. You can't get the result immediately. I had to refactor the entire `Challenge` interface to support async tests:

```typescript
// New Async Test
test: async (run) => (await run(5)) === 120
```

Now, the `run` argument isn't the function itself, but a helper that sends a message to the worker and waits for the response.

## The Result

The experience is seamless. You type code, hit "Run", and get the result.

But try typing this:

```javascript
const solve = () => {
  while(true) {}
}
```

Instead of crashing your browser tab, you'll see a red error message: **"Execution timed out (2s limit). Infinite loop?"**

The UI remains buttery smooth. You can edit the code, fix the loop, and run it again immediately.

## Why This Matters

Security and performance are often treated as conflicting goals. "Sandboxing is slow," they say. "Web Workers are complex."

But in this case, using Web Workers gave us both. We got a non-blocking UI (Performance) and a secure execution environment (Security).

If you're building any feature that executes user-provided content—whether it's code, formulas, or complex queries—get it off the main thread. Your users (and their batteries) will thank you.
