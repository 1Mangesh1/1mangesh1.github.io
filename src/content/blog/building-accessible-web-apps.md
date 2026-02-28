---
title: "Building Accessible Web Apps: A Developer's Checklist"
description: "A practical accessibility guide that goes beyond alt tags — make your web apps usable by everyone"
pubDate: 2026-01-22T00:00:00Z
tags: ["accessibility", "a11y", "html", "aria", "frontend"]
draft: true
---

Accessibility isn't a feature you bolt on at the end — it's a quality of well-written code. When you build with accessibility in mind, you're not just helping users with disabilities; you're building more robust, usable software for everyone.

Here's a practical, code-first checklist I use on every project.

## 1. Start with Semantic HTML

The single biggest accessibility win costs zero effort: use the right HTML elements.

```html
<!-- Bad: div soup -->
<div class="nav">
  <div class="nav-item" onclick="navigate('/')">Home</div>
  <div class="nav-item" onclick="navigate('/about')">About</div>
</div>

<!-- Good: semantic elements -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>
```

Semantic HTML gives you keyboard navigation, screen reader announcements, and proper focus management **for free**. A `<button>` is focusable, activatable with Enter/Space, and announced as "button" — a `<div onclick>` is none of those things.

**Key semantic elements to use:**
- `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>` — landmark regions
- `<button>` — for actions, `<a>` — for navigation
- `<h1>`–`<h6>` — heading hierarchy (never skip levels)
- `<ul>`, `<ol>` — lists that screen readers can count and navigate
- `<table>` with `<th>`, `<caption>` — for tabular data

## 2. ARIA: When to Use It (and When NOT To)

ARIA (Accessible Rich Internet Applications) fills gaps where HTML semantics fall short. But the first rule of ARIA is: **don't use ARIA if a native HTML element can do the job.**

```html
<!-- Bad: ARIA where HTML works -->
<div role="button" tabindex="0" aria-label="Submit form">Submit</div>

<!-- Good: just use a button -->
<button type="submit">Submit</button>

<!-- Good use of ARIA: custom component -->
<div
  role="tablist"
  aria-label="Product details"
>
  <button role="tab" aria-selected="true" aria-controls="panel-1">
    Description
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">
    Reviews
  </button>
</div>
<div role="tabpanel" id="panel-1">...</div>
```

**Common ARIA patterns you'll actually need:**
- `aria-label` / `aria-labelledby` — label elements without visible text
- `aria-expanded` — disclosure widgets, accordions, menus
- `aria-live` — dynamic content announcements
- `aria-hidden="true"` — decorative elements that should be ignored
- `role="alert"` — urgent notifications

## 3. Keyboard Navigation

Every interactive element must be operable with a keyboard. No exceptions.

```css
/* Never do this without a replacement */
*:focus { outline: none; }

/* Do this instead */
*:focus-visible {
  outline: 2px solid #4A90D9;
  outline-offset: 2px;
}
```

**Test your app with just the keyboard:**
- `Tab` / `Shift+Tab` — moves focus between interactive elements
- `Enter` / `Space` — activates buttons and links
- `Escape` — closes modals and dropdowns
- Arrow keys — navigates within composite widgets (tabs, menus, grids)

## 4. Focus Management

When the DOM changes dynamically, focus can get lost. Manage it explicitly.

```typescript
// When opening a modal
function openModal(modalId: string) {
  const modal = document.getElementById(modalId);
  modal?.setAttribute("aria-hidden", "false");
  
  // Move focus to the first focusable element
  const firstFocusable = modal?.querySelector<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}

// Trap focus inside the modal
function trapFocus(modal: HTMLElement) {
  const focusable = modal.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// When closing, return focus to the trigger
function closeModal(modalId: string, trigger: HTMLElement) {
  const modal = document.getElementById(modalId);
  modal?.setAttribute("aria-hidden", "true");
  trigger.focus(); // Return focus to what opened the modal
}
```

## 5. Color Contrast

WCAG 2.1 requires a minimum contrast ratio of **4.5:1** for normal text and **3:1** for large text.

```css
/* Failing contrast — looks fine to some, invisible to others */
.subtle-text {
  color: #999999; /* 2.85:1 against white — FAIL */
  background: #ffffff;
}

/* Passing contrast */
.readable-text {
  color: #595959; /* 7:1 against white — AAA */
  background: #ffffff;
}

/* Don't rely on color alone to convey meaning */
.error-field {
  border-color: #d32f2f;
  border-width: 2px; /* Visual indicator beyond color */
}
.error-message {
  color: #d32f2f;
}
.error-message::before {
  content: "⚠ "; /* Icon as additional signal */
}
```

Tools: Chrome DevTools contrast checker, [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/), the axe browser extension.

## 6. Screen Reader Testing

Use an actual screen reader at least once per feature. On macOS, VoiceOver is built in (`Cmd + F5`).

**Quick VoiceOver test checklist:**
- Can you navigate by headings? (`VO + Cmd + H`)
- Are form labels announced correctly?
- Do images have meaningful alt text (or `alt=""` for decorative)?
- Are dynamic changes announced?
- Is the reading order logical?

```html
<!-- Decorative image — hide from screen readers -->
<img src="/decorative-wave.svg" alt="" role="presentation" />

<!-- Informative image — describe it -->
<img src="/chart-revenue.png" alt="Revenue grew 45% from Q1 to Q4 2025" />

<!-- Complex image — link to full description -->
<figure>
  <img src="/architecture-diagram.png" alt="System architecture diagram" aria-describedby="arch-desc" />
  <figcaption id="arch-desc">
    The system consists of three layers: a React frontend, a Node.js API gateway, and PostgreSQL database...
  </figcaption>
</figure>
```

## 7. Form Accessibility

Forms are where accessibility most commonly breaks down.

```html
<!-- Every input needs a label -->
<label for="email">Email address</label>
<input
  type="email"
  id="email"
  name="email"
  required
  aria-describedby="email-hint email-error"
  aria-invalid="false"
/>
<p id="email-hint" class="hint">We'll never share your email.</p>
<p id="email-error" class="error" role="alert" hidden>
  Please enter a valid email address.
</p>
```

**Form rules:**
- Every `<input>` gets a `<label>` with matching `for`/`id`
- Group related fields with `<fieldset>` and `<legend>`
- Use `aria-describedby` for hints and error messages
- Set `aria-invalid` on validation failure
- Use `role="alert"` so errors are announced immediately

## 8. Dynamic Content Announcements

When content changes without a page reload, screen readers need to be told.

```html
<!-- Live region for status updates -->
<div aria-live="polite" aria-atomic="true" id="status">
  <!-- Dynamically updated content is announced -->
</div>
```

```typescript
function announceToScreenReader(message: string) {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = message;
  }
}

// After async action completes
announceToScreenReader("3 search results loaded");
```

Use `aria-live="polite"` for non-urgent updates (search results, notifications) and `aria-live="assertive"` for urgent ones (errors, time-sensitive alerts).

## 9. Reduced Motion

Respect users who have enabled "prefers reduced motion" in their OS settings.

```css
/* Default: include animations */
.card {
  transition: transform 0.3s ease;
}
.card:hover {
  transform: translateY(-4px);
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```typescript
// Check in JavaScript too
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion) {
  element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
}
```

## 10. Automated Testing with axe-core

Catch ~30–40% of accessibility issues automatically. Pair with manual testing for full coverage.

```typescript
// In your test suite (e.g., Playwright)
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home page has no accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

// In CI — lint HTML with axe
// package.json
{
  "scripts": {
    "test:a11y": "axe http://localhost:3000 --exit"
  }
}
```

**My testing pyramid for a11y:**
1. **Linting** — eslint-plugin-jsx-a11y catches issues at write time
2. **Unit tests** — axe-core in component tests
3. **Integration tests** — Playwright + axe on full pages
4. **Manual testing** — keyboard + screen reader on key flows

## The Checklist

Before shipping any feature, I run through this:

- [ ] Semantic HTML used (no `<div>` buttons)
- [ ] Keyboard navigable (Tab, Enter, Escape all work)
- [ ] Focus managed on route changes and modals
- [ ] Color contrast ≥ 4.5:1
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] Forms labeled and error states announced
- [ ] Animations respect `prefers-reduced-motion`
- [ ] axe-core passes with zero violations

Accessibility is a practice, not a checklist. But a checklist is a great place to start.
