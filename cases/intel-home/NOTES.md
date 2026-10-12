# intel-home — notes

## (a) tool friction
- `first`'s section guess matched header-EF / main / footer-EF (main existed but the guess went above it): 3 sections, the whole page as one carousel, the footer duplicated as a page section. ~7 min (reading structure-1440, a DOM outline script, re-run). Would remove: guess from `main`'s descendant grid (`main … .aem-Grid > .aem-GridColumn`) before `body > …` when a `<main>` exists.
- The default author recipe for a repeating unit put the slide contents as default content above the block and only the background words in the carousel rows; the news cards default content + one row in `columns`. ~4 min to rewrite the document by hand (python). Would remove: author the unit (picture | texts | extra text) as one row per unit when triage counts unit ×N.
- `harness --serve .` refused (the `first` server serves `proto/`); the message says "kill it or pass another --port" instead of "pass --serve proto". ~1 min. Would remove: name the served dir in the refusal, or default --serve to the running server's root.
- The harness did not regenerate `proto/drafts/nav.plain.html` from the edited `doc/nav.html` ("chrome fragments are read from ./"). ~1 min, wrote it by hand. Would remove: rebuild the local chrome fragments from doc/*.html on every harness run.
- Harness markup ≠ served markup: the served pipeline wraps each picture in `<p>`, the harness keeps a bare `<picture>`; a `picture:first-child` rule passed the prototype gate and failed the served one (360: 9.67 → 15.25). ~3 min. Would remove: the harness emitting the pipeline's `p > picture`.
- The live capture repeats the sticky header at every 900 px frame; the build capture is a single frame, so a sticky header cannot match (≈ 88 px of every band at 1440, the residual in band 3600 at 20–25 %). Registered, not fixed.

## (b) own time (non-tool, ≈ 12.6 min of the 17.1)
1. Diagnosing the bad split + deciding the 4-section selector (structure, DOM outline, screenshot crops): ~5 min.
2. Rewriting the document (carousel rows, news columns, tiles cleanup, nav) : ~3 min.
3. Writing round-1 CSS for carousel / columns / cards / header / sections from the crops and drafts: ~3 min.
4. Reading sbs crops for 360 (slides 2 & 4, news, tiles) and the spec-360 rows for news / tiles: ~2.5 min.
5. Header sticky investigation (playwright computed-style check): ~1 min.

## (c) per round
- r1: hand-written doc + all block CSS (one 900 px scene per slide, card absolute at 1440, stacked at 360; news 3 columns with rules; tiles 4 × 306). 360 44 → 14.9, 1440 65 → 5.9. The digest named the hero Δh -892 and the column/cards heights.
- r2: button margin selector (`.button-wrapper`, not `strong > a`), tighter glow, word lower, mobile news/tiles padding. The digest named CTA dy and the news x/width (282). Small win (14.28) — the slide-2 badge was the real gap, the digest said "rendition / scale" without naming the source's 360 rendition.
- r3: the 360 renditions authored as a second picture per slide, eyebrow hidden at 360. 12.12. Not named by the digest beyond "rendition"; found in the sbs.
- r4: per-slide top drift (190/202/218/234), h2 → p 8, news card spacing from spec-360 rows (24 + rule + 24), tiles 97 tall 12 apart, h2 brand square, news→tiles 120+1+120. Digest named the news (+46) and tiles (+110) Δh and the pair rows. 9.67 → stop.
