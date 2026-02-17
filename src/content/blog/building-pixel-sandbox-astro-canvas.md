---
title: "Building a Fast Pixel Art Editor with Astro & JS"
description: "Learn how to build a high-performance, responsive pixel art editor using the HTML5 Canvas API and Astro. No React, no overhead—just clean, vanilla JavaScript."
pubDate: 2026-02-17T00:00:00Z
tags: ["astro", "canvas", "javascript", "performance"]
draft: false
---

Here's the reality: modern web development often reaches for heavy frameworks when a simple loop would do. I wanted to add a pixel art editor to my site. I could have pulled in a React canvas library or a heavy image manipulation package.

Instead, I built it with **Vanilla JavaScript** and **Astro**.

The result? A lightning-fast, zero-dependency tool that loads instantly and runs smoothly on any device. Here's how I built the **Pixel Sandbox**.

---

## The Architecture: Astro Shell, Vanilla Core

The site itself is built with [Astro](https://astro.build), which is fantastic for static content. But for a highly interactive tool like a pixel editor, you don't need the overhead of hydration for thousands of grid cells.

My approach was simple:
1.  **Astro**: Renders the UI shell (buttons, layout, initial state).
2.  **Vanilla JS**: Manages the canvas, state, and user interaction.

This separation of concerns keeps the initial page load tiny. The game logic only loads when the user actually opens the game.

---

## The Core Logic: It's Just Arrays

At its heart, a pixel editor is just a 2D array of colors. I didn't need a complex state management library.

```javascript
class PixelStudio {
  constructor() {
    this.gridSize = 32;
    this.grid = [];
    // ...
    this.init();
  }

  clearGrid() {
    // Create a 2D array filled with null (empty) or default values
    this.grid = Array(this.gridSize).fill(null).map(() =>
      Array(this.gridSize).fill(null).map(() => ({ color: null, char: '█' }))
    );
  }
}
```

Each cell stores its color and an ASCII character (for the ASCII mode—more on that later). This data structure is lightweight and easy to serialize to JSON for saving.

---

## Rendering: Canvas API vs. DOM

A common mistake is rendering a grid using `<div>` elements. For a 32x32 grid, that's **1,024 DOM nodes**. If you go up to 64x64, you're managing 4,096 elements. React reconciliation would choke on drag events.

The **Canvas API** is built for this. It's a single DOM element.

Here's the render loop from `public/game-scripts/pixel-drawer.js`:

```javascript
render() {
  // Clear the canvas
  this.ctx.fillStyle = '#ffffff';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

  // Draw checkerboard background (transparency)
  for (let y = 0; y < this.gridSize; y++) {
    for (let x = 0; x < this.gridSize; x++) {
      if ((x + y) % 2 === 0) {
        this.ctx.fillStyle = '#f9fafb';
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  // Draw active pixels
  for (let y = 0; y < this.gridSize; y++) {
    for (let x = 0; x < this.gridSize; x++) {
      const cell = this.grid[y][x];
      if (cell.color) {
        this.ctx.fillStyle = cell.color;
        this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }
  }

  // ... grid lines ...
}
```

Because we're just blitting colored rectangles, this runs easily at 60fps even on low-end mobile devices.

---

## Implementing Tools: Flood Fill

The brush and eraser are trivial (set `grid[y][x]`), but the **Bucket Fill** tool requires a classic algorithm: **Flood Fill**.

I implemented a stack-based approach (iterative) rather than recursive to avoid stack overflow errors on large grids.

```javascript
floodFill(startX, startY, fillColor) {
  // Boundary checks...
  if (startX < 0 || startX >= this.gridSize || startY < 0 || startY >= this.gridSize) return;

  const startCell = this.grid[startY][startX];
  const targetColor = startCell.color;

  // Don't fill if same color
  if (targetColor === fillColor) return;

  const stack = [[startX, startY]];

  while (stack.length) {
    const [x, y] = stack.pop();

    // Bounds check inside loop
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) continue;

    const currentCell = this.grid[y][x];
    if (currentCell.color !== targetColor) continue;

    // Update state
    this.grid[y][x] = { color: fillColor, char: this.currentChar };

    // Add neighbors to stack
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  this.render();
}
```

This is the kind of algorithmic problem that actually comes up in real UI development. Knowing your algorithms > knowing a library API.

---

## Lazy Loading in Astro

To keep the site fast, I don't load the game logic until the user asks for it. In my `games.astro` page, I use a dynamic script loader:

```javascript
function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

// When user clicks "Play":
if (window.PixelStudio) {
  currentGame = new window.PixelStudio();
} else {
  loadScript("/game-scripts/pixel-drawer.js", () => {
    currentGame = new window.PixelStudio();
  });
}
```

This pattern creates a clear boundary between the "content site" and the "application." The blog remains static and SEO-friendly, while the interactive parts are loaded on demand.

---

## Why This Matters

You don't always need a framework. By sticking to browser standards like the Canvas API and Vanilla JS, I built a tool that is:

1.  **Fast**: Direct canvas manipulation.
2.  **Maintainable**: No npm dependency hell.
3.  **Portable**: The core logic is just a JS class I can drop anywhere.

Next time you need an interactive component, ask yourself: *Could this just be a class and a canvas?*

[Play with the Pixel Sandbox here](/games#pixel-drawer)
