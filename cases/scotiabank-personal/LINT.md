# LINT — scotiabank personal

`npx stardust-lite lint migration/cases/personal/doc/` (davids-model-lint, vendored) on the three authored documents, run at step 2
before any block existed (TIMELINE 09:3x) and again after the generator fixes:

```
🟡 D4 doc/nav.html: 2 authored SVG media reference(s) — batch-verify pure-vector: .../drafts/media/scotiabank-logo-red-desktop-200px.svg,
   .../drafts/media/scotiabank-logo-red-mobile-2023.svg
PASS — 0 🔴, 1 🟡
```

- The 🟡 is the SVG-media advisory (#99): both logos are pure vector (Illustrator exports, no raster data URIs); `da-put` previewed both
  with 200 and the branch host serves them.
- No row was refused. The tabs model (a `tabs` block whose panel k adopts the k-th following `cards (marketing)` block) lints as two
  containers in one section — the lint does not know the adoption; REGISTER.md names it.
