import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const portfolioCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().optional(),
    technologies: z.array(z.string()).optional(),
    github: z.string().optional(),
    demo: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  portfolio: portfolioCollection,
};
