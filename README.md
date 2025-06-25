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

- **⚡ Fast & Lightweight**: Built with Astro for optimal performance and lightning-fast loading
- **🌙 Dark/Light Mode**: Seamless theme toggle with user preference persistence and smooth transitions
- **📝 Blog & Portfolio**: Markdown-powered content with full MDX support and clickable tag navigation
- **👤 Professional Pages**: About, Contact, Resume, Uses, Speaking, and Now pages with clean design
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS and optimized touch interactions
- **🔍 SEO Optimized**: Enhanced Open Graph meta tags, Twitter Cards, and LinkedIn-optimized social sharing
- **📧 Contact Form**: Functional contact form with validation and spam protection
- **🔎 Search Functionality**: Full-text search across all content with instant results
- **🎨 Clean Navigation**: Professional navigation design without distracting animations

### 🛠️ Advanced Features

- **⏰ Now Page**: Current status updates with structured data (reading, watching, learning, building)
- **🚀 Auto Deploy**: GitHub Actions workflow with Yarn for seamless and reliable deployment
- **📊 Dynamic Content**: RSS feeds, tag-based navigation, and content collections with smart relationships
- **🎨 Optimized Animations**: Smooth scroll animations, hover effects, and page transitions without excessive motion
- **🛠️ Maintenance Mode**: Toggle-able maintenance page with custom messaging and status updates
- **🔧 Developer Tools**: Comprehensive collection of utilities (QR codes, colors, password generator, Base64, JSON formatter)
- **📷 Enhanced Social Sharing**: Optimized Open Graph images, LinkedIn meta tags, and structured data for better link previews
- **⚡ Performance Optimized**: External CSS organization, minimized JavaScript, and efficient asset loading

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build) - Static site generation with component islands
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
- **Content**: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/) with TypeScript validation
- **Interactive Features**: Vanilla JavaScript with Canvas API, Web Audio API, File API
- **Deployment**: GitHub Pages via GitHub Actions with Yarn package management
- **CDN & Performance**: Cloudflare (Free Plan) for global CDN, caching, and performance optimization
- **Language**: TypeScript with strict type checking
- **Performance**: Optimized external CSS, efficient animations, and lazy loading

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn (Yarn recommended for CI/CD consistency)

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
# Start dev server with hot reload
yarn dev

# Build for production with optimization
yarn build

# Preview production build locally
yarn preview

# Type checking and linting
yarn astro check
```

## 📁 Project Structure

```
src/
├── components/          # Reusable Astro components
│   ├── BackToTop.astro    # Scroll-to-top functionality
│   ├── EasterEggs.astro   # Hidden interactive elements
│   ├── MaintenanceMode.astro # Maintenance page toggle
│   ├── SocialShare.astro    # Enhanced social sharing buttons
│   └── TableOfContents.astro # Auto-generated TOC
├── config/              # Site configuration
│   └── site.ts          # Main site settings and metadata
├── content/             # Markdown content collections
│   ├── blog/            # Blog posts with tag navigation
│   ├── portfolio/       # Portfolio projects showcase
│   ├── fun/             # Fun projects and experiments
│   ├── now/             # Current status updates
│   ├── resources/       # Learning resources and tools
│   ├── talks/           # Speaking engagements
│   └── config.ts        # Content collections configuration
├── layouts/             # Page layouts
│   └── Layout.astro     # Main layout with clean navigation
├── pages/               # Route pages
│   ├── blog/            # Blog listing and individual posts
│   │   ├── tags/        # Tag-based navigation pages
│   │   ├── [slug].astro # Individual blog posts
│   │   └── index.astro  # Blog listing page
│   ├── portfolio/       # Portfolio showcase
│   │   ├── [slug].astro # Individual projects
│   │   └── index.astro  # Portfolio listing
│   ├── resources/       # Learning resources
│   ├── about.astro      # About page with professional info
│   ├── contact.astro    # Contact form with validation
│   ├── credits.astro    # Credits and acknowledgments
│   ├── fun.astro        # Personal hobbies and interests
│   ├── games.astro      # Interactive games hub
│   ├── index.astro      # Homepage with smooth animations
│   ├── maintenance.astro # Maintenance mode page
│   ├── meme.astro       # Dynamic meme loader
│   ├── now.astro        # Current status updates
│   ├── resume.astro     # Professional resume
│   ├── rss.xml.ts       # RSS feed generation
│   ├── search.astro     # Search functionality
│   ├── secret.astro     # Hidden easter egg page
│   ├── speaking.astro   # Speaking engagements
│   ├── tools.astro      # Developer utilities and tools
│   └── uses.astro       # Tools and development setup
├── utils/               # Utility functions
│   ├── reading-time.ts  # Calculate reading time
│   └── related-posts.ts # Find related content
public/
├── animations.css       # External CSS animations and effects
├── game-scripts/        # Interactive game logic
│   ├── hangman.js       # Hangman game implementation
│   └── pixel-drawer.js  # Pixel art creation tool
├── favicon.svg          # Site favicon
├── me.jpg              # Profile photo
├── og-image.png        # Optimized Open Graph image (1200x630)
├── Resume.pdf          # Downloadable resume
├── robots.txt          # SEO configuration
└── CNAME               # Custom domain configuration
scripts/
└── toggle-maintenance.js # Maintenance mode toggle script
```

## 🎮 Interactive Features

### Games

- **Pixel Sandbox**: Create pixel art or ASCII art with multiple grid sizes, color picker, save/load functionality, and export options (PNG, JSON, code snippets)
- **Hangman**: Programming-themed word guessing game with visual hangman drawing, sound effects, score tracking, and hint system

### Developer Tools

- **QR Code Generator**: Convert text or URLs to downloadable QR codes with customizable size
- **Color Palette Generator**: Create harmonious color schemes from a base color with hex codes
- **Lorem Ipsum Generator**: Generate placeholder text (words, sentences, paragraphs) with copy functionality
- **Password Generator**: Create secure passwords with customizable length and character sets
- **Base64 Encoder/Decoder**: Encode and decode text to/from Base64 with validation
- **JSON Formatter**: Format, minify, and validate JSON with syntax highlighting and error detection

### Social Features

- **Enhanced Social Sharing**: Optimized Open Graph images, LinkedIn-specific meta tags, and Twitter Card support
- **Professional Link Previews**: Properly formatted metadata for better social media appearance
- **Structured Data**: JSON-LD schema markup for improved search engine understanding

### Easter Eggs & Fun

- **Secret Page**: Hidden page accessible via special navigation, featuring interactive elements and achievements
- **Memes**: Dynamic meme loader supporting multiple subreddits with statistics and fun facts
- **Interactive Elements**: Smooth animations, hover effects, and engaging user interactions
- **Clean Design**: Professional appearance without distracting animations or excessive motion

## ✍️ Adding Content

### Blog Posts

Create a new `.md` file in `src/content/blog/`:

```markdown
---
title: "Your Post Title"
date: 2024-01-01T00:00:00Z
description: "Brief description of your post"
tags: ["tag1", "tag2"] # Tags are automatically linked and navigable
---

Your content here with full Markdown and MDX support...
```

### Portfolio Projects

Create a new `.md` file in `src/content/portfolio/`:

```markdown
---
title: "Project Name"
description: "Project description"
date: "2024"
technologies: ["React", "TypeScript"] # Displayed as badges
github: "https://github.com/username/repo"
demo: "https://demo-url.com"
---

Project details with full formatting support...
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

Each content type has its own schema defined in `src/content/config.ts` with TypeScript validation.

## 🚀 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions with Yarn for reliable dependency management. The workflow:

1. Installs dependencies with Yarn for consistency
2. Runs type checking with `yarn astro check`
3. Builds the optimized site with `yarn build`
4. Deploys to `gh-pages` branch using `peaceiris/actions-gh-pages`
5. Serves at `1mangesh1.github.io`
6. Custom domain `mangeshbide.tech` points to GitHub Pages

### Manual Deployment

```bash
# Build the site with optimization
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
      // Add your custom colors here
    }
  }
}
```

### Animation System

The site uses an external CSS file (`public/animations.css`) for organized animation management:

- **Scroll Animations**: Smooth fade-in and slide effects
- **Hover Effects**: Professional lift and glow effects
- **Page Transitions**: Seamless navigation animations
- **Performance**: Optimized for reduced motion preferences

### Adding New Games

1. Create game logic in `public/game-scripts/your-game.js`
2. Add game card to `src/pages/games.astro`
3. Implement game container and controls
4. Test thoroughly across devices and browsers

### Site Configuration

- **Site metadata**: Update in `src/config/site.ts`
- **Navigation**: Modify the nav items in the Layout component
- **Content collections**: Configure in `src/content/config.ts`
- **Custom domain**: Update `public/CNAME` file
- **Social sharing**: Optimize Open Graph image and meta tags

## 🎯 Site Features Overview

### Professional

- **About**: Personal and professional background with clean design
- **Resume**: Comprehensive CV with downloadable PDF
- **Portfolio**: Showcase of projects with technology badges and links
- **Speaking**: Talks and presentations with structured data
- **Uses**: Development tools and setup recommendations
- **Tools**: Developer utilities for everyday productivity
- **Contact**: Professional contact form with validation

### Personal & Fun

- **Now**: Current activities and status updates with structured data
- **Fun**: Personal hobbies, gaming, and interests without distracting animations
- **Games**: Interactive games and creative tools with smooth performance
- **Memes**: Programming humor and entertainment with dynamic loading
- **Secret**: Hidden easter eggs and surprises for exploration

### Content & Resources

- **Blog**: Technical articles with clickable tag navigation
- **Resources**: Learning materials and tool recommendations
- **Search**: Full-text search functionality with instant results
- **RSS**: Syndicated content feeds for easy following

### Performance & SEO

- **Optimized Loading**: Fast page loads with efficient asset management
- **Social Media**: Enhanced Open Graph and Twitter Card support
- **Structured Data**: JSON-LD markup for better search visibility
- **Mobile Optimized**: Responsive design with touch-friendly interactions
- **Accessibility**: Clean navigation and reduced motion support

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

Made with 💙 by [Mangesh](https://github.com/1mangesh1) • Featuring interactive games, dynamic content, clean design, and optimized performance! 🎮✨
