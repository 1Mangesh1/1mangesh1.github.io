---
title: "My Claude Code Setup: Rule Files, Memory Plugins, and Two Personalities"
description: "A tour of my actual Claude Code configuration: layered CLAUDE.md rule files, a lazy-senior-dev mode called ponytail, a token-saving caveman mode, persistent memory plugins, and the skills that enforce discipline. With honest notes on what actually matters."
pubDate: 2026-08-03T00:00:00Z
tags: ["claude-code", "ai", "developer-tools", "productivity"]
draft: false
---

"Best Claude Code setups" has become a search category this year, which tells you where we all are: the tool is settled, the harness around it is the competition. I've been running a heavily customized setup for months, including on this site, and this is the full tour. Not the idealized version. The actual one, including the parts that are probably overkill.

The one-line philosophy behind all of it: every piece of my config exists because the same failure happened twice.

## The Layer Cake

Claude Code reads configuration in layers, and I lean on that hard:

1. **Global `~/.claude/CLAUDE.md`** - rules that apply to every project I touch
2. **Per-project `CLAUDE.md`** - checked into each repo, describes that codebase
3. **Session state** - hooks and plugins that inject behavior at startup

The global file is deliberately tiny. It holds two kinds of things: the non-negotiables, and imports. The most load-bearing sentence in it is the first rule:

```markdown
- Never assume. Unsure of any fact, API, library behavior, or intent?
  Search/verify first (web, docs, code) - guessing is never acceptable.
```

Every LLM horror story I've had traces back to a confident guess. A plausible-but-invented package name, a remembered-wrong API signature, an assumed intent. One rule at the top of every session attacks the whole class.

The second most load-bearing rule is about the file itself:

```markdown
- Keep the whole import tree under ~150 lines; add a rule only when
  the same mistake recurs, and prune before adding.
```

Context given to the model is a budget, not a wishlist. A 900-line CLAUDE.md is a way of making sure nothing in it gets followed. Mine imports eight small rule files: `comms.md` (be concise, lead with the answer, evidence over assertions), `workflow.md` (plan before code, verify before claiming done), `quality.md` (the no-AI-slop rules), `security.md` (no secrets in code or logs, no PII, verify package names on the registry before installing), `git.md` (conventional commits, no AI attribution footers, I make my own commits), `tools.md` (rg over grep, fd over find, jq for JSON), `context7.md` (fetch versioned library docs instead of trusting training data), and `ponytail.md` (more on that below). I just counted: the entire tree, root file plus all eight imports, is 99 lines. Under budget. Every line is a scar.

## Personality One: Ponytail, the Lazy Senior Dev

The most valuable plugin I run is called ponytail. It loads a persona into every session: a lazy senior developer who's seen every over-engineered codebase and been paged at 3am for one. Lazy meaning efficient, not careless. It enforces a decision ladder that runs before any code gets written:

1. Does this need to exist at all? (YAGNI)
2. Does the codebase already have it? Reuse beats rewrite.
3. Does the standard library do it?
4. Does a native platform feature cover it? `<input type="date">` over a picker library, CSS over JS, a DB constraint over app code.
5. Does an already-installed dependency solve it?
6. Can it be one line?
7. Only then: the minimum code that works.

If you've used LLMs for code, you know why this exists. The failure mode of a capable model isn't bad code. It's too much code: the abstraction nobody asked for, the config knob for a value that never changes, the factory with one product. Ponytail is a standing counterweight, applied every session, so I don't have to say "simpler, please" forty times a week.

My favorite mechanic is the `ponytail:` comment. When the ladder produces a deliberate shortcut, it gets marked with its ceiling and upgrade path:

```python
# ponytail: global lock, per-account locks if throughput matters
```

That comment does something subtle: it converts "is this lazy or is this negligent?" into a written answer. Simple reads as intent, not ignorance. There's even a companion command that harvests these markers across the repo so deferred debt doesn't silently become permanent debt.

## Personality Two: Caveman

The second persona is dumber and I love it. Caveman mode strips the model's prose down to fragments: no pleasantries, no hedging, no "I'd be happy to help you with that." A session-start hook enforces it. The style guide is one line:

> Not: "Sure! I'd be happy to help you with that." Yes: "Bug in auth middleware. Fix:"

Code, commits, and anything user-facing stay in normal English; only chat prose gets compressed. It cuts token usage on responses substantially, but honestly the tokens are secondary. The real effect is that answers lead with the answer. When every response starts with the conclusion instead of a paragraph of throat-clearing, you notice how much throat-clearing you were reading before.

Two personas sounds like a gimmick, I know. But the split earns its keep: ponytail governs what gets built, caveman governs how it gets talked about. Minimal code, minimal prose, independently toggleable.

## Memory, Because Sessions End

Out of the box, every Claude Code session is an amnesiac. Two plugins fix that for me.

**Auto-memory** is the simple one: a directory of small markdown facts the model maintains itself, indexed by a file that loads each session. Mine remembers things like "this user makes their own git commits" so I never get an unwanted commit, and what the goal of a long-running branch is. The discipline that makes it work is the same as the rules file: one fact per file, prune aggressively, never store what the repo already records.

**claude-mem** is the heavy one. It records observations from every session (things discovered, bugs fixed, decisions made) into a searchable timeline. When I start a session, I get a compressed digest of recent work; when I need details, they're one query away instead of being re-derived from scratch. The compression stats it reports on this project: about 280k tokens of past work reachable through a 15k-token index. That's the difference between "let me re-explain my architecture to the amnesiac" and "continue where we left off."

A third plugin, context-mode, attacks the same problem from the other side: instead of remembering more, it pollutes less. Big command outputs get indexed in a sandbox and searched, instead of getting dumped raw into the context window. Verbose build logs and huge JSON responses stop eating the space my actual task needs.

## Skills: Process as Code

Skills are instruction sets that load on demand. I listed my `~/.claude/skills` directory while writing this post and there are 62 of them, which sounds absurd until you remember they cost nothing while dormant. They cluster into families: a design suite (typography, color, layout, motion, several competing aesthetic philosophies that argue with each other), a writing suite (including a humanizer that strips AI tells and a `deslop` skill for cleaning generated code), and the family that actually earns its keep: process disciplines. A brainstorming skill that interrogates requirements before any code gets written. A systematic-debugging skill that demands a reproduced root cause before proposing fixes. A verification-before-completion skill that blocks "done" claims until commands were actually run and their output observed. Each of those exists because the failure it prevents (building the wrong thing, patching symptoms, claiming success on faith) is a failure I've watched happen.

I also write my own. The one I'm most invested in scans health-data projects for PHI leaks and missing auth on endpoints, because my day-job code lives under HIPAA and "did anything log a patient identifier" should be a check, not a vibe. There's a small suite for this blog too: SEO auditing, technical-writing structure, that kind of thing. Writing a skill is twenty minutes of markdown; the payoff is that hard-won process survives the session that learned it.

## What Actually Matters, Ranked

If you're starting from a stock install, here's my honest ordering of return on effort:

1. **A small global CLAUDE.md with rules born from real failures.** Costs nothing, applies everywhere. Start with "never assume, verify" and add scars as you earn them.
2. **Some memory system.** Amnesia is the biggest tax on daily LLM use. Even the plain memory directory changes the experience.
3. **A minimalism counterweight.** Whether it's ponytail or a paragraph you paste in, something has to push back on over-generation, permanently, without you re-typing it.
4. **Process skills.** Brainstorm before building, verify before claiming done.
5. **Prose style modes.** Fun, real savings, least important. Caveman is the seasoning, not the meal.

And one warning, which is also the thesis: don't copy my config. Not because it's secret (most of it is public plugins) but because a rules file is a diary of one person's specific mistakes. Mine is tuned against my failure modes: over-trusting generated APIs, tolerating verbose answers, letting agents commit. Yours will be different. Start empty. Add a rule the second time something goes wrong, never the first. Prune monthly.

For the curious, the full plugin roster alongside ponytail, caveman, claude-mem, and context-mode: superpowers (the process-skill enforcement layer), context7 (versioned library docs), a Karpathy-guidelines pack (surgical changes, surface assumptions), plus the official code-review, GitHub, Sentry, and Vercel plugins and a couple of experiments like ralph-loop. Sixteen installed. Maybe six load-bearing. That ratio is honest and I suspect universal.

The setup took months to accrete and it re-earns its place constantly: this site's chatbot, its games, the scheduled-posts system this series runs on, all built inside it. The harness isn't the interesting part of any of those projects. Which is exactly what a good harness feels like.
