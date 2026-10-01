// Fetches a page from the origin and converts it with Workers AI toMarkdown,
// which is free for HTML and drops nav, header and footer. Anything that isn't
// a successful HTML page comes back as { page } so callers can pass it through.
export async function fetchMarkdown(request, env) {
  const htmlRequest = new Request(request);
  htmlRequest.headers.set("Accept", "text/html");
  const page = await fetch(htmlRequest);
  if (!page.ok || !(page.headers.get("Content-Type") || "").includes("text/html")) return { page };

  const result = await env.AI.toMarkdown({
    name: "page.html",
    blob: new Blob([await page.arrayBuffer()], { type: "text/html" }),
  });
  if (result.format === "error") throw new Error(`toMarkdown failed for ${request.url}: ${result.error}`);
  return { markdown: result.data, tokens: result.tokens };
}
