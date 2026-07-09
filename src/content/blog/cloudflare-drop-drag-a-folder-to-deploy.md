---
title: "Cloudflare Drop: Drag a Folder, Get a Live Site, No Account Required"
description: "Cloudflare Drop lets you deploy a static site by dropping a folder or zip onto a page. No account, no config, a live preview URL in seconds that stays up for an hour. Here's what it actually does, the one catch, and where it fits next to a real deploy pipeline."
pubDate: 2026-07-09T00:00:00Z
tags: ["cloudflare", "workers", "static-sites", "deployment"]
draft: false
---

Deploying this site is a whole ceremony. I push to `main`, GitHub Actions wakes up, installs dependencies, runs `astro check`, builds, generates the Pagefind index, and pushes the output to GitHub Pages with the right CNAME. It's a good pipeline. It's also complete overkill for the times I just want to show someone a single HTML file I hacked together, or check that a `dist/` folder looks right on a real URL instead of localhost.

Cloudflare's changelog on July 8 dropped a thing for exactly that itch, and the name is the whole pitch: [Cloudflare Drop](https://cloudflare.com/drop). You drag a folder onto a page and you get a live site. No account. No config file. No pipeline.

## What It Actually Does

You go to the page, drop in a folder or a zip of static assets, and Cloudflare deploys it. Static means the usual: HTML, CSS, JavaScript, images, fonts. The kind of thing that comes out of `astro build`, or a Vite build, or a single `index.html` you wrote in a text editor five minutes ago.

What you get back is a temporary live preview on a real URL. You can open it, poke at it, send the link to someone, and it behaves like a deployed site because it is one. The catch, and it's the important detail, is that the preview stays live for one hour. After that it's gone unless you do something about it.

The something is claiming it.

## The One-Hour Catch, and Claiming

The hour is the honest constraint here, so it's worth sitting on. By default this is throwaway. You drop, you share, you move on, and it evaporates. That's not a limitation they're hiding, it's the design. Drop is for the ephemeral case, the "just look at this real quick" case, and the timer is what keeps it free and accountless.

When you want to keep a deployment, you click Claim. That's the moment the account shows up. You sign into an existing Cloudflare account and claim the site into it, or you create a new account for it. If you're making a new account you have to verify your email before it'll go through, and the claim link itself has a countdown, so claiming isn't a thing you can leave open in a tab for the afternoon.

So the flow is: anyone can deploy, nobody needs an account to deploy, and the account only enters the picture when you decide the thing is worth keeping. That ordering is the clever part. Most platforms make you sign up first and reward you with a deploy. This one lets you see the deploy work before it asks you for anything.

## What Opens Up After You Claim

Once a site is claimed into an account it stops being a toy and turns into a normal Workers deployment, with the things you'd expect:

- **A real domain.** Connect a domain you already own, or buy a new one for the site.
- **Observability.** Turn on monitoring for the site's performance and usage.
- **Markdown for Agents.** Let AI agents pull your site's content as Markdown. Given how much of the current Cloudflare story is about AI crawlers and how they read you, it's telling this is a claim-time toggle now.
- **Access control.** Make the site private and decide who's allowed to see it.

None of those are novel on their own. The point is that you land in a working deployment first and grow into the platform features after, instead of configuring all of it up front to see a single page render.

## Where It Fits For Me

I'm not moving this site to it, and I don't think that's what it's for. My blog wants git-based deploys, a build step, a search index, and a domain that's been pointed here for a while. Dragging a folder every time I publish a post would be a downgrade dressed as convenience. Drop isn't trying to replace that, and I'd be arguing with a strawman if I judged it like it was.

What it actually replaces is the annoying middle ground. The times I've spun up a whole GitHub repo and a Pages config just to share one static prototype. The times I've sent someone a screenshot because getting the real thing onto a URL felt like more effort than the thing was worth. The times I've wanted to see a build on an actual domain, on someone else's phone, without wiring up hosting for something I'll throw away by dinner. That's a real category of task, and it's been more friction than it should be for years.

The one-hour window is exactly right for that and would be exactly wrong for anything else, which tells you what it's aimed at. It's a preview tool that happens to let you keep the preview if it earns its place. I like that it's honest about being ephemeral instead of pretending to be a hosting product and quietly deleting your stuff later.

I'll be reaching for it the next time I build a one-off page and want a link to hand to someone in the next thirty seconds. That used to be a small errand. Now it's a drag and a drop, and I only sign in if it turns out to be worth signing in for.

The announcement is on [Cloudflare's changelog](https://developers.cloudflare.com/changelog/post/2026-07-08-cloudflare-drag-and-drop/), and the thing itself is at [cloudflare.com/drop](https://cloudflare.com/drop) if you want to throw a folder at it.
