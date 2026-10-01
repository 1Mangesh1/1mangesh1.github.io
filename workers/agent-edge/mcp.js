// Read-only MCP server over Streamable HTTP, stateless: every POST carries one
// JSON-RPC message and gets a JSON response, so there is no session or SSE
// stream to manage. The tools only read public pages, so there is no auth.
import { fetchMarkdown } from "./markdown.js";

const SITE = "https://mangeshbide.tech";

export const MCP_SERVER_INFO = { name: "mangeshbide-site", title: "Mangesh Bide's site", version: "1.0.0" };
export const MCP_PROTOCOL_VERSIONS = ["2026-07-28", "2025-11-25", "2025-06-18"];

const readOnly = { readOnlyHint: true, openWorldHint: false };
const TOOLS = [
  {
    name: "get_profile",
    description: "Mangesh Bide's resume as JSON: headline, employer, roles with dates, projects, skills, education, certifications.",
    inputSchema: { type: "object", properties: {} },
    annotations: readOnly,
  },
  {
    name: "list_pages",
    description: "Every published page on mangeshbide.tech (posts, projects, resume) with its URL and a one-line description.",
    inputSchema: { type: "object", properties: {} },
    annotations: readOnly,
  },
  {
    name: "get_page",
    description: "One page from mangeshbide.tech as clean markdown. Use a path from list_pages.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Site path, e.g. /blog/building-mira-voice-agent/" } },
      required: ["path"],
    },
    annotations: readOnly,
  },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Mcp-Protocol-Version, Mcp-Session-Id",
};

const rpc = (id, body) => Response.json({ jsonrpc: "2.0", id, ...body }, { headers: CORS });

export async function handleMcp(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") {
    return new Response("MCP endpoint: POST JSON-RPC messages (Streamable HTTP).", {
      status: 405,
      headers: { ...CORS, Allow: "POST, OPTIONS" },
    });
  }

  let msg;
  try {
    msg = await request.json();
  } catch {
    return rpc(null, { error: { code: -32700, message: "Parse error" } });
  }
  if (msg?.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpc(msg?.id ?? null, { error: { code: -32600, message: "Invalid request" } });
  }
  // Notifications (no id), e.g. notifications/initialized, need no reply.
  if (msg.id === undefined) return new Response(null, { status: 202, headers: CORS });
  return rpc(msg.id, await dispatch(msg.method, msg.params ?? {}, env));
}

async function dispatch(method, params, env) {
  switch (method) {
    case "initialize":
      return {
        result: {
          protocolVersion: MCP_PROTOCOL_VERSIONS.includes(params.protocolVersion)
            ? params.protocolVersion
            : MCP_PROTOCOL_VERSIONS[0],
          capabilities: { tools: {} },
          serverInfo: MCP_SERVER_INFO,
          instructions:
            "Public, read-only facts about Mangesh Bide. Start with list_pages, then get_page for detail. Cite URLs exactly as list_pages gives them.",
        },
      };
    case "ping":
      return { result: {} };
    case "tools/list":
      return { result: { tools: TOOLS } };
    case "tools/call":
      return callTool(params.name, params.arguments ?? {}, env);
    default:
      return { error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

async function callTool(name, args, env) {
  const text = (t, isError = false) => ({ result: { content: [{ type: "text", text: t }], isError } });
  try {
    switch (name) {
      case "get_profile":
        return text(await originText("/resume.json"));
      case "list_pages":
        return text(await originText("/llms.txt"));
      case "get_page": {
        const url = new URL(String(args.path ?? ""), SITE);
        if (url.origin !== SITE) return text("path must be a page on mangeshbide.tech", true);
        const { page, markdown } = await fetchMarkdown(new Request(url), env);
        return page ? text(`${url.pathname} is not an HTML page (HTTP ${page.status})`, true) : text(markdown);
      }
      default:
        return { error: { code: -32602, message: `Unknown tool: ${name}` } };
    }
  } catch (err) {
    console.error(`mcp tool ${name} failed:`, err);
    return text(`${name} failed: ${err.message}`, true);
  }
}

async function originText(path) {
  const res = await fetch(SITE + path);
  if (!res.ok) throw new Error(`${path} returned HTTP ${res.status}`);
  return res.text();
}
