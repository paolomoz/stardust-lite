# lenovo-home — report

Source https://www.lenovo.com/us/en/ · repo aemcoder-adobe/sdt-lenovo-p2 (branch blocks-first) · stardust-lite a8b975a.
Served (preview only): https://blocks-first--sdt-lenovo-p2--aemcoder-adobe.aem.page/drafts/lenovo-home

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 36.71 | 46.61 | 29.78 |
| after re-split | 39.06 | 53.79 | 34.04 |
| r1 | 11.23 | 9.72 | 11.01 |
| r2 (stop) | **7.71** | **8.67** | **7.80** |
| served | 9.13 | 11.75 | 9.59 |
| Δh r2 (live − build) | -1 | -8 | -11 |

- Wall clock t0 → stop: 16 min 29 s. Tool seconds t0 → stop (TIMING.log): 315 s (first 142, first re-split 71, harness 11, r1 47, r2 44).
- Served 1440 over 10 %: bands 3150 / 3600 (the "Fueling" slider) 56.5 / 27 % vs 17 / 11.5 % on the prototype — the slider
  (`overflow: hidden`) was scrolled sideways on the served page (the gate scrolling lazy images into view scrolls the
  overflow box); `overflow: clip` removes it. Not fixed (no polish after the clock) — REGISTER R10.
- leak: prototype and served identical on the 9 wrapper selectors (leak-proto.txt / leak-served.txt).
- Lint: not run separately (first's triage step; the doc was edited by hand after it — see NOTES).
