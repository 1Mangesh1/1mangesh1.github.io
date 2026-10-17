import { test } from "node:test";
import assert from "node:assert/strict";
import { rehypeImageAttrs } from "../lib/rehype-image-attrs.mjs";

test("rehypeImageAttrs reads the intrinsic size of a WebP in public/", () => {
  const img = { type: "element", tagName: "img", properties: { src: "/images/blogs/voice-agent/chat.webp" }, children: [] };
  rehypeImageAttrs()({ type: "root", children: [img] });
  assert.deepEqual(img.properties, {
    src: "/images/blogs/voice-agent/chat.webp",
    loading: "lazy",
    decoding: "async",
    width: 1352,
    height: 1600,
  });
});
