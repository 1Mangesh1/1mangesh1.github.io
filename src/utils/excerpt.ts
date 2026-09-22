// Meta descriptions for collections whose frontmatter has no `description`
// field (til, books). Deriving one from the body beats a templated string:
// every page gets a distinct snippet instead of sharing the site default.

const MAX_LENGTH = 155;

export function excerpt(markdown: string, maxLength = MAX_LENGTH): string {
  const text = markdown
    .replace(/^---[\s\S]*?---/, "") // Drop frontmatter if the raw body still carries it
    .replace(/```[\s\S]*?```/g, "") // Fenced code says nothing useful in a SERP
    .replace(/`([^`]*)`/g, "$1") // Unwrap inline code — deleting it strands the
    // sentence around it ("the difference between and in JavaScript")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s*[>*+-]\s+/gm, "") // List and quote markers
    .replace(/^#{1,6}\s+.*$/gm, "") // Headings duplicate the <title>
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;

  // Prefer a sentence boundary, but only when one lands in the back half —
  // cutting at the first period would throw away most of the budget.
  const clipped = text.slice(0, maxLength);
  const lastStop = clipped.lastIndexOf(". ");
  if (lastStop > maxLength * 0.5) return clipped.slice(0, lastStop + 1);

  return clipped.slice(0, clipped.lastIndexOf(" ")).trimEnd() + "…";
}
