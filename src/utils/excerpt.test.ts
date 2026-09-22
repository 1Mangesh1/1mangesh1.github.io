import { test } from "node:test";
import assert from "node:assert/strict";
import { excerpt } from "./excerpt.ts";

test("drops fenced code and headings but keeps inline code as text", () => {
  const md = "# Optional chaining\n\n```js\nconst a = b?.c;\n```\n\nUse `?.` to read a nested key safely.";
  assert.equal(excerpt(md), "Use ?. to read a nested key safely.");
});

test("keeps link text and drops the URL", () => {
  assert.equal(
    excerpt("See the [Astro content docs](https://docs.astro.build/) for the schema."),
    "See the Astro content docs for the schema."
  );
});

test("short body is returned whole, with no ellipsis", () => {
  assert.equal(excerpt("A one line note."), "A one line note.");
});

test("cuts at a sentence boundary when one falls in the back half", () => {
  const md = "Postgres reuses a plan after five executions. That threshold is not configurable in any released version.";
  assert.equal(
    excerpt(md, 60),
    "Postgres reuses a plan after five executions."
  );
});

test("falls back to a word boundary with an ellipsis when no late sentence break exists", () => {
  const md = "Keycloak. Token exchange lets one client swap its access token for another audience without a fresh login.";
  // The 40-char clip ends flush with "client"; cutting back to the last space
  // drops it, since a clip cannot tell a whole word from a severed one.
  assert.equal(
    excerpt(md, 40),
    "Keycloak. Token exchange lets one…"
  );
});
