import { identity } from "../data/identity";

export const siteConfig = {
  // Site maintenance mode
  maintenanceMode: false, // Set to true to enable maintenance mode

  // Site metadata
  title: identity.name,
  url: identity.links.site,
  blogDescription:
    "Build logs and essays on AI agents, Cloudflare Workers, Astro, developer tooling, and backend engineering.",
};
