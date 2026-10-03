# LINT — davids-model-lint on doc/ (run by `author`, by `lint doc/` after the edits, and by `harness`)

PASS — 0 🔴, 4 🟡 (rules: davids-model.md)

| level | finding | justification |
|---|---|---|
| 🟡 D1 | block "breadcrumbs": single-column, 1-row block holding only prose — default-content candidate | a navigation widget (labelled `nav`, chevron glyphs, mobile shows only the parent) — the Block Collection's breadcrumbs shape |
| 🟡 D1 | block "hero": single-column, 1-row block holding only prose | the cell holds the picture the text sits over; the collection's hero shape |
| 🟡 D1 | block "cards" (3 rows) holding only prose | each row is an elevated unit (bg, radius, shadow) laid out 3-up with the link pinned at the unit's bottom — not prose |
| 🟡 D1 | block "cards" (2 rows) holding only prose | same, 2-up |

css-lint: clean at the first harness (8 blocks); 2 findings after round 1 (`main .section.footnote > div`, a 3-compound foundation rule reaching into a block's area) → `:where(main .section.footnote) > div`; clean before the push.
