// The agent-facing edge of mangeshbide.tech, on the mangeshbide.tech/* route in
// front of GitHub Pages. Pages keeps serving every file; this Worker adds what a
// static host can't: markdown negotiation, the MCP and A2A endpoints, and the
// response headers the discovery documents need.
// Deploy: wrangler deploy -c workers/agent-edge/wrangler.toml
import { handleA2a } from "./a2a.js";
import { fetchMarkdown } from "./markdown.js";
import { handleMcp } from "./mcp.js";

const HOMEPAGE_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(", ");

// Machine-readable files that browser-based agents should be able to fetch cross-origin.
const PUBLIC_DATA = new Set(["/llms.txt", "/llms-full.txt", "/resume.json", "/openapi.json", "/auth.md"]);

function withHeaders(response, headers) {
  const out = new Response(response.body, response);
  for (const [name, value] of Object.entries(headers)) out.headers.set(name, value);
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/mcp") return handleMcp(request, env);
    if (url.pathname === "/a2a") return handleA2a(request, env);

    if (request.method === "GET" && (request.headers.get("Accept") || "").includes("text/markdown")) {
      try {
        const { page, markdown, tokens } = await fetchMarkdown(request, env);
        if (page) return page;
        return new Response(markdown, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            Vary: "Accept",
            "x-markdown-tokens": String(tokens),
            // The same usage terms robots.txt declares.
            "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
          },
        });
      } catch (err) {
        console.error(err);
        return fetch(request);
      }
    }

    // RFC 9727 fixes the path without an extension; Pages serves the file as .json.
    if (url.pathname === "/.well-known/api-catalog") {
      const catalog = await fetch(new URL("/.well-known/api-catalog.json", url));
      return withHeaders(catalog, {
        "Content-Type": "application/linkset+json",
        "Access-Control-Allow-Origin": "*",
      });
    }

    const response = await fetch(request);
    if (url.pathname === "/") return withHeaders(response, { Link: HOMEPAGE_LINKS });
    if (url.pathname.startsWith("/.well-known/") || PUBLIC_DATA.has(url.pathname)) {
      return withHeaders(response, { "Access-Control-Allow-Origin": "*" });
    }
    return response;
  },
};
