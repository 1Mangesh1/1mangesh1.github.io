import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./public/game-scripts/*.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // The @font-face rules for both families are in src/layouts/Layout.astro.
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', ...defaultTheme.fontFamily.sans],
        mono: ['"Atkinson Hyperlegible Mono"', ...defaultTheme.fontFamily.mono],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "inherit",
            a: {
              color: "inherit",
              textDecoration: "underline",
              fontWeight: "500",
            },
            strong: {
              color: "inherit",
            },
            // Match the page headings that sit outside prose: bold, tight tracking.
            h1: { fontWeight: "700", letterSpacing: "-0.025em" },
            h2: { letterSpacing: "-0.02em" },
            // The plugin prints literal backticks around inline code.
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            ":not(pre) > code": {
              fontWeight: "500",
              padding: "0.125em 0.375em",
              borderRadius: "0.375rem",
              backgroundColor: "rgb(17 24 39 / 0.06)",
            },
            'ol[type="A"]': {
              "--list-counter-style": "upper-alpha",
            },
            'ol[type="a"]': {
              "--list-counter-style": "lower-alpha",
            },
            'ol[type="A" s]': {
              "--list-counter-style": "upper-alpha",
            },
            'ol[type="a" s]': {
              "--list-counter-style": "lower-alpha",
            },
            'ol[type="I"]': {
              "--list-counter-style": "upper-roman",
            },
            'ol[type="i"]': {
              "--list-counter-style": "lower-roman",
            },
            'ol[type="I" s]': {
              "--list-counter-style": "upper-roman",
            },
            'ol[type="i" s]': {
              "--list-counter-style": "lower-roman",
            },
            'ol[type="1"]': {
              "--list-counter-style": "decimal",
            },
          },
        },
        invert: {
          css: {
            ":not(pre) > code": { backgroundColor: "rgb(255 255 255 / 0.1)" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
