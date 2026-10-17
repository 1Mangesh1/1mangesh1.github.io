import { test } from "node:test";
import assert from "node:assert/strict";
import { postDate } from "./post-dates.ts";

test("postDate prefers updatedDate and falls back to pubDate", () => {
  assert.equal(postDate('---\ntitle: "A"\npubDate: 2026-05-01\nupdatedDate: 2026-09-12\n---\nBody'), "2026-09-12");
  assert.equal(postDate("---\ntitle: 'B'\npubDate: '2026-03-04'\n---\n"), "2026-03-04");
  assert.equal(postDate("no front matter"), undefined);
});
