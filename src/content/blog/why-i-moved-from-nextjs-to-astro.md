---
title: "Why I Moved from Next.js to Astro (And Haven't Looked Back)"
description: "Next.js is a hammer, and your blog is not a nail. See why I dropped the React complexity for Astro's simplicity, zero-JS default, and perfect Lighthouse scores."
pubDate: 2026-02-24T00:00:00Z
tags: ["Astro", "Next.js", "Web Development", "Performance"]
draft: false
---

Here's the reality: I love React. I've built entire SaaS platforms with it. But using Next.js for a content site is like using a sledgehammer to hang a picture frame.

I spent three years optimizing my previous blog on Next.js. I fought with `useEffect` waterfalls, hydration errors, and bundle sizes that crept up every time I added a syntax highlighter.

Then I switched to Astro. The entire migration took a weekend. My Lighthouse score went from a shaky 92 to a perfect 100.

Here is why you should probably do the same.

## The "Hydration Tax"

We've normalized a weird pattern in web development.

1.  Server renders HTML.
2.  Server sends HTML to the browser.
3.  Browser downloads 200KB of JavaScript.
4.  Browser executes JavaScript to attach event listeners to the HTML that is already there.

This is "hydration". For a dashboard, it makes sense. For a blog post? It's wasteful.

Your users came to read text. They didn't come to download a React runtime to manage the state of a static paragraph.

## Enter Astro

Astro flips the model. By default, it ships **zero** JavaScript to the client.

It renders your components (React, Vue, Svelte, or just HTML) on the server, strips out the JS, and sends pure HTML.

If you need interactivity—say, a "Like" button—you opt-in with a simple directive:

```astro
<LikeButton client:load />
```

That's it. Only that specific component gets hydrated. The rest of the page remains static HTML. This is the "Islands Architecture".

## The Code Difference

In Next.js, fetching data for a blog post often looks like this:

```typescript
// pages/blog/[slug].tsx
export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  return { props: { post } };
}

export default function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

It works, but you're now managing data fetching in a separate function, typing props, and handling the React component lifecycle.

Here is the same thing in Astro:

```astro
---
// src/pages/blog/[slug].astro
import { getEntry } from 'astro:content';
const { slug } = Astro.params;
const post = await getEntry('blog', slug);
const { Content } = await post.render();
---

<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

It's cleaner. It runs top-to-bottom like PHP (but with modern tooling). You have direct access to the build-time environment right in the frontmatter.

## Performance Wins

My Next.js blog had a First Contentful Paint (FCP) of 1.2s.
My Astro blog has an FCP of 0.4s.

Why? Because the browser isn't parsing a massive JSON blob of props before it can paint the screen. It just sees HTML and CSS.

## The Verdict

Don't stick with a tool just because you know it.

If you are building a complex web app with authentication, dashboards, and heavy state? Use Next.js. It's fantastic for that.

But if you are building a blog, a portfolio, or a documentation site? Next.js is over-engineering.

Switch to Astro. Your users (and your bandwidth bill) will thank you.
