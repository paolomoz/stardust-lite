# waters-home — report

Source https://www.waters.com/nextgen/us/en.html (bot-managed: `--chrome` tier). Site aemcoder-adobe/sdt-waters-lite, branch blocks-first,
page `/drafts/waters-home` (preview only). stardust-lite @ 78fcbe3.

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 56.6 | 42.82 | 46.09 |
| prototype at stop (r3, t0 + 33.7 min) | 8.68 | 5.19 | 4.63 |
| served (t0 + 44.0 min) | 8.5 | 5.18 | 4.62 |

- Tool seconds t0 → stop: 435 s (first 107, harness ×3 104, rounds ×3 165, live re-capture 59). The rest (≈ 26 min) is reading / deciding / writing.
- Rounds after `first`: 3. Leak (1440, 8 selectors): prototype and served identical. Model lint: PASS, 0 🔴, 1 🟡 (SVG media verify).
- 360 is gated at a 500 px layout on both sides (see NOTES a2): the number is consistent but is not a 360 comparison.
