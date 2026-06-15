import { test } from "node:test";
import assert from "node:assert/strict";
import { renderChatMarkdown } from "./chat-markdown.ts";

test("plain text passes through unchanged", () => {
  assert.equal(renderChatMarkdown("Mangesh builds backend systems"), "Mangesh builds backend systems");
});

test("empty input returns empty string", () => {
  assert.equal(renderChatMarkdown(""), "");
});

test("bold becomes <strong>", () => {
  assert.equal(renderChatMarkdown("**CrimiFace**"), "<strong>CrimiFace</strong>");
});

test("inline code becomes <code>", () => {
  assert.equal(renderChatMarkdown("Run `yarn dev` now"), "Run <code>yarn dev</code> now");
});

test("markdown link becomes a safe anchor", () => {
  assert.equal(
    renderChatMarkdown("[GitHub](https://github.com/1Mangesh1)"),
    '<a href="https://github.com/1Mangesh1" target="_blank" rel="noopener noreferrer">GitHub</a>'
  );
});

test("bare URL is autolinked, trailing period stays outside", () => {
  assert.equal(
    renderChatMarkdown("See https://mangeshbide.tech."),
    'See <a href="https://mangeshbide.tech" target="_blank" rel="noopener noreferrer">https://mangeshbide.tech</a>.'
  );
});

test("bare email becomes a mailto link", () => {
  assert.equal(
    renderChatMarkdown("hello@mangeshbide.tech"),
    '<a href="mailto:hello@mangeshbide.tech" target="_blank" rel="noopener noreferrer">hello@mangeshbide.tech</a>'
  );
});

test("newlines become <br>", () => {
  assert.equal(renderChatMarkdown("line one\nline two"), "line one<br>line two");
});

test("dash lines become an unordered list", () => {
  assert.equal(
    renderChatMarkdown("- Python\n- Django"),
    "<ul><li>Python</li><li>Django</li></ul>"
  );
});

test("raw HTML is escaped, never emitted as a tag", () => {
  const out = renderChatMarkdown("<script>alert(1)</script>");
  assert.ok(!out.includes("<script>"), "must not contain a live script tag");
  assert.equal(out, "&lt;script&gt;alert(1)&lt;/script&gt;");
});

test("javascript: scheme link is rejected, rendered as escaped text", () => {
  const out = renderChatMarkdown("[click](javascript:alert(1))");
  assert.ok(!out.includes("<a "), "must not produce an anchor");
  assert.ok(!out.toLowerCase().includes("href=\"javascript"), "must not produce a javascript href");
});

test("attribute-breaking quotes in a URL cannot escape the href", () => {
  // The double-quote is escaped before it can close the href attribute.
  const out = renderChatMarkdown('[x](https://e.com/"onmouseover="alert(1))');
  assert.ok(!out.includes('"onmouseover='), "quote must be escaped, not raw");
});
