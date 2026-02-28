---
title: "Deploying to GitHub Pages with a Custom Domain: Automation, Security, and CI/CD Lessons"
description: "A deep dive into automating static site deployments with GitHub Actions, custom domains, package management discipline, and the production gotchas we discovered."
pubDate: 2026-02-25T00:00:00Z
tags: ["devops", "github-actions", "deployment", "ci-cd", "git", "automation"]
draft: false
heroImage: "/images/deployment-hero.png"
ogImage: "/images/deployment-og.png"
---

**TL;DR:** I built a bulletproof GitHub Pages deployment pipeline that handles custom domains, enforces dependency consistency with Yarn's frozen lockfile, includes type checking in CI, and survives edge cases. The workflow is 40 lines of YAML, but the lessons underneath are worth sharing—especially around why `--frozen-lockfile` and explicit Node versions saved me from production disasters.

## The Problem I Solved

Deploying a static site to GitHub Pages seems trivial. You push code, GitHub builds it, serves it. In practice, I faced:

1. **Inconsistent builds** — npm installed different versions locally vs. CI, causing hydration mismatches in Astro
2. **Silent type failures** — Build succeeded in CI but site broke in production due to TypeScript errors
3. **DNS uncertainty** — Custom domain mapped, but CNAME file kept getting deleted on redeploy
4. **Zero observability** — Deployments were a black box; we didn't know if they succeeded
5. **Node version drift** — CI ran Node 18, local dev ran Node 20; subtle differences broke in production

Most tutorials skip these. This post doesn't.

## How It Works: The Architecture

### The Deployment Flow (Simplified)

```
git push main
  ↓
GitHub Actions trigger
  ↓
Checkout code
  ↓
Setup Node.js (v20) + Yarn cache
  ↓
Enable Corepack (standardizes Yarn version)
  ↓
Install dependencies (--frozen-lockfile = lock to exact versions)
  ↓
Run astro check (catch TypeScript errors before build)
  ↓
Build site (astro build + pagefind indexing)
  ↓
Deploy to GitHub Pages (peaceiris/actions-gh-pages)
  ↓
Set CNAME for custom domain
  ↓
Site live
```

### Why This Order Matters

I didn't stumble into this sequence by accident. Each step prevents a specific production failure:

- **Checkout first** — Obvious, but GitHub Actions doesn't do this by default
- **Node 20 explicitly** — No ambiguity. If it works in CI, it works for users
- **Corepack enabled** — Yarn version standardization (you'd be shocked how many CI failures are Yarn version incompatibility)
- **`--frozen-lockfile`** — This is critical. Without it, a new yarn release can silently install different patch versions
- **Type checking before build** — Catch schema violations early. Astro's Content Collections are type-safe; use that power
- **Publish directory hardcoded** — No guessing where artifacts go

## The Actual Implementation

Here's my workflow, with reasoning for each decision:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'

      - name: Enable Corepack (for Yarn)
        run: corepack enable

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Build site
        run: yarn build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          cname: mangeshbide.tech
```

### What That Build Script Does

Most people don't look at what `yarn build` actually runs. Here's mine:

```bash
yarn build = "astro check && astro build && pagefind --site dist"
```

Breaking this down:

**1. `astro check`** — TypeScript + Content Collections validation
- Every `.md` file in `src/content/` is checked against my Zod schemas
- Mismatched frontmatter? Fails here, not in production
- If I forget to add a required field, I know immediately
- This adds ~15 seconds to build time. Worth every second.

**2. `astro build`** — Static site generation
- Astro pre-renders all pages to HTML
- Assets get fingerprinted and optimized
- Output goes to `./dist`

**3. `pagefind --site dist`** — Search indexing
- Post-build step builds the search index
- This needs to run after HTML is finalized
- Skipping this means site builds but search doesn't work

Chaining with `&&` means: if any step fails, stop immediately. Don't deploy broken artifacts.

### The Deployment Step

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
    cname: mangeshbide.tech
```

The `peaceiris` action does the heavy lifting:
- Creates a `gh-pages` branch (if it doesn't exist)
- Force-pushes your `dist/` folder to that branch
- GitHub Pages serves from that branch
- The `cname` parameter writes a `CNAME` file with your custom domain

**Important:** The CNAME file is written *by the action*, not from your repo. This is intentional. GitHub Pages needs this in the deploy branch, not your source code.

### Why Yarn Over npm?

I standardized on Yarn for one reason: **dependency lock precision**.

npm's `package-lock.json`:
```json
"example": "^1.0.0"  // allows 1.0.0, 1.1.0, 1.99.0
```

Yarn's `yarn.lock`:
```
example@^1.0.0:
  version "1.0.5"  // exactly this version, always
```

With `--frozen-lockfile`, Yarn refuses to install if lockfile doesn't match. npm doesn't have this mode; it silently installs compatible versions.

**Real example from my project:**
- Local: yarn installed `@astrojs/mdx@4.3.12`
- CI (without frozen-lockfile): installed `@astrojs/mdx@4.3.13` (patch release)
- The patch added a CSS import I hadn't tested
- Site deployed, styling broke for 2 hours

After that: `--frozen-lockfile` every time.

## Deployment Decisions I Made

### 1. Single Branch Trigger

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

- Only deploy when code is pushed to `main`
- `workflow_dispatch` lets us manually trigger from GitHub UI (for emergency redeploys)
- Feature branches build locally only (developers run `yarn build` before PR)

**Trade-off:** If you want staging deploys from a `dev` branch, duplicate this job and push to a different GitHub Pages branch. I keep it simple.

### 2. Ubuntu Latest (Not a Specific Version)

```yaml
runs-on: ubuntu-latest
```

- `ubuntu-latest` = currently Ubuntu 24.04
- GitHub updates this; you don't pin it

**Why not pin?** I'm doing frontend builds (Astro), not production infrastructure. If Ubuntu updates break my build, it's visible in 5 minutes, easily fixable. The stability gain from pinning doesn't justify the maintenance cost of updating versions manually.

### 3. Node 20 (LTS at Time of Writing)

```yaml
node-version: 20
```

- Node 20 is LTS (long-term support)
- Will be supported until April 2026
- We'll update to Node 22 when 20 goes into maintenance mode

**Why explicit version?** Prevents "works locally" syndrome. If Node 18 gets security updates that change build behavior, CI still builds the same way locally.

### 4. Token Management

```yaml
github_token: ${{ secrets.GITHUB_TOKEN }}
```

- `GITHUB_TOKEN` is automatically provided by GitHub Actions
- No manual secret setup needed
- Scoped automatically (read code, write Pages)
- Expires after workflow finishes

**Why not a PAT (Personal Access Token)?** GitHub Token is simpler, safer, required fewer scopes.

## The Gotchas (I Hit All of Them)

### Gotcha #1: CNAME Gets Deleted on Redeploy

**What happened:** My custom domain worked. I redeployed. Domain broke.

**Root cause:** The previous deploy script created `CNAME` in the `gh-pages` branch, but didn't include it in the source. On redeploy, the `gh-pages` branch got completely replaced with fresh content. No `CNAME` file. GitHub Pages reverted to the default `{user}.github.io` domain.

**The fix:**
```yaml
cname: mangeshbide.tech
```

The `peaceiris` action handles this. It creates the `CNAME` file *after* copying your content, so it persists.

### Gotcha #2: Type Errors Slipped to Production

**What happened:** A blog post had invalid frontmatter (missing required field). Local build failed. But I didn't run `astro check` locally. Pushed anyway. CI deployed successfully. Site showed 404 for that post.

**Root cause:** I wasn't running type checks locally. `npm run build` skipped validation.

**The fix:**
```bash
"build": "astro check && astro build && pagefind --site dist"
```

Now, bad frontmatter fails the build. Non-negotiable.

### Gotcha #3: Yarn Version Mismatch

**What happened:** Local dev had Yarn 4.0.1. CI had Yarn 4.2.0 (because setup-node runs the latest). Different versions, different dependency resolution. Build passed in CI, failed locally.

**Root cause:** No Yarn version lock in place.

**The fix:**
```yaml
- name: Enable Corepack (for Yarn)
  run: corepack enable
```

Corepack reads the `packageManager` field from `package.json`:
```json
{
  "packageManager": "yarn@4.5.0"
}
```

CI now uses exactly version 4.5.0, local dev does too. Deterministic.

### Gotcha #4: Search Index Missing

**What happened:** Site deployed. Search feature was broken (no results, ever).

**Root cause:** Build script forgot to run `pagefind --site dist`. Search index was never created.

**The fix:**
```bash
"build": "astro check && astro build && pagefind --site dist"
```

This is why the build script chains everything. Search is part of the deployment contract now.

## Trade-offs I Accept

### 1. Every Deployment Goes Through Build

**Won:** Consistency. No surprises. Type safety on every deploy.

**Lost:** Speed. Full builds take ~2 minutes. If you update a single typo, still 2 minutes.

**Mitigation:** I don't care about build speed. Deploy frequency is low (blog updates). This isn't an API with 10 deploys/day.

### 2. No Staging Environment

**Won:** Simplicity. No config drift between staging/production.

**Lost:** Can't test in production-like conditions before going live.

**Mitigation:** I build locally before pushing. `yarn build` locally = exactly what CI does. Good enough.

### 3. Manual Content Validation

**Won:** Type checking catches schema errors.

**Lost:** Type checking doesn't catch typos. A blog post titled "How to Cod" passes validation.

**Mitigation:** Code review. Pull request reviews catch typos. I don't have automated spell-check in the deployment pipeline.

### 4. Single Deployment Pipeline

**Won:** Boring, predictable. No branches to maintain.

**Lost:** Can't do blue-green deployments or gradual rollouts.

**Mitigation:** Static sites don't have state. Deploy and it's instant. If something breaks, roll back by redeploying the previous commit.

## Security Considerations

### What I'm Not Doing (And Why That's OK)

1. **No secrets in the workflow** — GitHub Token is scoped automatically. Nothing to leak.
2. **No staging secrets** — No database, no API keys. Static site can't compromise much.
3. **No signed commits** — I trust my own GitHub account.

### What I'm Concerned About

1. **GitHub Token scope** — `peaceiris/actions-gh-pages` only gets token with Pages permissions. It can't delete repos or access other branches.
2. **Branch protection** — `main` branch requires PR reviews. No direct pushes.
3. **Deployment verification** — I check the [Actions tab](https://github.com/1Mangesh1/1mangesh1.github.io/actions) after each deploy. Green = good, red = investigate.

## Results and Monitoring

After deploying this:
- **0 failed deployments** in 6 months (touch wood)
- **All broken content caught before deploy** (via `astro check`)
- **Rebuild time:** ~90 seconds cold, ~45 seconds with cache
- **Rollback time:** ~2 minutes (push previous commit)

**How I monitor:**
1. Check GitHub Actions tab — green = deployed
2. Visit site — sanity check
3. Check search feature — catching the "pagefind missing" bug earlier would've saved time

Don't overthink monitoring for static sites. You're not running production servers.

## Lessons Learned

### 1. Frozen Dependencies Are Non-Negotiable

`--frozen-lockfile` prevents "works for me, not for CI" disasters. It's the cheapest insurance policy. Use it everywhere.

### 2. Type Check Before Build

With typed content collections (Zod), you catch broken data before deployment. Move `astro check` into the build pipeline. Make it fail-fast.

### 3. Explicit Versions Are Your Friend

- Node version: explicit
- Yarn version: explicit (via Corepack)
- Dependency versions: explicit (frozen lockfile)

Ambiguity causes production bugs. Remove it.

### 4. Chaining Commands With && Matters

```bash
astro check && astro build && pagefind --site dist
```

If `astro check` fails, `astro build` never runs. Prevents deploying with type errors. Small detail, huge impact.

### 5. The Deploy Action Matters

`peaceiris/actions-gh-pages` handles CNAME persistence and branch management. Rolling your own deploy script is not worth it. This action is battle-tested.

## What I'd Do Differently

1. **Add caching for node_modules** — Build times would drop to ~30 seconds. GitHub Actions cache is free.
2. **Monitor page build time** — Track if builds are getting slower over time (more posts = bigger search index).
3. **Email notifications for deploy failures** — Currently I remember to check Actions tab manually. Email would be better.

Last attempt at #1 had cache invalidation issues (Yarn 4 complexity). Punted to future.

## Applying This to Your Site

If you're building a static site with Astro/Hugo/Jekyll/Next.js:

1. **Copy the workflow** — Adjust `cname`, `node-version`, `publish_dir` to your setup
2. **Pin everything** — Versions for Node, package manager, build tools
3. **Fail fast** — Type check before build
4. **Chain commands** — Use `&&` to stop on first error
5. **Test locally** — `yarn build` locally should match CI exactly

## Further Reading

- [GitHub Actions: Deploying to GitHub Pages](https://docs.github.com/en/actions/deployment/deploying-to-github-pages)
- [peaceiris/actions-gh-pages GitHub](https://github.com/peaceiris/actions-gh-pages)
- [Yarn: `--frozen-lockfile` docs](https://yarnpkg.com/cli/install)
- [Astro: Type-safe Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Corepack: Manage Package Manager Versions](https://nodejs.org/docs/latest/api/corepack.html)
