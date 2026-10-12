# LINT — harbourvest about (davids-model-lint on the three authored documents, step 2 and before every harness)

```
doc/about-harbourvest.html   PASS — 0 🔴, 2 🟡
  🟡 D1  section 1 → block "hero": single-column, 1-row block holding only prose elements — default-content candidate
  🟡 D4  7 authored SVG media references — batch-verify pure-vector (#99)
doc/nav.html                 PASS — 0 🔴, 1 🟡 (D4: 2 SVG media references)
doc/footer.html              PASS — 0 🔴, 1 🟡 (D4: 3 SVG media references)
```

- D1 (hero): kept as the Block Collection's hero shape — one cell with the picture, the eyebrow, the h1 and the lede; the picture
  bleeds and takes a measured gradient, the texts sit in a 2/3 grid column (`.hero`). Default content could not carry the overlay.
- D4: every SVG was fetched by `media-fetch` (icons) or extracted from the captured DOM as a brand asset (logo, footer logo, search,
  chevron, arrow, hamburger — inline `<svg>` on the source, no file to fetch); all are pure vector (no raster data URIs), previewed 200 on
  the branch host (`media/da-put.log`).
- `author` ran the lint at every write; the harness refused nothing (0 🔴 at every round).
