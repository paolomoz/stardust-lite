# bms-home — notes

## (a) tool friction
- harness did not re-upload the edited doc/nav.html and footer.html nor refresh proto/drafts/*.plain.html (PROMPT says it does): DA PUT + preview + fetch .plain.html + its media_* files by hand — 1.5 min — the harness diffing doc/{nav,footer}.html against the served plain and re-uploading + re-fetching.
- da-put media: a 49.6 MB animated GIF (pipeline) is over the AEM limit; `first` showed a ✗ in the table but authored the doc with the GIF src anyway → broken image at r1 — 1 min (ffmpeg first frame → JPG, upload, edit doc) — media step transcoding oversized GIF to a poster / MP4 and rewriting the src, and failing loudly.
- spec-to-css put the 360 section insets (`main .section:nth-of-type(n) { padding }` in a max-width query) into cards.css / columns.css; rewriting a block draft lost them, and the sections-draft rules below the styles.css mark have the same specificity as rules above it so they win — 1 wasted round (r3) + 1 min — section insets all in the sections-draft part (both widths), and the mark's rules at :where() specificity.
- header draft: the skeleton's `align-items: center` on nav collapses a content-less ::before bar to 0 h; no draft for the top bar (div.topnav h46 #be2bbb) — 1 min probe — header draft painting a measured full-width bar.
- author: Areas of focus (5 × h3 / p / link units) left as flat default content with the label and the link split ("Learn more about Oncology" p + italic "Oncology" link, buttonised by decorateButtons), the triage's `columns 5 × 1` holding only "View more"; the footer social icons authored as `:icon:` text; the nav as an empty `<ul>` and a text logo — 2 min writing nav / footer docs and grid CSS on default content.
- h1 wrapped to 4 lines: "changing impact." measures 397.1 px in a 397 px column (live box is fractional) — 1 min — spec-to-css / digest flagging a line whose text width is within 1 px of its box.

## (b) own time (largest chunks)
1. Reading spec rows (header, sections 1–3, footer at 1440 / 360 / 2560) — 4.5 min.
2. Writing CSS (styles.css top part, cards, columns, header, footer) — 3 min.
3. Reading `first` output, triage.md, doc and the side-by-side — 2 min.
4. Header bar debug + GIF still + nav/footer plain workaround — 1.5 min.
5. h1 wrap diagnosis (canvas measureText) — 1 min.

## (c) rounds
- r1: everything at once from the spec — hero grid (397 | 509 | 350), pills, cards tag/caption, areas grid (332 | 664 | 332), pipeline (551 | 664, press list 996 | 332), header (top bar + row, cap 1328), footer grid; nav / footer docs rewritten. Digest named section heights only; the visual was read off the side-by-side.
- r2: header bar (::before align-self), h1 margin-right, the buttonised area link hidden, 360 button gap, 360 section insets, GIF → JPG. Digest named #0 Δh and the hero rows at 360 (y −40/−56) — the inset that did not apply.
- r3: 360 inset specificity attempt (`main > .section` — same specificity, still lost), h1 margins, header border. Digest again named the 360 hero row y −40 (correct). 1440 got worse: h1 wrapped to 4 lines — not named by the digest (its rows are 360 only).
- r4: `body main > .section` for the 360 insets; h1 margin-right −2px. Stop.
