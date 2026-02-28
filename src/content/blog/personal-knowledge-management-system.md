---
title: "How I Built a Personal Knowledge Management System"
description: "My PKM setup using Obsidian, git, and automation to never lose an idea again"
pubDate: 2026-01-18T00:00:00Z
tags: ["productivity", "pkm", "obsidian", "note-taking", "automation"]
draft: true
---

I used to lose ideas constantly. Bookmarks I'd never revisit, notes scattered across apps, and that nagging feeling that I'd read something relevant *somewhere* but couldn't find it. Then I built a system.

This is my personal knowledge management (PKM) setup using Obsidian, git, and a handful of automation tools. It's been running for over a year, and it's changed how I think, learn, and create.

## The Philosophy: Why a System Matters

A PKM system isn't about hoarding information — it's about **building a second brain** that surfaces the right knowledge at the right time. I follow three core principles:

1. **Capture is effortless** — if it takes more than 10 seconds, I won't do it
2. **Organization is emergent** — structure comes from linking, not filing
3. **Output is the goal** — notes should fuel writing, projects, and decisions

These principles draw from Tiago Forte's PARA method and Niklas Luhmann's Zettelkasten system.

## The PARA Method: Organizing by Actionability

PARA categorizes everything by how actionable it is:

- **Projects**: Active work with a deadline (e.g., "Launch blog redesign")
- **Areas**: Ongoing responsibilities (e.g., "Health", "Career growth", "Side projects")
- **Resources**: Topics of interest for future reference (e.g., "TypeScript patterns", "System design")
- **Archive**: Completed or inactive items

```
vault/
├── 00-Inbox/              # Unsorted captures
├── 01-Projects/           # Active projects
│   ├── blog-redesign/
│   └── rust-learning/
├── 02-Areas/              # Ongoing responsibilities
│   ├── career/
│   ├── health/
│   └── side-projects/
├── 03-Resources/          # Reference material
│   ├── typescript/
│   ├── system-design/
│   └── devops/
├── 04-Archive/            # Done/inactive
├── 05-Daily/              # Daily notes
├── 06-Templates/          # Note templates
└── 07-Zettelkasten/       # Atomic permanent notes
```

The key insight: notes **move** through PARA. A resource note might become relevant to a project, then get archived when the project is done.

## Zettelkasten: Atomic Notes and Links

The Zettelkasten method creates a network of atomic, heavily linked notes. Each note contains **one idea**, explained in your own words.

**Rules I follow:**
1. One idea per note (if you need "and" in the title, it's two notes)
2. Write in your own words (not copy-paste from sources)
3. Link aggressively — every note should connect to at least 2 others
4. Add a brief context line explaining *why* the link exists

```markdown
# Composition Over Inheritance

Prefer composing behavior from small, focused units rather than
building deep inheritance hierarchies.

## Why It Matters
- Inheritance creates tight coupling; changes to a parent ripple down
- Composition lets you swap behaviors at runtime
- Easier to test — inject mock behaviors instead of fighting class hierarchies

## Examples
- React hooks compose behavior (useAuth + useFetch + useCache)
- Go interfaces are implicitly satisfied — composition by default
- [[Functional Composition in TypeScript]] achieves this with pipe/flow

## Related
- [[SOLID Principles]] — Interface Segregation aligns with composition
- [[Design Patterns - Strategy]] — strategy pattern IS composition
- [[When Inheritance Is Actually Fine]] — data model hierarchies
```

After a year, my Zettelkasten has ~400 notes with ~1,200 links. New ideas almost always connect to existing ones — that's when the system starts thinking for you.

## Daily Notes Workflow

Every day starts with a daily note. Obsidian creates it from a template automatically.

**My daily note template:**

```markdown
# {{date:YYYY-MM-DD}} — {{date:dddd}}

## Morning Intentions
- [ ] Top priority:
- [ ] Secondary:
- [ ] If time:

## Captures
<!-- Quick thoughts, links, ideas throughout the day -->

## Work Log
<!-- What I actually did -->

## Learned Today
<!-- TIL items — these get promoted to Zettelkasten notes -->

## End of Day Review
- What went well:
- What didn't:
- Tomorrow's priority:
```

I spend ~5 minutes in the morning and ~5 minutes at the end of the day. The captures section is where magic happens — I dump everything there and process it during a weekly review.

## Progressive Summarization

Not every note deserves deep engagement. I use Tiago Forte's progressive summarization:

1. **Layer 0**: Save the source (bookmark/clip)
2. **Layer 1**: Bold the key passages
3. **Layer 2**: Highlight the bolded passages
4. **Layer 3**: Write a summary in my own words
5. **Layer 4**: Remix into original content

Most notes stay at Layer 1 or 2. Only notes I actively use get promoted to Layer 3+. This prevents over-processing — I invest effort *just in time*.

## Obsidian Automation with Templater

The Templater plugin supercharges my workflow:

**New project template:**

```markdown
<%* 
const title = await tp.system.prompt("Project name");
const deadline = await tp.system.prompt("Deadline (YYYY-MM-DD)");
-%>
# <%= title %>

**Status**: 🟢 Active
**Deadline**: <%= deadline %>
**Created**: <% tp.date.now("YYYY-MM-DD") %>

## Objective
<!-- What does "done" look like? -->

## Tasks
- [ ] 

## Notes & Links

## Log
### <% tp.date.now("YYYY-MM-DD") %>
- Project started
```

**Quick capture from clipboard:**

```markdown
<%*
const content = await tp.system.clipboard();
const source = await tp.system.prompt("Source URL (optional)");
-%>
# Capture: <% tp.date.now("YYYY-MM-DD HH:mm") %>

## Content
<%= content %>

<% if (source) { %>
## Source
<%= source %>
<% } %>

## My Thoughts
<!-- Why did this catch my attention? -->

#inbox #to-process
```

## Linking Strategy

Links are the lifeblood of a Zettelkasten. I use three types:

1. **Direct links** `[[Note Name]]` — explicit conceptual connections
2. **Tags** `#topic` — broad categorization for discovery
3. **MOCs (Maps of Content)** — index notes that curate links around a theme

**Example MOC: TypeScript Mastery**

```markdown
# TypeScript Mastery 🗺️

## Core Concepts
- [[TypeScript Type System Fundamentals]]
- [[Generics Deep Dive]]
- [[Conditional Types and Inference]]
- [[Template Literal Types]]

## Patterns
- [[Functional Composition in TypeScript]]
- [[Builder Pattern with TypeScript]]  
- [[Discriminated Unions for State Machines]]

## Gotchas
- [[TypeScript Structural Typing Surprises]]
- [[Why `extends` Doesn't Mean What You Think]]

## Resources
- [[Effective TypeScript — Book Notes]]
- [[TypeScript Release Notes Highlights]]
```

MOCs are my favorite feature — they create curated entry points into my knowledge base.

## Syncing with Git

I sync my vault with a private git repo. Here's my setup:

```bash
# .obsidian-sync.sh — runs on a cron every 30 minutes
#!/bin/bash
cd ~/Documents/vault

# Only sync if there are changes
if [[ -n $(git status --porcelain) ]]; then
  git add -A
  git commit -m "vault sync: $(date '+%Y-%m-%d %H:%M')"
  git pull --rebase origin main
  git push origin main
fi
```

```bash
# Crontab entry
*/30 * * * * /bin/bash ~/scripts/obsidian-sync.sh >> ~/logs/obsidian-sync.log 2>&1
```

**Why git over Obsidian Sync:**
- Free (Obsidian Sync is $8/month)
- Full version history with meaningful diffs
- Can access notes from terminal or any text editor
- Backup is inherently distributed

**Trade-off:** No real-time sync across devices. I use git on desktop and the Obsidian git plugin on mobile (which can auto-pull/push).

## Publishing a Digital Garden

Some notes graduate from my private vault to a public digital garden. I use a simple workflow:

1. Notes marked with `#public` in my vault
2. A script copies public notes to my Astro site's content directory
3. Astro builds and deploys them

```bash
#!/bin/bash
# publish-garden.sh
SOURCE=~/Documents/vault/07-Zettelkasten
DEST=~/projects/website/src/content/garden

# Find notes tagged as public
grep -rl "#public" "$SOURCE" | while read file; do
  filename=$(basename "$file")
  # Strip the #public tag in the copy
  sed 's/#public//g' "$file" > "$DEST/$filename"
done

echo "Published $(ls $DEST | wc -l) notes to digital garden"
```

## Weekly Review Ritual

Every Sunday I spend 30 minutes on a weekly review:

1. **Process inbox** — move or delete unprocessed captures
2. **Review daily notes** — extract anything worth keeping
3. **Promote learnings** — TIL items become Zettelkasten notes
4. **Update projects** — mark progress, archive completed ones
5. **Resurface random notes** — Obsidian's Random Note plugin sparks unexpected connections

This is the most important habit. Without it, the system decays into a graveyard of unprocessed captures.

## What I've Learned

After a year of deliberate PKM practice:

- **Quantity of notes doesn't matter** — quality of links does
- **Perfect organization is a trap** — search and links beat folders
- **The system should serve creation** — if you're just filing notes, something's wrong
- **Start simple** — I began with just daily notes and Zettelkasten, added PARA later
- **Consistency beats intensity** — 5 minutes daily beats a 2-hour weekend session

The best knowledge management system is the one you actually use. Start with a daily note, link one thing to another, and let the network grow.
