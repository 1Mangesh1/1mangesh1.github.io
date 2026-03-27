---
title: "I Made My Portfolio Feel Alive — Ghost Cursors, Shared Pixel Art, and Other Weird Ideas"
description: "How I added real-time visitor presence, a collaborative pixel canvas, click heatmaps, and ambient mood to a static Astro site using one Cloudflare Worker and vanilla JS."
pubDate: 2026-03-27T00:00:00Z
tags: ["cloudflare-workers", "astro", "javascript", "real-time", "vanilla-js"]
draft: true
---

I kept thinking about how weird it is that portfolio sites feel so empty. You're reading someone's blog post, and for all you know, fifteen other people are on the same page. But there's zero evidence of that. It's just you and the HTML.

That bugged me. I wanted my site to feel like a space people actually inhabit. So I went a little overboard and built six real-time features on top of the Cloudflare Worker I already had running my AI chatbot. No React, no new services, just vanilla JS and KV.

---

## What I actually shipped

1. **Ghost Cursors** -- see other visitors' cursors moving around in real-time
2. **Live Visitor Count** -- a floating pill that shows how many people are on the site
3. **The Wall** -- a shared 64x64 pixel canvas where everyone places one pixel every 10 minutes
4. **Visitor Heatmap** -- toggle an overlay showing where people click most
5. **Footprints** -- "Mangesh was here 3 min ago" when I've recently visited a page
6. **Ambient Mood** -- the background color subtly shifts based on time of day and visitor count

The whole client-side bundle is about 16KB raw, 5KB gzipped. Loaded async, fails silently, doesn't touch Lighthouse scores.

---

## The architecture

I already had a Cloudflare Worker (`worker.js`) running my AI chatbot. Instead of spinning up something new, I extended it with four route groups:

```
Browser (vanilla JS)              Cloudflare Worker
    |                                    |
    |-- POST /presence  ------------->   Store cursor position (KV, 60s TTL)
    |-- GET  /presence  <-------------   Return all active cursors
    |-- POST /wall      ------------->   Place a pixel (rate-limited)
    |-- GET  /wall      <-------------   Return full canvas state
    |-- POST /heatmap   ------------->   Submit click batch
    |-- GET  /heatmap   <-------------   Return aggregated grid
    |-- POST /footprints ------------>   Record owner visit (auth'd)
    |-- GET  /footprints <------------   Return recent trail
```

One Worker, one KV namespace, no WebSockets. The client polls every 1.5 seconds for cursor positions. That's it. Short-polling gets a bad reputation, but for a portfolio site it's the right call. Simple to build, simple to debug, works on the free tier.

---

## Ghost Cursors

This is the feature that makes people go "wait, is that another person?"

Every 1.5 seconds, your browser posts your cursor position (as x/y percentages) to `/presence`. It also fetches all other active cursors. Other visitors' cursors appear as small, semi-transparent colored dots with random animal emojis floating above them.

```javascript
// Each visitor gets a random identity on page load
var EMOJIS = ['🦊','🐙','🦉','🐝','🦋','🐬','🦎','🐢','🦩','🐧'];
var EMOJI = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
```

The cursor dots use CSS `transform` for movement, which means they're GPU-composited. No reflows, no jank. They fade in when someone arrives and fade out when they leave. Max 20 cursors rendered at once.

On the Worker side, each cursor position is stored in KV with a 60-second TTL. If someone closes their tab, their cursor just expires. No cleanup logic needed.

```javascript
// Worker: store cursor with auto-expiry
await env.RATE_LIMIT_KV.put(
  `cursor:${String(id).slice(0, 36)}`,
  JSON.stringify({ id, x, y, page, emoji, color }),
  { expirationTtl: 60 }
);
```

One thing I ran into: Cloudflare KV has a minimum TTL of 60 seconds. I originally set it to 10 seconds (which the design doc specified), but the Worker threw 500 errors on every request. No helpful error message, just "Internal Server Error." That took a while to figure out.

Privacy-wise, there's nothing to worry about. Each visitor gets a random UUID generated in memory (not even localStorage). No cookies, no fingerprinting, nothing persisted. The cursor positions auto-expire in a minute.

---

## Live Visitor Count

This one piggybacks entirely on the presence data. Zero extra network requests.

A small pill sits in the bottom-left corner showing "Just you" or "5 exploring." Hover over it and you get a page breakdown:

```
👥 5 exploring
├ /blog          3
├ /games         1
└ /wall          1
```

It pulses slightly when someone joins or leaves. Hidden on mobile to save space.

The one gotcha: the page breakdown displays data from other visitors' cursor objects, which include a `page` field. That's user-submitted data being rendered in the DOM. My first version used `innerHTML`, which would've been an XSS vector. Someone could send `<img src=x onerror=alert(1)>` as their page value and it'd execute on every other visitor's browser.

Caught it in code review. Switched to `textContent` and DOM element creation. Always sanitize data from other users, even when it comes through your own API.

---

## The Wall

This is my favorite. A 64x64 pixel canvas where every visitor can place one pixel every 10 minutes. Like r/place, but tiny and permanent.

The canvas is stored as a single JSON blob in KV:

```javascript
{
  pixels: [[null, "#ef7d57", null, ...], ...],  // 64 rows of 64 columns
  stats: { placed: 847, visitors: 312 }
}
```

The 16-color palette is the same one used in the PICO-8 fantasy console. Retro, constrained, and looks good no matter what people draw:

```
#000000 #1a1c2c #5d275d #b13e53
#ef7d57 #ffcd75 #a7f070 #38b764
#257179 #29366f #3b5dc9 #41a6f6
#73eff7 #f4f4f4 #94b0c2 #566c86
```

Rate limiting is server-side. After you place a pixel, the Worker sets a KV key `wall:rate:{visitorId}` with a 10-minute TTL. Try to place another pixel before it expires and you get a 429. On the client side, a countdown timer appears so you're not just clicking into error messages.

There's a known race condition here. The pixel placement does a read-modify-write on the canvas blob: read it from KV, change one pixel, write it back. If two people place pixels at the exact same moment, one write overwrites the other. With a 10-minute cooldown between placements, the odds of this happening are low. If it ever becomes a problem, Durable Objects would fix it, but for now it's fine.

The wall page has zoom controls (1x, 2x, 4x), a grid toggle, and a hover preview that shows your selected color on the target pixel before you click. The hover preview initially re-rendered all 4,096 pixels on every mouse move event, which would've been rough on lower-end devices. Added `requestAnimationFrame` throttling to fix that.

---

## Visitor Heatmap

Every click on the site gets recorded (throttled to one per 500ms). After 10 clicks, they're batched and sent to the Worker in one request.

The Worker buckets clicks into a 50x50 grid per page. Each cell covers roughly 2% of the page dimensions. No individual click positions are stored, just counts per cell. The data has a 30-day TTL so it stays fresh.

Toggle the heatmap by clicking the fire icon next to the visitor count pill. A canvas overlay appears with radial gradients, cold-to-hot. Max 40% opacity so you can still read the content underneath.

I validated the `page` parameter server-side with a regex (`/^\/[a-zA-Z0-9\-_\/\.]*$/`) and a 100-character length limit. Without that, someone could POST thousands of unique fake page paths and fill up the KV namespace.

---

## Footprints

This one is more personal. When I browse my own site, a small indicator appears for other visitors: "Mangesh was here 3 min ago." If I'm actively on a page, it says "Mangesh is here right now" with a gentle breathing animation.

The auth is simple. I have a secret token in my browser's localStorage. When my browser loads a page, the footprints script sends the token to the Worker. The Worker hashes it with SHA-256 and compares it against a hash stored in an environment variable. Match? Record the visit. No match? Reject silently.

```javascript
// One-time setup in browser console:
localStorage.setItem('footprint_token', 'my-secret-token');
```

The Worker stores my last 5 page visits with timestamps, with a 1-hour TTL. If I haven't browsed the site in an hour, the trail expires and nobody sees anything.

The indicator appears near the top of the page, fades in over half a second, and auto-hides after 8 seconds. Subtle enough that it doesn't get in the way, but noticeable enough that visitors think "oh, this site has an actual person behind it."

---

## Ambient Mood

The subtlest feature. Most people won't consciously notice it.

The site's background gets a very faint color tint based on two things: time of day and how many people are online.

```
Time of day:
  06:00-12:00  →  cool blue (morning)
  12:00-17:00  →  warm neutral (afternoon)
  17:00-21:00  →  golden amber (evening)
  21:00-06:00  →  deep indigo (night)

More visitors = warmer tones:
  1 visitor   →  2% opacity
  5 visitors  →  4% opacity
  10+         →  6% opacity
```

The max opacity is 6%. You feel it more than you see it. The effect is applied as a `body::after` pseudo-element with `pointer-events: none`, so it never interferes with clicks. Changes transition over 5 seconds so there are no sudden shifts.

It respects `prefers-reduced-motion`. If you have that set, transitions are disabled entirely.

The time calculation is pure client-side (no network call). The visitor count comes from the same presence data the ghost cursors use. Zero extra overhead.

---

## The client-side setup

Everything lives in `public/living-site.js` and five sub-modules in `public/living-site/`. The orchestrator creates a shared state object, starts the presence polling loop, and dynamically loads the sub-modules:

```javascript
// Shared state object — all modules read from this
var state = {
  cursorX: 0, cursorY: 0,
  page: window.location.pathname,
  cursors: [],
  visitorCount: 0,
  tabVisible: true,
};

// Modules communicate via custom events
window.dispatchEvent(
  new CustomEvent('living-site:presence', { detail: state })
);
```

Polling pauses when the tab is hidden (using the `visibilitychange` API). No point burning requests when nobody's looking.

Every module is wrapped in an IIFE and a try/catch. If the Worker is down, if the network is flaky, if anything goes wrong at all, nothing happens. No error messages, no broken UI, no console spam. The features just quietly don't appear.

The script tag in `Layout.astro` uses `async` so it never blocks page rendering:

```html
<script async src="/living-site.js" is:inline></script>
```

---

## Performance

I was worried about this. Adding network requests to every page load feels wrong.

But the numbers are fine:

- **Bundle size**: ~5KB gzipped across all modules
- **Network**: Two small fetches every 1.5s (only while tab is visible), plus one footprint fetch on page load
- **DOM**: Adds 3-4 lightweight elements total
- **CPU**: CSS transforms for cursors (GPU-composited), one CSS custom property update per minute for ambient mood
- **Lighthouse**: No measurable impact. Everything is async and non-blocking

The Worker side is more interesting. The presence GET does a KV list operation, then fetches each cursor value. With 20 visitors, that's 21 KV operations per request. I parallelized the individual gets with `Promise.all` to at least reduce latency:

```javascript
const values = await Promise.all(
  list.keys.map(key =>
    env.RATE_LIMIT_KV.get(key.name, { type: "json" })
  )
);
```

On the free tier (100,000 KV reads/day), this scales to maybe 30-40 concurrent visitors before hitting limits. More than enough for a portfolio site.

---

## Stuff I got wrong

**Combine POST and GET for presence.** Right now the client makes two requests per poll cycle: one to report its position, one to get everyone else's. The POST could return all active cursors in its response, cutting requests in half.

**Use a single KV key for all cursors.** Instead of one KV key per cursor, store all active cursors in one key. Each POST would read-modify-write that key. More contention, but drops the GET from N+1 reads to exactly 1.

**Don't trust visitor counts on The Wall.** The "visitors" stat counts per-tab UUIDs, not actual humans. Every new tab, page refresh, or incognito window creates a new UUID. It inflates fast. Should probably use hashed IPs like the chat logging does, or just call them "sessions" instead.

---

## Go break it

Open two tabs to any page on this site. Move your mouse in one. There should be a faint dot in the other one. That's you.

Go to [The Wall](/wall) and leave a pixel. I'm curious what it looks like in a month.

All the code is in [the repo](https://github.com/1mangesh1/1mangesh1.github.io) -- Worker changes in `worker.js`, client modules in `public/living-site/`, wall page at `src/pages/wall.astro`.
