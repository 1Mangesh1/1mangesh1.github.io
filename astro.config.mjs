// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import { rehypeImageAttrs } from "./src/lib/rehype-image-attrs.mjs";
import { tagRedirects } from "./src/data/tags.ts";
import { postDates } from "./src/utils/post-dates.ts";

const DATES = postDates("src/content/blog");

// https://astro.build/config
export default defineConfig({
  integrations: [
    mdx(),
    tailwind(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      // Keep the sitemap and the noindex set in agreement — listing a page you
      // tell crawlers to drop is a contradictory signal.
      filter: (page) =>
        ![
          "/maintenance", "/thank-you", "/skeleton-demo", "/dead", "/secret",
          "/search/", "/terminal/", "/guestbook/", "/books/", "/speaking/",
        ].some((p) => new URL(page).pathname.startsWith(p)),
      serialize(item) {
        const slug = item.url.match(/\/blog\/([^/]+)\/?$/)?.[1];
        if (slug && DATES[slug]) item.lastmod = new Date(DATES[slug]).toISOString();
        else delete item.lastmod;
        return item;
      },
    }),
  ],
  site: "https://mangeshbide.tech",
  base: "/",
  // /reading rendered the same books collection as /books, splitting the same
  // query intent across two URLs. /books wins: it owns the [slug] detail pages.
  redirects: {
    "/reading": "/books/",
    "/portfolio/job-researcher": "/portfolio/fieldnotes/",
    ...tagRedirects(),
  },
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
