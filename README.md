# Mangesh's Personal Website

My personal website built with Astro. It has a blog, portfolio, some games I made, and a bunch of tools. Dark mode works if you prefer it.

**Live Site**: [mangeshbide.tech](https://mangeshbide.tech) | [1mangesh1.github.io](https://1mangesh1.github.io)

## What's Here

### Games & Fun Stuff

I built a pixel art tool, a programming-themed Hangman game, and a meme loader that hits random subreddits. There's a secret page too if you dig around. I also keep lists of games and hobbies I like—probably says more about me than any bio could.

### Content

The blog has technical articles. The portfolio shows projects. I keep a "now" page with what I'm reading and building. There's a resume, contact form, pages for talks and tools I use. Full-text search works across everything, tags filter blog posts, and RSS feeds are set up.

### Developer Tools

QR code generator. Color palette tool. Lorem Ipsum. Password generator. Base64 encoder/decoder. JSON formatter. Useful when you need them.

### Everything Else

Social sharing tags are set up (Open Graph, Twitter, LinkedIn). Responsive design, works on mobile. Toggle-able maintenance mode if needed.

## Tech Stack

- Astro for static generation
- Tailwind CSS for styling
- Content Collections for markdown
- Vanilla JavaScript for games and tools
- GitHub Pages + GitHub Actions for deployment
- TypeScript for type checking

## Getting Started

Requires Node.js 18+. Uses Yarn (npm works too, but CI/CD uses Yarn).

```bash
git clone https://github.com/1mangesh1/1mangesh1.github.io.git
cd 1mangesh1.github.io
yarn install
yarn dev
```

### Commands

```bash
yarn dev          # Dev server
yarn build        # Build for production
yarn preview      # Preview the build
yarn astro check  # Type checking
```

## Project Structure

```
src/
├── components/        # Reusable components
├── config/           # Site settings
├── content/          # Markdown files for blog, portfolio, etc.
├── layouts/          # Main Layout.astro
├── pages/            # Routes
public/
├── animations.css    # Animation classes
├── game-scripts/     # Game code
└── scripts/          # Utilities
```

## Adding Content

Markdown files in `src/content/` show up automatically.

**Blog** (blog):
```markdown
---
title: "Your Title"
date: 2024-01-01T00:00:00Z
description: "Short description"
tags: ["tag1"]
---

Your post here.
```

**Portfolio** (portfolio):
```markdown
---
title: "Project Name"
description: "What it does"
date: "2024"
technologies: ["React"]
github: "https://github.com/..."
demo: "https://..."
---

Details.
```

**Now** (now):
```markdown
---
title: "Month"
date: 2024-12-01T00:00:00Z
currentlyReading: ["Book"]
currentlyBuilding: ["Project"]
---

What I'm up to.
```

Same pattern for fun, resources, and talks. Check `src/content/config.ts` for all schemas.

## Deployment

Push to `main` and GitHub Actions builds and deploys to GitHub Pages.

Manual deployment:
```bash
yarn build
yarn build && npx gh-pages -d dist
```

Toggle maintenance mode:
```bash
node scripts/toggle-maintenance.js
# Or edit src/config/site.ts
```

## Customization

Colors go in `tailwind.config.mjs`. Animations are in `animations.css`. To add a game, create the script, add it to `games.astro`, and test it.

## Pages

Professional: About, Resume, Portfolio, Speaking, Uses, Tools, Contact

Personal: Now, Fun, Games, Memes, Secret (with easter eggs)

Content: Blog, Resources, Search, RSS

## License

MIT for code. Personal content (photos, name, profile data) is mine—please don't reuse it.

## Contributing

Issues and PRs welcome at the [repo](https://github.com/1mangesh1/1mangesh1.github.io).

## Contact

- Email: hello@mangeshbide.tech
- Twitter: [@Mangesh_Bide](https://x.com/Mangesh_Bide)
- GitHub: [@1mangesh1](https://github.com/1mangesh1)
- LinkedIn: [mangesh-bide](https://linkedin.com/in/mangesh-bide/)

---

Built by me. Code's open source, personal stuff isn't.
