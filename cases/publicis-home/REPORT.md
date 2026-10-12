# publicis-home — report

Source https://www.publicisgroupe.com/en/splash-en · repo aemcoder-adobe/sdt-publicis-lite, branch blocks-first · draft
https://blocks-first--sdt-publicis-lite--aemcoder-adobe.aem.page/drafts/publicis-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 72.37 | 60.4 | 48.3 |
| r1 | 48.17 | 2.62 | 1.29 |
| r2 (stop) | 3.63 | 2.62 | 1.29 |
| served | 3.53 | 2.68 | 1.28 |

- t0 → first done 4.6 min (four `first` runs), t0 → stop 9.8 min, served 11.8 min. Setup ≈ 2 min.
- Tool seconds t0 → stop (TIMING.log): 291 s (first ×4 208 s, harness 3 s, rounds 80 s); untimed case probes ≈ 20 s.
- Served gate: tables CLEAN (Δh ≤ 2 every section), cap-probe PASS at 2560. Leak proto vs served at 360 / 1440: identical.
- Blocks: hero (NEW), quote (NEW); header from the foundation; footer empty (the page has none).
