---
title: "The LinkedIn URL trick nobody talks about"
description: "LinkedIn's job search UI fights you at every step. But their URL parameters are surprisingly powerful - so I built SnipeDin to surface them."
pubDate: 2026-03-15T00:00:00Z
tags: ["tools", "javascript", "productivity", "career"]
draft: false
---

LinkedIn job search is one of those tools where the longer you use it, the more annoyed you get. Filters reset. Salary options disappear behind Premium prompts. If you're running the same search every morning - "remote backend roles posted this week" - you're clicking through the same sequence every day, reloading each time a filter is applied.

There's a shortcut that almost nobody talks about: LinkedIn's search filters are URL parameters. Every option you set in their UI appends something to the URL. Once you know what those values are, you can bookmark a precise search, share it, or build it from scratch without touching their interface.

The catch: LinkedIn documents none of this.

I spent a few hours reverse-engineering the parameters and built [SnipeDin](https://mangeshbide.tech/snipedin) to make them usable without memorizing anything.

---

## What the URL actually looks like

A maxed-out LinkedIn job search URL looks like this:

```
https://www.linkedin.com/jobs/search/?keywords=backend+engineer&location=Remote&f_TPR=r604800&f_WT=2&f_E=4&f_JT=F&salary=6
```

Breaking that down:

- `f_TPR=r604800` - past week (in seconds)
- `f_WT=2` - remote
- `f_E=4` - senior-level
- `f_JT=F` - full-time
- `salary=6` - a specific salary band

None of these are obvious. You'd have to set each filter in the UI and watch the URL change to figure them out. So I did that, mapped every value I could find, and put them in a form.

---

## How it works

SnipeDin is a form that builds these URLs. Fill in what you want, copy the link, open LinkedIn directly at the results. There's no login, no account, nothing stored server-side. The whole app is a single HTML file and some JavaScript with zero external dependencies.

What's strange is that this is actually faster than using LinkedIn's own interface. The UI is interactive. The form is static. But filling out six dropdowns and clicking "Copy" beats clicking through LinkedIn's filter panels because LinkedIn reloads between steps, throws up Premium upsells, and sometimes just loses a filter you set two clicks ago.

---

## The template system

This ended up being the piece I use most, and I didn't expect that.

If you're actively hunting, you probably have a handful of searches you run regularly. SnipeDin lets you save any configuration as a named template in localStorage. Ten pre-built ones come included - "remote senior roles posted this week", that kind of thing - and you can overwrite any of them with your own.

Running a saved search is two clicks. No network request. Your browser retrieves a stored string and opens a tab. It sounds minor but when you're checking job boards daily it starts to matter.

---

## The referral finder

Getting referred to a job significantly improves your chances - LinkedIn's own data puts it somewhere in the 3–4x range for landing an interview. Finding the right person to ask is the part that's always been tedious.

LinkedIn's people search has the same URL parameter structure as job search. If you want second-degree connections at a specific company with a certain role title, there's a URL for that. The referral finder in SnipeDin takes a company name and role keyword, a connection degree, and a location, and generates the people search URL.

It's just LinkedIn's own search, aimed at a specific target. But aimed precisely is most of the value.

---

## Why no framework

The whole thing is vanilla JavaScript, no build step.

SnipeDin collects form inputs and builds strings. That doesn't benefit from React or a state management library. Adding a framework would mean a bundler, build config, and 40–80KB of runtime for a tool whose entire logic is a few hundred lines of string concatenation.

Zero dependencies means it works offline, loads instantly, and any developer can read the full source in an afternoon. The alternative was a lot of overhead for a problem that is genuinely just "combine these values into a URL."

---

## Try it

Live at [mangeshbide.tech/snipedin](https://mangeshbide.tech/snipedin). Source at [github.com/1Mangesh1/snipedin](https://github.com/1Mangesh1/snipedin).

If you're job hunting, open it and build your main search. Bookmark the output URL. You won't need to open SnipeDin again until your requirements change.

And if you find a LinkedIn parameter I haven't mapped, open an issue. I'm pretty sure there are more hiding in there.
