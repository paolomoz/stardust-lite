# LINT — canonusa support-article (davids-model-lint, step 2, before any block existed; re-run on the final documents)

## doc/about-consumer-support.html
```
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
```
## doc/nav.html
```
🟡 D4 doc/nav.html: 1 authored SVG media reference(s) — batch-verify pure-vector (an SVG embedding raster data URIs 409s the whole page's preview, #99): https://blocks-first--sdt-canonusa--aemcoder-adobe.aem.page/drafts/media/canon-logo-red.svg
PASS — 0 🔴, 1 🟡 (rules: ../davids-model.md)
```
## doc/footer.html
```
PASS — 0 🔴, 0 🟡 (rules: ../davids-model.md)
```

Notes: the first footer draft carried a 5-column `columns (links)` block (🟡 D10) — remodelled as default content (h3 + list ×5) the footer decorate groups; the nav's 🟡 D4 is the logo SVG, verified pure vector (no data: URIs). The harness's content check flags 3 texts "not in the capture": the three `<br>`-split paragraphs joined without a space — the dump holds them with a space (check artifact, texts are in the dump).
