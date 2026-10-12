# REPORT — lenovo-home

- Source https://www.lenovo.com/us/en/ · site aemcoder-adobe/sdt-lenovo-p1 · branch blocks-first · page /drafts/lenovo-home (preview only).
- Clock: t0 21:58:39Z → stop 22:32:04Z = **33.4 min** (target 5). Tool seconds t0 → stop (TIMING.log): first 153 + first2 69 + six rounds 268 = **490 s (8.2 min)**; the other ~25 min are reading / deciding / writing CSS.
- Prototype (harness, r6): **8.04 / 4.90 / 5.49 %** at 360 / 1440 / 2560. Served: **8.04 / 4.88 / 7.73 %**.
- Triage: 13 → 10 sections (rows 1 promo popup, 2 header band in main, 13 footer duplicate → `drop`). Blocks: carousel (hero, discover paint, fueling, browse), cards (powering, rewards paint), columns (powerhouse, promotions, formula), header, footer.
- Leak: `leak-harness.txt` and `leak-served.txt` identical (10 selectors, 1440).
- Section % at stop (360 / 1440 / 2560): #0 29.8 / 8.2 / 2.0 · #1 18.9 / 16.3 / 12.8 · #2 1.0 / 1.5 / 15.6 · #3 4.5 / 3.6 / 2.9 · #4 2.3 / 2.9 / 6.2 · #5 5.5 / 2.7 / 7.6 · #6 4.7 / 4.3 / 3.6 · #7 3.6 / 3.1 / 2.1 · #8 5.8 / 4.6 / 4.0 · #9 9.3 / 4.1 / 2.4.
