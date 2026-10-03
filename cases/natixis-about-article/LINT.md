# LINT — natixis about-article (David's Model, `davids-model-lint.mjs`)

Run at step 2 on the authored document (`doc/diversity-equity-and-inclusion.html`), again after every regeneration, and by the harness before every fold.

```
PASS — 0 🔴, 3 🟡
🟡 D1 block "breadcrumbs": single-column, 1-row block holding only prose elements — default-content candidate
🟡 D1 block "hero": single-column, 1-row block holding only prose elements — default-content candidate
🟡 D1 block "in-page-nav": single-column, 1-row block holding only prose elements — default-content candidate
```

`doc/nav.html`: PASS — 0 🔴, 0 🟡. `doc/footer.html`: PASS — 0 🔴, 0 🟡.

## The three 🟡 D1 rows, justified

| block | why it is a block and not default content |
|---|---|
| `breadcrumbs` (1 × 1, an ordered list of the path) | the source paints it as a full-bleed grey bar (#f3f4f5, 45 px) with chevron separators and, at 360, collapses it to one back-link ("‹ About"); default content cannot change which item shows per width. Block Collection has `breadcrumbs`. |
| `hero (image-right)` (1 × 1: h1, p, picture) | the purple panel is 60 % of the content width behind the text with the photo overlapping it on the right at 1440 and a bleeding band that stops 64 px above the image at 360 — a composition, the Block Collection's `hero` shape (one cell). |
| `in-page-nav` (1 × 1: a list of anchor links) | a jump-link bar that becomes fixed at the top once scrolled past (scroll-probe: `ntx-in-page-nav--fixed` from y ≈ 722) and renders as a `<select>` at 360; the links are content, the behaviour needs JS. No collection shape (tabs is the nearest and wrong). |

Every other block has ≥ 2 columns or ≥ 2 rows: `cards` 5 × 2, `cards (facts)` 3 × 2, `cards (awards)` 6 × 2, `accordion` 3 × 2 / 3 × 2 / `accordion (invert)` 4 × 2, `columns (logos)` 1 × 4.

BACKLOG #13 (video link in a container row) did not apply: the page has no video.
