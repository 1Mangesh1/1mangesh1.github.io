/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#3f6b4e",
          dark: "#7aa88a",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          muted: "#5a5a5a",
        },
        paper: {
          DEFAULT: "#fbfaf7",
          dark: "#131313",
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: theme('colors.ink.DEFAULT'),
            lineHeight: "1.75",
            fontSize: "1.0625rem",
            a: {
              color: theme('colors.forest.DEFAULT'),
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              textDecorationThickness: "1px",
              fontWeight: "400",
            },
            'a:hover': {
              textDecorationThickness: "2px",
            },
            strong: { color: "inherit", fontWeight: "600" },
            h1: { fontFamily: theme('fontFamily.serif').join(','), fontWeight: "700", letterSpacing: "-0.02em" },
            h2: { fontFamily: theme('fontFamily.serif').join(','), fontWeight: "700", letterSpacing: "-0.015em", marginTop: "2.5em" },
            h3: { fontFamily: theme('fontFamily.serif').join(','), fontWeight: "700", letterSpacing: "-0.01em" },
            code: {
              fontFamily: theme('fontFamily.mono').join(','),
              fontWeight: "400",
              fontSize: "0.9em",
              backgroundColor: "#f0ede6",
              padding: "0.15em 0.35em",
              borderRadius: "3px",
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: {
              fontFamily: theme('fontFamily.mono').join(','),
              backgroundColor: "#1a1a1a",
              color: "#e8e8e8",
              padding: "1rem 1.25rem",
              borderRadius: "6px",
              fontSize: "0.9em",
              lineHeight: "1.6",
            },
            'pre code': {
              backgroundColor: "transparent",
              padding: "0",
              color: "inherit",
            },
            blockquote: {
              borderLeftColor: theme('colors.forest.DEFAULT'),
              borderLeftWidth: "2px",
              fontStyle: "normal",
              color: theme('colors.ink.muted'),
              paddingLeft: "1.25rem",
              quotes: "none",
            },
            'blockquote p::before': { content: '""' },
            'blockquote p::after': { content: '""' },
            hr: {
              borderColor: "#e5e3dc",
              marginTop: "3rem",
              marginBottom: "3rem",
            },
            img: {
              borderRadius: "4px",
            },
          },
        },
        invert: {
          css: {
            color: "#d4d4d4",
            a: { color: theme('colors.forest.dark') },
            strong: { color: "#f0f0f0" },
            h1: { color: "#f0f0f0" },
            h2: { color: "#f0f0f0" },
            h3: { color: "#f0f0f0" },
            code: { backgroundColor: "#1f1f1f", color: "#e8e8e8" },
            blockquote: { borderLeftColor: theme('colors.forest.dark'), color: "#9a9a9a" },
            hr: { borderColor: "#2a2a2a" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
