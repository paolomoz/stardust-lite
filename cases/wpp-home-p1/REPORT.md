# REPORT — wpp-home

Source https://www.wpp.com/en · site `aemcoder-adobe/sdt-wpp-p1` · branch `blocks-first` · served https://blocks-first--sdt-wpp-p1--aemcoder-adobe.aem.page/drafts/wpp-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round (`first`) | 52.81 % Δh 1485 | 75.53 % Δh −7612 | 52.67 % Δh −7612 |
| round 1 | 31.41 % Δh −367 | 1.75 % Δh −10 | 1.04 % Δh −10 |
| round 2 (stop) | **7.24 %** Δh −19 | **1.66 %** Δh 3 | **0.99 %** Δh 3 |
| served | **7.23 %** Δh −19 | **1.66 %** Δh 3 | **0.99 %** Δh 3 |

- Clock t0 → stop: 9.5 min (570 s), of which tool time 210 s (first 137, harness 7, r1 33, r2 33).
- Sections at stop (360): hero 0.23 %, our work 2.38 %, careers 17.83 %, latest insights 3.68 %, sustainability 19.47 %, news + footer under the page band (6300 band 12.1 %). 1440 / 2560: every band ≤ 11 % (the 1800 band, the our-work grid with live video frames).
- Leak (`leak-sels.txt`, 360 and 1440): prototype and served identical (`leak-proto-*.txt` / `leak-served-*.txt`).
- Lint: PASS, 0 🔴 0 🟡 (LINT.md).
- Blocks: cards (our work, 4-col grid with a 2-span video card), columns (careers 50/50 full bleed), carousel ×2 (insights, news); default content for the hero and the sustainability band; header (fixed pill) and footer fragments.
