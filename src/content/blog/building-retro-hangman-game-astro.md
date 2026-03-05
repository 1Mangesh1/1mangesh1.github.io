---
title: "Building a Retro Hangman Game with Vanilla JS in Astro"
description: "Why React is overkill for simple browser games. A clean, vanilla JS implementation of Hangman in Astro."
pubDate: 2023-10-27T10:00:00Z
updatedDate: 2023-10-27T10:00:00Z
heroImage: "/blog-placeholder-3.jpg"
tags: ["javascript", "astro", "game-dev"]
draft: false
ogImage: "/blog-placeholder-3.jpg"
---

Let's be real: you don't need a 2MB bundle to guess letters in a word. I've seen too many "simple" game tutorials that start with `npx create-react-app`. That's like renting a crane to hang a picture frame.

For my latest project, I wanted to build a retro-style Hangman game. No frameworks, no state management libraries, just raw HTML, CSS, and Vanilla JavaScript. And I wanted to ship it with Astro because it stays out of the way.

## The Problem: Framework Fatigue

Modern frontend development often defaults to complexity. We reach for React, Vue, or Svelte before asking if we even need them. For a game like Hangman, the state is simple:
- A secret word.
- A set of guessed letters.
- A counter for wrong guesses.

We don't need a virtual DOM for this. We need direct DOM manipulation. It's faster, lighter, and honestly, more fun.

## The Solution: Vanilla JS + Astro

Here's the architecture:
1.  **Astro Component**: Handles the initial HTML shell and loads the styles.
2.  **CSS**: Uses a pixelated font and NES-style borders for that 8-bit aesthetic.
3.  **Vanilla JS Class**: Encapsulates the game logic and handles UI updates.

### Step 1: The Markup

The HTML is straightforward. We need a display area for the word, a keyboard for input, and a canvas for drawing the hangman.

```html
<div id="hangman-game" class="retro-container">
  <canvas id="hangman-canvas" width="200" height="250"></canvas>
  <div id="word-display" class="word-display"></div>
  <div id="keyboard" class="keyboard"></div>
  <div id="status-message" class="status"></div>
  <button id="reset-btn" class="retro-btn">New Game</button>
</div>
```

### Step 2: The Logic

I built a `HangmanGame` class to manage everything. It keeps the global namespace clean and makes the code reusable.

```javascript
class CodeHangman {
  constructor() {
    this.canvas = document.getElementById('hangman-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.wordDisplay = document.getElementById('word-display');
    this.keyboard = document.getElementById('keyboard');
    this.status = document.getElementById('status-message');
    this.resetBtn = document.getElementById('reset-btn');

    this.words = ['VARIABLE', 'FUNCTION', 'SYNTAX', 'COMPILE', 'RECURSION'];
    this.maxMistakes = 6;

    this.init();
  }

  init() {
    this.mistakes = 0;
    this.guesses = new Set();
    this.secretWord = this.words[Math.floor(Math.random() * this.words.length)];
    this.gameOver = false;

    this.renderKeyboard();
    this.updateDisplay();
    this.drawHangman();

    this.resetBtn.onclick = () => this.init();
  }

  handleGuess(letter) {
    if (this.gameOver || this.guesses.has(letter)) return;

    this.guesses.add(letter);
    if (!this.secretWord.includes(letter)) {
      this.mistakes++;
    }

    this.checkGameStatus();
    this.updateDisplay();
    this.drawHangman();
  }

  // ... rendering logic omitted for brevity
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CodeHangman();
});
```

### Step 3: Drawing with Canvas

The `drawHangman` method uses the Canvas API to draw the gallows and the stick figure. It's performant and pixel-perfect.

```javascript
drawHangman() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.lineWidth = 4;
  this.ctx.strokeStyle = '#333';

  // Draw base
  this.ctx.beginPath();
  this.ctx.moveTo(20, 230);
  this.ctx.lineTo(180, 230);
  this.ctx.stroke();

  // Draw progressive parts based on this.mistakes
  // ...
}
```

## Why This Matters

By stripping away the framework, we get:
1.  **Zero hydration cost**: The browser executes the script, and that's it.
2.  **Instant interactivity**: No waiting for a massive bundle to parse.
3.  **Better understanding**: You remember how `document.getElementById` actually works.

## Conclusion

Next time you build a small tool or game, resist the urge to `npm install` everything. Try building it with the platform. You might be surprised at how capable Vanilla JS has become.

Check out the source code on my GitHub if you want to fork it and add your own words. Happy coding.
