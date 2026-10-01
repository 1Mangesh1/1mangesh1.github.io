// WebMCP: exposes the site's read-only actions to AI agents running in the
// browser. It only registers tools where the browser implements the API:
// document.modelContext, or navigator.modelContext in older Chrome builds.
type ToolResult = { content: { type: "text"; text: string }[] };
interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: object;
  execute: (input: Record<string, unknown>) => Promise<ToolResult>;
}
interface ModelContext {
  registerTool(tool: WebMcpTool): Promise<void> | void;
}

const text = (t: string): ToolResult => ({ content: [{ type: "text", text: t }] });

async function get(path: string): Promise<string> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} returned HTTP ${res.status}`);
  return res.text();
}

const tools: WebMcpTool[] = [
  {
    name: "get_profile",
    description: "Mangesh Bide's resume as JSON: headline, employer, roles with dates, projects, skills.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => text(await get("/resume.json")),
  },
  {
    name: "list_pages",
    description: "Every published post and project on this site with its URL and a one-line description.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => text(await get("/llms.txt")),
  },
  {
    name: "search_site",
    description: "Posts and projects whose title or description contains every word of the query.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Words to match, e.g. 'keycloak' or 'voice agent'" } },
      required: ["query"],
    },
    execute: async ({ query }) => {
      const words = String(query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
      const hits = (await get("/llms.txt"))
        .split("\n")
        .filter((line) => line.startsWith("- [") && words.every((w) => line.toLowerCase().includes(w)));
      return text(hits.length > 0 ? hits.join("\n") : `No post or project mentions "${query}".`);
    },
  },
  {
    name: "open_page",
    description: "Navigate this tab to a page on the site.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Site path, e.g. /resume/ or /blog/building-mira-voice-agent/" } },
      required: ["path"],
    },
    execute: async ({ path }) => {
      const url = new URL(String(path ?? ""), location.origin);
      if (url.origin !== location.origin) return text("path must be a page on this site");
      location.assign(url);
      return text(`Opening ${url.pathname}`);
    },
  },
];

let registered = false;
function register() {
  const modelContext =
    (document as Document & { modelContext?: ModelContext }).modelContext ??
    (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  if (registered || !modelContext) return;
  registered = true;
  for (const tool of tools) {
    Promise.resolve(modelContext.registerTool(tool)).catch((err) =>
      console.warn(`WebMCP: ${tool.name} not registered:`, err),
    );
  }
}

// Some agent runtimes, the agent-readiness scanner's shim among them, attach
// modelContext only after the page's own scripts have run. So try once the DOM
// is ready and the page is idle, and again on load.
const whenIdle = () =>
  "requestIdleCallback" in window ? requestIdleCallback(register, { timeout: 2000 }) : setTimeout(register, 500);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", whenIdle);
else whenIdle();
addEventListener("load", register);
