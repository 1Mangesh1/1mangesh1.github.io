# Rehearsal: mb-fieldnotes

Gold: `static-card`.

- Kept: one browser window, one list, one detail card, one 24px gutter, and the kit shadows for the hero and the satellite.
- Changed: I mirrored the layout. The window is whole across and runs off the bottom only. The card straddles the right edge of the window at the lower right.
- Changed: the sidebar and the customer rows became a five-step trace with done marks on a rail. The receipt became the verdict.

Beats: none. This is a still with no script and no cursor.

Captured:

- The 420 x 280 stage at 2x (840 x 560 PNG), light and dark, with `film.mjs --select '.ss-stage' --pad 0 --still`.
- `film.mjs --still --gate` at the stage width, at `--width 390` and at `--width 358`, light and dark. The six frames are in `<work folder>/stills/fn-work/gate-final/`.
- The whole stage at 4x in both themes, and 6x close-ups of the first row and of the rail. These frames are in `<work folder>/stills/fn-work/fix1/`.
- One trial with emerald success tokens in both themes (Review, item 4). The trial is not in the source.

Gate: `rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)` on each of the six runs.

Film:

- Each of the six runs prints `film: no-issues-detected`.
- Before the fix, the four runs at 390 and at 358 failed the gate. They printed `uneven inset: div.ss-row holds its children 0px from its left edge and 31px from its right` (33px at 390). The frames from before the fix are in `<work folder>/stills/fn-work/gate-before/`.

Review: a fresh-eye reviewer judged the set of six project stills and sent this still back with one fault. The other items are the notes of the reviewer on the set.

1. Fault: the first row had a gray bar at its right end. No other row had one, and the bar failed the gate at 358 and at 390. Response: I removed the bar. Each row is now a done mark and a name. The gate passes at the three widths in both themes. Against the frames that the reviewer judged, the only pixels that changed are the bar: stage x 284 to 310, y 83 to 89.
2. Radius: the window and the card have a 12px radius, which is the value that most stills in the set use. I changed nothing.
3. Address text: this still draws the address at 11.5px in the body gray (`--ss-text`). The voice-agent still now has the same rule. I changed nothing.
4. Green family: the checks, the meter and `APPLY` take `--ss-success` and `--ss-success-text` from the look. This folder sets no color. The set shares the look file `examples/mb-look.css`, and I did not edit it. When I filmed, the look file did not set the success tokens, so the two PNGs show the kit green. I filmed a trial with `--ss-success: #10b981` and `--ss-success-text: #047857` (dark: `#34d399`). The white ticks and `APPLY` read in both themes.
5. Difference from the gold: the gold card closes on a real total, and the lower half of this card is bars. This difference stands. The set allows seven real strings, and this still uses seven. The product shows no value in that position that is not a sample metric.
6. The meter has no label. The reviewer accepted this.

No second reviewer looked at the still after this fix, because this session cannot start one.

Frame facts:

- Framing: one 24px gutter (window top and left, card right and bottom). The window is 300px wide (71% of the stage) and 25% of it is past the bottom. The card is 160px wide with 72px outside the window.
- The top right corner of the stage is empty. It is the mirror of the empty top left corner in the gold.
- Subject: the five step names and the verdict are real words. The bars are the foot line of the trace and the evidence lines in the card.
- The foot bars end on the bottom gutter line, level with the bottom edge of the card.
- Fonts: I rendered `APPLY`, the address and one step name from the two font files of the site. The letterforms match the PNGs in both themes.

Real strings (7):

- `fieldnotes.mangeshbide.tech`: the `demo` field in `src/content/portfolio/fieldnotes.md`.
- `fetch_and_parse_jd`, `research_company`, `scan_github`, `compare_resume`: the `AgentToolName` values in `src/job_researcher/models.py` of the linked repo.
- `generate_verdict`: the step function in `src/job_researcher/steps/verdict_generator.py` of the linked repo. `pipeline.py` and `agent.py` call it last.
- `APPLY`: the description in the portfolio entry, and the `Recommendation` value in `models.py`.

I downloaded `models.py`, `verdict_generator.py`, `agent.py` and the live page again in this round. They are the same as the copies from the first round.

Assumptions:

- The fifth row is `generate_verdict`. The ledger in the live product lists only the four agent tools, so the trace is not a copy of the live screen.
- The meter is the match score. It has no number and no label. The fill is 84% of the track and stands for a strong match only.
- Identifiers use the mono font. All other text uses the sans font of the site.

Unresolved:

- The green family is a decision for the set (Review, item 4). After the look file changes, film this still again. The source needs no change.
- The address is the host from the portfolio entry. The live host answers with a 307 redirect to `mangeshbide-job-researcher.hf.space`, so a real browser shows that host after the page loads.

Not checked:

- The still in the real card on the site, in the grid and on a phone. I did not convert the PNGs to the webp files of the site.
- Reduced motion, hover and loop. They do not apply to a still with no script.
- Other looks: mono palette, minimal and realistic fidelity, blueprint and glass.
