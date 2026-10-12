# nike-home — notes

## (a) Tool friction (what · minutes · what would have removed it)
- hero / columns drafts put `position: relative` + the picture `inset: 0` on the BLOCK, not the cell — both column images stacked over one another; drafted section paddings 492/497 px at 360 (the overlay text inset read as section padding) · ~3 · draft the overlay per cell (`.block > div > div`) and keep text insets inside the block.
- drafts and my first CSS styled CTAs as `strong a` / `a.button` while the foundation decorates `<p><strong><a>` into `p.button-wrapper > a.button.primary`; CTAs rendered unstyled and stacked at 360 · ~5 (one round) · spec-to-css should emit `p.button-wrapper` + `a.button` and the CTA row layout (inline, gap 6).
- art direction not authored: media-fetch already fetched the 360 portrait renditions (h_539) but `author` writes only the desktop picture; 360 stuck at ~30 % with "no shift explains it: rendition" · ~6 · when the 360 spec's src differs from 1440 for the same slot, author a second picture and draft the `p:has(>picture) ~ p` swap.
- chrome authoring: mega-menu content flattened inline into each top-level `li` (header 60 px with ~400 px of overflowing text); generic `:icon:` tokens (no file → broken images); topbar authored into main as an "accordion" section; footer one flat `ul` (headings as list items); card-wide overlay links authored as `:slug:` icon tokens (6 broken images) · ~5 · nest the menu (`li > a + ul`), name icons or drop them, put the topbar in nav as an extra section, split the footer at its column headings.
- cards draft: one column (image width 100 %, margin 88) although spec shows 8 × 72 px tiles a row, spread space-between, 3 a row at 360 clipped at 416 · ~2 · detect a uniform tile grid (x pitch) and draft `repeat(n, w) / space-between`.
- styles.css `:root` placeholders not filled from the spec (nav-height 80, section-gap 40, sans-serif) · ~1 · fill from chrome heights / the live section table.
- harness printed port 8991 (8990 already taken by another server) — the protocol's round command names 8990; used the printed one · 0.

## (b) My own time (non-tool), five largest
1. 360 rendition residual: reading digest, sbs, manifest → art-direction doc edit + CSS · ~5.5 min (r3 → harness3).
2. 360 CTA / hero 2 diagnosis after r2 (sbs-360 crop, proto DOM grep for the decorated button markup) · ~5.5 min (r2 → r3).
3. Reading split / sbs / specs, deciding the topbar drop and header strategy · ~2.5 min (first → first-redo).
4. doc-fix.py (nav nesting, tools, topbar section, footer columns, card labels), self-drawn icons, header/footer/cards/rhythm CSS · ~2.6 min (first-redo → harness1).
5. hero / columns rewrite from spec rows at 360/1440/2560 · ~1.1 min (r1 → harness2).

## (c) Per round
- first-redo: triage row 1 (topbar) `drop` — it is header chrome; the split named it as an accordion section in main.
- r1: doc-fix.py (case script) re-models nav/footer/cards; topbar moved into nav as a 4th section (`nav-extra-3`); header grid top 36 + 60 bar, cap 1920; footer 5-track grid; cards tile grid; page rhythm (8 / 16 gaps, 84 / 48 / 56); link lists (4 × 184 clipped at 196, 52-px labels at 360). The digest named cards (Δh +7508) and the topbar; header/footer it did not (chrome not in the section table) — sbs showed them.
- r2: hero + columns per cell (aspect 1440/700 & 360/539; square cards, 100 % − 96, gap 12); dropped `:slug:` overlay-link paragraphs. Digest named the columns Δh at 360 and 1440/2560 heights.
- r3: CTA selectors; hero 2 inset 24 + left at 360; cards clip 416. Digest named the Shop/Explore pair rows (x and size).
- r4: second (portrait) picture per hero/column cell + swap below 960. Digest said "no shift explains it: rendition" — it named the class of fault, not the cause; the manifest showed the h_539 renditions.
