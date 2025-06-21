# Mangesh's Personal Website

A modern, comprehensive personal website built with Astro, featuring blog, portfolio, interactive games, and much more with dark/light mode toggle and markdown-powered content.

🌐 **Live Site**: [mangeshbide.tech](https://mangeshbide.tech) | [1mangesh1.github.io](https://1mangesh1.github.io)

## ✨ Features

### 🎮 Interactive Games & Entertainment

- **🎨 Pixel Sandbox**: Create pixel art or ASCII art with customizable grids (16x16 to 48x48)
- **🎯 Hangman Game**: Programming-themed word guessing game with visual hangman drawing
- **😄 Memes Page**: Dynamic meme loader from various subreddits with interactive controls
- **🤫 Secret Page**: Hidden page with easter eggs, interactive elements, and fun discoveries
- **🎊 Fun & Life**: Personal hobbies, gaming preferences, and life philosophy

### 📝 Content & Professional Pages

- **⚡ Fast & Lightweight**: Built with Astro for optimal performance
- **🌙 Dark/Light Mode**: Automatic theme toggle with user preference persistence
- **📝 Blog & Portfolio**: Markdown-powered content with full MDX support
- **👤 Professional Pages**: About, Contact, Resume, Uses, Speaking, and Now pages
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🔍 SEO Optimized**: Built-in meta tags and structured data
- **📧 Contact Form**: Functional contact form with validation
- **🔎 Search Functionality**: Full-text search across all content

### 🛠️ Advanced Features

- **⏰ Now Page**: Current status updates with structured data (reading, watching, learning, building)
- **🚀 Auto Deploy**: GitHub Actions workflow with Yarn for seamless deployment
- **📊 Dynamic Content**: RSS feeds, tag-based navigation, and content collections
- **🎨 Interactive Elements**: Color magic, text scramblers, and visual effects
- **🛠️ Maintenance Mode**: Toggle-able maintenance page with custom messaging

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
- **Content**: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- **Interactive Features**: Vanilla JavaScript with Canvas API, Web Audio API, File API
- **Deployment**: GitHub Pages via GitHub Actions
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/1mangesh1/1mangesh1.github.io.git

# Navigate to the project directory
cd 1mangesh1.github.io

# Install dependencies (using Yarn for better CI/CD compatibility)
yarn install

# Start development server
yarn dev
```

### Development

```bash
# Start dev server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Type checking
yarn astro check
```

## 📁 Project Structure

```
src/
├── components/          # Reusable Astro components
│   ├── BackToTop.astro    # Scroll-to-top functionality
│   ├── EasterEggs.astro   # Hidden interactive elements
│   ├── MaintenanceMode.astro # Maintenance page toggle
│   ├── SocialShare.astro    # Social sharing buttons
│   └── TableOfContents.astro # Auto-generated TOC
├── config/              # Site configuration
│   └── site.ts          # Main site settings and metadata
├── content/             # Markdown content
│   ├── blog/            # Blog posts
│   ├── portfolio/       # Portfolio projects
│   ├── fun/             # Fun projects and experiments
│   ├── now/             # Current status updates
│   ├── resources/       # Learning resources and tools
│   ├── talks/           # Speaking engagements
│   └── config.ts        # Content collections config
├── layouts/             # Page layouts
│   └── Layout.astro     # Main layout with navigation
├── pages/               # Route pages
│   ├── blog/            # Blog listing and individual posts
│   ├── portfolio/       # Portfolio listing and projects
│   ├── resources/       # Resources page
│   ├── about.astro      # About page
│   ├── contact.astro    # Contact form
│   ├── credits.astro    # Credits and acknowledgments
│   ├── fun.astro        # Personal hobbies and interests
│   ├── games.astro      # Interactive games hub
│   ├── index.astro      # Homepage
│   ├── maintenance.astro # Maintenance mode page
│   ├── meme.astro       # Dynamic meme loader
│   ├── now.astro        # Current status updates
│   ├── resume.astro     # Professional resume
│   ├── rss.xml.ts       # RSS feed generation
│   ├── search.astro     # Search functionality
│   ├── secret.astro     # Hidden easter egg page
│   ├── speaking.astro   # Speaking engagements
│   └── uses.astro       # Tools and development setup
├── utils/               # Utility functions
│   ├── reading-time.ts  # Calculate reading time
│   └── related-posts.ts # Find related content
public/
├── game-scripts/        # Interactive game logic
│   ├── hangman.js       # Hangman game implementation
│   └── pixel-drawer.js  # Pixel art creation tool
├── favicon.svg          # Site favicon
├── me.jpg              # Profile photo
├── Resume.pdf          # Downloadable resume
├── robots.txt          # SEO configuration
└── CNAME               # Custom domain config
scripts/
└── toggle-maintenance.js # Maintenance mode toggle script
```

## 🎮 Interactive Features

### Games

- **Pixel Sandbox**: Create pixel art or ASCII art with multiple grid sizes, color picker, save/load functionality, and export options (PNG, JSON, code snippets)
- **Hangman**: Programming-themed word guessing game with visual hangman drawing, sound effects, score tracking, and hint system

### Easter Eggs & Fun

- **Secret Page**: Hidden page accessible via special navigation, featuring interactive elements, secret messages, and achievements
- **Memes**: Dynamic meme loader supporting multiple subreddits (ProgrammerHumor, wholesomememes, etc.) with statistics and fun facts
- **Interactive Elements**: Color magic, text scramblers, binary decoders, and animated effects

## ✍️ Adding Content

### Blog Posts

Create a new `.md` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
date: 2024-01-01T00:00:00Z
description: "Brief description of your post"
tags: ["tag1", "tag2"]
---

Your content here...
```

### Portfolio Projects

Create a new `.md` file in `src/content/portfolio/`:

```markdown
---
title: "Project Name"
description: "Project description"
date: "2024"
technologies: ["React", "TypeScript"]
github: "https://github.com/username/repo"
demo: "https://demo-url.com"
---

Project details here...
```

### Now Updates

Create a new `.md` file in `src/content/now/`:

```markdown
---
title: "December 2024"
date: 2024-12-01T00:00:00Z
location: "Your Location"
mood: "excited"
currentlyReading: ["Book 1", "Book 2"]
currentlyWatching: ["Show 1", "Movie 1"]
currentlyLearning: ["Technology 1", "Skill 1"]
currentlyBuilding: ["Project 1", "Project 2"]
---

What you're up to right now...
```

### Other Content Types

- **Fun Projects**: Add to `src/content/fun/`
- **Learning Resources**: Add to `src/content/resources/`
- **Speaking**: Add to `src/content/talks/`

Each content type has its own schema defined in `src/content/config.ts`.

## 🚀 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions with Yarn for reliable dependency management. The workflow:

1. Installs dependencies with Yarn
2. Builds the Astro site with `yarn build`
3. Deploys to `gh-pages` branch using `peaceiris/actions-gh-pages`
4. Serves at `1mangesh1.github.io`
5. Custom domain `mangeshbide.tech` points to GitHub Pages

### Manual Deployment

```bash
# Build the site
yarn build

# Deploy manually (if needed)
yarn build && npx gh-pages -d dist
```

### Maintenance Mode

Toggle maintenance mode using the built-in script:

```bash
# Enable maintenance mode
node scripts/toggle-maintenance.js

# Or manually edit src/config/site.ts
# Set maintenanceMode: true
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.mjs` to customize the color scheme:

```js
theme: {
  extend: {
    colors: {
      // Add your custom colors
    }
  }
}
```

### Adding New Games

1. Create game logic in `public/game-scripts/your-game.js`
2. Add game card to `src/pages/games.astro`
3. Implement game container and controls
4. Test thoroughly across devices

### Site Configuration

- **Site metadata**: Update in `src/config/site.ts`
- **Navigation**: Modify the nav items in the Layout component
- **Content collections**: Configure in `src/content/config.ts`
- **Custom domain**: Update `public/CNAME` file

## 🎯 Site Features Overview

### Professional

- **About**: Personal and professional background
- **Resume**: Comprehensive CV with downloadable PDF
- **Portfolio**: Showcase of projects and work
- **Speaking**: Talks and presentations
- **Uses**: Development tools and setup
- **Contact**: Professional contact form

### Personal & Fun

- **Now**: Current activities and status updates
- **Fun**: Personal hobbies, gaming, and interests
- **Games**: Interactive games and creative tools
- **Memes**: Programming humor and entertainment
- **Secret**: Hidden easter eggs and surprises

### Content & Resources

- **Blog**: Technical articles and thoughts
- **Resources**: Learning materials and tools
- **Search**: Full-text search functionality
- **RSS**: Syndicated content feeds

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/1mangesh1/1mangesh1.github.io/issues).

## 📧 Contact

- **Email**: [mangeshsbide@gmail.com](mailto:mangeshsbide@gmail.com)
- **Twitter**: [@Mangesh_Bide](https://x.com/Mangesh_Bide)
- **GitHub**: [@1mangesh1](https://github.com/1mangesh1)
- **LinkedIn**: [mangesh-bide](https://linkedin.com/in/mangesh-bide/)

---

Made with 💙 by [Mangesh](https://github.com/1mangesh1) • Featuring interactive games, dynamic content, and lots of easter eggs! 🎮✨
