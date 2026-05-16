/**
 * Pure publish predicate. No env, no I/O, no value imports — unit-testable.
 * A post is published when it is not a draft and its pubDate has arrived.
 */
export function isPublishedAt(
  post: { data: { draft?: boolean; pubDate: Date } },
  now: Date
): boolean {
  if (post.data.draft === true) return false;
  return post.data.pubDate.getTime() <= now.getTime();
}
