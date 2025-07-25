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

export const collections = {
  blog,
  portfolio,
  resources,
  talks,
  now,
};
