# Rehearsal: mb-claude-skills

A still for the "Claude Skills collection" project card. The design is 420 × 280, and the PNG is 840 × 560.

Gold: `static-card`. I copied its folder and kept the card format. One hero runs off an edge. One satellite straddles a hero edge. The gutter is 24px on every side. Real words are only on the subject, and a filler bar stands for the row that continues. I changed three things.

- The hero is a terminal, not a browser window. It uses the kit's `Window chrome="terminal"` with `Prompt`, as the Create tile in `ruled-bento` does. Each mark sits in a cell of one character.
- The satellite moved from the lower left to the lower right. Terminal text starts at the left edge of the terminal, so a card on that edge covers the text.
- The satellite is the download count, not a list. The list of skills is the picker of the CLI, inside the terminal.

Beats: none. This is a still, with no script and no cursor. It shows one state. The skills CLI found the 94 skills of the collection and asks which skills to install. The person picked the first skill.

Captured:

- Light and dark, at 420 wide and 2x, from `?capture=mb-claude-skills` with `scripts/film.mjs --still`. The browser was the headless Chrome shell on macOS. The files are `stills/claude-skills-light.png` and `stills/claude-skills-dark.png` in the scratchpad.
- Close-ups at 3x to 5x of the command, the picker and the count card, in both themes.
- A 358px copy of each PNG, to read it at the phone size.

Gate: `rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)` on light and on dark, with `--still --gate`.

Film: the last run printed `film: no-issues-detected` on both themes. Two lines came up in round 1, on both themes.

- `tight inset: span.ss-term__cmd "npx skills add 1Mangesh1" sits 1.3px from the right edge of div.ss-window` → `stills/claude-skills-light.png`, round 1 → fixed. Atkinson Hyperlegible Mono is 0.633em wide for each character, not 0.6em. The one-line command did not fit a terminal that leaves room for a satellite. The command now has two lines with a backslash, and its text column is 290px wide.
- `clipped: span.ss-text "database-indexing" clipped right by 2px by span.ss-row__title` → the same frame → fixed. The list card is gone. The skill names are terminal lines now.

Review: no second reviewer looked at the frames. This agent cannot start one. I did the `review.md` pass on my own frames. These are the points that I judged and left.

- The ground above the count card is bare, 74px wide and 188px high. That is 12% of the stage. The gold leaves 104px by 120px above its detail card, which is 10%. The other stills in the set that pin a window on the left do the same.
- The command has two lines. On one line it needs 364px at 11.5px. The text column of the terminal is 290px.
- The list has one filler row. A second row lands 3.5px above the crop.
- The outline diamond is lighter than the solid one. Both are font glyphs, and the CLI prints them that way.

Assumptions:

- The picker lists skills in name order. The `add` command of the CLI sorts them by name before it shows the picker (`src/add.ts` in vercel-labs/skills, read on 2026-11-12). In that order the first three rows are `ai-agents`, `ai-prompting` and `ansible`.
- "Found 94 skills" is true on 2026-11-12. The listing shows 94 skills for the repo, and the repo has 94 `SKILL.md` files. The count changes when the owner adds a skill.
- The still writes the owner as `1Mangesh1`, as the blog post and GitHub do. The listing prints the same command with a lowercase owner.
- The terminal uses the same tokens as `mb-oci-homelab-iac`: gray-900 in light, the canvas in dark, a gray prompt and green marks. I read that file on 2026-11-12. If it changes, the two terminals stop matching.

Unresolved:

- `mb-oci-homelab-iac` is also a terminal with a card on the lower right. In date order it sits directly above this still in the portfolio grid. This still differs on purpose: a tall terminal, a picker, and a small count in place of a list panel. Look at the two in the real grid before you ship them.
- The entry says "300+ downloads". On 2026-11-12 the listing shows 775 total installs for the account and 599 for this repo. The still follows the entry. If the entry changes, change `300+` in `index.tsx` and film again.

Not checked:

- The PNG in the real project card, on desktop and on a phone.
- A review by a second person or agent.
- Motion. There is none.
- A compact design. There is none, because the site scales the PNG for a phone.
- The other looks: blueprint, glass, mono, and the minimal and realistic fidelities.
- Fonts on Windows or Linux. The four marks in the terminal (two diamonds, a disc, a ring) come from a macOS fallback font. This matters only if someone films the still again on a different system.
