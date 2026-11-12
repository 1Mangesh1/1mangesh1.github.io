# Rehearsal: mb-voice-agent

A still for the project card of Mira, a browser voice agent. It has no script, no cursor and no compact design. This file covers the first build and the fix round after the fresh-eye review.

Gold: `static-card`. I kept its framing. The gutter is 24px. A browser window sits at the top left and runs off the right edge and the bottom edge. One satellite card at the lower left straddles the left edge of the window. I changed the stage to 420 x 280 with the shared look (`look-mb`, cool grays). I replaced the dashboard with the call view of Mira: the header, the tool ticker and the video tile. I replaced the detail card with the result of one tool call. I built the satellite from the kit `Card` (flush, small, lifted), and the gold builds its satellite by hand. I removed the compact design, because the site scales the PNG.

Beats: none.

Captured: the design size (420 x 280, PNG 840 x 560) in the light theme and in the dark theme. The stage at widths 358 and 390 in both themes. Copies of both PNGs at 420 and at 358 wide, to judge them at card size. Close-ups at 5x to 6x of the browser chrome, the top edge of the tile and the tool card. Close-ups at 8x of the corners of the window and the card. The two final PNGs are:

- `<work folder>/stills/voice-agent-light.png`
- `<work folder>/stills/voice-agent-dark.png`

The frames of the fix round are in `<work folder>/stills/voice-agent-work/fix`. The frame names below are files in that folder.

Gate: `rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)`. I ran `film.mjs --still --gate` six times: the design width, 358 and 390, each in the light theme and with `--dark`. Each run prints `film: no-issues-detected; still capture only, motion was not judged`.

Film: no lines in the light theme and no lines in the dark theme, at each of the three widths.

Review, round 2: a fresh-eye reviewer sent back four faults. My response to each fault follows.

1. Dark theme, the video tile had the color of the stage ground and read as a notch in the window. Fixed. In the dark theme, `--tile` is now `color-mix(in srgb, var(--ss-well) 35%, black)`. Only the lit center of the tile comes up to the tone of the ground. In the final dark PNG the ground is `#111827` and the window is `#1f2937`. The tile is `#04070c` at its corner, `#090d16` at the middle of its top edge and `#0e1421` beside the avatar. The contrast of the tile against the window went from about 1.2:1 to 1.37:1. I removed the 1px hairline from the tile, because the fill now separates the tile (`vC-z-edge-dark.png`). I judged the result at 420 wide and at 358 wide. `pair-old-new-1x.png` shows the old frame beside the new frame. `gate-dark-358.png` shows the phone width. The tile in the light theme did not change.
2. The address text kept the faint ink of the kit. Fixed. `.va-window .ss-window__url` now has `color: var(--ss-text)`, as `fieldnotes.css` has. In the final PNGs the text is `#6b7280` on `#f5f5f5` in the light theme (4.4:1). It is `#9ca3af` on `#2a3341` in the dark theme (5.0:1).
3. The check disc on the tool card is the kit green, and the other green marks use the emerald accent. Not changed in this folder. The reviewer asked for one decision for the set in `examples/mb-look.css`, and I must not edit that file. When I finished, `mb-look.css` had no `--ss-success` value. The check reads `--ss-success`, so it changes with the set and needs no edit here. I filmed a temporary test with `--ss-success` set to the accent, and then I removed the test (`sim-emerald-light.png`, `sim-emerald-dark.png`). The light theme reads well: a white tick on `#047857` is about 5.5:1. In the dark theme a white tick on `#34d399` is about 1.9:1. The kit green gives 2.3:1 today. The person who sets the dark value can use a deeper emerald for the disc, or a dark tick.
4. The window and the tool card had a 10px radius, and the other stills use 12px. Fixed. I removed `border-radius: 10px` from `.va-window`, so the window takes the kit value `--ss-radius-window` (12px). `.va-tool` now sets `--ss-card-radius: var(--ss-radius-window)`, as `hipaa-guardian.css` does. I measured both corners in 8x close-ups (`z-wincorner-light.png`, `z-cardcorner-light.png`). Each arc agrees with a 12px radius and not with a 10px radius.

I compared the old PNGs with the new PNGs, pixel by pixel. Only these areas changed: the address text, the corners of the window and the card, and the dark tile.

Review, round 1: the builder did this review from the frames, so it was not a fresh eye. The reviewer of round 2 looked at items 1 to 3 again and accepted them.

1. The tool card covers the lower left of the video tile. This stands. The covered area is empty video. The ticker, the avatar and every word stay whole.
2. The video tile is near-black in a light window. This stands. The tile stands for the video of the product, and the product paints that tile in its ink color. The fill is a separate layer with no text.
3. Success shows in three places: the ticker, the check on the card and the `ok true` row. This stands. They are three layers of the real system. The ticker is the label that the caller sees. The check is the status of the tool call. The row is the payload that the tool returns.
4. The check used the kit success green beside an emerald accent. Round 2 overruled this. See fault 3 above.
5. The light round the avatar is neutral, not the accent color. This stands. The hairline of round 1 is gone. See fault 1 above.

Assumptions:

- The address bar shows the domain only, as Safari does. The call view is at the path `/call`.
- The avatar with a ring stands for the talking-head video. The product does not draw an avatar or a ring.
- The site shows the PNG at 420px wide, or at 358px wide on a phone.
- The dark tile mixes the ground token with the keyword `black`. The kit derives `--ss-accent-text` in the same way. No token in the dark theme is darker than the ground.

Real strings and their sources. In the fix round I read each source again, and each string agrees with its source.

| String | Source |
| --- | --- |
| `voice-agent-demo-frontend.vercel.app` | `demo` in `src/content/portfolio/voice-agent.md` |
| `Mira`, `live` | `title` in the same entry. The `Header` in `components/CallShell.tsx` of the frontend repo. The screenshot `public/images/blogs/voice-agent/live avatar with tool call.webp` |
| `Booking done` (drawn in capitals) | `toolLabel` in `lib/labels.ts` of the frontend repo returns `Booking` for `book_appointment`. `components/CallShell.tsx` draws the ticker in capitals from the template `✓ ${toolLabel(tool.name)} done`. The blog post `src/content/blog/building-mira-voice-agent.md` links that repo |
| `book_appointment` | The table "The seven tools, with their guards" in the same blog post |
| `ok`, `true`, `slot` | `book_appointment` in `tools.py` of the backend repo returns `ok`, `id`, `phone` and `slot`. The entry links that repo. The card leaves out `id` and `phone` |
| `2026-05-02T14:00` | The `conversation.tool_call` example in the same blog post |

Unresolved:

- Fault 3. After the set decision is in `examples/mb-look.css`, film this still again in both themes. No edit is necessary in this folder.
- The reviewer named this still the weakest of the six, because the largest area of the window is a tile with a monogram. A fix round does not change the composition. A stronger still needs a new composition that brings the live transcript of the product into the frame.

Not checked:

- A second fresh-eye review of the fix round.
- The still inside the real project card on the site: the clip of the card, the text under it and the hover state.
- The webp files of the site. This task cannot write to the site repo, so I did not convert the final PNGs.
- A real phone. I judged a stage at 358 wide and a 358px copy of each PNG.
- The ring of the avatar ends 3px above the bottom edge of the tool card. I filmed a 66px avatar that ends on that edge (`pair-av60-av66-1x.png`). At card size the two frames look the same, so the avatar stays at 60px.
- Reduced motion and playback. The still has no motion.
