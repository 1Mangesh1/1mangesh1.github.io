import { identity } from "../../data/identity";
import { A2A_PROTOCOL_VERSION, A2A_SKILLS } from "../../../workers/agent-edge/a2a.js";

// A2A v1.0 Agent Card for the chatbot's A2A front (workers/agent-edge/a2a.js).
export function GET() {
  const site = identity.links.site;
  return Response.json({
    name: "Mangesh AI",
    description: `Answers questions about ${identity.name} (${identity.headline}) from his resume and site. Public, no auth, 40 messages per hour per IP.`,
    version: "1.0.0",
    supportedInterfaces: [{ url: `${site}/a2a`, protocolBinding: "JSONRPC", protocolVersion: A2A_PROTOCOL_VERSION }],
    provider: { organization: identity.name, url: site },
    documentationUrl: `${site}/llms.txt`,
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ["text/plain"],
    defaultOutputModes: ["text/plain"],
    skills: A2A_SKILLS,
  });
}
