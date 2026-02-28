---
title: "The Art of Code Review: Beyond 'LGTM'"
description: "How to give and receive code reviews that actually improve code quality and team dynamics"
pubDate: 2026-02-10T00:00:00Z
tags: ["code-review", "engineering-culture", "best-practices", "soft-skills"]
draft: true
---

We've all been there — a 2,000-line pull request lands in your inbox, you scan a few files, nothing catches fire, and you drop an "LGTM 👍" and move on with your day. Meanwhile, bugs ship, tech debt accumulates, and junior developers miss learning opportunities. Code review is one of the highest-leverage activities in software engineering, yet most teams do it poorly. Let's fix that.

## What Makes a Good Code Review?

Effective code reviews accomplish three things simultaneously:

1. **Catch bugs and logic errors** before they reach production
2. **Share knowledge** across the team so no one is a single point of failure
3. **Maintain standards** for code quality, architecture, and patterns

The best reviewers optimize for all three. The worst rubber-stamp everything or nitpick semicolons while missing a SQL injection.

## The Reviewer's Mindset

Before you look at a single line of code, adjust your mental model:

**You are not a gatekeeper.** You are a collaborator helping ship the best possible version of this change. Your goal isn't to prove you're smarter — it's to make the code better and help the author grow.

**Assume good intent.** The author made their choices for reasons that made sense to them. Before suggesting alternatives, understand why they chose their approach.

**Review the change, not the person.** Say "this function could be simplified" not "you wrote this wrong." The difference in wording fundamentally changes how feedback is received.

## A Framework for Reviewing

I use a three-pass approach:

### Pass 1: The Big Picture (2 minutes)

Read the PR description. Understand what problem is being solved and why. Check:

- Does the approach make sense architecturally?
- Is this the right place for this change?
- Are there edge cases the description doesn't address?

### Pass 2: The Logic (10-15 minutes)

Read through the code changes file by file. Focus on:

- **Correctness** — Does it actually do what it claims?
- **Edge cases** — What happens with null, empty, negative, or maximum values?
- **Error handling** — Are failures handled gracefully?
- **Security** — Any injection vectors, exposed secrets, or auth bypasses?
- **Performance** — O(n²) loops, missing indexes, unnecessary network calls?

### Pass 3: Polish (5 minutes)

Now look at style and maintainability:

- Naming — do variables and functions communicate intent?
- Comments — are complex sections explained?
- Tests — is the important behavior covered?
- Documentation — are public APIs documented?

## Giving Constructive Feedback

The way you phrase feedback matters enormously. Here are real examples:

### Bad Review Comments

```
❌ "This is wrong."
❌ "Why didn't you use X?"
❌ "This code is messy."
❌ "nit: spacing" (on 47 lines)
```

### Good Review Comments

```
✅ "Bug: This will throw a NullPointerException when `user.address` 
    is null, which happens for ~5% of users (checked the DB). 
    Consider adding a null check here."

✅ "Suggestion (non-blocking): Have you considered using `Map.groupBy()` 
    here? It would simplify lines 45-62 into a single expression. 
    Happy to pair on this if you'd like."

✅ "Question: I'm not familiar with this pattern — could you explain 
    why we're caching at this layer rather than at the repository? 
    Might be worth a code comment for future readers."

✅ "Praise: Really clean error handling here. The custom error types 
    with context messages make debugging much easier. 👏"
```

Notice the pattern: **categorize** your comment (bug, suggestion, question, praise), **explain** the reasoning, and **offer help** when suggesting changes.

## Common Anti-Patterns

### The Rubber Stamper

Approves everything within seconds. Never leaves comments. Creates a false sense of security — the team thinks code is being reviewed when it isn't.

**Fix:** Set a minimum review time. If a 500-line PR takes less than 10 minutes to review, you're not reviewing it.

### The Nitpicker

Leaves 40 comments about formatting, naming conventions, and import ordering — all things a linter could catch — while missing a race condition in the concurrent code.

**Fix:** Automate style enforcement. Use ESLint, Prettier, Black, rustfmt — whatever your language offers. If a machine can catch it, don't waste human review time on it.

### The Blocker

Refuses to approve until the code matches their exact vision. Holds PRs hostage for days over subjective preferences.

**Fix:** Distinguish between "must fix" (bugs, security issues) and "consider changing" (style preferences, alternative approaches). Only block on the former.

### The Ghost

Assigned for review on Monday. Silence. Ping on Wednesday. "I'll get to it." Friday arrives — still no review. The author rebases, conflicts appear, momentum dies.

**Fix:** Set team SLAs. Reviews within 4 business hours is a common target. If you can't review in time, re-assign.

## What to Automate vs What Needs Human Eyes

### Automate These (CI/CD Pipeline)

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks
on: pull_request

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint
        run: npm run lint

      - name: Format Check
        run: npm run format:check

      - name: Type Check
        run: npm run typecheck

      - name: Unit Tests
        run: npm test

      - name: Security Audit
        run: npm audit --audit-level=high

      - name: Bundle Size Check
        run: npm run build && npm run size-limit
```

If CI catches formatting issues, type errors, or failing tests, the reviewer never has to mention them. This frees human attention for what machines can't do: evaluating design decisions, catching subtle logic errors, and sharing domain knowledge.

### Keep These Human

- Architectural fit — does this change align with where the codebase is heading?
- Business logic correctness — does this match the product requirements?
- Readability — will the next developer understand this in 6 months?
- Missing abstractions — should this be a shared utility?
- Testing strategy — are we testing the right things, not just chasing coverage?

## Handling Disagreements

Disagreements in code review are healthy — they mean people care. But they need resolution:

1. **Ask clarifying questions** before pushing back. You might be missing context.
2. **Provide evidence.** Link to docs, benchmarks, or past incidents instead of asserting opinions.
3. **Escalate gracefully.** If you're going back and forth for more than 2 rounds, hop on a 5-minute call. Text-based debates lose nuance.
4. **Accept "good enough."** Not every line of code needs to be optimal. Working, tested, readable code that ships is better than perfect code stuck in review.

## The Review Checklist

Print this, pin it, internalize it:

- [ ] I understand what this PR is supposed to do
- [ ] The approach makes sense for the problem
- [ ] Error cases are handled
- [ ] No security vulnerabilities introduced
- [ ] Tests cover the important behavior
- [ ] I left at least one positive comment
- [ ] My suggestions distinguish "must fix" from "nice to have"
- [ ] I reviewed within the team's SLA

## The Culture Shift

Code review isn't just a quality gate — it's the primary mechanism for knowledge sharing, mentoring, and maintaining engineering standards. Invest time in doing it well. The teams that review thoughtfully ship fewer bugs, onboard faster, and build better software.

Stop typing "LGTM." Start having conversations about code.
