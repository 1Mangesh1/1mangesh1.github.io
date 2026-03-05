// public/game-scripts/codegolf-worker.js

let userFunction = null;

self.onmessage = function(e) {
  const { type, payload, id } = e.data;

  try {
    if (type === 'init') {
      const code = payload;

      const createFunction = new Function(`
        "use strict";
        ${code}
        return solve;
      `);

      try {
        userFunction = createFunction();
      } catch (e) {
        throw new Error("Execution Error: " + e.message);
      }

      if (typeof userFunction !== 'function') {
         throw new Error("Code must define a function named 'solve'. Got type: " + typeof userFunction);
      }

      self.postMessage({ type: 'success', id });
    } else if (type === 'run') {
      if (!userFunction) throw new Error("No function initialized.");
      const args = payload || [];
      const result = userFunction(...args);
      self.postMessage({ type: 'result', payload: result, id });
    }
  } catch (err) {
    self.postMessage({ type: 'error', payload: err.message, id });
  }
};
