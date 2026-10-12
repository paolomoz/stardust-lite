# REPORT — revlon-home

- Source: https://www.revlon.com/ (Shopify; OneTrust consent; 1440 shell cap — at 2560 the whole page sits at x560 w1440).
- Site: https://github.com/aemcoder-adobe/sdt-revlon-lite, branch `blocks-first`; preview https://blocks-first--sdt-revlon-lite--aemcoder-adobe.aem.page/drafts/revlon-home (preview only, nothing published).
- Clock: t0 00:53:33Z → stop 01:04:00Z = **10.45 min** (target 5). Tool seconds t0 → stop: 117 s (first 70, harness 3 + 3, r1 21, r2 20); the rest (≈ 8.5 min) is reading, deciding and writing.
- Setup (not counted): ≈ 1.7 min.

| gate | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 78.42 | 58.73 | 43.20 |
| r1 | 20.61 | 16.69 | 9.38 |
| r2 (prototype, stop) | 8.95 | 1.70 | 0.96 |
| served (drafts, preview) | 8.83 | 1.63 | 0.92 |

Page height Δh 1 / 0 / 0 from r1 on. `leak` on the prototype and the served page: identical at 360 and 1440 (`leak/`).
Blocks: `carousel` (4 uses: hero slideshow, best sellers, new, featured categories — CSS only, a no-op carousel.js), `hero` (after-color band),
header / footer (foundation JS, CSS written here). Section style `newsletter`. Lint: 0 🔴, 1 🟡 (LINT.md).
Case scripts: `scripts/redoc.py` (re-model of the authored document), `scripts/mobile-pics.py` (the source's art-directed mobile slide pictures).
