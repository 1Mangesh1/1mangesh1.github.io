import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
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

test("rehypeImageAttrs reads the canvas size of an extended (VP8X) WebP", () => {
  const dir = mkdtempSync(join(tmpdir(), "webp-"));
  // RIFF header, then a VP8X chunk: canvas width - 1 and height - 1 as 24-bit little-endian at bytes 24 and 27.
  const b = Buffer.alloc(30);
  b.write("RIFF", 0, "ascii"); b.write("WEBP", 8, "ascii"); b.write("VP8X", 12, "ascii");
  b.writeUIntLE(639, 24, 3); b.writeUIntLE(479, 27, 3);
  writeFileSync(join(dir, "x.webp"), b);
  const img = { type: "element", tagName: "img", properties: { src: "/x.webp" }, children: [] };
  rehypeImageAttrs({ publicDir: dir })({ type: "root", children: [img] });
  assert.deepEqual(img.properties, { src: "/x.webp", loading: "lazy", decoding: "async", width: 640, height: 480 });
});
