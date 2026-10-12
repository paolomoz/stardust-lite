# LINT — citizensbank about-article

## David's Model lint (triage time = author output, step 6)
First `author` run (exit 2):
- 🔴 D15 `doc/sustainability-impact.html`: inline-script text visible as content (`© document.getElementById('copyright')…` — the live
  copyright year is written by a script and the dump lifted the script text). Fixed in the document: the rendered text
  "© 2026 Citizens Financial Group, Inc. All rights reserved. Citizens Bank, N.A. Member FDIC", moved to the footer document's third
  section (the live disclosure sits after the footer in the DOM).
- 🟡 D1 `doc/sustainability-impact.html`: `columns` single-column 1-row block holding only prose — the author put the hero's h1 + p in
  the section as default content and the picture alone in the block. Fixed in the document: one row, two cells (text | picture).

`lint doc/` after the fixes: **PASS — 0 🔴, 2 🟡** — D4 ×2: an authored SVG media reference (the logo) in nav.html and footer.html,
"batch-verify pure-vector": verified, `grep -c data:image` = 0.

Harness fold lint on the served document: PASS — 0 🔴, 0 🟡.

## css-lint (before the first harness)
- 1 finding: `styles/styles.css:57 foundation rule with 3 compounds reaching into a block's area: "main > .section > div"` → wrapped as
  `:where(main > .section) > div`. Clean after (7 blocks). Clean after every round.
- Not caught (cost round 1 and round 3): `footer .footer > div` (0,1,2) beating `footer .footer-1` (0,1,1) inside the same block file,
  and the same selector matching the block element `.footer.block` as well as the inner container; `.columns.hero > div` (0,2,0)
  beating the mobile `.columns > div` (0,1,1) in the same file.

## Content check (harness)
36 texts, 0 not in `content-1440.json`. Author stderr table: 8/8 cells for both cards blocks, 2/2 for columns, 1/1 (then hand-fixed) for the hero.
