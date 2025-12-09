---
title: "Mastering Astro Content Collections: A Complete Guide"
description: "Learn how to use Astro's Content Collections to build type-safe, organized content for your blog or portfolio site."
pubDate: 2025-12-09T00:00:00Z
tags: ["Astro", "Web Development", "Tutorial", "TypeScript"]
draft: false
---

Content Collections are one of Astro's most powerful features for managing structured content. Whether you're building a blog, portfolio, or documentation site, Content Collections provide type safety, validation, and a clean API for working with your Markdown and MDX files.

---

## What Are Content Collections?

Content Collections are Astro's way of organizing and validating content. Instead of manually importing Markdown files and hoping the frontmatter is correct, you define a schema once and let Astro handle the rest.

Key benefits:
- **Type Safety**: TypeScript knows the shape of your content
- **Validation**: Catch frontmatter errors at build time
- **Organization**: Keep related content together
- **Querying**: Filter, sort, and transform content easily

---

## Setting Up Your First Collection

### 1. Create the Content Directory

All collections live in `src/content/`. Create a folder for each collection:

```
src/content/
├── blog/
│   ├── first-post.md
│   └── second-post.md
├── portfolio/
│   └── project-one.md
└── config.ts
```

### 2. Define Your Schema

Create `src/content/config.ts` to define your collections:

```typescript
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { blog };
```

### 3. Create Content Files

Each Markdown file needs frontmatter matching your schema:

```markdown
---
title: "My First Post"
description: "An introduction to my blog"
pubDate: 2025-12-09T00:00:00Z
tags: ["intro", "personal"]
---

Your content goes here...
```

---

## Querying Collections

Astro provides `getCollection()` to fetch and filter your content:

```typescript
import { getCollection } from "astro:content";

// Get all posts
const allPosts = await getCollection("blog");

// Filter out drafts
const publishedPosts = await getCollection("blog", ({ data }) => {
  return data.draft !== true;
});

// Sort by date (newest first)
const sortedPosts = publishedPosts.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
```

---

## Rendering Content

To render a collection entry, use the `render()` function:

```astro
---
import { getCollection } from "astro:content";

const posts = await getCollection("blog");
---

{posts.map(async (post) => {
  const { Content } = await post.render();
  return (
    <article>
      <h2>{post.data.title}</h2>
      <Content />
    </article>
  );
})}
```

---

## Dynamic Routes

Create dynamic pages for each entry using `[slug].astro`:

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<article>
  <h1>{post.data.title}</h1>
  <time>{post.data.pubDate.toLocaleDateString()}</time>
  <Content />
</article>
```

---

## Advanced Schema Patterns

### Enums for Categories

```typescript
const resources = defineCollection({
  type: "content",
  schema: z.object({
    category: z.enum(["tools", "learning", "books", "videos"]),
    // ...
  }),
});
```

### Optional Arrays with Defaults

```typescript
const portfolio = defineCollection({
  type: "content",
  schema: z.object({
    tech: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});
```

### URL Validation

```typescript
const links = defineCollection({
  type: "content",
  schema: z.object({
    url: z.string().url(),
    github: z.string().url().optional(),
  }),
});
```

---

## Working with Images

Astro can validate and optimize images in your content. Use the `image()` helper for local images:

```typescript
import { defineCollection, z } from "astro:content";
import { image } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) => z.object({
    title: z.string(),
    heroImage: image().optional(),
    // Or reference images from public folder
    ogImage: z.string().optional(),
  }),
});
```

In your frontmatter, reference images relative to the content file:

```markdown
---
title: "Post with Hero Image"
heroImage: "./images/hero.png"
---
```

Astro will automatically optimize these images at build time.

---

## Using MDX Components

Content Collections work seamlessly with MDX, allowing you to use components in your content:

### 1. Enable MDX in Your Config

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
});
```

### 2. Create Reusable Components

```astro
---
// src/components/Callout.astro
const { type = "info" } = Astro.props;
const colors = {
  info: "bg-blue-100 border-blue-500",
  warning: "bg-yellow-100 border-yellow-500",
  error: "bg-red-100 border-red-500",
};
---

<div class={`p-4 border-l-4 ${colors[type]}`}>
  <slot />
</div>
```

### 3. Use in MDX Files

```mdx
---
title: "Post with Components"
---
import Callout from '../../components/Callout.astro';

# My Post

<Callout type="warning">
  This is an important note!
</Callout>

Regular markdown continues here...
```

---

## References Between Collections

You can create relationships between collections using slugs or IDs:

```typescript
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    // Reference related posts by slug
    relatedPosts: z.array(z.string()).optional(),
    // Reference author from another collection
    author: z.string(),
  }),
});

const authors = defineCollection({
  type: "data", // JSON/YAML collection
  schema: z.object({
    name: z.string(),
    bio: z.string(),
    avatar: z.string(),
  }),
});
```

Then resolve references when querying:

```typescript
import { getCollection, getEntry } from "astro:content";

const post = await getEntry("blog", "my-post");
const author = await getEntry("authors", post.data.author);

// Get related posts
const relatedPosts = await Promise.all(
  post.data.relatedPosts?.map((slug) => getEntry("blog", slug)) ?? []
);
```

---

## Real-World Example: This Site

This very site uses Content Collections extensively. Here's how it's structured:

### Multiple Collection Types

```typescript
// src/content/config.ts - Actual config from this site
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
    ogImage: z.string().optional(),
  }),
});

const portfolio = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string(),
    tech: z.array(z.string()),
    github: z.string().optional(),
    demo: z.string().optional(),
    featured: z.boolean().default(false),
    date: z.date(),
  }),
});

const now = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    location: z.string().optional(),
    mood: z.string().optional(),
    currentlyReading: z.array(z.string()).optional(),
    currentlyWatching: z.array(z.string()).optional(),
    currentlyLearning: z.array(z.string()).optional(),
    currentlyBuilding: z.array(z.string()).optional(),
  }),
});
```

### Tag-Based Navigation

Tags automatically generate pages without manual configuration:

```astro
---
// src/pages/blog/tags/[tag].astro
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog");

  // Extract all unique tags
  const tags = [...new Set(posts.flatMap((post) => post.data.tags ?? []))];

  return tags.map((tag) => ({
    params: { tag },
    props: {
      posts: posts.filter((post) => post.data.tags?.includes(tag)),
    },
  }));
}
---
```

### Filtering Draft Posts in Production

```typescript
const publishedPosts = await getCollection("blog", ({ data }) => {
  // Show drafts in dev, hide in production
  return import.meta.env.PROD ? data.draft !== true : true;
});
```

---

## Troubleshooting

### Error: "Collection not found"

**Cause**: The collection folder doesn't exist or the name doesn't match `config.ts`.

**Fix**: Ensure folder name matches exactly:
```
src/content/blog/     ← folder name
export const collections = { blog };  ← must match
```

### Error: "Invalid frontmatter"

**Cause**: Content doesn't match the schema.

**Fix**: Run `astro check` to see detailed validation errors:
```bash
yarn astro check
```

Common issues:
- Missing required fields
- Wrong date format (use `2025-12-09T00:00:00Z`)
- Type mismatches (string vs array)

### Error: "Cannot find module 'astro:content'"

**Cause**: TypeScript can't find Astro's generated types.

**Fix**: Run the dev server or build to generate types:
```bash
yarn dev
# or
yarn astro sync
```

### Content Not Updating

**Cause**: Astro caches content during development.

**Fix**: Restart the dev server or clear the cache:
```bash
rm -rf node_modules/.astro
yarn dev
```

### Migration from Glob Imports

If you're migrating from `import.meta.glob()`:

**Before:**
```typescript
const posts = await Astro.glob("../content/blog/*.md");
```

**After:**
```typescript
import { getCollection } from "astro:content";
const posts = await getCollection("blog");
```

Key differences:
- `post.frontmatter` → `post.data`
- `post.url` → `/blog/${post.slug}`
- `post.Content` → `const { Content } = await post.render()`

---

## Performance Tips

1. **Filter Early**: Use the filter callback in `getCollection()` instead of filtering after
   ```typescript
   // Good - filters during fetch
   const posts = await getCollection("blog", ({ data }) => !data.draft);

   // Less efficient - fetches all, then filters
   const all = await getCollection("blog");
   const posts = all.filter((p) => !p.data.draft);
   ```

2. **Limit Renders**: Only call `render()` when you need the content body
   ```typescript
   // For listing pages, you often only need metadata
   const posts = await getCollection("blog");
   // Don't render here, just use post.data
   ```

3. **Cache Related Posts**: Compute relationships at build time, not runtime

4. **Use Data Collections**: For JSON/YAML data that doesn't need rendering, use `type: "data"` for faster processing

---

## Common Gotchas

1. **Date Format**: Use ISO 8601 format (`2025-12-09T00:00:00Z`) for dates
2. **Collection Names**: Folder name must match the export name in `config.ts`
3. **Type Checking**: Run `astro check` to validate schemas before building
4. **Draft Posts**: Filter them out in production but show in development
5. **Slug Conflicts**: Each file in a collection must have a unique slug (filename)
6. **Nested Folders**: Files in subfolders include the path in their slug (`folder/post` not `post`)

---

## Conclusion

Content Collections transform how you manage content in Astro. With type-safe schemas, powerful querying, and seamless rendering, you can focus on writing content instead of wrestling with file imports.

Start small with a single collection and expand as your site grows. The investment in proper schema design pays off quickly as your content scales.

---

**Resources:**
- [My own astro based portfolio site repo](https://github.com/1mangesh1/1mangesh1.github.io)
- [Official Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/)
- [Zod Schema Validation](https://zod.dev/)
