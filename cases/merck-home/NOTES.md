# merck-home — notes

## (a) Tool friction
- The cached one-shot origin paints none of the lazy / parallax pictures at 1440 / 2560 and lays out the stories slider +206 / +346 px taller than the measured DOM; every band below stories is off and the stop line is unreachable — ≈ 9 min (two recaptures + reading); removed by: `first` capturing the origin with real scroll (stitch-shot) or checking the capture's section tops against the measured DOM and flagging the mismatch.
- The gate's live section rows come from the DOM measure while the pixels come from the screenshot; with this origin the rows said "Δy 0" while the pixels were 200–350 px apart — ≈ 4 min to reconcile; removed by: a per-section "capture vs DOM" Δy column.
- `first` authored the stories carousel from tiny-slider clones (slides 2–4 in one cell, "slide 1 to 5 of 3" as content) and left "Read more stories" as an empty section — ≈ 3 min document rewrite; removed by: dropping `tns-*` live-region / cloned slides in content-dump.
- `first`'s nav dump was a "Merck.com" text link and two empty lists (logo and the two buttons lost); footer icon tokens were split from their links — ≈ 3 min; removed by: reading button labels and the logo link into the nav doc.
- spec-to-css drafts were keyed by `nth-of-type` on first's section numbering and an "About us" default section; after re-sectioning they were wrong and I emptied sections-draft.css — ≈ 2 min; removed by: drafts keyed by block variant rather than section index.
- facebook-f-brands.svg has no viewBox — inlined at 26 px it showed only the top-left corner — ≈ 1 min; removed by: media-fetch adding a viewBox from width/height.
- The served page keeps the metadata section as the last `main > .section` (the harness drops it): a `:last-of-type` rule worked on the prototype and not served — ≈ 2 min (one extra served gate); removed by: the harness keeping the empty metadata section too.

## (b) My own time (non-tool), largest chunks
1. Diagnosing the origin defect (crops, teal-run scans, spec rows vs screenshot): ≈ 8 min.
2. Reading the first sbs / doc / drafts and deciding the re-sectioning: ≈ 4 min.
3. Writing the block CSS (hero, cards × 3, columns feature, header, footer) for round 1: ≈ 4 min.
4. Rewriting the document, nav and footer: ≈ 3 min.
5. Round 2 fixes from spec rows (stories 360 slider, feature box geometry, buttons): ≈ 3 min.

## (c) Per round
- r1: document re-sectioned (stories, About as feature, Read more into stories), nav / footer rewritten, all block CSS written from the spec rows. The digest named heights per section (all off); it could not name the structure problem (it reads the split as given).
- r2: hero 360 paddings (h1 309, link 521), buttons 16 24 / 700 16/16, audiences +32 bottom at 1440, stories 360 clip at 740 with a 237 stride, feature 1440 box 428 centred, 360 feature spacings, header 360 panel. Named by the digest rows (hero, Read more, About / Pipeline / Clinical rows) — all now Δ 0 to the DOM.
- r3: related title no longer a filled button (decorateButtons on a bold link), related 360 sizes, footer band full bleed, facebook viewBox, stories → Read more margin collapse (−36 named by the digest). Footer / related not named in detail (no spec rows for the related container — it sits outside main).
- r4: hero height min(56.25vw, 821px) (2560 −11 named), related → footer gap 112 only ≥768 (360 Δh named). Stopped: the rest is the origin defect.
