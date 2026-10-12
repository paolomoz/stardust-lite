# pgatour-home — report

Source https://www.pgatour.com/ · site aemcoder-adobe/sdt-pgatour-lite · branch blocks-first · stardust-lite f5d4a51 · preview https://blocks-first--sdt-pgatour-lite--aemcoder-adobe.aem.page/drafts/pgatour-home

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first (as split) | 33.37 % | 43.27 % | 22.67 % |
| first (re-triaged) | 47.97 % | 35.57 % | 18.99 % |
| r1 | 16.22 % | 14.40 % | 6.38 % |
| r2 (capture with broken images) | 26.48 % | 21.37 % | 9.98 % |
| r3 | 9.40 % | 10.35 % | 4.43 % |
| r4 — stop | **9.39 %** | **5.94 %** | **1.94 %** |
| served | 9.48 % | 5.96 % | 1.95 % |

Clock t0 → stop 17.05 min (tools 518 s = 8.6 min: first 197, re-triage 71, rounds 64/64/64/55, harness 3). Setup ≈ 1.5 min. Leak prototype vs served at 1440: identical.
Content model: 10 sections — 2 ad slots (embed), Latest (default content), Watch Now / Player Highlights / Watch / More News / Recent Stories (cards), weather band (cards + default), story list (columns). Model lint not run in this timed loop.
