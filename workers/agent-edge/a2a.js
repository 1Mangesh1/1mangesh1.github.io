// A2A (v1.0, JSON-RPC binding) front for the "Mangesh AI" chatbot. The chat
// worker keeps the model, site grounding, rate limit and logging; this only
// translates SendMessage into a chat request over a service binding.
const SITE = "https://mangeshbide.tech";

export const A2A_PROTOCOL_VERSION = "1.0";
export const A2A_SKILLS = [
  {
    id: "ask-about-mangesh",
    name: "Ask about Mangesh",
    description:
      "Answers questions about Mangesh Bide's experience, projects and writing, grounded in his resume and the pages on mangeshbide.tech.",
    tags: ["resume", "portfolio", "hiring"],
    examples: ["What does he work on now?", "Has he written about Keycloak?", "Does he know Kubernetes?"],
  },
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, A2A-Version, A2A-Extensions",
};

const rpc = (id, body) => Response.json({ jsonrpc: "2.0", id, ...body }, { headers: CORS });

export async function handleA2a(request, env) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") {
    return new Response("A2A endpoint: POST JSON-RPC SendMessage.", {
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
  const id = msg?.id ?? null;
  // "message/send" is the pre-1.0 name; accepting it keeps 0.3 clients working.
  if (msg?.method !== "SendMessage" && msg?.method !== "message/send") {
    return rpc(id, { error: { code: -32601, message: `Method not found: ${msg?.method}` } });
  }

  const message = msg.params?.message;
  const question = (message?.parts ?? [])
    .map((p) => p?.text)
    .filter((t) => typeof t === "string")
    .join("\n")
    .trim();
  if (!question) return rpc(id, { error: { code: -32602, message: "message needs at least one text part" } });

  // The chat worker checks Referer and rate-limits per CF-Connecting-IP, so pass
  // the site as referer and the caller's real IP through.
  const res = await env.CHAT.fetch("https://portfolio-ai-proxy/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Referer: `${SITE}/`,
      "CF-Connecting-IP": request.headers.get("CF-Connecting-IP") ?? "unknown",
    },
    body: JSON.stringify({
      question,
      sessionId: `a2a-${message.contextId ?? message.messageId ?? crypto.randomUUID()}`,
      history: [],
    }),
  });
  if (res.status === 429) return rpc(id, { error: { code: -32000, message: "Rate limit: 40 messages per hour per IP" } });
  if (res.status === 400) return rpc(id, { error: { code: -32602, message: await res.text() } });
  if (!res.ok) {
    console.error(`chat worker returned HTTP ${res.status}`);
    return rpc(id, { error: { code: -32603, message: "Chat service unavailable" } });
  }

  const { result } = await res.json();
  return rpc(id, {
    result: {
      message: {
        messageId: crypto.randomUUID(),
        contextId: message.contextId,
        role: "ROLE_AGENT",
        parts: [{ text: result }],
      },
    },
  });
}
