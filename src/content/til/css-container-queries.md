---
title: "CSS Container Queries Are Game-Changing"
date: 2026-02-25T00:00:00Z
tags: ["css", "responsive", "layout"]
category: "css"
draft: true
---

For years, responsive design meant asking "how wide is the **viewport**?" with media queries. CSS Container Queries flip this — now components can ask "how wide is **my container**?" This is a fundamental shift toward truly reusable, context-aware components.

## The Problem with Media Queries

A card component in a sidebar needs different styles than the same card in a main content area. With media queries, you'd hack around this with wrapper classes or JavaScript. The card itself had no idea where it lived.

## Enter `@container`

First, declare a containment context on the parent:

```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}
```

Then query it from the child:

```css
.card {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@container card (min-width: 400px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
}

@container card (min-width: 700px) {
  .card {
    grid-template-columns: 300px 1fr;
    font-size: 1.1rem;
  }
}
```

Now the same `.card` component automatically adapts whether it's in a narrow sidebar or a wide main column — no viewport knowledge needed.

## Container Query Units

You also get new units: `cqw`, `cqh`, `cqi`, `cqb` — relative to the container's dimensions:

```css
@container (min-width: 300px) {
  .card-title {
    font-size: clamp(1rem, 3cqi, 1.5rem);
  }
}
```

Container queries are supported in all modern browsers and are the single biggest CSS feature for component-driven architecture since Flexbox.
