# NOTES — revlon-home (clock 10.45 min, tool time 117 s of it)

## (a) Tool friction (what · minutes · what would have removed it)
- `author` broke Best Sellers into 7 `carousel` tables with orphan pictures and badge paragraphs between them ("10 × 2 in 7 tables"). It left newsletter and spacer as `<!-- NEW: model this block -->` and kept "Pause slideshow", the arrow picture and `:icon:` star paragraphs as content. Cost **≈ 3 min** (a re-model script, plus one regex bug in it). Fix: author one row per repeating unit (×6, ×12 detected by triage) instead of per subtree; drop visually-hidden controls and nav-button media.
- Fonts: the spec-to-css drafts name the source's families (`'acumin-pro-regular'`, `'acumin-pro-bold'`, `'Acumin Pro'`), but fonts.css declares only `acumin-pro` 400/700. The whole first round rendered in serif fallback, and the fetched `acumin-rpro.woff` / `acumin-bdpro.woff` were never used. Cost **≈ 1 min**, plus a misleading first-round number. Fix: fonts step should declare a face for every family name in the spec's `fonts` list, mapped to the fetched file.
- nav.html: the authored brand section was empty, so the logo was missing. The pipeline dropped that empty section, so the header roles shifted: the link list became `.nav-brand` and search became `.nav-sections`. The harness re-upload check compares text only, so adding the logo picture to nav.html was not re-uploaded; I ran da-put by hand. Cost **≈ 1.5 min**. Fix: author the header logo (the measured first image) into the brand section, and compare markup, not text, in the harness check.
- media-fetch skipped the art-directed mobile slide images (`medium-up--hide` `<img>`s). The 360 hero band was 91 % with the desktop crop. Cost **≈ 1 min** (case script). Fix: fetch every `<img>` source per width, not only the visible desktop one.
- Smaller items:
  - No `carousel.js` after `first`, so a module 404 appeared in the harness log.
  - The carousel draft wrote `grid-template-columns: repeat(0, …)` at 360.
  - The header draft (`padding: 27px 0 45px` and 1 px gaps) and the footer draft (fixed heights only) were not usable, so both were written from the spec items. Cost ≈ 1 min.
  - The footer logo SVG has no fill and needs `filter: invert(1)`.

## (b) My own time (five largest chunks)
1. Reading the measurements: a dump script over spec-1440/360 items plus the newsletter band in content-*.json. ≈ 3 min.
2. Writing the CSS in one pass: styles.css, carousel (4 uses), hero, header, footer. ≈ 2.5 min.
3. Re-modelling the document: redoc.py, with one fix for a greedy picture regex. ≈ 1.5 min.
4. Diagnosing after r1: nav not re-uploaded, invisible footer logo, slide state, mobile art direction. ≈ 1.5 min.
5. Reviewing first's output: triage.md, doc, live vs build screenshots. ≈ 1.5 min.

## (c) Per round
- r1 (78/59/43 → 20.6/16.7/9.4): re-modelled the document and replaced the CSS drafts with spec-measured rules for every section and the chrome. The digest named Δh in the carousels (+1339, +1332, +2897). Root causes were the authoring split and the fonts, which the digest could not name.
- r2 (→ 8.95/1.70/0.96, stop): made four changes:
  - Slide 4 shown, with the mobile pictures. The digest named "spice things up" / slideshow 91 %.
  - Best-sellers padding: the draft's 360 `padding: 36px` was leaking. The digest named the +36 dy pair rows.
  - Logo uploaded to the nav, and the footer logo inverted. The digest did not name these; I found them in the band table (1440 0:72.9, 3600:29.1) and the screenshots.
  - The page bands moved accordingly.
