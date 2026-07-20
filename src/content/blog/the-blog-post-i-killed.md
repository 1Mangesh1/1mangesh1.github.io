---
title: "I Had Claude Write a Blog Post. Then I Killed It."
description: "An AI wrote me a clean, SEO-optimized, factually accurate blog post in twenty minutes. I deleted it anyway. On AI slop, content moats, and the one question that decides whether a post deserves to exist."
pubDate: 2026-07-20T00:00:00Z
tags: ["ai", "writing", "blogging", "meta"]
draft: false
---

Last week I asked Claude to research Claude Cowork and write a blog post about it for this site. Catchy title, SEO description, the works.

It did a genuinely good job. Searched the web, read Anthropic's docs and their best-practices post, pulled the launch coverage, and produced 1,386 words in my voice. Proper frontmatter. Build passed. It even scanned itself for the telltale AI punctuation I keep out of my posts and came back clean. Twenty minutes start to finish, and I had a publishable article sitting in `src/content/blog/`.

I read it and asked the only question that mattered: is this just slop we shouldn't post?

Then I killed it.

## It Wasn't Bad. That's the Problem.

Here's the uncomfortable part: the post was fine. Accurate facts, honest caveats, decent structure, no hallucinations, no "in today's fast-paced world." If you'd searched "how does Claude Cowork work" and landed on it, you wouldn't have felt cheated.

My first instinct was that it felt small next to my other posts, so I checked. Word counts on everything I've published: 1,386 words put it sixteenth out of thirty-one. Dead middle of my own pack. Ten of my published posts are shorter, including one I shipped the week before. So length wasn't the problem, and padding it out to 2,500 words of feature descriptions would only have made it worse.

The actual problem took one more question to surface: could ten other blogs have written this exact post?

Yes. They already had. DataCamp had a tutorial up. Tom's Guide had a hands-on. Fifty newsletters had summarized the same launch from the same Anthropic docs. My version was competently written and completely interchangeable. There wasn't a sentence in it that required me to exist.

That's my working definition of slop now: writing with no moat.

## Slop Is About Provenance, Not Quality

The usual slop conversation is about quality tells. The em dashes, the "delve," the bullet lists with bolded openers. Those are real, but they're the surface. You can strip every tell and still have slop, because the tells were never the disease, just the rash.

The disease is publishing something whose existence required nothing from you. No bug you hit, no decision you sweated, no numbers from your own systems. A summary of someone else's announcement is slop even when a human writes it beautifully, and it was slop long before LLMs existed. Content farms proved that a decade ago. AI just dropped the production cost to zero, so the only filter left is the author's willingness to hit delete.

Readers have gotten sharp about this too, and the numbers are rough. A survey of developer reactions to AI-scented blog posts this year found 78 percent leave immediately when they suspect a post is AI-authored, 71 percent avoid the author afterward, and 98 percent prefer an authentic human voice. You don't get the benefit of the doubt. One commodity post and the reader files your whole domain under "generated."

I have an AI chatbot on this site. I build agent skills. I write about Claude Code constantly. If anyone should be publishing AI-drafted explainers, statistically it's me. Which is exactly why I can't afford to.

## The Test I'm Keeping

The Cowork post died, and this is the rule that killed it, written down so I actually run it next time:

1. Could ten other blogs have written this exact post? If yes, kill it or find the angle only I have.
2. Does it contain at least one thing I did? A task I ran, a bug I hit, a number from my own analytics. Secondhand facts are seasoning, not the meal.
3. Would I have anything to add in person? If someone at a meetup said "I read your Cowork post," could I go deeper than what's written? If the post exhausted my knowledge of the topic, I had no business writing it.

Notice what's not on the list: whether AI touched it. That question stopped being interesting to me a while ago. The interesting question is whether I touched it.

## Full Disclosure, Because Otherwise This Post Is a Lie

This post was also drafted with Claude. Same tool, same setup that wrote the one I deleted.

The difference is the raw material. The dead post was built from Anthropic's marketing and other people's coverage. This one is built from something that happened to me: my draft, my word counts, my delete command, my rule. Claude held the pen; the events are mine. No other blog can publish this post, because no other blog killed my draft.

"Never use AI" is a fantasy for people who don't ship. "Publish whatever it generates" is how you become a content farm with a personal domain. The workable rule sits somewhere in the middle: the tool can write, but the post has to be something only you could publish.

## What Happened to the Research

Killing work feels wasteful. Mostly it isn't. The Cowork research is still sitting in my notes, and if I ever actually run my week through the thing and come out with opinions, that post gets written, and it'll open with whatever broke. First-hand failure is the most defensible content there is.

The draft cost twenty minutes. Figuring out why it deserved to die took longer, and that was the valuable part.

Delete more.
