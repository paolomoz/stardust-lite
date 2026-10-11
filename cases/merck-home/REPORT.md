# merck-home — report

Source https://www.merck.com/ → https://blocks-first--sdt-merck-lite--aemcoder-adobe.aem.page/drafts/merck-home (preview only).
stardust-lite 5d94383, branch blocks-first.

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 64.43 | 40.70 | 33.62 |
| final prototype (r4) | 38.00 | 34.18 | 21.70 |
| served | 37.98 | 33.91 | 21.54 |
| prototype vs a stitch-shot live capture (r3 CSS, evidence) | 26.17 | 15.85 | 7.32 |

- Clock: t0 03:38:06 → r4 04:00:38 = 22.5 min; tool seconds in that span 566 s (first 108, harness 11, rounds 4 × 26, origin probes 342).
- `stop:` never printed: the cached one-shot origin is not the page a reader sees (REGISTER #1). Section geometry matches the measured
  live DOM: every section top Δy 0 at 360 and 1440 (2560: −11 from the hero, fixed in r4), Δh 0 except related links (+20 at 360, +73 at 1440).
- Served = prototype (after one served-only fix); `leak` identical on both.
- Model lint: 0 🔴, 1 🟡 (hero holds only prose + picture — kept as a block: the text sits over the picture at ≥768 and below it on a band at 360).
- Blocks: hero; cards (audiences / stories / related); columns (feature, image-right, overlap); header; footer. carousel dropped (stories
  authored as cards); "About us" authored as a columns feature (triage had it as default content); "Read more stories" moved into the stories section.
