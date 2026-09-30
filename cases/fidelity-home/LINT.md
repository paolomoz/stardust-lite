# David's Model lint at step 2 (before any block existed)

```
== lint home
🟡 D1 home.html: section (unnamed) → block "hero": single-column, 1-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
PASS — 0 🔴, 1 🟡 (rules: ../davids-model.md)
exit 0
== lint nav
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
== lint footer
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
```

home: 0 🔴, 1 🟡 — D1 "hero: single-column, 1-row block holding only prose" is the Block Collection hero shape (text over a photo); justified, kept.
nav, footer: clean. Not re-run with a different model; the document did not change after this point except for the footer "Search" link text (see report).
