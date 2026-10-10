# toryburch-home — report

Source https://www.toryburch.com/en-us/ · site aemcoder-adobe/sdt-toryburch-lite · branch blocks-first · page /drafts/toryburch-home (preview only)
stardust-lite 16f69d6 (exp/five-min).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first (t0 + 2.9 min) | 68.6 | 81.35 | 82.05 |
| prototype at stop (t0 + 32.6 min, r4) | **5.05** | **3.09** | **0.32** |
| served (t0 + 35.1 min) | **4.87** | **3.09** | **0.34** |

- Clock t0 → stop: 32.6 min (1956 s); tool seconds in TIMING.log t0 → stop: ≈ 920 s (three `first` runs 516 s, four rounds 273 s, hero frames 117 s, harness 14 s).
- Setup (not counted): 21:34:14 → 21:35:23 by the shell stamps.
- Leak: `leak-proto-{360,1440}.txt` vs `leak-served-{360,1440}.txt` identical (16 wrappers).
- Blocks: carousel, columns, cards (decorate: an image cell may hold a desktop + a mobile picture), header / footer (foundation, CSS rewritten). Case script: `scripts/case/hero-frames.mjs`.
