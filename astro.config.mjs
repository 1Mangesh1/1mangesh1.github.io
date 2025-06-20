// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), tailwind()],
  site: "https://1mangesh1.github.io",
  base: "/",
  build: {
    assets: "assets",
  },
});
