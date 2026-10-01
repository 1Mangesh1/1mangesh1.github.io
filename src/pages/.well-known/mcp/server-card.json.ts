import { identity } from "../../../data/identity";
import { MCP_PROTOCOL_VERSIONS, MCP_SERVER_INFO } from "../../../../workers/agent-edge/mcp.js";

// MCP Server Card (SEP-2127 draft, server-card schema v1). Agent-readiness
// scanners also read serverInfo, endpoint and capabilities, which the schema
// leaves to runtime negotiation, so both shapes are present and agree.
export function GET() {
  const site = identity.links.site;
  const endpoint = `${site}/mcp`;
  return Response.json({
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: "tech.mangeshbide/site",
    title: MCP_SERVER_INFO.title,
    version: MCP_SERVER_INFO.version,
    description: `Read-only tools for ${identity.name}'s resume, the index of his published pages, and any page as markdown. No auth.`,
    websiteUrl: site,
    repository: {
      url: "https://github.com/1Mangesh1/1mangesh1.github.io",
      source: "github",
      subfolder: "workers/agent-edge",
    },
    remotes: [{ type: "streamable-http", url: endpoint, supportedProtocolVersions: MCP_PROTOCOL_VERSIONS }],
    serverInfo: MCP_SERVER_INFO,
    endpoint,
    capabilities: { tools: {} },
  });
}
