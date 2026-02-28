---
title: "CSS @layer Gives You Control Over Specificity"
date: 2026-01-10T00:00:00Z
tags: ["css", "specificity"]
category: "css"
draft: true
---

CSS specificity wars are real — especially when mixing third-party CSS (Bootstrap, Tailwind resets, component libraries) with your own styles. `@layer` lets you explicitly control the cascade order, regardless of selector specificity.

## Declaring Layer Order

```css
/* Order matters: later layers win over earlier ones */
@layer reset, base, components, utilities;
```

Now any styles in `utilities` will beat `components`, which beats `base`, which beats `reset` — no matter how specific the individual selectors are.

## Assigning Styles to Layers

```css
@layer reset {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
}

@layer base {
  h1 {
    font-size: 2rem;
    font-weight: 700;
  }
}

@layer components {
  .card h1 {
    font-size: 1.5rem;  /* More specific selector */
  }
}

@layer utilities {
  .text-xl {
    font-size: 1.25rem !important;  /* Simple selector, but layer wins */
  }
}
```

## Importing Third-Party CSS into a Layer

This is the killer feature — contain library styles so your code always wins:

```css
/* Third-party styles go in a low-priority layer */
@import url("bootstrap.css") layer(vendor);

@layer vendor, custom;

@layer custom {
  /* These styles ALWAYS beat Bootstrap, even with simple selectors */
  .btn {
    border-radius: 8px;
  }
}
```

## Unlayered Styles Win

Styles **not** in any layer have the highest priority:

```css
@layer base {
  p { color: blue; }    /* In a layer */
}

p { color: red; }        /* Unlayered — this wins */
```

## Nesting Layers

```css
@layer components {
  @layer card {
    .card { padding: 1rem; }
  }
  @layer button {
    .btn { padding: 0.5rem; }
  }
}
/* Reference as: components.card, components.button */
```

`@layer` is supported in all modern browsers and is essential for any project integrating multiple CSS sources. It turns specificity from a guessing game into an explicit, manageable architecture.
