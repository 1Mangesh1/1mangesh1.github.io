import { identity } from "../data/identity";
import resume from "../data/resume.json";

// The resume as public JSON for agents and tools. Unfinished TODO(mangesh) items
// stay out, as they do on /resume.
const done = (s: string) => !s.includes("TODO(mangesh)");

export function GET() {
  const site = identity.links.site;
  return Response.json({
    name: identity.name,
    headline: identity.headline,
    employer: identity.employer,
    location: identity.location,
    email: identity.email,
    links: identity.links,
    summary: done(resume.summary) ? resume.summary : undefined,
    experience: resume.experience.map(({ org, location, start, end, roles, bullets }) => ({
      org,
      location,
      start,
      end,
      roles,
      bullets: bullets.filter(done),
    })),
    projects: resume.projects.map(({ name, portfolio, stack, url, bullets }) => ({
      name,
      page: `${site}/portfolio/${portfolio}/`,
      url,
      stack,
      bullets: bullets.filter(done),
    })),
    skills: resume.skills,
    education: resume.education,
    certifications: resume.certifications.filter((c) => done(c.year)),
  });
}
