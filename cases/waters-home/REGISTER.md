# waters-home — register

## Triage (as `first` drafted it, accepted; no row flipped)
Rows 1 (Back To Top), 4, 7, 10 (cmp-spacer) are empty sections. Blocks: cards (news cards; steps), accordion (link columns, Shop Online,
"What would you like to do?" tiles), columns (video + quote). The accordion label is wrong for all three (no panels — link lists / tiles);
kept to stay inside the clock; a rollout should rename them (link-list / tiles).

## Document edits (by hand, after `first`)
- Leading empty section (row 1 "Back To Top") removed — DA strips it on serve, the harness kept it (NOTES a3).
- Video poster: authored as a text link "Video" → the poster `picture` (play overlay not reproduced).
- SVG `<style>` text leaked as paragraphs (`.st0{fill:none…}`) removed from the page and the nav.
- Nav brand: text "Waters Corporation" → `:waters-logo:` icon (icons/waters-logo.svg = media/waters-logo-black.svg).

## Deviations
- Header search field and the 360 placeholder are drawn by `nav::before` (CSS content text), not an input. Header tool icons (My Waters,
  Quick Order, Cart, globe, account) absent — 30 px reserved.
- Quick Order SKU / quantity inputs not drawn; "Add to Cart" is a styled paragraph. "Contact Waters" under Quick Order hidden (not painted on the live).
- Icons missing (no assets fetched): `:layer-1:` (banner, Shop Online), the four tile icons, footer socials, external-link glyph (approximated by a 12 px outline square).
- Hero picture offset `top: -147px` (the live crop at 1440) — fixed px, not a focal point.
- "What would you like to do?" top rule (8 px #e3e6e9) read from the capture, not the spec.
- 360 logo 127×32 from 480 px (read from the 500 px capture); spec at 360 says 107×30.

## Motion
None reproduced (header nav drop-downs, hover states not built).
