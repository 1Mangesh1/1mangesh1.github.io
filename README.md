# Mangesh's Blog & Portfolio

A modern, minimal blog and portfolio site built with Astro, featuring dark/light mode toggle and markdown-powered content.

🌐 **Live Site**: [mangeshbide.tech](https://mangeshbide.tech) | [1mangesh1.github.io](https://1mangesh1.github.io)

## ✨ Features

- **⚡ Fast & Lightweight**: Built with Astro for optimal performance
- **🌙 Dark/Light Mode**: Automatic theme toggle with user preference persistence
- **📝 Markdown Content**: Blog posts and portfolio items powered by MDX
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🔍 SEO Optimized**: Built-in meta tags and structured data
- **🚀 Auto Deploy**: GitHub Actions workflow for seamless deployment

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

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── content/           # Markdown content
│   ├── blog/         # Blog posts
│   ├── portfolio/    # Portfolio projects
│   └── config.ts     # Content collections config
├── layouts/          # Page layouts
├── pages/            # Route pages
│   ├── blog/         # Blog listing and individual posts
│   ├── portfolio/    # Portfolio listing and projects
│   └── index.astro   # Homepage
└── styles/           # Global styles
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

## 🚀 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch. The workflow:

1. Builds the Astro site
2. Deploys to `gh-pages` branch
3. Serves at `1mangesh1.github.io`
4. Custom domain `mangeshbide.tech` points to GitHub Pages

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

- Main layout: `src/layouts/Layout.astro`
- Component styles: Use Tailwind classes
- Global styles: Add to the layout component

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
