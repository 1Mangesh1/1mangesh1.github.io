import { getCollection, type CollectionEntry } from "astro:content";
import { isPublishedAt } from "./posts";

export function isPublished(post: CollectionEntry<"blog">): boolean {
  if (import.meta.env.DEV) return true;
  return isPublishedAt(post, new Date());
}

export async function getPublishedPosts(): Promise<CollectionEntry<"blog">[]> {
  const all = await getCollection("blog");
  return all.filter(isPublished);
}
