---
title: "The Semicolon Debate is the Bikeshed of Our Generation"
description: "Every minute spent arguing about semicolons is a minute not spent writing actual software"
date: 2026-02-10T00:00:00Z
type: "rant"
mood: "amused"
tags: ["javascript", "formatting", "bikeshedding"]
draft: true
---

We have a nuclear reactor to design, and we're arguing about what color to paint the bike shed. Except in our case, the nuclear reactor is scalable distributed systems and the bike shed is *whether to put a semicolon at the end of a line.*

## A Brief History of Wasted Time

The semicolon debate in JavaScript has consumed more collective engineering hours than some entire startups have existed. Conferences have had talks about it. Twitter threads have gone viral over it. Engineers with decades of experience have written multi-thousand-word blog posts defending their position.

The answer was always: **it doesn't matter.**

## Prettier Solved This

In 2017, Prettier arrived and said, "I'll handle the formatting. You handle the logic." And yet, here we are in 2026, still seeing pull request comments about semicolons in projects that *don't even use Prettier*. WHY.

## The Same Energy

- Tabs vs. spaces → Set it in `.editorconfig` and move on
- Semicolons vs. no semicolons → Set it in `.prettierrc` and move on
- Single quotes vs. double quotes → Set it in ESLint and *move on*

The pattern is clear: automate the decision, eliminate the debate, ship the feature.

## The Real Hot Take

If your team spends more than 15 minutes in a meeting discussing code style that a formatter can enforce automatically, that meeting has negative ROI. Install Prettier. Configure it once. Never discuss formatting again.

Your users don't care about your semicolons. They care about whether the app works.
