---
title: "DevPulse - Real-Time Developer Dashboard"
description: "A beautiful real-time dashboard that aggregates GitHub activity, CI/CD status, deployment metrics, and team velocity into a single pane of glass"
image: "/images/portfolio/devpulse.jpg"
tech: ["React", "TypeScript", "WebSocket", "D3.js", "Node.js", "Redis"]
github: "https://github.com/1Mangesh1/devpulse"
demo: "https://devpulse.mangeshbide.tech"
featured: true
date: 2026-02-01T00:00:00Z
---

## Motivation

Modern development teams juggle dozens of tools — GitHub for code, Actions for CI, Vercel or AWS for deployments, Jira for tracking. Switching between dashboards wastes time and fragments context. DevPulse was born from the frustration of never having a single, unified view of what's happening across the entire software delivery lifecycle.

The goal was simple: build a real-time dashboard that brings all developer metrics into one place, updates instantly, and looks good doing it.

## Architecture

DevPulse follows an event-driven architecture with three core layers:

**Ingestion Layer** — Webhook receivers and polling adapters consume events from GitHub, GitLab, Jenkins, CircleCI, Vercel, and AWS CodePipeline. Each adapter normalizes events into a unified schema before publishing them to a Redis Streams topic.

**Processing Layer** — A Node.js service subscribes to Redis Streams, enriches events with contextual metadata (linking commits to deploys, PRs to CI runs), computes rolling metrics (deploy frequency, lead time, MTTR), and stores aggregated snapshots in Redis hashes for fast retrieval.

**Presentation Layer** — A React + TypeScript frontend connects via WebSocket to receive real-time event pushes. D3.js powers the interactive charts — deploy frequency heatmaps, build duration trends, and team velocity sparklines. The UI is fully themeable and supports customizable widget layouts persisted per user.

## Key Features

- **Live Activity Feed**: A real-time stream of commits, PRs, builds, and deployments with filtering by repo, team, or author
- **DORA Metrics**: Automated calculation of Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Mean Time to Recovery
- **Custom Dashboards**: Drag-and-drop widget layout with saved configurations per user
- **Alerting**: Configurable threshold alerts for build failures, deploy rollbacks, and metric regressions
- **Team Insights**: Per-developer and per-team breakdowns of contribution patterns and review turnaround

## Challenges

**Handling High-Frequency Updates** — During peak hours, a busy organization can generate hundreds of events per minute. Naively pushing every event to the frontend caused render thrashing. The solution was a server-side batching strategy: events are buffered in 500ms windows and sent as consolidated payloads, reducing WebSocket message volume by 80% without perceptible latency.

**D3 Chart Performance** — Rendering thousands of data points in real-time D3 charts created jank on lower-end machines. Moving to canvas-based rendering for dense charts (heatmaps, scatter plots) while keeping SVG for interactive elements (tooltips, click handlers) gave the best balance of performance and interactivity.

**Redis Memory Management** — Storing raw events indefinitely would exhaust Redis memory. A TTL-based eviction strategy keeps only the last 30 days of raw events, while pre-computed aggregates are stored permanently with minimal overhead (~2KB per metric per day).

## Tech Decisions

- **WebSocket over SSE**: Chose WebSocket for bidirectional communication — the client sends filter/subscription changes, and the server pushes matching events
- **Redis over Kafka**: For the target scale (small-to-medium teams), Redis Streams provides sufficient throughput with dramatically simpler operations
- **D3.js over Chart.js/Recharts**: D3 offered the flexibility needed for custom visualizations like the commit heatmap and dependency flow diagrams
