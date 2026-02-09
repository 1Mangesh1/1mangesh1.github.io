import { getCollection, type CollectionEntry } from 'astro:content';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as CollectionEntry<'blog'>;

  const fontFile = await fetch(
    'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf'
  ).then((res) => res.arrayBuffer());

  const markup = html`
    <div
      style="display: flex; height: 100%; width: 100%; align-items: center; justify-content: center; background-color: #1e293b; color: white; padding: 40px;"
    >
      <div
        style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; width: 100%; height: 100%; border: 4px solid #3b82f6; border-radius: 20px; padding: 60px; background: linear-gradient(to bottom right, #1e293b, #0f172a);"
      >
        <div style="font-size: 24px; color: #60a5fa; margin-bottom: 20px;">Mangesh's Blog</div>
        <div style="font-size: 64px; font-weight: bold; line-height: 1.1; margin-bottom: 40px;">${post.data.title}</div>
        <div style="display: flex; gap: 20px;">
           ${post.data.tags ? post.data.tags.map((tag: string) => `<span style="background-color: #334155; padding: 10px 20px; border-radius: 10px; font-size: 24px;">#${tag}</span>`).join('') : ''}
        </div>
        <div style="margin-top: auto; font-size: 24px; color: #94a3b8;">
          ${new Date(post.data.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: fontFile,
        style: 'normal',
      },
    ],
  });

  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return new Response(pngBuffer as any, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
};
