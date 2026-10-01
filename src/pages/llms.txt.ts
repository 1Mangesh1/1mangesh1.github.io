import { getCollection } from "astro:content";
import { identity } from "../data/identity";
import resume from "../data/resume.json";
import { getPublishedPosts } from "../utils/published-posts";

// A plain-text map of the site for LLM agents (llmstxt.org), built from the
// same identity, resume and post data as the pages it points to.
export async function GET() {
  const site = identity.links.site;
  const portfolio = await getCollection("portfolio");
  const projects = resume.projects.flatMap((p) => portfolio.filter((e) => e.id === p.portfolio));
  const posts = (await getPublishedPosts()).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const lines = [
    `# ${identity.name}`,
    "",
    `> ${identity.headline}. ${identity.tagline}`,
    "",
    `- [Resume](${site}/resume/): ${identity.headline} at ${identity.employer}. PDF: ${site}/Resume.pdf`,
    `- [About](${site}/about/)`,
    `- [Contact](${site}/contact/): ${identity.email}`,
    "",
    "## Projects",
    "",
    ...projects.map((e) => `- [${e.data.title}](${site}/portfolio/${e.id}/): ${e.data.description}`),
    "",
    "## Writing",
    "",
    ...posts.map((p) => `- [${p.data.title}](${site}/blog/${p.id}/): ${p.data.description}`),
  ];
  return new Response(`${lines.join("\n")}\n`);
}
