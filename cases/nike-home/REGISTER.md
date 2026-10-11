# nike-home — register

## Triage
- Row 1 "Jordan" (36 px topbar: Jordan / Converse marks, Find a Store | Help | Join Us | Sign In) → `drop` from main; re-authored as the nav's 4th section (`nav-extra-3`, desktop only, as live).
- Row 8 "Shoes" link lists: triage said accordion; authored as default content (h4 + ul); desktop four columns, 360 the collapsed label stack (lists hidden) — no accordion behaviour.
- `div.nav-css-a37jnq.base` (probe-load's modal hide) is NOT the nav — the real header (`HEADER nav-css-gpek3`) measured and captured normally; overlays.hide kept as is.

## Deviations
- Hero 1: live is a video (poster image authored); "Watch" (video play button) not authored — Shop CTA centred alone (x 144 vs 87 at 360).
- Swoosh, Jordan, Converse, heart, bag icons are self-drawn approximations (no source SVG copied).
- Header search is a link pill (no input); mega-menu panels authored as nested lists but not styled/opened (no hover panel).
- Footer: "United Kingdom" locale button and the Guides dropdown not styled; 360 footer columns collapsed to headings (lists hidden), height pinned to the measured 1132 / 710.
- Cards 360: the "See All" expander over the clipped third row not authored; the grid clips at 416 as live.
- Link lists Δh +20 at 360 / +56 at 1440 in the section table is the gap to the footer carried as section padding (doc heights match within 2 / 89 px).
- Card-wide overlay links (authored as `:slug:` icon tokens by `author`) dropped; the CTA carries the link.
- Art direction: hero/column cells carry two pictures (desktop, portrait); CSS swaps below 960.

## Motion
- Header hides on scroll in live (pins after a viewport); the build header is static. Not gated.
