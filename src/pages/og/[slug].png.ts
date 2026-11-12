import { type CollectionEntry } from 'astro:content';
import { getPublishedPosts } from '../../utils/published-posts';
import { box, renderOgCard } from '../../utils/og-image';
import { identity } from '../../data/identity';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as CollectionEntry<'blog'>;
  const date = new Date(post.data.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  // Three tags fit on one row beside the date.
  const tags = (post.data.tags ?? []).slice(0, 3).map((tag: string) =>
    box({ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 18px', borderRadius: 10, fontSize: 22, marginLeft: 14 }, tag)
  );

  return renderOgCard({
    title: post.data.title,
    top: [box({ fontWeight: 700, color: '#111827' }, identity.name)],
    bottom: [box({}, date), box({ marginLeft: 'auto' }, tags)],
  });
};
