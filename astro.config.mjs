// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { rehypeImageAttrs } from "./src/lib/rehype-image-attrs.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      // Exclude maintenance page from sitemap
      filter: (page) => !page.includes("/maintenance"),
    }),
  ],
  site: "https://mangeshbide.tech",
  base: "/",
  markdown: {
    rehypePlugins: [rehypeImageAttrs],
  },
  build: {
    assets: "assets",
  },
  vite: {
    build: {
      // Site-wide components put the same small module on all ~180 pages; inlining
      // them re-ships and re-parses the bytes per page instead of caching once.
      assetsInlineLimit: 0,
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
