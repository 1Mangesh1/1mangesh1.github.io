import { identity } from "../../data/identity";

// ARD capability manifest (ai-catalog data model): one entry per agent-facing
// service, so registries can find the MCP server, the A2A agent and the skill.
export function GET() {
  const site = identity.links.site;
  const host = new URL(site).host;
  return Response.json({
    specVersion: "1.0",
    host: { displayName: identity.name, identifier: site },
    entries: [
      {
        identifier: `urn:air:${host}:server:site`,
        displayName: `${identity.name}'s site (MCP)`,
        type: "application/mcp-server-card+json",
        url: `${site}/.well-known/mcp/server-card.json`,
        representativeQueries: [
          "What is Mangesh Bide's current role?",
          "List Mangesh Bide's projects",
          "Get Mangesh Bide's post about building the Mira voice agent",
        ],
      },
      {
        identifier: `urn:air:${host}:agent:mangesh-ai`,
        displayName: "Mangesh AI",
        type: "application/a2a-agent-card+json",
        url: `${site}/.well-known/agent-card.json`,
        representativeQueries: [
          "What does Mangesh Bide work on?",
          "Has Mangesh Bide written about Keycloak?",
          "Does Mangesh Bide know Kubernetes?",
        ],
      },
      {
        identifier: `urn:air:${host}:skills:site`,
        displayName: `Reading ${identity.name}'s site`,
        type: "application/agent-skills+json",
        url: `${site}/.well-known/agent-skills/index.json`,
        representativeQueries: [
          "Get Mangesh Bide's resume as JSON",
          "Where is the full text of Mangesh Bide's posts?",
        ],
      },
    ],
  });
}
