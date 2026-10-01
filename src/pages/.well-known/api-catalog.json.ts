import { identity } from "../../data/identity";

// RFC 9727 API catalog. The agent-edge Worker serves it at the spec's fixed path,
// /.well-known/api-catalog, with the linkset media type. Every API here is public
// and read-only.
export function GET() {
  const site = identity.links.site;
  return Response.json({
    linkset: [
      {
        anchor: site,
        "service-desc": [{ href: `${site}/openapi.json`, type: "application/vnd.oai.openapi+json" }],
        "service-doc": [{ href: `${site}/llms.txt`, type: "text/plain" }],
      },
      {
        anchor: `${site}/mcp`,
        "service-desc": [{ href: `${site}/.well-known/mcp/server-card.json`, type: "application/mcp-server-card+json" }],
      },
      {
        anchor: `${site}/a2a`,
        "service-desc": [{ href: `${site}/.well-known/agent-card.json`, type: "application/a2a-agent-card+json" }],
      },
    ],
  });
}
