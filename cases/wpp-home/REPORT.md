# wpp-home — report

Source https://www.wpp.com/en · repo aemcoder-adobe/sdt-wpp-lite (branch blocks-first) · stardust-lite 07bd330.

| | 360 | 1440 | 2560 |
|---|---|---|---|
| `first` round | 59.12 % | 75.57 % | 52.69 % |
| r1 (prototype, harness) | 4.81 % | 3.94 % | 2.64 % |
| served (aem.page /drafts/wpp-home) | 4.80 % | 3.92 % | 2.63 % |

- Clock t0 → stop 9.7 min (target 5); tool seconds t0 → stop 260 s (first 204, harness 8, r1 48); one CSS round.
- Setup ~1.2 min. Served gate +2.3 min after stop; leak diff prototype vs served: none.
- Blocks: cards (our work mosaic), columns (careers band), carousel ×2 (insights, news); header pill and footer from the chrome documents; videos decorated from `.mp4` links.
- Largest residuals: 360 band 1800–2700 (careers image crop / our-work title line boxes, 18 %), 1440 band 3600–4050 (insights, 10 %).
