# cisco-home — notes

## (a) Tool friction
- spec-to-css drafts for sections with a background picture (cards #7, carousel #8, hero #5) put `picture { position: absolute; inset: 0 }` on EVERY picture in the block (tile icons and slide images became full-bleed backgrounds) and `> div { padding: 0 164px }` on each card — 2 min rewriting cards / carousel / hero from the spec; would be removed by scoping the background rule to the one picture the triage names as background (the trailing default-content picture), not to the block.
- styles.css stays the foundation placeholder (white background, black text, sans-serif, 80 px nav) and site.json is `{}` although measure had body #fff-on-#000 Inter and the header heights — most of the first round's 60 % was this; 1 min; `first` should fill the :root tokens from the spec.
- Author: the hero video got no media (poster URL present in dom-1440), the "Watch video" button was dropped, the tab list became `:icon:`, the accordion's first item fell outside the columns block and the three stats merged into two paragraphs — 3 min of document edits; would be removed by the author taking video posters as the picture and a heading+text list unit as one cell.
- section-view gives 360 and 1440 only — the 2560 residuals (hero cap 1600, callout 1340, glow) needed a hand crop of gate/live-2560.png; 1 min; add 2560 (all gate widths) to section-view.
- `first` served the harness on port 9000 (PROMPT says 8990) — no cost, the printed command was used.
- I tried to read gate/sections-2560.json `.blocks` (null) — 0.5 min; the cards INDEX had the numbers.
- A playwright probe needs to sit inside the site repo to resolve playwright (a /tmp script failed) — 0.3 min.

## (b) Own time (non-tool), largest chunks
1. Reading `first`'s output, triage.md, the drafts, the cards and spec-view 5–8 at 1440 / 360 — about 4 min (t+2 → t+4.5, t+5 → t+5.5).
2. Writing round 1 (document edits + styles.css sections + four block CSS files + header / footer) — about 2.5 min.
3. r1 → r2: reading sbs / hero crops at 360 and 2560, writing the r2 edits — about 2 min.
4. r2 → r3: section-view #6 / #7, the box probe, the columns / stats / carousel fixes — about 2 min.
5. r3 → r5: spec-view at 2560, the 2560 crop, the columns flow change — about 1.5 min.

## (c) Per round
- r1: page tokens (black bg, white Inter, 500 headings, nav 120/58), buttons (primary / secondary), every section's layout from the spec (alert band, tile nav, logo wall, tabs showcase, callout panel, tiles + stats, carousel track, news cards, end cap), header / footer. The digest named all sections (60 % everywhere) but the cause (unstyled page) was not named — read from the sbs.
- r2: hero 360 bottom padding (draft's 48), hero capped at 1600 for 2560, h3 rows in the tabs grid, carousel selectors (p margin hit the slide pictures, the CTA lost to a stronger rule), the callout as a band with a ::before panel (the gate measures the section box, a margin was outside it), footer grid on .footer, alert band #161616. The digest named #4/#5/#6 Δh; the margin-vs-box cause and the 2560 cap came from crops.
- r3: accordion p gap 24, stats `<br>` hidden (extra line), glow pictures 100 % high, carousel 360 top / bottom. Named by the digest (#5 +38, #6 +22, #7 +49) and section-view.
- r4: 2560 widths from spec-2560 (callout 1340, columns 504/625, tabs 1113, carousel h2 one line). Named by the digest (2560 Δh -66 / +72 / +56).
- r5: the CTA after the columns follows the accordion, not the image (image column taken out of flow); the tabs glow picture height. Named by the 2560 rows (#4 18 %, #5 +44).
