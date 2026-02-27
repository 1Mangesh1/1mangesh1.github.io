---
title: "API Benchmarking for Multi‑Tenant SaaS: A Practical, On‑Point Guide"
description: "Design realistic benchmarks for tenant‑isolated APIs: datasets, scenarios, tools, metrics, diagnostics, and a repeatable report template."
pubDate: 2025-09-20T00:00:00Z
tags:
  [
    "Benchmarking",
    "SaaS",
    "Multi-tenant",
    "Performance",
    "k6",
    "PostgreSQL",
    "Django",
  ]
draft: false
---

This guide shows exactly how to benchmark APIs for a multi‑tenant system and turn results into decisions. It's opinionated, concise, and actionable.

---

## Understanding Multi-Tenancy: The Foundation

Multi-tenancy is a fundamental architectural pattern that shapes how we design, test, and optimize our systems.

### What is a Tenant?

A **tenant** is a logical unit of isolation in a software system. It is a separate "instance" or "workspace" within a shared application. Each tenant represents:

- **A distinct organization** (company, department, team)
- **Isolated data** (customers can't see each other's data)
- **Separate configuration** (custom branding, settings, features)
- **Independent usage patterns** (different load characteristics)

In our healthcare API example, each tenant might be a different medical practice with their own patients, staff, and workflows.

### Single-Tenant vs Multi-Tenant Architecture

#### Single-Tenant Architecture

- **One application instance per customer**
- **Separate databases** for each customer
- **Dedicated infrastructure** (servers, storage, etc.)
- **Complete isolation** but higher costs
- **Example**: Traditional on-premise software installations

```
Customer A: App Instance A → Database A
Customer B: App Instance B → Database B
Customer C: App Instance C → Database C
```

#### Multi-Tenant Architecture

- **Shared application instance** serving multiple customers
- **Shared infrastructure** with logical data separation
- **Cost-effective** scaling and maintenance
- **Example**: Modern SaaS applications (Salesforce, Slack, etc.)

```
Customer A ┐
Customer B ├─→ Shared App Instance → Shared Database (with tenant_id)
Customer C ┘
```

### Why Multi-Tenancy Matters for Benchmarking

Multi-tenant systems introduce unique performance challenges that single-tenant systems don't face:

1. **Noisy Neighbor Problem**: One tenant's heavy usage can impact others
2. **Resource Contention**: Shared database, cache, and compute resources
3. **Data Skew**: Different tenant sizes create uneven load patterns
4. **Isolation Requirements**: Performance optimizations must maintain data separation
5. **Scaling Complexity**: Growth affects all tenants, not just one

### Why Benchmark Multi-Tenant APIs?

Traditional API benchmarking often focuses on single-tenant scenarios, but multi-tenant systems require specialized testing:

- **Realistic Load Patterns**: Test with actual tenant distribution (80% small, 18% medium, 2% large)
- **Isolation Validation**: Ensure one tenant's load doesn't break others
- **Resource Fairness**: Verify that all tenants get fair access to shared resources
- **Capacity Planning**: Understand how tenant growth affects overall system performance
- **SLA Compliance**: Meet performance guarantees across all tenant types

---

## Who this is for

- **Backend/Platform engineers**: need tenant‑aware performance baselines
- **Tech leads**: want repeatable, comparable reports
- **SREs**: need clear signals for capacity and noisy‑neighbor risk

## What you’ll learn

- **Model realistic tenant mixes** (sizes, activity distributions)
- **Design scenarios** that expose bottlenecks across app, DB, cache, and auth
- **Use the right tools**: k6 for scenarios, wrk for raw throughput, Python for setup
- **Collect the right metrics** and diagnose using a sharp checklist
- **Publish a clean report** that your team can act on

---

## The system we benchmark

Assume a common pattern: shared DB, shared schema, tenant isolation by `tenant_id` plus auth claims.

Core endpoints (representative):

- `POST /auth/login` (Cognito/JWT)
- `GET /api/v1/patients?org={tenant}&q=&page=` (read, filter, paginate)
- `POST /api/v1/patients` (write)
- `GET /api/v1/metrics/overview` (aggregates per tenant)

Tenants come in three sizes:

- **S** (80%): 1–50 users, &lt;50k rows
- **M** (18%): 50–200 users, 50k–500k rows
- **L** (2%): 200–2k users, 500k–10M rows

Traffic follows Pareto: ~80% of load from top 20% tenants. You must test skew.

---

## Test data: realistic and reproducible

- **Generate tenants S/M/L** with predictable IDs, e.g., `t-s-###`, `t-m-###`, `t-l-###`
- **Seed hot keys**: top 10 tenants receive 50–70% of traffic
- **Shape data** for filters: date ranges, status flags, partial text matches
- **Protect PII**: use fakes; never copy prod

Quick seeder (Python, simplified):

```python
import random, faker
from datetime import datetime, timedelta

fake = faker.Faker()

def seed_tenant(api, tenant_id, n):
    for _ in range(n):
        payload = {
            "tenant_id": tenant_id,
            "name": fake.name(),
            "email": fake.unique.email(),
            "status": random.choice(["active","inactive"]),
            "created_at": (datetime.utcnow() - timedelta(days=random.randint(0, 365))).isoformat()+"Z"
        }
        api.post("/api/v1/patients", json=payload)
```

---

## Scenarios that matter (multi‑tenant aware)

- **Steady read mix**: 90% GET, 10% POST within a single tenant (S/M/L)
- **Cross‑tenant blend**: weighted round‑robin over S/M/L with Pareto skew
- **Noisy neighbor**: one L tenant at 10× load while others receive baseline
- **Auth‑heavy**: frequent login/refresh (Cognito/JWT verification latency)
- **Filter stress**: heavy search with `q`, date ranges, and pagination
- **Write burst**: ingest 1–5k writes/min for one L tenant

---

## Tools: k6, wrk, and Python (minimal but effective)

### k6: scenario‑driven, tenant‑tagged

```js
// bench.js
import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  thresholds: {
    "http_req_failed{scenario:read}": ["rate&lt;0.01"],
    "http_req_duration{scenario:read}": ["p(95)&lt;300"],
    "http_req_duration{scenario:write}": ["p(95)&lt;500"],
  },
  scenarios: {
    read: {
      executor: "ramping-arrival-rate",
      startRate: 50,
      timeUnit: "1s",
      preAllocatedVUs: 50,
      maxVUs: 400,
      stages: [{ target: 200, duration: "5m" }],
      exec: "readScenario",
    },
    write: {
      executor: "constant-arrival-rate",
      rate: 20,
      timeUnit: "1s",
      duration: "5m",
      preAllocatedVUs: 50,
      exec: "writeScenario",
    },
    noisyNeighbor: {
      executor: "constant-vus",
      vus: 60,
      duration: "5m",
      exec: "noisyScenario",
    },
  },
};

const tenants = {
  hot: ["t-l-001", "t-l-002"],
  warm: ["t-m-001", "t-m-002", "t-m-003"],
  cold: Array.from(
    { length: 20 },
    (_, i) => `t-s-${String(i + 1).padStart(3, "0")}`
  ),
};

function pickTenant(weighted = false) {
  if (!weighted) {
    return tenants.cold[Math.floor(Math.random() * tenants.cold.length)];
  }
  const r = Math.random();
  if (r < 0.6)
    return tenants.hot[Math.floor(Math.random() * tenants.hot.length)];
  if (r < 0.9)
    return tenants.warm[Math.floor(Math.random() * tenants.warm.length)];
  return tenants.cold[Math.floor(Math.random() * tenants.cold.length)];
}

export function readScenario() {
  const t = pickTenant(true);
  const res = http.get(`${__ENV.BASE_URL}/api/v1/patients?org=${t}&q=&page=1`, {
    headers: { Authorization: `Bearer ${__ENV.JWT}` },
    tags: { tenant: t, scenario: "read" },
  });
  check(res, { 200: (r) => r.status === 200 });
  sleep(1);
}

export function writeScenario() {
  const t = pickTenant(true);
  const payload = JSON.stringify({
    tenant_id: t,
    name: `n-${Date.now()}`,
    email: `${Date.now()}@ex.com`,
  });
  const res = http.post(`${__ENV.BASE_URL}/api/v1/patients`, payload, {
    headers: {
      Authorization: `Bearer ${__ENV.JWT}`,
      "Content-Type": "application/json",
    },
    tags: { tenant: t, scenario: "write" },
  });
  check(res, { "201/200": (r) => r.status === 201 || r.status === 200 });
  sleep(0.5);
}

export function noisyScenario() {
  const t = "t-l-001";
  const res = http.get(
    `${__ENV.BASE_URL}/api/v1/patients?org=${t}&page=1&q=x`,
    {
      headers: { Authorization: `Bearer ${__ENV.JWT}` },
      tags: { tenant: t, scenario: "noisy" },
    }
  );
  check(res, { 200: (r) => r.status === 200 });
}
```

Run:

```bash
k6 run -e BASE_URL=https://staging.api -e JWT=$JWT bench.js
```

### wrk: headroom and raw throughput

```bash
wrk -t8 -c256 -d60s --latency --timeout 5s \
  "https://staging.api/api/v1/patients?org=t-l-001&page=1"
```

### Python: warm cache, prepare runs

```python
import requests, random

BASE = "https://staging.api"
HEAD = {"Authorization": f"Bearer {JWT}"}

def warm(paths):
  for p in paths:
    for _ in range(50):
      requests.get(f"{BASE}{p}", headers=HEAD, timeout=5)

warm([f"/api/v1/patients?org=t-m-001&page=1",
      f"/api/v1/patients?org=t-l-001&page=1&q=a"])
```

---

## Metrics that matter (and what they teach you)

- **Latency**: p50, p95, p99 per scenario and per tenant
- **Throughput**: requests/sec by scenario and total
- **Errors**: rate by class (4xx vs 5xx) and endpoint
- **DB**: QPS, slow queries, lock waits, buffer/cache hit ratio, R/W mix
- **Infra**: CPU, memory, GC, network egress
- **Auth**: token validation/refresh latency (Cognito/IdP)
- **Fairness**: p95 by tenant; detect noisy‑neighbor impact

Example (illustrative):

| Scenario       | p95 (ms) | RPS | Error % |
| -------------- | -------- | --- | ------- |
| Read (mix)     | 240      | 180 | 0.3     |
| Write (mix)    | 420      | 40  | 0.6     |
| Noisy Neighbor | 680      | 220 | 1.8     |

---

## Diagnose fast: sharp checklists

### App/API

- N+1 queries, missing select‑related/prefetch
- Inefficient serialization or excessive JSON size
- Thread/worker under‑provisioned; sync calls in request path

### Database (PostgreSQL)

- Missing composite indexes `(tenant_id, created_at)` or `(tenant_id, status)`
- Seq scans on filtered endpoints; verify with `EXPLAIN (ANALYZE, BUFFERS)`
- Connection pool saturation; long transactions; lock contention

### Caching

- Low cache hit rates; missing tenant‑scoped keys (`tenant:cache_key`)
- Stale‑on‑write invalidation not scoped by tenant

### Auth/Identity

- IdP latency spikes; avoid per‑request JWKS fetch; cache keys
- Token introspection on hot path instead of local verification

### Network/Infra

- TLS termination hotspots; keep‑alive disabled; small connection pools

---

## Optimize deliberately (and measure again)

- Add/verify composite indexes; enforce keyset pagination
- Introduce per‑tenant caches; compress responses; enable HTTP keep‑alive
- Batch writes; move heavy work to async jobs
- Tune pool sizes (DB/app); add circuit breakers for IdP
- Enable Postgres RLS plus app‑layer guard to prevent cross‑tenant leakage

---

## Make results stick: a tiny report template

Copy this into your repo (`/benchmarks/report-YYYY-MM-DD.md`) and fill it in.

```markdown
---
title: "API Benchmark Report — YYYY‑MM‑DD"
service: "YourService"
environment: "staging-prodlike"
commit: "<sha>"
scenarios: ["read", "write", "noisyNeighbor"]
tenants: { hot: 2, warm: 3, cold: 20 }
---

## Summary

- Key finding 1
- Key finding 2

## Metrics (high level)

| Scenario | p50 | p95 | p99 | RPS | Error % |
| -------- | --- | --- | --- | --- | ------- |
| read     |     |     |     |     |         |
| write    |     |     |     |     |         |
| noisy    |     |     |     |     |         |

## Regressions vs last run

- Endpoint X p95 +30%

## Top bottlenecks

1. ...
2. ...

## Fixes attempted

- Change A (link to PR)

## Next steps

- [ ] Index `(tenant_id, created_at)` on `patients`
- [ ] Keyset pagination on `/patients`
- [ ] Cache JWKS and token verification
```

---

## Minimal runbook

1. Seed data (S/M/L tenants; skew traffic)
2. Warm caches (Python script)
3. Run k6 scenarios with thresholds
4. Validate with wrk for raw headroom
5. Capture DB/app/auth metrics (Grafana/CloudWatch)
6. Fill the report template and commit to repo

---

Want the broader context? Read the companion post: [Multi‑Tenant Architecture: A Complete Guide](/blog/multi-tenant-architecture-complete-guide).

---

### Benchmark Flow Overview

<!-- ![Benchmark Flow](/images/blogs/benchmarking/benchmark-flow.png) -->
_Figure 1: Complete benchmark workflow from data seeding to optimization_
