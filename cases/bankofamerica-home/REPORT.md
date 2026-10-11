# bankofamerica-home — report

Source https://www.bankofamerica.com/ · site repo aemcoder-adobe/sdt-bankofamerica-lite (branch blocks-first) · stardust-lite fa62608.
Served: https://blocks-first--sdt-bankofamerica-lite--aemcoder-adobe.aem.page/drafts/bankofamerica-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round (from `first`) | 45.12 % (Δh -2797) | 43.82 % (Δh -7252) | 34.54 % (Δh -8396) |
| final prototype (r5) | 9.75 % (Δh -10) | 8.12 % (Δh -9) | 4.61 % (Δh -9) |
| served | 9.82 % (Δh -10) | 8.12 % (Δh -9) | 4.61 % (Δh -9) |

- Clock t0 → stop: 22.1 min (1323 s). Tool seconds t0 → stop (TIMING.log): first 123 + harness 13 + five rounds 177 = 313 s
  (+ two untimed section-view calls ≈ 30 s). Non-tool ≈ 16.5 min.
- Rounds: 5 (+ the first round inside `first`). Setup ≈ 1.5 min.
- Sections (1440, r5): #0 FDIC + header 4.8 %, #1 hero 5.2 %, #2 highlights + goals ≈ 9.8 % (band), #3 news + connect ≈ 7 %, footer 5.3 %.
- Leak: prototype and served identical at 360 and 1440 (leak/leak-{proto,served}-{360,1440}.txt, selectors leak-sels.txt).
- Lint: PASS, 0 🔴, 3 🟡 (LINT.md: hero rows of differing cell counts; SVG media batch-verify).
- Blocks: hero (masthead), cards (super / tiles / goals / connect variants), columns (news), header, footer.
