# okta-home — register

## Triage (as authored after `first`; the draft model was replaced, see NOTES c)
| # | section | block | note |
|---|---|---|---|
| 0 | Oktane hero carousel | `carousel hero-carousel` | 3 slides (picture + mobile rendition), slide 1 text, last row = tab labels; slides 2–3 hidden (no rotation) |
| 1 | Blueprint banner | `hero` | bg picture, lockup, text |
| 2 | Transform identity | `columns platforms` | heading row + 4 cards (Auth0 card shown at 360 only), mobile card pictures |
| 3 | Powering access | default content | h2 + outlined link |
| 4 | Customer logos | `cards logos` | 6 logos, greyscale |
| 5 | Customer stories | `carousel stories` | slide 1 + Vidyard background video link, 2 peeking slides |
| 6 | Proven leader | `columns leader` + h2 | the "Go inside the minds…" h2 kept in this section (live split) |
| 7 | Resources | ol tabs + `cards` | |
| 8 | Closer | `columns closer` | gradient picture (desktop + mobile) |
| 9 | Disclaimer | default content | |

## Deviations
- R1 **Live overlay floor (not fixable in the build).** The cached origin captures carry Okta's "Ask Ollie" chat assistant (Qualified,
  `#q-messenger-frame` / `#qualified-multimodal-host`) in every stitched tile; ≈ 7 pts at 360 and ≈ 6–9 pts at 1440. It is a dynamic
  feature (stardust:dynamics), not re-implemented. A fresh capture with `--dismiss` was worse (the live carousel had rotated) — no clean origin.
- R2 Stories video: the slide plays the source's Vidyard background video (iframe from the authored link); the frame at capture time is
  random on both sides (1440 band 2700: 18–40 % across rounds). The poster picture remains at 360.
- R3 Hero carousel does not rotate; slides 2–3 are authored but hidden; tab labels are static (dots at 360 are CSS dots, no pause button).
- R4 Header: brand is a text word-mark "okta" (the source's SVG logo was not in the media set); main nav items are plain labels (the
  source's mega-menu buttons are not built); locale picker omitted; tippy links reused in the tools list. Header made sticky (top −40 px)
  as on the source.
- R5 Footer: brand word-mark instead of the logo; social icons are white squares; at 360 the brand is hidden and the columns reordered.
- R6 Platform cards: desktop copy is used at 360 too (the source swaps longer mobile copy); the link label shows on hover only at desktop
  (arrow only at rest, as captured). The Auth0 card is authored and shown at 360 only.
- R7 Media added after `first`: desktop platforms-owi bg (the 1440 bg; `first` authored oci), four mobile platform card pictures
  (downloaded from the source's CSS variables), mobile closer gradient, mobile hero/stories renditions — all uploaded to drafts/media.
- R8 `styles/sections-draft.css` is no longer imported: its `main .section:nth-of-type(n)` rules out-ranked `main > .section` and
  double-padded sections; every per-section rule is restated in styles.css.

## Motion
- Hero carousel rotation and tabs: not built (R3). Sticky header: built. Story slider: static. Video: background autoplay via Vidyard.
