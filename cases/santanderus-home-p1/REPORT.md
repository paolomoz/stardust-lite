# REPORT — santanderus-home

- Source: https://www.santanderus.com/ · site repo aemcoder-adobe/sdt-santanderus-p1, branch `blocks-first` · DA aemcoder-adobe/sdt-santanderus-p1/drafts
- Served (preview only): https://blocks-first--sdt-santanderus-p1--aemcoder-adobe.aem.page/drafts/santanderus-home
- Clock: t0 20:24:20Z → stop 20:33:07Z = **8 min 47 s** (2 CSS rounds). Setup ≈ 1.5–2 min (not counted).

| gate | 360 | 1440 | 2560 | Δh 360 / 1440 / 2560 |
|---|---|---|---|---|
| first round | 54.04 % | 51.96 % | 46.13 % | -312 / -1390 / -1390 |
| r1 | 12.44 % | 12.45 % | 14.02 % | -2 / -13 / -13 |
| r2 (prototype, stop) | 5.65 % | 3.05 % | 4.10 % | -2 / 0 / 0 |
| served | 5.66 % | 3.08 % | 4.10 % | -2 / 0 / 0 |

Sections at r2 (1440): hero 2.3 %, purpose 5.1 %, about 1.3–5.1 %, news 6.2 %; 360 worst news & media 13.2 % (the slider's partial second card, link row).
Leak: prototype vs served identical on 17 wrapper selectors (`leak-sels.txt`, `leak-proto.txt`, `leak-served.txt`). Lint: PASS.
