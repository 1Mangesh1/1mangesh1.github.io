import { identity } from "../data/identity";

// Describes the site's read-only data files; the API catalog points here.
export function GET() {
  const get = (summary: string, type: string) => ({
    get: { summary, responses: { "200": { description: summary, content: { [type]: {} } } } },
  });
  return Response.json({
    openapi: "3.1.0",
    info: {
      title: `${identity.name}: site data`,
      version: "1.0.0",
      description: "Static, public, read-only files. No authentication.",
    },
    servers: [{ url: identity.links.site }],
    paths: {
      "/resume.json": get("Resume: roles with dates, projects, skills, education, certifications", "application/json"),
      "/llms.txt": get("Index of every published page with its URL and a one-line description", "text/plain"),
      "/llms-full.txt": get("Full text of every project and published post", "text/plain"),
    },
  });
}
