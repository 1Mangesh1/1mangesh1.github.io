---
title: "Your First Week With Claude Code: A Day-by-Day Guide"
description: "What actually clicks each day when you start using Claude Code — install, context, CLAUDE.md, plan mode, skills, git guardrails. A practical 7-day onboarding."
pubDate: 2026-05-16T00:00:00Z
tags: ["Claude Code", "AI Agents", "Agentic Coding", "Developer Tools", "Claude", "AI Engineering", "Productivity", "Workflow Automation"]
draft: false
---

Claude Code went from "new thing" to the #1 AI coding tool in about eight months, past Copilot and Cursor in developer adoption. By 2026, agentic coding — telling an agent what you want and letting it edit, run, and verify — is roughly 55% of where developers spend their tooling attention. That shift is real, and it changes how you work day to day.

This is not a "what is Claude Code" explainer. There are plenty of those. This is what each day actually *feels* like in your first week, using the repo behind this very site — an Astro blog with content collections, a Yarn build, a `CLAUDE.md`, Pagefind search — as the running example.

Fair warning: some days are awkward. You will accept a bad edit. You will give a vague instruction and get vague work back. That's normal. That's the point. The skill you are building is judgment, not prompting.

## Day 1: Make one small change

Install it, point it at a repo, and ask for one small change. Not a feature. Something boring. On this site, that was tightening a description on a single content file and fixing a typo in a heading.

What clicks on Day 1 is physical: this thing *acts*. Autocomplete suggests; Claude Code edits the file, on disk, now. Your editor's git gutter lights up before you have processed what happened. That gap — between asking and the change already existing — is the whole mental adjustment of week one.

The trap is the same gap. The output reads confident, so you skim it and hit accept. Don't. Day 1's only real lesson: review the diff every single time. `git diff` is your seatbelt. An agent that edits ten files as fast as one is exactly as fast at editing ten files wrongly.

Here is how that went for me. I asked it to fix one Astro frontmatter description that was too long for the meta tag. It also "helpfully" reflowed two unrelated lines and tightened a sentence I never asked it to touch. Harmless on a Markdown post. On `astro.config.mjs` or `tailwind.config.mjs`, an unrequested "tidy" is how you spend an evening bisecting a build. The fix itself landed in under three seconds. Reading it carefully took maybe forty. That ratio — slower to review than to generate — feels wrong on Day 1 and is exactly right.

A useful framing: treat every accepted diff as code you wrote. Because once it is committed, it is. "The agent did it" is not a defense in a postmortem. The blame, and the credit, are yours.

End the day with a rule you will keep all week: small ask, read the diff, accept or reject deliberately. You are not learning to prompt. You are learning to review fast.

## Day 2: Let it read before it writes

Day 2, resist the urge to ask for a change. Ask a question instead. "Walk me through how content collections are wired in this repo. Don't edit anything."

On this site that means it reads `src/content.config.ts`, finds the Zod schemas for `blog`, `portfolio`, `til`, `bookmarks`, and the rest, then traces how `getCollection('blog')` flows into the dynamic `blog/[slug].astro` route. You get a map. You did not write a single clever sentence to get it.

Here's the shift, and it's the one that took me longest to internalize: loading context beats clever prompting. People burn Day 2 trying to phrase the perfect instruction for a change, when the real lever is letting the agent load the relevant code first. A short ask against good context outperforms an elaborate ask against none.

The trap is assuming it already understands your repo. It doesn't, until it reads it. If you ask for a change cold, it guesses your conventions and guesses wrong — invents a frontmatter field, misses that this project uses Yarn, picks a pattern from some other Astro site in its training data.

There is a second payoff: explaining-before-editing is also how *you* catch the agent's misunderstanding cheaply. If its explanation of your routing is wrong, you correct one paragraph of text. If you skip straight to the edit, you correct wrong code instead — slower, and now mixed in with changes you did want.

So make "read first" a habit. Before any non-trivial edit: "Explain how X works here, then wait." On this repo, that one question surfaced that every collection is schema-validated and that the build refuses to proceed on a schema mismatch — which meant Day 4's plan would have to update `content.config.ts` first, not just drop in a Markdown file and hope. You only learn that by letting it read, and the cost of the question is a minute you would have spent debugging anyway.

## Day 3: Write a CLAUDE.md

By Day 3 you are tired of repeating yourself. "Use Yarn, not npm." "Content needs a Zod schema entry." You typed it yesterday and you are typing it again. Stop. Write a `CLAUDE.md` at the repo root.

It is a plain Markdown file the agent reads automatically at the start of every session. Project rules, conventions, gotchas — written once, applied every time. This repo's lives at the root and it is opinionated on purpose:

```markdown
## Conventions
- Use **Yarn**, not npm. CI uses Yarn for consistency.
- All content collections are validated by Zod schemas in
  `src/content.config.ts`. New fields → update the schema first.
- `yarn build` runs `astro check` then `astro build` then Pagefind.
  The build is the gate; it must pass.
```

Encode the rule once and stop re-explaining it. Every "actually, we do it this way here" you say twice is a missing line in `CLAUDE.md`. The file is not documentation for humans. It is durable context for the agent.

The trap is overstuffing it. A 600-line `CLAUDE.md` is as useless as none — the agent skims it like you skim a EULA, and the signal drowns. Keep it short and load-bearing: only the rules that, if violated, break something. "Use Yarn" earns its line because npm here corrupts the lockfile CI depends on. "Prefer descriptive variable names" does not; that is noise.

Tonight's test: take the two corrections you repeated this week and add exactly those. Nothing else. Start a fresh session and watch it follow them without being told. That moment — where the agent already knows — is what Day 3 buys you.

## Day 4: Plan before code

Day 4, attempt something with steps. On this site: add a whole new content collection — say `experiments` — schema, route, listing page, sample entries. Your instinct is to describe it in one paragraph and let it rip.

Don't. Use plan mode. Ask for the plan, no edits yet. The agent comes back with: add the Zod schema to `content.config.ts`, register it in the `collections` export, create `src/content/experiments/`, build `experiments/index.astro` and `experiments/[slug].astro`, add nav. You read that list and immediately catch what a one-shot would have missed — it forgot the nav link, or it wanted to skip the dynamic route.

Agents drift on big, vague asks. The longer the task, the more room to wander off your intent. A plan is a cheap checkpoint. You correct a five-line list in ten seconds; you correct eight wrong files in twenty minutes. Plan, approve, then let it execute the thing you actually approved.

The trap is approving a plan you skimmed. The plan is the contract. If it says "create the route" and you wanted view transitions and Pagefind data attributes too, say so *now* — not after it has written four files to the wrong spec.

Planning the `experiments` collection here exposed that the schema has to come first, because `astro check` fails loudly the instant a Markdown file references a collection that isn't registered. The plan reordered itself once I pointed that out. That correction cost one sentence. Post-hoc, it would have cost a debugging session.

## Day 5: Reach for a skill

Day 5 you notice you are re-typing the same multi-step instruction. "Write the post, match the house voice, run `astro check`, then strip the AI tells." Third time this week. That repetition is the signal: stop prompting it, package it as a skill.

A skill is a named, reusable capability the agent can invoke — your workflow, written down once, callable on demand. The one-off prompt is a sticky note. The skill is the procedure pinned to the wall, the same every time.

A repeatable workflow beats a clever one-off. Prompts don't compound — you re-derive them every time and they drift. A skill is versioned, improvable, and consistent across sessions and projects. I won't reteach the whole thing here; I wrote it up in [the complete guide to building AI agent skills](/blog/how-to-build-ai-agent-skills). Day 5 is just the moment you feel *why* you'd want one.

The trap is skill-ifying too early. If you have done something once, prompt it. The second or third identical multi-step ask is when it earns a skill. Premature skills are abstraction debt: you end up maintaining a little process you barely use, and worse, you froze its shape before you knew what the right shape was.

On this repo, the "draft a blog post in the house voice, then verify with `astro check`" loop is a textbook candidate. Same shape every post, clear inputs, a hard verification gate. The first post is a prompt. By the fourth it should be a skill, and the agent should reach for it without you spelling out the steps.

## Day 6: Branch, verify, you commit

Day 6 you ship something real. Set the workflow now, before it becomes a habit you regret: branch first, let the agent do the work, let it run the tests, and *you* type the commit.

On this site the verification gate is one command: `yarn build`. It runs `astro check` for types and content-schema validation, then `astro build`, then the Pagefind index. If the agent added a frontmatter field the Zod schema doesn't know, `astro check` fails and the build stops. No exceptions, no "it's basically fine."

```bash
git checkout -b feat/experiments-collection
# agent makes changes, then:
yarn build   # astro check + astro build + pagefind
git add -A && git commit   # you write this line, not the agent
```

Trust, but verify — and own the commit. Let the agent run the checks; it should run `yarn build` itself and report the result. But the commit is your signature on the work. Reading the diff and authoring the commit message is how you stay the engineer instead of the rubber stamp.

The trap is letting "tests pass" be a claim instead of evidence. An agent will cheerfully say it verified when it didn't. Make it paste the actual `yarn build` output. No green output, no commit.

I have watched a change look perfect in the diff and then fail `astro check` because a date was a quoted string, not a real date the schema expects. The diff lied. The build didn't. That is exactly why the gate exists and exactly why your hand is the one on the commit.

## Day 7: Make it yours

By Day 7 the agent feels like a tool you operate, not a toy you poke. Last move of the week: customize it. Hooks, settings, memory — the layer that turns a generic assistant into *your* setup on *this* repo.

Hooks fire on events. A `SessionStart` hook can inject project state — current branch, whether the build is green, an open-tasks reminder — into every session automatically, so you stop pasting context by hand. Settings let you pre-allow safe commands so you are not approving `yarn build` for the hundredth time. Memory persists facts across sessions: corrections you made once that should never be re-litigated.

This is the move from user to operator. Days 1–6 you used defaults. Day 7 you bend the tool to the project. A `SessionStart` hook that announces "branch: feat/x, build: passing, 3 open tasks" means the agent opens every session already oriented — context you would otherwise re-explain daily.

The trap is automating before you understand the manual flow. Don't write hooks on Day 2. You need a week of friction to know which friction is worth removing. Automating a workflow you haven't felt yet just bakes in a guess.

On this repo, the highest-value hook is a `SessionStart` that surfaces the Yarn-not-npm rule and the build-is-the-gate rule from `CLAUDE.md` as an active reminder, not passive text. `CLAUDE.md` is read; a hook is *pushed*. The difference matters on a long session where the early context gets crowded out — the rule that was loaded on line one is not the rule top of mind on edit forty. A hook re-asserts it. You started the week accepting its edits. You finished it configuring how it shows up.

## The 7-day checklist

- [ ] **Day 1:** Install, point at a repo, make one small change — and read the diff.
- [ ] **Day 2:** Ask it to explain part of your codebase before you let it edit anything.
- [ ] **Day 3:** Write a short, load-bearing `CLAUDE.md` with the rules you keep repeating.
- [ ] **Day 4:** Use plan mode for a multi-step change; approve the plan, not the vibe.
- [ ] **Day 5:** Turn your most-repeated multi-step prompt into a reusable skill.
- [ ] **Day 6:** Branch, let it run `yarn build`, demand the output, then *you* commit.
- [ ] **Day 7:** Add one hook or setting that removes friction you actually felt this week.

## Where it still trips up

A week in, you will know the rough edges, because you will have hit them:

- **Drift on vague asks.** Big, fuzzy instructions wander. The fix is plan mode and smaller scopes, not better adjectives.
- **Confident wrong edits.** It will change a file, explain why it is correct, and be wrong. The diff and the build catch this; your trust does not.
- **Context limits.** It hasn't read your whole repo and can't hold all of it at once. On a large codebase it works from a slice, so point it at the right files instead of assuming it already knows.
- **Verification theater.** "I ran the tests and they pass" is a sentence, not proof. Make it show the command output.

None of these are dealbreakers. They are the reasons the week-one habits — read the diff, plan first, gate on the build, own the commit — exist at all.

## Resources

- [Anthropic's Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) — the official reference for install, configuration, hooks, and settings.
- [Building AI Agents That Actually Work](/blog/building-ai-agents-practical-guide) — the patterns and failure modes behind tools like this one.
- [The Complete Guide to Building AI Agent Skills](/blog/how-to-build-ai-agent-skills) — Day 5, in full: structuring, testing, and shipping reusable skills.

The week is not about learning prompts. It is about learning where to put your judgment when the typing is no longer the bottleneck.
