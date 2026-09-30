# David's Model lint at step 2 (before any block existed) — 2026-09-30 22:08 CEST

```
== lint doc/home.html
🟡 D1 doc/home.html: section (unnamed) → block "alert": single-column, 1-row block holding only prose elements — default-content candidate (justify in the conversion log if it is a genuine bespoke widget)
🟡 D4 doc/home.html: 3 authored SVG media reference(s) — batch-verify pure-vector (an SVG embedding raster data URIs 409s the whole page's preview, #99): …/drafts/media/20260419-hp-healthpills-optimizediconcard-1.svg, …-2.svg, …-4.svg
PASS — 0 🔴, 2 🟡 (rules: ../davids-model.md)
exit 0
== lint doc/nav.html
🟡 D4 doc/nav.html: 1 authored SVG media reference(s) — batch-verify pure-vector …/drafts/media/branding.svg
PASS — 0 🔴, 1 🟡 (rules: ../davids-model.md)
exit 0
== lint doc/footer.html
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
exit 0
```

home: 0 🔴, 2 🟡. D1 `alert` (one row of prose) is a genuine widget: the source's Adobe Target alert is dismissable and remembers
the dismissal in `sessionStorage`; the block renders the close control and hides the section on the next load. D4: the four SVGs are
the source's own DAM icon files (quick-link glyphs) and the brand mark; verified pure vector (`grep base64|data:image` → none). nav: 1 🟡
(the same D4 for the brand SVG). footer: clean.

Unchanged afterwards: the documents were edited four times after step 2 (a `compact-head` section style on the photo section; the
`/widgets/*` links kept repo-relative; the promo-card copy grouped by source paragraph and the "Text JOINRX to 21525" word order
restored — the content dump joins a span's own text around its bold child; the footer's "Your Privacy Choices" icon authored as a
`:privacy-choices:` token instead of a picture inside the link, which the pipeline splits into its own paragraph). The harness re-ran
the lint on every round: same result (0 🔴, 2 🟡).
