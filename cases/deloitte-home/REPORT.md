# deloitte-home — report

- Source: https://www.deloitte.com/us/en.html · site `aemcoder-adobe/sdt-deloitte-lite`, branch `blocks-first`, stardust-lite c9bd927
- Prototype: `http://localhost:8992/deloitte-home.harness.html` · served (preview only): https://blocks-first--sdt-deloitte-lite--aemcoder-adobe.aem.page/drafts/deloitte-home

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first (auto split) | 72.38 | 74.37 | 74.81 |
| r1 | 65.28 | 70.56 | 70.15 |
| r2 | 22.50 | 10.22 | 13.68 |
| r3 (stop) | **7.64** | **4.96** | **8.00** |
| served | 7.70 | 4.97 | 8.01 |

- Clock: t0 → stop 21.2 min (tool 456 s timed + harness runs about 20 s). Setup about 2.5 min.
- Sections: hero, embed (video stage), 3 title bars (default), cards, carousel, columns (careers), plus header and footer.
- Served cap-probe: FAIL at 2560 (live content cap 1512, build 1400), registered. The served row table is off by one split (run without `--triage`); its pixel numbers match the prototype.
- leak: prototype vs served at 1440 are identical (`leak-proto.txt`, `leak-served.txt`).
