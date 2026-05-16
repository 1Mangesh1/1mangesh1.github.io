import rss from "@astrojs/rss";
import { getPublishedPosts } from "../utils/published-posts";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const blog = await getPublishedPosts();
  const sortedPosts = blog.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return rss({
    title: "Mangesh's Blog",
    description:
      "A blog about software development, machine learning, and technology",
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: post.data.tags || [],
    })),
    customData: `<language>en-us</language>`,
  });
}
