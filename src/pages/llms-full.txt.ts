import { getCollection } from "astro:content";
import { identity } from "../data/identity";
import { getPublishedPosts } from "../utils/published-posts";

// The expanded companion to /llms.txt (llmstxt.org): the full text of every
// project and published post in one file.
export async function GET() {
  const site = identity.links.site;
  const projects = (await getCollection("portfolio")).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const posts = (await getPublishedPosts()).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const sections = [
    `# ${identity.name}`,
    `> ${identity.headline}. ${identity.tagline}`,
    `Resume: ${site}/resume/ (as JSON: ${site}/resume.json). Contact: ${identity.email}.`,
    "## Projects",
    ...projects.map(
      (e) => `### ${e.data.title}\n\nURL: ${site}/portfolio/${e.id}/\n${e.data.description}\n\n${e.body?.trim() ?? ""}`,
    ),
    "## Posts",
    ...posts.map(
      (p) =>
        `### ${p.data.title}\n\nURL: ${site}/blog/${p.id}/\nPublished: ${p.data.pubDate.toISOString().slice(0, 10)}\n\n${p.body?.trim() ?? ""}`,
    ),
  ];
  return new Response(`${sections.join("\n\n")}\n`);
}
