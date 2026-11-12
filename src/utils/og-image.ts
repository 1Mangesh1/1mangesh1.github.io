import { readFileSync } from "node:fs";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

// Satori reads TTF, OTF and WOFF, and no variable fonts. So the cards use static
// TTF cuts of the site font, read from disk: a build needs no network for them.
const fonts = ([400, 700] as const).map((weight) => ({
  name: "Atkinson Hyperlegible Next",
  data: readFileSync(`src/assets/fonts/atkinson-hyperlegible-next-latin-${weight}-normal.ttf`),
  weight,
  style: "normal" as const,
}));

type Style = Record<string, string | number>;

/** The element shape that satori renders. Text is a plain string, so a title is never parsed as markup. */
export interface OgNode {
  type: "div";
  props: { style: Style; children: string | OgNode[] };
}

/** A flex box. Satori requires `display: flex` on every element that has more than one child. */
export const box = (style: Style, children: string | OgNode[]): OgNode => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children },
});

export interface OgCard {
  /** The largest line on the card. */
  title: string;
  /** The rows above the title. */
  top: OgNode[];
  /** The row below the title. */
  bottom: OgNode[];
}

/** Renders a 1200x630 social card in the site's look: white ground, near-black type, emerald accent. */
export async function renderOgCard({ title, top, bottom }: OgCard): Promise<Response> {
  const card = box(
    { flexDirection: "column", width: "100%", height: "100%", padding: "64px 72px", backgroundColor: "#ffffff", color: "#111827" },
    [
      box({ flexDirection: "column", fontSize: 28, color: "#4b5563" }, top),
      box({ flexGrow: 1, alignItems: "center" }, [
        box({ maxWidth: 900, fontSize: title.length > 70 ? 54 : 64, fontWeight: 700, lineHeight: 1.12, letterSpacing: "-0.02em" }, title),
      ]),
      box({ alignItems: "center", fontSize: 26, color: "#4b5563" }, bottom),
    ],
  );
  const svg = await satori(card, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
