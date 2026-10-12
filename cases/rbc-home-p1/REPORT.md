# Report — rbc-home

Source https://www.rbc.com/about-rbc.html → https://blocks-first--sdt-rbc-p1--aemcoder-adobe.aem.page/drafts/rbc-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 38.77 % (Δh −6586) | 40.88 % (Δh −18155) | 30.54 % (Δh −18155) |
| prototype (r3, stop) | 6.54 % (Δh −43) | 3.94 % (Δh −5) | 2.36 % (Δh −5) |
| served | 6.62 % | 3.97 % | 2.37 % |

- t0 → stop 11.0 min; tool seconds t0 → stop 175 s (first 92, harness 13, rounds 23/24/23).
- Sections at 1440 (r3): banner 2.60 %, panels 2.39 %, callouts 9.43 % (Δh +2), about 2.58 %, operations 3.93 %.
- Leak: proto vs served identical at 360; at 1440 one line differs (header nav computed margin `0px 135px` vs auto — same box) — leak-*.txt.
- Lint: PASS, 0 🔴, 2 🟡 (D1 on the about articles cards; D4 SVG icons — preview 200, pure vector).
- Blocks: columns (banner, callouts), cards (panels, about articles, operation items), header, footer (foundation decorate). Section styles: banner, grey, callouts, about, operations.
