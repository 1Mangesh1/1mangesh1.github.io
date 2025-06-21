import type { CollectionEntry } from "astro:content";

export function getRelatedPosts(
  currentPost: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  maxResults: number = 3
): CollectionEntry<"blog">[] {
  if (!currentPost.data.tags || currentPost.data.tags.length === 0) {
    // If no tags, return most recent posts (excluding current)
    return allPosts
      .filter((post) => post.slug !== currentPost.slug)
      .sort(
        (a, b) =>
          new Date(b.data.pubDate).getTime() -
          new Date(a.data.pubDate).getTime()
      )
      .slice(0, maxResults);
  }

  const currentTags = new Set(
    currentPost.data.tags.map((tag) => tag.toLowerCase())
  );

  // Calculate relevance score for each post
  const scoredPosts = allPosts
    .filter((post) => post.slug !== currentPost.slug) // Exclude current post
    .map((post) => {
      let score = 0;

      if (post.data.tags) {
        const postTags = new Set(
          post.data.tags.map((tag) => tag.toLowerCase())
        );

        // Count shared tags
        const sharedTags = new Set(
          [...currentTags].filter((tag) => postTags.has(tag))
        );
        score = sharedTags.size;

        // Boost score if post has similar number of tags (indicates similar complexity/topic depth)
        const tagCountDifference = Math.abs(currentTags.size - postTags.size);
        if (tagCountDifference <= 1) {
          score += 0.5;
        }
      }

      return { post, score };
    })
    .filter((item) => item.score > 0) // Only include posts with shared tags
    .sort((a, b) => {
      // Sort by score first, then by date (newer first)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return (
        new Date(b.post.data.pubDate).getTime() -
        new Date(a.post.data.pubDate).getTime()
      );
    });

  const relatedPosts = scoredPosts
    .slice(0, maxResults)
    .map((item) => item.post);

  // If we don't have enough related posts, fill with recent posts
  if (relatedPosts.length < maxResults) {
    const recentPosts = allPosts
      .filter(
        (post) =>
          post.slug !== currentPost.slug &&
          !relatedPosts.some((related) => related.slug === post.slug)
      )
      .sort(
        (a, b) =>
          new Date(b.data.pubDate).getTime() -
          new Date(a.data.pubDate).getTime()
      )
      .slice(0, maxResults - relatedPosts.length);

    return [...relatedPosts, ...recentPosts];
  }

  return relatedPosts;
}
