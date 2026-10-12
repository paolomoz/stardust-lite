# accenture-home — report

Source https://www.accenture.com/us-en · repo aemcoder-adobe/sdt-accenture-lite (branch blocks-first) · served
https://blocks-first--sdt-accenture-lite--aemcoder-adobe.aem.page/drafts/accenture-home (preview only).

| | 360 | 1440 | 2560 |
|---|---|---|---|
| first round | 81.75 | 81.85 | 78.15 |
| prototype at `stop:` (r5) | 8.37 | 3.81 | 8.47 |
| served (after leak fix) | 8.28 | 3.78 | 8.42 |

- Clock t0 → stop 17.3 min (5 rounds); tool time 327 s; setup ≈ 1 min.
- Split from `first` kept as drafted (no triage edits). Document edits: h1 "Together We Reinvented" added (the animated headline
  was not authored), Vidyard poster image added to the client-spotlight video link (fetched from play.vidyard.com, uploaded to drafts/media).
- Leak (leak-sels.txt, 1440 + 360): one served difference found — the careers backdrop rule was keyed on the local media file
  name; fixed on the block, re-gated, diff empty.
