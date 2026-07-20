---
title: "This Post Published Itself: Scheduled Posts on a Static Site with One Predicate and a Cron"
description: "How to schedule blog posts on a fully static Astro site with no CMS and no server: a pure date predicate, a publish filter on every route, and a weekly GitHub Actions cron. Full code included."
pubDate: 2026-07-27T00:00:00Z
tags: ["astro", "github-actions", "static-sites", "blogging"]
draft: false
---

Nobody pushed a commit to publish this post. It sat in the repo for over a week, fully written, invisible to you, and then showed up on its own while I was probably asleep. My site is static HTML on GitHub Pages. There's no CMS, no database, no server, and no "schedule" button.

Here's the entire mechanism, because it's small enough to show completely and it's one of my favorite things in this codebase.

## The Problem With Scheduling on a Static Site

A static site is a snapshot. The HTML that exists is the HTML that was true at build time. So "publish this post on Monday" breaks into two separate problems:

1. The build has to know a post dated in the future isn't published yet.
2. Something has to rebuild the site after Monday arrives.

Most people solve this with a platform feature or a CMS. Turns out both problems are nearly free without either.

## Problem 1: One Pure Function

Every post has a `pubDate` in its frontmatter. The publish decision is a single predicate, and I keep it pure on purpose (no environment reads, no clock access) so it's trivially testable:

```typescript
// src/utils/posts.ts
export function isPublishedAt(
  post: { data: { draft?: boolean; pubDate: Date } },
  now: Date
): boolean {
  if (post.data.draft === true) return false;
  return post.data.pubDate.getTime() <= now.getTime();
}
```

A thin wrapper binds it to the real clock and the environment, with one nicety: in dev mode everything shows, drafts and future posts included, so I can preview what's coming:

```typescript
// src/utils/published-posts.ts
export function isPublished(post: CollectionEntry<"blog">): boolean {
  if (import.meta.env.DEV) return true;
  return isPublishedAt(post, new Date());
}

export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const all = await getCollection("blog");
  return all.filter(isPublished);
}
```

That gives me two switches per post. `draft: true` means "not ready, regardless of date." A future `pubDate` means "ready, waiting for its day." This post used the second one.

## The Part People Get Wrong: Filter Every Route

The filter is worthless if it only guards the blog index. A future-dated post can't exist anywhere in the built output, or someone can guess the URL. Or worse, your RSS feed leaks it to every subscriber's reader the day you commit it.

On this site, every surface that touches posts goes through `getPublishedPosts()`:

- `blog/[...page].astro` - the paginated listing
- `blog/[slug].astro` - the post pages themselves (`getStaticPaths` never generates the page)
- `blog/tags/[tag].astro` and the tags index
- `rss.xml.ts` - the feed
- `og/[slug].png.ts` - the generated social images

Because `[slug].astro` filters inside `getStaticPaths`, an unpublished post has no HTML file at all. It's not hidden; it's absent. The search index can't leak it either, since Pagefind indexes the built `dist/` and the page isn't in it.

This is why I keep one canonical helper instead of ad-hoc `draft` checks scattered around: when I added future-dating, every route got it for free, and there's exactly one function to test. There's a small `posts.test.ts` next to the predicate that pins the edge cases (draft true, date in the past, date exactly now, date in the future) with the Node test runner. No framework.

## Problem 2: Something Has to Rebuild

Here's the catch that makes or breaks the whole scheme. My deploy workflow used to trigger on push only. Under that setup, a future-dated post doesn't appear on its date. It appears whenever I next happen to push, which might be days later. The date check without a rebuild trigger is a gun with no firing pin.

The fix is three lines of YAML in the deploy workflow:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: "30 3 * * 1"
```

Every Monday at 03:30 UTC, GitHub Actions rebuilds and redeploys the site whether anything changed or not. The build runs `new Date()`, the predicate flips for any post whose day has come, and the post materializes: page, listing, RSS entry, OG image, search index, all at once.

Why weekly and not daily? Because I publish on Mondays anyway, and a daily rebuild would spend six no-op builds a week just to confirm nothing happened. The cron matches the editorial cadence instead. Posts are dated Monday midnight UTC, the build fires Monday 03:30 UTC, and the effective publish time lands a little after 9am my time. The general rule: the real publish time of a post isn't its `pubDate`, it's the first build after its `pubDate`. Date your posts to match your cron, or run the cron daily if you want date-precision over build thrift.

One pleasant side effect: any ordinary push to `main` also rebuilds, so a mid-week commit publishes anything whose date has quietly passed. The cron is the guarantee, not the only path.

## The Fine Print

Things worth knowing before you copy this:

- **GitHub's cron is best-effort.** Scheduled workflows queue and can run minutes late, occasionally much later during peak load. For blog posts, who cares. For anything time-critical, wrong tool.
- **Inactive repos lose their crons.** GitHub disables scheduled workflows after 60 days without repository activity. If you stop pushing entirely, your queue eventually stops draining. A blog you've abandoned for two months has bigger problems, sure, but it's a real failure mode and the email GitHub sends about it is easy to miss.
- **Every scheduled build costs Actions minutes.** About two minutes per run on this site, sometimes to change nothing. Weekly keeps that spend at rounding-error levels. The periodic deploy also means the deploy timestamp stops telling you when content last changed, which occasionally confuses me and nobody else.
- **Scheduled triggers only run on the default branch.** Fine here, worth knowing generally.

## Why Bother

Because a queue changes how you write. Right now there are finished posts sitting in this repo, dated across the next month, and my publishing cadence is decoupled from my writing cadence for the first time. I can write three things on a good Saturday and drip them out on Mondays. The alternative was what I did before: publish in bursts of enthusiasm, then go silent for six weeks.

Total cost of the system: one pure function, one filter applied consistently, three lines of YAML. No CMS grew during the making of this feature.
