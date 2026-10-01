import { identity } from "../data/identity";

export function GET() {
  return new Response(
    JSON.stringify(
      {
        name: `${identity.name} | ${identity.headline}`,
        short_name: "by mangesh",
        description: `${identity.headline}. ${identity.tagline}`,
        start_url: "/",
        display: "minimal-ui",
        background_color: "#ffffff",
        theme_color: "#3b82f6",
        orientation: "portrait-primary",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
        categories: ["education", "technology", "developer"],
        lang: "en",
        scope: "/",
      },
      null,
      2,
    ),
  );
}
