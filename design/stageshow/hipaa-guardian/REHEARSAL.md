# Rehearsal: mb-hipaa-guardian

A still, 420 × 280, for the HIPAA Guardian project card. It shows the audit report after a scan.

## Gold

I copied `static-card`.

Kept from the gold:

- The feature-card stage with one 24px gutter.
- A kit `Window` on `--ss-shadow-hero` as the hero, and one raised card on `--ss-shadow-satellite` as the only satellite.
- Kit `Row`s for the list, with real words on the focus and its neighbor, and bars on the row that the crop cuts.

Changed from the gold:

- The layout. The gold pins the window at the top left and runs it off the right and the bottom. Its detail card is at the lower left. This still centers the window and runs it off the bottom only. The open finding is the card. It lies across the window and is one gutter wider on each side.
- The look. It comes from `../mb-look.css`, with cool grays.
- The content. There is no sidebar and no avatar. The title bar holds a file name and a status badge, not an address.
- No `compact` design. The site scales the PNG.

I also filmed `corner-chip`, `table-edit`, `ruled-bento`, `close-up`, `stacked-cards`, `overlap` and `panel-annotation` to compare.

## Beats

None. Nothing moves, and there is no cursor and no script.

## Fix round

A second agent reviewed the still and sent it back with one fault. This round changed one declaration in `hipaa-guardian.css`. The rule `.hg-stat__value` now sets `color: var(--ss-text-strong)`. Before, it set `var(--ss-accent)`.

I compared the PNG from before the change with the PNG from after it, in each theme, with ImageMagick. In each theme, the changed pixels are in one box of 86 × 29 PNG pixels at x 681, y 172. On the stage, that box is x 340.5 to 383.5 and y 86 to 100.5, which is the "99%". No other pixel changed.

## Captured

All captures are from after the fix.

- The stage at 1:1 in light and in dark. Each PNG is 840 × 560.
- Viewport widths 390 and 358, in light and in dark.
- Reduced motion, in light and in dark.
- A close-up of the number at 6x, in light and in dark.
- The gold `static-card` at 1:1, to compare.

## Gate

The captures at 1:1, at 390, at 358 and with reduced motion ran with `--gate`, in light and in dark. Each of the eight runs ended with these two lines:

```
film: no-issues-detected; still capture only, motion was not judged
rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)
```

The two close-ups ran without `--gate`. Each one ended with the first line.

## Film

This round printed no finding line.

Earlier rounds printed these lines. Each one has a fix in the code. I cleared no line with `data-crop` or `data-snap`.

| Line | Fix |
|---|---|
| `clipped: span.ss-text "Social Security Number" clipped top by 1px by span.ss-row__title` | The rows set the kit token `--ss-row-line: 18px` for the 13px name. |
| `clipped: near aligned: ... "TEST_PATIENT_SSN=" start 10.0px apart in div.ss-card` | The matched line is a band that bleeds to the edges of the card. Its text is on the left text edge of the card. |
| `touching: span.ss-text "TEST_PATIENT_SSN=" is 0px from span.ss-bar` | A fixed 8px gap. A 6px gap printed the same line at widths 390 and 358. |
| `clipped: near aligned: ... span.ss-badge__label "Privacy Rule 164.514(b)(" start 9.0px apart` | The rule is a label and a value, not a pill. |
| `tight stack: span.ss-text "99%" sits 2.3px of ink above span.ss-text "confidence"` | A 2px gap between the number and its label. |

Other checks from the earlier round: `npx tsc --noEmit -p playground` exited 0, and `node scripts/class-clash.mjs examples/mb-hipaa-guardian` found no overlapping class namespaces. This round changed one color value and did not run them again.

## Review

A second agent reviewed the frames from before this round. It sent back one fault.

| Fault | Response |
|---|---|
| The "99%" is in the accent, which is green. The badge above it and the band below it are red. In the sibling stills, green means running, done or APPLY. So the confidence that a leak is real reads as a pass score. | Fixed, as the reviewer proposed. The number is in `--ss-text-strong`. It keeps 20px and weight 700, so it is still the one big number. The still no longer reads the accent token. |

The reviewer judged the 12 strings again and accepted them. The brief asks for 3 to 7.

The reviewer did not see the frames from after the fix. These points are still open to question:

- The filler row shows one line of bars, 9px above the crop. If the row moves up, its second line shows as a sliver.
- The card crosses each side of the window by one gutter (24px), not by half of its width.
- The frame has no green outside the lights of the window. Red is the only status color, because the frame shows only findings.

## Assumptions

- The report is drawn as a window. The real output is a Markdown file, `audit_report.md`.
- The confidence values 0.99 and 0.95 show as 99% and 95%. The portfolio entry gives the range as 0 to 100%.
- The findings are the ones in the sample output of the skill. The open finding is first, which is not the order of the sample.
- The window keeps the colored lights of the kit, and the raised card has a 12px radius. The reviewer measured 12px on the windows of five of the six stills and on the cards of three.
- The brief suggested a narrow detail card on the right. The text of the card needs about 270px. A card of that width that sits half outside the window leaves the window under two thirds of the stage.

## Facts

Each string comes from the installed copy of the skill: `examples/sample-finding.json`, `examples/sample-audit-report.md` and `scripts/generate-report.py`.

In this round, I also read the public repository at `github.com/1Mangesh1/hipaa-guardian`. Its two sample files under `skills/hipaa-guardian/examples/` are identical to the installed copies, byte for byte. Its `scripts/generate-report.py` is not identical to the installed copy. It has the same default output name, `audit_report.md`, and the same `file:line` format.

## Unresolved

- Only one more real finding fits under the open card.

## Not checked

- The still inside the card and the grid of the site.
- The six stills in one grid after this fix. The reviewer made a montage before the fix.
- A second review of the frames from after the fix.
- A later change to `../mb-look.css`. The reviewer proposed new `--ss-success` values there. This still reads no success token and no accent token, so those values have no effect on it. Any other change to that file needs a new film.
- Browsers other than the headless Chromium that `film.mjs` starts.
- `scripts/layout.mjs`. The page has no controls outside the stage.
