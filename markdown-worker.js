// Markdown for Agents without the Cloudflare Pro plan. Runs on the
// mangeshbide.tech/* route in front of GitHub Pages: a GET whose Accept header
// asks for text/markdown gets the page converted by Workers AI toMarkdown (free
// for HTML; it drops nav, header and footer). Every other request passes
// straight through. Deploy with: wrangler deploy -c wrangler.markdown.toml
export default {
  async fetch(request, env) {
    const wantsMarkdown = (request.headers.get("Accept") || "").includes("text/markdown");
    if (request.method !== "GET" || !wantsMarkdown) return fetch(request);

    const htmlRequest = new Request(request);
    htmlRequest.headers.set("Accept", "text/html");
    const page = await fetch(htmlRequest);
    // PDFs, llms.txt, feeds and error pages go back as they are.
    if (!page.ok || !(page.headers.get("Content-Type") || "").includes("text/html")) return page;

    // ponytail: converts on every request; cache per URL in caches.default if agent traffic grows.
    const result = await env.AI.toMarkdown({
      name: "page.html",
      blob: new Blob([await page.arrayBuffer()], { type: "text/html" }),
    });
    if (result.format === "error") {
      console.error(`toMarkdown failed for ${request.url}: ${result.error}`);
      return fetch(request);
    }

    return new Response(result.data, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
        "x-markdown-tokens": String(result.tokens),
        // The same usage terms robots.txt declares.
        "Content-Signal": "ai-train=no, search=yes, ai-input=yes",
      },
    });
  },
};
