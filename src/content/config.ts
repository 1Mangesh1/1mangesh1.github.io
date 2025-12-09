import { defineCollection, z } from "astro:content";

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

const resources = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["tools", "learning", "books", "articles", "videos"]),
    url: z.string(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    date: z.date(),
  }),
});

const talks = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    event: z.string(),
    location: z.string(),
    date: z.date(),
    slides: z.string().optional(),
    video: z.string().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
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

// Today I Learned - Quick daily learnings
const til = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    category: z.enum(["javascript", "python", "css", "devops", "git", "linux", "general"]).optional(),
    draft: z.boolean().optional(),
  }),
});

// Code Snippets - Reusable code patterns
const snippets = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    language: z.enum(["javascript", "typescript", "python", "css", "html", "bash", "sql", "go", "rust", "other"]),
    tags: z.array(z.string()).optional(),
    date: z.date(),
    draft: z.boolean().optional(),
  }),
});

// Bookmarks - Curated links
const bookmarks = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
    category: z.enum(["article", "tool", "video", "podcast", "repo", "tutorial", "other"]),
    tags: z.array(z.string()).optional(),
    date: z.date(),
    featured: z.boolean().default(false),
    draft: z.boolean().optional(),
  }),
});

// Books - Reading list with reviews
const books = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    status: z.enum(["reading", "completed", "want-to-read", "abandoned"]),
    startDate: z.date().optional(),
    finishDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().default(false),
    draft: z.boolean().optional(),
  }),
});

// Random - Miscellaneous thoughts, ideas, experiments
const random = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date(),
    type: z.enum(["thought", "idea", "experiment", "note", "rant", "shower-thought"]).optional(),
    mood: z.string().optional(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  blog,
  portfolio,
  resources,
  talks,
  now,
  til,
  snippets,
  bookmarks,
  books,
  random,
};
