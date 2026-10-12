# intel-home — report

Source https://www.intel.com/content/www/us/en/homepage.html · repo aemcoder-adobe/sdt-intel-lite · branch blocks-first · draft /drafts/intel-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| `first` (auto split) | 44.33 | 65.32 | 62.90 |
| r1 | 14.88 | 5.90 | 4.86 |
| r2 | 14.28 | 5.74 | 4.93 |
| r3 | 12.12 | 5.52 | 4.88 |
| r4 (stop) | **9.67** | **5.31** | **5.10** |
| served | **9.66** | **5.52** | **5.15** |

- t0 → stop 17.1 min (1027 s), tool seconds t0 → stop 272 s (first 79, first --sections 76, harness 6, gates 111).
- Setup ≈ 2 min. Served gate ≈ 21.7 min after t0 (one served-only fix: p > picture).
- Sections: hero carousel (4 × 900 scene), news title (default), news columns (3 cards), tiles (h2 + cards 4).
- leak: 1440 identical; 360 differs only in the first `.carousel img` (the hidden desktop rendition, 0×0 served vs the visible one in the harness — the p wrapper).
