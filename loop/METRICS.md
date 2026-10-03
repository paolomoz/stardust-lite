# Metrics per round

t0 = first instrument run on the page (repo setup excluded, reported apart). `<10 %` = first gate with pixel diff under 10 % at the three widths.

| round | site / page | setup min | t0 → first prototype | t0 → <10 % (3 widths) | t0 → probes pass | t0 → served gate | final 360 / 1440 / probe | rounds (table / gate) | prose Δ |
|---|---|---|---|---|---|---|---|---|---|
| 1 | scotiabank.com /ca/en/personal.html | 2 | 41 | 54 (5.96 / 2.28 / 1.77) | 67 | 77 | 2.63 / 2.28 / 1.77 (served 2.84 / 2.35 / 1.80) | 1 / 11 | +1.6 % |
| 2 | cibc.com /en/about-cibc/careers.html | 2.6 | 25 | 52 (5.95 / 2.39 / 1.51) | 54 | 59 | 5.95 / 2.39 / 1.51 (served 5.83 / 2.39 / 1.51) | 0 / 7 | +3.3 % |
| 3 | mfs.com /corporate/en/home.html | 1.9 | 21 | 30 (2.23 / 4.54 / 1.36, first gate) | 30 | 37 | 1.19 / 2.29 / 1.33 (served 1.20 / 2.29 / 1.34) | 4 / 3 | +4.6 % |
| 4 | im.natixis.com /en-intl/about/diversity-equity-and-inclusion | 2 | 32 | 43 (1440 7.57 / 2560 4.82 at 33; 360 10.92 → <10 at 43) | 46 | 52 | 1.39 / 0.15 / 0.09 (served 1.06 / 0.17 / 0.09) | 2 / 5 | +4.1 % |
| 5 | harbourvest.com /it/en/about-harbourvest (attestation cookie gate) | 2.4 | 48 | 66 at 1440 / 2560 only (16.7 / 3.5 / 5.1); 360 never (trailing-nbsp wrap, −42 px) | 83 | 83 | 15.73 / 3.56 / 3.57 (served 15.55 / 3.53 / 3.55) | 2 / 8 | +4.9 % |
