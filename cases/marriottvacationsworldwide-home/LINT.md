# David's Model lint at step 2 (before any block existed) — 2026-10-01 08:37 CEST

```
== lint doc/home.html
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
== lint doc/nav.html
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
== lint doc/footer.html
🟡 D1 doc/footer.html: section (unnamed) → block "brand-bar": single-column, 2-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
PASS — 0 🔴, 1 🟡 (rules: ../davids-model.md)
exit 0
```

home: 0 🔴, 0 🟡 — the first lint of the generated document read one 🟡 (D3: the `carousel` rows had differing cell counts, 1 and 2 —
the two video rows had no text cell); the video rows got an empty second cell before the record above (the row shape is picture/link ·
text for every slide). nav: clean. footer: 0 🔴, 1 🟡 — D1 "brand-bar: single-column, 2-row block holding only prose" is two renditions
of one image bar (a 1300×162 horizontal bar at ≥ 768, a 320×217 stacked bar below): a widget that picks a rendition per width, not prose.
Justified, kept.

Unchanged afterwards: the document was edited once after step 2 (a `tiles` section style on the company-tiles section, whose rule was
later removed — the class stays, see REGISTER). The harness re-ran the lint on every round: same result (0 🔴, 0 🟡 for home).
Final re-run 2026-10-01 09:52 CEST: identical.
