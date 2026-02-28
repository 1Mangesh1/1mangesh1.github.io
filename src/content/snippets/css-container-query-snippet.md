---
title: "Responsive Card with Container Queries"
description: "A responsive card component using CSS container queries instead of media queries"
language: "css"
tags: ["responsive", "layout", "modern-css"]
date: 2026-02-05T00:00:00Z
draft: true
---

## HTML Structure

```html
<div class="card-grid">
  <div class="card-container">
    <article class="card">
      <img src="cover.jpg" alt="Article cover" class="card__image" />
      <div class="card__body">
        <span class="card__tag">Design</span>
        <h3 class="card__title">Container Queries Are Here</h3>
        <p class="card__excerpt">
          Build truly modular components that adapt to their parent — not the viewport.
        </p>
        <div class="card__meta">
          <span>5 min read</span>
          <time datetime="2026-02-05">Feb 5, 2026</time>
        </div>
      </div>
    </article>
  </div>
</div>
```

## CSS with Container Queries

```css
/* ------------------------------------------------
   1. Establish the containment context
   ------------------------------------------------ */
.card-container {
  container-type: inline-size; /* enables @container on inline axis */
  container-name: card;        /* optional — lets you target by name */
}

/* ------------------------------------------------
   2. Base card styles (smallest / default)
   ------------------------------------------------ */
.card {
  display: grid;
  grid-template-rows: 180px 1fr;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface, #fff);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
}

.card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card__tag {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent, #6366f1);
}

.card__title {
  font-size: 1.125rem;
  line-height: 1.3;
  margin: 0;
}

.card__excerpt {
  display: none; /* hidden at small sizes */
}

.card__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--muted, #6b7280);
  margin-top: auto;
}

/* ------------------------------------------------
   3. Medium container — show excerpt
   ------------------------------------------------ */
@container card (min-width: 320px) {
  .card__excerpt {
    display: block;
    font-size: 0.875rem;
    color: var(--muted, #6b7280);
    line-height: 1.5;
  }

  .card__title {
    font-size: 1.25rem;
  }
}

/* ------------------------------------------------
   4. Large container — switch to horizontal layout
   ------------------------------------------------ */
@container card (min-width: 520px) {
  .card {
    grid-template-rows: auto;
    grid-template-columns: 240px 1fr;
  }

  .card__image {
    height: 100%;
    min-height: 200px;
  }

  .card__body {
    padding: 1.25rem;
    gap: 0.75rem;
  }

  .card__title {
    font-size: 1.5rem;
  }

  .card__excerpt {
    font-size: 1rem;
  }
}

/* ------------------------------------------------
   5. Grid wrapper using container queries too
   ------------------------------------------------ */
.card-grid {
  container-type: inline-size;
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
  grid-template-columns: 1fr;
}

@container (min-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 960px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Why container queries over media queries?**

- **Component-driven**: the card adapts to *its container*, not the viewport. Drop it in a sidebar or a full-width section and it just works.
- **Composable**: no need to define breakpoints globally — each component owns its own responsive behavior.
- **`container-name`**: lets you target specific ancestors when containers are nested.

**Browser support**: all modern browsers (Chrome 105+, Firefox 110+, Safari 16+).
