import { getCollection } from "astro:content";
import { identity } from "../data/identity";
import resume from "../data/resume.json";
import { getPublishedPosts } from "../utils/published-posts";

// A plain-text map of the site for LLM agents (llmstxt.org), built from the
// same identity, resume and post data as the pages it points to.
export async function GET() {
  const site = identity.links.site;
  const portfolio = await getCollection("portfolio");
  const featured = resume.projects.flatMap((p) => portfolio.filter((e) => e.id === p.portfolio));
  const others = portfolio
    .filter((e) => !featured.includes(e))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const posts = (await getPublishedPosts()).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const status = { live: "live", wip: "in progress", archived: "archived" };
  const project = (e: (typeof portfolio)[number]) =>
    `- [${e.data.title}](${site}/portfolio/${e.id}/): ${e.data.description} (${status[e.data.status]}; tech: ${e.data.tech.join(", ")}${e.data.demo ? `; demo: ${e.data.demo}` : ""})`;

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
    ...featured.map(project),
    "",
    "## Other projects",
    "",
    ...others.map(project),
    "",
    "## Writing",
    "",
    ...posts.map((p) => `- [${p.data.title}](${site}/blog/${p.id}/): ${p.data.description}`),
  ];
  return new Response(`${lines.join("\n")}\n`);
}
