// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

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
  build: {
    assets: "assets",
  },
});
