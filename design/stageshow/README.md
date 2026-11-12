# Project stills

The six images on the project cards are illustrations, not screenshots. Each one is a small, simplified view of the project's real interface or output. This folder holds their sources, so that you can change one and film it again.

The stills were built with the Stageshow skill: https://github.com/benjitaylor/skills, folder `stageshow`, MIT license, copyright 2026 Benji Taylor. Each scene started as a copy of the skill's `static-card` or `ai-chat` example. The version used was the one installed on 2026-11-11 (folder hash `92857a8f6dbc0c3f5157c11a7afc4e55d488b8d6` in `~/.agents/.skill-lock.json`).

This folder is not part of the Astro build. `tsconfig.json` excludes it, because the scenes import the Stageshow kit, which is not in this repository.

## Files

| Path | Content |
|---|---|
| `mb-look.css` | The site's look for every still: the fonts, the cool grays, the emerald accent and success colors, and the stage ground, for light and dark. |
| `<project-id>/index.tsx` and its CSS file | The scene for one still. |
| `<project-id>/REHEARSAL.md` | The builder's notes: the example it started from, the checks it ran, and what it did not check. |
| `public/images/portfolio/<project-id>.webp` | The light still, 840x560. |
| `public/images/portfolio/<project-id>-dark.webp` | The dark still, 840x560. |

A portfolio entry points at its stills with `image` and `imageDark` in its frontmatter.

## Rules for a still

- The stage is 420x280. The site shows the still at 420px wide, and at 358px wide on a phone. So no text in the design is smaller than 11.5px.
- Every real word comes from the portfolio entry, from a blog post about the project, or from the project's public repository or demo. `REHEARSAL.md` and the list below name the sources. Do not add a number, a name or a claim that has no source.
- A value that looks like personal or health data is always a bar, never text.
- All colors are kit tokens from `mb-look.css`. A scene has no color values of its own, so both themes work.
- One green: success and accent are the same emerald family.

## Where the words come from

| Still | Sources |
|---|---|
| `voice-agent` | The portfolio entry, the build log `building-mira-voice-agent`, the real screenshots in `public/images/blogs/voice-agent/`, and the two demo repositories. |
| `fieldnotes` | The portfolio entry and the `job-researcher` repository (the tool names and the `APPLY` verdict). |
| `hipaa-guardian` | The sample report and the sample findings that ship with the skill. |
| `claude-skills` | The portfolio entry, the listing at skills.sh, and the `dev-skills-collection` repository (94 skills on 2026-11-12). |
| `doctalk` | The portfolio entry and the `doctalk` repository (the status value, the citation marks, the `page_number` and `chunk_index` fields). The file name and the page and chunk numbers are sample values. |
| `oci-homelab-iac` | The portfolio entry and the repository README. The panel follows the README's staged rollout: one node runs, three are later steps. |

## Film the stills again

You need Node 20.19 or later, `cwebp`, and a Chrome or Chromium binary.

1. Copy the Stageshow skill folder to a work folder, and run `npm install` there.
2. Copy `mb-look.css` to `examples/` in the work folder. Copy each scene folder to `examples/mb-<project-id>/`.
3. Copy `atkinson-hyperlegible-next-latin-wght-normal.woff2` and `atkinson-hyperlegible-mono-latin-wght-normal.woff2` from `public/fonts/` to `playground/public/fonts/` in the work folder.
4. Start the preview:

   ```sh
   node node_modules/vite/bin/vite.js playground --config playground/vite.config.ts --port 5180 --strictPort
   ```

5. Film one still in both themes. If Google Chrome is not installed, set `CHROME_PATH` to a Chrome or Chromium binary first.

   ```sh
   node scripts/film.mjs "http://127.0.0.1:5180/?capture=mb-<project-id>" --select '.ss-stage' --pad 0 --still --gate --out <project-id>-light.png
   node scripts/film.mjs "http://127.0.0.1:5180/?capture=mb-<project-id>" --select '.ss-stage' --pad 0 --still --gate --dark --out <project-id>-dark.png
   ```

   Each run must print `film: no-issues-detected` and `rehearsal passed`. Each PNG must be 840x560.

6. Convert both PNG files and put them in `public/images/portfolio/`:

   ```sh
   cwebp -q 86 -m 6 -sharp_yuv <project-id>-light.png -o <project-id>.webp
   cwebp -q 86 -m 6 -sharp_yuv <project-id>-dark.png -o <project-id>-dark.webp
   ```
