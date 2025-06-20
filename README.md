# Mangesh's Personal Website

A modern, comprehensive personal website built with Astro, featuring blog, portfolio, and professional pages with dark/light mode toggle and markdown-powered content.

🌐 **Live Site**: [mangeshbide.tech](https://mangeshbide.tech) | [1mangesh1.github.io](https://1mangesh1.github.io)

## ✨ Features

- **⚡ Fast & Lightweight**: Built with Astro for optimal performance
- **🌙 Dark/Light Mode**: Automatic theme toggle with user preference persistence
- **📝 Blog & Portfolio**: Markdown-powered content with full MDX support
- **👤 Professional Pages**: About, Contact, Resume, Uses, and Speaking pages
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🔍 SEO Optimized**: Built-in meta tags and structured data
- **📧 Contact Form**: Functional contact form with validation
- **🚀 Auto Deploy**: GitHub Actions workflow with Yarn for seamless deployment

## 🛠️ Tech Stack

- **Framework**: [Astro](https://astro.build)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) + [Typography Plugin](https://tailwindcss.com/docs/typography-plugin)
- **Content**: [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
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
├── content/              # Markdown content
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
│   ├── blog/           # Blog listing and individual posts
│   ├── portfolio/      # Portfolio listing and projects
│   ├── resources/      # Resources page
│   ├── about.astro     # About page
│   ├── contact.astro   # Contact form
│   ├── fun.astro       # Fun projects
│   ├── index.astro     # Homepage
│   ├── now.astro       # Current status
│   ├── resume.astro    # Professional resume
│   ├── rss.xml.ts      # RSS feed
│   ├── search.astro    # Search functionality
│   ├── speaking.astro  # Speaking page
│   └── uses.astro      # Tools and setup
public/
├── favicon.svg         # Site favicon
├── me.jpg             # Profile photo
├── Resume.pdf         # Downloadable resume
└── CNAME              # Custom domain config
```

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

### Other Content Types

- **Fun Projects**: Add to `src/content/fun/`
- **Now Updates**: Add to `src/content/now/` (current status/activities)
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

### Layout & Styling

- **Main layout**: `src/layouts/Layout.astro` - Contains navigation, theme toggle, and base styles
- **Component styles**: Use Tailwind classes throughout the codebase
- **Dark/Light mode**: Automatically handled via `dark:` classes and localStorage
- **Typography**: Enhanced with `@tailwindcss/typography` plugin for markdown content

### Site Configuration

- **Site metadata**: Update in `src/layouts/Layout.astro`
- **Navigation**: Modify the nav items in the Layout component
- **Content collections**: Configure in `src/content/config.ts`
- **Custom domain**: Update `public/CNAME` file

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/1mangesh1/1mangesh1.github.io/issues).

## 📧 Contact

- **Email**: [mangeshsbide@gmail.com](mailto:mangeshsbide@gmail.com)
- **Twitter**: [@Mangesh_Bide](https://x.com/Mangesh_Bide)
- **GitHub**: [@1mangesh1](https://github.com/1mangesh1)

---

Made with 💙 by [Mangesh](https://github.com/1mangesh1)
