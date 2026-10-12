# REGISTER — wpp-home

## Triage (accepted draft, then the document edited — not the split)
| # | live section | block | change after `first` |
|---|---|---|---|
| 0 | header pill | header | — |
| 1 | hero "WPP is the trusted growth…" + video | default | the three line `p`s → one `h1` |
| 2 | Our work | cards | — |
| 3 | Careers | columns | the CTA "Explore careers at WPP" added (bold link) — `author` dropped it |
| 4 | Latest insights | carousel | heading + intro were one `p` → `h2` + `p` |
| 5 | Trusted to grow responsibly + video | default | five line `p`s → `h2` + one `p` |
| 6 | Latest news | carousel | `p` → `h2` |
| 7 | footer | footer | — |

## Deviations
- **Logo missing** (header pill and footer): the WPP SVG is not in the media set (`icons/icon.svg` absent). The footer keeps the measured logo box (133×40, 360: 304×91) empty; the pill shows the nav's "Home" text where the logo sits.
- Header pill: no menu icon, the "Menu" item is the nav's text; the pill keeps the draft's 18 px vertical padding (header.css loads after styles.css).
- Videos: authored as `.mp4` links, rendered by `decorateVideos` in `scripts/scripts.js` (muted, loop, autoplay, playsinline); the play / pause buttons are not built.
- Carousels are static tracks (no swiper, no drag / arrows); the progress control is a painted 120 px track (`.carousel-wrapper::after`), not an input.
- Insight tags: the document holds the tags as two paragraphs per slide; live has one chip per tag. Chip fill `#f0f0f0` / radius 2 px is read off the crop, not a spec row.
- Sustainability card shadow `0 4px 24px rgb(0 0 0 / 8%)` is approximate (the spec says "shadow" without a value).
- Careers bullet before "Careers" is a 4 px dot, approximated from the crop.
- 360 sustainability band: the live capture is an entrance state (video box 306×476 at x27 y67 scaled 0.85, card at opacity 0). The build places the video box at that measured geometry and keeps the card **visible** (content over pixel match) — the main part of the 19.5 % residual at 360.
- Careers at 360: 17.8 % residual (image crop / type rendering), registered, not chased.

## Motion (not implemented)
- Scroll-driven entrance of the sustainability band (scale 0.85 → 1, card translate 270 px → 0, fade).
- Hero / cards video play-pause controls; card hover zoom; swiper slide transitions.
