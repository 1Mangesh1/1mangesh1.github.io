import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
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
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/portfolio" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    image: z.string().optional(),
    tech: z.array(z.string()),
    github: z.string().optional(),
    demo: z.string().optional(),
    featured: z.boolean().default(false),
    date: z.date(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/now" }),
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
  now,
};
