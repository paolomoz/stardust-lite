# David's Model lint at step 2 (before any block existed)

```
== lint home
🟡 D1 doc/home.html: section (unnamed) → block "hero": single-column, 3-row block holding only prose elements — default-content candidate
🟡 D1 doc/home.html: section (unnamed) → block "hero": single-column, 3-row block holding only prose elements — default-content candidate
PASS — 0 🔴, 2 🟡 (rules: ../davids-model.md)
exit 0
== lint nav
PASS — 0 🔴, 0 🟡
exit 0
== lint footer
PASS — 0 🔴, 0 🟡
exit 0
```

home: **0 🔴, 2 🟡** — both D1 rows are the two `hero` instances (Block Collection hero shape: picture rows + one content row).
Justified, kept: `hero (video)` is a genuine widget (a hosted Dynamic Media player behind a poster of the frame the live page shows, a
different picture below 768, click-to-play iframe), `hero (banner)` is a full-bleed picture pair (desktop / mobile asset) with the copy
laid over the picture at a fraction of its height — default content cannot place text over an image. nav, footer: clean.
The harness re-ran the lint on every round (document edits: `padded` on the Our-focus section, `flush` removed from Awards, three card
descriptions corrected to the captured text, `nav`/`footer` metadata rows): same result every time.
