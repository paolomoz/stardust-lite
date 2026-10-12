# pgatour-home — register

## Triage
- 63 of 73 drafted rows dropped: rows 15–73 duplicates of rows 5–14 (the split repeated the main column ×7); row 3 the whole page grid (1332×4059); row 1 the 1×1 logo picture, row 2 a 150×24 nav fragment, row 4 the hidden search overlay "Quick Links". Kept rows 5–14 (10 sections).
- Doc edit: Player Highlights / Recent Stories tiles authored as poster pictures (media-fetch had them) instead of "Video" links.

## Deviations
- Section heights are pinned to the measured values at 360 / 1440 / ≥1920 (overflow hidden) — the carousels run past the column on the live page; a text change will clip rather than grow. Breakpoint for the 2560 variant (1920) is assumed; the source's media queries are 768 / 1024 only and the 2560 differences may be viewport-fluid.
- Ad slots (2) keep their box (290 at ≥768; 136 / 316 at 360) but render nothing: third-party creative, not migrated (≈ 50 % diff in those bands).
- Desktop leaderboard sidebar (240×588 at x1126) and the 360 leaderboard ticker band (59–155) not built — live tournament data; the 360 band is reserved as header height.
- Weather band: only the 68°F heading and the #f2f2f2 r8 band; FedEx/weather rows and the Rolex clock iframe not laid out.
- Icons (play, arrows, weather, location) 404 — not fetched; Watch play buttons and duration badges absent.
- Header: links and logo only (no Profile/Tour Pass control, search icon); mobile bar is empty white of the measured height.
- Footer: desktop five-column grid + legal lines; social icons, privacy row and app icons omitted; 360 accordion rows only.

## Motion
- Carousels (Watch Now, Player Highlights, Watch/More News at 360, Recent Stories) are static rows clipped at the column; no scroll/arrow behaviour.
