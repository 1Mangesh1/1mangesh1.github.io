
This is a personal website for Mangesh Bide built with Astro, featuring a blog, portfolio, interactive games, and developer tools. The site uses Astro's Content Collections for structured content management and is deployed to GitHub Pages with a custom domain (mangeshbide.tech).

## Development Commands

### Essential Commands
```bash
# Start development server with hot reload
yarn dev

# Build for production (includes type checking)
yarn build

# Preview production build locally
yarn preview

# Run Astro type checking
yarn astro check

# Toggle maintenance mode
yarn maintenance:toggle
yarn maintenance:on
yarn maintenance:off
```

### Package Management
- **Use Yarn**, not npm. The GitHub Actions workflow uses Yarn for consistency.
- Dependencies are managed in `package.json`.

## Architecture Overview

### Content Collections System

The site uses Astro Content Collections (defined in [src/content/config.ts](src/content/config.ts)) for type-safe content management:

- **blog**: Blog posts with tags, descriptions, optional hero images, and draft status
- **portfolio**: Project showcases with tech stack, GitHub/demo links, and featured flag
- **resources**: Curated learning resources categorized by type (tools, learning, books, articles, videos)
- **talks**: Speaking engagements with event details, slides, and video links
- **now**: Current status updates with location, mood, and current activities (reading, watching, learning, building)
- **til**: Today I Learned - quick daily learnings categorized by topic (javascript, python, css, devops, git, linux, general)
- **snippets**: Reusable code patterns with language tagging
- **bookmarks**: Curated links categorized by type (article, tool, video, podcast, repo, tutorial, other)
- **books**: Reading list with status tracking (reading, completed, want-to-read, abandoned), ratings, and reviews
- **random**: Miscellaneous thoughts, ideas, experiments with type classification

All content lives in `src/content/[collection]/` as Markdown/MDX files with frontmatter validated by Zod schemas.

### Site Configuration

Central configuration is in [src/config/site.ts](src/config/site.ts):
- `maintenanceMode`: Controls site-wide maintenance mode (redirects all traffic to maintenance page)
- Site metadata: title, description, URL, author, email
- Social links: GitHub, Twitter, LinkedIn

### Maintenance Mode

The site has a middleware-based maintenance mode ([src/middleware.ts](src/middleware.ts)):
- When `siteConfig.maintenanceMode = true`, all requests redirect to `/maintenance` page
- The maintenance page itself is always accessible
- Toggle via npm scripts or manually edit `src/config/site.ts`

### Layout and Navigation

The main layout ([src/layouts/Layout.astro](src/layouts/Layout.astro)) provides:
- Responsive navigation with desktop and mobile views
- Dropdown menus for Fun (Games, Life & Hobbies, Memes) and About sections
- Dark/light theme toggle with localStorage persistence
- Reading progress bar at top of page
- Scroll-based navbar hide/show behavior
- Comprehensive SEO meta tags (Open Graph, Twitter Cards, LinkedIn optimization, JSON-LD structured data)
- GoatCounter analytics integration
- External CSS animations loaded from `public/animations.css`

Key navigation features:
- Desktop: Horizontal nav with hover dropdowns
- Mobile: Hamburger menu with collapsible sections
- Theme preference persists in localStorage
- Scroll animations with Intersection Observer
- Auto-hiding navbar when scrolling down

### Interactive Features

**Games** (scripts in [public/game-scripts/](public/game-scripts/)):
- Hangman: Programming-themed word guessing ([hangman.js](public/game-scripts/hangman.js))
- Pixel Sandbox: Pixel/ASCII art creator ([pixel-drawer.js](public/game-scripts/pixel-drawer.js))
- Whack-a-Bug: Bug whacking game ([wack-a-bug.js](public/game-scripts/wack-a-bug.js))
- Useless Machine: Interactive useless machine ([useless-machine.js](public/game-scripts/useless-machine.js))

**Developer Tools** ([src/pages/tools.astro](src/pages/tools.astro)):
- QR Code Generator, Color Palette Generator, Lorem Ipsum Generator
- Password Generator, Base64 Encoder/Decoder, JSON Formatter

**Easter Eggs** ([src/components/EasterEggs.astro](src/components/EasterEggs.astro)):
- Konami code, triple-click surprises, keyword triggers ("rainbow", "dev", "mangesh", etc.)
- Secret page accessible via footer link

### Routing Structure

Astro uses file-based routing in [src/pages/](src/pages/):
- `index.astro`: Homepage
- `blog/index.astro`: Blog listing
- `blog/[slug].astro`: Dynamic blog post pages
- `blog/tags/[tag].astro`: Tag-filtered blog posts
- `portfolio/index.astro`: Portfolio listing
- `portfolio/[slug].astro`: Dynamic portfolio project pages
- Static pages: `about.astro`, `contact.astro`, `resume.astro`, `now.astro`, `uses.astro`, `speaking.astro`, `fun.astro`, `games.astro`, `meme.astro`, `secret.astro`, `tools.astro`, `search.astro`, `credits.astro`
- Special: `maintenance.astro`, `404.astro`, `thank-you.astro`
- `rss.xml.ts`: RSS feed generation

### Styling and Animations

- **Tailwind CSS**: Primary styling framework with Typography plugin
- **Dark Mode**: Class-based dark mode (`dark:` prefix) with theme toggle
- **External Animations**: `public/animations.css` contains reusable animation classes
  - Scroll animations, hover effects, page transitions
  - Respects `prefers-reduced-motion` for accessibility
- **Custom Classes**: `.animate-on-scroll`, `.hover-lift`, `.link-glow`, `.custom-gradient-bg`, etc.

### Deployment

**GitHub Actions Workflow** ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)):
1. Triggers on push to `main` branch or manual workflow_dispatch
2. Uses Node.js 20 with Yarn (Corepack enabled)
3. Removes old dependencies and runs `yarn install`
4. Builds with `yarn build` (includes `astro check` for type safety)
5. Deploys to GitHub Pages using `peaceiris/actions-gh-pages@v3`
6. Sets CNAME to `mangeshbide.tech`

**Important**: Always use Yarn in CI/CD for consistency.

## Development Guidelines

### Adding New Content

**Blog Posts** ([src/content/blog/](src/content/blog/)):
```markdown
---
title: "Post Title"
description: "Brief description"
pubDate: 2024-01-01T00:00:00Z
updatedDate: 2024-01-02T00:00:00Z  # optional
tags: ["tag1", "tag2"]  # optional, creates tag pages
draft: false  # optional, excludes from production
heroImage: "/images/hero.jpg"  # optional
ogImage: "/images/og.jpg"  # optional, for social sharing
---

Content here with full Markdown/MDX support...
```

**Portfolio Projects** ([src/content/portfolio/](src/content/portfolio/)):
```markdown
---
title: "Project Name"
description: "Project description"
image: "/images/project.jpg"
tech: ["React", "TypeScript", "Node.js"]
github: "https://github.com/user/repo"  # optional
demo: "https://demo-url.com"  # optional
featured: true  # optional, highlights on portfolio page
date: 2024-01-01T00:00:00Z
---

Project details...
```

**Now Updates** ([src/content/now/](src/content/now/)):
```markdown
---
title: "Month Year"
date: 2024-01-01T00:00:00Z
location: "City, Country"  # optional
mood: "excited"  # optional
currentlyReading: ["Book 1", "Book 2"]  # optional
currentlyWatching: ["Show 1"]  # optional
currentlyLearning: ["Tech 1", "Skill 1"]  # optional
currentlyBuilding: ["Project 1"]  # optional
---

What I'm up to now...
```

**TIL (Today I Learned)** ([src/content/til/](src/content/til/)):
```markdown
---
title: "Git rebase --onto"
date: 2024-01-01T00:00:00Z
tags: ["git", "workflow"]  # optional
category: "git"  # javascript, python, css, devops, git, linux, general
draft: false  # optional
---

Quick explanation of what you learned...
```

**Books** ([src/content/books/](src/content/books/)):
```markdown
---
title: "The Pragmatic Programmer"
author: "David Thomas, Andrew Hunt"
cover: "/images/books/pragmatic-programmer.jpg"  # optional
rating: 5  # 1-5, optional
status: "completed"  # reading, completed, want-to-read, abandoned
startDate: 2024-01-01T00:00:00Z  # optional
finishDate: 2024-02-15T00:00:00Z  # optional
tags: ["programming", "career"]  # optional
favorite: true  # optional
---

Review or notes...
```

**Bookmarks** ([src/content/bookmarks/](src/content/bookmarks/)):
```markdown
---
title: "Useful Resource"
url: "https://example.com"
description: "Why this is worth bookmarking"
category: "article"  # article, tool, video, podcast, repo, tutorial, other
tags: ["web", "reference"]  # optional
date: 2024-01-01T00:00:00Z
featured: false  # optional
---
```

**Snippets** ([src/content/snippets/](src/content/snippets/)):
```markdown
---
title: "Debounce Function"
description: "Limit function execution rate"
language: "typescript"  # javascript, typescript, python, css, html, bash, sql, go, rust, other
tags: ["utility", "performance"]  # optional
date: 2024-01-01T00:00:00Z
---

\`\`\`typescript
// Your code snippet here
\`\`\`
```

### Adding New Games

1. Create game script in `public/game-scripts/your-game.js`
2. Add game card to [src/pages/games.astro](src/pages/games.astro)
3. Implement game with vanilla JavaScript (no external frameworks)
4. Test across devices and browsers

### Modifying Site Behavior

- **Maintenance Mode**: Edit `maintenanceMode` in [src/config/site.ts](src/config/site.ts) or use npm scripts
- **Navigation**: Modify nav structure in [src/layouts/Layout.astro](src/layouts/Layout.astro)
- **Theme Colors**: Edit [tailwind.config.mjs](tailwind.config.mjs)
- **SEO/Social**: Update meta tags in [src/layouts/Layout.astro](src/layouts/Layout.astro) and [src/config/site.ts](src/config/site.ts)
- **Analytics**: GoatCounter script is in Layout.astro (data-goatcounter attribute)

### Type Safety

- All content collections are validated with Zod schemas in [src/content/config.ts](src/content/config.ts)
- Run `yarn astro check` to verify TypeScript and content schema compliance
- Build process (`yarn build`) automatically runs type checking

### Content Schema Validation

When adding new fields to content collections:
1. Update the Zod schema in [src/content/config.ts](src/content/config.ts)
2. Add TypeScript types if needed
3. Update existing content files to match new schema
4. Run `yarn astro check` to verify

### Performance Considerations

- External CSS animations are preloaded with `onload` in Layout.astro
- Intersection Observer used for scroll animations (unobserves after animation)
- Theme toggle uses localStorage to avoid flash of unstyled content
- Images should be optimized before adding to `public/`
- Astro automatically optimizes component rendering

### Social Sharing

The site includes comprehensive social sharing meta tags:
- Open Graph images (1200x630 recommended)
- LinkedIn-specific meta tags
- Twitter Cards
- JSON-LD structured data for search engines

Default OG image: `public/og-image.png` (update this for site-wide changes)
Per-page OG images: Use `ogImage` frontmatter field in content

## Key Files Reference

- [astro.config.mjs](astro.config.mjs): Astro configuration with MDX, Tailwind, Sitemap
- [tailwind.config.mjs](tailwind.config.mjs): Tailwind CSS configuration
- [tsconfig.json](tsconfig.json): TypeScript configuration
- [package.json](package.json): Dependencies and scripts
- [src/config/site.ts](src/config/site.ts): Site-wide configuration
- [src/content/config.ts](src/content/config.ts): Content collections schemas
- [src/layouts/Layout.astro](src/layouts/Layout.astro): Main layout template
- [src/middleware.ts](src/middleware.ts): Maintenance mode middleware
- [public/animations.css](public/animations.css): External CSS animations

## Common Patterns

### Accessing Content Collections
```typescript
import { getCollection } from 'astro:content';

// Get all blog posts
const allPosts = await getCollection('blog');

// Filter by draft status
const publishedPosts = await getCollection('blog', ({ data }) => {
  return data.draft !== true;
});

// Sort by date
const sortedPosts = allPosts.sort((a, b) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
```

### Using Site Config
```typescript
import { siteConfig } from '../config/site';

// Access site metadata
const title = siteConfig.title;
const email = siteConfig.email;

// Check maintenance mode
if (siteConfig.maintenanceMode) {
  // Redirect handled by middleware
}
```

### Tag-Based Navigation
Tags in blog posts automatically create tag pages via [src/pages/blog/tags/[tag].astro](src/pages/blog/tags/[tag].astro). No manual tag management needed.