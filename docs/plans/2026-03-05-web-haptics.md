# Web Haptics Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add tactile haptic feedback to the site using the `web-haptics` library so mobile users feel vibrations on button clicks, easter eggs, and game events.

**Architecture:** A single `Haptics.astro` component initialises `WebHaptics`, exposes it as `window.haptics`, and uses event delegation to fire `nudge` on every button/link click. Existing scripts (EasterEggs.astro, game scripts) call `window.haptics?.trigger(...)` — the optional-chain gracefully no-ops on desktop.

**Tech Stack:** `web-haptics` (npm), Astro component, vanilla JS in game scripts

---

### Task 1: Install web-haptics

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

```bash
yarn add web-haptics
```

**Step 2: Verify it appears in dependencies**

```bash
grep web-haptics package.json
```
Expected: `"web-haptics": "^x.x.x"` in `dependencies`

**Step 3: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: add web-haptics dependency"
```

---

### Task 2: Create Haptics.astro component

**Files:**
- Create: `src/components/Haptics.astro`

**Step 1: Write the component**

```astro
---
// Haptics.astro — initialises web-haptics and wires site-wide event delegation
---

<script>
  import { WebHaptics } from 'web-haptics';

  if (WebHaptics.isSupported) {
    const haptics = new WebHaptics();

    // Expose globally so game scripts and EasterEggs can access it
    (window as any).haptics = haptics;

    // Site-wide: nudge on every button or link tap
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const el = target.closest('button, a[href]');
      if (el) haptics.trigger('nudge');
    }, { passive: true });
  }
</script>
```

**Step 2: Verify file exists**

```bash
ls src/components/Haptics.astro
```

**Step 3: Commit**

```bash
git add src/components/Haptics.astro
git commit -m "feat: add Haptics.astro component with site-wide nudge delegation"
```

---

### Task 3: Mount Haptics component in Layout.astro

**Files:**
- Modify: `src/layouts/Layout.astro`

**Step 1: Import and add `<Haptics />` near the bottom of `<body>`**

At the top of the frontmatter, add the import:
```ts
import Haptics from '../components/Haptics.astro';
```

At the bottom of `<body>`, just before the closing `</body>` tag, add:
```astro
<Haptics />
```

**Step 2: Run type check**

```bash
yarn astro check
```
Expected: no new errors

**Step 3: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: mount Haptics component in Layout"
```

---

### Task 4: Wire haptics into EasterEggs.astro

**Files:**
- Modify: `src/components/EasterEggs.astro`

Add `window.haptics?.trigger(...)` calls at the four key easter egg moments.

**Step 1: Konami code → `buzz`**

Inside `triggerKonamiEasterEgg()`, add as the first line of the function body:
```js
window.haptics?.trigger('buzz');
```

**Step 2: Triple-click dancing cat → `success`**

Inside `showDancingCat()`, add as the first line:
```js
window.haptics?.trigger('success');
```

**Step 3: Rainbow mode activate → `buzz`**

Inside `toggleRainbowMode()`, add inside the `if (rainbowMode)` branch as the first line:
```js
window.haptics?.trigger('buzz');
```

**Step 4: Surprise trigger → `nudge`**

Inside `triggerSurprise()`, before the `randomSurprise()` call, add:
```js
window.haptics?.trigger('nudge');
```

**Step 5: Hack mode → `buzz`**

Inside `triggerHackMode()`, add as the first line:
```js
window.haptics?.trigger('buzz');
```

**Step 6: Run type check**

```bash
yarn astro check
```

**Step 7: Commit**

```bash
git add src/components/EasterEggs.astro
git commit -m "feat: add haptic feedback to easter egg triggers"
```

---

### Task 5: Wire haptics into hangman.js

**Files:**
- Modify: `public/game-scripts/hangman.js`

**Step 1: Correct guess → `nudge`**

Find the line `this.sounds.correct();` (around line 195) and add after it:
```js
window.haptics?.trigger('nudge');
```

**Step 2: Wrong guess → `error`**

Find the line `this.sounds.wrong();` (around line 211) and add after it:
```js
window.haptics?.trigger('error');
```

**Step 3: Win → `success`**

Find the line `this.sounds.win();` in the `win()` method (around line 282) and add after it:
```js
window.haptics?.trigger('success');
```

**Step 4: Lose → `error`**

Find the `lose()` method and add at the start of its body:
```js
window.haptics?.trigger('error');
```

**Step 5: Commit**

```bash
git add public/game-scripts/hangman.js
git commit -m "feat: add haptic feedback to hangman game"
```

---

### Task 6: Wire haptics into wack-a-bug.js

**Files:**
- Modify: `public/game-scripts/wack-a-bug.js`

**Step 1: Bug hit → `nudge`**

In `hitBug()`, find `this.sounds.hit();` (around line 318) and add after it:
```js
window.haptics?.trigger('nudge');
```

**Step 2: Boss hit → `success`**

In `hitBoss()`, at the start of the function body, add:
```js
window.haptics?.trigger('success');
```

**Step 3: Miss → `error`**

Find `this.sounds.miss();` (around line 298) and add after it:
```js
window.haptics?.trigger('error');
```

**Step 4: Game over → `error`**

Find `this.sounds.gameOver();` (around line 824) and add after it:
```js
window.haptics?.trigger('error');
```

**Step 5: Commit**

```bash
git add public/game-scripts/wack-a-bug.js
git commit -m "feat: add haptic feedback to wack-a-bug game"
```

---

### Task 7: Build verification

**Step 1: Run production build**

```bash
yarn build
```
Expected: build completes with no errors (type check + Astro build + pagefind)

**Step 2: Commit any remaining files**

```bash
git status
```
If clean, no action needed. If any files unstaged, commit them.
