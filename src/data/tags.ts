// Blog tag taxonomy. The blog schema maps aliases to canonical tags and fails
// the build on anything else, so the tag index cannot fragment again.
export const canonical: string[] = [
  "ai", "ai-agents", "claude-code", "voice-ai", "cloudflare", "astro", "django", "python",
  "postgresql", "javascript", "gamedev", "devops", "performance", "developer-tools", "seo",
  "career", "writing", "architecture", "multi-tenancy", "auth", "keycloak", "spicedb", "hipaa",
  "security",
];

// The form /blog/tags/<slug> URLs have always used.
export const tagSlug = (tag: string) => tag.toLowerCase().trim().replace(/\s+/g, "-");

// Old tag slugs that had published pages, grouped by the tag that replaced them.
const groups: Record<string, string[]> = {
  "ai": ["ai-engineering", "llm", "typesafe", "ai-chatbot", "streaming"],
  "ai-agents": ["agent-skills", "agentic-coding", "ai-automation", "workflow-automation", "automation", "prompt-engineering"],
  "claude-code": ["claude"],
  "voice-ai": ["tavus", "webrtc", "daily"],
  "cloudflare": ["cloudflare-workers", "workers", "workers-ai"],
  "django": ["gunicorn", "hot-reload", "soft-delete"],
  "python": ["fastapi"],
  "postgresql": ["database", "database-design"],
  "javascript": ["typescript", "node.js", "next.js", "react"],
  "gamedev": ["procedural-generation", "algorithms", "canvas"],
  "devops": ["docker", "github-actions", "deployment", "maintenance"],
  "developer-tools": ["tools", "free-tools", "productivity", "wakatime", "github", "domain"],
  "seo": ["google"],
  "career": ["portfolio"],
  "writing": ["blogging", "meta", "introduction", "welcome"],
  "architecture": ["microservices", "system-design", "scalability", "team-organization"],
  "multi-tenancy": ["multi-tenant", "saas"],
  "hipaa": ["healthcare", "healthcare-tech", "compliance"],
};

export const aliases: Record<string, string> = Object.fromEntries(
  Object.entries(groups).flatMap(([to, from]) => from.map((slug) => [slug, to])),
);

// Format words and topics too broad to browse by; their old pages redirect to the tag index.
export const retired = [
  "tutorial", "guide", "review", "features", "setup", "development", "engineering", "analytics",
  "web-development", "google-sheets", "serverless", "static-sites",
];

export const tagRedirects = (): Record<string, string> =>
  Object.fromEntries([
    ...Object.entries(aliases).map(([from, to]) => [`/blog/tags/${from}`, `/blog/tags/${to}`]),
    ...retired.map((slug) => [`/blog/tags/${slug}`, "/blog/tags"]),
  ]);
