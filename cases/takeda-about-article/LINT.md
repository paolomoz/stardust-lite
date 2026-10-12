# LINT — about-article (corporate-giving), step 2 model lint

`node node_modules/stardust-lite/tools/lint/davids-model-lint.mjs migration/cases/about-article/doc/corporate-giving.html` on the authored document (after `author` + `scripts/fix-doc.py`), and `npx stardust-lite lint migration/cases/about-article/doc/` on the three documents.

```
PASS — 0 🔴, 2 🟡 (rules: ../davids-model.md)
🟡 D1 hero: single-column, 1-row block holding only prose elements — default-content candidate
🟡 D1 cards (tiles): single-column, 2-row block holding only prose elements — default-content candidate
lint (3 docs): PASS — 0 🔴, 4 🟡 (the two above + D4 "authored SVG media reference, batch-verify pure-vector" on nav.html / footer.html — the Takeda logo, a pure-vector SVG from the source's DAM, previewed 200)
```

Justification of the two D1 rows: the hero is a picture with a heading painted over it (dark panel, red rule — a genuine bespoke widget; default content cannot layer them); the tiles are link cards (bg, red left bar, arrow icon, hover) — a `cards` variant, not prose.

First `author` run (before `--media-host`): 40 🔴 D4 "img src not fully qualified" — fixed by passing `--media-host <branch host>/drafts/media`; no model change.
`css-lint .`: 5 findings before the first harness (foundation selectors with 3 compounds reaching into a block's area: `main > .section > div`, `… > .hero-wrapper`, `…:has(> .default-content-wrapper:only-child)`, `main .default-content-wrapper h2(::after)`) → wrapped in `:where()`; clean afterwards (7 blocks).
