---
title: "Edge Computing with Cloudflare Workers: Beyond the Basics"
description: "Advanced patterns for building globally distributed applications on Cloudflare's edge network"
pubDate: 2026-02-22T00:00:00Z
tags: ["cloudflare", "edge-computing", "serverless", "workers"]
draft: true
---

Cloudflare Workers run your code in over 300 data centers worldwide, within milliseconds of virtually every user on the internet. But most tutorials only scratch the surface — showing you how to return "Hello World" from the edge. Let's go deeper and explore advanced patterns for building real applications on Cloudflare's edge network.

## Workers Runtime vs Node.js

First, an important distinction: Workers don't run Node.js. They run on **workerd**, Cloudflare's custom runtime based on the V8 JavaScript engine. This means:

- **No filesystem access** — no `fs.readFile()`
- **No long-running processes** — Workers are request/response oriented
- **Web-standard APIs** — `fetch`, `Request`, `Response`, `crypto`, `TextEncoder`
- **Limited CPU time** — 10ms for free plan, 30s for paid (but wall-clock time can be longer due to I/O waits)

```javascript
// This is NOT a Node.js app — it's a Cloudflare Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/hello") {
      return new Response(JSON.stringify({ message: "Hello from the edge!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};
```

## Durable Objects: Stateful Edge Computing

The killer feature for serious applications. **Durable Objects** give you strongly consistent, single-threaded state at the edge. Think of them as tiny servers that live in a specific data center and handle requests sequentially.

```javascript
// A Durable Object that implements a rate limiter
export class RateLimiter {
  constructor(state, env) {
    this.state = state;
    this.requests = [];
  }

  async fetch(request) {
    const now = Date.now();
    const windowMs = 60_000; // 1 minute window
    const maxRequests = 100;

    // Load stored state
    this.requests = (await this.state.storage.get("requests")) || [];

    // Remove old entries outside the window
    this.requests = this.requests.filter((ts) => now - ts < windowMs);

    if (this.requests.length >= maxRequests) {
      return new Response("Rate limit exceeded", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (this.requests[0] + windowMs - now) / 1000
          ).toString(),
        },
      });
    }

    // Record this request
    this.requests.push(now);
    await this.state.storage.put("requests", this.requests);

    return new Response("OK", { status: 200 });
  }
}

// Worker that uses the Durable Object
export default {
  async fetch(request, env) {
    const ip = request.headers.get("CF-Connecting-IP");
    const id = env.RATE_LIMITER.idFromName(ip);
    const limiter = env.RATE_LIMITER.get(id);
    return limiter.fetch(request);
  },
};
```

Because each Durable Object processes requests sequentially, there are no race conditions. This makes them perfect for:
- Rate limiting
- Collaborative editing (WebSocket coordination)
- Shopping carts
- Game state
- Counters and leaderboards

## KV vs D1 vs R2: Choosing the Right Storage

Cloudflare offers multiple storage options, each optimized for different patterns:

| Feature | KV | D1 | R2 |
|---------|----|----|-----|
| **Model** | Key-value | SQL (SQLite) | Object storage |
| **Consistency** | Eventually consistent | Strong (per-DB) | Strong |
| **Best for** | Config, cached data | Relational data | Files, blobs |
| **Read latency** | ~10ms (cached) | ~20-50ms | ~50-100ms |
| **Write latency** | ~500ms (global) | ~30ms | ~100ms |
| **Size limit** | 25MB per value | 10GB per DB | 5TB per object |

```javascript
export default {
  async fetch(request, env) {
    // KV: Great for configuration and cached data
    const config = await env.KV_STORE.get("site-config", { type: "json" });

    // D1: Great for relational queries
    const { results } = await env.DB.prepare(
      "SELECT * FROM users WHERE status = ? ORDER BY created_at DESC LIMIT 10"
    )
      .bind("active")
      .all();

    // R2: Great for file storage
    const avatar = await env.BUCKET.get(`avatars/${userId}.png`);
    if (avatar) {
      return new Response(avatar.body, {
        headers: { "Content-Type": "image/png" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
```

## Caching Strategies at the Edge

Workers sit between users and your origin, making them ideal for sophisticated caching:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    // Check edge cache first
    let response = await cache.match(cacheKey);
    if (response) {
      return response;
    }

    // Cache miss — fetch from origin
    response = await fetch(request);

    // Clone the response so we can modify headers
    response = new Response(response.body, response);

    // Set cache headers based on content type
    const contentType = response.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
      response.headers.set("Cache-Control", "s-maxage=60"); // 1 min for API
    } else if (
      contentType.includes("image/") ||
      contentType.includes("font/")
    ) {
      response.headers.set("Cache-Control", "s-maxage=86400"); // 1 day for assets
    }

    // Store in cache (non-blocking)
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
```

### Stale-While-Revalidate Pattern

Serve cached content immediately while updating the cache in the background:

```javascript
async function staleWhileRevalidate(request, env, ctx) {
  const cache = caches.default;
  const cached = await cache.match(request);

  if (cached) {
    // Serve stale content immediately
    // Revalidate in the background
    ctx.waitUntil(
      (async () => {
        const fresh = await fetch(request);
        if (fresh.ok) {
          await cache.put(request, fresh);
        }
      })()
    );
    return cached;
  }

  // No cache at all — must wait for origin
  const response = await fetch(request);
  ctx.waitUntil(cache.put(request, response.clone()));
  return response;
}
```

## A/B Testing at the Edge

Run experiments without any origin-side changes by routing users at the edge:

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Get or assign a cohort via cookie
    const cookies = request.headers.get("Cookie") || "";
    let cohort = getCookie(cookies, "ab_cohort");

    if (!cohort) {
      // Assign randomly: 50/50 split
      cohort = Math.random() < 0.5 ? "control" : "variant";
    }

    // Modify request based on cohort
    if (cohort === "variant" && url.pathname === "/pricing") {
      url.pathname = "/pricing-v2"; // Serve alternate page
    }

    const response = await fetch(new Request(url, request));
    const modifiedResponse = new Response(response.body, response);

    // Set cohort cookie for consistency
    modifiedResponse.headers.append(
      "Set-Cookie",
      `ab_cohort=${cohort}; Path=/; Max-Age=2592000; SameSite=Lax`
    );

    // Log the experiment exposure for analytics
    // (non-blocking via waitUntil)
    // ctx.waitUntil(logExposure(cohort, url.pathname));

    return modifiedResponse;
  },
};

function getCookie(cookieString, name) {
  const match = cookieString.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}
```

## Geolocation-Based Routing

Every Cloudflare Worker request includes geolocation data derived from the user's IP — no third-party service needed:

```javascript
export default {
  async fetch(request, env) {
    const country = request.cf?.country || "US";
    const continent = request.cf?.continent || "NA";
    const city = request.cf?.city || "Unknown";
    const latitude = request.cf?.latitude;
    const longitude = request.cf?.longitude;

    // Compliance: block or redirect based on region
    const blockedCountries = ["XX", "YY"]; // Example
    if (blockedCountries.includes(country)) {
      return new Response("Service not available in your region", {
        status: 451,
      });
    }

    // Route to nearest origin
    const origins = {
      NA: "https://us-east.api.example.com",
      EU: "https://eu-west.api.example.com",
      AS: "https://ap-south.api.example.com",
    };
    const origin = origins[continent] || origins["NA"];

    // Forward request to regional origin
    const url = new URL(request.url);
    url.hostname = new URL(origin).hostname;

    const response = await fetch(new Request(url, request));

    // Add geo headers for downstream services
    const modifiedResponse = new Response(response.body, response);
    modifiedResponse.headers.set("X-User-Country", country);
    modifiedResponse.headers.set("X-User-City", city);

    return modifiedResponse;
  },
};
```

## Using Hono on Workers

Writing raw Worker handlers is fine for simple cases, but for anything resembling an API, the **Hono** framework provides Express-like ergonomics while staying tiny (~14KB) and edge-native:

```javascript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { cache } from "hono/cache";
import { bearerAuth } from "hono/bearer-auth";

const app = new Hono();

// Middleware
app.use("/api/*", cors());
app.use("/admin/*", bearerAuth({ token: "my-secret-token" }));

// Cached route
app.get(
  "/api/posts",
  cache({ cacheName: "posts-cache", cacheControl: "max-age=300" }),
  async (c) => {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 20"
    ).all();
    return c.json(results);
  }
);

// Dynamic route with params
app.get("/api/posts/:id", async (c) => {
  const id = c.req.param("id");
  const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?")
    .bind(id)
    .first();

  if (!post) return c.notFound();
  return c.json(post);
});

// POST with body parsing
app.post("/api/posts", async (c) => {
  const body = await c.req.json();
  const { title, content } = body;

  const result = await c.env.DB.prepare(
    "INSERT INTO posts (title, content, created_at) VALUES (?, ?, datetime('now'))"
  )
    .bind(title, content)
    .run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

// Error handling
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
```

Hono also supports middleware chaining, route groups, and testing utilities — making it the de facto framework for Workers development.

## Rate Limiting Without Durable Objects

For simpler rate limiting that doesn't need per-user precision, you can use KV with sliding windows:

```javascript
async function rateLimit(request, env) {
  const ip = request.headers.get("CF-Connecting-IP");
  const key = `rl:${ip}:${Math.floor(Date.now() / 60000)}`; // 1-min buckets

  const current = parseInt((await env.KV.get(key)) || "0");

  if (current >= 100) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // Increment (eventual consistency means this isn't perfectly accurate,
  // but it's good enough for most use cases)
  await env.KV.put(key, (current + 1).toString(), { expirationTtl: 120 });

  return null; // Continue to handler
}
```

## Wrapping Up

Cloudflare Workers represent a fundamental shift in how we build web applications. Instead of deploying to a single region and hoping a CDN covers the rest, you deploy your logic to the edge — every request handled in the data center closest to the user.

The patterns we covered — Durable Objects for state, D1 for relational data, caching strategies, A/B testing, geo-routing, and Hono for structure — form a toolkit for building production-grade applications entirely on the edge.

The mental model shift is the hardest part: you're not building a server, you're building a globally distributed function that runs everywhere simultaneously. Once that clicks, the possibilities are endless.

Start small — maybe an A/B test or a caching layer in front of your existing API. Once you see the latency numbers, you'll want to move more and more to the edge. That's how it starts. That's how it always starts.
