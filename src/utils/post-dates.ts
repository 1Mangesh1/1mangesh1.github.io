import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The sitemap runs before content collections exist, so dates come from the front matter text.
export function postDate(text: string): string | undefined {
  const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? "";
  const get = (k: string) => new RegExp(`^${k}:\\s*["']?([0-9]{4}-[0-9]{2}-[0-9]{2})`, "m").exec(fm)?.[1];
  return get("updatedDate") ?? get("pubDate");
}

export function postDates(dir: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => /\.mdx?$/.test(f))
      .map((f) => [f.replace(/\.mdx?$/, ""), postDate(readFileSync(join(dir, f), "utf8"))])
      .filter((e): e is [string, string] => Boolean(e[1]))
  );
}
