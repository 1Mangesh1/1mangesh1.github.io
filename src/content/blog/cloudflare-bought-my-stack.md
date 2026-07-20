---
title: "Cloudflare Bought My Framework, So I Audited My Whole Stack"
description: "Cloudflare acquired Astro in January 2026. My site is Astro on GitHub Pages, behind Cloudflare DNS, with a Cloudflare Worker running its AI chat. An audit of what the acquisition and Astro 6 actually change for a real site, and why I'm not migrating yet."
pubDate: 2026-08-10T00:00:00Z
tags: ["astro", "cloudflare", "workers", "architecture"]
draft: false
---

In January, Cloudflare acquired Astro. Not sponsored, not partnered: acquired the company, hired the team.

Here's my stack, for context. This site is built with Astro. The domain sits on Cloudflare DNS with Cloudflare in front as proxy. The AI chat in the corner runs on a Cloudflare Worker, with Workers AI generating replies and Workers KV doing rate limiting. The one piece Cloudflare doesn't touch is hosting: the static output deploys to GitHub Pages via GitHub Actions.

So as of January, one company owns my framework, my DNS, my CDN, and my chat backend. Everything except the final resting place of my HTML. When a single vendor absorbs that much of your diagram, you audit. This is the audit.

## What Actually Changed With Astro 6

The acquisition could've been pure business news, but Astro 6 (in beta since February) shows the integration is technical and real. The headline change is the dev server: `astro dev` can now run your app inside workerd, Cloudflare's open-source JavaScript runtime, the same one that runs Workers in production. It plugs in through Vite's Environment API.

If you've never been bitten by dev-prod runtime drift, that sounds like plumbing. It isn't. Code that reads Node globals works on your laptop and explodes at the edge; with the dev server running the production runtime, that class of surprise dies at `astro dev` time. This site is fully static so I dodge most of it, but my Worker is exactly the kind of code that benefits. Today I test it separately with `wrangler dev` and a hand-rolled test script, because the site's dev server and the Worker's runtime are different worlds. Astro 6 points at those worlds merging.

The rest of the pitch: first-class Workers deployment, stable Live Content Collections (collections that fetch at request time instead of build time), stable Content Security Policy support, and Cloudflare's broader "your frontend, backend, and database in one Worker" story. Astro stays open source, the team says independent, and with brands like Visa and NBC News on the user list, abandonment seems unlikely any time soon.

## The Case for Moving Everything to Cloudflare

Steelmanning the migration first, because the pull is real:

**My architecture is already split across two platforms.** The site deploys to GitHub Pages; the Worker deploys with `wrangler`. Two pipelines, two mental models, and CORS configuration that exists purely because the chat frontend and backend live on different origins. On Workers, the site ships as static assets on the Worker itself: one deploy, one origin, and the CORS block in my Worker gets deleted.

**Preview deployments.** Pages plus Actions gives me exactly one environment: production. Every Cloudflare deploy can have a preview URL. I currently test big changes by squinting at localhost and pushing with intent.

**The dynamic door opens.** Fully static is a constraint I mostly love, but the moments I fight it (the guestbook goes through Google Sheets, the chat needs a separate Worker) are exactly the moments the platform I already half-live on now solves natively. Live Content Collections could pull my Worker's data into pages at request time.

**The framework will be tuned for it.** Nobody optimizes for the second-best deployment target. Astro on Workers will get the polish; Astro on GitHub Pages will get maintenance. That's not cynicism, just where the incentives sit.

## The Case for Staying Put

**The pipeline works and is boring.** Push to main, Actions builds, type-checks, generates the search index, deploys. It has one interesting failure mode a year. Boring infrastructure is a feature I paid for in debugging time, and migrations refund none of it.

**Static output makes hosting a commodity.** `astro build` emits a folder of files. GitHub Pages, Workers static assets, S3, a Raspberry Pi: all equivalent hosts for a folder. This is the deep reason static sites age well, and it cuts against urgency in both directions. Nothing pushes me off Pages, and if I ever do move, the move is small. The portability is precisely why I can afford not to use it.

**No feature I need today requires the move.** The site is already fast everywhere; it's static HTML behind Cloudflare's CDN. Preview URLs are a comfort, not a blocker. The Sheets guestbook is charmingly dumb and I like it that way.

**Concentration risk is real even when everyone is nice.** With DNS, CDN, framework, and chat backend already on one vendor, GitHub Pages is my last piece of accidental diversification. Moving hosting too makes the stack cleaner and the basket more single. Not a dealbreaker. Worth naming honestly instead of discovering later.

## The Verdict, With Tripwires

Staying on GitHub Pages. But an audit that ends in "no change" should at least say what would change the answer, so, tripwires:

1. **I want request-time rendering for a real feature.** The first time I catch myself building a static workaround for something Live Content Collections does natively, that's the signal.
2. **Astro's static-hosting path starts feeling second-class.** Watch item, checked each major version. No sign of it in 6.
3. **The two-pipeline tax grows.** One Worker is fine. If a second or third shows up, unifying deployment starts paying for the migration.
4. **Preview deploys become load-bearing.** If this blog ever has a second contributor, testing-in-production-adjacent stops being cute.

None are tripped. The honest summary of the whole exercise: Cloudflare buying Astro changed my framework's future a lot and my deployment not at all, because static output is the best vendor insurance there is. The build folder doesn't care who owns the framework.

Worth an hour of auditing to say that with evidence instead of vibes. Check back at Astro 7.
