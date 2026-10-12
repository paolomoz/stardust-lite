# bms-home — register

## Triage (as authored by `first`, accepted)
| # | live section | block |
|---|---|---|
| 0 | header (top bar + nav row) | header (nav doc rewritten: logo image, 5 section links, Search, top bar links) |
| 1 | hero + Life + Science stories | default content (hero grid by CSS) + cards + default (button) |
| 2 | Areas of focus | default content (5 rows, grid by CSS) + columns (View more) |
| 3 | Pipeline + Latest press releases | columns (1 row × 2 cells) |
| 4 | empty row (h70) | empty section (min-height) |
| 5 | footer | footer (doc rewritten: icons as images) |

## Deviations
- Pipeline animated GIF (49.6 MB, over the AEM media limit) → still first frame JPG.
- Stats "49" / "40+" (104 px 300) are authored as one li text with the label; rendered at body size, label not right-aligned.
- Story cards: two tags (FEATURED, PATIENTS) authored as one p "Featured Patients" → one pill; the card link ("Learn more") visually hidden, the card is not a whole-card link.
- Areas of focus: the row link is the hidden italic link; the visible label "Learn more about …" is text, the row is not clickable.
- Header: mega-menu dropdowns not built (section items are plain links); mobile search / menu icons drawn in CSS; header does not hide on scroll; logo not linked.
- Footer: privacy-choices icon missing; group dividers (1440 border-left) not drawn.
- Buttons' arrow is a text glyph (→), not the source icon.

## Motion
- Header hides on scroll and re-pins sticky (live) — not reproduced.
