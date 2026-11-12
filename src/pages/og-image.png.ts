import { box, renderOgCard } from '../utils/og-image';
import { identity } from '../data/identity';

// The default social card, for every page without its own. It is built from the
// same identity data as the homepage hero, so the two always say the same thing.
export function GET() {
  return renderOgCard({
    title: identity.tagline,
    top: [
      box({ fontSize: 34, fontWeight: 700, color: '#111827' }, identity.name),
      box({ marginTop: 6 }, identity.headline),
    ],
    bottom: [box({ fontWeight: 700, color: '#047857' }, new URL(identity.links.site).host)],
  });
}
