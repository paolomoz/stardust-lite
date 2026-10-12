# sherwinwilliams-home — report

- Source: https://www.sherwin-williams.com/ · site repo aemcoder-adobe/sdt-sherwinwilliams-lite, branch `blocks-first` · DA `drafts/sherwinwilliams-home`
- stardust-lite c6073fd · t0 01:17:05Z · stop 01:43:52Z (**26.8 min**) · served gate 01:46:17Z (29.2 min) · setup ≈ 4 min
- Tool seconds t0 → stop (TIMING.log): 575 s (first ×3: 233 s; 12 rounds: 342 s) of 1607 s wall.

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first (right split) | 46.08 | 39.84 | 38.32 |
| prototype (r12, stop) | 7.02 | 4.65 | 5.70 |
| served (`/drafts/sherwinwilliams-home`) | 7.03 | 4.67 | 5.71 |

- Sections: 8 (hero banner · Go To · Top Colors carousel · Every client · Performance Coatings carousel · News cards · Brands cards · Company columns) + header + footer.
- Leak: `leak-proto.txt` = `leak-served.txt` (no difference).
- Largest residual bands: 1440 4950 (18.5 %, brands' broken live logos / company band), 2560 5400 (24.8 %, footer columns at 2560), 360 0 (9.2 %, hero controls + header "details" line).
