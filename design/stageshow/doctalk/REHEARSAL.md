# Rehearsal: mb-doctalk

A still for the DocTalk project card. It has no script, no cursor and no beats.

## Gold

`ai-chat` is the gold that I copied. I kept its order: the question, then the answer, then the sources. I kept its quiet gray question bubble. I kept its window: the top edge has a gutter, and the bottom runs off the stage.

`static-card` gave the card format. It has a 24px gutter and one satellite that straddles the window edge. It has a selected row in the soft accent, and bars on the rows that the crop takes.

## What I changed

- The stage is 420 x 280 with the shared look (`../mb-look.css`, `greys="cool"`, no `theme` prop).
- The composer, the earlier turn, the script and the compact design are gone.
- The window title is the file name, `architecture.pdf`, on the left. The status of the document, `Ready`, is plain text on the right.
- The question is `How are answers grounded?`. The product answers a question about itself.
- The answer is two sentences, one on each line: `A search finds the top-5 chunks.` and `Only those go to the LLM.` Both facts come from the portfolio entry.
- Each sentence ends on a citation mark. The mark is the kit `Badge` in the accent tone at 16px.
- The sources are kit `Row`s: the mark, the page, and the chunk index in mono. The first row has the selection. Two filler rows follow, and the stage cuts the last one.
- The satellite is the cited page, 104 x 138. It is a kit `Card` that holds only bars. It sits half over the right edge of the window, above the empty margin of the window.
- The marked passage on the page is level with the first source row and has the same tint. The two read as one band.
- Mark 1 is solid in the answer and in its row, because source 1 is the source that is open on the page.
- In dark, the page stays a light sheet with its own ink. `craft.md` says that a light document over a dark workspace stays a readable light document.

## Fix round

A fresh-eye reviewer sent the first still back with two faults. This round changed the words in `index.tsx` and no CSS.

- The title changed from `report.pdf` to `architecture.pdf`.
- The question changed from `What are the key findings?` to `How are answers grounded?`.
- The answer changed from two sentences that stated no finding to the two sentences above.

## Captured

The `stills` folder is `<work folder>/stills`.

- Light and dark at 420 x 280, as 840 x 560 PNG files: `stills/doctalk-light.png` and `stills/doctalk-dark.png`.
- The first still, before this round: `stills/doctalk-fix/before-light.png` and `stills/doctalk-fix/before-dark.png`.
- The two gold stills: `stills/doctalk-fix/gold-ai-chat.png` and `stills/doctalk-fix/gold-static-card.png`.
- Close-ups at 4x in `stills/doctalk-fix/`, in light and in dark. `z-answer` shows the title bar, the question and the answer. `z-rows` shows the answer and the rows. `z-page` shows the page. `z-corner` shows mark 1 beside the corner of the page.
- Both PNG files resampled to 420px and to 358px wide: `stills/doctalk-fix/one-x.png` and `stills/doctalk-fix/phone-358.png`.
- `film.mjs --still --gate` in both themes at the default width, at `--width 390` and at `--width 358`: `stills/doctalk-fix/gate*.png`.

## Gate

`rehearsal passed (necessary, not sufficient: references/verify.md and the fresh eye in review.md still stand)`

The gate printed this line six times: for light and for dark, at the default width, at `--width 390` and at `--width 358`. The last film line of each run is `film: no-issues-detected; still capture only, motion was not judged`. The typecheck (`tsc --noEmit -p playground`) exits 0. `class-clash.mjs` reports no overlap.

## Film

This round printed no film line on either theme at any width.

The first build printed two lines. I fixed both:

- `uneven: span.ss-bar runs into the bottom padding of div.dt-page`, first frame. The page had one line too many. I laid the page out again on a 10px pitch.
- `layout: div.dt-page leaves 7px below its last child inside div.dt-page, short of its 12px bottom padding`, first frame. The cause and the fix are the same.

## Review

A fresh-eye reviewer judged the first still and returned two faults. I measured the fixed frames in the PNG files, in stage px.

1. The answer stated no finding. It only said where the findings are.
   Response: fixed. The reviewer gave two options, and I took the second: the product answers a question about itself. The entry says that DocTalk "runs a similarity search for the top-5 chunks" and "feeds only those chunks to the LLM". The answer states those two facts, so the still invents no finding.
2. The two citation marks sat one above the other, 3px apart (x 245.0 and x 248.0).
   Response: fixed. Mark 1 is now at x 230.0 to 246.0, and mark 2 is at x 191.0 to 207.0, in both themes. The left edges are 39px apart.

No fresh eye saw the frames of this round. This agent cannot start a reviewer. I did the review myself against `review.md` and `verify.md`.

Judged and left as it is:

- The answer lines are 184.5px and 145.5px wide in a column of 233.5px. A line wider than 203px puts its mark within 8px of the right edge of the chunk labels.
- The top of the page is 2px above the top of mark 1, and the two are 46px apart (`stills/doctalk-fix/z-corner.png`). The page keeps its place, because its marked passage is level with the first source row.
- The ground above the page is empty (76 x 118). The right column exists for the page, and the question bubble stops the page from starting higher. `static-card` has the same block at its top left.
- The window shows its full width, and only its bottom bleeds. `ai-chat` frames its window the same way. The question bubble is on the right, so a bleed on the right cuts real words.
- `chunk 4` is mono beside `Page 3` in the sans face. The chunk index is an identifier.
- In dark, the white sheet is the brightest object in the frame. The sheet is the cited passage, which is the point of the still. The reviewer accepted it.

## Assumptions

- `architecture.pdf` is a generic sample file name. The repo has no sample file.
- `How are answers grounded?` is a sample question. The entry describes "answers grounded in the source with citations".
- The page numbers and the chunk numbers are sample values.
- `Ready` shows the document status value `ready` from `api/app/routers/questions.py`.
- The marks `1` and `2` follow the system prompt in `api/app/services/llm.py`: "Include citation numbers [1], [2], etc."
- `Page` and `chunk` name the fields `page_number` and `chunk_index` of a source in `api/app/schemas/question.py`.
- The still draws a client view of the API response. The repo ships an API and no client.

## Unresolved

- In the public repo, the handlers for `POST /documents/upload` and `POST /documents/{id}/ask` raise 501 with a TODO comment. I read both files on `main` in this round. The still shows the flow that the README and the portfolio entry describe. The public routers do not serve that flow.

## Not checked

- The still inside the project card on the site: the card clip, the grid, and the five sibling stills beside it.
- A real phone. I resampled the PNG files to 358px, and I ran the gate at `--width 358`.
- A fresh-eye review of this round.
- The blueprint and glass themes, the mono palette, and the minimal and realistic fidelity.
- The viewer page of the playground (playback controls). I filmed only the direct `?capture=` route.
