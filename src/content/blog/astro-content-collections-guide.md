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

## Common Gotchas

1. **Date Format**: Use ISO 8601 format (`2025-12-09T00:00:00Z`) for dates
2. **Collection Names**: Folder name must match the export name in `config.ts`
3. **Type Checking**: Run `astro check` to validate schemas before building
4. **Draft Posts**: Filter them out in production but show in development

---

## Conclusion

Content Collections transform how you manage content in Astro. With type-safe schemas, powerful querying, and seamless rendering, you can focus on writing content instead of wrestling with file imports.

Start small with a single collection and expand as your site grows. The investment in proper schema design pays off quickly as your content scales.

---

**Resources:**
- [My own astro based portfolio site repo](https://github.com/1mangesh1/1mangesh1.github.io)
- [Official Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/)
- [Zod Schema Validation](https://zod.dev/)
