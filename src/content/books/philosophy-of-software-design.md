---
title: "A Philosophy of Software Design"
author: "John Ousterhout"
rating: 4
status: "completed"
startDate: 2025-12-01T00:00:00Z
finishDate: 2026-01-10T00:00:00Z
tags: ["design", "architecture", "principles"]
favorite: false
draft: true
---

Ousterhout's central thesis is that the greatest challenge in software is managing **complexity**, and he provides a refreshingly opinionated framework for thinking about it.

Key takeaways:
- **Deep vs. shallow modules**: A deep module has a simple interface but hides significant complexity. Shallow modules (lots of interface, little functionality) are a design smell.
- **Strategic vs. tactical programming**: Investing a little extra time upfront in good design pays massive dividends. Tactical programming (just make it work) accumulates complexity debt.
- **Information hiding**: The most important technique for managing complexity. Each module should encapsulate design decisions that are likely to change.
- **Define errors out of existence**: Instead of throwing exceptions everywhere, design APIs so that error conditions simply can't occur.

A concise, opinionated read that challenges some conventional wisdom (he's not a fan of too many small classes/methods). Highly recommended for anyone past the beginner stage.
