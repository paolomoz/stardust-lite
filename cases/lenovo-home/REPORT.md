# lenovo-home — report

- Source https://www.lenovo.com/us/en/ (not bot-managed; bundled Chromium tier). Repo aemcoder-adobe/sdt-lenovo-lite, branch `blocks-first`,
  DA `aemcoder-adobe/sdt-lenovo-lite/drafts/lenovo-home`, preview https://blocks-first--sdt-lenovo-lite--aemcoder-adobe.aem.page/drafts/lenovo-home (never published).
- stardust-lite 6e05b5f. Setup ≈ 2 min (not counted). Clock t0 → stop **34.8 min** (target 5). Tool time in that span 691 s (11.5 min); the rest is reading / deciding / writing.
- Prototype at stop: **360 8.24 % · 1440 3.45 % · 2560 7.24 %** (Δh +443 / +143 / +89).
- Served (preview): **360 11.13 % · 1440 4.82 % · 2560 9.04 %** — 360 over the target on the served page (band 900–1800 12.8 % vs 2.9 % in the harness; 1440 band 1350 22.3 %): not chased (no polish rounds).
- leak: prototype and served identical on 13 wrapper selectors at 1440.
- Split: 8 page sections (hero carousel, discover prompt, cards, 3 × columns, 2 × slider carousels) + header / footer; 3 triage rows dropped
  (the promo callout overlay, the header and footer duplicated inside main).
- Rounds: 9 gate rounds + 1 harness re-run after a document edit.
