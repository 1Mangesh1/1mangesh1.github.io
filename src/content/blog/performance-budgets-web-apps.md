---
title: "Performance Budgets: Keeping Your Web App Fast"
description: "Set, enforce, and monitor performance budgets to prevent your web app from getting slow over time"
pubDate: 2026-02-27T00:00:00Z
tags: ["performance", "web-vitals", "monitoring", "ci-cd", "frontend"]
draft: true
---

Performance doesn't degrade overnight — it dies by a thousand cuts. A 2KB library here, an unoptimized image there, one more third-party script, and suddenly your Lighthouse score is 45.

Performance budgets prevent this slow decay. They define measurable thresholds for your app and break the build when you exceed them. Here's how to set them up, enforce them, and actually keep your app fast.

## What Are Performance Budgets?

A performance budget is a set of limits on metrics that affect user experience. They work like a financial budget — you have a fixed amount to "spend," and every addition has to be justified against what's already there.

**Types of budgets:**

| Type | Examples | Good For |
|------|----------|----------|
| **Timing** | LCP < 2.5s, INP < 200ms | User experience |
| **Quantity** | < 200 requests, < 10 JS files | Complexity control |
| **Size** | Total JS < 300KB, images < 500KB | Transfer cost |
| **Score** | Lighthouse Perf > 90 | Overall health |

Use a mix. Size budgets catch problems at build time. Timing budgets catch problems in production.

## Choosing the Right Metrics

Not all metrics matter equally. Focus on Core Web Vitals plus bundle size:

### Largest Contentful Paint (LCP)
Measures when the main content is visible. Budget: **< 2.5 seconds**.

```
Good: ≤ 2.5s
Needs Improvement: 2.5s – 4.0s
Poor: > 4.0s
```

LCP is usually an image, video, or large text block. Optimizing it means prioritizing above-the-fold content.

### Interaction to Next Paint (INP)
Measures responsiveness to user input. Budget: **< 200 milliseconds**.

```
Good: ≤ 200ms
Needs Improvement: 200ms – 500ms
Poor: > 500ms
```

INP replaced FID in 2024. It captures *all* interactions, not just the first one, making it a much better metric.

### Cumulative Layout Shift (CLS)
Measures visual stability. Budget: **< 0.1**.

```
Good: ≤ 0.1
Needs Improvement: 0.1 – 0.25
Poor: > 0.25
```

CLS bugs are infuriating — you're about to tap a link, the page shifts, and you hit an ad. Set explicit dimensions on images and embeds to prevent this.

### Bundle Size
The metric you can enforce at build time. My typical budgets:

```
Total JavaScript: < 300KB (compressed)
Total CSS: < 50KB (compressed)
Largest JS chunk: < 150KB
Largest image: < 200KB
Total page weight: < 1.5MB
```

## Setting Realistic Budgets

Don't just pick arbitrary numbers. Base budgets on:

1. **Current performance**: Run Lighthouse 5 times, take the median
2. **Competitor analysis**: Be faster than the top 3 competitors
3. **Connection targets**: Your app should load in < 5s on 3G
4. **Business goals**: Amazon found every 100ms of latency cost 1% in sales

```bash
# Quick competitive analysis
npx lighthouse https://competitor1.com --output json --quiet | \
  jq '.audits["total-byte-weight"].numericValue'

npx lighthouse https://competitor2.com --output json --quiet | \
  jq '.audits["total-byte-weight"].numericValue'
```

**Start generous, tighten over time.** A budget you blow immediately gets ignored. Set it 10% below current performance, fix the violations, then tighten further.

## Enforcing Budgets in CI with Lighthouse CI

Lighthouse CI runs audits on every pull request and fails the build if budgets are exceeded.

### Setup

```bash
npm install -D @lhci/cli
```

### Configuration

Create `lighthouserc.json` in your project root:

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/blog"],
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "Local",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "first-contentful-paint": ["warn", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-byte-weight": ["error", { "maxNumericValue": 1500000 }],
        "mainthread-work-breakdown": ["warn", { "maxNumericValue": 4000 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### GitHub Actions Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build
        run: yarn build

      - name: Run Lighthouse CI
        run: npx @lhci/cli autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

Now every PR gets a Lighthouse report, and merges are blocked if budgets are exceeded.

## Bundle Analysis with Vite

Vite (used by Astro) supports visualizing bundle contents:

```bash
# Install the analyzer
npm install -D rollup-plugin-visualizer
```

```typescript
// vite.config.ts or astro.config.mjs integration
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({
      filename: "bundle-stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

```bash
# Generate the report
yarn build
open bundle-stats.html
```

The treemap visualization immediately shows which dependencies dominate your bundle. I've found:
- **moment.js** — replaced with `date-fns` (saved 60KB)
- **lodash** — switched to individual imports (saved 40KB)
- **Unused polyfills** — dropped IE support (saved 25KB)

### Size Limits in CI

Use `size-limit` to enforce per-file budgets:

```json
// package.json
{
  "size-limit": [
    { "path": "dist/**/*.js", "limit": "300 KB", "gzip": true },
    { "path": "dist/**/*.css", "limit": "50 KB", "gzip": true },
    { "path": "dist/index.html", "limit": "15 KB" }
  ],
  "scripts": {
    "size": "size-limit",
    "size:check": "size-limit --why"
  }
}
```

```yaml
# Add to CI
- name: Check bundle size
  run: npx size-limit
```

## Monitoring with the web-vitals Library

Build-time checks catch regressions, but real-user monitoring (RUM) catches what synthetic tests miss.

```typescript
// src/analytics/web-vitals.ts
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";

interface Metric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  navigationType: string;
}

function sendToAnalytics(metric: Metric) {
  // Send to your analytics endpoint
  fetch("/api/vitals", {
    method: "POST",
    body: JSON.stringify({
      name: metric.name,
      value: Math.round(metric.value),
      rating: metric.rating,
      page: window.location.pathname,
      connection: (navigator as any).connection?.effectiveType || "unknown",
      timestamp: Date.now(),
    }),
    keepalive: true, // Survive page unload
  });
}

// Collect all Core Web Vitals
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Key: measure at the 75th percentile.** Your median user might be fine, but 1 in 4 users might be having a terrible experience. Google uses P75 for ranking — you should too.

## Performance Regression Alerts

Turn metrics into actionable alerts:

```typescript
// Simplified alerting logic
interface Budget {
  metric: string;
  threshold: number;
  comparison: "lt" | "gt";
}

const budgets: Budget[] = [
  { metric: "LCP", threshold: 2500, comparison: "lt" },
  { metric: "CLS", threshold: 0.1, comparison: "lt" },
  { metric: "INP", threshold: 200, comparison: "lt" },
];

async function checkBudgets(metrics: Record<string, number>) {
  const violations = budgets.filter((budget) => {
    const value = metrics[budget.metric];
    return budget.comparison === "lt"
      ? value > budget.threshold
      : value < budget.threshold;
  });

  if (violations.length > 0) {
    await sendAlert({
      channel: "#perf-alerts",
      text: `Performance budget exceeded:\n${violations
        .map((v) => `- ${v.metric}: ${metrics[v.metric]} (budget: ${v.threshold})`)
        .join("\n")}`,
    });
  }
}
```

## Case Study: Budget-Driven Optimization

Here's a real example of budgets driving concrete improvements on a project:

**Starting point:** Lighthouse Performance score of 62, LCP 4.1s, Total JS 580KB.

**Budget set:** Lighthouse > 85, LCP < 2.5s, JS < 300KB.

**Changes made:**

| Change | JS Saved | LCP Impact |
|--------|----------|------------|
| Replace moment.js with date-fns | -62KB | -0.2s |
| Lazy-load below-fold images | — | -0.8s |
| Code-split route components | -95KB initial | -0.4s |
| Remove unused CSS (PurgeCSS) | -28KB CSS | -0.1s |
| Preconnect to API domain | — | -0.3s |
| Serve modern image formats (WebP/AVIF) | — | -0.2s |

**Result:** Score 94, LCP 2.1s, Total JS 285KB. All within budget.

The budget didn't just prevent regression — it **forced** the optimization by making every PR measurable.

## Getting Started: A Minimal Setup

You don't need everything at once. Start here:

1. **Today**: Run `npx lighthouse http://localhost:3000 --view` and note your baseline
2. **This week**: Add `lighthouserc.json` with budgets 10% below your baseline
3. **This sprint**: Add Lighthouse CI to your GitHub Actions
4. **This quarter**: Add real-user monitoring with web-vitals

```bash
# One command to start
npx @lhci/cli wizard
```

The budget creates accountability. Without it, performance is everyone's problem and nobody's priority. With it, every PR that busts the budget requires a conscious decision: "Is this feature worth the performance cost?"

That question alone makes your app faster.
