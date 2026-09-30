# David's Model lint at step 2 (before any block existed)

```
== lint home
🟡 D1 doc/home.html: section (unnamed) → block "hero": single-column, 3-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
PASS — 0 🔴, 1 🟡 (rules: ../davids-model.md)
exit 0
== lint nav
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
== lint footer
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
```

home: 0 🔴, 1 🟡 — D1 "hero: single-column, 3-row block holding only prose" is the Block Collection hero shape (photo + text card); the
card is a genuine widget (product select + ZIP form built from the authored list and labels, fixed "Get a quote" bar on scroll).
Justified, kept. nav, footer: clean. The harness re-runs the same lint on every round (see REPORT.md for whether it changed).
