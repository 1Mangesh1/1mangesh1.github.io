---
title: "Mastering Maintenance Mode in Static Sites"
description: "Build a robust maintenance mode for Astro static sites using middleware and build-time configuration, without external proxies or complex infrastructure."
pubDate: 2026-02-19T16:00:00Z
tags: ["Astro", "DevOps", "Node.js", "Maintenance"]
draft: false
---

Static sites (SSG) have one major flaw: you can't turn them off.

Once your HTML is deployed to a CDN, it's immutable. To put up a "Under Construction" sign, you typically need to intervene at the infrastructure level—updating Nginx rules, deploying a Cloudflare Worker, or fiddling with Vercel dashboard toggles.

I hate dashboard toggles. They are hidden state that lives outside your repository.

If my site is down for maintenance, I want that state tracked in Git. I want my team to see it in the commit history. I want it to be reproducible.

Here is how I implemented a "Build-Time Maintenance Mode" for this Astro blog using nothing but a Node script and middleware.

## The Strategy: Build-Time Interception

Since we don't have a running server to check a database flag on every request, we have to bake the decision into the build artifact itself.

The flow is simple:
1.  **The Trigger**: A script flips a boolean in a config file.
2.  **The Commit**: We push this change.
3.  **The Build**: Astro's middleware sees the flag and generates redirects for every single route.
4.  **The Result**: The deployed site redirects all traffic to `/maintenance`.

It's not instant—it requires a deployment cycle (usually 1-2 minutes). But for planned maintenance, it's perfect.

## Step 1: The State

First, we need a source of truth. I keep this in `src/config/site.ts`.

```typescript
// src/config/site.ts
export const siteConfig = {
  // Site maintenance mode
  maintenanceMode: false, // Set to true to enable maintenance mode

  // ... other config
  title: "Mangesh Bide",
};
```

This boolean controls everything. If it's `true`, the site is effectively closed.

## Step 2: The Switch

I could edit that file manually, but I'm lazy and manual edits are prone to typos. I wrote a small script to toggle this safely.

It lives in `scripts/toggle-maintenance.js` and uses simple regex replacement. It's crude, but it works.

```javascript
// scripts/toggle-maintenance.js
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../src/config/site.ts");

try {
  let configContent = fs.readFileSync(configPath, "utf8");
  const isCurrentlyEnabled = configContent.includes("maintenanceMode: true");

  if (isCurrentlyEnabled) {
    configContent = configContent.replace(
      "maintenanceMode: true",
      "maintenanceMode: false"
    );
    console.log("✅ Maintenance mode disabled - Site is now ONLINE");
  } else {
    configContent = configContent.replace(
      "maintenanceMode: false",
      "maintenanceMode: true"
    );
    console.log("🚧 Maintenance mode enabled - Site is now OFFLINE");
  }

  fs.writeFileSync(configPath, configContent);
} catch (error) {
  console.error("❌ Error toggling maintenance mode:", error.message);
  process.exit(1);
}
```

I wired this up in `package.json` so I can just run `npm run maintenance:toggle`.

## Step 3: The Enforcer (Astro Middleware)

This is where the magic happens. Astro's middleware runs during the build process for SSG sites. We can intercept every page generation and force a redirect.

In `src/middleware.ts`:

```typescript
// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { siteConfig } from "./config/site";

export const onRequest = defineMiddleware(async (context, next) => {
  // CRITICAL: Allow access to the maintenance page itself
  // If you forget this, you'll create an infinite redirect loop.
  if (context.url.pathname === "/maintenance") {
    return next();
  }

  // Check if maintenance mode is enabled
  if (siteConfig.maintenanceMode) {
    // In SSG, this generates a redirect (meta refresh or provider specific)
    return context.redirect("/maintenance");
  }

  return next();
});
```

When `maintenanceMode` is true, Astro sees a redirect return for `/`, `/about`, `/blog`, etc. It generates the appropriate redirect instruction (HTML meta refresh or `_redirects` file depending on your adapter/config).

## The Trade-offs

This approach isn't for everyone.

**Pros:**
*   **Infrastructure Agnostic**: Works on Vercel, Netlify, GitHub Pages, or an S3 bucket.
*   **Version Controlled**: You know exactly when maintenance started and ended via Git history.
*   **Zero Cost**: No edge functions or paid features required.

**Cons:**
*   **Latency**: It takes a full build/deploy cycle to turn on or off. Do not use this for emergency "stop the bleeding" scenarios.
*   **Git Noise**: Your commit history will have "Toggle maintenance" commits.

For a personal blog or a documentation site, the pros heavily outweigh the cons. It keeps the complexity where it belongs: in the code, not in the cloud provider's dashboard.
