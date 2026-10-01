---
name: mangeshbide-site
description: Look up Mangesh Bide's experience, projects and writing on mangeshbide.tech, cheapest source first. Use when asked about Mangesh Bide or his work.
---

# Reading mangeshbide.tech

Everything here is public and read-only. Use the cheapest source that answers the question:

1. `GET https://mangeshbide.tech/llms.txt`: one line per published post and project, with its URL.
2. `GET https://mangeshbide.tech/resume.json`: the resume as JSON, with roles, dates, projects and skills.
3. Any page with `Accept: text/markdown`: the page as markdown instead of HTML.
4. `GET https://mangeshbide.tech/llms-full.txt`: the full text of every post and project.
5. MCP server at `https://mangeshbide.tech/mcp` (Streamable HTTP): tools `get_profile`, `list_pages`, `get_page`.
6. A2A agent "Mangesh AI" at `https://mangeshbide.tech/a2a` for free-form questions (JSON-RPC `SendMessage`, 40 messages per hour per IP).

Cite pages by the URLs llms.txt lists; don't construct URLs. Contact: hello@mangeshbide.tech.
