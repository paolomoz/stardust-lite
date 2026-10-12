# marriott-home — register

## Triage (as run)
| # | live section | authored as |
|---|---|---|
| — | header.m-header (inside `main`) | nav fragment (brand · main nav · utility links), hand-moved from the `accordion` the draft put in main |
| 1 | search bar (Destination · dates · Find Hotels) | default content, pinned on scroll (scripts.js `pinSearchBar`) |
| 2 | hero | `hero` (two pictures: wide ≥ 768, portrait < 768 — the source's art direction) |
| 3 | Limited Time Offers | `carousel` |
| 4 | Become a Member | default content (card) |
| 5 | Find The Perfect Hotel | `carousel` |
| 6 | Your Next Adventure | `carousel` |
| 7 | app / careers / brands / link lists / dark band | default content + `carousel` (brands grid) |
| — | div.footer.aem-GridColumn (copyright + legal) | footer fragment |
Skip link section dropped (chrome).

## Deviations
1. The section 7 band of the source's footer (Top Destinations / For Guests / Our Company / Follow us, the link lists) stays in main section 7; only the copyright + legal row is the footer fragment (measure's footer root).
2. Search bar: the date value ("Sat, Oct 10 - Sun, Oct 11") and the mobile placeholder "Where next?" / "Dates" are not authored (runtime values); the bar shows "Where can we take you?" at every width.
3. Brand logos (portfolio icon font) and the header / social icons are not rendered: placeholders (24 px boxes / empty 36–60 px cells); link texts kept, visually hidden in the brand grid.
4. Member card icons (EARN FREE NIGHTS …) not rendered; the label cells keep their height.
5. Carousel controls (arrow, dots) and the chevrons in cards not built (no carousel.js).
6. `:marriot-bonvoy-logo:` icon has no SVG in /icons → 1 broken image at every width.
7. Hero mobile picture fetched separately (Classic-Ver rendition) and uploaded to drafts/media; the hero cell holds two pictures (model choice, D1 🟡 in lint).
8. Section heights are written as measured heights (spec boxes) — the content inside is close but the section height is pinned.

## Motion
- Pinned search bar: rides up with the page, holds at y5 as a full-width white band under a 5 px #1c1c1c strip; the header leaves the flow when it pins (page moves up 53 / 112) and scroll anchoring is off (`overflow-anchor: none`) — reproduces the source's stitched captures.
- Carousels: static (no slide motion, no autoplay).
