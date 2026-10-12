# LINT — bny leadership (davids-model-lint, tools/lint/davids-model-lint.mjs)

| when | document | verdict | note |
|---|---|---|---|
| 18:57 | doc/leadership.author-draft.html (author --draft-new, tabs recipe) | PASS 0 🔴 0 🟡 | shape wrong, not a lint matter: a 1 × 2 `tabs` block (two labels in one row), the EC grid as 80 default-content elements, the Board panel absent |
| 18:57 | doc/leadership.html (sections-as-panels, first cut) | FAIL 1 🔴 | `<hr>` authored under "Quick Links" (#119): the rule is CSS on the heading now |
| 18:58 | doc/leadership.html | PASS 0 🔴 0 🟡 | 2 `cards.leadership` tables (20 + 12 rows × 2 cols), section-metadata `style` / `tab`, metadata |
| 18:58 | doc/footer.html (author --footer, simplest shape, icon-token duplicates removed) | PASS | |
| 19:07 | doc/nav.html (typed from content-view: brand, 4 items, tools) | PASS | |
| 19:38 | doc/leadership.html (Board panel's Quick Links added) | PASS 0 🔴 0 🟡 | harness lint on every run: PASS |

Harness `--content` check: 92 texts, 0 not in content-1440.json + hidden-1440.json.
