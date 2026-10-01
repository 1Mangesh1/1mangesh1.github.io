# mangeshbide.tech auth.md

## Audience

Any AI agent, crawler or tool reading Mangesh Bide's public site.

## Registration

None. There is no account to create and no credential to obtain.

## Supported methods

Anonymous access only. Every page, file and endpoint below is public and read-only:

- Site pages, as HTML or as markdown with `Accept: text/markdown`
- `https://mangeshbide.tech/llms.txt`, `/llms-full.txt` and `/resume.json` (described by `/openapi.json`)
- MCP server: `https://mangeshbide.tech/mcp` (Streamable HTTP)
- A2A agent: `https://mangeshbide.tech/a2a` (JSON-RPC, limited to 40 messages per hour per IP)

## Credential use

Don't send credentials. An `Authorization` header is ignored, and the request is treated as anonymous.
