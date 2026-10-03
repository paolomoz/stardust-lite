# LINT — davids-model-lint on the authored documents (step 2)

Run: `node node_modules/stardust-lite/tools/lint/davids-model-lint.mjs doc/business.html doc/nav.html doc/footer.html` (also run by `author --draft-new` and by the harness before every fold).

| document | result | rows |
|---|---|---|
| doc/business.html | **PASS** — 0 🔴, 1 🟡 | 🟡 D1 section 1 → block `hero`: single-column, 1-row block holding only prose elements (picture, h1, p) — default-content candidate |
| doc/nav.html | PASS — 0 🔴, 0 🟡 | — |
| doc/footer.html | PASS — 0 🔴, 0 🟡 | — |

## 🟡 D1 hero — justified

The hero is a bespoke widget, not prose: the picture is painted as a cover background under a `linear-gradient(90deg, rgba(30,33,47,.62) 640px, rgba(30,33,47,0) 66%)` overlay with `mix-blend-mode: multiply` on a 388 px plate (`#282b3e`), the text column is 50 % of the 1200 cap, and the next block (`cards.tiles`) overlaps the plate by 48 px (360: 24 px). Default content cannot express the plate, the overlay or the overlap; the Block Collection's `hero` shape (one cell: picture, heading, paragraph) is exactly what the author types. Kept as a block.

## Shapes checked

- `hero` simple 1 × 1; `cards` container (tiles 3 × 2, icons 4 × 2, icons linked 2 × 2); `carousel` container (cards 3 × 2, articles 6 × 3); `columns` simple 1 × 2; `section-metadata` / `metadata` key-value. No row holds more than 3 columns; every property is one cell; no video links (BACKLOG #13 not hit).
