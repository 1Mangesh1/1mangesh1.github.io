// Minimal, dependency-free Markdown -> safe HTML for streamed chat answers.
//
// The input is untrusted LLM output, so we HTML-escape FIRST, then layer a
// small set of inline transforms on top. Code spans and links are stashed
// behind a null-byte sentinel (which HTML-escaped text can never contain) so
// later passes can't double-process or break their markup -- e.g. autolinking
// a URL that already lives inside an <a href>.

const SAFE_LINK_SCHEME = /^(https?:\/\/|mailto:)/i;
const NUL = String.fromCharCode(0);
const PLACEHOLDER = new RegExp(NUL + "(\\d+)" + NUL, "g");

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function anchor(href: string, text: string): string {
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
}

export function renderChatMarkdown(input: string): string {
  if (!input) return "";

  // Strip stray sentinels from input so our placeholders stay unambiguous.
  let text = escapeHtml(input.split(NUL).join(""));

  const tokens: string[] = [];
  const stash = (html: string): string => NUL + (tokens.push(html) - 1) + NUL;

  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, (_m, code) => stash(`<code>${code}</code>`));

  // Markdown links: [label](url) — only http(s)/mailto survive.
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const href = url.replace(/&amp;/g, "&");
    return SAFE_LINK_SCHEME.test(href) ? stash(anchor(href, label)) : m;
  });

  // Bare URLs (trailing sentence punctuation kept outside the link).
  text = text.replace(/\bhttps?:\/\/[^\s<]+/g, (url) => {
    const clean = url.replace(/[.,;:!?)]+$/, "");
    const href = clean.replace(/&amp;/g, "&");
    return stash(anchor(href, clean)) + url.slice(clean.length);
  });

  // Bare emails -> mailto.
  text = text.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    (email) => stash(anchor(`mailto:${email}`, email))
  );

  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Bullet lists: runs of lines starting with "- " or "* ".
  text = text.replace(/(?:^|\n)((?:[-*] .*(?:\n|$))+)/g, (_m, block) => {
    const items = block
      .trim()
      .split("\n")
      .map((l: string) => l.replace(/^[-*] /, "").trim())
      .filter(Boolean)
      .map((item: string) => `<li>${item}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  // Remaining newlines -> <br>.
  text = text.replace(/\n/g, "<br>");

  // Restore stashed tokens, looping for nested cases (e.g. code inside a link).
  for (let pass = 0; pass < 3 && PLACEHOLDER.test(text); pass++) {
    PLACEHOLDER.lastIndex = 0;
    text = text.replace(PLACEHOLDER, (_m, i) => tokens[Number(i)] ?? "");
  }

  return text;
}
