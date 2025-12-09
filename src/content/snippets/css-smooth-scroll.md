---
title: "Smooth Scroll with CSS and JS"
description: "Implement smooth scrolling for anchor links and scroll-to-top"
language: "css"
tags: ["animation", "ux", "accessibility"]
date: 2025-12-02T00:00:00Z
---

Enable smooth scrolling with CSS and enhance with JavaScript.

## CSS Only (Simple)

```css
/* Enable smooth scroll for whole page */
html {
  scroll-behavior: smooth;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Account for fixed header */
html {
  scroll-padding-top: 80px; /* Height of your fixed header */
}
```

## JavaScript (More Control)

```javascript
// Smooth scroll to element
function scrollToElement(selector, offset = 0) {
  const element = document.querySelector(selector);
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top,
    behavior: 'smooth'
  });
}

// Scroll to top
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Handle anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const id = anchor.getAttribute('href');
    scrollToElement(id, 80); // 80px offset for fixed header
  });
});
```

## Intersection Observer (Scroll Spy)

```javascript
// Highlight nav link when section is visible
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = document.querySelector(`a[href="#${id}"]`);
      link?.classList.toggle('active', entry.isIntersecting);
    });
  },
  { rootMargin: '-50% 0px -50% 0px' }
);

document.querySelectorAll('section[id]').forEach(section => {
  observer.observe(section);
});
```
