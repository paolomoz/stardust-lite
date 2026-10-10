# Metrics per round

t0 = first instrument run on the page (repo setup excluded, reported apart). `<10 %` = first gate with pixel diff under 10 % at the three widths.

| round | site / page | setup min | t0 → first prototype | t0 → <10 % (3 widths) | t0 → probes pass | t0 → served gate | final 360 / 1440 / probe | rounds (table / gate) | prose Δ |
|---|---|---|---|---|---|---|---|---|---|
| 1 | scotiabank.com /ca/en/personal.html | 2 | 41 | 54 (5.96 / 2.28 / 1.77) | 67 | 77 | 2.63 / 2.28 / 1.77 (served 2.84 / 2.35 / 1.80) | 1 / 11 | +1.6 % |
| 2 | cibc.com /en/about-cibc/careers.html | 2.6 | 25 | 52 (5.95 / 2.39 / 1.51) | 54 | 59 | 5.95 / 2.39 / 1.51 (served 5.83 / 2.39 / 1.51) | 0 / 7 | +3.3 % |
| 3 | mfs.com /corporate/en/home.html | 1.9 | 21 | 30 (2.23 / 4.54 / 1.36, first gate) | 30 | 37 | 1.19 / 2.29 / 1.33 (served 1.20 / 2.29 / 1.34) | 4 / 3 | +4.6 % |
| 4 | im.natixis.com /en-intl/about/diversity-equity-and-inclusion | 2 | 32 | 43 (1440 7.57 / 2560 4.82 at 33; 360 10.92 → <10 at 43) | 46 | 52 | 1.39 / 0.15 / 0.09 (served 1.06 / 0.17 / 0.09) | 2 / 5 | +4.1 % |
| 5 | harbourvest.com /it/en/about-harbourvest (attestation cookie gate) | 2.4 | 48 | 66 at 1440 / 2560 only (16.7 / 3.5 / 5.1); 360 never (trailing-nbsp wrap, −42 px) | 83 | 83 | 15.73 / 3.56 / 3.57 (served 15.55 / 3.53 / 3.55) | 2 / 8 | +4.9 % |
| 6 | covermore.com /travel-assistance | 2.1 | 22 | 27 (3.65 / 1.95 / 1.07, round 2) | 27 | 32 | 3.65 / 1.95 / 1.07 (served identical) | 1 / 2 | +5.8 % |
| 7 | manulife.com /ca/en/business (web components, --chrome) | 2.2 | 31 | 43 (9.06 / 1.33 / 0.74) | 58 | 62 | 2.01 / 0.67 / 0.37 (served 2.02 / 0.67 / 0.38) | 2 / 7 | +6.4 % |
| 8 | take2games.com /ir/news/… (press release) | 1.8 | 17 | 29 (gate r3) | 33 | 45 | 1.11 / 1.76 / 1.14 (served 1.6 / 1.85 / 1.2) | 2 / 5 | +7.0 % |
| 9 | bny.com /corporate/global/en/about-us/leadership.html | 1.5 | 20 | 43 (r6: 9.93 / 0.62 / 0.35) | 52 | 56 | 2.62 / 0.19 / 0.10 (served 2.62 / 0.23 / 0.13) | 1 / 9 | +7.6 % |
| 10 | usa.canon.com /support/about-consumer-support (WAF, --chrome) | 2 | 28 | 51 (r7: 7.88 / 3.52 / 2.78) | 65 | 84 (10 min a dead sync-poll) | 4.04 / 1.95 / 1.16 (served 4.15 / 1.99 / 1.18) | 1 / 11 | +8.1 % |

## Validation rounds (branch `loop/high-impact` @ a7cebff: checklist, spec-to-css, gate --round, css-lint, tier line; three agents in parallel on one machine)

| round | site / page | setup min | t0 → first prototype | t0 → <10 % (3 widths) | t0 → probes pass | t0 → served gate | final 360 / 1440 / probe | rounds (table / gate) | drafts' share of the block CSS |
|---|---|---|---|---|---|---|---|---|---|
| V1 | wellsfargo.com /about/inclusion/ | 10.7 (3 min a pin not yet pushed) | 26 | 47 (base width under 10 % at the first round, 28) | 50 | 60 | 2.89 / 0.31 / 0.18 (served 2.86 / 0.30 / 0.17) | 2 / 6 + 2 | ≈ 35 % |
| V2 | citizensbank.com /about-us/sustainability-impact.aspx (--chrome) | 7.3 (3 min the pin) | 28 | 44 at 1440 / 2560; 360 never (six broken live images, a register row) | 61 | 56 | 14.82 / 2.42 / 1.36 (served 14.98 / 2.61 / 1.47) | 2 / 2 + 2 | ≈ 10 % overall, ≈ 30 % of the content blocks (no chrome drafts yet) |
| V3 | takeda.com /about/corporate-responsibility/corporate-giving/ | 4 | 36 | 66 (base width under 10 % at round 2; 36 of the 77 min were instruments running under three parallel agents) | 66 | 77 | 1.41 / 0.50 / 0.40 (served 1.48 / 0.45 / 0.39) | 1 / 5 + 1 | ≈ 35 % |

## Inspection round (branch `loop/high-impact` @ 35f9b73, one agent alone, every command timed)

| round | site / page | setup min | t0 → first prototype | t0 → <10 % (3 widths) | t0 → probes pass | t0 → served gate | final 360 / 1440 / probe | rounds (gate) | model / tools (t0 → close) |
|---|---|---|---|---|---|---|---|---|---|
| I1 | si.edu / (home) | 1.9 | 17.3 | never at 360; 1440 at 27.6, 1440 + 2560 at 32.1 | 50.9 (0 out of tolerance, 9 missing) | 56.8 | 27.76 / 3.44 / 4.51 (served identical) | 10 | 37.9 min, 119 turns / 26.6 min (gate 15.6) |
| I2 | acs.org /about.html (`exp/five-min` @ d58b9f8) | 1.2 | 15.8 | 35.1 (the `stop:` line, round 8) | 41.3 | 38.1 | 9.39 / 8.27 / 8.86 (served 9.35 / 8.25 / 8.84) | 8 | to served 16.4 min, 108 turns / 21.7 min (round 75–79 s) |
