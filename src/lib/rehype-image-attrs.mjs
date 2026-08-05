import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { visit } from 'unist-util-visit';

/** Read intrinsic size from the file header. Covers the PNG/JPEG in public/images. */
function readSize(file) {
  const b = readFileSync(file);
  if (b.length > 24 && b.toString('ascii', 1, 4) === 'PNG') {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length - 9) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      // SOF0-SOF15, excluding DHT/JPG/DAC which share the range
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

/**
 * Markdown images render as bare <img>, so every screenshot in a post loads
 * eagerly and reserves no space. Adds lazy/async decoding plus intrinsic
 * width/height (which is what stops the layout shifting as they arrive).
 */
export function rehypeImageAttrs({ publicDir = 'public' } = {}) {
  const cache = new Map();

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      const props = (node.properties ??= {});
      const src = props.src;
      if (typeof src !== 'string' || !src.startsWith('/')) return;

      props.loading ??= 'lazy';
      props.decoding ??= 'async';

      if (props.width || props.height) return;

      if (!cache.has(src)) {
        const file = join(publicDir, decodeURIComponent(src));
        let size = null;
        if (existsSync(file)) {
          try { size = readSize(file); } catch { size = null; }
        }
        cache.set(src, size);
      }
      const size = cache.get(src);
      if (size) {
        props.width = size.width;
        props.height = size.height;
      }
    });
  };
}
