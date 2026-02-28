---
title: "Building a Design System from Scratch with Tailwind CSS"
description: "Create a consistent, scalable design system using Tailwind CSS and component patterns"
pubDate: 2026-01-10T00:00:00Z
tags: ["tailwind", "css", "design-system", "ui", "frontend"]
draft: true
---

A design system isn't a component library — it's the shared language between design and development. With Tailwind CSS, you can build one that enforces consistency without fighting the framework. Here's how to go from a blank `tailwind.config` to a documented, maintainable set of design tokens and components.

## Start with Design Tokens

Design tokens are the atomic values your entire system is built from. In Tailwind, they live in your config file:

```javascript
// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",  // Primary
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f9fafb",
          tertiary: "#f3f4f6",
          dark: "#111827",
          "dark-secondary": "#1f2937",
          "dark-tertiary": "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "heading": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "caption": ["0.875rem", { lineHeight: "1.5" }],
      },
      spacing: {
        "section": "5rem",
        "card": "1.5rem",
        "input": "0.75rem",
      },
      borderRadius: {
        "card": "0.75rem",
        "button": "0.5rem",
        "input": "0.375rem",
        "badge": "9999px",
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "card-hover": "0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)",
        "button": "0 1px 2px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};
```

Now instead of `bg-blue-500` scattered everywhere, you use `bg-brand-500`. Change the palette once, it updates everywhere.

## Button Component

Buttons are the first component every design system needs. Build variants with Tailwind utility classes:

```html
<!-- Base button classes -->
<!-- Primary -->
<button class="inline-flex items-center justify-center gap-2
  px-4 py-2 text-sm font-medium
  bg-brand-500 text-white
  rounded-button shadow-button
  hover:bg-brand-600 active:bg-brand-700
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-brand-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-colors duration-150">
  Primary Button
</button>

<!-- Secondary / Outline -->
<button class="inline-flex items-center justify-center gap-2
  px-4 py-2 text-sm font-medium
  bg-transparent text-brand-600
  border border-brand-300
  rounded-button shadow-button
  hover:bg-brand-50 active:bg-brand-100
  dark:text-brand-400 dark:border-brand-700
  dark:hover:bg-brand-950
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-brand-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-colors duration-150">
  Secondary Button
</button>

<!-- Ghost -->
<button class="inline-flex items-center justify-center gap-2
  px-4 py-2 text-sm font-medium
  bg-transparent text-gray-700
  rounded-button
  hover:bg-gray-100 active:bg-gray-200
  dark:text-gray-300 dark:hover:bg-gray-800
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-brand-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-colors duration-150">
  Ghost Button
</button>
```

### Sizes

Consistent sizing through padding and text scale:

```html
<!-- Small -->
<button class="px-3 py-1.5 text-xs rounded-button ...">Small</button>

<!-- Medium (default) -->
<button class="px-4 py-2 text-sm rounded-button ...">Medium</button>

<!-- Large -->
<button class="px-6 py-3 text-base rounded-button ...">Large</button>
```

## Input Component

Inputs need careful attention to states — default, focus, error, disabled:

```html
<!-- Default input -->
<div class="space-y-1.5">
  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
    Email address
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    class="w-full px-input py-2 text-body
      bg-surface dark:bg-surface-dark
      border border-gray-300 dark:border-gray-600
      rounded-input shadow-sm
      placeholder:text-gray-400
      focus:outline-none focus:ring-2 focus:ring-brand-500
      focus:border-brand-500
      disabled:bg-gray-50 disabled:text-gray-500
      transition-shadow duration-150"
  />
</div>

<!-- Error state -->
<div class="space-y-1.5">
  <label class="block text-sm font-medium text-red-600 dark:text-red-400">
    Email address
  </label>
  <input
    type="email"
    value="invalid-email"
    aria-invalid="true"
    class="w-full px-input py-2 text-body
      bg-red-50 dark:bg-red-950
      border border-red-500
      rounded-input
      focus:outline-none focus:ring-2 focus:ring-red-500
      transition-shadow duration-150"
  />
  <p class="text-sm text-red-600 dark:text-red-400">
    Please enter a valid email address.
  </p>
</div>
```

## Card Component

Cards are containers for grouped content. The key is consistent padding, shadow, and border-radius:

```html
<!-- Basic card -->
<div class="p-card bg-surface dark:bg-surface-dark
  border border-gray-200 dark:border-gray-700
  rounded-card shadow-card
  hover:shadow-card-hover
  transition-shadow duration-200">
  <h3 class="text-heading text-gray-900 dark:text-gray-100">
    Card Title
  </h3>
  <p class="mt-2 text-body text-gray-600 dark:text-gray-400">
    Card description goes here with supporting text.
  </p>
</div>

<!-- Card with image -->
<div class="overflow-hidden bg-surface dark:bg-surface-dark
  border border-gray-200 dark:border-gray-700
  rounded-card shadow-card
  hover:shadow-card-hover transition-shadow duration-200">
  <img
    src="/images/cover.jpg"
    alt="Project screenshot"
    class="w-full h-48 object-cover"
  />
  <div class="p-card">
    <h3 class="text-heading text-gray-900 dark:text-gray-100">
      Featured Project
    </h3>
    <p class="mt-2 text-body text-gray-600 dark:text-gray-400">
      Built with Astro, TypeScript, and Tailwind CSS.
    </p>
    <div class="mt-4 flex gap-2">
      <span class="px-2.5 py-0.5 text-xs font-medium
        bg-brand-50 text-brand-700
        dark:bg-brand-950 dark:text-brand-300
        rounded-badge">Astro</span>
      <span class="px-2.5 py-0.5 text-xs font-medium
        bg-brand-50 text-brand-700
        dark:bg-brand-950 dark:text-brand-300
        rounded-badge">TypeScript</span>
    </div>
  </div>
</div>
```

## Badge Component

Badges for status, tags, and labels:

```html
<!-- Variants -->
<span class="px-2.5 py-0.5 text-xs font-medium rounded-badge
  bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
  Default
</span>

<span class="px-2.5 py-0.5 text-xs font-medium rounded-badge
  bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
  Success
</span>

<span class="px-2.5 py-0.5 text-xs font-medium rounded-badge
  bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
  Error
</span>

<span class="px-2.5 py-0.5 text-xs font-medium rounded-badge
  bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
  Warning
</span>
```

## Dark Mode Strategy

Using `class`-based dark mode (set in the Tailwind config), toggle via JavaScript:

```javascript
// Theme toggle logic
const toggle = document.getElementById("theme-toggle");

function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

// Initialize from localStorage or system preference
const stored = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(stored || (prefersDark ? "dark" : "light"));

toggle?.addEventListener("click", () => {
  const isDark = document.documentElement.classList.contains("dark");
  setTheme(isDark ? "light" : "dark");
});
```

Define semantic surface colors in your config (as we did above with `surface`) so dark mode is a token swap, not a per-component effort.

## Responsive Utilities

Create consistent breakpoint behavior with utility patterns:

```html
<!-- Responsive grid that adapts from 1 → 2 → 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards here -->
</div>

<!-- Stack to row layout change -->
<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
  <h2 class="text-heading">Section Title</h2>
  <button class="ml-auto ...">Action</button>
</div>

<!-- Responsive spacing with section token -->
<section class="py-12 md:py-section px-4 md:px-8">
  <!-- Content -->
</section>
```

## Documenting Your System

Create a living style guide page that renders your actual components:

```astro
---
// src/pages/styleguide.astro (for internal use)
import Layout from "../layouts/Layout.astro";
---
<Layout title="Style Guide">
  <div class="max-w-4xl mx-auto py-section px-4 space-y-16">
    <section>
      <h2 class="text-display mb-8">Colors</h2>
      <div class="grid grid-cols-5 md:grid-cols-10 gap-2">
        {[50,100,200,300,400,500,600,700,800,900].map(shade => (
          <div class={`h-16 rounded bg-brand-${shade}`}
               title={`brand-${shade}`}></div>
        ))}
      </div>
    </section>

    <section>
      <h2 class="text-display mb-8">Typography</h2>
      <p class="text-display-lg">Display Large</p>
      <p class="text-display">Display</p>
      <p class="text-heading">Heading</p>
      <p class="text-body">Body text</p>
      <p class="text-caption">Caption text</p>
    </section>

    <section>
      <h2 class="text-display mb-8">Buttons</h2>
      <div class="flex flex-wrap gap-4">
        <!-- Render each button variant -->
      </div>
    </section>
  </div>
</Layout>
```

## Testing Visual Regressions

Use Playwright for automated screenshot comparisons:

```javascript
// tests/visual.spec.ts
import { test, expect } from "@playwright/test";

test("button variants match snapshot", async ({ page }) => {
  await page.goto("/styleguide#buttons");
  const buttons = page.locator("section:has-text('Buttons')");
  await expect(buttons).toHaveScreenshot("buttons.png", {
    maxDiffPixelRatio: 0.01,
  });
});

test("dark mode renders correctly", async ({ page }) => {
  await page.goto("/styleguide");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await expect(page).toHaveScreenshot("styleguide-dark.png", {
    maxDiffPixelRatio: 0.01,
  });
});
```

Run with `npx playwright test --update-snapshots` to create baselines, then subsequent runs catch regressions.

## Key Takeaways

1. **Tokens first** — define colors, spacing, and typography in `tailwind.config` before writing components
2. **Semantic naming** — use `brand`, `surface`, `card` instead of raw color/size values
3. **Dark mode by default** — every component gets a `dark:` variant from day one
4. **States matter** — hover, focus, active, disabled, error — handle them all
5. **Document with real components** — a styleguide page prevents drift between design and implementation

A design system in Tailwind isn't about abstracting away utility classes — it's about making the right choices effortless by encoding them into your config and component patterns.
