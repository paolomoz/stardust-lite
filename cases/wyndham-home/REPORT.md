# wyndham-home — report (https://www.wyndhamhotels.com/en-uk → sdt-wyndham-lite, branch blocks-first)

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first (real capture, t+5.5) | 53.5 | 76.95 | 75.88 |
| prototype, last round r10 (t+27.0) | 12.92 | 8.97 | 9.02 |
| prototype excluding the live grey placeholders | 7.19 | 3.59 | — |
| served /drafts/wyndham-home (t+34.2) | 12.99 | 9.02 | 9.02 |

- Clock: t0 06:20:21Z; stop declared 06:48:42Z (28.4 min) without a `stop:` line — 360 held over 10 % by the live capture (NOTES).
- Tool seconds t0 → stop (TIMING.log): 633 s (first 102 + first-2 88 + 5 harness 59 + 10 rounds 384).
- Served = prototype within 0.1 pt; `leak` proto vs served: two lines differ only in the computed `auto` margin read-out.
- Sections 12 (+ header, footer); blocks: carousel (offers, all-brands, hotels), cards (brand logos), hero (discover).
- Preview: https://blocks-first--sdt-wyndham-lite--aemcoder-adobe.aem.page/drafts/wyndham-home
