import { test } from "node:test";
import assert from "node:assert/strict";
import { isPublishedAt } from "./posts.ts";

const NOW = new Date("2026-05-16T12:00:00Z");
const mk = (pubDate: string, draft?: boolean) => ({
  data: { pubDate: new Date(pubDate), ...(draft === undefined ? {} : { draft }) },
});

test("draft true is never published, even if pubDate is past", () => {
  assert.equal(isPublishedAt(mk("2020-01-01T00:00:00Z", true), NOW), false);
});

test("future pubDate is not published", () => {
  assert.equal(isPublishedAt(mk("2026-06-01T00:00:00Z"), NOW), false);
});

test("past pubDate, not draft, is published", () => {
  assert.equal(isPublishedAt(mk("2026-05-01T00:00:00Z"), NOW), true);
});

test("pubDate exactly equal to now is published (boundary)", () => {
  assert.equal(isPublishedAt(mk("2026-05-16T12:00:00Z"), NOW), true);
});

test("draft undefined is treated as not-draft", () => {
  assert.equal(isPublishedAt(mk("2026-05-01T00:00:00Z"), NOW), true);
});

test("draft false with future date is still hidden", () => {
  assert.equal(isPublishedAt(mk("2099-01-01T00:00:00Z", false), NOW), false);
});
