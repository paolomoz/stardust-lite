# nfl-home — report (https://www.nfl.com/international → sdt-nfl-lite, branch blocks-first)

| | 360 | 1440 | 2560 |
|---|---|---|---|
| prototype (r9, harness) | 4.38 % | 3.20 % | 2.10 % |
| served (/drafts/nfl-home, preview) | 4.67 % | 3.22 % | 2.11 % |
| Δh served | -2 | 14 | 14 |

- t0 02:22:42Z → stop 02:50:43Z = **28.0 min**; served gate 31.2 min. Setup ≈ 1.2 min.
- Tool seconds t0 → stop (TIMING.log): 559 s (≈ 9.3 min) + ≈ 20 s unlogged (one harness, boxes.mjs).
- Rounds: 9 (r8 a broken document). Leak tables prototype vs served identical at 360 and 1440 (leak-*.txt).
- Blocks: teaser (+video), cards, promo (+center), headlines, ad-slot, team-picker, link-card; header / footer from nav.html / footer.html.
  Page layout: section style `rail` → `scripts.js buildRail` wraps the rail into an aside (desktop two columns, mobile `display: contents` + order).
- Lint: LINT.md (0 🔴).
- Case scripts: scripts/build-doc.py (document re-authoring from the pipeline's doc), specdump.py, boxes.mjs.
