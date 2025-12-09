---
title: "CSS :has() - The Parent Selector"
date: 2025-12-07T00:00:00Z
tags: ["css", "selectors"]
category: "css"
---

CSS finally has a parent selector! The `:has()` pseudo-class lets you style parents based on their children:

```css
/* Style card differently if it has an image */
.card:has(img) {
  padding: 0;
}

/* Style form if any input is invalid */
form:has(input:invalid) {
  border-color: red;
}

/* Style label when its checkbox is checked */
label:has(input:checked) {
  color: green;
}
```

Browser support is now excellent (all modern browsers as of 2024).
