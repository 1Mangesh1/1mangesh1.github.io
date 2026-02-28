---
title: "Frontend Performance Testing Tools"
description: "Tools and services for measuring and monitoring frontend performance"
category: "tools"
url: "https://pagespeed.web.dev"
featured: true
tags: ["performance", "frontend", "monitoring"]
date: 2026-02-10T00:00:00Z
---

A curated list of tools for measuring, monitoring, and improving frontend performance. Because you can't optimize what you don't measure.

## Free Testing Tools

- **[PageSpeed Insights](https://pagespeed.web.dev)** — Google's go-to tool. Runs Lighthouse under the hood and provides both lab and field data (from Chrome UX Report). Start every performance audit here.
- **[WebPageTest](https://www.webpagetest.org/)** — The gold standard for detailed performance analysis. Offers filmstrip views, waterfall charts, and the ability to test from multiple locations and devices. Patrick Meenan's masterpiece.
- **[Lighthouse](https://developer.chrome.com/docs/lighthouse/)** — Built into Chrome DevTools. Run audits for performance, accessibility, SEO, and PWA best practices directly in your browser.

## CI/CD Integration

- **[Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)** — Run Lighthouse in your CI pipeline and fail builds that don't meet performance budgets. Essential for preventing performance regressions.
- **[Bundlewatch](https://bundlewatch.io/)** — Monitor bundle sizes in pull requests. Set budgets and get GitHub status checks.

## Monitoring Services

- **[Calibre](https://calibreapp.com/)** — Continuous performance monitoring with beautiful dashboards. Tracks Core Web Vitals over time and alerts on regressions.
- **[SpeedCurve](https://www.speedcurve.com/)** — Synthetic and real user monitoring with competitive benchmarking. Great for enterprise teams.
- **[Sentry Performance](https://sentry.io/for/performance/)** — Real user monitoring integrated with error tracking. See how performance issues correlate with errors.

## Chrome DevTools Deep Cuts

- **Performance tab** — Record and analyze runtime performance. Look for long tasks, layout shifts, and paint timing.
- **Network tab** — Throttle connections, disable cache, and analyze waterfall timing for every request.
- **Coverage tab** (`Cmd+Shift+P` → "Coverage") — See how much of your CSS and JS is actually used on the current page. Often eye-opening.

## Core Web Vitals

The metrics that matter most in 2026: **LCP** (Largest Contentful Paint), **INP** (Interaction to Next Paint), and **CLS** (Cumulative Layout Shift). Every tool above measures these. Know your numbers.
