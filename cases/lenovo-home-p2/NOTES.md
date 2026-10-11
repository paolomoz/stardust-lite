# lenovo-home — notes

## (a) Tool friction (what · minutes · what would have removed it)
- Header / footer experience fragments split as main sections (rows 1 and 12 duplicate rows 0 and 13: same y, same height) · 2.2 (re-run 71 s + reading) · triage flags a row whose box equals the header / footer row as `drop` by default.
- Category strip (7 cards inside the hero's live range, y848–1216) not authored at all · 1.5 (finding it, links from dom, writing the block) · author should cover every unit inside a section's range (the card listed "div 178×159 ×7" but no doc rows).
- Hidden interactive panels authored as visible content (discover: +6897 px at 1440) · 1.0 · author / triage drop content that is display:none in the capture.
- Nav document impoverished: brand, the account list as "sections", an empty `<ul>`, the top-bar link; main nav links only in the dropped band · 1.0 · nav author from the header band's lists in role order.
- spec-to-css drafts keyed to the wrong unit (hero carousel drafted from the category cards: 194 px columns, centred p), sections-draft paddings for the first split · 0.5 (decided to discard all drafts) · drafts regenerated after a re-split, unit picked from the slide not the strip.
- fonts.css declared the variable Montserrat as two static faces (400, 700) → every 600 heading rendered 700 · 0.3 · media-fetch reads `fvar` and writes `font-weight: 100 900`.
- Stale tiles: sbs-2560-3..5 left from an earlier round (page got shorter) looked like the current build · 0.5 · gate deletes old sbs tiles per round.
- section-view has no 2560 · 0.3 (cropped live / build by hand) · `--widths`.
- Served-only: the gate's lazy-image scroll scrolls an `overflow: hidden` slider (served 1440 11.75 vs 8.67) · 0.5 · gate scrolls the window, not scrollIntoView; or a lint hint "overflow: clip" for sliders.
- Media: two helix SVGs preview 409 (served misses them) · 0 · registered.

## (b) Own time (largest non-tool chunks, t0 → stop ≈ 11 min of 16.5)
1. Writing block CSS (carousel, cards, columns incl. the case-study panel, footer) · ~4 min
2. Reading the live page (header / 360 / 2560 crops, colour boundaries, reading cards 1–9) · ~3 min
3. Writing styles.css (twice — the Write guard refused the first, the file was unread) + header.css · ~2 min
4. Document edits (categories block, discover trim, nav rewrite, nav hrefs from the DOM) · ~1.5 min
5. Reading the first output + sbs + doc, deciding the two drops · ~1 min

## (c) Per round
- first → re-split: rows 1 / 12 dropped (the digest named #0 "join lenovo pro" +727 and #11 the footer copy +1074 / +212).
- r1 (before): doc edits (categories, discover trim — digest #2 / #1 Δh +6897 named it), nav rewrite, all CSS rewritten from the cards
  and crops (every section named with Δh); sections-draft import dropped. Result 11.23 / 9.72 / 11.01.
- r2: rewards (#6, Δh +634 at 360 / +382 at 2560 — the digest named it; the cause was my selector: the art picture sits in its own
  default-content wrapper), discover pills 14 px and 360 heading caps (#1 at 360 named), event-card descriptions at 360 (#2 18.66 %),
  slider cards as 29.46 % of the cap and clipped at it (2560 #4 / #5 28–33 % — named), 4-up cells fluid (2560). Result 7.71 / 8.67 / 7.80 → stop.
