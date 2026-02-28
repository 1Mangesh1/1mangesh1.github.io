// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import critters from "astro-critters";
import compress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) =>
        !page.includes("/maintenance") &&
        !page.includes("/secret") &&
        !page.includes("/thank-you") &&
        !page.includes("/404"),
    }),
    critters(),
    compress({
      CSS: true,
      HTML: true,
      JavaScript: true,
      Image: false,
      SVG: false,
    }),
  ],
  site: "https://mangeshbide.tech",
  base: "/",
  build: {
    assets: "assets",
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: "hover",
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
