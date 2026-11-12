# Rehearsal: mb-oci-homelab-iac

This is a still for the OCI Homelab project card. It has no animation, no cursor and no script.

Gold: `static-card`. I kept its scale: a 400 by 300 card, here 420 by 280. I also kept the 24px gutter, one window with one satellite card, kit `Row` rows and the satellite shadow. I changed the window to a kit terminal and the satellite to a kit `Card`. I also changed the crop. The gold window runs off the right and the bottom, and its satellite straddles the left edge. This terminal runs off the right only, and the panel straddles its bottom edge.

Beats: none. The still shows the payoff. The apply ticked three modules, and the panel lists four instances.

Captured: 420 wide at 1:1 (an 840 by 560 PNG) in light and in dark. One run at 390 wide in light. Close-ups of the panel and of the terminal text in both themes. An 8x close-up of the first row beside the first module line: the two lines of text end on the same pixel row.

Gate: `rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)` in light and in dark. Each run printed `film: no-issues-detected`.

Other checks: `scripts/class-clash.mjs` found no overlapping class names in this folder. `tsc --noEmit -p playground` exited with code 0.

Film: round 1 printed these lines in both themes. The second line came once for each module.

```
[stage-1] uneven gutters: div.ss-card sits 169px from the left of div.ss-stage, 24px from the right and 24px from the bottom; bleed it off an edge, or keep one gutter on every side it doesn't bleed (still)
[stage-1] touching: div "✓ module.network" is 0px from span.oci-tick; text never touches a neighboring box, so hold the pair apart with a fixed gap (gap: 8-12px), not leftover space (still)
```

- Uneven gutters: the center of the panel was below the terminal. I added one blank row after the command. The terminal is now taller, and the center of the panel is over it.
- Touching: each module line is now a flex row with a `1ch` gap between the tick and the words.
- No film line remains in light or in dark.

Review: I did the review myself with `verify.md`. No second reviewer saw the still.

- The bottom-left corner of the stage is empty ground, about 176 by 91 px. This stands. The terminal is as tall as its lines. A terminal that runs off the bottom repeats the layout of `mb-claude-skills` and leaves empty rows below the module lines. I filmed that layout and rejected it.
- The still has 11 real strings, more than the budget of 3 to 7. This stands. The brief asks for four rows with a role and a shape, and for the three modules. I filmed a panel with an `Instances` title and a rule, then removed both.
- Four green dots say that four instances run. See Unresolved.

Assumptions:

- `ARM · 12 GB` and `AMD · 1 GB` are short forms of the shapes. The OCPU counts do not fit beside the roles at 12px.
- `WireGuard bastion` and `Uptime monitor` are short forms of the roles in the README.
- The three ticks are a summary. Terraform prints one line for each resource, not one tick for each module.
- The path `~/oci-homelab-iac` assumes a clone in the home folder.

Unresolved:

- The portfolio entry says that four instances use the free quota. The README in the repo calls four instances the target state, and its compute module defines only `a1-cp`. The still follows the entry. If only `a1-cp` runs, three of the four green dots are wrong.

Not checked:

- The still inside the real site card: the ground of the card, its corner clip, and the 85% scale on a phone. I only scaled the PNG to 358 px.
- A review by a second person or agent.
- Looks other than light and dark.

## Set pass, 2026-11-12

A reviewer judged the six stills as one set. These things changed after that review.

- The panel now shows the staged rollout from the README. The control plane is the current step, so it has the solid dot. The other three nodes are later steps, so each has an open ring and quiet ink. This closes the item under Unresolved.
- The panel takes the window radius (12px), as the cards of the other stills do.
- The success color comes from `mb-look.css` and is emerald. The terminal ticks use `--mb-term-ok`.
- Both themes were filmed again. Each run printed `film: no-issues-detected` and `rehearsal passed`.
