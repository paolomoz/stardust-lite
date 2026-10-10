# Loop — five minutes to a page under 10 %

Branch `exp/five-min`. Target: from the first instrument (t0) to a prototype under 10 % pixel difference at 360 / 1440 / 2560 in **5 min**.
Up to 20 iterations, started 2026-10-10. Each iteration: change what the last run's clock says is the bottleneck, check it on the replay bench
(`scripts/bench.mjs`) when it touches the gate, the capture or the generator, then one timed field run on a page never run, alone on the machine.
A change stays only if the clock or the bench says it removed time; otherwise it is reverted and the row says so.

Sites: the Exec Forum Boston campaign shortlist (`~/stardust/2026-09-exec-forum-boston/campaign/migration-shortlist.csv`), already-run and
on-EDS sites excluded, order drawn with seed 20261010; a site that refuses the crawl at the precheck is skipped and named. Home pages.
Repos `aemcoder-adobe/sdt-<slug>-lite` (an `sdt-<slug>` repo may belong to another project), work dirs `~/stardust/2026-10/sdt-<slug>-lite`.

Order: Marriott, Publicis, Tory Burch, Deloitte, BMS, Equitable, WPP, PGA TOUR, Revlon, Sherwin-Williams, Hasbro, Intel, NFL, Nike, Merck,
McGraw Hill, Santander US, United Rentals, Telus, RBC, Wyndham, Waters, Omnicom, Lenovo, …

## Clock per run (minutes from t0)

| run | site | code | first prototype | under 10 % (stop) | served | rounds | round s | model / tools to served (turns) | main bottleneck read from the run |
|---|---|---|---|---|---|---|---|---|---|
| I1 | si.edu home | 35f9b73 | 17.3 | never | 56.8 | 10 | 103–119 | 37.9 / 26.6 to close (119) | capture unstable, polish past the target |
| I2 | acs.org about | d58b9f8 | 15.8 | 35.1 | 38.1 | 8 | 75–79 | 16.4 / 21.7 (108) | CSS by hand 10 min, WAF fonts, document repair |
| I3 | continental.com en | 0decf6c | 11.2 | 25.1 | 27.8 | 7 | 57–64 | 14.3 / 11.6 (102) | rounds (7 × ≈ 2 min), ≈ 100 turns, document repair |
| L3 | toryburch.com en-us | 16f69d6 (unroll, section coverage, empty chrome, fast local captures) | 9.6 after 3 × `first` (62 / 83 / 79 %) | 32.6 | 35.1 | 4 | 67–69 | own ≈ 17 min, tools 15.3 to stop | two popups (locale, a delayed welcome modal) measured as sections — two extra `first` runs, ≈ 9 min; a hero video frozen on a different frame per width ≈ 4 min; the CSS pass on a 5-section commerce page ≈ 10 min |
| L2 | publicisgroupe.com en | eb6b282 (one-shot capture, chrome guess, free port, scoped blocks) | 4.6 (72 / 60 / 48 %) | **9.8** | 11.8 | 2 | 40 | ≈ 5 min own + 4.9 min tools to stop | 3.5 of the 9.8 min were `first` failing: a page scrolling inside main (captures 900 px tall), the hero missing from the split, no footer (author wrote none, da-put / harness exit), a busy port (IPv6 listener) |
| L1 | marriott.com en-gb | e0e3428 (`first`) | 7.2 (79 / 65 / 47 %) | 34.0 | 36.5 | 10 | 54–57 | 18.3 / 15.7 to stop (104) | a first round at 47–79 %: header in main / no footer element (no nav, no footer), stitched live chunks shifted 53–112 px by a header that leaves the flow, carousel drafts on one selector |

## Iterations


### L1 — `first` (one call to the first round)
Change: `scripts/first.mjs` chains probe → measure → triage → media + fonts → DA → author → spec-to-css → harness → round 1 (≈ 2 min of tools on
continental's replay). Result on marriott: the first round at 7.2 min (3 × `first`: a busy port 8990 held by the orchestrator's own test server,
then a missing nav / footer), but at 79 / 65 / 47 % — ten rounds to the stop at 34.0. Keep `first` (it removed the step-by-step turns:
≈ 2.5 min of tools to the first number); the bottleneck moved to the first round's quality and the capture.

### L2 — one-shot capture, chrome guess, free port, per-section block scope
Change: Chrome's captureBeyondViewport at scroll 0 instead of stitched chunks (marriott's pinned bar and seams gone; takeda's sticky header once);
measure-page guesses header / footer when the page has none outside main; first picks a free port; repeated blocks scoped per section; the gate
never reuses a stale build capture; shadow-root consent hosts hidden; author keeps card-wide links with their call to action. Result on
publicis: stop at 9.8 min, two rounds of 40 s (1440 / 2560 under 3 % after one round). Keep all. Next: the four `first` failures (3.5 min).

### L3 — inner scroller, section coverage, empty chrome, fast local captures
Change: an inner scroller unrolled at settle; the section guess also when the default covers < 70 %; an empty nav / footer document when the
source has none; the dual-stack port check; local builds captured with short waits (≈ 7 s a width, identical pixels). Result on toryburch: no
`first` failure of those kinds, but two popups measured as content (two re-runs, ≈ 9 min) and the hero video frozen at a different frame per
width (≈ 4 min); stop at 32.6. Keep all. Next: popups and videos at the capture (iteration 4: hidden modals, videos held at frame 0).
